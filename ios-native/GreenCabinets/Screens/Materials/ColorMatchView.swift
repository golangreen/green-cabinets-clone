import SwiftUI
import PhotosUI
import UIKit
import CoreImage

/// Saw a color you love (a magazine, a friend's kitchen, a screenshot)?
/// A photo of it, a tap on the color, and the closest real panels from our
/// suppliers come up, or we paint it that exact color.
struct ColorMatchView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var photo: UIImage?
    @State private var item: PhotosPickerItem?
    @State private var showCamera = false
    /// Where the color is taken, as a fraction of the photo (0...1)
    @State private var spot = CGPoint(x: 0.5, y: 0.5)
    @State private var color: UIColor?
    @State private var matches: [ColorMatch.Result] = []

    var body: some View {
        NavigationStack {
            Group {
                if let photo { matcher(photo) } else { start }
            }
            .background(Brand.ink)
            .navigationTitle("Match a color")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Close") { dismiss() } }
                if photo != nil {
                    ToolbarItem(placement: .primaryAction) {
                        Menu {
                            if UIImagePickerController.isSourceTypeAvailable(.camera) {
                                Button { openCamera() } label: { Label("Take a photo", systemImage: "camera") }
                            }
                            PhotosPicker(selection: $item, matching: .images) { Label("Choose a photo", systemImage: "photo") }
                        } label: { Label("New photo", systemImage: "photo.badge.plus") }
                    }
                }
            }
            .navigationDestination(for: PanelRoute.self) { PanelDetailView(panel: $0.panel) }
            .onChange(of: item) { _, new in load(new) }
            .onAppear {
                if photo == nil, let name = DebugLaunch.value("-matchPhoto") {
                    use(UIImage(named: name))
                    if let xy = DebugLaunch.value("-matchSpot")?.split(separator: ",").compactMap({ Double($0) }), xy.count == 2 {
                        spot = CGPoint(x: xy[0], y: xy[1])
                    }
                }
            }
            .fullScreenCover(isPresented: $showCamera) {
                CameraPicker { img in
                    showCamera = false
                    use(img)
                }
                .ignoresSafeArea()
            }
        }
    }

    // MARK: Start

    private var start: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                Image(systemName: "eyedropper.halffull")
                    .font(.system(size: 44, weight: .light))
                    .foregroundStyle(Brand.brass)
                    .frame(width: 88, height: 88)
                    .background(Brand.brass.opacity(0.12), in: Circle())
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: Space.s) {
                    Text("Saw a color you love?").heroTitle()
                    Text("In a magazine, online or in a friend's kitchen. Take a photo of it and tap the color. We find the closest real panels, or paint it that exact color.")
                        .bodyText().fixedSize(horizontal: false, vertical: true)
                }
                VStack(spacing: Space.m) {
                    if UIImagePickerController.isSourceTypeAvailable(.camera) {
                        Button { openCamera() } label: { ActionLabel(title: "Take a photo", systemImage: "camera") }
                            .primaryActionStyle()
                    }
                    PhotosPicker(selection: $item, matching: .images) {
                        ActionLabel(title: "Choose a photo", systemImage: "photo.on.rectangle")
                    }
                    .secondaryActionStyle()
                }
            }
            .padding(Space.gutter)
        }
        .scrollIndicators(.hidden)
    }

    // MARK: Matching

    private func matcher(_ img: UIImage) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                SamplePhoto(image: img, spot: $spot, color: color)
                    .onChange(of: spot) { sample(img) }

                Label("Drag the circle onto the color you want.", systemImage: "hand.draw")
                    .font(.footnote).foregroundStyle(Brand.stone)

                if let color {
                    VStack(alignment: .leading, spacing: Space.m) {
                        Text("Closest real panels").eyebrow()
                        VStack(spacing: 0) {
                            ForEach(matches) { m in
                                MatchRow(result: m)
                                if m.id != matches.last?.id { Divider().overlay(Brand.line) }
                            }
                        }
                        // Updates follow the finger instantly: dozens a second, nothing to animate
                        .card(padding: Space.l)
                    }

                    paintMatch(color, from: img)

                    Text("Photos shift with the light, so treat this as a starting point. We bring the real samples to compare in your room.")
                        .font(.footnote).foregroundStyle(Brand.stone)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(.horizontal, Space.gutter)
            .padding(.bottom, Space.section)
        }
        .scrollIndicators(.hidden)
        .onAppear { sample(img) }
    }

    /// "We paint it this exact color": the photo goes with the request.
    private func paintMatch(_ c: UIColor, from img: UIImage) -> some View {
        let line = "Paint to match: \(c.hexString) (photo attached)"
        let picked = model.isPicked(line)
        return HStack(spacing: Space.m) {
            RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).fill(Color(uiColor: c))
                .frame(width: 56, height: 56)
                .overlay(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).strokeBorder(Brand.line))
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                Text("Paint it this exact color").font(.headline).foregroundStyle(Brand.ivory)
                Text("We match any color in a satin paint.").font(.footnote).foregroundStyle(Brand.stone)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: Space.s)
            PickButton(picked: picked) {
                if !picked { model.add(images: [img], kind: .photo, title: "Color to match", quiet: true) }
                model.togglePick(line)
            }
        }
        .card(padding: Space.l)
    }

    private func sample(_ img: UIImage) {
        guard let c = ColorMatch.sample(img, at: spot) else { return }
        color = c
        matches = ColorMatch.closest(to: c, count: 6)
    }

    private func openCamera() {
        Tools.withCamera { showCamera = true }
    }

    private func use(_ img: UIImage?) {
        guard let img else { return }
        let ready = img.normalized(maxSide: 1600)
        withAnimation(Motion.ui(reduceMotion)) {
            photo = ready
            spot = CGPoint(x: 0.5, y: 0.5)
        }
        sample(ready)
    }

    private func load(_ item: PhotosPickerItem?) {
        guard let item else { return }
        Task {
            if let d = try? await item.loadTransferable(type: Data.self), let img = UIImage(data: d) {
                await MainActor.run { use(img) }
            }
            await MainActor.run { self.item = nil }
        }
    }
}

/// The photo with a ring you drag onto the color; the ring fills with what it reads.
private struct SamplePhoto: View {
    let image: UIImage
    @Binding var spot: CGPoint
    let color: UIColor?

    var body: some View {
        Image(uiImage: image)
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(maxWidth: .infinity, maxHeight: 440)
            // The ring and the drag live on the picture's own frame, so they line up exactly
            .overlay {
                GeometryReader { g in
                    let s = g.size
                    Circle()
                        .fill(color.map { Color(uiColor: $0) } ?? .clear)
                        .frame(width: 44, height: 44)
                        .overlay(Circle().strokeBorder(Brand.ivory, lineWidth: 3))
                        .overlay(Circle().strokeBorder(Brand.ink.opacity(0.5), lineWidth: 1).padding(3))
                        .shadow(color: .black.opacity(0.4), radius: 6, y: 2)
                        .position(x: spot.x * s.width, y: spot.y * s.height)
                        .accessibilityHidden(true)
                    Color.clear
                        .contentShape(Rectangle())
                        .gesture(
                            DragGesture(minimumDistance: 0)
                                .onChanged { v in
                                    spot = CGPoint(x: min(1, max(0, v.location.x / s.width)), y: min(1, max(0, v.location.y / s.height)))
                                }
                        )
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: Radius.photo, style: .continuous))
            .frame(maxWidth: .infinity)
            .accessibilityElement()
            .accessibilityLabel("Your photo")
            .accessibilityValue(color.map { "Color picked, \($0.hexString)" } ?? "")
            .accessibilityAdjustableAction { dir in
                // Without dragging: step the sample spot across the photo
                let step: CGFloat = 0.1
                var x = spot.x + (dir == .increment ? step : -step)
                var y = spot.y
                if x > 1 { x = 0; y = min(1, y + step) }
                if x < 0 { x = 1; y = max(0, y - step) }
                spot = CGPoint(x: x, y: y)
            }
    }
}

/// One close panel: swatch, name, how close, and add to quote.
private struct MatchRow: View {
    @Environment(AppModel.self) private var model
    let result: ColorMatch.Result

    var body: some View {
        let p = result.panel
        let picked = model.isPicked(p.requestLine)
        HStack(spacing: Space.m) {
            NavigationLink(value: PanelRoute(panel: p, from: "match")) {
                HStack(spacing: Space.m) {
                    p.swatch(px: 180)
                        .frame(width: 56, height: 56)
                        .clipShape(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).strokeBorder(Brand.line))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(p.name).font(.headline).foregroundStyle(Brand.ivory).lineLimit(1)
                        Text([p.brand, p.code].compactMap { $0 }.joined(separator: " · ")).font(.footnote).foregroundStyle(Brand.stone).lineLimit(1)
                        Text(result.closeness).font(.caption.weight(.semibold)).foregroundStyle(Brand.brass)
                    }
                    Spacer(minLength: Space.s)
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(PressableStyle(scale: 0.99))
            .accessibilityElement(children: .combine)
            PickButton(picked: picked) { model.togglePick(p.requestLine) }
        }
        .padding(.vertical, Space.s)
    }
}

/// Add to quote, as a round button: plus, or a brass check once added.
struct PickButton: View {
    let picked: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: picked ? "checkmark.circle.fill" : "plus.circle")
                .font(.title2)
                .foregroundStyle(picked ? Brand.brass : Brand.ivory.opacity(0.85))
                .contentTransition(.symbolEffect(.replace))
                .frame(width: 44, height: 44)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(picked ? "Remove from quote" : "Add to quote")
    }
}

// MARK: - The matching

enum ColorMatch {
    struct Result: Identifiable, Equatable {
        let panel: Panel
        let distance: Double
        var id: String { panel.id }
        var closeness: String {
            switch distance {
            case ..<6: return "Very close"
            case ..<12: return "Close"
            default: return "Similar"
            }
        }
    }

    /// Every cabinet decor's color, worked out once (stone slabs are for counters, and too patterned to match by color)
    private static let catalog: [(panel: Panel, lab: Lab)] = Panel.all.compactMap { p in
        guard p.supplier != .raphael else { return nil }
        return p.tone.map { (p, Lab(UIColor(hex: $0))) }
    }

    private static let context = CIContext(options: [.workingColorSpace: CGColorSpace(name: CGColorSpace.sRGB) as Any])

    /// The average color in a small patch around a spot of the photo.
    static func sample(_ img: UIImage, at spot: CGPoint) -> UIColor? {
        guard let cg = img.cgImage else { return nil }
        let ci = CIImage(cgImage: cg)
        let w = ci.extent.width, h = ci.extent.height
        let r = max(4, min(w, h) * 0.02)
        // Core Image counts y from the bottom
        let c = CGPoint(x: spot.x * w, y: (1 - spot.y) * h)
        let patch = CGRect(x: c.x - r, y: c.y - r, width: 2 * r, height: 2 * r).intersection(ci.extent)
        guard !patch.isEmpty else { return nil }
        let avg = ci.applyingFilter("CIAreaAverage", parameters: [kCIInputExtentKey: CIVector(cgRect: patch)])
        var px = [UInt8](repeating: 0, count: 4)
        context.render(avg, toBitmap: &px, rowBytes: 4, bounds: CGRect(x: avg.extent.minX, y: avg.extent.minY, width: 1, height: 1),
                       format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB))
        return UIColor(red: CGFloat(px[0]) / 255, green: CGFloat(px[1]) / 255, blue: CGFloat(px[2]) / 255, alpha: 1)
    }

    /// The panels nearest in color, as the eye sees it (CIE Lab distance).
    static func closest(to c: UIColor, count: Int) -> [Result] {
        let target = Lab(c)
        return catalog.map { Result(panel: $0.panel, distance: target.distance(to: $0.lab)) }
            .sorted { $0.distance < $1.distance }
        .prefix(count)
        .map { $0 }
    }

    /// CIE L*a*b*, D65
    struct Lab {
        let l: Double, a: Double, b: Double

        init(_ color: UIColor) {
            var r: CGFloat = 0, g: CGFloat = 0, bl: CGFloat = 0, al: CGFloat = 0
            color.getRed(&r, green: &g, blue: &bl, alpha: &al)
            func lin(_ v: CGFloat) -> Double { let x = Double(v); return x <= 0.04045 ? x / 12.92 : pow((x + 0.055) / 1.055, 2.4) }
            let R = lin(r), G = lin(g), B = lin(bl)
            let X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047
            let Y = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 1.0
            let Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883
            func f(_ t: Double) -> Double { t > 0.008856 ? cbrt(t) : 7.787 * t + 16.0 / 116.0 }
            l = 116 * f(Y) - 16
            a = 500 * (f(X) - f(Y))
            b = 200 * (f(Y) - f(Z))
        }

        /// Lightness counts half: light in a photo shifts brightness far more
        /// than it shifts hue, and hue is what people mean by "this color"
        func distance(to o: Lab) -> Double {
            let dl = (l - o.l) * 0.5
            return (dl * dl + (a - o.a) * (a - o.a) + (b - o.b) * (b - o.b)).squareRoot()
        }
    }
}

extension UIColor {
    var hexString: String {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        getRed(&r, green: &g, blue: &b, alpha: &a)
        return String(format: "#%02X%02X%02X", Int((r * 255).rounded()), Int((g * 255).rounded()), Int((b * 255).rounded()))
    }
}

extension UIImage {
    /// Upright and no larger than maxSide, so pixels match what's on screen.
    func normalized(maxSide: CGFloat) -> UIImage {
        let k = min(1, maxSide / max(size.width, size.height))
        let target = CGSize(width: (size.width * k).rounded(), height: (size.height * k).rounded())
        let fmt = UIGraphicsImageRendererFormat()
        fmt.scale = 1
        return UIGraphicsImageRenderer(size: target, format: fmt).image { _ in draw(in: CGRect(origin: .zero, size: target)) }
    }
}

/// The system camera, for a single photo.
struct CameraPicker: UIViewControllerRepresentable {
    let done: (UIImage?) -> Void

    func makeCoordinator() -> Coordinator { Coordinator(done: done) }

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let vc = UIImagePickerController()
        vc.sourceType = .camera
        vc.delegate = context.coordinator
        return vc
    }

    func updateUIViewController(_ vc: UIImagePickerController, context: Context) {}

    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let done: (UIImage?) -> Void
        init(done: @escaping (UIImage?) -> Void) { self.done = done }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            // The cover closes through its binding, in done
            done(info[.originalImage] as? UIImage)
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            done(nil)
        }
    }
}
