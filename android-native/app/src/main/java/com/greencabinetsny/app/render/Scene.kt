package com.greencabinetsny.app.render

import com.greencabinetsny.app.model.Fronts
import com.greencabinetsny.app.model.HoleKind
import com.greencabinetsny.app.model.KitchenLayout
import com.greencabinetsny.app.model.KitchenLayout.Kind
import com.greencabinetsny.app.model.ScannedRoom
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

/** A color as four floats. */
data class Rgba(val r: Float, val g: Float, val b: Float, val a: Float = 1f) {
    companion object {
        fun hex(v: Long, a: Float = 1f) = Rgba(((v shr 16) and 0xFF) / 255f, ((v shr 8) and 0xFF) / 255f, (v and 0xFF) / 255f, a)
        fun of(hex: String): Rgba {
            val v = hex.trim().removePrefix("#").toLongOrNull(16) ?: 0xD8D4CE
            return hex(v)
        }
    }
}

/** What a box wears: a color, maybe a picture (by key), a little shine for metal. */
data class Material(val color: Rgba, val texture: String? = null, val top: Rgba? = null, val shine: Float = 0f)

enum class Group { Wall, Object, Cabinet, Floor }

/**
 * One box in the room, in metres: its center, size along its own axes (width
 * along the wall, height, depth into the room), turned about the vertical.
 */
class Box(
    val cx: Float, val cy: Float, val cz: Float,
    val w: Float, val h: Float, val d: Float,
    val rot: Float,
    val material: Material,
    val group: Group,
    /** The wall it belongs to (walls, things against a wall, cabinets) */
    val wall: Int? = null,
    /** A solid piece of wall (not glass or a door): takes the pick color */
    val solid: Boolean = false,
) {
    /** Current and wanted opacity: walls ease out of the way as the room turns */
    var alpha = 1f
    var target = 1f
}

/**
 * The room as boxes: walls built in pieces around their doors and windows, the
 * floor, the things the room already has, and the new cabinets. The same
 * pieces and sizes as the iPhone app's SceneKit room.
 */
class RoomScene(val room: ScannedRoom) {
    val boxes = mutableListOf<Box>()
    val cabinets = mutableListOf<Box>()
    /** The floor, as triangles (x, z pairs) */
    var floor: FloatArray = FloatArray(0)
        private set

    /** The room's middle, subtracted from everything so it turns about its center */
    val cx: Float
    val cz: Float
    val span: Float
    val topH: Float

    class WallInfo(val mid: FloatArray, val normal: FloatArray, val len: Float, val height: Float)
    val walls = mutableListOf<WallInfo>()

    init {
        val (lo, hi) = room.bounds
        cx = ((lo.x + hi.x) / 2).toFloat()
        cz = ((lo.y + hi.y) / 2).toFloat()
        span = maxOf((hi.x - lo.x).toFloat(), (hi.y - lo.y).toFloat(), 2f)
        topH = max(2.4f, room.ceiling.toFloat())
        build()
    }

    private fun build() {
        val fy = room.floorLevel
        floor = Triangulate.polygons(room.floorPolygons.map { poly -> poly.map { floatArrayOf(it.x.toFloat() - cx, it.y.toFloat() - cz) } })

        val wallT = 0.1f
        room.walls.forEachIndexed { wi, w ->
            val ax = w.a[0].toFloat() - cx
            val az = w.a[1].toFloat() - cz
            val bx = w.b[0].toFloat() - cx
            val bz = w.b[1].toFloat() - cz
            val len = sqrt((bx - ax) * (bx - ax) + (bz - az) * (bz - az))
            val H = w.h.toFloat()
            val o = room.outward(w)
            walls += WallInfo(floatArrayOf((ax + bx) / 2, (az + bz) / 2), floatArrayOf(o.x.toFloat(), o.y.toFloat()), len, H)
            if (len < 0.05f) return@forEachIndexed
            val ux = (bx - ax) / len
            val uz = (bz - az) / len
            val rot = atan2(-uz, ux)
            val base = w.y?.let { max(0.0, it - w.h / 2 - fy) }?.toFloat() ?: 0f
            fun at(s: Float) = floatArrayOf(ax + ux * s, az + uz * s)
            fun piece(s0: Float, s1: Float, y0: Float, y1: Float) {
                if (s1 - s0 < 0.005f || y1 - y0 < 0.005f) return
                val p = at((s0 + s1) / 2)
                boxes += Box(p[0], base + (y0 + y1) / 2, p[1], s1 - s0, y1 - y0, wallT, rot, Material(WALL, top = WALL_TOP), Group.Wall, wi, solid = true)
            }
            var cur = 0f
            for (hole in room.holes(w)) {
                val s0 = max(cur, hole.s0.toFloat())
                val s1 = hole.s1.toFloat()
                if (s0 >= s1) continue
                val bot = hole.bottom.toFloat()
                val top = hole.top.toFloat()
                piece(cur, s0, 0f, H)
                piece(s0, s1, 0f, bot)
                piece(s0, s1, top, H)
                val p = at((s0 + s1) / 2)
                when (hole.kind) {
                    HoleKind.Window -> boxes += Box(p[0], base + (bot + top) / 2, p[1], s1 - s0, top - bot, 0.025f, rot,
                        Material(Rgba(0.56f, 0.79f, 0.93f, 0.4f)), Group.Wall, wi)
                    HoleKind.Door -> {
                        val mat = Material(Rgba(0.64f, 0.48f, 0.32f))
                        if (hole.open) {
                            // Open door: the leaf swung into the room from its hinge side
                            val hinge = at(s0)
                            val ix = -o.x.toFloat()
                            val iz = -o.y.toFloat()
                            val r2 = atan2(-iz, ix)
                            val dx = cos(r2)
                            val dz = -sin(r2)
                            boxes += Box(hinge[0] + dx * (s1 - s0) / 2, base + (bot + top) / 2, hinge[1] + dz * (s1 - s0) / 2, s1 - s0, top - bot, 0.04f, r2, mat, Group.Wall, wi)
                        } else {
                            boxes += Box(p[0], base + (bot + top) / 2, p[1], s1 - s0, top - bot, 0.04f, rot, mat, Group.Wall, wi)
                        }
                    }
                    HoleKind.Opening -> {}
                }
                cur = s1
            }
            piece(cur, len, 0f, H)
        }

        // Fixed things as simple blocks
        for (o in room.objects) {
            val rot = atan2(-o.axis.y.toFloat(), o.axis.x.toFloat())
            val bot = o.y?.let { max(0.0, it - o.h / 2 - fy) }?.toFloat() ?: 0f
            boxes += Box(o.c[0].toFloat() - cx, bot + o.h.toFloat() / 2, o.c[1].toFloat() - cz, o.w.toFloat(), o.h.toFloat(), o.d.toFloat(), rot,
                Material(OBJECTS[o.cat] ?: Rgba(0.81f, 0.78f, 0.73f)), Group.Object, room.wallIndex(o))
        }
    }

    /** The look of the new cabinets: door and countertop pictures (by key) and colors. */
    data class Look(val doorTexture: String?, val doorColor: Rgba, val counterTexture: String?, val counterColor: Rgba)

    /** Replaces the new cabinets: carcasses on a toe kick, doors and drawer fronts with pulls, a stone top with the sink, appliances. */
    fun setCabinets(layout: KitchenLayout?, look: Look) {
        cabinets.clear()
        if (layout == null || layout.isEmpty) return
        val fy = room.floorLevel
        val door = Material(look.doorColor, look.doorTexture)
        val stone = Material(look.counterColor, look.counterTexture)
        val toe = Material(Rgba(0.16f, 0.15f, 0.14f))
        val steel = Material(Rgba(0.76f, 0.77f, 0.78f), shine = 0.4f)
        val dark = Material(Rgba(0.1f, 0.1f, 0.11f), shine = 0.4f)
        val pull = Material(Rgba(0.2f, 0.18f, 0.16f), shine = 0.4f)

        for (p in layout.pieces) {
            if (p.wall !in room.walls.indices) continue
            val f = WallFrame(room, room.walls[p.wall], fy, cx, cz)
            val w = p.width.toFloat() - 0.003f
            val mid = ((p.s0 + p.s1) / 2).toFloat()
            val d = p.depth.toFloat()
            val out = mutableListOf<Box>()
            fun box(at: Float, o: Float, y0: Float, y1: Float, bw: Float, bd: Float, m: Material) { out += f.box(at, o, y0, y1, bw, bd, m, p.wall) }
            when (p.kind) {
                Kind.Base, Kind.Sink, Kind.Drawers, Kind.Tall, Kind.Filler -> {
                    val kick = KitchenLayout.TOE_KICK.toFloat()
                    box(mid, d / 2, kick, p.top.toFloat(), w, d, door)
                    box(mid, (d - 0.075f) / 2, 0f, kick, w, d - 0.075f, toe)
                    if (p.kind != Kind.Filler) Fronts.of(p).forEach { fr -> out += f.front(fr, p.s0.toFloat(), d, door, pull, p.wall) }
                }
                Kind.Wall -> {
                    box(mid, d / 2, p.bottom.toFloat(), p.top.toFloat(), w, d, door)
                    Fronts.of(p).forEach { fr -> out += f.front(fr, p.s0.toFloat(), d, door, pull, p.wall) }
                }
                Kind.Dishwasher -> {
                    val kick = KitchenLayout.TOE_KICK.toFloat()
                    box(mid, (d - 0.075f) / 2, 0f, kick, w, d - 0.075f, toe)
                    box(mid, d / 2, kick, p.top.toFloat(), w, d, steel)
                    box(mid, d + 0.01f, p.top.toFloat() - 0.09f, p.top.toFloat() - 0.075f, w * 0.7f, 0.02f, pull)
                }
                Kind.Fridge -> {
                    val h = p.top.toFloat()
                    box(mid, d / 2, 0f, h, w, d, steel)
                    // French doors over a freezer drawer
                    box(mid, d + 0.002f, h * 0.34f, h * 0.345f, w, 0.006f, dark)
                    box(mid, d + 0.002f, h * 0.345f, h, 0.006f, 0.006f, dark)
                    for (x in listOf(mid - 0.03f, mid + 0.03f)) box(x, d + 0.03f, h * 0.45f, h * 0.85f, 0.016f, 0.02f, steel)
                    box(mid, d + 0.03f, h * 0.29f, h * 0.305f, w * 0.6f, 0.02f, steel)
                }
                Kind.Range -> {
                    val h = p.top.toFloat()
                    box(mid, d / 2, 0f, h - 0.012f, w, d, steel)
                    box(mid, d / 2, h - 0.012f, h, w, d, dark)
                    box(mid, d + 0.003f, 0.2f, 0.62f, w * 0.78f, 0.006f, dark)
                    box(mid, d + 0.03f, 0.66f, 0.675f, w * 0.7f, 0.02f, steel)
                }
                Kind.Hood -> {
                    val y0 = p.bottom.toFloat()
                    val y1 = p.top.toFloat()
                    box(mid, d / 2, y0, y0 + 0.12f, w, d, steel)
                    box(mid, 0.14f, y0 + 0.12f, y1, 0.3f, 0.28f, steel)
                }
            }
            cabinets += out
        }

        // Stone tops, and the sink and faucet in them
        for (c in layout.counters) {
            if (c.wall !in room.walls.indices) continue
            val f = WallFrame(room, room.walls[c.wall], fy, cx, cz)
            val cd = KitchenLayout.COUNTER_DEPTH.toFloat()
            val y0 = KitchenLayout.BASE_TOP.toFloat()
            cabinets += f.box(((c.s0 + c.s1) / 2).toFloat(), cd / 2, y0, y0 + KitchenLayout.COUNTER_THICK.toFloat(), (c.s1 - c.s0).toFloat(), cd, stone, c.wall)
            for (s in layout.pieces) {
                if (s.wall != c.wall || s.kind != Kind.Sink || s.s0 < c.s0 - 0.01 || s.s1 > c.s1 + 0.01) continue
                val m = ((s.s0 + s.s1) / 2).toFloat()
                val top = KitchenLayout.COUNTER_TOP.toFloat()
                cabinets += f.box(m, 0.33f, top, top + 0.003f, s.width.toFloat() * 0.78f, 0.43f, dark, c.wall)
                cabinets += f.box(m, 0.07f, top, top + 0.32f, 0.025f, 0.025f, steel, c.wall)
                cabinets += f.box(m, 0.15f, top + 0.29f, top + 0.32f, 0.025f, 0.17f, steel, c.wall)
            }
        }
    }

    /** Places boxes against one wall: along it from end a, out from it into the room. */
    private class WallFrame(room: ScannedRoom, w: ScannedRoom.Segment, fy: Double, cx: Float, cz: Float) {
        val ax = w.a[0].toFloat() - cx
        val az = w.a[1].toFloat() - cz
        val ux: Float
        val uz: Float
        val nx: Float
        val nz: Float
        val rot: Float
        val base: Float = w.y?.let { max(0.0, it - w.h / 2 - fy) }?.toFloat() ?: 0f

        init {
            val bx = w.b[0].toFloat() - cx
            val bz = w.b[1].toFloat() - cz
            val l = max(sqrt((bx - ax) * (bx - ax) + (bz - az) * (bz - az)), 1e-4f)
            ux = (bx - ax) / l
            uz = (bz - az) / l
            val o = room.outward(w)
            nx = -o.x.toFloat()
            nz = -o.y.toFloat()
            rot = atan2(-uz, ux)
        }

        fun box(s: Float, out: Float, y0: Float, y1: Float, w: Float, d: Float, m: Material, wall: Int): Box {
            val px = ax + ux * s + nx * out
            val pz = az + uz * s + nz * out
            return Box(px, base + (y0 + y1) / 2, pz, max(w, 0.001f), max(y1 - y0, 0.001f), max(d, 0.001f), rot, m, Group.Cabinet, wall)
        }

        fun front(f: com.greencabinetsny.app.model.Front, start: Float, depth: Float, m: Material, pull: Material, wall: Int): List<Box> {
            val t = 0.019f
            val out = mutableListOf(box(start + (f.x0 + f.x1) / 2, depth + t / 2, f.y0, f.y1, f.x1 - f.x0, t, m, wall))
            // The pull: a bar across a drawer, or up the opening edge of a door
            val h = f.y1 - f.y0
            val w = f.x1 - f.x0
            if (f.drawer) {
                val len = min(w * 0.5f, 0.3f)
                out += box(start + (f.x0 + f.x1) / 2, depth + t + 0.012f, f.y1 - h / 2 - 0.006f, f.y1 - h / 2 + 0.006f, len, 0.016f, pull, wall)
            } else {
                val len = min(h * 0.4f, 0.14f)
                val x = if (f.pullRight) f.x1 - 0.04f else f.x0 + 0.04f
                val y = if (f.pullHigh) f.y1 - 0.06f - len else f.y0 + 0.06f
                out += box(start + x, depth + t + 0.012f, y, y + len, 0.012f, 0.016f, pull, wall)
            }
            return out
        }
    }

    companion object {
        val WALL = Rgba(0.925f, 0.91f, 0.875f)
        val WALL_TOP = Rgba(0.45f, 0.42f, 0.38f)
        val BRASS = Rgba(198 / 255f, 161 / 255f, 91 / 255f)
        val FLOOR = Rgba(0.95f, 0.93f, 0.88f)
        val PAPER = Rgba(241 / 255f, 239 / 255f, 234 / 255f)
        val OBJECTS = mapOf(
            "cabinet" to Rgba(0.79f, 0.65f, 0.49f), "table" to Rgba(0.73f, 0.55f, 0.37f),
            "fridge" to Rgba(0.84f, 0.85f, 0.87f), "stove" to Rgba(0.73f, 0.75f, 0.77f),
            "oven" to Rgba(0.73f, 0.75f, 0.77f), "dishwasher" to Rgba(0.84f, 0.85f, 0.87f),
            "washer" to Rgba(0.84f, 0.85f, 0.87f), "sink" to Rgba(0.95f, 0.96f, 0.97f),
            "toilet" to Rgba(0.95f, 0.96f, 0.97f), "tub" to Rgba(0.95f, 0.96f, 0.97f),
            "bed" to Rgba(0.66f, 0.72f, 0.78f), "sofa" to Rgba(0.62f, 0.69f, 0.63f),
            "tv" to Rgba(0.23f, 0.25f, 0.27f),
        )
    }
}

/** Floor polygons into triangles (ear clipping, so L-shaped rooms work too). */
object Triangulate {
    fun polygons(polys: List<List<FloatArray>>): FloatArray {
        val out = ArrayList<Float>()
        for (poly in polys) out += ear(poly)
        return out.toFloatArray()
    }

    private fun ear(input: List<FloatArray>): List<Float> {
        if (input.size < 3) return emptyList()
        // Counter-clockwise
        var area = 0f
        for (i in input.indices) { val p = input[i]; val q = input[(i + 1) % input.size]; area += p[0] * q[1] - q[0] * p[1] }
        val pts = if (area < 0) input.reversed().toMutableList() else input.toMutableList()
        val out = ArrayList<Float>()
        var guard = 0
        while (pts.size > 3 && guard++ < 500) {
            var clipped = false
            for (i in pts.indices) {
                val a = pts[(i + pts.size - 1) % pts.size]
                val b = pts[i]
                val c = pts[(i + 1) % pts.size]
                val cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
                if (cross <= 0) continue
                if (pts.any { it !== a && it !== b && it !== c && inside(it, a, b, c) }) continue
                out += listOf(a[0], a[1], b[0], b[1], c[0], c[1])
                pts.removeAt(i)
                clipped = true
                break
            }
            if (!clipped) break
        }
        if (pts.size == 3) out += listOf(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1])
        return out
    }

    private fun inside(p: FloatArray, a: FloatArray, b: FloatArray, c: FloatArray): Boolean {
        fun s(p1: FloatArray, p2: FloatArray, p3: FloatArray) = (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])
        val d1 = s(p, a, b)
        val d2 = s(p, b, c)
        val d3 = s(p, c, a)
        val neg = d1 < 0 || d2 < 0 || d3 < 0
        val pos = d1 > 0 || d2 > 0 || d3 > 0
        return !(neg && pos)
    }
}
