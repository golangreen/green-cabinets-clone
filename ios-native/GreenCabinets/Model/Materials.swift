import Foundation
import SwiftUI

/// The 14 hardwoods from greencabinetsny.com/wood-species (Resources/wood.json).
struct WoodSpecies: Codable, Identifiable, Hashable {
    let slug: String
    let name: String
    let tagline: String
    let short: String
    let janka: Int
    let cost: String
    let color: String
    let grain: String
    let stability: Int
    let stain: String
    let pros: [String]
    let cons: [String]
    let finishes: [String]
    let doors: [String]
    let swatch: String
    let image: String
    var id: String { slug }

    static let all: [WoodSpecies] = {
        guard let url = Bundle.main.url(forResource: "wood", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let list = try? JSONDecoder().decode([WoodSpecies].self, from: data) else { return [] }
        return list
    }()

    static let hardest = 1820

    var costWords: String {
        switch cost.count {
        case 1: return "Budget"
        case 2: return "Moderate"
        case 3: return "Premium"
        default: return "Luxury"
        }
    }
}

/// Anything a cabinet door can be: a supplier decor, a wood, a paint or a stain.
struct Finish: Identifiable, Hashable {
    let id: String
    let name: String
    let detail: String
    /// Bundled photo of the material
    var texture: String? = nil
    /// The supplier's own photo, fetched when needed
    var remote: URL? = nil
    /// Paint color, or the tone of a decor we only have as a color
    let hex: String
    /// Draw the color as wood: grain tinted to `hex`
    var grain = false
    /// Only the middle of the photo is the material (a slab on a bench)
    var cropCenter = false

    var color: Color { Color(hex: hex) }

    static func wood(_ w: WoodSpecies) -> Finish {
        Finish(id: "wood-\(w.slug)", name: w.name, detail: "Solid wood", texture: w.image, hex: w.swatch, cropCenter: true)
    }

    /// What the AR camera offers: our most used decors and paints
    static var arDefault: [Finish] {
        let ids = ["tafisa-cream-puff", "shinnoki-s4-ivory-oak", "egger-h3331-st10", "tafisa-natural-affinity", "shinnoki-s4-pure-walnut"]
        let panels = ids.compactMap { Panel.find($0)?.arFinish }
        let paints = ["paint-pure-white", "paint-sage", "paint-navy", "paint-matte-black"].compactMap { id in HouseColors.paints.first { $0.id == id } }
        return [paints[0]] + panels + paints.dropFirst()
    }

    /// The AR list with this finish first (so "See it in your room" opens wearing it).
    static func arList(startingWith f: Finish?) -> [Finish] {
        guard let f else { return arDefault }
        return [f] + arDefault.filter { $0.id != f.id }
    }
}

extension Color {
    init(hex: String) {
        var s = hex.trimmingCharacters(in: .whitespaces)
        if s.hasPrefix("#") { s.removeFirst() }
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        self.init(red: Double((v >> 16) & 0xff) / 255, green: Double((v >> 8) & 0xff) / 255, blue: Double(v & 0xff) / 255)
    }
}
