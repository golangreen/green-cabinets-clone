import SwiftUI

struct HomeView: View {
    @Environment(AppModel.self) private var model
    @Namespace private var zoom
    @State private var feet: Double = 16

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Space.section) {
                    hero
                    Group {
                        StartHere()
                        tools
                        recentWork
                        materials
                        DrawingReveal()
                        steps
                        pricing
                        buildings
                        faq
                        contact
                    }
                    .page()
                }
                .padding(.bottom, Space.section)
            }
            .scrollIndicators(.hidden)
            .debugScroll()
            .ignoresSafeArea(edges: .top)
            .background(Brand.ink)
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: WorkPhoto.self) { p in
                PhotoDetailView(photos: Array(Content.photos.prefix(8)), current: p.id)
                    .zoomDestination(p.id, in: zoom)
            }
            .navigationDestination(for: PanelRoute.self) { r in
                PanelDetailView(panel: r.panel).zoomDestination(r.zoomID, in: zoom)
            }
        }
    }

    // MARK: Hero

    private var hero: some View {
        VStack(alignment: .leading, spacing: 0) {
            // The photo stays bright; only its lower edge melts into the page
            Color.clear
                .frame(height: 440)
                .frame(maxWidth: .infinity)
                .overlay { Image(Content.hero).resizable().scaledToFill() }
                .clipped()
                .overlay(alignment: .bottom) {
                    LinearGradient(colors: [Brand.ink.opacity(0), Brand.ink], startPoint: .top, endPoint: .bottom)
                        .frame(height: 170)
                }
                .overlay(alignment: .top) {
                    // Keeps the status bar legible over the photo
                    LinearGradient(colors: [Brand.ink.opacity(0.55), Brand.ink.opacity(0)], startPoint: .top, endPoint: .bottom)
                        .frame(height: 110)
                }
                // Pulling down past the top stretches the photo, like the system's own headers
                .visualEffect { content, proxy in
                    let y = proxy.frame(in: .scrollView).minY
                    return content.scaleEffect(y > 0 ? 1 + y / 440 : 1, anchor: .bottom)
                }
                .accessibilityElement()
                .accessibilityLabel("White oak kitchen with a marble waterfall island, built by Green Cabinets")
                .accessibilityAddTraits(.isImage)

            VStack(alignment: .leading, spacing: Space.l) {
                Text("Since 2009 · Designed in Bushwick").eyebrow()
                (Text("Most NYC kitchens were never designed for ")
                    + Text("stock cabinets.").font(.displayItalic(42)).foregroundColor(Brand.brass))
                    .heroTitle()
                    .fixedSize(horizontal: false, vertical: true)
                Text("Custom kitchens, vanities and closets for Brooklyn, Manhattan, Queens and Staten Island.")
                    .bodyText()
                    .fixedSize(horizontal: false, vertical: true)
                ActionRow {
                    Button { model.tab = .quote } label: { ActionLabel(title: "Get a quote") }
                        .primaryActionStyle()
                    Button { model.tab = .plan } label: { ActionLabel(title: "Plan your room") }
                        .secondaryActionStyle()
                }
                .padding(.top, Space.xs)
            }
            .page()
            .padding(.top, -64)
        }
    }

    // MARK: Tools

    private var tools: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "Tools", title: "Try it in your own room.",
                          subtitle: "Everything you make here goes with your quote request.")
            LazyVGrid(columns: [GridItem(.flexible(), spacing: Space.m, alignment: .top), GridItem(.flexible(), alignment: .top)], spacing: Space.m) {
                ToolTile(symbol: "cube.transparent", title: "Cabinets in AR", detail: "Place real-size cabinets in your kitchen") { model.openCabinets() }
                ToolTile(symbol: "ruler", title: "Measure", detail: "Walls, gaps and windows with the camera") { model.openMeasure() }
                ToolTile(symbol: "square.split.bottomrightquarter", title: "Design my kitchen", detail: "Your kitchen's shape and sizes, new cabinets and the price") {
                    model.designKitchen()
                }
                ToolTile(symbol: "doc.viewfinder", title: "Scan drawings", detail: "Plans or a sketch, straightened") { model.openDrawings() }
                ToolTile(symbol: "eyedropper.halffull", title: "Match a color", detail: "Find the real panel closest to any color") { model.showColorMatch = true }
                ToolTile(symbol: "rectangle.on.rectangle", title: "Design board", detail: "Your pictures and picks on one page") { model.openBoard() }
            }
        }
    }

    // MARK: Work

    private var recentWork: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            HStack(alignment: .lastTextBaseline) {
                SectionHeader(eyebrow: "Our work", title: "Made for the room.")
                Button("See all") { model.tab = .work }
                    .font(.subheadline.weight(.semibold))
                    .frame(minHeight: 44)
            }
            ScrollView(.horizontal) {
                LazyHStack(alignment: .top, spacing: Space.m) {
                    ForEach(Content.photos.prefix(8)) { p in
                        NavigationLink(value: p) {
                            VStack(alignment: .leading, spacing: Space.s) {
                                PhotoView(name: p.id)
                                    .frame(width: 250, height: 310)
                                    .zoomSource(p.id, in: zoom)
                                Text(p.title)
                                    .font(.footnote)
                                    .foregroundStyle(Brand.stone)
                                    .lineLimit(2, reservesSpace: true)
                                    .frame(width: 250, alignment: .leading)
                            }
                        }
                        .buttonStyle(PressableStyle())
                        .workPhotoMenu(p, model: model)
                        .accessibilityLabel(p.title)
                    }
                }
                .scrollTargetLayout()
            }
            .scrollTargetBehavior(.viewAligned)
            .scrollIndicators(.hidden)
            .scrollClipDisabled()
        }
    }

    // MARK: Materials

    /// Our three main suppliers' favorites, side by side
    private var strip: [Panel] {
        let lists = Supplier.main.map(\.picks)
        return (0..<3).flatMap { i in lists.compactMap { $0.indices.contains(i * 2) ? $0[i * 2] : nil } }
    }

    private var materials: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "Materials", title: "Real panels, real samples.",
                          subtitle: "Mostly Tafisa, Shinnoki and Egger. Pick the ones you like and we bring them to your home.")
            ScrollView(.horizontal) {
                LazyHStack(alignment: .top, spacing: Space.m) {
                    ForEach(strip) { p in
                        NavigationLink(value: PanelRoute(panel: p, from: "home")) {
                            VStack(alignment: .leading, spacing: Space.xs) {
                                p.swatch(px: 330)
                                    .frame(width: 110, height: 110)
                                    .clipShape(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous))
                                    .overlay(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).strokeBorder(Brand.line))
                                    .zoomSource("home-\(p.id)", in: zoom)
                                Text(p.name).font(.footnote.weight(.semibold)).foregroundStyle(Brand.ivory).lineLimit(2, reservesSpace: true)
                                Text(p.brand).font(.caption).foregroundStyle(Brand.stone)
                            }
                            .frame(width: 110, alignment: .leading)
                        }
                        .buttonStyle(PressableStyle())
                        .accessibilityElement(children: .combine)
                    }
                }
            }
            .scrollIndicators(.hidden)
            .scrollClipDisabled()
            ActionRow {
                Button { model.tab = .materials } label: { ActionLabel(title: "Browse materials", systemImage: "swatchpalette") }
                    .secondaryActionStyle()
                Button { model.showColorMatch = true } label: { ActionLabel(title: "Match a color", systemImage: "eyedropper.halffull") }
                    .secondaryActionStyle()
            }
        }
    }

    // MARK: How it works

    private var steps: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "How it works", title: "From a crooked wall to a finished kitchen.",
                          subtitle: "Most kitchens take 4 to 6 weeks from approved drawings to install.")
            ForEach(Array(Content.steps.enumerated()), id: \.element.id) { i, s in
                HStack(alignment: .top, spacing: Space.l) {
                    PhotoView(name: s.image, corner: Radius.chip)
                        .frame(width: 96, height: 96)
                        .accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: Space.xs) {
                        Text("Step \(i + 1)").eyebrow()
                        Text(s.title).cardTitle()
                        Text(s.text).secondaryText().fixedSize(horizontal: false, vertical: true)
                    }
                }
                .accessibilityElement(children: .combine)
            }
        }
    }

    // MARK: Pricing

    private var pricing: some View {
        let mine = feet >= 10 ? Content.tiers.first { $0.feet.contains(feet) } : nil
        return VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "Pricing", title: "Real numbers, before the first visit.",
                          subtitle: "What NYC kitchens cost with us in 2026.")
            PriceCheck(feet: $feet)
            ForEach(Content.tiers) { t in
                let isMine = t.id == mine?.id
                VStack(alignment: .leading, spacing: Space.s) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(t.name).eyebrow()
                        Spacer()
                        Text(t.size).font(.footnote).foregroundStyle(Brand.stone)
                    }
                    Text(t.range).font(.display(32, relativeTo: .title)).foregroundStyle(Brand.ivory).monospacedDigit()
                    Text(t.note).secondaryText().fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .card()
                .overlay(RoundedRectangle(cornerRadius: Radius.card, style: .continuous).strokeBorder(Brand.brass, lineWidth: isMine ? 1.5 : 0))
                .animation(Motion.snappy, value: isMine)
                .accessibilityElement(children: .combine)
                .accessibilityValue(isMine ? "Your size" : "")
            }
            HStack(spacing: Space.m) {
                ForEach(Content.rates, id: \.value) { r in FactView(value: r.value, label: r.label) }
            }
            .padding(.top, Space.xs)
        }
    }

    // MARK: Buildings

    private var buildings: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "Install day", title: "Built for New York buildings.",
                          subtitle: "Most installs take 3 to 7 days. The building sets the schedule, so we plan around it.")
            VStack(spacing: 0) {
                ForEach(Content.buildings) { p in
                    HStack(alignment: .top, spacing: Space.l) {
                        Image(systemName: p.symbol)
                            .font(.title3)
                            .foregroundStyle(Brand.brass)
                            .frame(width: 32)
                            .accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(p.title).font(.headline).foregroundStyle(Brand.ivory)
                            Text(p.text).secondaryText().fixedSize(horizontal: false, vertical: true)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(.vertical, Space.m)
                    .accessibilityElement(children: .combine)
                    if p.id != Content.buildings.last?.id { Divider().overlay(Brand.line) }
                }
            }
            .card()
        }
    }

    // MARK: FAQ

    private var faq: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "Questions", title: "What people ask first.")
            VStack(spacing: 0) {
                ForEach(Content.faqs) { f in
                    DisclosureGroup {
                        Text(f.answer).secondaryText()
                            .fixedSize(horizontal: false, vertical: true)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.bottom, Space.m)
                    } label: {
                        Text(f.question).font(.headline).foregroundStyle(Brand.ivory)
                            .multilineTextAlignment(.leading)
                            .frame(minHeight: 44, alignment: .leading)
                    }
                    .tint(Brand.brass)
                    if f.id != Content.faqs.last?.id { Divider().overlay(Brand.line) }
                }
            }
            .card(padding: Space.l)
        }
    }

    // MARK: Contact

    private var contact: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "By appointment", title: "We bring the samples to you.",
                          subtitle: "In Brooklyn, Manhattan, Queens and Staten Island. Tell us about the room and we'll book a free visit at your home.")
            Button { model.tab = .quote } label: { ActionLabel(title: "Get a quote", systemImage: "paperplane") }
                .primaryActionStyle()
            ActionRow {
                Button { model.textUs() } label: { ActionLabel(title: "Text us", systemImage: "message") }
                    .secondaryActionStyle()
                Button { EmailUs.open() } label: { ActionLabel(title: "Email us", systemImage: "envelope") }
                    .secondaryActionStyle()
            }
        }
    }
}

// MARK: - Start here

/// The whole app in three steps, for anyone opening it for the first time.
/// Each step ticks off as it's done, and the next one is the one in brass.
struct StartHere: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        let b = model.basket
        let shown = !b.items.isEmpty || !b.lengths.isEmpty || b.room != nil
        let picked = !b.picks.isEmpty
        let sent = model.lastSent != nil && b.isEmpty
        let current = sent ? 0 : (!shown ? 1 : (!picked ? 2 : 3))
        VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "Start here", title: "Three steps to your kitchen.")
            VStack(spacing: 0) {
                JourneyRow(n: 1, title: "Show us your room", text: "Measure it, scan it, or try cabinets in AR",
                           done: shown || sent, current: current == 1) { model.tab = .plan }
                Divider().overlay(Brand.line)
                JourneyRow(n: 2, title: "Pick what you love", text: "Real panels and colors, from home",
                           done: picked || sent, current: current == 2) { model.tab = .materials }
                Divider().overlay(Brand.line)
                JourneyRow(n: 3, title: "Send it to us", text: sent ? "Sent. We reply within 24 hours." : "We reply within 24 hours",
                           done: sent, current: current == 3) { model.tab = .quote }
            }
            .card(padding: Space.l)
            if !b.isEmpty || model.sentBasket != nil {
                Button { model.openBoard() } label: {
                    Label("See it all on your design board", systemImage: "rectangle.on.rectangle")
                        .font(.subheadline.weight(.semibold))
                        .frame(minHeight: 44)
                }
            }
        }
    }
}

/// One step: a number (a check once done), what to do, and where it goes.
private struct JourneyRow: View {
    let n: Int
    let title: String
    let text: String
    let done: Bool
    let current: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Space.m) {
                ZStack {
                    Circle().fill(done || current ? Brand.brass : Color.clear)
                    Circle().strokeBorder(done || current ? Color.clear : Brand.stone.opacity(0.6), lineWidth: 1.5)
                    if done {
                        Image(systemName: "checkmark").font(.subheadline.weight(.bold)).foregroundStyle(Brand.ink)
                            .transition(.scale(scale: 0.9).combined(with: .opacity))
                    } else {
                        Text("\(n)").font(.headline).foregroundStyle(current ? Brand.ink : Brand.ivory)
                    }
                }
                .frame(width: 36, height: 36)
                .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.headline).foregroundStyle(Brand.ivory)
                    Text(text).font(.subheadline).foregroundStyle(Brand.stone)
                        .fixedSize(horizontal: false, vertical: true)
                        .multilineTextAlignment(.leading)
                }
                Spacer(minLength: Space.s)
                Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Brand.stone)
                    .accessibilityHidden(true)
            }
            .padding(.vertical, Space.m)
            .frame(minHeight: 64)
            .contentShape(Rectangle())
            .animation(Motion.snappy, value: done)
        }
        .buttonStyle(PressableStyle(scale: 0.99))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Step \(n) of 3. \(title)")
        .accessibilityValue(done ? "Done" : (current ? "Next" : ""))
        .accessibilityHint(text)
    }
}

// MARK: - Price check

/// Slide to the length of your cabinets and see what kitchens that size cost
/// with us, straight from the published 2026 ranges.
struct PriceCheck: View {
    @Binding var feet: Double

    var body: some View {
        let tier = feet >= 10 ? Content.tiers.first { $0.feet.contains(feet) } : nil
        let perFoot = Int((feet * 350 / 50).rounded()) * 50
        VStack(alignment: .leading, spacing: Space.m) {
            Text("Try it: how long are your cabinets?").font(.headline).foregroundStyle(Brand.ivory)
            HStack(alignment: .firstTextBaseline, spacing: Space.s) {
                Text("\(Int(feet))").font(.display(48, relativeTo: .largeTitle)).foregroundStyle(Brand.ivory)
                    .contentTransition(.numericText(value: feet))
                    .animation(Motion.snappy, value: feet)
                Text("feet of cabinets").secondaryText()
            }
            Slider(value: $feet, in: 6...40, step: 1) {
                Text("Feet of cabinets")
            } minimumValueLabel: {
                Text("6").font(.footnote).foregroundStyle(Brand.stone)
            } maximumValueLabel: {
                Text("40").font(.footnote).foregroundStyle(Brand.stone)
            }
            .tint(Brand.brass)
            .accessibilityValue("\(Int(feet)) feet")
            Text(tier.map { "\($0.name): \($0.range)" } ?? "About $\(perFoot.formatted()) at $350 a foot")
                .font(.headline)
                .foregroundStyle(Brand.brass)
                .contentTransition(.numericText())
                .animation(Motion.snappy, value: tier?.id)
            Text("Add up the walls that get cabinets. We confirm every size when we visit.")
                .font(.footnote).foregroundStyle(Brand.stone)
                .fixedSize(horizontal: false, vertical: true)
        }
        .card()
        .sensoryFeedback(.selection, trigger: tier?.id)
    }
}

// MARK: - Tool tile

/// One tool on the home screen: an icon, what it does, and a tap opens it.
struct ToolTile: View {
    let symbol: String
    let title: String
    let detail: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: Space.s) {
                Image(systemName: symbol)
                    .font(.title2)
                    .foregroundStyle(Brand.brass)
                    .frame(width: 48, height: 48)
                    .background(Brand.brass.opacity(0.12), in: Circle())
                    .accessibilityHidden(true)
                Spacer(minLength: Space.s)
                Text(title).font(.headline).foregroundStyle(Brand.ivory)
                Text(detail).font(.footnote).foregroundStyle(Brand.stone)
                    .fixedSize(horizontal: false, vertical: true)
                    .multilineTextAlignment(.leading)
            }
            .frame(maxWidth: .infinity, minHeight: 168, alignment: .topLeading)
            .card()
        }
        .buttonStyle(PressableStyle())
        .accessibilityElement(children: .combine)
    }
}

// MARK: - Drawn, then built

/// The same kitchen as a drawing and as built: drag the line to compare.
/// Buttons move it for people who can't drag; a vertical swipe still scrolls
/// the page.
struct DrawingReveal: View {
    @State private var split: CGFloat = 0.5
    @State private var dragStart: CGFloat?
    /// Decided on the first few points of a drag: sideways moves the line
    @State private var sideways: Bool?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "Drawn, then built", title: "Nothing is cut until you approve the drawing.",
                          subtitle: "The same kitchen: our drawing, and the finished room.")
            GeometryReader { geo in
                let w = geo.size.width
                ZStack(alignment: .leading) {
                    Image("photo-design-reality-kitchen-1").resizable().scaledToFill()
                        .frame(width: w, height: geo.size.height).clipped()
                    Image("story-galley-kitchen-drawing").resizable().scaledToFill()
                        .frame(width: w, height: geo.size.height).clipped()
                        .mask(alignment: .leading) { Rectangle().frame(width: w * split) }
                    Rectangle().fill(Brand.ivory).frame(width: 2)
                        .offset(x: w * split - 1)
                    Circle().fill(Brand.ivory).frame(width: 36, height: 36)
                        .overlay(Image(systemName: "arrow.left.and.right").font(.footnote.weight(.bold)).foregroundStyle(Brand.ink))
                        .offset(x: w * split - 18)
                        .shadow(color: .black.opacity(0.35), radius: 6, y: 2)
                }
                .clipShape(RoundedRectangle(cornerRadius: Radius.photo, style: .continuous))
                .contentShape(Rectangle())
                .simultaneousGesture(
                    DragGesture(minimumDistance: 8)
                        .onChanged { g in
                            if sideways == nil { sideways = abs(g.translation.width) > abs(g.translation.height) }
                            guard sideways == true else { return }
                            if dragStart == nil { dragStart = split }
                            split = min(1, max(0, (dragStart ?? split) + g.translation.width / w))
                        }
                        .onEnded { _ in
                            dragStart = nil
                            sideways = nil
                        }
                )
                .accessibilityElement()
                .accessibilityLabel("Drawing compared with the finished kitchen")
                .accessibilityValue("\(Int(split * 100)) percent drawing")
                .accessibilityAdjustableAction { dir in
                    switch dir {
                    case .increment: split = min(1, split + 0.1)
                    case .decrement: split = max(0, split - 0.1)
                    @unknown default: break
                    }
                }
            }
            .aspectRatio(1.5, contentMode: .fit)
            HStack {
                Button("Drawing") { withAnimation(Motion.ui(reduceMotion)) { split = 1 } }
                Spacer()
                Button("Finished") { withAnimation(Motion.ui(reduceMotion)) { split = 0 } }
            }
            .font(.subheadline.weight(.semibold))
            .frame(minHeight: 44)
        }
    }
}
