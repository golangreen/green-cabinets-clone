package com.greencabinetsny.app.model

import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/** A stretch along a wall, metres from its end a. */
data class Span(val a: Double, val b: Double) {
    val length: Double get() = b - a
}

/**
 * New cabinets laid out on the walls someone picked, the way we would start
 * the drawing: standard boxes in 3 inch steps, the appliances where the room
 * has them (or where the NKBA guidelines put them), a stone countertop on the
 * base run, and wall cabinets that stop at windows and doors. Priced with the
 * published per-foot rates. A line-for-line port of the iPhone app's layout.
 */
class KitchenLayout(val style: Style) {
    enum class Style(val label: String) { Kitchen("Kitchen"), Closets("Closets") }

    enum class Kind {
        Base, Sink, Drawers, Wall, Tall, Fridge, Range, Dishwasher, Hood, Filler;

        val isCabinet: Boolean get() = this in listOf(Base, Sink, Drawers, Wall, Tall)
        val onFloor: Boolean get() = this in listOf(Base, Sink, Drawers, Dishwasher, Filler)
        val label: String
            get() = when (this) {
                Fridge -> "Fridge"; Range -> "Range"; Dishwasher -> "DW"; Hood -> "Hood"; else -> ""
            }
    }

    /** One box on one wall: metres along the wall from its end a, and up from the floor. */
    data class Piece(
        val wall: Int, val kind: Kind, val s0: Double, val s1: Double, val bottom: Double, val top: Double, val depth: Double,
        /** Catalog name ("B24", "SB36", "W3036"); empty for appliances */
        val model: String = "",
    ) {
        val width: Double get() = s1 - s0
    }

    /** The countertop over one base run. */
    data class Counter(val wall: Int, val s0: Double, val s1: Double)

    /** One NKBA kitchen planning guideline, met or not */
    data class Check(val ok: Boolean, val title: String, val detail: String)

    val pieces = mutableListOf<Piece>()
    val counters = mutableListOf<Counter>()
    var checks: List<Check> = emptyList(); private set

    // Numbers for people

    val cabinets: List<Piece> get() = pieces.filter { it.kind.isCabinet }
    val isEmpty: Boolean get() = cabinets.isEmpty()
    private fun feet(kinds: List<Kind>) = pieces.filter { it.kind in kinds }.sumOf { it.width } / 0.3048
    val baseFeet: Double get() = feet(listOf(Kind.Base, Kind.Sink, Kind.Drawers))
    val wallFeet: Double get() = feet(listOf(Kind.Wall))
    val tallFeet: Double get() = feet(listOf(Kind.Tall))
    /** Stone over the base run, in square feet */
    val counterSqFt: Double get() = counters.sumOf { it.s1 - it.s0 } * COUNTER_DEPTH / (0.3048 * 0.3048)

    /** $225 a linear foot of base cabinets, $125 of wall cabinets, and both together ($350) for full-height closets. */
    val cabinetPrice: Int?
        get() = if (isEmpty) null else ((baseFeet * 225 + wallFeet * 125 + tallFeet * 350) / 50).roundToInt() * 50

    /** Raphael Stone, $65 a square foot */
    val counterPrice: Int? get() = if (counterSqFt > 0) (counterSqFt * 65 / 10).roundToInt() * 10 else null

    /** "9 base cabinets, 6 wall cabinets" */
    val countLine: String
        get() {
            val base = pieces.count { it.kind in listOf(Kind.Base, Kind.Sink, Kind.Drawers) }
            val wall = pieces.count { it.kind == Kind.Wall }
            val tall = pieces.count { it.kind == Kind.Tall }
            val parts = mutableListOf<String>()
            if (base > 0) parts += if (base == 1) "1 base cabinet" else "$base base cabinets"
            if (wall > 0) parts += if (wall == 1) "1 wall cabinet" else "$wall wall cabinets"
            if (tall > 0) parts += if (tall == 1) "1 tall cabinet" else "$tall tall cabinets"
            return parts.joinToString(", ")
        }

    /** For the office: each wall's boxes left to right, then the totals. */
    fun lines(walls: Collection<Int>): List<String> {
        if (isEmpty) return emptyList()
        val out = mutableListOf<String>()
        for (w in walls.sorted()) {
            val low = pieces.filter { it.wall == w && it.bottom < 0.01 && it.kind != Kind.Filler }.sortedBy { it.s0 }
            val high = pieces.filter { it.wall == w && it.bottom >= 0.01 && it.kind.isCabinet }.sortedBy { it.s0 }
            val name: (Piece) -> String = { it.model.ifEmpty { it.kind.label } }
            var row = low.joinToString(" ") { name(it) }
            if (high.isNotEmpty()) row += " / above: " + high.joinToString(" ") { name(it) }
            if (row.isNotEmpty()) out += "Wall ${w + 1}: $row"
        }
        var totals = countLine
        if (baseFeet > 0) totals += ", ${baseFeet.roundToInt()} ft base"
        if (wallFeet > 0) totals += ", ${wallFeet.roundToInt()} ft wall"
        if (tallFeet > 0) totals += ", ${tallFeet.roundToInt()} ft tall"
        if (counterSqFt > 0) totals += ", ${counterSqFt.roundToInt()} sq ft countertop"
        out += "Layout from the app (${style.label.lowercase()}): $totals"
        if (checks.isNotEmpty()) {
            val missed = checks.filter { !it.ok }.map { it.title }
            out += "NKBA guidelines: ${checks.size - missed.size} of ${checks.size} met" + if (missed.isEmpty()) "" else ". Not met: " + missed.joinToString("; ")
        }
        return out
    }

    // Laying it out

    /** One picked wall and what is already on it. */
    private class Run(val wall: Int, val len: Double, val height: Double, val holes: List<Hole>, val found: List<WallObject>) {
        var lo = 0.0
        var hi = len
        var upperLo = 0.0
        var upperHi = len
        /** This end meets another picked wall */
        var cornerA = false
        var cornerB = false

        /** Spans taken on the floor: doors, openings and windows that come down low */
        val floorBlocks: List<Span> get() = holes.filter { it.kind != HoleKind.Window || it.bottom < SILL }.map { Span(it.s0 - 0.05, it.s1 + 0.05) }
        /** Spans taken higher up: every door, opening and window */
        val upperBlocks: List<Span> get() = holes.map { Span(it.s0 - 0.05, it.s1 + 0.05) }
        /** Windows a sink could sit under */
        val sinkWindows: List<Hole> get() = holes.filter { it.kind == HoleKind.Window && it.bottom >= SILL }
        fun free(): List<Span> = subtract(listOf(Span(lo, hi)), floorBlocks)
        fun freeLength(): Double = free().sumOf { it.length }

        companion object { val SILL = COUNTER_TOP - 0.03 }
    }

    private data class Placed(val wall: Int, val kind: Kind, val s0: Double, val s1: Double, val width: Int)

    private fun layKitchen(runs: List<Run>, room: ScannedRoom) {
        val free: Map<Int, List<Span>> = runs.associate { it.wall to it.free() }
        val ceiling = runs.minOfOrNull { it.height } ?: 2.44
        val upperIn = listOf(42, 36, 30).firstOrNull { (54 + it) * INCH <= ceiling + 0.01 } ?: 30
        val upperTop = WALL_BOTTOM + upperIn * INCH
        var placed = mutableListOf<Placed>()

        fun run(wall: Int): Run? = runs.firstOrNull { it.wall == wall }

        // Free floor, not taken by another appliance. Strict also keeps the NKBA
        // clearances: no range or fridge jammed into a corner, no range under a
        // window, and 21 inches to stand at an open dishwasher.
        fun fits(wall: Int, a: Double, b: Double, kind: Kind, strict: Boolean = true): Boolean {
            val r = run(wall) ?: return false
            val spans = free[wall] ?: return false
            if (spans.none { a >= it.a - 0.001 && b <= it.b + 0.001 }) return false
            if (strict) {
                when (kind) {
                    Kind.Fridge, Kind.Range -> {
                        val keep = BASE_DEPTH + 0.01 + 12 * INCH + 0.005
                        if (r.cornerA && a < keep) return false
                        if (r.cornerB && b > r.len - keep) return false
                        if (kind == Kind.Range && r.holes.any { it.kind == HoleKind.Window && it.s0 < b && it.s1 > a }) return false
                    }
                    Kind.Dishwasher -> {
                        val keep = BASE_DEPTH + 21 * INCH
                        if (r.cornerA && a < keep - 0.005) return false
                        if (r.cornerB && b > r.len - keep + 0.005) return false
                    }
                    else -> {}
                }
            }
            return placed.none { it.wall == wall && a < it.s1 - 0.001 && b > it.s0 + 0.001 }
        }

        // The nearest place along the wall where it fits
        fun settle(wall: Int, center: Double, widths: List<Int>, kind: Kind, strict: Boolean = true): Placed? {
            val r = run(wall) ?: return null
            for (wIn in widths) {
                val w = wIn * INCH
                var best: Double? = null
                var c = r.lo + w / 2
                while (c <= r.hi - w / 2 + 0.001) {
                    if (fits(wall, c - w / 2, c + w / 2, kind, strict) && abs(c - center) < abs((best ?: Double.MAX_VALUE) - center)) best = c
                    c += INCH
                }
                if (best != null) return Placed(wall, kind, best - w / 2, best + w / 2, wIn)
            }
            return null
        }

        // Appliances already on the picked walls stay where they are
        val found = mapOf(
            "fridge" to (Kind.Fridge to listOf(36)), "stove" to (Kind.Range to listOf(30)), "oven" to (Kind.Range to listOf(30)),
            "dishwasher" to (Kind.Dishwasher to listOf(24)), "sink" to (Kind.Sink to listOf(36, 33, 30)),
        )
        for (r in runs) {
            for (f in r.found) {
                val (kind, widths) = found[f.obj.cat] ?: continue
                if (placed.any { it.kind == kind && it.wall == r.wall }) continue
                val c = (f.s0 + f.s1) / 2
                (settle(r.wall, c, widths, kind) ?: settle(r.wall, c, widths, kind, strict = false))?.let { placed += it }
            }
        }

        // Then what the room is missing, placed by the NKBA guidelines
        val picked = runs.map { it.wall }.toSet()
        val elsewhere = room.objects.filter { o -> room.wallIndex(o)?.let { it !in picked } ?: true }
        val inRoom = elsewhere.map { it.cat }.toSet()
        fun has(k: Kind) = placed.any { it.kind == k }
        val needs = mapOf(
            Kind.Sink to (!has(Kind.Sink) && "sink" !in inRoom),
            Kind.Dishwasher to (!has(Kind.Dishwasher) && "dishwasher" !in inRoom),
            Kind.Range to (!has(Kind.Range) && "stove" !in inRoom && "oven" !in inRoom),
            Kind.Fridge to (!has(Kind.Fridge) && "fridge" !in inRoom),
        )
        val landing: (Placed, List<Placed>) -> Pair<Double, Double> = { p, others -> landingOf(p, others, runs, free) }
        fun feetBetween(a: Placed, b: Placed) = (front(a.wall, (a.s0 + a.s1) / 2, room) - front(b.wall, (b.s0 + b.s1) / 2, room)).length / 0.3048
        // How far a work-triangle leg is outside 4 to 9 feet
        fun leg(f: Double) = max(0.0, 4 - f) + max(0.0, f - 9)
        val total = runs.sumOf { it.freeLength() }
        var missing = emptyList<Kind>()

        val longest = runs.maxByOrNull { it.freeLength() }
        if (total >= 8 * 0.3048 && longest != null) {
            // Every way to place what is missing is scored against the NKBA
            // guidelines, and the layout that meets the most of them wins
            val win = runs.flatMap { r -> r.sinkWindows.map { Triple(r.wall, (it.s0 + it.s1) / 2, it.s1 - it.s0) } }.maxByOrNull { it.third }
            val target = win?.let { it.first to it.second } ?: (longest.wall to (longest.lo + longest.hi) / 2)
            fun mid(w: Int) = ((run(w)?.lo ?: 0.0) + (run(w)?.hi ?: 0.0)) / 2
            fun fitsAmong(taken: List<Placed>, wall: Int, a: Double, b: Double, kind: Kind, strict: Boolean): Boolean {
                val saved = placed
                placed = taken.toMutableList()
                try { return fits(wall, a, b, kind, strict) } finally { placed = saved }
            }
            fun spots(kind: Kind, widths: List<Int>, taken: List<Placed>): List<Placed> {
                for (strict in listOf(true, false)) {
                    for (wIn in widths) {
                        val w = wIn * INCH
                        val out = mutableListOf<Placed>()
                        for (r in runs) {
                            var a = r.lo
                            while (a + w <= r.hi + 0.001) {
                                if (fitsAmong(taken, r.wall, a, a + w, kind, strict)) out += Placed(r.wall, kind, a, a + w, wIn)
                                a += 2 * INCH
                            }
                        }
                        if (out.isNotEmpty()) return out
                    }
                }
                return emptyList()
            }
            // The cheapest few, spread out so they are real alternatives
            fun best(list: List<Placed>, k: Int, cost: (Placed) -> Double): List<Placed> {
                val chosen = mutableListOf<Placed>()
                for (p in list.sortedBy(cost)) {
                    if (chosen.any { it.wall == p.wall && abs(it.s0 - p.s0) < 0.15 }) continue
                    chosen += p
                    if (chosen.size == k) break
                }
                return chosen
            }
            val sinkCost: (Placed) -> Double = { p ->
                val c = (p.s0 + p.s1) / 2
                if (p.wall == target.first) abs(c - target.second) else 10 + abs(c - mid(p.wall))
            }
            fun rangeCost(sink: Placed?): (Placed) -> Double = { p ->
                var c = abs((p.s0 + p.s1) / 2 - mid(p.wall)) * 0.05
                if (sink != null) {
                    c += leg(feetBetween(p, sink)) * 2
                    if (p.wall == sink.wall && runs.size > 1) c += 0.5
                }
                c
            }
            fun fridgeCost(sink: Placed?, range: Placed?): (Placed) -> Double = { p ->
                var c = 0.0
                if (sink != null) c += leg(feetBetween(p, sink)) * 2
                if (range != null) c += leg(feetBetween(p, range)) * 2
                if (sink != null && range != null) c += max(0.0, feetBetween(p, sink) + feetBetween(p, range) + feetBetween(sink, range) - 26)
                // At the end of a run
                free[p.wall]?.firstOrNull { p.s0 >= it.a - 0.001 && p.s1 <= it.b + 0.001 }?.let { span ->
                    c += min(p.s0 - span.a, span.b - p.s1) * 0.4
                }
                c
            }
            // How many guidelines a set of appliances misses
            fun misses(all: List<Placed>) = nkba(all, emptyList(), elsewhere, runs, room, 158.0, landing).count { !it.ok }

            val sinks: List<Placed?> = if (needs[Kind.Sink] == true) best(spots(Kind.Sink, listOf(36, 33, 30), placed), 6, sinkCost) else listOf(null)
            var bestSet: List<Placed>? = null
            var bestScore = Double.MAX_VALUE
            for (s in sinks.ifEmpty { listOf(null) }) {
                val withSink = placed.toMutableList().also { if (s != null) it += s }
                val sinkNow = s ?: withSink.firstOrNull { it.kind == Kind.Sink }
                var dws: List<Placed?> = listOf(null)
                if (needs[Kind.Dishwasher] == true && sinkNow != null) {
                    val w = 24 * INCH
                    val sides = listOf(Span(sinkNow.s1, sinkNow.s1 + w), Span(sinkNow.s0 - w, sinkNow.s0))
                        .filter { fitsAmong(withSink, sinkNow.wall, it.a, it.b, Kind.Dishwasher, false) }
                    if (sides.isNotEmpty()) dws = sides.map { Placed(sinkNow.wall, Kind.Dishwasher, it.a, it.b, 24) }
                }
                for (d in dws) {
                    val withDW = withSink.toMutableList().also { if (d != null) it += d }
                    var ranges: List<Placed?> = listOf(null)
                    if (needs[Kind.Range] == true) {
                        val list = best(spots(Kind.Range, listOf(30), withDW), 6, rangeCost(sinkNow))
                        if (list.isNotEmpty()) ranges = list
                    }
                    for (g in ranges) {
                        val withRange = withDW.toMutableList().also { if (g != null) it += g }
                        val rangeNow = g ?: withRange.firstOrNull { it.kind == Kind.Range }
                        var fridges: List<Placed?> = listOf(null)
                        if (needs[Kind.Fridge] == true) {
                            val list = best(spots(Kind.Fridge, listOf(36), withRange), 6, fridgeCost(sinkNow, rangeNow))
                            if (list.isNotEmpty()) fridges = list
                        }
                        for (f in fridges) {
                            val all = withRange.toMutableList().also { if (f != null) it += f }
                            val lacking = listOf(Kind.Sink, Kind.Dishwasher, Kind.Range, Kind.Fridge).count { k -> needs[k] == true && all.none { it.kind == k } }
                            var score = (lacking * 30 + misses(all) * 10).toDouble()
                            if (s != null) score += sinkCost(s) * 0.3
                            if (g != null) score += rangeCost(sinkNow)(g) * 0.3
                            if (f != null) score += fridgeCost(sinkNow, rangeNow)(f) * 0.3
                            if (score < bestScore) { bestScore = score; bestSet = all }
                        }
                    }
                }
            }
            bestSet?.let { placed = it.toMutableList() }
            missing = listOf(Kind.Sink, Kind.Dishwasher, Kind.Range, Kind.Fridge).filter { k -> needs[k] == true && placed.none { it.kind == k } }
        }

        for (r in runs) {
            val mine = placed.filter { it.wall == r.wall }.sortedBy { it.s0 }
            var baseFree = free[r.wall] ?: emptyList()
            for (p in mine) {
                baseFree = subtract(baseFree, listOf(Span(p.s0, p.s1)))
                when (p.kind) {
                    Kind.Sink -> pieces += Piece(r.wall, Kind.Sink, p.s0, p.s1, 0.0, BASE_TOP, BASE_DEPTH, "SB${p.width}")
                    Kind.Dishwasher -> pieces += Piece(r.wall, Kind.Dishwasher, p.s0, p.s1, 0.0, BASE_TOP, BASE_DEPTH)
                    Kind.Range -> {
                        pieces += Piece(r.wall, Kind.Range, p.s0, p.s1, 0.0, COUNTER_TOP, 26 * INCH)
                        pieces += Piece(r.wall, Kind.Hood, p.s0, p.s1, COUNTER_TOP + 30 * INCH, upperTop, 20 * INCH)
                    }
                    Kind.Fridge -> {
                        pieces += Piece(r.wall, Kind.Fridge, p.s0, p.s1, 0.0, FRIDGE_HEIGHT, 30 * INCH)
                        // A deep cabinet over the fridge, lined up with the wall cabinets
                        val space = upperTop - FRIDGE_HEIGHT - INCH
                        listOf(24, 18, 15, 12).firstOrNull { it * INCH <= space }?.let { h ->
                            pieces += Piece(r.wall, Kind.Wall, p.s0, p.s1, upperTop - h * INCH, upperTop, BASE_DEPTH, "W36$h")
                        }
                    }
                    else -> {}
                }
            }
            for (span in baseFree) {
                val boxes = fill(span.length)
                var x = span.a
                boxes.forEachIndexed { k, wIn ->
                    val w = wIn * INCH
                    // Drawers beside the range, where the pots live
                    val besideRange = mine.any {
                        it.kind == Kind.Range && ((k == 0 && abs(it.s1 - span.a) < 0.01) || (k == boxes.size - 1 && abs(it.s0 - span.b) < 0.01))
                    }
                    val drawers = besideRange && wIn in listOf(15, 18, 24, 30)
                    pieces += Piece(r.wall, if (drawers) Kind.Drawers else Kind.Base, x, x + w, 0.0, BASE_TOP, BASE_DEPTH, (if (drawers) "DB" else "B") + two(wIn))
                    x += w
                }
                if (span.b - x > 0.004) pieces += Piece(r.wall, Kind.Filler, x, span.b, 0.0, BASE_TOP, BASE_DEPTH)
            }

            // Countertop over the base run; where this wall meets one laid out first, that wall's top covers the corner
            val startsAtCorner = r.lo > 0.02
            val endsAtCorner = r.hi < r.len - 0.02
            val tops = merge(pieces.filter { it.wall == r.wall && it.kind.onFloor }.map { Span(it.s0, it.s1) }).map { t ->
                Span(if (startsAtCorner && abs(t.a - r.lo) < 0.01) COUNTER_DEPTH + 0.003 else t.a,
                    if (endsAtCorner && abs(t.b - r.hi) < 0.01) r.len - COUNTER_DEPTH - 0.003 else t.b)
            }.filter { it.length > 0.02 }
            counters += tops.map { Counter(r.wall, it.a, it.b) }

            // Wall cabinets: only over the counter, never over a window, door, range or fridge
            val over = merge(pieces.filter { it.wall == r.wall && it.kind.onFloor }.map { Span(it.s0, it.s1) }).map { t ->
                Span(if (startsAtCorner && abs(t.a - r.lo) < 0.01) r.upperLo else t.a, if (endsAtCorner && abs(t.b - r.hi) < 0.01) r.upperHi else t.b)
            }
            var upperFree = subtract(over, r.upperBlocks)
            upperFree = subtract(upperFree, mine.filter { it.kind == Kind.Range || it.kind == Kind.Fridge }.map { Span(it.s0, it.s1) })
            for (span in upperFree) {
                var x = span.a
                for (wIn in fill(span.length)) {
                    val w = wIn * INCH
                    pieces += Piece(r.wall, Kind.Wall, x, x + w, WALL_BOTTOM, upperTop, WALL_DEPTH, "W" + two(wIn) + upperIn)
                    x += w
                }
            }
        }
        val counterInches = counters.sumOf { it.s1 - it.s0 } / INCH
        checks = nkba(placed, missing, elsewhere, runs, room, counterInches, landing)
    }

    /** Counter beside an appliance, in inches, up to the next door, open end, range or fridge. */
    private fun landingOf(p: Placed, others: List<Placed>, runs: List<Run>, free: Map<Int, List<Span>>): Pair<Double, Double> {
        val r = runs.firstOrNull { it.wall == p.wall } ?: return 0.0 to 0.0
        val span = free[p.wall]?.firstOrNull { p.s0 >= it.a - 0.001 && p.s1 <= it.b + 0.001 } ?: return 0.0 to 0.0
        var lo = span.a
        var hi = span.b
        // Past a corner the counter carries on along the other wall
        var moreL = if (abs(span.a - r.lo) < 0.005 && r.lo > 0.02) COUNTER_DEPTH else 0.0
        var moreR = if (abs(span.b - r.hi) < 0.005 && r.hi < r.len - 0.02) COUNTER_DEPTH else 0.0
        for (o in others) {
            if (o.wall != p.wall || o == p || (o.kind != Kind.Fridge && o.kind != Kind.Range)) continue
            if (o.s1 <= p.s0 + 0.001 && o.s1 > lo) { lo = o.s1; moreL = 0.0 }
            if (o.s0 >= p.s1 - 0.001 && o.s0 < hi) { hi = o.s0; moreR = 0.0 }
        }
        return (p.s0 - lo + moreL) / INCH to (hi - p.s1 + moreR) / INCH
    }

    /** The NKBA kitchen planning guidelines this layout can be held to, in plain words. */
    private fun nkba(
        placed: List<Placed>, missing: List<Kind>, elsewhere: List<ScannedRoom.RoomObject>, runs: List<Run>, room: ScannedRoom,
        counterInches: Double, landing: (Placed, List<Placed>) -> Pair<Double, Double>,
    ): List<Check> {
        val out = mutableListOf<Check>()
        fun get(k: Kind) = placed.firstOrNull { it.kind == k }
        fun sides(l: Pair<Double, Double>) = "${max(l.first, l.second).toInt()} and ${min(l.first, l.second).toInt()} inches"
        val names = mapOf(Kind.Sink to "a sink", Kind.Dishwasher to "a dishwasher", Kind.Range to "a range", Kind.Fridge to "a fridge")
        for (k in missing) {
            out += Check(false, "No room for ${names[k] ?: "it"} on these walls", "Pick one more wall, or we find the space together at the visit")
        }
        get(Kind.Sink)?.let { s ->
            val l = landing(s, placed)
            val ok = max(l.first, l.second) >= 24 && min(l.first, l.second) >= 18
            out += Check(ok, "Counter on both sides of the sink", if (ok) "24 inches on one side, 18 on the other" else "${sides(l)} now; the guide is 24 and 18")
        }
        val d = get(Kind.Dishwasher)
        val s = get(Kind.Sink)
        if (d != null && s != null) {
            val gap = if (d.wall == s.wall) max(0.0, max(d.s0 - s.s1, s.s0 - d.s1)) / INCH else 99.0
            var stand = true
            runs.firstOrNull { it.wall == d.wall }?.let { r ->
                val keep = BASE_DEPTH + 21 * INCH - 0.005
                if (r.cornerA && d.s0 < keep) stand = false
                if (r.cornerB && d.s1 > r.len - keep) stand = false
            }
            out += Check(gap <= 36 && stand, "Dishwasher beside the sink",
                if (stand) "Within 36 inches of it, with room to stand at the open door" else "Too close to the corner to stand at it open")
        }
        get(Kind.Range)?.let { g ->
            val l = landing(g, placed)
            val window = runs.firstOrNull { it.wall == g.wall }?.holes?.any { it.kind == HoleKind.Window && it.s0 < g.s1 && it.s1 > g.s0 } ?: false
            val ok = max(l.first, l.second) >= 15 && min(l.first, l.second) >= 12
            out += Check(ok && !window, "Counter on both sides of the range",
                when {
                    window -> "It sits under a window, which the guidelines rule out"
                    ok -> "15 inches on one side, 12 on the other, no window above"
                    else -> "${sides(l)} now; the guide is 15 and 12"
                })
        }
        get(Kind.Fridge)?.let { f ->
            val l = landing(f, placed)
            val ok = max(l.first, l.second) >= 15
            out += Check(ok, "Counter beside the fridge",
                if (ok) "15 inches on its handle side, to set things down" else "${max(l.first, l.second).toInt()} inches now; the guide is 15")
        }
        // The work triangle, counting appliances that stay on walls that were not picked
        fun point(k: Kind, cats: List<String>): P2? {
            get(k)?.let { return front(it.wall, (it.s0 + it.s1) / 2, room) }
            return elsewhere.firstOrNull { it.cat in cats }?.center
        }
        val a = point(Kind.Sink, listOf("sink"))
        val b = point(Kind.Range, listOf("stove", "oven"))
        val c = point(Kind.Fridge, listOf("fridge"))
        if (a != null && b != null && c != null) {
            val legs = listOf((a - b).length, (b - c).length, (c - a).length).map { it / 0.3048 }
            val sum = legs.sum()
            val ok = legs.all { it in 4.0..9.0 } && sum <= 26
            val each = legs.map { it.roundToInt().toString() }
            out += Check(ok, "Sink, range and fridge close together",
                if (ok) "Each 4 to 9 feet apart, ${sum.roundToInt()} feet around"
                else "${each[0]}, ${each[1]} and ${each[2]} feet apart; the guide is 4 to 9 each, 26 or less around")
        }
        val counter = counterInches.roundToInt()
        out += Check(counter >= 158, "Enough counter to work on",
            if (counter >= 158) "$counter inches in all, 158 or more" else "$counter of the 158 inches suggested: one more wall or an island adds it")
        // Walkways between counters that face each other
        for (i in runs.indices) {
            for (j in runs.indices) {
                if (j <= i) continue
                val wa = room.walls[runs[i].wall]
                val wb = room.walls[runs[j].wall]
                val ua = (wa.pb - wa.pa) / max((wa.pb - wa.pa).length, 1e-6)
                val ub = (wb.pb - wb.pa) / max((wb.pb - wb.pa).length, 1e-6)
                if (abs(ua.dot(ub)) <= 0.95) continue
                val gap = abs(((wb.pa + wb.pb) / 2.0 - (wa.pa + wa.pb) / 2.0).dot(room.outward(wa)))
                val clear = ((gap - 2 * COUNTER_DEPTH) / INCH).roundToInt()
                out += Check(clear >= 42, "Room to walk between the counters",
                    if (clear >= 42) "$clear inches, 42 or more for one cook" else "$clear inches; the guide is 42 for one cook")
            }
        }
        out += Check(true, "Wall cabinets 18 inches above the counter", "Room for a coffee maker and a mixer")
        return out
    }

    private fun layClosets(runs: List<Run>) {
        for (r in runs) {
            val tallIn = listOf(96, 90, 84).firstOrNull { it * INCH <= r.height - 0.02 } ?: 84
            for (span in r.free()) {
                var x = span.a
                for (wIn in fill(span.length, listOf(15, 18, 24, 27, 30))) {
                    val w = wIn * INCH
                    pieces += Piece(r.wall, Kind.Tall, x, x + w, 0.0, tallIn * INCH, TALL_DEPTH, "PC$wIn$tallIn")
                    x += w
                }
            }
        }
    }

    companion object {
        const val INCH = 0.0254
        const val BASE_DEPTH = 24 * INCH
        const val COUNTER_DEPTH = 25.5 * INCH
        const val COUNTER_TOP = 36 * INCH
        const val COUNTER_THICK = 1.25 * INCH
        const val BASE_TOP = COUNTER_TOP - COUNTER_THICK
        const val TOE_KICK = 4 * INCH
        const val WALL_DEPTH = 12 * INCH
        const val WALL_BOTTOM = 54 * INCH
        const val TALL_DEPTH = 24 * INCH
        const val FRIDGE_HEIGHT = 70 * INCH

        /** New cabinets on the picked walls of a room. */
        fun build(room: ScannedRoom, picked: Set<Int>, style: Style): KitchenLayout {
            val k = KitchenLayout(style)
            val order = picked.filter { it in room.walls.indices && room.walls[it].len >= 0.3 }.sortedByDescending { room.walls[it].len }
            if (order.isEmpty()) return k
            val depth = if (style == Style.Kitchen) BASE_DEPTH else TALL_DEPTH
            val done = mutableListOf<Int>()
            val runs = mutableListOf<Run>()
            for (wi in order) {
                val w = room.walls[wi]
                val r = Run(wi, w.len, w.h, room.holes(w), room.objectsAgainst(w))
                for (o in order) {
                    if (o == wi) continue
                    val other = room.walls[o]
                    val atA = near(w.pa, other.pa) || near(w.pa, other.pb)
                    val atB = near(w.pb, other.pa) || near(w.pb, other.pb)
                    // The longer wall runs into the corner; this one starts past the other's boxes
                    if (atA) { r.cornerA = true; if (o in done) { r.lo = depth + 0.01; r.upperLo = WALL_DEPTH + 0.01 } }
                    if (atB) { r.cornerB = true; if (o in done) { r.hi = w.len - depth - 0.01; r.upperHi = w.len - WALL_DEPTH - 0.01 } }
                }
                done += wi
                if (r.hi - r.lo >= 9 * INCH) runs += r
            }
            if (runs.isEmpty()) return k
            if (style == Style.Kitchen) k.layKitchen(runs, room) else k.layClosets(runs)
            return k
        }

        /** The front middle of a box on a wall, seen from above */
        private fun front(wall: Int, s: Double, room: ScannedRoom): P2 {
            val w = room.walls[wall]
            val len = max((w.pb - w.pa).length, 1e-6)
            return w.pa + (w.pb - w.pa) / len * s - room.outward(w) * BASE_DEPTH
        }

        /**
         * Even boxes from the allowed widths that fill a span, the way a shop draws it;
         * what is left (under 3 inches) is a filler.
         */
        fun fill(metres: Double, widths: List<Int> = listOf(9, 12, 15, 18, 21, 24, 27, 30, 33, 36)): List<Int> {
            val total = floor(metres / INCH + 0.001).toInt()
            val ws = widths.sorted()
            val minW = ws.firstOrNull() ?: return emptyList()
            val maxW = ws.last()
            if (total < minW) return emptyList()
            val n = max(1, ceil(total.toDouble() / maxW).toInt())
            val each = ws.lastOrNull { it <= total / n } ?: return emptyList()
            val out = MutableList(n) { each }
            var left = total - each * n
            var grew = true
            while (grew) {
                grew = false
                for (i in out.indices) {
                    val next = ws.firstOrNull { it > out[i] }
                    if (next != null && next - out[i] <= left) {
                        left -= next - out[i]
                        out[i] = next
                        grew = true
                    }
                }
            }
            return out
        }

        fun two(inches: Int) = inches.toString().padStart(2, '0')

        fun near(a: P2, b: P2) = (a - b).length < 0.2

        fun subtract(spans: List<Span>, cuts: List<Span>): List<Span> {
            var out = spans
            for (c in cuts) {
                out = out.flatMap { s ->
                    if (c.b <= s.a || c.a >= s.b) listOf(s)
                    else buildList {
                        if (c.a > s.a) add(Span(s.a, c.a))
                        if (c.b < s.b) add(Span(c.b, s.b))
                    }
                }
            }
            return out.filter { it.length > 0.004 }
        }

        fun merge(spans: List<Span>): List<Span> {
            val out = mutableListOf<Span>()
            for (x in spans.sortedBy { it.a }) {
                val last = out.lastOrNull()
                if (last != null && x.a <= last.b + 0.005) out[out.size - 1] = Span(last.a, max(last.b, x.b)) else out += x
            }
            return out
        }
    }
}
