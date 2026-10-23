package com.greencabinetsny.app.model

import kotlinx.serialization.Serializable
import java.text.NumberFormat
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sqrt

/** A point seen from above, in metres. */
data class P2(val x: Double, val y: Double) {
    operator fun plus(o: P2) = P2(x + o.x, y + o.y)
    operator fun minus(o: P2) = P2(x - o.x, y - o.y)
    operator fun times(k: Double) = P2(x * k, y * k)
    operator fun div(k: Double) = P2(x / k, y / k)
    operator fun unaryMinus() = P2(-x, -y)
    fun dot(o: P2) = x * o.x + y * o.y
    val length: Double get() = sqrt(x * x + y * y)
}

/**
 * A room seen from above, in metres (RoomPlan's coordinates: x to the right,
 * z toward the viewer, y up). The same format the website and the iPhone app
 * read, so a plan sent from Android opens on the office computer too.
 */
@Serializable
data class ScannedRoom(
    val v: Int = 2,
    val rooms: Int? = null,
    val walls: List<Segment> = emptyList(),
    val doors: List<Segment> = emptyList(),
    val windows: List<Segment> = emptyList(),
    val openings: List<Segment> = emptyList(),
    val objects: List<RoomObject> = emptyList(),
    val floors: List<Floor>? = null,
    val sections: List<Section>? = null,
) {
    @Serializable
    data class Segment(val a: List<Double>, val b: List<Double>, val len: Double, val h: Double, val y: Double? = null, val open: Boolean? = null) {
        val pa: P2 get() = P2(a[0], a[1])
        val pb: P2 get() = P2(b[0], b[1])
    }

    @Serializable
    data class RoomObject(val c: List<Double>, val ax: List<Double>, val w: Double, val d: Double, val h: Double, val y: Double? = null, val cat: String) {
        val center: P2 get() = P2(c[0], c[1])
        val axis: P2 get() = P2(ax[0], if (ax.size > 1) ax[1] else 0.0)
    }

    @Serializable
    data class Floor(val poly: List<List<Double>>, val y: Double? = null)

    @Serializable
    data class Section(val label: String, val c: List<Double>)

    val json: String get() = Library.json.encodeToString(serializer(), this)

    val allPoints: List<P2> get() = walls.flatMap { listOf(it.pa, it.pb) } + objects.map { it.center }

    val bounds: Pair<P2, P2>
        get() {
            val pts = allPoints
            if (pts.isEmpty()) return P2(0.0, 0.0) to P2(1.0, 1.0)
            return P2(pts.minOf { it.x }, pts.minOf { it.y }) to P2(pts.maxOf { it.x }, pts.maxOf { it.y })
        }

    val center: P2 get() = bounds.let { (it.first + it.second) / 2.0 }

    /** Where the floor is: the scan's floors, else the walls' bottoms, else 0. */
    val floorLevel: Double
        get() {
            floors?.mapNotNull { it.y }?.minOrNull()?.let { return it }
            return walls.mapNotNull { w -> w.y?.let { it - w.h / 2 } }.minOrNull() ?: 0.0
        }

    /** Outward normal of a wall (pointing away from the middle of the room). */
    fun outward(w: Segment): P2 {
        val d = w.pb - w.pa
        val l = d.length
        if (l <= 0) return P2(0.0, 1.0)
        var n = P2(-d.y / l, d.x / l)
        val mid = (w.pa + w.pb) / 2.0
        if (n.dot(mid - center) < 0) n = -n
        return n
    }

    /** Doors, windows and openings in this wall, as spans along it (metres from end a). */
    fun holes(w: Segment): List<Hole> {
        val fy = floorLevel
        val d = w.pb - w.pa
        val len = max(d.length, 1e-6)
        val u = d / len
        val out = mutableListOf<Hole>()
        for ((kind, list) in listOf(HoleKind.Door to doors, HoleKind.Window to windows, HoleKind.Opening to openings)) {
            for (o in list) {
                val m = (o.pa + o.pb) / 2.0 - w.pa
                val s = m.dot(u)
                val off = abs(m.x * u.y - m.y * u.x)
                if (off > 0.25 || s < -0.1 || s > len + 0.1) continue
                val od = o.pb - o.pa
                val ol = max(od.length, 1e-6)
                if (abs(od.dot(u) / ol) < 0.8) continue
                var bottom = o.y?.let { it - o.h / 2 - fy } ?: if (kind == HoleKind.Window) max(0.3, min(0.9, w.h - o.h - 0.15)) else 0.0
                bottom = max(0.0, bottom)
                val top = min(w.h, bottom + o.h)
                val s0 = max(0.0, s - o.len / 2)
                val s1 = min(len, s + o.len / 2)
                if (s1 - s0 > 0.05 && top - bottom > 0.05) out += Hole(kind, s0, s1, bottom, top, o.open ?: false)
            }
        }
        return out.sortedBy { it.s0 }
    }

    /** Cabinets and appliances standing against this wall, as spans along it. */
    fun objectsAgainst(w: Segment): List<WallObject> {
        val fy = floorLevel
        val d = w.pb - w.pa
        val len = max(d.length, 1e-6)
        val u = d / len
        val out = mutableListOf<WallObject>()
        for (o in objects) {
            if (abs(o.axis.dot(u)) < 0.8) continue
            val m = o.center - w.pa
            val s = m.dot(u)
            val off = abs(m.x * u.y - m.y * u.x)
            if (s < -0.2 || s > len + 0.2 || off > o.d / 2 + 0.25) continue
            val bottom = o.y?.let { max(0.0, it - o.h / 2 - fy) } ?: 0.0
            out += WallObject(o, max(0.0, s - o.w / 2), min(len, s + o.w / 2), bottom, bottom + o.h)
        }
        return out.sortedBy { if (it.obj.cat == "cabinet") 0 else 1 }
    }

    /** Which wall an object stands against, or null. */
    fun wallIndex(o: RoomObject): Int? {
        var best: Int? = null
        var bd = Double.MAX_VALUE
        walls.forEachIndexed { i, w ->
            val d = w.pb - w.pa
            val len = max(d.length, 1e-6)
            val u = d / len
            if (abs(o.axis.dot(u)) < 0.8) return@forEachIndexed
            val m = o.center - w.pa
            val s = m.dot(u)
            val off = abs(m.x * u.y - m.y * u.x)
            if (s < -0.2 || s > len + 0.2 || off > o.d / 2 + 0.25) return@forEachIndexed
            if (off < bd) { bd = off; best = i }
        }
        return best
    }

    val floorPolygons: List<List<P2>>
        get() {
            val f = (floors ?: emptyList()).filter { it.poly.size >= 3 }.map { fl -> fl.poly.map { P2(it[0], it[1]) } }
            if (f.isNotEmpty()) return f
            return if (walls.size >= 3) listOf(walls.map { it.pa }) else emptyList()
        }

    val floorArea: Double get() = floorPolygons.sumOf { polygonArea(it) }
    val ceiling: Double get() = walls.maxOfOrNull { it.h } ?: 0.0
    val wallRun: Double get() = walls.sumOf { it.len }
    val cabinetCount: Int get() = objects.count { it.cat == "cabinet" }
    val appliances: List<String>
        get() {
            val known = listOf("fridge", "stove", "oven", "sink", "dishwasher", "washer")
            return objects.map { it.cat }.filter { it in known }.distinct()
        }

    /** The numbers Green Cabinets needs first, as lines for the email. */
    fun summaryLines(unit: LengthUnit): List<String> {
        val u = unit.forText
        val lines = mutableListOf(
            "Floor area: ${u.area(floorArea)}",
            "Ceiling height: ${u.length(ceiling)}",
            "Total wall length: ${u.length(wallRun)} over ${walls.size} walls",
            "Doors: ${doors.size} · Windows: ${windows.size}",
            "Existing cabinets found: $cabinetCount",
        )
        if (appliances.isNotEmpty()) lines += "Appliances found: ${appliances.joinToString(", ")}"
        lines += "Walls: " + walls.mapIndexed { i, w -> "${i + 1}) ${u.length(w.len)}" }.joinToString("  ")
        return lines
    }

    companion object {
        val applianceNames = mapOf(
            "fridge" to "Fridge", "stove" to "Range", "oven" to "Oven", "dishwasher" to "DW", "washer" to "Washer", "sink" to "Sink",
            "toilet" to "WC", "tub" to "Tub", "bed" to "Bed", "sofa" to "Sofa", "table" to "Table", "chair" to "Chair",
            "fireplace" to "Fireplace", "tv" to "TV", "stairs" to "Stairs",
        )

        fun polygonArea(poly: List<P2>): Double {
            if (poly.size < 3) return 0.0
            var s = 0.0
            for (i in poly.indices) {
                val p = poly[i]; val q = poly[(i + 1) % poly.size]
                s += p.x * q.y - q.x * p.y
            }
            return abs(s) / 2
        }
    }
}

enum class HoleKind { Door, Window, Opening }

data class Hole(val kind: HoleKind, val s0: Double, val s1: Double, val bottom: Double, val top: Double, val open: Boolean)

data class WallObject(val obj: ScannedRoom.RoomObject, val s0: Double, val s1: Double, val bottom: Double, val top: Double)

enum class LengthUnit(val label: String) {
    FtIn("Ft + in"), Inch("Inches"), Cm("Cm"), None("None");

    /** A length in this unit; "" when the drawing should carry no sizes. */
    fun length(m: Double): String = when (this) {
        FtIn -> {
            val total = (m * 39.3701).roundToInt()
            val ft = total / 12; val inch = total % 12
            if (inch == 0) "$ft'" else "$ft' $inch\""
        }
        Inch -> "${(m * 39.3701).roundToInt()}\""
        Cm -> "${(m * 100).roundToInt()} cm"
        None -> ""
    }

    fun area(m2: Double): String = when (this) {
        Cm -> String.format("%.1f m²", m2)
        None -> ""
        else -> "${NumberFormat.getIntegerInstance().format((m2 * 10.7639).roundToInt())} sq ft"
    }

    /** Sizes for text summaries, never blank */
    val forText: LengthUnit get() = if (this == None) FtIn else this
}
