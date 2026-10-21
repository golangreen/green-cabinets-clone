import SwiftUI

/// The 14 hardwoods and the door finishes, each one a tap away from AR.
struct MaterialsView: View {
    private enum Section: String, CaseIterable, Identifiable {
        case wood = "Wood species", finishes = "Finishes"
        var id: String { rawValue }
    }

    @State private var section: Section = .wood
    @State private var path = NavigationPath()
    @Namespace private var zoom

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: Space.xl) {
                    Picker("Show", selection: $section) {
                        ForEach(Section.allCases) { Text($0.rawValue).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .sensoryFeedback(.selection, trigger: section)

                    if section == .wood { wood } else { finishes }
                }
                .padding(.horizontal, Space.gutter)
                .padding(.bottom, Space.section)
            }
            .scrollIndicators(.hidden)
            .background(Brand.ink)
            .navigationTitle("Materials")
            .navigationDestination(for: WoodSpecies.self) { w in
                WoodDetailView(wood: w).zoomDestination(w.slug, in: zoom)
            }
            .navigationDestination(for: Finish.self) { f in
                FinishDetailView(finish: f)
            }
            .onAppear {
                if let slug = DebugLaunch.value("-wood"), let w = WoodSpecies.all.first(where: { $0.slug == slug }), path.isEmpty { path.append(w) }
                if DebugLaunch.value("-section") == "finishes" { section = .finishes }
            }
        }
    }

    private var wood: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            Text("Every species we build in, with its hardness, cost and how it takes a stain.")
                .secondaryText().fixedSize(horizontal: false, vertical: true)
            LazyVGrid(columns: [GridItem(.flexible(), spacing: Space.m), GridItem(.flexible())], spacing: Space.l) {
                ForEach(WoodSpecies.all) { w in
                    NavigationLink(value: w) {
                        VStack(alignment: .leading, spacing: Space.s) {
                            PhotoView(name: w.image)
                                .aspectRatio(1, contentMode: .fit)
                                .zoomSource(w.slug, in: zoom)
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
    }

    private var finishes: some View {
        VStack(alignment: .leading, spacing: Space.xl) {
            group("Wood and panel decors", Finish.panels)
            group("Painted", Finish.paints)
        }
    }

    private func group(_ title: String, _ list: [Finish]) -> some View {
        VStack(alignment: .leading, spacing: Space.m) {
            Text(title).eyebrow()
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 100), spacing: Space.m)], spacing: Space.l) {
                ForEach(list) { f in
                    NavigationLink(value: f) {
                        VStack(alignment: .leading, spacing: Space.s) {
                            Swatch(finish: f).aspectRatio(1, contentMode: .fit)
                            Text(f.name).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory).lineLimit(1)
                            Text(f.detail).font(.caption).foregroundStyle(Brand.stone)
                        }
                    }
                    .buttonStyle(PressableStyle())
                    .accessibilityElement(children: .combine)
                }
            }
        }
    }
}

/// A finish sample: the photo for a panel decor, the color for paint.
struct Swatch: View {
    let finish: Finish
    var body: some View {
        Group {
            if let t = finish.texture {
                PhotoView(name: t, corner: Radius.chip)
            } else {
                RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).fill(finish.color)
            }
        }
        .overlay(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).strokeBorder(Brand.line))
        .accessibilityHidden(true)
    }
}

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
                        Text("Wood species").eyebrow()
                        Text(wood.name).heroTitle()
                        Text(wood.tagline).font(.displayItalic(22, relativeTo: .title3)).foregroundStyle(Brand.brass)
                        Text(wood.short).bodyText().fixedSize(horizontal: false, vertical: true).padding(.top, Space.xs)
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

                    VStack(spacing: Space.m) {
                        Button { model.openCabinets(wearing: Finish.wood(wood)) } label: {
                            ActionLabel(title: "See it in your room", systemImage: "cube.transparent")
                        }
                        .primaryActionStyle()
                        .disabled(!Tools.arSupported)
                        AskRow(text: "Hi Green Cabinets, I'm interested in \(wood.name) cabinets. ",
                               note: "I'm interested in \(wood.name) cabinets.")
                    }
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

struct FinishDetailView: View {
    @Environment(AppModel.self) private var model
    let finish: Finish

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                Swatch(finish: finish).aspectRatio(1, contentMode: .fit)
                VStack(alignment: .leading, spacing: Space.s) {
                    Text(finish.detail).eyebrow()
                    Text(finish.name).heroTitle()
                    Text(finish.texture == nil
                         ? "A smooth satin paint over shaker or flat doors. We match any color you bring us."
                         : "A real panel decor sample. We bring the physical sample to your home.")
                        .bodyText().fixedSize(horizontal: false, vertical: true)
                }
                Button { model.openCabinets(wearing: finish) } label: {
                    ActionLabel(title: "See it in your room", systemImage: "cube.transparent")
                }
                .primaryActionStyle()
                .disabled(!Tools.arSupported)
                AskRow(text: "Hi Green Cabinets, I'm interested in the \(finish.name) finish. ",
                       note: "I'm interested in the \(finish.name) finish.", image: finish.texture)
            }
            .padding(.horizontal, Space.gutter)
            .padding(.bottom, Space.section)
        }
        .background(Brand.ink)
        .navigationTitle(finish.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}
