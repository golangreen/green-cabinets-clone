import Foundation

/// What the app shows about Green Cabinets: the same facts, prices and photos
/// as greencabinetsny.com, kept here so the app works offline.

enum WorkCategory: String, CaseIterable, Identifiable {
    case kitchens = "Kitchens"
    case baths = "Bathrooms"
    case closets = "Closets & built-ins"
    var id: String { rawValue }
}

struct WorkPhoto: Identifiable, Hashable {
    /// The asset name
    let id: String
    let title: String
    let category: WorkCategory
}

struct PriceTier: Identifiable {
    var id: String { name }
    let name: String
    let size: String
    let range: String
    let note: String
}

struct Step: Identifiable {
    var id: String { title }
    let title: String
    let text: String
    let image: String
}

struct Point: Identifiable {
    var id: String { title }
    let title: String
    let text: String
    let symbol: String
}

struct FAQ: Identifiable {
    var id: String { question }
    let question: String
    let answer: String
}

enum Content {
    static let hero = "photo-modern-kitchen-island-bar-stools"

    static let photos: [WorkPhoto] = [
        .init(id: "photo-modern-kitchen-island-bar-stools", title: "White oak with a marble waterfall island", category: .kitchens),
        .init(id: "photo-natural-wood-kitchen-marble", title: "Natural oak with a marble backsplash", category: .kitchens),
        .init(id: "photo-green-kitchen-marble-island", title: "Painted green with brass hardware", category: .kitchens),
        .init(id: "photo-loft-kitchen-exposed-brick-natural-wood", title: "Natural wood against exposed brick", category: .kitchens),
        .init(id: "photo-marble-wood-kitchen-island", title: "Marble waterfall island and wood cabinetry", category: .kitchens),
        .init(id: "photo-natural-wood-galley-kitchen", title: "A natural wood galley", category: .kitchens),
        .init(id: "photo-luxury-kitchen-marble-dining", title: "Marble island beside the dining table", category: .kitchens),
        .init(id: "photo-wood-kitchen-outdoor-access", title: "Oak kitchen opening onto a terrace", category: .kitchens),
        .init(id: "photo-natural-wood-open-concept-kitchen", title: "An open plan oak kitchen", category: .kitchens),
        .init(id: "photo-modern-kitchen-island-glass-pendants", title: "Wood island under glass pendants", category: .kitchens),
        .init(id: "photo-natural-wood-kitchen-white-countertops", title: "Tall oak cabinets, white counters", category: .kitchens),
        .init(id: "photo-modern-white-kitchen-pendants", title: "White kitchen with globe pendants", category: .kitchens),
        .init(id: "photo-modern-bathroom-marble-vanity", title: "Floating vanity in a marble bath", category: .baths),
        .init(id: "photo-luxury-marble-bathroom-shower", title: "Wood vanity beside a marble shower", category: .baths),
        .init(id: "photo-marble-bathroom-outdoor-access", title: "Marble bath with a wood vanity", category: .baths),
        .init(id: "photo-modern-bathroom-wood-marble", title: "Floating wood cabinets, marble top", category: .baths),
        .init(id: "photo-modern-bathroom-floating-wood-vanity", title: "A floating oak vanity", category: .baths),
        .init(id: "photo-contemporary-bathroom-mixed-marble", title: "Floating wood vanity, mixed marble", category: .baths),
        .init(id: "photo-contemporary-powder-room-wood", title: "Powder room in wood and marble", category: .baths),
        .init(id: "photo-modern-powder-room-marble", title: "Powder room with a marble counter", category: .baths),
        .init(id: "photo-luxury-walk-in-closet-integrated-lighting", title: "Walk-in closet with lit shelves", category: .closets),
        .init(id: "photo-dark-walk-in-closet-center-island", title: "Walk-in closet with a center island", category: .closets),
        .init(id: "photo-natural-wood-hallway-cabinets", title: "Hallway built-ins in natural wood", category: .closets),
        .init(id: "photo-modern-workspace-wood-desk-brick", title: "A desk wall in a brick loft", category: .closets),
    ]

    static let steps: [Step] = [
        .init(title: "Measured at home",
              text: "We come to you with door and finish samples, measure every wall and talk through how you cook, store and live.",
              image: "story-door-samples-measure"),
        .init(title: "Drawn and approved",
              text: "Every wall, window and outlet goes into the drawing. You sign off on layout, materials and hardware before anything is cut.",
              image: "story-galley-kitchen-drawing"),
        .init(title: "Built to spec",
              text: "Boxes and doors cut by our vetted millwork suppliers to our specifications, with Blum and Hettich hardware and low-VOC finishes.",
              image: "story-oak-edge-brass-pull"),
        .init(title: "Installed in days",
              text: "Most installs take 3 to 7 days. In New York the building sets the schedule, so we plan around it from the first visit.",
              image: "photo-design-reality-kitchen-1"),
    ]

    static let tiers: [PriceTier] = [
        .init(name: "Small kitchen", size: "10 to 14 linear feet", range: "$4,200 to $6,500",
              note: "A co-op galley or a garden-floor rental. Painted shaker, soft-close hinges and slides, standard hardware."),
        .init(name: "Standard kitchen", size: "16 to 22 linear feet", range: "$6,000 to $9,500",
              note: "L-shape or U-shape with a peninsula. Two-tone paint, or paint with wood veneer."),
        .init(name: "Brownstone gut", size: "26 to 36 linear feet", range: "$12,000 to $20,000+",
              note: "Full-height pantry walls, an island with seating, appliance panels, specialty finishes and integrated pulls."),
    ]

    static let rates: [(value: String, label: String)] = [
        ("$350", "per linear foot, full kitchen"),
        ("$225", "per linear foot, base only"),
        ("$125", "per linear foot, wall only"),
    ]

    static let buildings: [Point] = [
        .init(title: "Paperwork", text: "COIs naming the building, agent and board, usually within 48 hours, plus alteration agreements.", symbol: "doc.text"),
        .init(title: "Freight elevator", text: "Reserved with your super or managing agent before delivery day, with wall and floor protection.", symbol: "arrow.up.arrow.down.square"),
        .init(title: "Quiet hours", text: "Loud work only in permitted hours. Quiet finish work fills the rest.", symbol: "speaker.wave.1"),
        .init(title: "Sized for the stairs", text: "In walk-ups and brownstones, boxes are sized to clear the stoop, the stair turn and the door.", symbol: "stairs"),
    ]

    static let faqs: [FAQ] = [
        .init(question: "How long does a kitchen take?",
              answer: "Most projects take 4 to 6 weeks from approved drawings to install: about 2 weeks of design and material choices, 2 to 3 weeks of fabrication, and 3 to 7 days of installation."),
        .init(question: "Do you build shaker and slim shaker doors?",
              answer: "Yes. Classic shaker has a wider 2.25 inch frame; slim shaker uses a narrower frame of about 1.5 inches for a cleaner, more modern look. Both come painted, stained or in natural wood."),
        .init(question: "Do you do bathroom vanities and closets too?",
              answer: "Yes. Vanities, walk-in closets and built-ins, often designed together with the kitchen so finishes and hardware match across the home."),
        .init(question: "Can you handle my co-op or condo board?",
              answer: "Yes. We carry general liability, workers' comp and umbrella coverage and issue building-specific COIs, usually within 48 hours, plus alteration agreements and registrations."),
        .init(question: "Do you have a showroom?",
              answer: "No. We work by appointment. The free consultation comes to you: we bring door and finish samples to your home and measure the room in person."),
        .init(question: "Where do you work?",
              answer: "Throughout Brooklyn, Manhattan and Queens, plus the wider New York area."),
    ]

    /// "Text us" goes here. Only the message sheet uses it; no screen shows it.
    static let textNumber = "+17188045488"
    static let email = "orders@greencabinetsny.com"
    /// Goes with a shared photo
    static let shareLine = "Custom cabinetry by Green Cabinets NY. greencabinetsny.com"
}
