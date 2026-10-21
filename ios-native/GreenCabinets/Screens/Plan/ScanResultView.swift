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
    @State private var share: SharePayload?
    @State private var working = false
    @State private var topView = false

    var body: some View {
        @Bindable var model = model
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                Picker("View", selection: $mode) {
                    ForEach(Mode.allCases) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)
                .sensoryFeedback(.selection, trigger: mode)

                viewer

                pickBar

                VStack(alignment: .leading, spacing: Space.s) {
                    Text("Sizes on the pictures").eyebrow()
                    Picker("Sizes on the pictures", selection: $model.unit) {
                        ForEach(LengthUnit.allCases) { Text($0.label).tag($0) }
                    }
                    .pickerStyle(.segmented)
                }

                facts

                if !selected.isEmpty { pickedWalls }

                actions
            }
            .padding(.horizontal, Space.gutter)
            .padding(.bottom, Space.section)
        }
        .scrollIndicators(.hidden)
        .background(Brand.ink)
        .navigationTitle(scan.sample ? "Sample room" : "Your room")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $share) { ShareSheet(items: $0.images) }
        .onAppear {
            if DebugLaunch.value("-view") == "plan" { mode = .plan }
            if let w = DebugLaunch.value("-pick") { selecting = true; selected = Set(w.split(separator: ",").compactMap { Int($0) }) }
        }
    }

    // MARK: Viewer

    private var viewer: some View {
        ZStack {
            Room3DView(room: scan.room, controller: controller, selected: selected, selecting: selecting) { toggle($0) }
                .opacity(mode == .model ? 1 : 0)
                .allowsHitTesting(mode == .model)
            if mode == .plan {
                PlanCanvasView(room: scan.room, unit: model.unit, selected: selected, selecting: selecting) { toggle($0) }
                    .transition(.opacity)
            }
        }
        .frame(height: 430)
        .clipShape(RoundedRectangle(cornerRadius: Radius.card, style: .continuous))
        .overlay(alignment: .topTrailing) {
            Button {
                withAnimation(Motion.ui(reduceMotion)) { selecting.toggle() }
            } label: {
                Label(selecting ? "Done" : "Select walls", systemImage: selecting ? "checkmark" : "hand.tap")
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

    private var pickBar: some View {
        Group {
            if selecting || !selected.isEmpty {
                HStack {
                    Text(selected.isEmpty ? "Tap the walls you want" : (selected.count == 1 ? "1 wall picked" : "\(selected.count) walls picked"))
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Brand.ivory)
                        .contentTransition(.numericText())
                    Spacer()
                    if !selected.isEmpty {
                        Button("Clear") { withAnimation(Motion.ui(reduceMotion)) { selected = [] } }
                            .font(.subheadline.weight(.semibold))
                            .frame(minHeight: 44)
                    }
                }
                .accessibilityElement(children: .contain)
            } else {
                Text(mode == .model ? "Drag to turn the room, pinch to zoom." : "Pinch to zoom in, then drag to move around.")
                    .font(.footnote).foregroundStyle(Brand.stone)
            }
        }
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

    private var pickedWalls: some View {
        let u = model.unit.forText
        return VStack(alignment: .leading, spacing: Space.s) {
            Text("Picked walls").eyebrow()
            ForEach(selected.sorted(), id: \.self) { i in
                let w = scan.room.walls[i]
                HStack {
                    Text("Wall \(i + 1)").font(.headline).foregroundStyle(Brand.ivory)
                    Spacer()
                    Text("\(u.length(w.len)) wide · \(u.length(w.h)) high").font(.subheadline).foregroundStyle(Brand.stone).monospacedDigit()
                }
                .frame(minHeight: 32)
                .accessibilityElement(children: .combine)
            }
            Text("Each picked wall goes as a flat drawing with sizes and as a 3D view.")
                .font(.footnote).foregroundStyle(Brand.stone)
        }
        .card()
    }

    // MARK: Actions

    private var actions: some View {
        VStack(spacing: Space.m) {
            if scan.sample {
                Text("This is a sample. On an iPhone Pro or iPad Pro, scan your own room from the Plan tab.")
                    .secondaryText().fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                Button {
                    working = true
                    let pics = pictures()
                    model.attach(scan: scan, pictures: pics)
                    working = false
                } label: {
                    ActionLabel(title: working ? "Preparing…" : "Add to my project", systemImage: "plus")
                }
                .primaryActionStyle()
                .disabled(working)
            }
            Button {
                share = SharePayload(images: pictures().map(\.0))
            } label: {
                ActionLabel(title: "Share pictures", systemImage: "square.and.arrow.up")
            }
            .secondaryActionStyle()
            Text("Pictures carry the Green Cabinets name and reference \(scan.id).")
                .font(.footnote).foregroundStyle(Brand.stone)
                .frame(maxWidth: .infinity, alignment: .leading)
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
        if let plan = DrawingRenderer.plan(scan.room, unit: unit, selected: selected) {
            out.append((DrawingRenderer.branded(plan, title: "Floor plan", reference: ref), "Floor plan"))
        }
        for i in selected.sorted() {
            if let d = DrawingRenderer.wall(scan.room, index: i, unit: unit) {
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
    let onTapWall: (Int) -> Void

    @State private var zoom: CGFloat = 1
    @State private var pinchStart: CGFloat?
    @State private var offset: CGSize = .zero
    @State private var dragStart: CGSize?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        GeometryReader { geo in
            let size = geo.size
            let drawing = FloorPlanDrawing(room: room, unit: unit, selected: selected, tags: selecting)
            Canvas { ctx, s in drawing.draw(ctx, size: s) }
                .scaleEffect(zoom)
                .offset(offset)
                .frame(width: size.width, height: size.height)
                .contentShape(Rectangle())
                .gesture(magnify(size))
                .simultaneousGesture(zoom > 1.01 ? drag(size) : nil)
                .onTapGesture(count: 2) { withAnimation(Motion.ui(reduceMotion)) { zoom = 1; offset = .zero } }
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

struct SharePayload: Identifiable {
    let id = UUID()
    let images: [UIImage]
}

/// The system share sheet (Save Image, Messages, Mail, AirDrop...).
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    func updateUIViewController(_ vc: UIActivityViewController, context: Context) {}
}
