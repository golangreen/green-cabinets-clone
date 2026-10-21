import SwiftUI

struct HomeView: View {
    @Environment(AppModel.self) private var model
    @Namespace private var zoom

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Space.section) {
                    hero
                    Group {
                        tools
                        recentWork
                        DrawingReveal()
                        steps
                        pricing
                        buildings
                        faq
                        contact
                    }
                    .padding(.horizontal, Space.gutter)
                }
                .padding(.bottom, Space.section)
            }
            .scrollIndicators(.hidden)
            .ignoresSafeArea(edges: .top)
            .background(Brand.ink)
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: WorkPhoto.self) { p in
                PhotoDetailView(photos: Array(Content.photos.prefix(8)), current: p.id)
                    .zoomDestination(p.id, in: zoom)
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
                .accessibilityElement()
                .accessibilityLabel("White oak kitchen with a marble waterfall island, built by Green Cabinets")
                .accessibilityAddTraits(.isImage)

            VStack(alignment: .leading, spacing: Space.l) {
                Text("Since 2009 · Designed in Bushwick").eyebrow()
                (Text("Most NYC kitchens were never designed for ")
                    + Text("stock cabinets.").font(.displayItalic(42)).foregroundColor(Brand.brass))
                    .heroTitle()
                    .fixedSize(horizontal: false, vertical: true)
                Text("Custom kitchens, vanities and closets for Brooklyn, Manhattan and Queens.")
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
            .padding(.horizontal, Space.gutter)
            .padding(.top, -64)
        }
    }

    // MARK: Tools

    private var tools: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "In the app", title: "Start from your own room.",
                          subtitle: "Everything you make here goes with your quote request.")
            LazyVGrid(columns: [GridItem(.flexible(), spacing: Space.m), GridItem(.flexible())], spacing: Space.m) {
                ToolTile(symbol: "cube.transparent", title: "Cabinets in AR", detail: "Place real-size cabinets in your kitchen") { model.openCabinets() }
                ToolTile(symbol: "ruler", title: "Measure", detail: "Walls, gaps and windows with the camera") { model.openMeasure() }
                ToolTile(symbol: "viewfinder", title: "Scan the room", detail: RoomCapture.isSupported ? "A measured 3D room in two minutes" : "See what a room scan looks like") {
                    if RoomCapture.isSupported { model.tab = .plan } else { model.showSampleScan() }
                }
                ToolTile(symbol: "doc.viewfinder", title: "Scan drawings", detail: "Plans or a sketch, straightened") { model.openDrawings() }
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
                LazyHStack(spacing: Space.m) {
                    ForEach(Content.photos.prefix(8)) { p in
                        NavigationLink(value: p) {
                            VStack(alignment: .leading, spacing: Space.s) {
                                PhotoView(name: p.id)
                                    .frame(width: 250, height: 310)
                                    .zoomSource(p.id, in: zoom)
                                Text(p.title)
                                    .font(.footnote)
                                    .foregroundStyle(Brand.stone)
                                    .lineLimit(2)
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
        VStack(alignment: .leading, spacing: Space.l) {
            SectionHeader(eyebrow: "Pricing", title: "Real numbers, before the first visit.",
                          subtitle: "What NYC kitchens cost with us in 2026.")
            ForEach(Content.tiers) { t in
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
                .accessibilityElement(children: .combine)
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
                          subtitle: "Tell us about the room and we'll book a free in-home consultation.")
            Button { model.tab = .quote } label: { ActionLabel(title: "Get a quote", systemImage: "paperplane") }
                .primaryActionStyle()
            ActionRow {
                Button { model.textUs() } label: { ActionLabel(title: "Text us", systemImage: "message") }
                    .secondaryActionStyle()
                Link(destination: URL(string: "mailto:\(Content.email)")!) { ActionLabel(title: "Email us", systemImage: "envelope") }
                    .secondaryActionStyle()
            }
        }
    }
}

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
        .accessibilityHint(detail)
    }
}

/// The same kitchen as a drawing and as built: drag the line to compare.
/// A button alternative moves it for people who can't drag.
struct DrawingReveal: View {
    @State private var split: CGFloat = 0.5
    @State private var dragStart: CGFloat?
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
                .gesture(
                    DragGesture(minimumDistance: 4)
                        .onChanged { g in
                            if dragStart == nil { dragStart = split }
                            split = min(1, max(0, (dragStart ?? split) + g.translation.width / w))
                        }
                        .onEnded { _ in dragStart = nil }
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
