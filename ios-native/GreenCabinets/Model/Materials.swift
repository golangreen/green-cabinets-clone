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

/// Anything a cabinet door can be: a wood or panel sample photo, or a paint color.
struct Finish: Identifiable, Hashable {
    let id: String
    let name: String
    let detail: String
    /// Asset name of the sample photo, or nil for paint
    let texture: String?
    /// Paint color as hex, or the average tone of a texture
    let hex: String

    var color: Color { Color(hex: hex) }

    static let paints: [Finish] = [
        .init(id: "paint-white", name: "Painted white", detail: "Satin paint, soft white", texture: nil, hex: "#EEEBE3"),
        .init(id: "paint-sage", name: "Sage green", detail: "Satin paint", texture: nil, hex: "#7F8C77"),
        .init(id: "paint-grey", name: "Light grey", detail: "Satin paint", texture: nil, hex: "#B9B7B1"),
        .init(id: "paint-navy", name: "Navy", detail: "Satin paint", texture: nil, hex: "#2F3A4A"),
        .init(id: "paint-black", name: "Black", detail: "Satin paint", texture: nil, hex: "#1E1D1C"),
    ]

    static let panels: [Finish] = [
        .init(id: "egger-white-oak", name: "White oak", detail: "Egger panel", texture: "finish-egger-white-oak", hex: "#C9A877"),
        .init(id: "egger-walnut", name: "Walnut", detail: "Egger panel", texture: "finish-egger-walnut", hex: "#5B3A29"),
        .init(id: "egger-casella-oak", name: "Casella oak", detail: "Egger panel", texture: "finish-egger-casella-oak", hex: "#B08A5E"),
        .init(id: "tafisa-cream-puff", name: "Cream Puff", detail: "Tafisa panel", texture: "finish-tafisa-cream-puff", hex: "#E9E1D2"),
        .init(id: "tafisa-white", name: "White", detail: "Tafisa panel", texture: "finish-tafisa-white", hex: "#F1F0EC"),
    ]

    /// What the AR camera offers, in order
    static let arDefault: [Finish] = [paints[0]] + panels.prefix(3) + paints[1...]

    static func wood(_ w: WoodSpecies) -> Finish {
        Finish(id: "wood-\(w.slug)", name: w.name, detail: "Solid wood", texture: w.image, hex: w.swatch)
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
