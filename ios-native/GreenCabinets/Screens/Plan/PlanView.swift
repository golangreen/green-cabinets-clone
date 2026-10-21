import SwiftUI

/// The tools that start a project from the person's own room. What they make
/// collects in "Your project", sent from the Quote tab.
struct PlanView: View {
    @Environment(AppModel.self) private var model
    @State private var several = false

    var body: some View {
        @Bindable var model = model
        NavigationStack(path: $model.planPath) {
            ScrollView {
                VStack(alignment: .leading, spacing: Space.xl) {
                    Text("Use the camera to show us the room. We plan your cabinets from what you send.")
                        .secondaryText()
                        .fixedSize(horizontal: false, vertical: true)

                    ToolCard(image: Content.hero, symbol: "cube.transparent",
                             title: "Cabinets in your room",
                             text: "Place real-size base, drawer, wall and pantry cabinets with the camera. Drag them into place, line up a run, and try every finish.",
                             note: Tools.arSupported ? nil : "This device can't run the AR camera.") {
                        Button { model.openCabinets() } label: { ActionLabel(title: "Open the camera", systemImage: "camera") }
                            .primaryActionStyle()
                            .disabled(!Tools.arSupported)
                    }

                    ToolCard(image: "story-door-samples-measure", symbol: "ruler",
                             title: "Measure with the camera",
                             text: "Point at one end of a wall, a gap or a window, tap +, move to the other end and tap + again. Measure as many as you like.",
                             note: Tools.arSupported ? "Close, usually within an inch. We confirm every size on site." : "This device can't run the AR camera.") {
                        HStack(spacing: Space.m) {
                            Button { model.openMeasure() } label: { ActionLabel(title: "Start measuring", systemImage: "ruler") }
                                .primaryActionStyle()
                                .disabled(!Tools.arSupported)
                            Menu {
                                Picker("Units", selection: $model.unit) {
                                    ForEach(LengthUnit.allCases.filter { $0 != .none }) { Text($0.label).tag($0) }
                                }
                            } label: {
                                Text(model.unit == .none ? LengthUnit.ftin.label : model.unit.label)
                                    .font(.subheadline.weight(.semibold))
                                    .frame(minWidth: 72, minHeight: 44)
                            }
                            .secondaryActionStyle()
                            .fixedSize()
                            .accessibilityLabel("Units")
                        }
                    }

                    roomScanCard

                    ToolCard(image: "story-galley-kitchen-drawing", symbol: "doc.viewfinder",
                             title: "Scan your drawings",
                             text: "Architect's plans, a building floor plan or a sketch on paper. The scanner finds the page, straightens it and cleans it up.",
                             note: nil) {
                        Button { model.openDrawings() } label: { ActionLabel(title: "Scan a drawing", systemImage: "doc.viewfinder") }
                            .primaryActionStyle()
                            .disabled(!Tools.docScanSupported)
                    }

                    if !model.scans.isEmpty { savedScans }

                    projectSummary
                }
                .padding(.horizontal, Space.gutter)
                .padding(.bottom, Space.section)
            }
            .scrollIndicators(.hidden)
            .debugScroll()
            .background(Brand.ink)
            .navigationTitle("Plan")
            .navigationDestination(for: String.self) { id in
                if id == "board" {
                    DesignBoardView()
                } else if id == "sizes" {
                    KitchenSizesView()
                } else if let scan = model.scan(id) {
                    ScanResultView(scan: scan)
                } else {
                    ContentUnavailableView("Scan not found", systemImage: "viewfinder", description: Text("It may have been replaced by a newer scan."))
                }
            }
        }
    }

    private var roomScanCard: some View {
        ToolCard(image: "photo-natural-wood-galley-kitchen", symbol: "square.split.bottomrightquarter",
                 title: "Design your new kitchen",
                 text: RoomCapture.isSupported
                    ? "Scan the room in about two minutes, or just type your kitchen's sizes. We put new cabinets on your walls in 3D, check the plan against the NKBA kitchen guidelines and show you the price."
                    : "Pick your kitchen's shape and type how long the walls are. We put new cabinets on them in 3D, check the plan against the NKBA kitchen guidelines and show you the price.",
                 note: nil) {
            VStack(spacing: Space.m) {
                if RoomCapture.isSupported {
                    if RoomCapture.supportsSeveral {
                        Toggle("Several rooms in one walk", isOn: $several)
                            .font(.subheadline)
                            .tint(Brand.brass)
                    }
                    Button { model.openRoomScan(several: several) } label: { ActionLabel(title: "Scan the room", systemImage: "viewfinder") }
                        .primaryActionStyle()
                    NavigationLink(value: "sizes") { ActionLabel(title: "Type the sizes instead", systemImage: "ruler") }
                        .secondaryActionStyle()
                } else {
                    NavigationLink(value: "sizes") { ActionLabel(title: "Type my kitchen's sizes", systemImage: "ruler") }
                        .primaryActionStyle()
                }
                Button { model.showSampleScan() } label: { ActionLabel(title: "Try it on a sample room", systemImage: "cube") }
                    .secondaryActionStyle()
            }
        }
    }

    private var savedScans: some View {
        VStack(alignment: .leading, spacing: Space.m) {
            Text("Your rooms").eyebrow()
            VStack(spacing: 0) {
                ForEach(model.scans) { s in
                    NavigationLink(value: s.id) {
                        HStack(spacing: Space.m) {
                            Image(systemName: "cube.transparent").foregroundStyle(Brand.brass).frame(width: 28)
                                .accessibilityHidden(true)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(s.typed != nil ? "Kitchen from typed sizes" : "\(model.unit.forText.area(s.room.floorArea)) · \(s.room.walls.count) walls")
                                    .font(.headline).foregroundStyle(Brand.ivory)
                                Text("\(s.id) · \(s.date.formatted(date: .abbreviated, time: .shortened))")
                                    .font(.footnote).foregroundStyle(Brand.stone)
                            }
                            Spacer()
                            Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Brand.stone)
                                .accessibilityHidden(true)
                        }
                        .padding(.vertical, Space.m)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(PressableStyle(scale: 0.99))
                    if s.id != model.scans.last?.id { Divider().overlay(Brand.line) }
                }
            }
            .card(padding: Space.l)
        }
    }

    private var projectSummary: some View {
        let b = model.basket
        return VStack(alignment: .leading, spacing: Space.m) {
            Text("Your project").eyebrow()
            if b.isEmpty {
                Text("Nothing yet. Pictures, lengths and scans you make here are kept for your quote request.")
                    .secondaryText()
                    .fixedSize(horizontal: false, vertical: true)
            } else {
                Text(summaryText(b)).bodyText()
                ActionRow {
                    NavigationLink(value: "board") { ActionLabel(title: "Design board", systemImage: "rectangle.on.rectangle") }
                        .secondaryActionStyle()
                    Button { model.tab = .quote } label: { ActionLabel(title: "Send", systemImage: "paperplane") }
                        .primaryActionStyle()
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .card()
    }

    private func summaryText(_ b: ProjectBasket) -> String {
        var parts: [String] = []
        let pics = b.items.count
        if pics > 0 { parts.append(pics == 1 ? "1 picture" : "\(pics) pictures") }
        if !b.lengths.isEmpty { parts.append(b.lengths.count == 1 ? "1 length" : "\(b.lengths.count) lengths") }
        if !b.picks.isEmpty { parts.append(b.picks.count == 1 ? "1 favorite" : "\(b.picks.count) favorites") }
        if b.room != nil { parts.append("a room scan") }
        return ListFormatter.localizedString(byJoining: parts) + " ready to send."
    }
}

/// One tool: a photo band, what it does, and its actions.
struct ToolCard<Actions: View>: View {
    let image: String
    let symbol: String
    let title: String
    let text: String
    let note: String?
    @ViewBuilder let actions: Actions

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .bottomLeading) {
                Color.clear
                    .frame(height: 150)
                    .frame(maxWidth: .infinity)
                    .overlay { Image(image).resizable().scaledToFill() }
                    .clipped()
                    .overlay(LinearGradient(colors: [.clear, Brand.surface], startPoint: .center, endPoint: .bottom))
                    .accessibilityHidden(true)
                Image(systemName: symbol)
                    .font(.title2)
                    .foregroundStyle(Brand.ink)
                    .frame(width: 52, height: 52)
                    .background(Brand.brass, in: Circle())
                    .padding(Space.l)
                    .accessibilityHidden(true)
            }
            VStack(alignment: .leading, spacing: Space.m) {
                Text(title).cardTitle()
                    .accessibilityAddTraits(.isHeader)
                Text(text).bodyText().fixedSize(horizontal: false, vertical: true)
                if let note {
                    Text(note).font(.footnote).foregroundStyle(Brand.stone).fixedSize(horizontal: false, vertical: true)
                }
                actions.padding(.top, Space.xs)
            }
            .padding(Space.l)
        }
        .background(Brand.surface)
        .clipShape(RoundedRectangle(cornerRadius: Radius.card, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Radius.card, style: .continuous).strokeBorder(Brand.line))
    }
}
