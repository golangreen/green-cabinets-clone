import SwiftUI
import UIKit

/// A scanned room: turn it in 3D or read it as a floor plan, pick the walls
/// that matter, choose the units, then add the pictures to the project or
/// share them. Every picture carries the Green Cabinets band and reference.
struct ScanResultView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let scan: SavedScan

    private enum Mode: String, CaseIterable, Identifiable {
        case model = "3D", plan = "Floor plan"
        var id: String { rawValue }
    }

    @State private var mode: Mode = .model
    @State private var selecting = false
    @State private var selected: Set<Int> = []
    @State private var controller = Room3DController()
    @State private var working = false
    /// In the project with the walls and units picked now
    @State private var added = false
    @State private var topView = false
    /// New cabinets on the picked walls
    @State private var showCabinets = true
    @State private var style: KitchenLayout.Style = .kitchen
    @State private var doorID: String?
    @State private var counterID: String?
    /// Bumped when a supplier photo arrives, so the cabinets put it on
    @State private var photos = 0
    @State private var showChecks = false
    @State private var layouts = LayoutCache()

    var body: some View {
        @Bindable var model = model
        ScrollViewReader { reader in
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                Picker("View", selection: $mode) {
                    ForEach(Mode.allCases) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)
                .sensoryFeedback(.selection, trigger: mode)

                viewer

                pickBar

                if !selected.isEmpty { newCabinets.id("cabinets") }

                // Typed sizes have no measured floor or ceiling to show
                if scan.typed == nil { facts }

                VStack(alignment: .leading, spacing: Space.s) {
                    Text("Sizes on the pictures").eyebrow()
                    Picker("Sizes on the pictures", selection: $model.unit) {
                        ForEach(LengthUnit.allCases) { Text($0.label).tag($0) }
                    }
                    .pickerStyle(.segmented)
                }

                actions
            }
            .padding(.horizontal, Space.gutter)
            .padding(.bottom, Space.section)
        }
        .scrollIndicators(.hidden)
        .debugScroll()
        .task {
            // Debug builds: `-jump cabinets` opens on the new cabinets card
            guard let id = DebugLaunch.value("-jump") else { return }
            try? await Task.sleep(for: .seconds(1))
            reader.scrollTo(id, anchor: .top)
        }
        }
        .background(Brand.ink)
        .navigationTitle(scan.sample ? "Sample room" : scan.typed != nil ? "Your kitchen" : "Your room")
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: selected) { added = false }
        .onChange(of: model.unit) { added = false }
        .onChange(of: layoutKey) { added = false }
        // Done picking, or cabinets switched on: face the new kitchen
        .onChange(of: selecting) { if !selecting { faceCabinets() } }
        .onChange(of: showCabinets) { if showCabinets { faceCabinets() } }
        .task(id: door.id + "|" + (counter?.id ?? "")) { await fetchPhotos() }
        .onAppear {
            if DebugLaunch.value("-view") == "plan" { mode = .plan }
            if DebugLaunch.value("-style") == "closets" { style = .closets }
            // Typed sizes open with their cabinet walls already chosen
            if let p = scan.picked, selected.isEmpty {
                selected = Set(p)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { faceCabinets() }
            }
            if let w = DebugLaunch.value("-pick") {
                selected = Set(w.split(separator: ",").compactMap { Int($0) })
                selecting = DebugLaunch.value("-picking") != nil
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { faceCabinets() }
            }
            #if DEBUG
            // -drawings: writes the pictures that would be sent to Documents, for checking
            if DebugLaunch.value("-drawings") != nil {
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                    for (i, (img, title)) in pictures().enumerated() {
                        try? img.pngData()?.write(to: dir.appendingPathComponent("\(i) \(title).png"))
                    }
                    try? (layoutLines.lead + layoutLines.tail).joined(separator: "\n").write(to: dir.appendingPathComponent("lines.txt"), atomically: true, encoding: .utf8)
                }
            }
            #endif
        }
    }

    // MARK: Viewer

    private var viewer: some View {
        ZStack {
            Room3DView(room: scan.room, controller: controller, selected: selected, selecting: selecting,
                       layout: shown, layoutKey: layoutKey, look: { look }) { toggle($0) }
                .opacity(mode == .model ? 1 : 0)
                .allowsHitTesting(mode == .model)
            if mode == .plan {
                PlanCanvasView(room: scan.room, unit: model.unit, selected: selected, selecting: selecting, layout: shown) { toggle($0) }
                    .transition(.opacity)
            }
        }
        .frame(height: 430)
        .clipShape(RoundedRectangle(cornerRadius: Radius.card, style: .continuous))
        .overlay(alignment: .topTrailing) {
            Button {
                withAnimation(Motion.ui(reduceMotion)) { selecting.toggle() }
            } label: {
                Label(selecting ? "Done" : "Pick walls", systemImage: selecting ? "checkmark" : "hand.tap")
                    .font(.subheadline.weight(.semibold))
                    .frame(minHeight: 36)
            }
            .floatingControlStyle()
            .padding(Space.m)
            .accessibilityHint("Tap walls in the view to pick them")
        }
        .overlay(alignment: .bottomLeading) {
            if mode == .model {
                Button {
                    topView.toggle()
                    controller.resetCamera(top: topView, animated: !reduceMotion)
                } label: {
                    Label(topView ? "Angled view" : "From above", systemImage: topView ? "cube" : "square.dashed")
                        .font(.subheadline.weight(.semibold))
                        .frame(minHeight: 36)
                }
                .floatingControlStyle()
                .padding(Space.m)
            }
        }
        .animation(Motion.ui(reduceMotion), value: mode)
    }

    /// The one next step, always in plain sight: choose walls, then see the kitchen.
    private var pickBar: some View {
        VStack(alignment: .leading, spacing: Space.m) {
            if selecting {
                HStack(alignment: .firstTextBaseline) {
                    Text(selected.isEmpty ? "Tap the walls where you want cabinets" : "Tap more walls, or tap one again to take it off")
                        .font(.headline).foregroundStyle(Brand.ivory)
                        .fixedSize(horizontal: false, vertical: true)
                    Spacer(minLength: Space.s)
                    if !selected.isEmpty {
                        Button("Clear") { withAnimation(Motion.ui(reduceMotion)) { selected = [] } }
                            .font(.subheadline.weight(.semibold))
                            .frame(minHeight: 44)
                    }
                }
                wallChips
                if !selected.isEmpty {
                    Button {
                        withAnimation(Motion.ui(reduceMotion)) { selecting = false }
                    } label: {
                        ActionLabel(title: style == .kitchen ? "See my new kitchen" : "See my new closets", systemImage: "cube.transparent")
                    }
                    .primaryActionStyle()
                    .transition(.opacity)
                }
            } else if selected.isEmpty {
                Button {
                    withAnimation(Motion.ui(reduceMotion)) { selecting = true }
                } label: {
                    ActionLabel(title: "Choose walls for new cabinets", systemImage: "hand.tap")
                }
                .primaryActionStyle()
                Text("Tap the walls in your room. We put cabinets on them and show you the price.")
                    .secondaryText().fixedSize(horizontal: false, vertical: true)
                Text(mode == .model ? "Drag to turn the room, pinch to zoom." : "Pinch to zoom in, then drag to move around.")
                    .font(.footnote).foregroundStyle(Brand.stone)
            } else {
                HStack {
                    Text(selected.count == 1 ? "New cabinets on 1 wall" : "New cabinets on \(selected.count) walls")
                        .font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory)
                        .contentTransition(.numericText())
                    Spacer()
                    Button("Change walls") { withAnimation(Motion.ui(reduceMotion)) { selecting = true } }
                        .font(.subheadline.weight(.semibold))
                        .frame(minHeight: 44)
                }
            }
        }
    }

    /// Every wall as a button too: easier than a small target in the drawing,
    /// and the way to pick with VoiceOver.
    private var wallChips: some View {
        let u = model.unit.forText
        return ScrollView(.horizontal) {
            HStack(spacing: Space.s) {
                ForEach(scan.room.walls.indices, id: \.self) { i in
                    let on = selected.contains(i)
                    Button { toggle(i) } label: {
                        HStack(spacing: Space.xs) {
                            if on { Image(systemName: "checkmark").font(.caption.weight(.bold)) }
                            Text("Wall \(i + 1)").fontWeight(.semibold)
                            Text(u.length(scan.room.walls[i].len)).monospacedDigit().opacity(0.8)
                        }
                        .font(.subheadline)
                        .foregroundStyle(on ? Brand.ink : Brand.ivory)
                        .padding(.horizontal, Space.m)
                        .frame(minHeight: 44)
                        .background(on ? Brand.brass : Brand.raised, in: Capsule())
                    }
                    .buttonStyle(PressableStyle())
                    .accessibilityAddTraits(on ? .isSelected : [])
                }
            }
        }
        .scrollIndicators(.hidden)
        .scrollClipDisabled()
    }

    private func faceCabinets() {
        guard showCabinets, !selected.isEmpty, mode == .model else { return }
        topView = false
        controller.focus(on: selected, animated: !reduceMotion)
    }

    private func toggle(_ i: Int) {
        withAnimation(Motion.ui(reduceMotion)) {
            if selected.contains(i) { selected.remove(i) } else { selected.insert(i) }
        }
        Haptics.light()
    }

    // MARK: Numbers

    private var facts: some View {
        let u = model.unit.forText
        let r = scan.room
        return VStack(spacing: Space.l) {
            HStack(spacing: Space.l) {
                FactView(value: u.area(r.floorArea), label: "Floor area")
                FactView(value: u.length(r.ceiling), label: "Ceiling")
            }
            HStack(spacing: Space.l) {
                FactView(value: u.length(r.wallRun), label: "Wall length")
                FactView(value: "\(r.doors.count) · \(r.windows.count)", label: "Doors · windows")
            }
        }
        .card()
    }

    // MARK: New cabinets

    private var layout: KitchenLayout {
        layouts.get(style, selected) { KitchenLayout(room: scan.room, walls: selected, style: style) }
    }
    /// What the room and the drawings show
    private var shown: KitchenLayout? { showCabinets && !selected.isEmpty ? layout : nil }

    /// Door finishes they added to their quote
    private var favoriteDoors: [Finish] {
        model.basket.picks.compactMap { line in
            if let p = Panel.all.first(where: { $0.requestLine == line }) { return p.isCountertop ? nil : p.arFinish }
            if let f = (HouseColors.paints + HouseColors.stains).first(where: { $0.requestLine == line }) { return f }
            return WoodSpecies.all.first { Finish.wood($0).requestLine == line }.map(Finish.wood)
        }
    }

    /// Their favorites first, then the decors and paints we use most (light oak to start)
    private var doorOptions: [Finish] {
        var out = favoriteDoors
        let oak = Panel.find("shinnoki-s4-ivory-oak")?.arFinish
        for f in (oak.map { [$0] } ?? []) + Finish.arDefault where !out.contains(where: { $0.id == f.id }) { out.append(f) }
        return out
    }

    private var counterOptions: [Panel] {
        var out = model.basket.picks.compactMap { line in Panel.all.first { $0.requestLine == line && $0.isCountertop } }
        let ours = ["raphael-calacatta-statuario", "raphael-venatino-white", "raphael-crema-taj", "raphael-travertine", "raphael-calacatta-nero", "raphael-marin-black"]
        for id in ours { if let p = Panel.find(id), !out.contains(p) { out.append(p) } }
        return out
    }

    private var door: Finish {
        let options = doorOptions
        return options.first { $0.id == doorID } ?? options[0]
    }

    private var counter: Finish? {
        guard style == .kitchen else { return nil }
        let options = counterOptions
        return (options.first { $0.id == counterID } ?? options.first)?.arFinish
    }

    /// Changes when the cabinets or what they wear change (and when a photo arrives)
    private var layoutKey: String {
        let walls = selected.sorted().map(String.init).joined(separator: ",")
        let c = counter
        return [style.rawValue, walls, door.id, ARTexture.isReady(door) ? "1" : "0",
                c?.id ?? "", c.map { ARTexture.isReady($0) ? "1" : "0" } ?? "", "\(photos)"].joined(separator: "|")
    }

    private var look: LayoutNodes.Look {
        LayoutNodes.Look(doors: ARTexture.image(for: door), doorColor: UIColor(hex: door.hex),
                         counter: counter.flatMap { ARTexture.image(for: $0) }, counterColor: UIColor(hex: counter?.hex ?? "#E7E3DC"))
    }

    private func fetchPhotos() async {
        var got = false
        for f in [door, counter].compactMap({ $0 }) {
            guard let url = f.remote, !ARTexture.isReady(f) else { continue }
            if await SwatchImages.shared.image(url, px: ARTexture.px) != nil { got = true }
        }
        if got { photos += 1 }
    }

    private var newCabinets: some View {
        let l = layout
        return VStack(alignment: .leading, spacing: Space.l) {
            VStack(alignment: .leading, spacing: Space.s) {
                Text(style == .kitchen ? "Your new kitchen" : "Your new closets").cardTitle()
                Picker("What goes on these walls", selection: $style) {
                    ForEach(KitchenLayout.Style.allCases) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)
                .sensoryFeedback(.selection, trigger: style)
            }

            if l.isEmpty {
                Text("These walls are too short for cabinets, or doors and windows fill them. Try another wall.")
                    .secondaryText().fixedSize(horizontal: false, vertical: true)
            } else {
                price(l)
                chips(title: "Try a door color", items: doorOptions.map { ChipItem(id: $0.id, name: $0.name, swatch: AnyView($0.swatch(px: 160))) },
                      selected: door.id) { doorID = $0 }
                if style == .kitchen, let c = counter {
                    chips(title: "Try a countertop", items: counterOptions.map { ChipItem(id: $0.id, name: $0.name, swatch: AnyView($0.swatch(px: 160))) },
                          selected: c.id) { counterID = $0 }
                }
                if style == .kitchen && !l.checks.isEmpty { nkba(l.checks) }
                Toggle(isOn: $showCabinets.animation(Motion.ui(reduceMotion))) {
                    Text("Show them in the room").font(.subheadline).foregroundStyle(Brand.ivory)
                }
                .tint(Brand.brass)
                .frame(minHeight: 44)
            }
        }
        .card()
    }

    /// A row of round swatches to try on the cabinets
    private struct ChipItem: Identifiable {
        let id: String
        let name: String
        let swatch: AnyView
    }

    private func chips(title: String, items: [ChipItem], selected: String, pick: @escaping (String) -> Void) -> some View {
        VStack(alignment: .leading, spacing: Space.s) {
            Text(title).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory)
            ScrollView(.horizontal) {
                HStack(alignment: .top, spacing: Space.m) {
                    ForEach(items) { item in
                        let on = item.id == selected
                        Button {
                            pick(item.id)
                            Haptics.light()
                        } label: {
                            VStack(spacing: Space.xs) {
                                item.swatch
                                    .frame(width: 52, height: 52)
                                    .clipShape(Circle())
                                    .overlay(Circle().strokeBorder(on ? Brand.brass : Brand.line, lineWidth: on ? 3 : 1))
                                    .padding(2)
                                Text(item.name)
                                    .font(.caption2)
                                    .foregroundStyle(on ? Brand.ivory : Brand.stone)
                                    .lineLimit(2)
                                    .multilineTextAlignment(.center)
                                    .frame(width: 68)
                            }
                        }
                        .buttonStyle(PressableStyle())
                        .accessibilityLabel(item.name)
                        .accessibilityAddTraits(on ? .isSelected : [])
                    }
                }
            }
            .scrollIndicators(.hidden)
            .scrollClipDisabled()
        }
    }

    private func price(_ l: KitchenLayout) -> some View {
        let total = l.cabinetPrice.map { $0 + (style == .kitchen ? l.counterPrice ?? 0 : 0) }
        return VStack(alignment: .leading, spacing: Space.xs) {
            if let total {
                Text("About $\(total.formatted())")
                    .font(.display(40, relativeTo: .largeTitle)).foregroundStyle(Brand.brass)
                    .contentTransition(.numericText(value: Double(total)))
                    .animation(Motion.snappy, value: total)
            }
            Text(l.countLine + (l.cabinetPrice.map { ": about $\($0.formatted())" } ?? ""))
                .font(.subheadline).foregroundStyle(Brand.ivory)
                .fixedSize(horizontal: false, vertical: true)
            if style == .kitchen, let c = l.counterPrice, let stone = counter {
                Text("\(stone.name) stone countertop, \(Int(l.counterSqFt.rounded())) sq ft: about $\(c.formatted())")
                    .font(.subheadline).foregroundStyle(Brand.ivory)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Text(style == .kitchen
                 ? "From our published prices: $225 a foot for base cabinets, $125 a foot for wall cabinets, $65 a square foot for stone. The final price comes after we measure."
                 : "From our published price: $350 a foot for full-height cabinets. The final price comes after we measure and plan the inside.")
                .font(.footnote).foregroundStyle(Brand.stone)
                .fixedSize(horizontal: false, vertical: true)
        }
        .accessibilityElement(children: .combine)
    }

    /// The layout held to the NKBA kitchen planning guidelines, folded to one line until asked
    private func nkba(_ checks: [KitchenLayout.Check]) -> some View {
        let met = checks.filter(\.ok).count
        return VStack(alignment: .leading, spacing: Space.s) {
            Button {
                withAnimation(Motion.ui(reduceMotion)) { showChecks.toggle() }
            } label: {
                HStack(alignment: .firstTextBaseline, spacing: Space.s) {
                    Image(systemName: met == checks.count ? "checkmark.seal.fill" : "checkmark.seal")
                        .foregroundStyle(Brand.brass)
                        .accessibilityHidden(true)
                    Text("Meets \(met) of \(checks.count) NKBA kitchen design guidelines")
                        .font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                    Spacer(minLength: Space.s)
                    Image(systemName: "chevron.down")
                        .font(.footnote.weight(.semibold)).foregroundStyle(Brand.stone)
                        .rotationEffect(.degrees(showChecks ? 180 : 0))
                        .accessibilityHidden(true)
                }
                .frame(minHeight: 44)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityValue(showChecks ? "Showing the list" : "")
            .accessibilityHint("Shows each guideline")
            if showChecks {
                ForEach(checks, id: \.self) { c in
                    HStack(alignment: .firstTextBaseline, spacing: Space.s) {
                        Image(systemName: c.ok ? "checkmark.circle.fill" : "exclamationmark.circle")
                            .foregroundStyle(c.ok ? Brand.brass : Brand.error)
                            .accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: 1) {
                            Text(c.title).font(.footnote.weight(.semibold)).foregroundStyle(Brand.ivory)
                            Text(c.detail).font(.footnote).foregroundStyle(Brand.stone)
                        }
                        .fixedSize(horizontal: false, vertical: true)
                    }
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel("\(c.ok ? "Met" : "Not met"): \(c.title). \(c.detail)")
                }
                Text("The NKBA (National Kitchen and Bath Association) guidelines are the rules designers use for a kitchen that works. We finish the plan with you.")
                    .font(.footnote).foregroundStyle(Brand.stone)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    /// For the office and the design board: the cabinets and their price first,
    /// then (after the room's sizes) every box wall by wall and the NKBA checks.
    private var layoutLines: (lead: [String], tail: [String]) {
        guard let l = shown, !l.isEmpty else { return ([], []) }
        var lead: [String] = []
        lead.append("New cabinets: \(l.countLine)" + (l.cabinetPrice.map { ", about $\($0.formatted())" } ?? "") + ", shown in \(door.detail) \(door.name)")
        if let c = l.counterPrice, let stone = counter { lead.append("Countertop: \(stone.name), \(Int(l.counterSqFt.rounded())) sq ft, about $\(c.formatted())") }
        let rows = l.lines(walls: Array(selected))
        // The boxes wall by wall share one line, the totals and checks another
        let walls = rows.filter { $0.hasPrefix("Wall ") }.joined(separator: " · ")
        let rest = rows.filter { !$0.hasPrefix("Wall ") }.joined(separator: ". ")
        return (lead, [String(walls.prefix(590)), String(rest.prefix(590))].filter { !$0.isEmpty })
    }

    // MARK: Actions

    private var actions: some View {
        VStack(spacing: Space.m) {
            if scan.sample {
                Text("This is a sample. On an iPhone Pro or iPad Pro, scan your own room from the Plan tab.")
                    .secondaryText().fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else if added {
                Button { model.tab = .quote } label: {
                    ActionLabel(title: "Review and send", systemImage: "paperplane")
                }
                .primaryActionStyle()
            } else {
                Button {
                    let lines = layoutLines
                    prepare { model.attach(scan: scan, pictures: $0, lead: lines.lead, tail: lines.tail); added = true }
                } label: {
                    ActionLabel(title: working ? "Preparing…" : "Add to my project", systemImage: "plus")
                }
                .primaryActionStyle()
                .disabled(working)
            }
            Button {
                prepare { Tools.share($0.map(\.0)) }
            } label: {
                ActionLabel(title: "Save, print or share", systemImage: "square.and.arrow.up")
            }
            .secondaryActionStyle()
            .disabled(working)
            Text("Pictures carry the Green Cabinets name and reference \(scan.id).")
                .font(.footnote).foregroundStyle(Brand.stone)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    /// Draws the pictures after "Preparing…" has had a frame to show.
    private func prepare(_ then: @escaping ([(UIImage, String)]) -> Void) {
        guard !working else { return }
        working = true
        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(60))
            then(pictures())
            working = false
        }
    }

    /// The set: the room in 3D, the floor plan, and each picked wall flat and in 3D.
    @MainActor
    private func pictures() -> [(UIImage, String)] {
        let ref = scan.id
        let unit = model.unit
        var out: [(UIImage, String)] = []
        if let img = controller.snapshot() {
            out.append((DrawingRenderer.branded(img, title: "Room in 3D", reference: ref), "Room in 3D"))
        }
        let layout = shown
        if let plan = DrawingRenderer.plan(scan.room, unit: unit, selected: selected, layout: layout) {
            out.append((DrawingRenderer.branded(plan, title: "Floor plan", reference: ref), "Floor plan"))
        }
        for i in selected.sorted() {
            if let d = DrawingRenderer.wall(scan.room, index: i, unit: unit, layout: layout) {
                out.append((DrawingRenderer.branded(d, title: "Wall \(i + 1) drawing", reference: ref), "Wall \(i + 1) drawing"))
            }
            if let v = controller.snapshotWall(i) {
                out.append((DrawingRenderer.branded(v, title: "Wall \(i + 1) in 3D", reference: ref), "Wall \(i + 1) in 3D"))
            }
        }
        return out
    }
}

/// The floor plan, pinch to zoom and drag when zoomed; in select mode a tap picks a wall.
struct PlanCanvasView: View {
    let room: ScannedRoom
    let unit: LengthUnit
    let selected: Set<Int>
    let selecting: Bool
    var layout: KitchenLayout? = nil
    let onTapWall: (Int) -> Void

    @State private var zoom: CGFloat = 1
    @State private var pinchStart: CGFloat?
    @State private var offset: CGSize = .zero
    @State private var dragStart: CGSize?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        GeometryReader { geo in
            let size = geo.size
            let drawing = FloorPlanDrawing(room: room, unit: unit, selected: selected, tags: selecting, layout: layout)
            Canvas { ctx, s in drawing.draw(ctx, size: s) }
                .scaleEffect(zoom)
                .offset(offset)
                .frame(width: size.width, height: size.height)
                .contentShape(Rectangle())
                .gesture(magnify(size))
                .simultaneousGesture(zoom > 1.01 ? drag(size) : nil)
                // Double-tap resets the zoom, but not while picking: a pick shouldn't wait to rule out a second tap
                .gesture(TapGesture(count: 2).onEnded { withAnimation(Motion.ui(reduceMotion)) { zoom = 1; offset = .zero } },
                         including: selecting ? .subviews : .all)
                .gesture(
                    SpatialTapGesture().onEnded { e in
                        guard selecting else { return }
                        // Undo the zoom and pan to find the point on the drawing
                        let c = CGPoint(x: size.width / 2, y: size.height / 2)
                        let p = CGPoint(x: (e.location.x - c.x - offset.width) / zoom + c.x,
                                        y: (e.location.y - c.y - offset.height) / zoom + c.y)
                        if let i = drawing.wall(at: p, size: size) { onTapWall(i) }
                    }
                )
                .accessibilityElement()
                .accessibilityLabel("Floor plan, \(room.walls.count) walls")
                .accessibilityValue(unit == .none ? "" : unit.area(room.floorArea))
        }
        .background(Brand.paper)
    }

    private func magnify(_ size: CGSize) -> some Gesture {
        MagnifyGesture()
            .onChanged { v in
                if pinchStart == nil { pinchStart = zoom }
                zoom = min(5, max(0.9, (pinchStart ?? 1) * v.magnification))
            }
            .onEnded { _ in
                pinchStart = nil
                if zoom < 1 { withAnimation(Motion.momentum) { zoom = 1; offset = .zero } }
                clamp(size)
            }
    }

    private func drag(_ size: CGSize) -> some Gesture {
        DragGesture(minimumDistance: 6)
            .onChanged { v in
                if dragStart == nil { dragStart = offset }
                let s = dragStart ?? .zero
                offset = CGSize(width: s.width + v.translation.width, height: s.height + v.translation.height)
            }
            .onEnded { _ in
                dragStart = nil
                clamp(size)
            }
    }

    /// Never pan the drawing off screen; settle back with a spring.
    private func clamp(_ size: CGSize) {
        let mx = size.width * (zoom - 1) / 2, my = size.height * (zoom - 1) / 2
        let c = CGSize(width: min(mx, max(-mx, offset.width)), height: min(my, max(-my, offset.height)))
        if c != offset { withAnimation(reduceMotion ? .easeOut(duration: 0.18) : Motion.momentum) { offset = c } }
    }
}

/// Each layout is worked out once per set of walls, not on every redraw.
final class LayoutCache {
    private var store: [String: KitchenLayout] = [:]

    func get(_ style: KitchenLayout.Style, _ walls: Set<Int>, make: () -> KitchenLayout) -> KitchenLayout {
        let key = style.rawValue + walls.sorted().map(String.init).joined(separator: ",")
        if let l = store[key] { return l }
        let l = make()
        store[key] = l
        return l
    }
}
