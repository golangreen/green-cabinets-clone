import SwiftUI

/// The materials we build with, simple first: our three main suppliers, each
/// opening on a handful of favorites with the whole catalog one tap deeper,
/// and everything else (other suppliers, solid wood, paint) under More.
struct MaterialsView: View {
    enum Shelf: Hashable {
        case supplier(Supplier)
        case more
    }

    @Environment(AppModel.self) private var model
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var shelf: Shelf = .supplier(.tafisa)
    @State private var path = NavigationPath()
    @Namespace private var zoom

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: Space.xl) {
                    Text("The real panels and colors we build with. Pick a few you like and we bring the samples to your home.")
                        .secondaryText()
                        .fixedSize(horizontal: false, vertical: true)

                    Button { model.showColorMatch = true } label: {
                        ActionLabel(title: "Match a color from a photo", systemImage: "eyedropper.halffull")
                    }
                    .secondaryActionStyle()

                    Picker("Show", selection: $shelf) {
                        ForEach(Supplier.main) { Text($0.rawValue).tag(Shelf.supplier($0)) }
                        Text("More").tag(Shelf.more)
                    }
                    .pickerStyle(.segmented)
                    .sensoryFeedback(.selection, trigger: shelf)

                    Group {
                        switch shelf {
                        case .supplier(let s): SupplierShelf(supplier: s, zoom: zoom)
                        case .more: MoreShelf()
                        }
                    }
                    // A new shelf crossfades instead of sliding everything at once
                    .id(shelf)
                    .transition(.opacity)
                }
                .padding(.horizontal, Space.gutter)
                .padding(.bottom, Space.section)
                .animation(reduceMotion ? nil : .easeOut(duration: 0.2), value: shelf)
            }
            .scrollIndicators(.hidden)
            .debugScroll()
            .background(Brand.ink)
            .navigationTitle("Materials")
            .navigationDestination(for: PanelRoute.self) { r in
                PanelDetailView(panel: r.panel).zoomDestination(r.zoomID, in: zoom)
            }
            .navigationDestination(for: Supplier.self) { s in
                SupplierCatalogView(supplier: s, zoom: zoom)
            }
            .navigationDestination(for: MoreShelf.Page.self) { page in
                switch page {
                case .wood: WoodLibraryView(zoom: zoom)
                case .paint: HouseColorsView()
                }
            }
            .navigationDestination(for: WoodSpecies.self) { w in
                WoodDetailView(wood: w).zoomDestination("wood-\(w.slug)", in: zoom)
            }
            .navigationDestination(for: Finish.self) { f in
                FinishDetailView(finish: f)
            }
            .onAppear(perform: debugOpen)
        }
    }

    /// Screenshots and checks only (nothing happens in App Store builds).
    private func debugOpen() {
        guard path.isEmpty else { return }
        if let s = DebugLaunch.value("-supplier").flatMap({ v in Supplier.allCases.first { $0.rawValue.lowercased().hasPrefix(v) } }) {
            shelf = Supplier.main.contains(s) ? .supplier(s) : .more
        }
        if DebugLaunch.value("-shelf") == "more" { shelf = .more }
        if let v = DebugLaunch.value("-catalog"), let s = Supplier.allCases.first(where: { $0.rawValue.lowercased().hasPrefix(v) }) { path.append(s) }
        if let id = DebugLaunch.value("-panel"), let p = Panel.find(id) { path.append(PanelRoute(panel: p, from: "debug")) }
        if let slug = DebugLaunch.value("-wood"), let w = WoodSpecies.all.first(where: { $0.slug == slug }) { path.append(w) }
        if DebugLaunch.value("-page") == "paint" { path.append(MoreShelf.Page.paint) }
        if DebugLaunch.value("-page") == "wood" { path.append(MoreShelf.Page.wood) }
    }
}

/// A panel opened from a particular tile, so it grows out of that tile.
struct PanelRoute: Hashable {
    let panel: Panel
    let from: String
    var zoomID: String { "\(from)-\(panel.id)" }
}

// MARK: - One supplier, simple first

/// The supplier in a few plain lines, six favorites, and the way into the rest.
private struct SupplierShelf: View {
    let supplier: Supplier
    let zoom: Namespace.ID

    var body: some View {
        VStack(alignment: .leading, spacing: Space.xl) {
            SupplierIntro(supplier: supplier)

            VStack(alignment: .leading, spacing: Space.m) {
                Text("Our picks").eyebrow()
                PanelGrid(panels: supplier.picks, from: "picks", zoom: zoom)
            }

            NavigationLink(value: supplier) {
                ActionLabel(title: "See all \(supplier.panels.count) \(supplier.rawValue) \(supplier.unit)", systemImage: "square.grid.3x3")
            }
            .secondaryActionStyle()

            Label("Not sure yet? That's normal. We bring the samples to your home and help you choose.", systemImage: "hand.wave")
                .font(.footnote)
                .foregroundStyle(Brand.stone)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

/// What the supplier is, why people choose it, and what it costs with us.
struct SupplierIntro: View {
    let supplier: Supplier

    var body: some View {
        VStack(alignment: .leading, spacing: Space.s) {
            Text(supplier.kind).eyebrow()
            Text(supplier.why).bodyText().fixedSize(horizontal: false, vertical: true)
            HStack(spacing: Space.l) {
                if let price = supplier.price {
                    Text(price).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.brass)
                } else {
                    CostMeter(cost: supplier.cost, words: supplier.costWords)
                }
                Text("\(supplier.panels.count) \(supplier.unit)").font(.footnote).foregroundStyle(Brand.stone).monospacedDigit()
            }
            .padding(.top, Space.xs)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .card()
        .accessibilityElement(children: .combine)
    }
}

/// "$$ Mid-range": filled signs for the cost, faint ones for the rest.
struct CostMeter: View {
    let cost: String
    let words: String

    var body: some View {
        HStack(spacing: Space.s) {
            HStack(spacing: 1) {
                Text(cost).foregroundStyle(Brand.brass)
                Text(String(repeating: "$", count: max(0, 4 - cost.count))).foregroundStyle(Brand.stone.opacity(0.45))
            }
            .font(.subheadline.weight(.semibold))
            .accessibilityHidden(true)
            Text(words).font(.footnote).foregroundStyle(Brand.stone)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Cost: \(words)")
    }
}

// MARK: - Panel grid

/// Swatches three across: the decor, its name and its code.
struct PanelGrid: View {
    let panels: [Panel]
    let from: String
    let zoom: Namespace.ID

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 100), spacing: Space.m)], spacing: Space.l) {
            ForEach(panels) { p in PanelTile(panel: p, from: from, zoom: zoom) }
        }
    }
}

struct PanelTile: View {
    @Environment(AppModel.self) private var model
    let panel: Panel
    let from: String
    let zoom: Namespace.ID

    var body: some View {
        let picked = model.isPicked(panel.requestLine)
        NavigationLink(value: PanelRoute(panel: panel, from: from)) {
            VStack(alignment: .leading, spacing: Space.xs) {
                panel.swatch(px: 360)
                    .aspectRatio(1, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).strokeBorder(Brand.line))
                    .overlay(alignment: .topTrailing) {
                        if picked { PickedBadge().padding(6).transition(.scale(scale: 0.9).combined(with: .opacity)) }
                    }
                    .zoomSource("\(from)-\(panel.id)", in: zoom)
                // The name is how people tell decors apart: it wraps rather than cuts off
                Text(panel.name).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory).lineLimit(2)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, Space.xs)
                if let code = panel.code {
                    Text(code).font(.caption).foregroundStyle(Brand.stone).lineLimit(1)
                }
            }
            .animation(Motion.snappy, value: picked)
        }
        .buttonStyle(PressableStyle())
        .contextMenu {
            Button { model.togglePick(panel.requestLine) } label: {
                picked ? Label("Remove from quote", systemImage: "minus.circle") : Label("Add to quote", systemImage: "text.badge.plus")
            }
            if Tools.arSupported {
                Button { panel.openInAR(model) } label: {
                    Label(panel.isCountertop ? "See it on your counters" : "See it in your room", systemImage: "cube.transparent")
                }
            }
            Button { model.textUs(panel.textLine, picture: panel.cachedPicture) } label: { Label("Text us about it", systemImage: "message") }
        } preview: {
            panel.swatch(px: 600, large: true).frame(width: 300, height: 300)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel([panel.name, panel.code, picked ? "in your quote" : nil].compactMap { $0 }.joined(separator: ", "))
        .accessibilityHint("Opens the color")
    }
}

/// A brass check on a swatch that's in the quote.
struct PickedBadge: View {
    var body: some View {
        Image(systemName: "checkmark")
            .font(.caption2.weight(.bold))
            .foregroundStyle(Brand.ink)
            .frame(width: 22, height: 22)
            .background(Brand.brass, in: Circle())
            .overlay(Circle().strokeBorder(Brand.ink.opacity(0.25)))
            .accessibilityHidden(true)
    }
}

extension Panel {
    /// Doors wear a decor; a countertop stone goes on the counters
    @MainActor func openInAR(_ model: AppModel) {
        if isCountertop { model.openCabinets(counter: arFinish) } else { model.openCabinets(wearing: arFinish) }
    }

    var textLine: String { "Hi Green Cabinets, I like \((isCountertop ? "the " : "") + "\(brand) \(name)" + (code.map { " (\($0))" } ?? "")). " }
    /// The swatch already on the phone, to send with a text
    @MainActor var cachedPicture: UIImage? {
        photoURL.flatMap { SwatchImages.shared.cached($0, px: 1200) } ?? thumbURL.flatMap { SwatchImages.shared.cached($0, px: 360) }
    }
}

// MARK: - The whole catalog

/// Every decor from one supplier, in the groups people scan by, with a menu
/// to jump straight to a group.
struct SupplierCatalogView: View {
    let supplier: Supplier
    let zoom: Namespace.ID

    var body: some View {
        let groups = supplier.groups
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: Space.xl, pinnedViews: [.sectionHeaders]) {
                    VStack(alignment: .leading, spacing: Space.l) {
                        SupplierIntro(supplier: supplier)
                        if supplier.colorGuideOnly {
                            Label("These colors are a guide. The real samples come with us to your home.", systemImage: "info.circle")
                                .font(.footnote).foregroundStyle(Brand.stone)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                    .padding(.horizontal, Space.gutter)

                    ForEach(groups, id: \.title) { g in
                        Section {
                            PanelGrid(panels: g.panels, from: "all", zoom: zoom)
                                .padding(.horizontal, Space.gutter)
                        } header: {
                            HStack {
                                Text(g.title).font(.headline).foregroundStyle(Brand.ivory)
                                Spacer()
                                Text("\(g.panels.count)").font(.subheadline).foregroundStyle(Brand.stone).monospacedDigit()
                            }
                            .padding(.horizontal, Space.gutter)
                            .padding(.vertical, Space.s)
                            .background(Brand.ink.opacity(0.94))
                            .accessibilityAddTraits(.isHeader)
                            .id(g.title)
                        }
                    }

                    if let site = supplier.site {
                        Button { Tools.openWeb(site) } label: {
                            Label("The full collection on \(site.host()?.replacingOccurrences(of: "www.", with: "") ?? "their site")", systemImage: "safari")
                                .font(.subheadline.weight(.semibold))
                                .frame(minHeight: 44)
                        }
                        .padding(.horizontal, Space.gutter)
                    }
                }
                .padding(.bottom, Space.section)
            }
            .scrollIndicators(.hidden)
            .background(Brand.ink)
            .navigationTitle(supplier.rawValue)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if groups.count > 2 {
                    ToolbarItem(placement: .topBarTrailing) {
                        Menu {
                            ForEach(groups, id: \.title) { g in
                                Button("\(g.title) (\(g.panels.count))") {
                                    withAnimation(Motion.settle) { proxy.scrollTo(g.title, anchor: .top) }
                                }
                            }
                        } label: {
                            Label("Jump to", systemImage: "line.3.horizontal.decrease")
                        }
                    }
                }
            }
        }
    }
}

// MARK: - More

/// Everything beyond the three main suppliers, folded into one short list.
struct MoreShelf: View {
    enum Page: Hashable { case wood, paint }

    var body: some View {
        VStack(alignment: .leading, spacing: Space.xl) {
            VStack(alignment: .leading, spacing: Space.m) {
                Text("More suppliers").eyebrow()
                VStack(spacing: 0) {
                    ForEach(Supplier.more) { s in
                        NavigationLink(value: s) {
                            MoreRow(swatches: s.picks.prefix(4).map { AnyView($0.swatch(px: 120)) },
                                    title: s.rawValue, subtitle: [s.kind, s.price].compactMap { $0 }.joined(separator: ", "), count: s.panels.count)
                        }
                        .buttonStyle(PressableStyle(scale: 0.99))
                        Divider().overlay(Brand.line)
                    }
                    NavigationLink(value: Page.wood) {
                        MoreRow(swatches: WoodSpecies.all.prefix(4).map { AnyView(Finish.wood($0).swatch(px: 120)) },
                                title: "Solid wood", subtitle: "Hardwoods, compared on hardness, grain and cost", count: WoodSpecies.all.count)
                    }
                    .buttonStyle(PressableStyle(scale: 0.99))
                    Divider().overlay(Brand.line)
                    NavigationLink(value: Page.paint) {
                        MoreRow(swatches: HouseColors.paints.prefix(4).map { AnyView($0.swatch(px: 120)) },
                                title: "Painted and stained", subtitle: "Our house colors, or any color you bring", count: HouseColors.paints.count + HouseColors.stains.count)
                    }
                    .buttonStyle(PressableStyle(scale: 0.99))
                }
                .card(padding: Space.l)
            }

            Label("Not sure where to start? Most of our kitchens are Tafisa, Shinnoki or Egger.", systemImage: "hand.wave")
                .font(.footnote).foregroundStyle(Brand.stone)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

/// One row under More: four little swatches, the name, what it is, how many.
private struct MoreRow: View {
    let swatches: [AnyView]
    let title: String
    let subtitle: String
    let count: Int

    var body: some View {
        HStack(spacing: Space.m) {
            HStack(spacing: -10) {
                ForEach(swatches.indices, id: \.self) { i in
                    swatches[i]
                        .frame(width: 28, height: 28)
                        .clipShape(Circle())
                        .overlay(Circle().strokeBorder(Brand.surface, lineWidth: 2))
                }
            }
            .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.headline).foregroundStyle(Brand.ivory)
                Text(subtitle).font(.footnote).foregroundStyle(Brand.stone)
                    .fixedSize(horizontal: false, vertical: true)
                    .multilineTextAlignment(.leading)
            }
            Spacer(minLength: Space.s)
            Text("\(count)").font(.subheadline).foregroundStyle(Brand.stone).monospacedDigit()
            Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Brand.stone)
                .accessibilityHidden(true)
        }
        .padding(.vertical, Space.m)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }
}

/// The hardwoods, as on greencabinetsny.com/wood-species.
struct WoodLibraryView: View {
    let zoom: Namespace.ID

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Space.l) {
                Text("Every hardwood we build in, with its hardness, cost and how it takes a stain.")
                    .secondaryText().fixedSize(horizontal: false, vertical: true)
                LazyVGrid(columns: [GridItem(.flexible(), spacing: Space.m), GridItem(.flexible())], spacing: Space.l) {
                    ForEach(WoodSpecies.all) { w in
                        NavigationLink(value: w) {
                            VStack(alignment: .leading, spacing: Space.s) {
                                PhotoView(name: w.image)
                                    .aspectRatio(1, contentMode: .fit)
                                    .zoomSource("wood-\(w.slug)", in: zoom)
                                Text(w.name).font(.headline).foregroundStyle(Brand.ivory).lineLimit(1)
                                Text(w.tagline).font(.footnote).foregroundStyle(Brand.stone).lineLimit(2)
                                    .multilineTextAlignment(.leading)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                        }
                        .buttonStyle(PressableStyle())
                        .accessibilityElement(children: .combine)
                    }
                }
            }
            .padding(.horizontal, Space.gutter)
            .padding(.bottom, Space.section)
        }
        .scrollIndicators(.hidden)
        .background(Brand.ink)
        .navigationTitle("Solid wood")
    }
}

/// Our paint colors and stains, and the promise that any color can be matched.
struct HouseColorsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                Text("A smooth satin paint over shaker, slim shaker or flat doors. We match any Benjamin Moore or Sherwin-Williams color you bring us.")
                    .secondaryText().fixedSize(horizontal: false, vertical: true)
                group("Painted", HouseColors.paints)
                group("Stained wood", HouseColors.stains)
            }
            .padding(.horizontal, Space.gutter)
            .padding(.bottom, Space.section)
        }
        .scrollIndicators(.hidden)
        .background(Brand.ink)
        .navigationTitle("Painted and stained")
    }

    private func group(_ title: String, _ list: [Finish]) -> some View {
        VStack(alignment: .leading, spacing: Space.m) {
            Text(title).eyebrow()
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 100), spacing: Space.m)], spacing: Space.l) {
                ForEach(list) { f in FinishTile(finish: f) }
            }
        }
    }
}

private struct FinishTile: View {
    @Environment(AppModel.self) private var model
    let finish: Finish

    var body: some View {
        let picked = model.isPicked(finish.requestLine)
        NavigationLink(value: finish) {
            VStack(alignment: .leading, spacing: Space.xs) {
                finish.swatch(px: 300)
                    .aspectRatio(1, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).strokeBorder(Brand.line))
                    .overlay(alignment: .topTrailing) { if picked { PickedBadge().padding(6) } }
                Text(finish.name).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory).lineLimit(2)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, Space.xs)
            }
        }
        .buttonStyle(PressableStyle())
        .contextMenu {
            Button { model.togglePick(finish.requestLine) } label: {
                picked ? Label("Remove from quote", systemImage: "minus.circle") : Label("Add to quote", systemImage: "text.badge.plus")
            }
            if Tools.arSupported {
                Button { model.openCabinets(wearing: finish) } label: { Label("See it in your room", systemImage: "cube.transparent") }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(picked ? "\(finish.name), in your quote" : finish.name)
    }
}

extension Finish {
    /// One line for the request: "Painted: Sage Green", "Solid wood: American Walnut"
    var requestLine: String { "\(detail): \(name)" }
}

// MARK: - A supplier decor

struct PanelDetailView: View {
    @Environment(AppModel.self) private var model
    let panel: Panel

    var body: some View {
        let supplier = panel.supplier
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                panel.swatch(px: 1200, large: true)
                    .aspectRatio(1, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: Radius.photo, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: Radius.photo, style: .continuous).strokeBorder(Brand.line))
                    .accessibilityLabel("\(panel.name) sample")

                VStack(alignment: .leading, spacing: Space.s) {
                    Text([panel.brand, panel.finish].filter { !$0.isEmpty }.joined(separator: " · ")).eyebrow()
                    Text(panel.name).heroTitle().fixedSize(horizontal: false, vertical: true)
                    ForEach(panel.codes, id: \.self) { c in
                        Text(c).font(.subheadline.monospaced()).foregroundStyle(Brand.stone)
                    }
                }

                if let supplier {
                    Text(supplier.why).bodyText().fixedSize(horizontal: false, vertical: true)
                    if supplier.colorGuideOnly {
                        Label("The color here is a guide. We bring the real sample to your home.", systemImage: "info.circle")
                            .font(.footnote).foregroundStyle(Brand.stone)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }

                VStack(spacing: Space.m) {
                    Button { panel.openInAR(model) } label: {
                        ActionLabel(title: panel.isCountertop ? "See it on your counters" : "See it in your room", systemImage: "cube.transparent")
                    }
                    .primaryActionStyle()
                    .disabled(!Tools.arSupported)
                    AskRow(text: panel.textLine, pick: panel.requestLine, picture: { panel.cachedPicture })
                }

                if let link = panel.linkURL {
                    Button { Tools.openWeb(link) } label: {
                        Label("See it on \(link.host()?.replacingOccurrences(of: "www.", with: "") ?? "the supplier's site")", systemImage: "safari")
                            .font(.subheadline.weight(.semibold))
                            .frame(minHeight: 44)
                    }
                }
            }
            .padding(.horizontal, Space.gutter)
            .padding(.bottom, Space.section)
        }
        .scrollIndicators(.hidden)
        .background(Brand.ink)
        .navigationTitle(panel.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - A solid wood

struct WoodDetailView: View {
    @Environment(AppModel.self) private var model
    let wood: WoodSpecies

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                Color.clear.frame(height: 320).frame(maxWidth: .infinity)
                    .overlay { Image(wood.image).resizable().scaledToFill() }
                    .clipped()
                    .accessibilityLabel("\(wood.name) grain")

                VStack(alignment: .leading, spacing: Space.xl) {
                    VStack(alignment: .leading, spacing: Space.s) {
                        Text("Solid wood").eyebrow()
                        Text(wood.name).heroTitle()
                        Text(wood.tagline).font(.displayItalic(22, relativeTo: .title3)).foregroundStyle(Brand.brass)
                        Text(wood.short).bodyText().fixedSize(horizontal: false, vertical: true).padding(.top, Space.xs)
                    }

                    VStack(spacing: Space.m) {
                        Button { model.openCabinets(wearing: Finish.wood(wood)) } label: {
                            ActionLabel(title: "See it in your room", systemImage: "cube.transparent")
                        }
                        .primaryActionStyle()
                        .disabled(!Tools.arSupported)
                        AskRow(text: "Hi Green Cabinets, I'm interested in \(wood.name) cabinets. ",
                               pick: Finish.wood(wood).requestLine)
                    }

                    VStack(spacing: Space.l) {
                        hardness
                        Divider().overlay(Brand.line)
                        HStack(spacing: Space.l) {
                            FactView(value: wood.cost, label: "\(wood.costWords) cost")
                            FactView(value: wood.stain, label: "Takes a stain")
                        }
                        Divider().overlay(Brand.line)
                        stability
                    }
                    .card()

                    detailBlock("Color", wood.color)
                    detailBlock("Grain", wood.grain)

                    list("Why people choose it", wood.pros, symbol: "checkmark")
                    list("Keep in mind", wood.cons, symbol: "exclamationmark.circle")
                    list("Finishes that suit it", wood.finishes, symbol: "paintbrush")
                }
                .padding(.horizontal, Space.gutter)
            }
            .padding(.bottom, Space.section)
        }
        .scrollIndicators(.hidden)
        .ignoresSafeArea(edges: .top)
        .background(Brand.ink)
        .navigationTitle(wood.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.hidden, for: .navigationBar)
    }

    private var hardness: some View {
        VStack(alignment: .leading, spacing: Space.s) {
            HStack(alignment: .firstTextBaseline) {
                Text("Hardness").font(.footnote).foregroundStyle(Brand.stone)
                Spacer()
                Text("\(wood.janka.formatted()) lbf Janka").font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory).monospacedDigit()
            }
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Brand.raised)
                    Capsule().fill(Brand.brass).frame(width: g.size.width * CGFloat(wood.janka) / CGFloat(WoodSpecies.hardest))
                }
            }
            .frame(height: 8)
            .accessibilityHidden(true)
        }
        .accessibilityElement(children: .combine)
    }

    private var stability: some View {
        HStack {
            Text("Stability").font(.footnote).foregroundStyle(Brand.stone)
            Spacer()
            HStack(spacing: 6) {
                ForEach(1...5, id: \.self) { i in
                    Circle().fill(i <= wood.stability ? Brand.brass : Brand.raised).frame(width: 10, height: 10)
                }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Stability")
        .accessibilityValue("\(wood.stability) out of 5")
    }

    private func detailBlock(_ title: String, _ text: String) -> some View {
        VStack(alignment: .leading, spacing: Space.xs) {
            Text(title).eyebrow()
            Text(text).bodyText().fixedSize(horizontal: false, vertical: true)
        }
    }

    private func list(_ title: String, _ items: [String], symbol: String) -> some View {
        VStack(alignment: .leading, spacing: Space.m) {
            Text(title).eyebrow()
            ForEach(items, id: \.self) { BulletRow(text: $0, symbol: symbol) }
        }
    }
}

// MARK: - A paint or stain

struct FinishDetailView: View {
    @Environment(AppModel.self) private var model
    let finish: Finish

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                finish.swatch(px: 900)
                    .aspectRatio(1, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: Radius.photo, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: Radius.photo, style: .continuous).strokeBorder(Brand.line))
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: Space.s) {
                    Text(finish.detail).eyebrow()
                    Text(finish.name).heroTitle()
                    Text(finish.grain
                         ? "A stain on solid wood, so the grain shows through. We bring real stained samples to your home."
                         : "A smooth satin paint over shaker, slim shaker or flat doors. We match any color you bring us.")
                        .bodyText().fixedSize(horizontal: false, vertical: true)
                }
                VStack(spacing: Space.m) {
                    Button { model.openCabinets(wearing: finish) } label: {
                        ActionLabel(title: "See it in your room", systemImage: "cube.transparent")
                    }
                    .primaryActionStyle()
                    .disabled(!Tools.arSupported)
                    AskRow(text: "Hi Green Cabinets, I'm interested in \(finish.name). ", pick: finish.requestLine)
                }
            }
            .padding(.horizontal, Space.gutter)
            .padding(.bottom, Space.section)
        }
        .scrollIndicators(.hidden)
        .background(Brand.ink)
        .navigationTitle(finish.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}
