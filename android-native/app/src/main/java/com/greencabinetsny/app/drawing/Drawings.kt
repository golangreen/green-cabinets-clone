package com.greencabinetsny.app.drawing

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface
import com.greencabinetsny.app.model.Fronts
import com.greencabinetsny.app.model.HoleKind
import com.greencabinetsny.app.model.KitchenLayout
import com.greencabinetsny.app.model.LengthUnit
import com.greencabinetsny.app.model.P2
import com.greencabinetsny.app.model.ScannedRoom
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * The room as an architect's drawings, the same as the iPhone app and the
 * website: the floor plan seen from above, and any one wall seen straight on
 * from inside the room (wall in ink, door swings dashed, windows as glass
 * lines, architect's ticks on every dimension).
 */
object Ink {
    const val paper = 0xFFF1EFEA.toInt()
    const val floor = 0xFFE7E0D2.toInt()
    const val face = 0xFFE9E2D4.toInt()
    const val wall = 0xFF26221E.toInt()
    const val line = 0xFF5E574D.toInt()
    const val dim = 0xFF8A6A2F.toInt()
    const val cabinet = 0xFFDCC9A3.toInt()
    const val appliance = 0xFFFBFAF7.toInt()
    const val brass = 0xFFC6A15B.toInt()
    const val faded = 0xFFB9B1A4.toInt()
    const val glass = 0xFFCFE0E6.toInt()
    const val stone = 0xFFE4E1DB.toInt()
}

private fun upright(a: Double): Double {
    var r = a
    while (r > PI / 2) r -= PI
    while (r < -PI / 2) r += PI
    return r
}

/** Typefaces the drawings use: the system sans, and the brand serif for the area. */
class DrawingFonts(val serif: Typeface, val serifBold: Typeface)

private class Pen {
    val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; strokeJoin = Paint.Join.ROUND }
    val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    val text = Paint(Paint.ANTI_ALIAS_FLAG).apply { textAlign = Paint.Align.CENTER }

    fun stroke(c: Canvas, path: Path, color: Int, width: Float, dash: FloatArray? = null, cap: Paint.Cap = Paint.Cap.BUTT) {
        stroke.color = color
        stroke.strokeWidth = width
        stroke.pathEffect = dash?.let { DashPathEffect(it, 0f) }
        stroke.strokeCap = cap
        c.drawPath(path, stroke)
    }

    fun rect(c: Canvas, r: RectF, color: Int, width: Float, dash: FloatArray? = null) {
        stroke.color = color
        stroke.strokeWidth = width
        stroke.pathEffect = dash?.let { DashPathEffect(it, 0f) }
        stroke.strokeCap = Paint.Cap.BUTT
        c.drawRect(r, stroke)
    }

    fun fill(c: Canvas, path: Path, color: Int) { fill.color = color; c.drawPath(path, fill) }
    fun fill(c: Canvas, r: RectF, color: Int) { fill.color = color; c.drawRect(r, fill) }

    /** Centered text at a point */
    fun text(c: Canvas, s: String, x: Float, y: Float, size: Float, color: Int, bold: Boolean = false, face: Typeface? = null) {
        text.textSize = size
        text.color = color
        text.typeface = face ?: if (bold) Typeface.create(Typeface.DEFAULT, 600, false) else Typeface.create(Typeface.DEFAULT, 500, false)
        val fm = text.fontMetrics
        c.drawText(s, x, y - (fm.ascent + fm.descent) / 2, text)
    }

    fun width(s: String, size: Float, bold: Boolean = false): Float {
        text.textSize = size
        text.typeface = if (bold) Typeface.create(Typeface.DEFAULT, 600, false) else Typeface.create(Typeface.DEFAULT, 500, false)
        return text.measureText(s)
    }

    /** Size text on a paper chip so the line runs behind it. */
    fun chip(c: Canvas, s: String, x: Float, y: Float, angle: Double = 0.0, u: Float, color: Int = Ink.dim) {
        if (s.isEmpty()) return
        c.save()
        c.translate(x, y)
        c.rotate(Math.toDegrees(angle).toFloat())
        val w = width(s, 15 * u) + 12 * u
        fill(c, RectF(-w / 2, -11 * u, w / 2, 11 * u), Ink.paper)
        text(c, s, 0f, 0f, 15 * u, color)
        c.restore()
    }
}

/** One design unit: a thousandth of the drawing's width, never so small that sizes become unreadable. */
private fun unitScale(w: Float, density: Float) = max(w / 1000f, 0.78f * density)

class FloorPlanDrawing(
    val room: ScannedRoom,
    val unit: LengthUnit,
    val selected: Set<Int> = emptySet(),
    val tags: Boolean = false,
    /** New cabinets drawn in place of what the room had on their walls */
    val layout: KitchenLayout? = null,
    val fonts: DrawingFonts? = null,
    /** Screen density, so on-screen sizes stay readable (1 for exports) */
    val density: Float = 1f,
) {
    private class Frame(val s: Double, val cx: Double, val cz: Double, val w: Double, val h: Double) {
        fun x(x: Double) = (w / 2 + (x - cx) * s).toFloat()
        fun y(z: Double) = (h / 2 + (z - cz) * s).toFloat()
        fun pt(p: P2) = floatArrayOf(x(p.x), y(p.y))
    }

    private fun frame(w: Float, h: Float): Frame {
        val (lo, hi) = room.bounds
        val u = unitScale(w, density)
        val pad = if (unit == LengthUnit.None) w * 0.07 else max(w * 0.11, 58.0 * u)
        val s = min((w - 2 * pad) / max(hi.x - lo.x, 0.5), (h - 2 * pad) / max(hi.y - lo.y, 0.5))
        return Frame(s, (lo.x + hi.x) / 2, (lo.y + hi.y) / 2, w.toDouble(), h.toDouble())
    }

    /** The wall nearest a point on the drawing, or null. */
    fun wallAt(px: Float, py: Float, w: Float, h: Float): Int? {
        val f = frame(w, h)
        val u = unitScale(w, density)
        val wallW = max(5.0 * u, 0.12 * f.s)
        var best: Int? = null
        var bd = max(36.0 * u, wallW * 1.6)
        room.walls.forEachIndexed { i, wl ->
            val a = P2(f.x(wl.a[0]).toDouble(), f.y(wl.a[1]).toDouble())
            val b = P2(f.x(wl.b[0]).toDouble(), f.y(wl.b[1]).toDouble())
            val d = b - a
            val l2 = max(d.dot(d), 1.0)
            val q = P2(px.toDouble(), py.toDouble())
            val t = ((q - a).dot(d) / l2).coerceIn(0.0, 1.0)
            val dist = (q - (a + d * t)).length
            if (dist < bd) { bd = dist; best = i }
        }
        return best
    }

    fun draw(c: Canvas, w: Float, h: Float) {
        val f = frame(w, h)
        val u = unitScale(w, density)
        val s = f.s
        val pen = Pen()
        c.drawColor(Ink.paper)

        // Floor
        for (poly in room.floorPolygons) {
            val p = Path()
            poly.forEachIndexed { i, q -> if (i == 0) p.moveTo(f.x(q.x), f.y(q.y)) else p.lineTo(f.x(q.x), f.y(q.y)) }
            p.close()
            pen.fill(c, p, Ink.floor)
        }

        // Objects under the walls (not where new cabinets replace them)
        val replaced = layout?.pieces?.map { it.wall }?.toSet() ?: emptySet()
        for (o in room.objects) {
            if (room.wallIndex(o)?.let { it in replaced } == true) continue
            val ang = atan2(o.axis.y, o.axis.x)
            c.save()
            c.translate(f.x(o.c[0]), f.y(o.c[1]))
            c.rotate(Math.toDegrees(ang).toFloat())
            val ow = (o.w * s).toFloat()
            val od = (o.d * s).toFloat()
            val isCab = o.cat == "cabinet"
            val r = RectF(-ow / 2, -od / 2, ow / 2, od / 2)
            pen.fill(c, r, if (isCab) Ink.cabinet else Ink.appliance)
            pen.rect(c, r, Ink.line, max(1f, 1.6f * u))
            when {
                o.cat == "sink" -> pen.rect(c, RectF(-ow * 0.32f, -od * 0.28f, ow * 0.32f, od * 0.28f), Ink.line, max(1f, 1.6f * u))
                o.cat == "stove" -> {
                    val rr = min(ow, od) * 0.15f
                    for ((fx, fy) in listOf(-0.22f to -0.22f, 0.22f to -0.22f, -0.22f to 0.22f, 0.22f to 0.22f)) {
                        pen.stroke.color = Ink.line; pen.stroke.strokeWidth = max(1f, 1.2f * u); pen.stroke.pathEffect = null
                        c.drawCircle(fx * ow, fy * od, rr, pen.stroke)
                    }
                }
                isCab -> pen.stroke(c, Path().apply { moveTo(-ow / 2, od / 2 - 3 * u); lineTo(ow / 2, od / 2 - 3 * u) }, Ink.line, max(1f, 1.6f * u))
            }
            val label = ScannedRoom.applianceNames[o.cat]
            if (label != null && o.cat != "stove") {
                c.rotate(Math.toDegrees(upright(ang) - ang).toFloat())
                val fs = minOf(15 * u, od * 0.42f, ow * 0.3f)
                pen.text(c, label, 0f, 0f, max(fs, 4f), Ink.line)
            }
            c.restore()
        }

        layout?.let { drawLayout(it, c, f, u, pen) }

        // Walls
        val wallW = max(5.0 * u, 0.12 * s).toFloat()
        room.walls.forEachIndexed { i, wl ->
            val color = if (i in selected) Ink.brass else if (selected.isEmpty()) Ink.wall else Ink.faded
            pen.stroke(c, Path().apply { moveTo(f.x(wl.a[0]), f.y(wl.a[1])); lineTo(f.x(wl.b[0]), f.y(wl.b[1])) }, color, wallW, cap = Paint.Cap.SQUARE)
        }

        fun inward(seg: ScannedRoom.Segment) = room.outward(seg) * -1.0
        fun cut(o: ScannedRoom.Segment) {
            pen.stroke(c, Path().apply { moveTo(f.x(o.a[0]), f.y(o.a[1])); lineTo(f.x(o.b[0]), f.y(o.b[1])) }, Ink.paper, wallW + 2)
        }

        // Openings: a clean gap
        room.openings.forEach { cut(it) }

        // Windows: the gap with a triple line of glass
        for (o in room.windows) {
            cut(o)
            val n = inward(o)
            val off = wallW / 2 / s
            for (k in listOf(-off, 0.0, off)) {
                val a = o.pa + n * k
                val b = o.pb + n * k
                pen.stroke(c, Path().apply { moveTo(f.x(a.x), f.y(a.y)); lineTo(f.x(b.x), f.y(b.y)) }, Ink.wall, max(1f, 1.6f * u))
            }
        }

        // Doors: the gap, the leaf standing open into the room, and its swing
        for (o in room.doors) {
            cut(o)
            val n = inward(o)
            val r = (o.pb - o.pa).length
            val hinge = o.pa
            val tip = hinge + n * r
            pen.stroke(c, Path().apply { moveTo(f.x(hinge.x), f.y(hinge.y)); lineTo(f.x(tip.x), f.y(tip.y)) }, Ink.wall, max(1.5f, 2.4f * u))
            val a0 = atan2(o.b[1] - hinge.y, o.b[0] - hinge.x)
            var d = atan2(n.y, n.x) - a0
            while (d > PI) d -= 2 * PI
            while (d < -PI) d += 2 * PI
            val rr = (r * s).toFloat()
            val cx = f.x(hinge.x)
            val cy = f.y(hinge.y)
            val arc = Path().apply { addArc(RectF(cx - rr, cy - rr, cx + rr, cy + rr), Math.toDegrees(a0).toFloat(), Math.toDegrees(d).toFloat()) }
            pen.stroke(c, arc, Ink.wall, max(1f, 1.2f * u), floatArrayOf(6 * u, 5 * u))
        }

        // Dimension lines outside each wall
        if (unit != LengthUnit.None) {
            val gap = max(26 * u, wallW * 2.2f)
            for (wl in room.walls) {
                if (wl.len < 0.3) continue
                val n = inward(wl)
                val nx = n.x.toFloat()
                val ny = n.y.toFloat()
                val ax = f.x(wl.a[0]) - nx * gap
                val ay = f.y(wl.a[1]) - ny * gap
                val bx = f.x(wl.b[0]) - nx * gap
                val by = f.y(wl.b[1]) - ny * gap
                val line = Path().apply {
                    moveTo(ax, ay); lineTo(bx, by)
                    moveTo(ax + nx * gap * 0.75f, ay + ny * gap * 0.75f); lineTo(ax - nx * 6 * u, ay - ny * 6 * u)
                    moveTo(bx + nx * gap * 0.75f, by + ny * gap * 0.75f); lineTo(bx - nx * 6 * u, by - ny * 6 * u)
                }
                pen.stroke(c, line, Ink.dim, max(1f, 1.2f * u))
                val dx = bx - ax
                val dy = by - ay
                val l = max(hypot(dx, dy), 1f)
                val ux = dx / l
                val uy = dy / l
                val t = 6 * u
                val ticks = Path()
                for ((px, py) in listOf(ax to ay, bx to by)) {
                    ticks.moveTo(px - (ux + nx) * t, py - (uy + ny) * t)
                    ticks.lineTo(px + (ux + nx) * t, py + (uy + ny) * t)
                }
                pen.stroke(c, ticks, Ink.dim, max(1.5f, 2 * u))
                pen.chip(c, unit.length(wl.len), (ax + bx) / 2, (ay + by) / 2, upright(atan2(dy.toDouble(), dx.toDouble())), u)
            }

            // Floor area in the middle of the room
            val area = room.floorArea
            if (area > 0) {
                pen.text(c, unit.area(area), w / 2, h / 2 - 12 * u, 24 * u, Ink.wall, face = fonts?.serif)
                pen.text(c, "Ceiling ${unit.length(room.ceiling)}", w / 2, h / 2 + 14 * u, 13 * u, Ink.line)
            }
        }

        // Wall numbers while picking: a numbered dot just inside each wall
        if (tags) {
            room.walls.forEachIndexed { i, wl ->
                val n = inward(wl)
                val off = wallW * 0.5 + 22.0 * u
                val m = (wl.pa + wl.pb) / 2.0
                val cx = f.x(m.x) + (n.x * off).toFloat()
                val cy = f.y(m.y) + (n.y * off).toFloat()
                val r = 15 * u
                val on = i in selected
                pen.fill.color = if (on) Ink.brass else Ink.wall
                c.drawCircle(cx, cy, r, pen.fill)
                pen.text(c, "${i + 1}", cx, cy, 15 * u, if (on) Ink.wall else Ink.paper, bold = true)
            }
        }
    }

    /** The new cabinets from above: boxes on the floor filled, wall cabinets dashed over them. */
    private fun drawLayout(layout: KitchenLayout, c: Canvas, f: Frame, u: Float, pen: Pen) {
        val floor = layout.pieces.filter { it.kind != KitchenLayout.Kind.Wall && it.kind != KitchenLayout.Kind.Hood }
        val high = layout.pieces.filter { it.kind == KitchenLayout.Kind.Wall }
        for (p in floor + high) {
            if (p.wall !in room.walls.indices) continue
            val wl = room.walls[p.wall]
            val len = max((wl.pb - wl.pa).length, 1e-6)
            val along = (wl.pb - wl.pa) / len
            val n = room.outward(wl) * -1.0
            val a = wl.pa + along * p.s0
            val b = wl.pa + along * p.s1
            val box = Path().apply {
                moveTo(f.x(a.x), f.y(a.y)); lineTo(f.x(b.x), f.y(b.y))
                (b + n * p.depth).let { lineTo(f.x(it.x), f.y(it.y)) }
                (a + n * p.depth).let { lineTo(f.x(it.x), f.y(it.y)) }
                close()
            }
            if (p.kind == KitchenLayout.Kind.Wall) {
                pen.stroke(c, box, Ink.line, max(1f, 1.1f * u), floatArrayOf(5 * u, 4 * u))
                continue
            }
            val appliance = p.kind in listOf(KitchenLayout.Kind.Fridge, KitchenLayout.Kind.Range, KitchenLayout.Kind.Dishwasher)
            pen.fill(c, box, if (appliance) Ink.appliance else Ink.cabinet)
            pen.stroke(c, box, Ink.line, max(1f, 1.4f * u))
            val label = p.model.ifEmpty { p.kind.label }
            if (label.isEmpty()) continue
            val mid = (a + b) / 2.0 + n * (p.depth / 2)
            val tw = pen.width(label, 12 * u, bold = true)
            if (tw < p.width * f.s * 0.92 && 14 * u < p.depth * f.s * 0.9) {
                c.save()
                c.translate(f.x(mid.x), f.y(mid.y))
                c.rotate(Math.toDegrees(upright(atan2(along.y, along.x))).toFloat())
                pen.text(c, label, 0f, 0f, 12 * u, Ink.wall, bold = true)
                c.restore()
            }
        }
    }
}

class WallElevationDrawing(
    val room: ScannedRoom,
    val index: Int,
    val unit: LengthUnit,
    /** New cabinets on this wall, drawn in place of what the room had */
    val layout: KitchenLayout? = null,
    val density: Float = 1f,
) {
    fun draw(c: Canvas, W: Float, H: Float) {
        if (index !in room.walls.indices) return
        val wl = room.walls[index]
        val u = unitScale(W, density)
        val pen = Pen()
        val L = (wl.pb - wl.pa).length
        val Hm = wl.h
        val dims = unit != LengthUnit.None

        // Seen from inside the room: flip so the wall's left end is on the viewer's left
        val dir = (wl.pb - wl.pa) / max(L, 1e-6)
        val n = room.outward(wl)
        val flip = dir.x * -n.y + dir.y * n.x < 0
        fun along(s: Double) = if (flip) L - s else s

        val padX = (if (dims) 120 else 70) * u
        val padTop = (if (dims) 110 else 60) * u
        val padBot = (if (dims) 90 else 60) * u
        val k = min((W - 2 * padX) / max(L, 0.5), (H - padTop - padBot) / max(Hm, 0.5))
        val x0 = (W - L * k) / 2
        val floorY = padTop + Hm * k + ((H - padTop - padBot) - Hm * k) / 2
        fun X(s: Double) = (x0 + along(s) * k).toFloat()
        fun Y(y: Double) = (floorY - y * k).toFloat()
        fun span(a: Double, b: Double) = min(X(a), X(b)) to abs(X(b) - X(a))

        c.drawColor(Ink.paper)
        val wallRect = RectF(x0.toFloat(), Y(Hm), (x0 + L * k).toFloat(), floorY.toFloat())
        pen.fill(c, wallRect, Ink.face)

        val holes = room.holes(wl)
        for (hole in holes) {
            val (hx, hw) = span(hole.s0, hole.s1)
            val r = RectF(hx, Y(hole.top), hx + hw, Y(hole.bottom))
            pen.fill(c, r, if (hole.kind == HoleKind.Window) Ink.glass else Ink.paper)
            pen.rect(c, r, Ink.wall, max(1.5f, 2.2f * u), if (hole.kind == HoleKind.Opening) floatArrayOf(8 * u, 6 * u) else null)
            if (hole.kind == HoleKind.Window) {
                pen.rect(c, RectF(r.left + 6 * u, r.top + 6 * u, r.right - 6 * u, r.bottom - 6 * u), Ink.wall, max(1f, 1.2f * u))
                pen.stroke(c, Path().apply { moveTo(r.centerX(), r.top + 6 * u); lineTo(r.centerX(), r.bottom - 6 * u) }, Ink.wall, max(1f, 1.2f * u))
                pen.stroke(c, Path().apply { moveTo(r.left - 8 * u, r.bottom); lineTo(r.right + 8 * u, r.bottom) }, Ink.wall, max(2f, 3 * u))
            } else if (hole.kind == HoleKind.Door) {
                val v = Path().apply { moveTo(r.left, r.top); lineTo(r.right, r.centerY()); lineTo(r.left, r.bottom) }
                pen.stroke(c, v, Ink.wall, max(1f, 1.2f * u), floatArrayOf(7 * u, 6 * u))
            }
        }

        val mine = layout?.pieces?.filter { it.wall == index } ?: emptyList()
        if (mine.isNotEmpty()) drawCabinets(mine, c, ::X, ::Y, k, u, pen)
        if (mine.isEmpty()) {
            for (p in room.objectsAgainst(wl)) {
                val (ox, ow) = span(p.s0, p.s1)
                val r = RectF(ox, Y(p.top), ox + ow, Y(p.bottom))
                val isCab = p.obj.cat == "cabinet"
                pen.fill(c, r, if (isCab) Ink.cabinet else Ink.appliance)
                pen.rect(c, r, Ink.line, max(1f, 1.6f * u))
                if (isCab) {
                    val count = max(1, ((p.s1 - p.s0) / 0.5).roundToInt())
                    val doors = Path()
                    for (i in 1 until count) {
                        val x = r.left + r.width() * i / count
                        doors.moveTo(x, r.top + if (p.top < 1.2) 10 * u else 0f); doors.lineTo(x, r.bottom)
                    }
                    pen.stroke(c, doors, Ink.line, max(1f, u))
                    if (p.top < 1.2) pen.stroke(c, Path().apply { moveTo(r.left - 4 * u, r.top + 2 * u); lineTo(r.right + 4 * u, r.top + 2 * u) }, Ink.line, max(2f, 3 * u))
                } else {
                    ScannedRoom.applianceNames[p.obj.cat]?.let { name ->
                        pen.text(c, name, r.centerX(), r.centerY(), max(minOf(16 * u, r.height() * 0.3f, r.width() * 0.22f), 4f), Ink.line)
                    }
                }
            }
        }

        pen.rect(c, wallRect, Ink.wall, max(2f, 2.6f * u))
        pen.stroke(c, Path().apply { moveTo(wallRect.left - 30 * u, floorY.toFloat()); lineTo(wallRect.right + 30 * u, floorY.toFloat()) }, Ink.wall, max(3f, 5 * u))

        if (!dims) return
        fun tick(p: Path, x: Float, y: Float) { p.moveTo(x - 6 * u, y + 6 * u); p.lineTo(x + 6 * u, y - 6 * u) }
        // Overall width above the wall
        val yTop = wallRect.top - 46 * u
        pen.stroke(c, Path().apply {
            moveTo(wallRect.left, yTop); lineTo(wallRect.right, yTop)
            moveTo(wallRect.left, wallRect.top - 8 * u); lineTo(wallRect.left, yTop - 6 * u)
            moveTo(wallRect.right, wallRect.top - 8 * u); lineTo(wallRect.right, yTop - 6 * u)
        }, Ink.dim, max(1f, 1.2f * u))
        pen.stroke(c, Path().apply { tick(this, wallRect.left, yTop); tick(this, wallRect.right, yTop) }, Ink.dim, max(1.5f, 2 * u))
        pen.chip(c, unit.length(L), wallRect.centerX(), yTop, u = u)

        // A vertical size with ticks and an upright chip
        fun vDim(x: Float, ya: Float, yb: Float, text: String) {
            pen.stroke(c, Path().apply { moveTo(x, ya); lineTo(x, yb) }, Ink.dim, max(1f, 1.2f * u))
            pen.stroke(c, Path().apply { tick(this, x, ya); tick(this, x, yb) }, Ink.dim, max(1.5f, 2 * u))
            pen.chip(c, text, x, (ya + yb) / 2, -PI / 2, u)
        }
        vDim(wallRect.right + 52 * u, wallRect.top, floorY.toFloat(), unit.length(Hm))

        for (hole in holes) {
            val (hx, hw) = span(hole.s0, hole.s1)
            val label = "${unit.length(hole.s1 - hole.s0)} × ${unit.length(hole.top - hole.bottom)}"
            pen.chip(c, label, hx + hw / 2, Y(hole.top) + min(24 * u, ((hole.top - hole.bottom) * k / 2).toFloat()), u = u)
            if (hole.bottom > 0.05) vDim(hx - 18 * u, Y(hole.bottom), floorY.toFloat(), unit.length(hole.bottom))
        }
    }

    /** The new cabinets straight on: every door and drawer, the stone top, the appliances, and each box's catalog name. */
    private fun drawCabinets(pieces: List<KitchenLayout.Piece>, c: Canvas, X: (Double) -> Float, Y: (Double) -> Float, k: Double, u: Float, pen: Pen) {
        fun span(a: Double, b: Double) = min(X(a), X(b)) to abs(X(b) - X(a))
        val thin = max(1f, 1.1f * u)
        val mid = max(1f, 1.6f * u)
        for (p in pieces) {
            val (x, wd) = span(p.s0, p.s1)
            val r = RectF(x, Y(p.top), x + wd, Y(p.bottom))
            when (p.kind) {
                KitchenLayout.Kind.Hood -> {
                    val canopy = RectF(r.left, r.bottom - (0.12 * k).toFloat(), r.right, r.bottom)
                    val chimney = RectF(r.centerX() - (0.15 * k).toFloat(), r.top, r.centerX() + (0.15 * k).toFloat(), canopy.top)
                    for (b in listOf(chimney, canopy)) { pen.fill(c, b, Ink.appliance); pen.rect(c, b, Ink.line, mid) }
                }
                KitchenLayout.Kind.Fridge, KitchenLayout.Kind.Range, KitchenLayout.Kind.Dishwasher -> {
                    pen.fill(c, r, Ink.appliance)
                    pen.rect(c, r, Ink.line, mid)
                    val d = Path()
                    if (p.kind == KitchenLayout.Kind.Fridge) {
                        val y = Y(p.top * 0.34)
                        d.moveTo(r.left, y); d.lineTo(r.right, y)
                        d.moveTo(r.centerX(), r.top); d.lineTo(r.centerX(), y)
                    } else if (p.kind == KitchenLayout.Kind.Range) {
                        d.addRect(r.left + r.width() * 0.11f, Y(0.62), r.left + r.width() * 0.89f, Y(0.62) + (0.42 * k).toFloat(), Path.Direction.CW)
                    }
                    pen.stroke(c, d, Ink.line, thin)
                    val fs = minOf(15 * u, r.width() * 0.24f, r.height() * 0.3f)
                    pen.text(c, p.kind.label, r.centerX(), if (p.kind == KitchenLayout.Kind.Range) Y(0.8) else r.centerY(), max(fs, 4f), Ink.line)
                }
                else -> {
                    pen.fill(c, r, Ink.cabinet)
                    if (p.kind.onFloor || p.kind == KitchenLayout.Kind.Tall) {
                        pen.fill(c, RectF(r.left, Y(KitchenLayout.TOE_KICK), r.right, Y(0.0)), (0x8C shl 24) or (Ink.line and 0xFFFFFF))
                    }
                    pen.rect(c, r, Ink.line, mid)
                    val lines = Path()
                    val pulls = Path()
                    for (f in Fronts.of(p)) {
                        val (fx, fw) = span(p.s0 + f.x0, p.s0 + f.x1)
                        val fr = RectF(fx, Y(f.y1.toDouble()), fx + fw, Y(f.y0.toDouble()))
                        lines.addRect(fr, Path.Direction.CW)
                        if (f.drawer) {
                            val l = min(fr.width() * 0.4f, (0.25 * k).toFloat())
                            pulls.moveTo(fr.centerX() - l / 2, fr.centerY()); pulls.lineTo(fr.centerX() + l / 2, fr.centerY())
                        } else {
                            val l = min(fr.height() * 0.4f, (0.14 * k).toFloat())
                            val px = X(p.s0 + if (f.pullRight) f.x1 - 0.04 else f.x0 + 0.04)
                            val y0 = if (f.pullHigh) fr.top + (0.06 * k).toFloat() else fr.bottom - (0.06 * k).toFloat() - l
                            pulls.moveTo(px, y0); pulls.lineTo(px, y0 + l)
                        }
                    }
                    pen.stroke(c, lines, Ink.line, thin)
                    pen.stroke(c, pulls, Ink.wall, max(1.5f, 2.4f * u), cap = Paint.Cap.ROUND)
                    if (p.model.isNotEmpty()) {
                        val tw = pen.width(p.model, 12 * u, bold = true)
                        if (tw < r.width() * 0.92f) {
                            val th = 14 * u
                            val y = if (p.bottom < 0.01) Y(KitchenLayout.TOE_KICK) - th / 2 - 4 * u else r.bottom - th / 2 - 4 * u
                            pen.fill.color = (0xD9 shl 24) or (Ink.paper and 0xFFFFFF)
                            c.drawRoundRect(RectF(r.centerX() - tw / 2 - 3 * u, y - th / 2 - u, r.centerX() + tw / 2 + 3 * u, y + th / 2 + u), 3 * u, 3 * u, pen.fill)
                            pen.text(c, p.model, r.centerX(), y, 12 * u, Ink.dim, bold = true)
                        }
                    }
                }
            }
        }
        // The stone top over the base run
        for (ct in layout?.counters ?: emptyList()) {
            if (ct.wall != index) continue
            val (x, wd) = span(ct.s0, ct.s1)
            val r = RectF(x - 2 * u, Y(KitchenLayout.COUNTER_TOP), x + wd + 2 * u, Y(KitchenLayout.COUNTER_TOP - KitchenLayout.COUNTER_THICK))
            pen.fill(c, r, Ink.stone)
            pen.rect(c, r, Ink.wall, mid)
        }
    }
}

/** Pictures for sending and sharing: 1600 by 1152, with the Green Cabinets band. */
object DrawingRenderer {
    const val W = 1600
    const val H = 1152

    fun plan(room: ScannedRoom, unit: LengthUnit, selected: Set<Int>, layout: KitchenLayout?, fonts: DrawingFonts?): Bitmap {
        val b = Bitmap.createBitmap(W, H, Bitmap.Config.ARGB_8888)
        FloorPlanDrawing(room, unit, selected, layout = layout, fonts = fonts).draw(Canvas(b), W.toFloat(), H.toFloat())
        return b
    }

    fun wall(room: ScannedRoom, index: Int, unit: LengthUnit, layout: KitchenLayout?): Bitmap {
        val b = Bitmap.createBitmap(W, H, Bitmap.Config.ARGB_8888)
        WallElevationDrawing(room, index, unit, layout).draw(Canvas(b), W.toFloat(), H.toFloat())
        return b
    }

    /** The Green Cabinets band on top and the reference line below, on every exported picture. */
    fun branded(image: Bitmap, title: String, reference: String, fonts: DrawingFonts?): Bitmap {
        val w = image.width.toFloat()
        val u = w / 1000
        val band = 64 * u
        val foot = 40 * u
        val out = Bitmap.createBitmap(image.width, (image.height + band + foot).roundToInt(), Bitmap.Config.ARGB_8888)
        val c = Canvas(out)
        c.drawColor(0xFF0E0D0C.toInt())
        c.drawBitmap(image, 0f, band, null)
        val p = Paint(Paint.ANTI_ALIAS_FLAG)
        p.typeface = fonts?.serifBold ?: Typeface.SERIF
        p.textSize = 30 * u
        p.color = 0xFFF2ECE2.toInt()
        val fm = p.fontMetrics
        c.drawText("Green Cabinets", 28 * u, band / 2 - (fm.ascent + fm.descent) / 2, p)
        p.typeface = Typeface.create(Typeface.DEFAULT, 600, false)
        p.textSize = 15 * u
        p.letterSpacing = 0.13f
        p.color = 0xFFC6A15B.toInt()
        val label = title.uppercase()
        val lw = p.measureText(label)
        val fm2 = p.fontMetrics
        c.drawText(label, w - 28 * u - lw, band / 2 - (fm2.ascent + fm2.descent) / 2, p)
        p.letterSpacing = 0f
        p.typeface = Typeface.DEFAULT
        p.textSize = 13 * u
        p.color = 0xBFF2ECE2.toInt()
        p.textAlign = Paint.Align.CENTER
        val fm3 = p.fontMetrics
        c.drawText("$reference · Prepared for Green Cabinets NY · greencabinetsny.com", w / 2, out.height - foot / 2 - (fm3.ascent + fm3.descent) / 2, p)
        return out
    }
}
