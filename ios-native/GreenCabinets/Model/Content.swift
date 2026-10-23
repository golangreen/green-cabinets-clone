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
    /// The kitchens this tier covers, in linear feet of cabinets
    let feet: ClosedRange<Double>
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
        .init(id: "photo-light-wood-kitchen-marble-peninsula-front", title: "Light wood, white uppers, marble peninsula", category: .kitchens),
        .init(id: "photo-modern-kitchen-island-bar-stools", title: "White oak with a marble waterfall island", category: .kitchens),
        .init(id: "photo-natural-wood-kitchen-marble", title: "Natural oak with a marble backsplash", category: .kitchens),
        .init(id: "photo-light-wood-u-kitchen-marble-peninsula-stools", title: "A light wood U with a marble peninsula", category: .kitchens),
        .init(id: "photo-green-kitchen-marble-island", title: "Painted green with brass hardware", category: .kitchens),
        .init(id: "photo-loft-kitchen-exposed-brick-natural-wood", title: "Natural wood against exposed brick", category: .kitchens),
        .init(id: "photo-marble-wood-kitchen-island", title: "Marble waterfall island and wood cabinetry", category: .kitchens),
        .init(id: "photo-natural-wood-galley-kitchen", title: "A natural wood galley", category: .kitchens),
        .init(id: "photo-luxury-kitchen-marble-dining", title: "Marble island beside the dining table", category: .kitchens),
        .init(id: "photo-wood-kitchen-outdoor-access", title: "Oak kitchen opening onto a terrace", category: .kitchens),
        .init(id: "photo-natural-wood-open-concept-kitchen", title: "An open plan oak kitchen", category: .kitchens),
        .init(id: "photo-modern-kitchen-island-glass-pendants", title: "Wood island under glass pendants", category: .kitchens),
        .init(id: "photo-natural-wood-kitchen-white-countertops", title: "Tall oak cabinets, white counters", category: .kitchens),
        .init(id: "photo-wood-peninsula-white-tall-cabinets-kitchen", title: "Wood peninsula, white tall cabinets", category: .kitchens),
        .init(id: "photo-open-kitchen-dining-wood-peninsula-stools", title: "Open kitchen beside the dining room", category: .kitchens),
        .init(id: "photo-wood-kitchen-peninsula-dining-room", title: "Wood peninsula with bar seating", category: .kitchens),
        .init(id: "photo-open-kitchen-dining-wood-panel-fridge", title: "White and wood, with a paneled fridge", category: .kitchens),
        .init(id: "photo-dining-room-white-wood-kitchen-pendants", title: "The kitchen from the dining table", category: .kitchens),
        .init(id: "photo-modern-white-kitchen-pendants", title: "White kitchen with globe pendants", category: .kitchens),
        .init(id: "photo-powder-room-wood-vanity-green-marble", title: "Powder room in wood and green marble", category: .baths),
        .init(id: "photo-bathroom-wood-double-vanity-glass-shower", title: "Wood double vanity, glass shower", category: .baths),
        .init(id: "photo-bathroom-floating-wood-vanity-marble-tub", title: "Floating wood vanity, marble tub", category: .baths),
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
              text: "Boxes and doors cut to our specifications by our vetted millwork suppliers, in Tafisa, Shinnoki and Egger panels, with Blum and Hettich hardware.",
              image: "story-oak-edge-brass-pull"),
        .init(title: "Installed in days",
              text: "Most installs take 3 to 7 days. In New York the building sets the schedule, so we plan around it from the first visit.",
              image: "photo-design-reality-kitchen-1"),
    ]

    static let tiers: [PriceTier] = [
        .init(name: "Small kitchen", size: "10 to 14 linear feet", range: "$4,200 to $6,500",
              note: "A co-op galley or a garden-floor rental. Painted shaker, soft-close hinges and slides, standard hardware.",
              feet: 0...15),
        .init(name: "Standard kitchen", size: "16 to 22 linear feet", range: "$6,000 to $9,500",
              note: "L-shape or U-shape with a peninsula. Two-tone paint, or paint with wood veneer.",
              feet: 15...24),
        .init(name: "Brownstone gut", size: "26 to 36 linear feet", range: "$12,000 to $20,000+",
              note: "Full-height pantry walls, an island with seating, appliance panels, specialty finishes and integrated pulls.",
              feet: 24...1000),
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

    /// The questions from greencabinetsny.com, in plain words.
    static let faqs: [FAQ] = [
        .init(question: "What makes your cabinets different?",
              answer: "Every project starts with a free visit at your home. We design every kitchen ourselves, from classic shaker and slim shaker to flat panel, and our vetted millwork suppliers build it to our specifications with FSC-certified hardwoods, low-VOC finishes and European hardware. It fits your room exactly."),
        .init(question: "How much do custom cabinets cost?",
              answer: "$350 per linear foot for full kitchens and vanities, $225 per foot for base cabinets and $125 per foot for wall cabinets. A typical NYC kitchen runs $8,000 to $25,000 or more, depending on size, materials and finishes."),
        .init(question: "How long does a kitchen take?",
              answer: "Most projects take 4 to 6 weeks from approved drawings to install: 1 to 2 weeks of design and material choices, 2 to 3 weeks of fabrication, and 3 to 7 days of installation."),
        .init(question: "Which materials do you use?",
              answer: "Our panels and veneers come mostly from Tafisa, Shinnoki and Egger. Solid hardwoods like white oak, walnut, maple and cherry are FSC-certified, plywood cores are formaldehyde-free, hardware is Blum and Hettich, and finishes are low-VOC."),
        .init(question: "Do you build shaker and slim shaker doors?",
              answer: "Yes. Classic shaker has a 2.25 inch frame; slim shaker uses a narrower frame of about 1.5 inches for a cleaner, more modern look. We also build flat panel and raised panel doors, painted, stained or in natural wood."),
        .init(question: "Do you do bathroom vanities and closets too?",
              answer: "Yes. Vanities, walk-in closets and built-ins, often designed together with the kitchen so finishes and hardware match across the home."),
        .init(question: "Can you handle my co-op or condo board?",
              answer: "Yes. We carry general liability, workers' comp and umbrella coverage and issue building-specific COIs naming the building, managing agent and board, usually within 48 hours, plus alteration agreements and registrations."),
        .init(question: "How do you handle noise rules and the freight elevator?",
              answer: "Loud work happens only in your building's permitted hours, usually 9 AM to 5 PM on weekdays. We book the freight elevator with your super or managing agent, and do quiet finish work outside loud-work hours."),
        .init(question: "Do you have a showroom?",
              answer: "No. We work by appointment. The free consultation comes to you: we bring door and finish samples to your home and measure the room in person."),
        .init(question: "Do you work with architects and designers?",
              answer: "Yes. We design, specify and install for homeowners, architects, designers and developers, with shop drawings for approval and commercial millwork for buildings and businesses."),
        .init(question: "Where do you work?",
              answer: "Throughout Brooklyn (Park Slope, Williamsburg, DUMBO, Brooklyn Heights, Carroll Gardens, Bushwick), Manhattan (Tribeca, SoHo, West Village, Upper East Side, Upper West Side, Harlem), Queens (Long Island City, Astoria, Forest Hills) and Staten Island, plus the greater New York area."),
    ]

    /// "Text us" goes here. Only the message sheet uses it; no screen shows it.
    static let textNumber = "+17188045488"
    static let email = "orders@greencabinetsny.com"
    /// Goes with a shared photo
    static let shareLine = "Custom cabinetry by Green Cabinets NY. greencabinetsny.com"
}
