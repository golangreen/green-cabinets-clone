import SwiftUI
import UIKit

/// Everything the person made and picked, on one page: the pictures from the
/// AR camera and the room scan, the finishes they like with their codes, and
/// their sizes. Theirs to keep (save, print, share) or to send to us.
struct DesignBoardView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var viewing: PictureSet?
    @State private var preparing = false

    /// Showing the board already sent (nothing new collected since)
    private var showingSent: Bool { model.basket.isEmpty && model.sentBasket != nil }
    private var board: ProjectBasket { showingSent ? (model.sentBasket ?? model.basket) : model.basket }

    var body: some View {
        let b = board
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                VStack(alignment: .leading, spacing: Space.s) {
                    if showingSent, let d = model.lastSent {
                        Label("Sent to Green Cabinets \(d.formatted(date: .abbreviated, time: .omitted))", systemImage: "checkmark.circle.fill")
                            .font(.caption.weight(.semibold)).foregroundStyle(Brand.brass)
                    } else {
                        Text("Your kitchen, so far").eyebrow()
                    }
                    Text("Design board").heroTitle()
                    Text("Keep adding as you go. Save it, print it, or share it with anyone helping you decide.")
                        .secondaryText().fixedSize(horizontal: false, vertical: true)
                }

                if b.isEmpty {
                    empty
                } else {
                    pictures(b)
                    picks(b)
                    sizes(b)
                    actions
                }
            }
            .page()
            .padding(.bottom, Space.section)
        }
        .scrollIndicators(.hidden)
        .debugScroll()
        .background(Brand.ink)
        .navigationTitle("Design board")
        .task {
            #if DEBUG
            // -export: writes the printed page to Documents, for checking
            if DebugLaunch.value("-export") != nil {
                let poster = await BoardPoster.make(basket: board, unit: model.unit)
                let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                try? poster.image()?.pngData()?.write(to: docs.appendingPathComponent("board.png"))
                if let pdf = poster.pdf() { try? FileManager.default.copyItem(at: pdf, to: docs.appendingPathComponent("board.pdf")) }
            }
            #endif
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if !b.isEmpty {
                ToolbarItem(placement: .primaryAction) {
                    Menu {
                        Button { export(.image) } label: { Label("Save or share as a picture", systemImage: "photo") }
                        Button { export(.pdf) } label: { Label("Print or save as PDF", systemImage: "printer") }
                    } label: {
                        Label("Share", systemImage: "square.and.arrow.up")
                    }
                    .disabled(preparing)
                }
            }
        }
        .fullScreenCover(item: $viewing) { PictureViewer(set: $0) }
    }

    // MARK: Sections

    private var empty: some View {
        VStack(alignment: .leading, spacing: Space.l) {
            Text("Nothing here yet. Try cabinets in AR, scan the room, or pick finishes you like. It all collects here.")
                .bodyText().fixedSize(horizontal: false, vertical: true)
            ActionRow {
                Button { model.tab = .plan } label: { ActionLabel(title: "Plan the room", systemImage: "ruler") }
                    .primaryActionStyle()
                Button { model.tab = .materials } label: { ActionLabel(title: "Pick finishes", systemImage: "swatchpalette") }
                    .secondaryActionStyle()
            }
        }
        .card()
    }

    @ViewBuilder
    private func pictures(_ b: ProjectBasket) -> some View {
        let shots = b.items.compactMap { a in UIImage(data: a.jpeg).map { (a.id, $0, a.title) } }
        if !shots.isEmpty {
            VStack(alignment: .leading, spacing: Space.m) {
                Text("Pictures").eyebrow()
                if let first = shots.first {
                    Button { viewing = PictureSet(images: shots.map(\.1), titles: shots.map(\.2), index: 0) } label: {
                        Color.clear.frame(height: 260).frame(maxWidth: .infinity)
                            .overlay { Image(uiImage: first.1).resizable().scaledToFill() }
                            .clipShape(RoundedRectangle(cornerRadius: Radius.photo, style: .continuous))
                    }
                    .buttonStyle(PressableStyle())
                    .accessibilityLabel(first.2)
                    .accessibilityHint("Opens it full screen, to save, print or share")
                }
                if shots.count > 1 {
                    ScrollView(.horizontal) {
                        HStack(spacing: Space.m) {
                            ForEach(Array(shots.enumerated()).dropFirst(), id: \.element.0) { i, s in
                                Button { viewing = PictureSet(images: shots.map(\.1), titles: shots.map(\.2), index: i) } label: {
                                    Image(uiImage: s.1).resizable().scaledToFill()
                                        .frame(width: 120, height: 120)
                                        .clipShape(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous))
                                }
                                .buttonStyle(PressableStyle())
                                .accessibilityLabel(s.2)
                            }
                        }
                    }
                    .scrollIndicators(.hidden)
                    .scrollClipDisabled()
                }
            }
        }
    }

    @ViewBuilder
    private func picks(_ b: ProjectBasket) -> some View {
        if !b.picks.isEmpty {
            VStack(alignment: .leading, spacing: Space.m) {
                Text("Finishes and looks").eyebrow()
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 100), spacing: Space.m, alignment: .top)], spacing: Space.l) {
                    ForEach(b.picks, id: \.self) { line in
                        let p = BoardPick(line)
                        VStack(alignment: .leading, spacing: Space.xs) {
                            p.swatch
                                .aspectRatio(1, contentMode: .fit)
                                .clipShape(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous))
                                .overlay(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).strokeBorder(Brand.line))
                            Text(p.name).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory).lineLimit(2)
                            Text(p.detail).font(.caption).foregroundStyle(Brand.stone).lineLimit(2)
                        }
                        .contextMenu {
                            if !showingSent {
                                Button(role: .destructive) { model.togglePick(line) } label: { Label("Remove", systemImage: "trash") }
                            }
                        }
                        .accessibilityElement(children: .combine)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func sizes(_ b: ProjectBasket) -> some View {
        let u = model.unit.forText
        if !b.lengths.isEmpty || !b.roomLines.isEmpty {
            VStack(alignment: .leading, spacing: Space.m) {
                Text("Sizes").eyebrow()
                VStack(alignment: .leading, spacing: Space.s) {
                    ForEach(Array(b.lengths.enumerated()), id: \.element.id) { i, l in
                        HStack {
                            Text(l.name.isEmpty ? "Length \(i + 1)" : l.name).foregroundStyle(Brand.ivory)
                            Spacer()
                            Text(u.length(l.meters)).foregroundStyle(Brand.ivory).monospacedDigit().fontWeight(.semibold)
                        }
                        .font(.subheadline)
                    }
                    ForEach(b.roomLines.prefix(4), id: \.self) { Text($0).font(.footnote).foregroundStyle(Brand.stone) }
                }
                .card()
            }
        }
    }

    private var actions: some View {
        VStack(spacing: Space.m) {
            if !showingSent {
                Button { model.tab = .quote } label: { ActionLabel(title: "Send it to Green Cabinets", systemImage: "paperplane") }
                    .primaryActionStyle()
            }
            ActionRow {
                Button { export(.image) } label: { ActionLabel(title: "Save or share", systemImage: "square.and.arrow.up") }
                    .secondaryActionStyle()
                Button { export(.pdf) } label: { ActionLabel(title: "Print", systemImage: "printer") }
                    .secondaryActionStyle()
            }
            .disabled(preparing)
        }
    }

    // MARK: Export

    private enum Format { case image, pdf }

    /// Draws the board as a printable page (US letter), then hands it to the
    /// share sheet: Save Image, Print, Files, Messages, Mail, AirDrop.
    private func export(_ format: Format) {
        guard !preparing else { return }
        preparing = true
        Task { @MainActor in
            let poster = await BoardPoster.make(basket: board, unit: model.unit)
            switch format {
            case .image:
                if let img = poster.image() { Tools.share([img]) }
            case .pdf:
                if let url = poster.pdf() { Tools.share([url]) }
            }
            preparing = false
        }
    }
}

// MARK: - A pick, back to something you can see

/// Turns a line on the request ("Tafisa Cream Puff (TFL: M2034)") back into
/// its swatch: a supplier decor, a wood, a paint or stain, or a work photo.
struct BoardPick {
    let name: String
    let detail: String
    let url: URL?
    let color: Color
    let grain: Bool
    let bundled: UIImage?

    init(_ line: String) {
        if let p = Panel.all.first(where: { $0.requestLine == line }) {
            name = p.name
            detail = ([p.isCountertop ? "Countertop" : nil, p.brand, p.code].compactMap { $0 }).joined(separator: " · ")
            url = p.thumbURL
            color = Color(hex: p.tone ?? (p.hex.isEmpty ? "#D8D4CE" : p.hex))
            grain = !p.hasPhoto && p.isWoodgrain
            bundled = nil
        } else if let f = (HouseColors.paints + HouseColors.stains).first(where: { $0.requestLine == line }) {
            name = f.name; detail = f.detail; url = nil; color = f.color; grain = f.grain; bundled = nil
        } else if let w = WoodSpecies.all.first(where: { Finish.wood($0).requestLine == line }) {
            name = w.name; detail = "Solid wood"; url = nil; color = Color(hex: w.swatch); grain = false
            bundled = UIImage(named: w.image).map(ARTexture.center)
        } else if let photo = Content.photos.first(where: { $0.requestLine == line }) {
            name = photo.title; detail = "A look we built"; url = nil; color = Brand.raised; grain = false
            bundled = UIImage(named: photo.id)
        } else if line.hasPrefix("Paint to match: "), let hex = line.split(separator: " ").first(where: { $0.hasPrefix("#") }) {
            name = "Paint to match"; detail = String(hex); url = nil; color = Color(hex: String(hex)); grain = false; bundled = nil
        } else {
            name = line; detail = ""; url = nil; color = Brand.raised; grain = false; bundled = nil
        }
    }

    var swatch: SwatchImage { SwatchImage(url: url, color: color, grain: grain, px: 360, bundled: bundled) }

    /// The picture for a printed page: fetched if needed, else the color
    @MainActor func picture() async -> UIImage? {
        if let bundled { return bundled }
        if let url { return await SwatchImages.shared.image(url, px: 360) }
        if grain, let g = UIImage(named: "grain") { return ARTexture.tinted(g, UIColor(color)) }
        return nil
    }
}

// MARK: - The printed page

/// The board as one page on drawing paper, in the brand's type, sized for a
/// US letter sheet (and a sharp picture at 2.5x).
struct BoardPoster: View {
    static let page = CGSize(width: 612, height: 792)

    struct Swatch { let name: String; let detail: String; let image: UIImage?; let color: Color }

    let pictures: [UIImage]
    let swatches: [Swatch]
    let sizes: [(String, String)]
    let date: Date

    @MainActor
    static func make(basket b: ProjectBasket, unit: LengthUnit) async -> BoardPoster {
        let pics = b.items.compactMap { UIImage(data: $0.jpeg) }
        var sw: [Swatch] = []
        for line in b.picks.prefix(8) {
            let p = BoardPick(line)
            sw.append(Swatch(name: p.name, detail: p.detail, image: await p.picture(), color: p.color))
        }
        let u = unit.forText
        var sizes = b.lengths.prefix(6).enumerated().map { i, l in (l.name.isEmpty ? "Length \(i + 1)" : l.name, u.length(l.meters)) }
        for line in b.roomLines.prefix(4) {
            let parts = line.split(separator: ":", maxSplits: 1).map { $0.trimmingCharacters(in: .whitespaces) }
            if parts.count == 2 { sizes.append((parts[0], parts[1])) }
        }
        return BoardPoster(pictures: pics, swatches: sw, sizes: sizes, date: .now)
    }

    /// The page as a picture: page width, as tall as it needs, sharp at 2.5x
    @MainActor func image() -> UIImage? {
        let r = ImageRenderer(content: self.frame(width: Self.page.width).fixedSize(horizontal: false, vertical: true))
        r.scale = 2.5
        return r.uiImage
    }

    /// One US letter page, the board scaled down to fit if it runs long.
    @MainActor func pdf() -> URL? {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("Green Cabinets design board.pdf")
        try? FileManager.default.removeItem(at: url)
        let r = ImageRenderer(content: self.frame(width: Self.page.width).fixedSize(horizontal: false, vertical: true))
        var ok = false
        r.render { size, draw in
            var box = CGRect(origin: .zero, size: Self.page)
            guard let ctx = CGContext(url as CFURL, mediaBox: &box, nil) else { return }
            ctx.beginPDFPage(nil)
            ctx.setFillColor(UIColor(Ink.paper).cgColor)
            ctx.fill(box)
            let k = min(1, Self.page.height / size.height)
            ctx.translateBy(x: (Self.page.width - size.width * k) / 2, y: 0)
            ctx.scaleBy(x: k, y: k)
            draw(ctx)
            ctx.endPDFPage()
            ctx.closePDF()
            ok = true
        }
        return ok ? url : nil
    }

    private let inkText = Color(red: 38 / 255, green: 34 / 255, blue: 30 / 255)
    private let soft = Color(red: 112 / 255, green: 104 / 255, blue: 94 / 255)

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .firstTextBaseline) {
                Text("GREEN CABINETS NY").font(.system(size: 9, weight: .semibold)).tracking(2).foregroundStyle(Ink.dim)
                Spacer()
                Text(date.formatted(date: .long, time: .omitted)).font(.system(size: 9)).foregroundStyle(soft)
            }
            Text("Design board").font(.custom("CormorantGaramond-Medium", size: 40)).foregroundStyle(inkText)

            if let hero = pictures.first {
                Color.clear.frame(height: pictures.count > 1 ? 230 : 320)
                    .overlay { Image(uiImage: hero).resizable().scaledToFill() }
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
            if pictures.count > 1 {
                HStack(spacing: 10) {
                    ForEach(Array(pictures.dropFirst().prefix(3).enumerated()), id: \.offset) { _, img in
                        Color.clear.frame(height: 88)
                            .overlay { Image(uiImage: img).resizable().scaledToFill() }
                            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    }
                }
            }

            if !swatches.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("FINISHES AND LOOKS").font(.system(size: 8, weight: .semibold)).tracking(1.6).foregroundStyle(Ink.dim)
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12, alignment: .top), count: 4), alignment: .leading, spacing: 12) {
                        ForEach(Array(swatches.enumerated()), id: \.offset) { _, s in
                            VStack(alignment: .leading, spacing: 4) {
                                Color.clear.frame(height: 48)
                                    .overlay {
                                        if let img = s.image { Image(uiImage: img).resizable().scaledToFill() } else { s.color }
                                    }
                                    .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                                    .overlay(RoundedRectangle(cornerRadius: 6, style: .continuous).strokeBorder(Color.black.opacity(0.08)))
                                Text(s.name).font(.system(size: 9, weight: .semibold)).foregroundStyle(inkText).lineLimit(2)
                                Text(s.detail).font(.system(size: 7.5)).foregroundStyle(soft).lineLimit(2)
                            }
                        }
                    }
                }
            }

            if !sizes.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("SIZES").font(.system(size: 8, weight: .semibold)).tracking(1.6).foregroundStyle(Ink.dim)
                    LazyVGrid(columns: [GridItem(.flexible(), spacing: 24), GridItem(.flexible())], alignment: .leading, spacing: 4) {
                        ForEach(Array(sizes.enumerated()), id: \.offset) { _, s in
                            HStack {
                                Text(s.0).foregroundStyle(soft).lineLimit(1)
                                Spacer(minLength: 6)
                                Text(s.1).foregroundStyle(inkText).fontWeight(.semibold).monospacedDigit()
                            }
                            .font(.system(size: 9))
                        }
                    }
                }
            }

            Spacer(minLength: 0)
            Rectangle().fill(inkText.opacity(0.15)).frame(height: 0.5)
            HStack {
                Text("Designed in Bushwick since 2009").font(.custom("CormorantGaramond-MediumItalic", size: 13)).foregroundStyle(inkText)
                Spacer()
                Text("greencabinetsny.com  ·  \(Content.email)").font(.system(size: 8.5)).foregroundStyle(soft)
            }
        }
        .padding(36)
        .background(Ink.paper)
    }
}

// MARK: - Full-screen pictures

struct PictureSet: Identifiable {
    let id = UUID()
    let images: [UIImage]
    let titles: [String]
    var index: Int
}

/// The person's own pictures, full screen: swipe between them, pinch to look
/// closer, and save, print or share the one on screen.
struct PictureViewer: View {
    @Environment(\.dismiss) private var dismiss
    let set: PictureSet
    @State private var index: Int

    init(set: PictureSet) {
        self.set = set
        _index = State(initialValue: set.index)
    }

    var body: some View {
        NavigationStack {
            TabView(selection: $index) {
                ForEach(set.images.indices, id: \.self) { i in
                    ZoomableUIImage(image: set.images[i])
                        .ignoresSafeArea()
                        .tag(i)
                        .accessibilityElement()
                        .accessibilityLabel(set.titles[i])
                        .accessibilityAddTraits(.isImage)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: set.images.count > 1 ? .automatic : .never))
            .background(Color.black.ignoresSafeArea())
            .navigationTitle(set.titles.indices.contains(index) ? set.titles[index] : "")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.hidden, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Done") { dismiss() } }
                ToolbarItem(placement: .primaryAction) {
                    // Save Image and Print are in the system share sheet
                    ShareLink(item: Image(uiImage: set.images[index]),
                              preview: SharePreview(set.titles[index], image: Image(uiImage: set.images[index])))
                }
            }
        }
    }
}

/// Pinch, double-tap and pan on a picture the person made.
struct ZoomableUIImage: UIViewRepresentable {
    let image: UIImage

    func makeCoordinator() -> ZoomableImage.Coordinator { ZoomableImage.Coordinator() }

    func makeUIView(context: Context) -> UIScrollView {
        let s = UIScrollView()
        s.delegate = context.coordinator
        s.minimumZoomScale = 1
        s.maximumZoomScale = 4
        s.bouncesZoom = true
        s.showsVerticalScrollIndicator = false
        s.showsHorizontalScrollIndicator = false
        s.contentInsetAdjustmentBehavior = .never
        let iv = UIImageView(image: image)
        iv.contentMode = .scaleAspectFit
        s.addSubview(iv)
        context.coordinator.imageView = iv
        let double = UITapGestureRecognizer(target: context.coordinator, action: #selector(ZoomableImage.Coordinator.doubleTap(_:)))
        double.numberOfTapsRequired = 2
        s.addGestureRecognizer(double)
        return s
    }

    func updateUIView(_ s: UIScrollView, context: Context) {
        DispatchQueue.main.async {
            guard let iv = context.coordinator.imageView, s.zoomScale == 1 else { return }
            iv.frame = s.bounds
            s.contentSize = s.bounds.size
        }
    }
}
