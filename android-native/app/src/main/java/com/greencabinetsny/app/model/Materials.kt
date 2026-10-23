package com.greencabinetsny.app.model

import android.content.Context
import androidx.compose.ui.graphics.Color
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** The bundled data (assets/data), read once when the app starts. */
object Library {
    val json = Json { ignoreUnknownKeys = true; explicitNulls = false; encodeDefaults = true }
    var panels: List<Panel> = emptyList(); private set
    var woods: List<WoodSpecies> = emptyList(); private set
    var tones: Map<String, String> = emptyMap(); private set
    var sampleRoom: ScannedRoom = ScannedRoom(); private set

    fun load(context: Context) {
        if (panels.isNotEmpty()) return
        fun read(name: String) = context.assets.open("data/$name").bufferedReader().use { it.readText() }
        panels = runCatching { json.decodeFromString<List<Panel>>(read("panels.json")) }.getOrDefault(emptyList())
        woods = runCatching { json.decodeFromString<List<WoodSpecies>>(read("wood.json")) }.getOrDefault(emptyList())
        tones = runCatching { json.decodeFromString<Map<String, String>>(read("tones.json")) }.getOrDefault(emptyMap())
        sampleRoom = runCatching { json.decodeFromString<ScannedRoom>(read("sampleRoom.json")) }.getOrDefault(ScannedRoom())
    }
}

fun colorOf(hex: String): Color {
    val s = hex.trim().removePrefix("#")
    val v = s.toLongOrNull(16) ?: return Color(0xFFD8D4CE)
    return Color(0xFF000000 or v)
}

/**
 * A real decor from one of our suppliers, the same list as
 * greencabinetsny.com/finishes-colors.
 */
@Serializable
data class Panel(
    val id: String,
    val brand: String,
    val name: String,
    val codes: List<String> = emptyList(),
    val category: String = "",
    val finish: String = "",
    /** The supplier's own small photo, or empty when we only have a color */
    val thumb: String = "",
    val hiRes: String = "",
    /** The color, for decors shown as a color guide */
    val hex: String = "",
    /** The decor on the supplier's site */
    val link: String = "",
) {
    val supplier: Supplier? get() = Supplier.entries.firstOrNull { it.label == brand }
    val thumbUrl: String? get() = thumb.ifEmpty { hiRes }.ifEmpty { null }
    val photoUrl: String? get() = hiRes.ifEmpty { thumb }.ifEmpty { null }
    val hasPhoto: Boolean get() = photoUrl != null
    val tone: String? get() = Library.tones[id]
    val code: String? get() = codes.firstOrNull()

    /** Woodgrain decors we only have as a color: drawn with grain */
    val isWoodgrain: Boolean
        get() = category in listOf("Oak", "Walnut", "Larch", "Elm", "Maple", "Wood", "Woodgrain", "Cherry") || finish == "Knotted Wood"

    /** Raphael Stone is for countertops, not doors */
    val isCountertop: Boolean get() = supplier == Supplier.Raphael

    /** One line for the request: "Tafisa Cream Puff (TFL: M2034)" */
    val requestLine: String
        get() = (if (isCountertop) "Countertop: " else "") + "$brand $name" + (code?.let { " ($it)" } ?: "")

    val color: Color get() = if (hex.isEmpty()) Color(0xFF221F1C) else colorOf(hex)

    /** As something the cabinets can wear */
    val finishLook: Finish
        get() = Finish(id, name, brand, remote = photoUrl, hex = hex.ifEmpty { "#D8D4CE" }, grain = !hasPhoto && isWoodgrain)

    companion object {
        val all: List<Panel> get() = Library.panels
        fun find(id: String) = all.firstOrNull { it.id == id }
    }
}

/** The suppliers, in the order we use them most. */
enum class Supplier(val label: String) {
    Tafisa("Tafisa"), Shinnoki("Shinnoki"), Egger("Egger"), Wilsonart("Wilsonart"), Agt("AGT"), Raphael("Raphael Stone");

    val kind: String
        get() = when (this) {
            Tafisa -> "Laminate, made in Canada"
            Shinnoki -> "Real wood veneer, made in Belgium"
            Egger -> "European laminate"
            Wilsonart -> "Hard-wearing laminate"
            Agt -> "Matte and gloss panels"
            Raphael -> "Stone countertops"
        }

    val why: String
        get() = when (this) {
            Tafisa -> "Tough, easy to clean and the best value. Over 100 colors, woodgrains and textures."
            Shinnoki -> "Real wood you can feel, prefinished in the factory so every door matches."
            Egger -> "Soft matte colors and realistic woodgrains, with a velvety feel."
            Wilsonart -> "Very hard-wearing laminate in solid colors, woods and stone looks."
            Agt -> "Smooth soft matte or full high gloss, for a modern slab door."
            Raphael -> "Natural, engineered and printed stone countertops, at \$65 per square foot."
        }

    val cost: String
        get() = when (this) {
            Wilsonart, Tafisa -> "$"
            Egger, Agt -> "$$"
            Shinnoki -> "$$$"
            Raphael -> "$$$$"
        }

    val costWords: String
        get() = when (cost.length) {
            1 -> "Best value"; 2 -> "Mid-range"; 3 -> "Premium"; else -> "Luxury"
        }

    /** Colors only (no photos): say so plainly */
    val colorGuideOnly: Boolean get() = this == Egger || this == Wilsonart || this == Agt

    val site: String
        get() = when (this) {
            Tafisa -> "https://tafisa.ca/en/our-colours"
            Shinnoki -> "https://www.decospan.com/en-us/shinnoki"
            Egger -> "https://www.egger.com/en/furniture-interior-design/?country=US"
            Wilsonart -> "https://www.wilsonart.com/laminate/design-library"
            Agt -> "https://www.agtwood.com/products/panel/panel"
            Raphael -> "https://www.raphaelstoneusa.com/collection/"
        }

    val panels: List<Panel> get() = Panel.all.filter { it.brand == label }

    /** What to call its swatches in plain words */
    val unit: String get() = if (this == Raphael) "stones" else "colors"

    /** A few to start with, so nobody faces 117 swatches at once */
    val picks: List<Panel>
        get() {
            val names = when (this) {
                Tafisa -> listOf("Cream Puff", "Classic White", "Cashmere", "Natural Affinity", "Hardrock Maple", "Dark Chocolate")
                Shinnoki -> listOf("Ivory Oak", "Milk Oak", "Natural Oak", "Manhattan Oak", "Pure Walnut", "Smoked Walnut")
                Egger -> listOf("Premium White", "Cashmere Grey", "Natural Davos Oak", "Natural Hamilton Oak", "Natural Aida Walnut", "Soft Black")
                Wilsonart -> listOf("Designer White", "Calcutta Marble", "Monticello Maple", "Florence Walnut", "Dove Grey", "Black")
                Agt -> listOf("Antique White", "Sahara Cream", "Victoria Grey", "Olive Green", "Linden", "Tobac")
                Raphael -> emptyList()
            }
            val list = panels
            val found = names.mapNotNull { n -> list.firstOrNull { it.name == n } }
            return found.ifEmpty { list.take(6) }
        }

    /** The catalog in groups a person would scan by */
    val groups: List<Pair<String, List<Panel>>>
        get() {
            val key: (Panel) -> String = when (this) {
                Tafisa, Shinnoki, Agt -> { p -> p.finish }
                Raphael -> { p -> p.category }
                Egger, Wilsonart -> { p -> family(p) }
            }
            val by = LinkedHashMap<String, MutableList<Panel>>()
            for (p in panels) by.getOrPut(key(p)) { mutableListOf() }.add(p)
            val order = if (this == Egger || this == Wilsonart) {
                listOf("Solid colors", "Woodgrains", "Stone and concrete").filter { by[it] != null }
            } else by.keys.sortedByDescending { by[it]?.size ?: 0 }
            return order.map { it to (by[it] ?: mutableListOf()) }
        }

    companion object {
        val main = listOf(Tafisa, Shinnoki, Egger)
        val more = listOf(Wilsonart, Agt, Raphael)
        private fun family(p: Panel): String {
            if (p.category == "Stone" || p.category == "Concrete") return "Stone and concrete"
            return if (p.isWoodgrain) "Woodgrains" else "Solid colors"
        }
    }
}

/** The 14 hardwoods from greencabinetsny.com/wood-species. */
@Serializable
data class WoodSpecies(
    val slug: String,
    val name: String,
    val tagline: String = "",
    val short: String = "",
    val janka: Int = 0,
    val cost: String = "",
    val color: String = "",
    val grain: String = "",
    val stability: Int = 0,
    val stain: String = "",
    val pros: List<String> = emptyList(),
    val cons: List<String> = emptyList(),
    val finishes: List<String> = emptyList(),
    val doors: List<String> = emptyList(),
    val swatch: String = "",
    val image: String = "",
) {
    val costWords: String
        get() = when (cost.length) {
            1 -> "Budget"; 2 -> "Moderate"; 3 -> "Premium"; else -> "Luxury"
        }

    companion object {
        val all: List<WoodSpecies> get() = Library.woods
        const val HARDEST = 1820
    }
}

/** Anything a cabinet door can be: a supplier decor, a wood, a paint or a stain. */
data class Finish(
    val id: String,
    val name: String,
    val detail: String,
    /** Bundled photo of the material */
    val texture: String? = null,
    /** The supplier's own photo, fetched when needed */
    val remote: String? = null,
    val hex: String,
    /** Draw the color as wood: grain tinted to `hex` */
    val grain: Boolean = false,
    /** Only the middle of the photo is the material (a slab on a bench) */
    val cropCenter: Boolean = false,
) {
    val color: Color get() = colorOf(hex)

    companion object {
        fun wood(w: WoodSpecies) = Finish("wood-${w.slug}", w.name, "Solid wood", texture = w.image, hex = w.swatch, cropCenter = true)
    }
}

/** Our house paint colors and stains, the same as the website's estimator. */
object HouseColors {
    val paints = listOf(
        Finish("paint-pure-white", "Pure White", "Painted", hex = "#F9F9F7"),
        Finish("paint-off-white", "Off White", "Painted", hex = "#F0EBE0"),
        Finish("paint-antique-white", "Antique White", "Painted", hex = "#EDE3C8"),
        Finish("paint-cream", "Cream", "Painted", hex = "#FBF4DC"),
        Finish("paint-greige", "Greige", "Painted", hex = "#C9B9A8"),
        Finish("paint-mushroom", "Mushroom", "Painted", hex = "#A89880"),
        Finish("paint-taupe", "Taupe", "Painted", hex = "#B0A090"),
        Finish("paint-light-gray", "Light Gray", "Painted", hex = "#D5D9E0"),
        Finish("paint-blue-gray", "Blue Gray", "Painted", hex = "#8FA3B1"),
        Finish("paint-slate-gray", "Slate Gray", "Painted", hex = "#8A9099"),
        Finish("paint-charcoal", "Charcoal", "Painted", hex = "#4B5060"),
        Finish("paint-matte-black", "Matte Black", "Painted", hex = "#242424"),
        Finish("paint-navy", "Navy Blue", "Painted", hex = "#1E3A5F"),
        Finish("paint-sage", "Sage Green", "Painted", hex = "#7A9E7A"),
        Finish("paint-forest", "Forest Green", "Painted", hex = "#3A5A3A"),
        Finish("paint-terracotta", "Terracotta", "Painted", hex = "#C4714A"),
    )

    val stains = listOf(
        Finish("stain-whitewash-oak", "Whitewash Oak", "Stain", hex = "#E0D4C0", grain = true),
        Finish("stain-natural-maple", "Natural Maple", "Stain", hex = "#D4A96A", grain = true),
        Finish("stain-natural-oak", "Natural Oak", "Stain", hex = "#C0925A", grain = true),
        Finish("stain-honey-maple", "Honey Maple", "Stain", hex = "#C8883A", grain = true),
        Finish("stain-light-walnut", "Light Walnut", "Stain", hex = "#9A7050", grain = true),
        Finish("stain-cherry", "Cherry", "Stain", hex = "#8B3A3A", grain = true),
        Finish("stain-walnut", "Walnut", "Stain", hex = "#6B4226", grain = true),
        Finish("stain-dark-walnut", "Dark Walnut", "Stain", hex = "#3E240E", grain = true),
        Finish("stain-espresso", "Espresso", "Stain", hex = "#2E1206", grain = true),
    )

    /** What the cabinets offer first: our most used decors and paints */
    val starters: List<Finish>
        get() {
            val ids = listOf("tafisa-cream-puff", "shinnoki-s4-ivory-oak", "egger-h3331-st10", "tafisa-natural-affinity", "shinnoki-s4-pure-walnut")
            val panels = ids.mapNotNull { Panel.find(it)?.finishLook }
            val p = listOf("paint-pure-white", "paint-sage", "paint-navy", "paint-matte-black").mapNotNull { id -> paints.firstOrNull { it.id == id } }
            return listOf(p[0]) + panels + p.drop(1)
        }
}

/** The door styles we build, as on the website. */
enum class DoorStyle(val label: String, val detail: String) {
    Shaker("Shaker", "Recessed center panel, 2.25 inch frame. Our most popular."),
    SlimShaker("Slim Shaker", "The same look with a 1.5 inch frame, cleaner and more modern."),
    Flat("Flat Panel", "A plain slab, for a clean modern kitchen."),
    Raised("Raised Panel", "A traditional raised center panel."),
}
