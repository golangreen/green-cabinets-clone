package com.greencabinetsny.app.model

/**
 * What the app shows about Green Cabinets: the same facts, prices and photos
 * as greencabinetsny.com and the iPhone app, kept here so the app works offline.
 */
enum class WorkCategory(val label: String) { Kitchens("Kitchens"), Baths("Bathrooms"), Closets("Closets & built-ins") }

data class WorkPhoto(val id: String, val title: String, val category: WorkCategory)

data class PriceTier(val name: String, val size: String, val range: String, val note: String, val feet: ClosedFloatingPointRange<Double>)

data class Step(val title: String, val text: String, val image: String)

data class Point(val title: String, val text: String, val icon: String)

data class Faq(val question: String, val answer: String)

object Content {
    const val HERO = "photo-modern-kitchen-island-bar-stools"

    val photos = listOf(
        WorkPhoto("photo-light-wood-kitchen-marble-peninsula-front", "Light wood, white uppers, marble peninsula", WorkCategory.Kitchens),
        WorkPhoto("photo-modern-kitchen-island-bar-stools", "White oak with a marble waterfall island", WorkCategory.Kitchens),
        WorkPhoto("photo-natural-wood-kitchen-marble", "Natural oak with a marble backsplash", WorkCategory.Kitchens),
        WorkPhoto("photo-light-wood-u-kitchen-marble-peninsula-stools", "A light wood U with a marble peninsula", WorkCategory.Kitchens),
        WorkPhoto("photo-green-kitchen-marble-island", "Painted green with brass hardware", WorkCategory.Kitchens),
        WorkPhoto("photo-loft-kitchen-exposed-brick-natural-wood", "Natural wood against exposed brick", WorkCategory.Kitchens),
        WorkPhoto("photo-marble-wood-kitchen-island", "Marble waterfall island and wood cabinetry", WorkCategory.Kitchens),
        WorkPhoto("photo-natural-wood-galley-kitchen", "A natural wood galley", WorkCategory.Kitchens),
        WorkPhoto("photo-luxury-kitchen-marble-dining", "Marble island beside the dining table", WorkCategory.Kitchens),
        WorkPhoto("photo-wood-kitchen-outdoor-access", "Oak kitchen opening onto a terrace", WorkCategory.Kitchens),
        WorkPhoto("photo-natural-wood-open-concept-kitchen", "An open plan oak kitchen", WorkCategory.Kitchens),
        WorkPhoto("photo-modern-kitchen-island-glass-pendants", "Wood island under glass pendants", WorkCategory.Kitchens),
        WorkPhoto("photo-natural-wood-kitchen-white-countertops", "Tall oak cabinets, white counters", WorkCategory.Kitchens),
        WorkPhoto("photo-wood-peninsula-white-tall-cabinets-kitchen", "Wood peninsula, white tall cabinets", WorkCategory.Kitchens),
        WorkPhoto("photo-open-kitchen-dining-wood-peninsula-stools", "Open kitchen beside the dining room", WorkCategory.Kitchens),
        WorkPhoto("photo-wood-kitchen-peninsula-dining-room", "Wood peninsula with bar seating", WorkCategory.Kitchens),
        WorkPhoto("photo-open-kitchen-dining-wood-panel-fridge", "White and wood, with a paneled fridge", WorkCategory.Kitchens),
        WorkPhoto("photo-dining-room-white-wood-kitchen-pendants", "The kitchen from the dining table", WorkCategory.Kitchens),
        WorkPhoto("photo-modern-white-kitchen-pendants", "White kitchen with globe pendants", WorkCategory.Kitchens),
        WorkPhoto("photo-powder-room-wood-vanity-green-marble", "Powder room in wood and green marble", WorkCategory.Baths),
        WorkPhoto("photo-bathroom-wood-double-vanity-glass-shower", "Wood double vanity, glass shower", WorkCategory.Baths),
        WorkPhoto("photo-bathroom-floating-wood-vanity-marble-tub", "Floating wood vanity, marble tub", WorkCategory.Baths),
        WorkPhoto("photo-modern-bathroom-marble-vanity", "Floating vanity in a marble bath", WorkCategory.Baths),
        WorkPhoto("photo-luxury-marble-bathroom-shower", "Wood vanity beside a marble shower", WorkCategory.Baths),
        WorkPhoto("photo-marble-bathroom-outdoor-access", "Marble bath with a wood vanity", WorkCategory.Baths),
        WorkPhoto("photo-modern-bathroom-wood-marble", "Floating wood cabinets, marble top", WorkCategory.Baths),
        WorkPhoto("photo-modern-bathroom-floating-wood-vanity", "A floating oak vanity", WorkCategory.Baths),
        WorkPhoto("photo-contemporary-bathroom-mixed-marble", "Floating wood vanity, mixed marble", WorkCategory.Baths),
        WorkPhoto("photo-contemporary-powder-room-wood", "Powder room in wood and marble", WorkCategory.Baths),
        WorkPhoto("photo-modern-powder-room-marble", "Powder room with a marble counter", WorkCategory.Baths),
        WorkPhoto("photo-luxury-walk-in-closet-integrated-lighting", "Walk-in closet with lit shelves", WorkCategory.Closets),
        WorkPhoto("photo-dark-walk-in-closet-center-island", "Walk-in closet with a center island", WorkCategory.Closets),
        WorkPhoto("photo-natural-wood-hallway-cabinets", "Hallway built-ins in natural wood", WorkCategory.Closets),
        WorkPhoto("photo-modern-workspace-wood-desk-brick", "A desk wall in a brick loft", WorkCategory.Closets),
    )

    val steps = listOf(
        Step("Measured at home",
            "We come to you with door and finish samples, measure every wall and talk through how you cook, store and live.",
            "story-door-samples-measure"),
        Step("Drawn and approved",
            "Every wall, window and outlet goes into the drawing. You sign off on layout, materials and hardware before anything is cut.",
            "story-galley-kitchen-drawing"),
        Step("Built to spec",
            "Boxes and doors cut to our specifications by our vetted millwork suppliers, in Tafisa, Shinnoki and Egger panels, with Blum and Hettich hardware.",
            "story-oak-edge-brass-pull"),
        Step("Installed in days",
            "Most installs take 3 to 7 days. In New York the building sets the schedule, so we plan around it from the first visit.",
            "photo-design-reality-kitchen-1"),
    )

    val tiers = listOf(
        PriceTier("Small kitchen", "10 to 14 linear feet", "\$4,200 to \$6,500",
            "A co-op galley or a garden-floor rental. Painted shaker, soft-close hinges and slides, standard hardware.", 0.0..15.0),
        PriceTier("Standard kitchen", "16 to 22 linear feet", "\$6,000 to \$9,500",
            "L-shape or U-shape with a peninsula. Two-tone paint, or paint with wood veneer.", 15.0..24.0),
        PriceTier("Brownstone gut", "26 to 36 linear feet", "\$12,000 to \$20,000+",
            "Full-height pantry walls, an island with seating, appliance panels, specialty finishes and integrated pulls.", 24.0..1000.0),
    )

    val rates = listOf(
        "\$350" to "per linear foot, full kitchen",
        "\$225" to "per linear foot, base only",
        "\$125" to "per linear foot, wall only",
    )

    val buildings = listOf(
        Point("Paperwork", "COIs naming the building, agent and board, usually within 48 hours, plus alteration agreements.", "doc"),
        Point("Freight elevator", "Reserved with your super or managing agent before delivery day, with wall and floor protection.", "elevator"),
        Point("Quiet hours", "Loud work only in permitted hours. Quiet finish work fills the rest.", "quiet"),
        Point("Sized for the stairs", "In walk-ups and brownstones, boxes are sized to clear the stoop, the stair turn and the door.", "stairs"),
    )

    /** The questions from greencabinetsny.com, in plain words. */
    val faqs = listOf(
        Faq(
            "What makes your cabinets different?",
            "Every project starts with a free visit at your home. We design every kitchen ourselves, from classic shaker and slim shaker to flat panel, and our vetted millwork suppliers build it to our specifications with FSC-certified hardwoods, low-VOC finishes and European hardware. It fits your room exactly.",
        ),
        Faq(
            "How much do custom cabinets cost?",
            "\$350 per linear foot for full kitchens and vanities, \$225 per foot for base cabinets and \$125 per foot for wall cabinets. A typical NYC kitchen runs \$8,000 to \$25,000 or more, depending on size, materials and finishes.",
        ),
        Faq(
            "How long does a kitchen take?",
            "Most projects take 4 to 6 weeks from approved drawings to install: 1 to 2 weeks of design and material choices, 2 to 3 weeks of fabrication, and 3 to 7 days of installation.",
        ),
        Faq(
            "Which materials do you use?",
            "Our panels and veneers come mostly from Tafisa, Shinnoki and Egger. Solid hardwoods like white oak, walnut, maple and cherry are FSC-certified, plywood cores are formaldehyde-free, hardware is Blum and Hettich, and finishes are low-VOC.",
        ),
        Faq(
            "Do you build shaker and slim shaker doors?",
            "Yes. Classic shaker has a 2.25 inch frame; slim shaker uses a narrower frame of about 1.5 inches for a cleaner, more modern look. We also build flat panel and raised panel doors, painted, stained or in natural wood.",
        ),
        Faq(
            "Do you do bathroom vanities and closets too?",
            "Yes. Vanities, walk-in closets and built-ins, often designed together with the kitchen so finishes and hardware match across the home.",
        ),
        Faq(
            "Can you handle my co-op or condo board?",
            "Yes. We carry general liability, workers' comp and umbrella coverage and issue building-specific COIs naming the building, managing agent and board, usually within 48 hours, plus alteration agreements and registrations.",
        ),
        Faq(
            "How do you handle noise rules and the freight elevator?",
            "Loud work happens only in your building's permitted hours, usually 9 AM to 5 PM on weekdays. We book the freight elevator with your super or managing agent, and do quiet finish work outside loud-work hours.",
        ),
        Faq(
            "Do you have a showroom?",
            "No. We work by appointment. The free consultation comes to you: we bring door and finish samples to your home and measure the room in person.",
        ),
        Faq(
            "Do you work with architects and designers?",
            "Yes. We design, specify and install for homeowners, architects, designers and developers, with shop drawings for approval and commercial millwork for buildings and businesses.",
        ),
        Faq(
            "Where do you work?",
            "Throughout Brooklyn (Park Slope, Williamsburg, DUMBO, Brooklyn Heights, Carroll Gardens, Bushwick), Manhattan (Tribeca, SoHo, West Village, Upper East Side, Upper West Side, Harlem), Queens (Long Island City, Astoria, Forest Hills) and Staten Island, plus the greater New York area.",
        ),
    )

    /** "Text us" goes here. Only the message sheet uses it; no screen shows it. */
    const val TEXT_NUMBER = "+17188045488"
    const val EMAIL = "orders@greencabinetsny.com"
    /** Goes with a shared photo */
    const val SHARE_LINE = "Custom cabinetry by Green Cabinets NY. greencabinetsny.com"
}
