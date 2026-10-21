import Foundation
import SwiftUI

/// A real decor from one of our suppliers, the same list as
/// greencabinetsny.com/finishes-colors (Resources/panels.json, exported from
/// the website by ios-native/scripts/export-panels.mjs).
struct Panel: Codable, Identifiable, Hashable {
    let id: String
    let brand: String
    let name: String
    let codes: [String]
    let category: String
    let finish: String
    /// The supplier's own small photo, or empty when we only have a color
    let thumb: String
    let hiRes: String
    /// The color, for decors shown as a color guide
    let hex: String
    /// The decor on the supplier's site
    let link: String

    var supplier: Supplier? { Supplier(rawValue: brand) }
    var thumbURL: URL? { URL(string: thumb.isEmpty ? hiRes : thumb) }
    var photoURL: URL? { URL(string: hiRes.isEmpty ? thumb : hiRes) }
    var linkURL: URL? { link.isEmpty ? nil : URL(string: link) }
    var hasPhoto: Bool { photoURL != nil }
    /// The measured color of the decor (Resources/tones.json), for matching
    var tone: String? { Self.tones[id] }
    var code: String? { codes.first }

    /// Woodgrain decors we only have as a color: drawn with grain in AR
    var isWoodgrain: Bool {
        let woods = ["Oak", "Walnut", "Larch", "Elm", "Maple", "Wood", "Woodgrain", "Cherry"]
        return woods.contains(category) || finish == "Knotted Wood"
    }

    /// Raphael Stone is for countertops, not doors
    var isCountertop: Bool { supplier == .raphael }

    /// One line for the request: "Tafisa Cream Puff (TFL: M2034)", "Countertop: Raphael Stone Montreux (RQZ6118)"
    var requestLine: String {
        (isCountertop ? "Countertop: " : "") + "\(brand) \(name)" + (code.map { " (\($0))" } ?? "")
    }

    static let all: [Panel] = {
        guard let url = Bundle.main.url(forResource: "panels", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let list = try? JSONDecoder().decode([Panel].self, from: data) else { return [] }
        return list
    }()

    static func find(_ id: String) -> Panel? { all.first { $0.id == id } }

    private static let tones: [String: String] = {
        guard let url = Bundle.main.url(forResource: "tones", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let map = try? JSONDecoder().decode([String: String].self, from: data) else { return [:] }
        return map
    }()

    /// As something the AR cabinets can wear
    var arFinish: Finish {
        Finish(id: id, name: name, detail: brand, remote: photoURL, hex: hex.isEmpty ? "#D8D4CE" : hex,
               grain: !hasPhoto && isWoodgrain)
    }
}

/// The suppliers, in the order we use them most.
enum Supplier: String, CaseIterable, Identifiable {
    case tafisa = "Tafisa"
    case shinnoki = "Shinnoki"
    case egger = "Egger"
    case wilsonart = "Wilsonart"
    case agt = "AGT"
    case raphael = "Raphael Stone"

    var id: String { rawValue }

    /// The three we order from most; the rest sit under More.
    static let main: [Supplier] = [.tafisa, .shinnoki, .egger]
    static let more: [Supplier] = [.wilsonart, .agt, .raphael]

    /// What it is, in plain words
    var kind: String {
        switch self {
        case .tafisa: return "Laminate, made in Canada"
        case .shinnoki: return "Real wood veneer, made in Belgium"
        case .egger: return "European laminate"
        case .wilsonart: return "Hard-wearing laminate"
        case .agt: return "Matte and gloss panels"
        case .raphael: return "Stone countertops"
        }
    }

    /// Why someone picks it
    var why: String {
        switch self {
        case .tafisa: return "Tough, easy to clean and the best value. Over 100 colors, woodgrains and textures."
        case .shinnoki: return "Real wood you can feel, prefinished in the factory so every door matches."
        case .egger: return "Soft matte colors and realistic woodgrains, with a velvety feel."
        case .wilsonart: return "Very hard-wearing laminate in solid colors, woods and stone looks."
        case .agt: return "Smooth soft matte or full high gloss, for a modern slab door."
        case .raphael: return "Natural, engineered and printed stone countertops, at $65 per square foot."
        }
    }

    /// Relative cost with us, from our own pricing
    var cost: String {
        switch self {
        case .wilsonart, .tafisa: return "$"
        case .egger, .agt: return "$$"
        case .shinnoki: return "$$$"
        case .raphael: return "$$$$"
        }
    }

    /// A plain price where we have one (countertops are priced by area)
    var price: String? { self == .raphael ? "$65 per square foot" : nil }

    var costWords: String {
        switch cost.count {
        case 1: return "Best value"
        case 2: return "Mid-range"
        case 3: return "Premium"
        default: return "Luxury"
        }
    }

    /// Colors only (no photos): say so plainly
    var colorGuideOnly: Bool { self == .egger || self == .wilsonart || self == .agt }

    var site: URL? {
        switch self {
        case .tafisa: return URL(string: "https://tafisa.ca/en/our-colours")
        case .shinnoki: return URL(string: "https://www.decospan.com/en-us/shinnoki")
        case .egger: return URL(string: "https://www.egger.com/en/furniture-interior-design/?country=US")
        case .wilsonart: return URL(string: "https://www.wilsonart.com/laminate/design-library")
        case .agt: return URL(string: "https://www.agtwood.com/products/panel/panel")
        case .raphael: return URL(string: "https://www.raphaelstoneusa.com/collection/")
        }
    }

    var panels: [Panel] { Panel.all.filter { $0.brand == rawValue } }

    /// What to call its swatches in plain words
    var unit: String { self == .raphael ? "stones" : "colors" }

    /// A few to start with, so nobody faces 117 swatches at once
    var picks: [Panel] {
        let names: [String]
        switch self {
        case .tafisa: names = ["Cream Puff", "Classic White", "Cashmere", "Natural Affinity", "Hardrock Maple", "Dark Chocolate"]
        case .shinnoki: names = ["Ivory Oak", "Milk Oak", "Natural Oak", "Manhattan Oak", "Pure Walnut", "Smoked Walnut"]
        case .egger: names = ["Premium White", "Cashmere Grey", "Natural Davos Oak", "Natural Hamilton Oak", "Natural Aida Walnut", "Soft Black"]
        case .wilsonart: names = ["Designer White", "Calcutta Marble", "Monticello Maple", "Florence Walnut", "Dove Grey", "Black"]
        case .agt: names = ["Antique White", "Sahara Cream", "Victoria Grey", "Olive Green", "Linden", "Tobac"]
        case .raphael: names = []
        }
        let list = panels
        let found = names.compactMap { n in list.first { $0.name == n } }
        return found.isEmpty ? Array(list.prefix(6)) : found
    }

    /// The catalog in groups a person would scan by
    var groups: [(title: String, panels: [Panel])] {
        let list = panels
        let key: (Panel) -> String
        switch self {
        case .tafisa, .shinnoki, .agt: key = { $0.finish }
        case .raphael: key = { $0.category }
        case .egger, .wilsonart: key = Self.family
        }
        var order: [String] = []
        var by: [String: [Panel]] = [:]
        for p in list {
            let k = key(p)
            if by[k] == nil { order.append(k) }
            by[k, default: []].append(p)
        }
        if self == .egger || self == .wilsonart {
            order = ["Solid colors", "Woodgrains", "Stone and concrete"].filter { by[$0] != nil }
        } else {
            order.sort { (by[$0]?.count ?? 0) > (by[$1]?.count ?? 0) }
        }
        return order.map { ($0, by[$0] ?? []) }
    }

    private static func family(_ p: Panel) -> String {
        if p.category == "Stone" || p.category == "Concrete" { return "Stone and concrete" }
        return p.isWoodgrain ? "Woodgrains" : "Solid colors"
    }
}

/// Our house paint colors and stains (no supplier: done for us to our spec),
/// the same as the website's estimator.
enum HouseColors {
    static let paints: [Finish] = [
        .init(id: "paint-pure-white", name: "Pure White", detail: "Painted", hex: "#F9F9F7"),
        .init(id: "paint-off-white", name: "Off White", detail: "Painted", hex: "#F0EBE0"),
        .init(id: "paint-antique-white", name: "Antique White", detail: "Painted", hex: "#EDE3C8"),
        .init(id: "paint-cream", name: "Cream", detail: "Painted", hex: "#FBF4DC"),
        .init(id: "paint-greige", name: "Greige", detail: "Painted", hex: "#C9B9A8"),
        .init(id: "paint-mushroom", name: "Mushroom", detail: "Painted", hex: "#A89880"),
        .init(id: "paint-taupe", name: "Taupe", detail: "Painted", hex: "#B0A090"),
        .init(id: "paint-light-gray", name: "Light Gray", detail: "Painted", hex: "#D5D9E0"),
        .init(id: "paint-blue-gray", name: "Blue Gray", detail: "Painted", hex: "#8FA3B1"),
        .init(id: "paint-slate-gray", name: "Slate Gray", detail: "Painted", hex: "#8A9099"),
        .init(id: "paint-charcoal", name: "Charcoal", detail: "Painted", hex: "#4B5060"),
        .init(id: "paint-matte-black", name: "Matte Black", detail: "Painted", hex: "#242424"),
        .init(id: "paint-navy", name: "Navy Blue", detail: "Painted", hex: "#1E3A5F"),
        .init(id: "paint-sage", name: "Sage Green", detail: "Painted", hex: "#7A9E7A"),
        .init(id: "paint-forest", name: "Forest Green", detail: "Painted", hex: "#3A5A3A"),
        .init(id: "paint-terracotta", name: "Terracotta", detail: "Painted", hex: "#C4714A"),
    ]

    static let stains: [Finish] = [
        .init(id: "stain-whitewash-oak", name: "Whitewash Oak", detail: "Stain", hex: "#E0D4C0", grain: true),
        .init(id: "stain-natural-maple", name: "Natural Maple", detail: "Stain", hex: "#D4A96A", grain: true),
        .init(id: "stain-natural-oak", name: "Natural Oak", detail: "Stain", hex: "#C0925A", grain: true),
        .init(id: "stain-honey-maple", name: "Honey Maple", detail: "Stain", hex: "#C8883A", grain: true),
        .init(id: "stain-light-walnut", name: "Light Walnut", detail: "Stain", hex: "#9A7050", grain: true),
        .init(id: "stain-cherry", name: "Cherry", detail: "Stain", hex: "#8B3A3A", grain: true),
        .init(id: "stain-walnut", name: "Walnut", detail: "Stain", hex: "#6B4226", grain: true),
        .init(id: "stain-dark-walnut", name: "Dark Walnut", detail: "Stain", hex: "#3E240E", grain: true),
        .init(id: "stain-espresso", name: "Espresso", detail: "Stain", hex: "#2E1206", grain: true),
    ]
}

/// The door styles we build, as on the website.
enum DoorStyle: String, CaseIterable, Identifiable {
    case shaker = "Shaker"
    case slimShaker = "Slim Shaker"
    case flat = "Flat Panel"
    case raised = "Raised Panel"

    var id: String { rawValue }

    var detail: String {
        switch self {
        case .shaker: return "Recessed center panel, 2.25 inch frame. Our most popular."
        case .slimShaker: return "The same look with a 1.5 inch frame, cleaner and more modern."
        case .flat: return "A plain slab, for a clean modern kitchen."
        case .raised: return "A traditional raised center panel."
        }
    }
}
