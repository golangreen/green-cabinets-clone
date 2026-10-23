package com.greencabinetsny.app.model

import kotlin.math.hypot
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * The kitchen designer for every phone: pick the shape closest to yours, set
 * how long each wall is, and see new cabinets on it, with the price.
 */
enum class KitchenShape(val label: String) {
    OneWall("One wall"), L("L-shape"), U("U-shape"), Galley("Galley");

    /** The lengths to ask for, in plain words */
    val fields: List<String>
        get() = when (this) {
            OneWall -> listOf("The wall")
            L -> listOf("Back wall", "Side wall")
            U -> listOf("Back wall", "Each side wall")
            Galley -> listOf("Each wall", "Space between the counters")
        }

    /** Feet to start from: a typical New York kitchen */
    val start: List<Double>
        get() = when (this) {
            OneWall -> listOf(12.0)
            L -> listOf(12.0, 8.0)
            U -> listOf(10.0, 8.0)
            Galley -> listOf(12.0, 4.0)
        }

    fun range(i: Int): ClosedFloatingPointRange<Double> = if (this == Galley && i == 1) 3.0..8.0 else 4.0..30.0

    /** The side open to the rest of the home */
    val openWall: Int get() = if (this == Galley) 1 else 2

    /**
     * The room as a scan would see it: the cabinet walls, and the open side
     * toward the rest of the home. Walls go back, right, front, left.
     */
    fun room(feet: List<Double>, ceiling: Double, window: Boolean): Pair<ScannedRoom, Set<Int>> {
        val ft = 0.3048
        val inch = 0.0254
        val a = feet[0] * ft
        val counters = 2 * 25.5 * inch
        val (depth, picked) = when (this) {
            OneWall -> 10 * ft to setOf(0)
            L -> feet[1] * ft to setOf(0, 1)
            U -> feet[1] * ft to setOf(0, 1, 3)
            Galley -> feet[1] * ft + counters to setOf(0, 2)
        }
        val h = ceiling * ft
        val corners = listOf(listOf(0.0, 0.0), listOf(a, 0.0), listOf(a, depth), listOf(0.0, depth))
        val walls = (0 until 4).map { i ->
            val p = corners[i]; val q = corners[(i + 1) % 4]
            ScannedRoom.Segment(p, q, hypot(q[0] - p[0], q[1] - p[1]), h)
        }
        val w = walls[openWall]
        val len = w.len
        val inset = min(0.3, len * 0.1)
        val d = listOf((w.b[0] - w.a[0]) / len, (w.b[1] - w.a[1]) / len)
        val s = listOf(w.a[0] + d[0] * inset, w.a[1] + d[1] * inset)
        val e = listOf(w.b[0] - d[0] * inset, w.b[1] - d[1] * inset)
        // A window centered on the back wall, above the counter
        val windows = if (window && a >= 6 * ft) {
            val ww = 36 * inch
            val wh = 42 * inch
            listOf(ScannedRoom.Segment(listOf(a / 2 - ww / 2, 0.0), listOf(a / 2 + ww / 2, 0.0), ww, wh, 42 * inch + wh / 2))
        } else emptyList()
        val room = ScannedRoom(
            v = 2, walls = walls, windows = windows,
            openings = listOf(ScannedRoom.Segment(s, e, len - 2 * inset, h)),
            floors = listOf(ScannedRoom.Floor(corners, 0.0)),
        )
        return room to picked
    }

    /** For the office: what was typed, so nobody mistakes it for a scan */
    fun line(feet: List<Double>, ceiling: Double, window: Boolean): String {
        val sizes = fields.zip(feet).joinToString(", ") { "${it.first.lowercase()} ${text(it.second)}" }
        return "Sizes typed in the app (no scan): ${label.lowercase()} kitchen, $sizes, ceiling ${ceiling.toInt()} ft" + if (window) ", window over the sink" else ""
    }

    companion object {
        fun text(feet: Double): String {
            val whole = feet.toInt()
            val inches = ((feet - whole) * 12).roundToInt()
            return if (inches == 0) "$whole'" else "$whole' $inches\""
        }
    }
}
