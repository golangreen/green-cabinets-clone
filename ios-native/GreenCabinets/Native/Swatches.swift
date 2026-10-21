import SwiftUI
import UIKit
import ImageIO

/// Supplier photos load from the supplier's own site, as on the website, and
/// stay cached on the phone so a catalog opens instantly the second time.
/// Every photo is shrunk while it is read (some are 7200 px square), never
/// decoded at full size.
@MainActor
final class SwatchImages {
    static let shared = SwatchImages()

    private let memory: NSCache<NSString, UIImage> = {
        let c = NSCache<NSString, UIImage>()
        c.totalCostLimit = 60 << 20
        return c
    }()
    private var loading: [String: Task<UIImage?, Never>] = [:]
    private let session: URLSession = {
        let c = URLSessionConfiguration.default
        c.urlCache = URLCache(memoryCapacity: 4 << 20, diskCapacity: 300 << 20)
        c.requestCachePolicy = .returnCacheDataElseLoad
        c.timeoutIntervalForRequest = 25
        return URLSession(configuration: c)
    }()

    private func key(_ url: URL, _ px: Int) -> String { "\(px)|\(url.absoluteString)" }

    func cached(_ url: URL, px: Int) -> UIImage? { memory.object(forKey: key(url, px) as NSString) }

    /// The photo at most `px` pixels on its long side.
    func image(_ url: URL, px: Int) async -> UIImage? {
        let k = key(url, px)
        if let img = memory.object(forKey: k as NSString) { return img }
        if let t = loading[k] { return await t.value }
        let session = self.session
        let t = Task<UIImage?, Never> {
            guard let (data, resp) = try? await session.data(from: url) else { return nil }
            if let http = resp as? HTTPURLResponse, !(200..<300).contains(http.statusCode) { return nil }
            return await Self.downsample(data, px: px)
        }
        loading[k] = t
        let img = await t.value
        loading[k] = nil
        if let img, let cg = img.cgImage {
            memory.setObject(img, forKey: k as NSString, cost: cg.bytesPerRow * cg.height)
        }
        return img
    }

    /// Read straight to the shown size, off the main thread.
    nonisolated private static func downsample(_ data: Data, px: Int) async -> UIImage? {
        guard let src = CGImageSourceCreateWithData(data as CFData, [kCGImageSourceShouldCache: false] as CFDictionary) else { return nil }
        let opts: [CFString: Any] = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceThumbnailMaxPixelSize: px,
        ]
        guard let cg = CGImageSourceCreateThumbnailAtIndex(src, 0, opts as CFDictionary) else { return nil }
        return UIImage(cgImage: cg)
    }

    /// The AR camera's default decors, fetched quietly so they're ready.
    func warmAR() {
        for f in Finish.arDefault {
            guard let url = f.remote else { continue }
            Task { _ = await image(url, px: ARTexture.px) }
        }
    }
}

/// A supplier swatch: the photo when there is one (fading in once), else the
/// color, drawn as wood for woodgrain decors we only have as a color.
struct SwatchImage: View {
    let url: URL?
    let color: Color
    var grain = false
    var px = 400
    @State private var image: UIImage?

    /// `bundled` is a photo that ships with the app, shown as is
    init(url: URL?, color: Color, grain: Bool = false, px: Int = 400, bundled: UIImage? = nil) {
        self.url = url
        self.color = color
        self.grain = grain
        self.px = px
        _image = State(initialValue: bundled ?? url.flatMap { SwatchImages.shared.cached($0, px: px) })
    }

    var body: some View {
        Color.clear
            .overlay {
                if let image {
                    Image(uiImage: image).resizable().scaledToFill()
                        .transition(.opacity)
                } else {
                    color.overlay {
                        if grain {
                            Image("grain").resizable().scaledToFill().blendMode(.multiply).opacity(0.7)
                        }
                    }
                }
            }
            .clipped()
            .task(id: url) {
                guard image == nil, let url else { return }
                let img = await SwatchImages.shared.image(url, px: px)
                withAnimation(.easeOut(duration: 0.18)) { image = img }
            }
    }
}

extension Panel {
    /// How this panel looks in a grid or a header
    func swatch(px: Int = 400, large: Bool = false) -> SwatchImage {
        SwatchImage(url: large ? photoURL : thumbURL, color: hex.isEmpty ? Brand.raised : Color(hex: hex),
                    grain: !hasPhoto && isWoodgrain, px: px)
    }
}

extension Finish {
    func swatch(px: Int = 400) -> SwatchImage {
        // Bundled photos show cropped the same way the AR doors wear them
        let bundled = texture.flatMap { UIImage(named: $0) }.map { cropCenter ? ARTexture.center($0) : $0 }
        return SwatchImage(url: remote, color: color, grain: grain, px: px, bundled: bundled)
    }
}

/// What a cabinet door wears in AR, from any finish.
@MainActor
enum ARTexture {
    /// Door textures don't need more than this
    static let px = 1024

    /// The picture for this finish, or nil for a flat color
    static func image(for f: Finish) -> UIImage? {
        if let url = f.remote, let img = SwatchImages.shared.cached(url, px: px) { return img }
        if let t = f.texture, let img = UIImage(named: t) { return f.cropCenter ? center(img) : img }
        if f.grain, let g = UIImage(named: "grain") { return tinted(g, UIColor(hex: f.hex)) }
        return nil
    }

    /// Ready to show: bundled, a color, or already fetched
    static func isReady(_ f: Finish) -> Bool {
        guard let url = f.remote else { return true }
        return SwatchImages.shared.cached(url, px: px) != nil
    }

    /// The middle of a slab photo: grain only, no bark or bench
    nonisolated static func center(_ img: UIImage) -> UIImage {
        guard let cg = img.cgImage else { return img }
        let w = CGFloat(cg.width), h = CGFloat(cg.height)
        let r = CGRect(x: w * 0.36, y: h * 0.2, width: w * 0.28, height: h * 0.56).integral
        return cg.cropping(to: r).map { UIImage(cgImage: $0) } ?? img
    }

    /// A small square from the middle, for the round finish chips
    static func chip(_ img: UIImage) -> UIImage {
        guard let cg = img.cgImage else { return img }
        let side = min(cg.width, cg.height)
        let r = CGRect(x: (cg.width - side) / 2, y: (cg.height - side) / 2, width: side, height: side)
        guard let sq = cg.cropping(to: r) else { return img }
        let fmt = UIGraphicsImageRendererFormat()
        fmt.scale = 1
        let out = CGSize(width: 132, height: 132)
        return UIGraphicsImageRenderer(size: out, format: fmt).image { _ in UIImage(cgImage: sq).draw(in: CGRect(origin: .zero, size: out)) }
    }

    /// Grain lines multiplied over a color
    static func tinted(_ grain: UIImage, _ color: UIColor) -> UIImage {
        let fmt = UIGraphicsImageRendererFormat()
        fmt.scale = 1
        let size = grain.size
        return UIGraphicsImageRenderer(size: size, format: fmt).image { ctx in
            color.setFill()
            ctx.fill(CGRect(origin: .zero, size: size))
            grain.draw(in: CGRect(origin: .zero, size: size), blendMode: .multiply, alpha: 0.7)
        }
    }
}
