package com.greencabinetsny.app.render

import android.graphics.Bitmap
import android.opengl.GLES30
import android.opengl.GLSurfaceView
import android.opengl.GLUtils
import android.opengl.Matrix
import android.os.SystemClock
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.acos
import kotlin.math.asin
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt
import kotlin.math.tan

/** Where the camera is: a point it turns around, and how far, which way and how high it looks from. */
data class Orbit(val tx: Float, val ty: Float, val tz: Float, val yaw: Float, val pitch: Float, val dist: Float) {
    fun eye(): FloatArray {
        val cp = cos(pitch)
        return floatArrayOf(tx + dist * cp * sin(yaw), ty + dist * sin(pitch), tz + dist * cp * cos(yaw))
    }

    companion object {
        fun from(eye: FloatArray, target: FloatArray): Orbit {
            val dx = eye[0] - target[0]
            val dy = eye[1] - target[1]
            val dz = eye[2] - target[2]
            val d = max(sqrt(dx * dx + dy * dy + dz * dz), 0.01f)
            return Orbit(target[0], target[1], target[2], atan2(dx, dz), asin((dy / d).coerceIn(-1f, 1f)), d)
        }
    }
}

/**
 * Draws the room with OpenGL ES 3: lambert lighting from a sun and a softer
 * fill (as in the iPhone app), walls between you and the room fading away,
 * picked walls in brass, and pictures rendered off screen at full size.
 */
class RoomRenderer(private val view: GLSurfaceView) : GLSurfaceView.Renderer {
    private val lock = Any()
    private var scene: RoomScene? = null
    private var program = 0
    private var cube = 0
    private var cubeCount = 0
    private var floorVbo = 0
    private var floorCount = 0
    private var floorDirty = true
    private var width = 1
    private var height = 1

    // Camera, animated toward `goal`
    private var orbit = Orbit(0f, 1f, 0f, 0.6f, 0.6f, 6f)
    private var from: Orbit? = null
    private var goal: Orbit? = null
    private var animStart = 0L
    private var animMs = 450L
    private var lastFrame = 0L
    /** Top view keeps the camera looking straight down */
    var top = false
        private set

    // What is shown
    var selected: Set<Int> = emptySet()
    var selecting = false
    /** Walls wearing new cabinets: what the room had there is hidden */
    private var replaced: Set<Int> = emptySet()
    /** Points along the front of the new cabinets, to see whether a wall hides them */
    private var kitchen: List<FloatArray> = emptyList()
    private var isolating = false

    // Textures by key; pictures arrive from the UI thread and are uploaded here
    private val textures = HashMap<String, Int>()
    private val pending = HashMap<String, Bitmap>()

    private val proj = FloatArray(16)
    private val viewM = FloatArray(16)
    private val vp = FloatArray(16)
    private val model = FloatArray(16)
    private val mvp = FloatArray(16)
    private val tmp = FloatArray(16)

    fun setScene(s: RoomScene) = synchronized(lock) {
        scene = s
        floorDirty = true
        resetCamera(top = false, animated = false)
        request()
    }

    fun setCabinets(layout: com.greencabinetsny.app.model.KitchenLayout?, look: RoomScene.Look) = synchronized(lock) {
        val s = scene ?: return
        s.setCabinets(layout, look)
        replaced = layout?.pieces?.map { it.wall }?.filter { it in s.walls.indices }?.toSet() ?: emptySet()
        kitchen = replaced.flatMap { i ->
            val w = s.walls[i]
            val ax = -w.normal[1]
            val az = w.normal[0]
            listOf(0.1f, 0.3f, 0.5f, 0.7f, 0.9f).map { t ->
                floatArrayOf(w.mid[0] + ax * (t - 0.5f) * w.len - w.normal[0] * 0.6f, w.mid[1] + az * (t - 0.5f) * w.len - w.normal[1] * 0.6f)
            }
        }
        request()
    }

    fun addTexture(key: String, bitmap: Bitmap) = synchronized(lock) {
        if (!textures.containsKey(key)) pending[key] = bitmap
        request()
    }

    fun hasTexture(key: String) = synchronized(lock) { textures.containsKey(key) || pending.containsKey(key) }

    fun update(selected: Set<Int>, selecting: Boolean) = synchronized(lock) {
        this.selected = selected
        this.selecting = selecting
        request()
    }

    private fun request() = view.requestRender()

    // Camera

    private fun animate(to: Orbit, animated: Boolean, ms: Long) {
        if (!animated) { orbit = to; goal = null; from = null } else {
            from = orbit; goal = to; animStart = SystemClock.uptimeMillis(); animMs = ms
        }
        request()
    }

    fun resetCamera(top: Boolean, animated: Boolean) = synchronized(lock) {
        val s = scene ?: return
        this.top = top
        val to = if (top) Orbit(0f, 0f, 0f, 0f, (PI / 2 - 0.001).toFloat(), s.span * 2.1f)
        else Orbit.from(floatArrayOf(s.span * 1.05f, s.span * 1.3f, s.span * 1.45f), floatArrayOf(0f, s.topH * 0.3f, 0f))
        animate(to, animated, 450)
    }

    /** Turns the room to face the picked walls from across it, a little above: how you would stand to look at the new kitchen. */
    fun focus(picked: Set<Int>, animated: Boolean) = synchronized(lock) {
        val s = scene ?: return
        val list = picked.sorted().filter { it in s.walls.indices }
        if (list.isEmpty()) return
        top = false
        var nx = 0f; var nz = 0f; var mx = 0f; var mz = 0f
        for (i in list) { nx += s.walls[i].normal[0]; nz += s.walls[i].normal[1]; mx += s.walls[i].mid[0]; mz += s.walls[i].mid[1] }
        mx /= list.size; mz /= list.size
        // Walls facing each other (a galley) cancel out: look down the aisle between them
        val nl = sqrt(nx * nx + nz * nz)
        if (nl < 0.01f) { val w = s.walls[list[0]].normal; nx = -w[1]; nz = w[0] } else { nx /= nl; nz /= nl }
        // Step back until every end of every picked wall, floor to wall-cabinet top, sits inside the view, looking down a little
        val aspect = width.toFloat() / max(height, 1)
        val tanV = tan(45f * PI.toFloat() / 360f) * 0.9f
        val tanH = tanV * aspect
        val pitch = 0.6f
        val corners = ArrayList<FloatArray>()
        for (i in list) {
            val w = s.walls[i]
            val ax = -w.normal[1] * w.len / 2
            val az = w.normal[0] * w.len / 2
            for ((px, pz) in listOf((w.mid[0] - ax) to (w.mid[1] - az), (w.mid[0] + ax) to (w.mid[1] + az))) {
                corners += floatArrayOf(px, 0f, pz); corners += floatArrayOf(px, min(w.height, 2.45f), pz)
            }
        }
        val target = floatArrayOf(mx, 1f, mz)
        fun fits(back: Float): Boolean {
            val c = floatArrayOf(mx - nx * back, 1f + back * tan(pitch), mz - nz * back)
            val f = norm(sub(target, c))
            val r = norm(cross(f, floatArrayOf(0f, 1f, 0f)))
            val u = cross(r, f)
            return corners.all { p ->
                val v = sub(p, c)
                val z = dot(v, f)
                z > 0.1f && abs(dot(v, r) / z) <= tanH && abs(dot(v, u) / z) <= tanV
            }
        }
        var back = s.topH * 1.2f
        repeat(40) { if (!fits(back)) back *= 1.06f }
        val dist = back / cos(pitch)
        val eye = floatArrayOf(mx - nx * back, 1f + dist * sin(pitch), mz - nz * back)
        animate(Orbit.from(eye, target), animated, 500)
    }

    // Gestures (from the UI thread)

    fun turn(dx: Float, dy: Float) = synchronized(lock) {
        goal = null
        val maxPitch = if (top) (PI / 2 - 0.001).toFloat() else Math.toRadians(88.0).toFloat()
        orbit = orbit.copy(yaw = orbit.yaw - dx * 0.008f, pitch = (orbit.pitch + dy * 0.006f).coerceIn(Math.toRadians(4.0).toFloat(), maxPitch))
        if (orbit.pitch < (PI / 2 - 0.05)) top = false
        request()
    }

    private var vx = 0f
    private var vy = 0f

    /** After a flick the room keeps turning and slows to a stop. */
    fun fling(velX: Float, velY: Float) = synchronized(lock) {
        vx = velX
        vy = velY
        request()
    }

    fun stopFling() = synchronized(lock) { vx = 0f; vy = 0f }

    fun zoom(k: Float) = synchronized(lock) {
        val s = scene ?: return
        goal = null
        orbit = orbit.copy(dist = (orbit.dist / k).coerceIn(0.8f, s.span * 6))
        request()
    }

    fun pan(dx: Float, dy: Float) = synchronized(lock) {
        goal = null
        val k = orbit.dist * 0.0018f
        // Slide along the floor, in the direction the camera faces
        val rx = cos(orbit.yaw)
        val rz = -sin(orbit.yaw)
        val fx = -sin(orbit.yaw)
        val fz = -cos(orbit.yaw)
        orbit = orbit.copy(tx = orbit.tx - (rx * dx - fx * dy) * k, tz = orbit.tz - (rz * dx - fz * dy) * k)
        request()
    }

    /** The wall under a point on the view, or null. */
    fun pick(x: Float, y: Float): Int? = synchronized(lock) {
        val s = scene ?: return null
        val inv = FloatArray(16)
        if (!Matrix.invertM(inv, 0, vp, 0)) return null
        val nxp = 2f * x / width - 1f
        val nyp = 1f - 2f * y / height
        val near = unproject(inv, nxp, nyp, -1f)
        val far = unproject(inv, nxp, nyp, 1f)
        val dir = norm(sub(far, near))
        var best: Int? = null
        var bestT = Float.MAX_VALUE
        for (b in s.boxes) {
            if (b.group != Group.Wall || b.alpha < 0.5f) continue
            val t = hit(b, near, dir) ?: continue
            if (t < bestT) { bestT = t; best = b.wall }
        }
        // Something in front (a cabinet that is showing) doesn't block: walls are what is picked
        best
    }

    private fun unproject(inv: FloatArray, x: Float, y: Float, z: Float): FloatArray {
        val v = floatArrayOf(x, y, z, 1f)
        val o = FloatArray(4)
        Matrix.multiplyMV(o, 0, inv, 0, v, 0)
        return floatArrayOf(o[0] / o[3], o[1] / o[3], o[2] / o[3])
    }

    /** Ray against a turned box: into the box's own space, then the slab test. */
    private fun hit(b: Box, o: FloatArray, d: FloatArray): Float? {
        val c = cos(-b.rot)
        val s = sin(-b.rot)
        fun local(v: FloatArray, point: Boolean): FloatArray {
            val x = if (point) v[0] - b.cx else v[0]
            val y = if (point) v[1] - b.cy else v[1]
            val z = if (point) v[2] - b.cz else v[2]
            return floatArrayOf(x * c + z * s, y, -x * s + z * c)
        }
        val lo = local(o, true)
        val ld = local(d, false)
        val half = floatArrayOf(b.w / 2, b.h / 2, b.d / 2)
        var tmin = -Float.MAX_VALUE
        var tmax = Float.MAX_VALUE
        for (i in 0 until 3) {
            if (abs(ld[i]) < 1e-6f) {
                if (lo[i] < -half[i] || lo[i] > half[i]) return null
            } else {
                var t1 = (-half[i] - lo[i]) / ld[i]
                var t2 = (half[i] - lo[i]) / ld[i]
                if (t1 > t2) { val t = t1; t1 = t2; t2 = t }
                tmin = max(tmin, t1)
                tmax = min(tmax, t2)
                if (tmin > tmax) return null
            }
        }
        return if (tmax < 0) null else max(tmin, 0f)
    }

    // GL

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        program = Gl.program(VERTEX, FRAGMENT)
        cube = Gl.vbo(Gl.cube())
        cubeCount = 36
        floorVbo = 0
        floorDirty = true
        textures.clear()
        GLES30.glEnable(GLES30.GL_DEPTH_TEST)
        GLES30.glEnable(GLES30.GL_CULL_FACE)
    }

    override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
        width = max(w, 1)
        height = max(h, 1)
        GLES30.glViewport(0, 0, width, height)
    }

    override fun onDrawFrame(gl: GL10?) {
        val again = synchronized(lock) { frame(width, height, null, isolateWall = null) }
        if (again) view.requestRender()
    }

    /** Draws one frame; true while something is still moving. */
    private fun frame(w: Int, h: Int, cam: Orbit?, isolateWall: Int?): Boolean {
        val s = scene
        GLES30.glClearColor(RoomScene.PAPER.r, RoomScene.PAPER.g, RoomScene.PAPER.b, 1f)
        GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT or GLES30.GL_DEPTH_BUFFER_BIT)
        if (s == null) return false
        uploadPending()

        val now = SystemClock.uptimeMillis()
        val dt = if (lastFrame == 0L) 16f else min((now - lastFrame).toFloat(), 100f)
        lastFrame = now
        var moving = false
        if (cam == null) {
            goal?.let { g ->
                val f = from ?: orbit
                val t = ((now - animStart).toFloat() / animMs).coerceIn(0f, 1f)
                val e = ease(t)
                var dy = g.yaw - f.yaw
                while (dy > PI) dy -= (2 * PI).toFloat()
                while (dy < -PI) dy += (2 * PI).toFloat()
                orbit = Orbit(lerp(f.tx, g.tx, e), lerp(f.ty, g.ty, e), lerp(f.tz, g.tz, e), f.yaw + dy * e, lerp(f.pitch, g.pitch, e), lerp(f.dist, g.dist, e))
                if (t >= 1f) { goal = null; from = null } else moving = true
            }
        }
        if (cam == null && (abs(vx) > 0.01f || abs(vy) > 0.01f)) {
            val maxPitch = if (top) (PI / 2 - 0.001).toFloat() else Math.toRadians(88.0).toFloat()
            orbit = orbit.copy(yaw = orbit.yaw - vx * dt * 0.008f, pitch = (orbit.pitch + vy * dt * 0.006f).coerceIn(Math.toRadians(4.0).toFloat(), maxPitch))
            val k = 0.92f.pow(dt / 16f)
            vx *= k; vy *= k
            moving = true
        }
        val o = cam ?: orbit
        val eye = o.eye()
        Matrix.perspectiveM(proj, 0, if (isolateWall != null) 50f else 45f, w.toFloat() / h, 0.05f, s.span * 20)
        Matrix.setLookAtM(viewM, 0, eye[0], eye[1], eye[2], o.tx, o.ty, o.tz, 0f, 1f, 0f)
        if (o.pitch > PI / 2 - 0.01) Matrix.setLookAtM(viewM, 0, eye[0], eye[1], eye[2], o.tx, o.ty, o.tz, 0f, 0f, -1f)
        Matrix.multiplyMM(vp, 0, proj, 0, viewM, 0)

        // Which walls, things and cabinets step back, seen from here
        val settle = cam != null
        if (fadeTargets(s, eye, isolateWall)) moving = true
        val all = s.boxes + s.cabinets
        for (b in all) {
            if (settle) b.alpha = b.target else if (abs(b.alpha - b.target) > 0.005f) {
                val step = dt / 180f
                b.alpha = if (b.alpha < b.target) min(b.target, b.alpha + step) else max(b.target, b.alpha - step)
                moving = true
            } else b.alpha = b.target
        }

        GLES30.glUseProgram(program)
        val uMvp = GLES30.glGetUniformLocation(program, "uMvp")
        val uModel = GLES30.glGetUniformLocation(program, "uModel")
        val uColor = GLES30.glGetUniformLocation(program, "uColor")
        val uTop = GLES30.glGetUniformLocation(program, "uTop")
        val uTex = GLES30.glGetUniformLocation(program, "uTex")
        val uHasTex = GLES30.glGetUniformLocation(program, "uHasTex")
        val uShine = GLES30.glGetUniformLocation(program, "uShine")
        val uEye = GLES30.glGetUniformLocation(program, "uEye")
        GLES30.glUniform3f(uEye, eye[0], eye[1], eye[2])
        GLES30.glUniform1i(uTex, 0)

        // Floor
        if (floorDirty || floorVbo == 0) {
            val f = s.floor
            val data = FloatArray(f.size / 2 * 8)
            for (i in 0 until f.size / 2) {
                val k = i * 8
                data[k] = f[i * 2]; data[k + 1] = -0.004f; data[k + 2] = f[i * 2 + 1]
                data[k + 3] = 0f; data[k + 4] = 1f; data[k + 5] = 0f
                data[k + 6] = 0f; data[k + 7] = 0f
            }
            if (floorVbo != 0) GLES30.glDeleteBuffers(1, intArrayOf(floorVbo), 0)
            floorVbo = if (data.isEmpty()) 0 else Gl.vbo(data)
            floorCount = f.size / 2
            floorDirty = false
        }
        if (floorVbo != 0) {
            GLES30.glDisable(GLES30.GL_CULL_FACE)
            Matrix.setIdentityM(model, 0)
            Matrix.multiplyMM(mvp, 0, vp, 0, model, 0)
            GLES30.glUniformMatrix4fv(uMvp, 1, false, mvp, 0)
            GLES30.glUniformMatrix4fv(uModel, 1, false, model, 0)
            GLES30.glUniform4f(uColor, RoomScene.FLOOR.r, RoomScene.FLOOR.g, RoomScene.FLOOR.b, 1f)
            GLES30.glUniform4f(uTop, RoomScene.FLOOR.r, RoomScene.FLOOR.g, RoomScene.FLOOR.b, 1f)
            GLES30.glUniform1i(uHasTex, 0)
            GLES30.glUniform1f(uShine, 0f)
            Gl.bind(floorVbo)
            GLES30.glDrawArrays(GLES30.GL_TRIANGLES, 0, floorCount)
            GLES30.glEnable(GLES30.GL_CULL_FACE)
        }

        // Opaque first, then see-through boxes far to near
        val (solid, clear) = all.filter { it.alpha > 0.01f }.partition { it.alpha >= 0.99f && it.material.color.a >= 0.99f }
        Gl.bind(cube)
        GLES30.glDisable(GLES30.GL_BLEND)
        GLES30.glDepthMask(true)
        for (b in solid) drawBox(b, uMvp, uModel, uColor, uTop, uHasTex, uShine, isolateWall)
        GLES30.glEnable(GLES30.GL_BLEND)
        GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)
        GLES30.glDepthMask(false)
        for (b in clear.sortedByDescending { (it.cx - eye[0]).pow(2) + (it.cy - eye[1]).pow(2) + (it.cz - eye[2]).pow(2) }) {
            drawBox(b, uMvp, uModel, uColor, uTop, uHasTex, uShine, isolateWall)
        }
        GLES30.glDepthMask(true)
        GLES30.glDisable(GLES30.GL_BLEND)
        return moving
    }

    private fun drawBox(b: Box, uMvp: Int, uModel: Int, uColor: Int, uTop: Int, uHasTex: Int, uShine: Int, isolateWall: Int?) {
        Matrix.setIdentityM(model, 0)
        Matrix.translateM(model, 0, b.cx, b.cy, b.cz)
        Matrix.rotateM(model, 0, Math.toDegrees(b.rot.toDouble()).toFloat(), 0f, 1f, 0f)
        Matrix.scaleM(model, 0, b.w, b.h, b.d)
        Matrix.multiplyMM(mvp, 0, vp, 0, model, 0)
        GLES30.glUniformMatrix4fv(uMvp, 1, false, mvp, 0)
        GLES30.glUniformMatrix4fv(uModel, 1, false, model, 0)
        // With new cabinets on them, picked walls stay wall colored except while picking
        val on = b.solid && b.wall != null && b.wall in selected && (replaced.isEmpty() || (selecting && isolateWall == null && !isolating))
        val c = if (on) RoomScene.BRASS else b.material.color
        val a = c.a * b.alpha
        GLES30.glUniform4f(uColor, c.r, c.g, c.b, a)
        val t = if (on) RoomScene.BRASS else b.material.top ?: c
        GLES30.glUniform4f(uTop, t.r, t.g, t.b, a)
        GLES30.glUniform1f(uShine, b.material.shine)
        val tex = b.material.texture?.let { textures[it] }
        if (tex != null) {
            GLES30.glActiveTexture(GLES30.GL_TEXTURE0)
            GLES30.glBindTexture(GLES30.GL_TEXTURE_2D, tex)
            GLES30.glUniform1i(uHasTex, 1)
        } else GLES30.glUniform1i(uHasTex, 0)
        GLES30.glDrawArrays(GLES30.GL_TRIANGLES, 0, cubeCount)
    }

    /** Sets each box's wanted opacity; true if anything is still on its way there. */
    private fun fadeTargets(s: RoomScene, eye: FloatArray, isolateWall: Int?): Boolean {
        val alone = isolateWall != null
        val picked = if (alone) setOf(isolateWall!!) else selected
        val gone = replaced
        // With new cabinets showing, the cabinets say what was picked; walls just cut away
        val sel: Set<Int> = if (gone.isEmpty() || alone) picked else emptySet()
        val anyPicked = sel.isNotEmpty()
        val camX = eye[0]
        val camZ = eye[2]
        val behind = HashSet<Int>()
        val wallTarget = FloatArray(s.walls.size)
        s.walls.forEachIndexed { i, w ->
            // A wall whose outside faces the camera would hide the room: fade it
            val outside = (camX - w.mid[0]) * w.normal[0] + (camZ - w.mid[1]) * w.normal[1] > 0 && eye[1] < w.height * 4
            if (outside) behind += i
            var target = if (outside) 0.13f else 1f
            // A picture of one wall: every other wall all but disappears
            if (alone && i !in sel) target = 0.06f
            // A wall standing between you and the new cabinets steps aside too
            if (kitchen.isNotEmpty() && i !in gone && eye[1] < w.height * 4) {
                val ax = -w.normal[1] * w.len / 2
                val az = w.normal[0] * w.len / 2
                if (kitchen.any { crosses(camX, camZ, it[0], it[1], w.mid[0] - ax, w.mid[1] - az, w.mid[0] + ax, w.mid[1] + az) }) target = 0.13f
            }
            if (anyPicked && i !in sel) target = min(target, 0.25f)
            if (anyPicked && i in sel && gone.isEmpty()) target = 1f
            wallTarget[i] = target
        }
        var moving = false
        for (b in s.boxes) {
            b.target = when (b.group) {
                Group.Wall -> b.wall?.let { wallTarget.getOrNull(it) } ?: 1f
                Group.Object -> {
                    var t = if (anyPicked && b.wall?.let { it in sel } != true) 0.15f else 1f
                    // Against a wall that is cut away: it steps back with it
                    if (b.wall != null && b.wall in behind) t = min(t, 0.25f)
                    // Replaced by the new cabinets
                    if (b.wall != null && b.wall in gone) t = 0f
                    t
                }
                else -> 1f
            }
            if (abs(b.alpha - b.target) > 0.005f) moving = true
        }
        for (b in s.cabinets) {
            // Seen from behind through a cut-away wall, they step back with it
            var t = if (b.wall != null && b.wall in behind) 0.18f else 1f
            if (anyPicked && b.wall?.let { it in sel } != true) t = min(t, 0.15f)
            b.target = t
            if (abs(b.alpha - b.target) > 0.005f) moving = true
        }
        return moving
    }

    private fun uploadPending() {
        if (pending.isEmpty()) return
        for ((k, bmp) in pending) {
            val ids = IntArray(1)
            GLES30.glGenTextures(1, ids, 0)
            GLES30.glBindTexture(GLES30.GL_TEXTURE_2D, ids[0])
            GLES30.glTexParameteri(GLES30.GL_TEXTURE_2D, GLES30.GL_TEXTURE_MIN_FILTER, GLES30.GL_LINEAR_MIPMAP_LINEAR)
            GLES30.glTexParameteri(GLES30.GL_TEXTURE_2D, GLES30.GL_TEXTURE_MAG_FILTER, GLES30.GL_LINEAR)
            GLES30.glTexParameteri(GLES30.GL_TEXTURE_2D, GLES30.GL_TEXTURE_WRAP_S, GLES30.GL_CLAMP_TO_EDGE)
            GLES30.glTexParameteri(GLES30.GL_TEXTURE_2D, GLES30.GL_TEXTURE_WRAP_T, GLES30.GL_CLAMP_TO_EDGE)
            GLUtils.texImage2D(GLES30.GL_TEXTURE_2D, 0, bmp, 0)
            GLES30.glGenerateMipmap(GLES30.GL_TEXTURE_2D)
            textures[k] = ids[0]
        }
        pending.clear()
    }

    // Pictures

    /**
     * Renders off screen at twice the size and shrinks it, for smooth edges.
     * `wall` frames one wall straight on from inside the room, the others stepping back.
     */
    fun snapshot(outW: Int, outH: Int, wall: Int? = null): Bitmap? {
        val result = arrayOfNulls<Bitmap>(1)
        val done = java.util.concurrent.CountDownLatch(1)
        view.queueEvent {
            try {
                synchronized(lock) {
                    val s = scene ?: return@synchronized
                    val w = outW * 2
                    val h = outH * 2
                    val cam = if (wall != null) wallCamera(s, wall, w.toFloat() / h) else orbit
                    isolating = wall != null
                    val fb = IntArray(1); val color = IntArray(1); val depth = IntArray(1)
                    GLES30.glGenFramebuffers(1, fb, 0)
                    GLES30.glGenRenderbuffers(1, color, 0)
                    GLES30.glGenRenderbuffers(1, depth, 0)
                    GLES30.glBindRenderbuffer(GLES30.GL_RENDERBUFFER, color[0])
                    GLES30.glRenderbufferStorage(GLES30.GL_RENDERBUFFER, GLES30.GL_RGBA8, w, h)
                    GLES30.glBindRenderbuffer(GLES30.GL_RENDERBUFFER, depth[0])
                    GLES30.glRenderbufferStorage(GLES30.GL_RENDERBUFFER, GLES30.GL_DEPTH_COMPONENT24, w, h)
                    GLES30.glBindFramebuffer(GLES30.GL_FRAMEBUFFER, fb[0])
                    GLES30.glFramebufferRenderbuffer(GLES30.GL_FRAMEBUFFER, GLES30.GL_COLOR_ATTACHMENT0, GLES30.GL_RENDERBUFFER, color[0])
                    GLES30.glFramebufferRenderbuffer(GLES30.GL_FRAMEBUFFER, GLES30.GL_DEPTH_ATTACHMENT, GLES30.GL_RENDERBUFFER, depth[0])
                    GLES30.glViewport(0, 0, w, h)
                    // The picture settles every fade for its own view first
                    frame(w, h, cam, wall)
                    val buf = ByteBuffer.allocateDirect(w * h * 4).order(ByteOrder.nativeOrder())
                    GLES30.glReadPixels(0, 0, w, h, GLES30.GL_RGBA, GLES30.GL_UNSIGNED_BYTE, buf)
                    GLES30.glBindFramebuffer(GLES30.GL_FRAMEBUFFER, 0)
                    GLES30.glDeleteFramebuffers(1, fb, 0)
                    GLES30.glDeleteRenderbuffers(1, color, 0)
                    GLES30.glDeleteRenderbuffers(1, depth, 0)
                    GLES30.glViewport(0, 0, width, height)
                    isolating = false
                    // Fades go back to the live view on the next frame
                    for (b in s.boxes + s.cabinets) b.alpha = b.alpha
                    val big = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
                    buf.rewind()
                    big.copyPixelsFromBuffer(buf)
                    val flip = android.graphics.Matrix().apply { preScale(1f, -1f) }
                    val upright = Bitmap.createBitmap(big, 0, 0, w, h, flip, true)
                    result[0] = Bitmap.createScaledBitmap(upright, outW, outH, true)
                    big.recycle(); upright.recycle()
                }
            } finally {
                done.countDown()
                view.requestRender()
            }
        }
        done.await(5, java.util.concurrent.TimeUnit.SECONDS)
        return result[0]
    }

    /** One wall framed straight on from inside the room. */
    private fun wallCamera(s: RoomScene, i: Int, aspect: Float): Orbit {
        val w = s.walls[i]
        val fov = Math.toRadians(50.0).toFloat()
        val need = max(w.height / (2 * tan(fov / 2)), w.len / (2 * tan(fov / 2) * aspect))
        val dist = need * 1.15f
        val eye = floatArrayOf(w.mid[0] - w.normal[0] * dist, w.height / 2, w.mid[1] - w.normal[1] * dist)
        return Orbit.from(eye, floatArrayOf(w.mid[0], w.height / 2, w.mid[1]))
    }

    companion object {
        /** The house curve: a strong ease-out, cubic-bezier(0.23, 1, 0.32, 1). */
        fun ease(t: Float): Float {
            // Solve the bezier for x = t
            var lo = 0f
            var hi = 1f
            var u = t
            repeat(20) {
                val x = bez(u, 0.23f, 0.32f)
                if (x < t) lo = u else hi = u
                u = (lo + hi) / 2
            }
            return bez(u, 1f, 1f)
        }

        private fun bez(t: Float, p1: Float, p2: Float): Float {
            val m = 1 - t
            return 3 * m * m * t * p1 + 3 * m * t * t * p2 + t * t * t
        }

        private fun lerp(a: Float, b: Float, t: Float) = a + (b - a) * t
        private fun sub(a: FloatArray, b: FloatArray) = floatArrayOf(a[0] - b[0], a[1] - b[1], a[2] - b[2])
        private fun dot(a: FloatArray, b: FloatArray) = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
        private fun cross(a: FloatArray, b: FloatArray) = floatArrayOf(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
        private fun norm(a: FloatArray): FloatArray { val l = max(sqrt(dot(a, a)), 1e-6f); return floatArrayOf(a[0] / l, a[1] / l, a[2] / l) }

        /** Whether two segments on the floor cross. */
        private fun crosses(ax: Float, az: Float, bx: Float, bz: Float, cx: Float, cz: Float, dx: Float, dz: Float): Boolean {
            fun side(px: Float, pz: Float, qx: Float, qz: Float, rx: Float, rz: Float) = (qx - px) * (rz - pz) - (qz - pz) * (rx - px)
            return side(ax, az, bx, bz, cx, cz) * side(ax, az, bx, bz, dx, dz) < 0 && side(cx, cz, dx, dz, ax, az) * side(cx, cz, dx, dz, bx, bz) < 0
        }

        internal const val VERTEX = """#version 300 es
            layout(location = 0) in vec3 aPos;
            layout(location = 1) in vec3 aNormal;
            layout(location = 2) in vec2 aUv;
            uniform mat4 uMvp;
            uniform mat4 uModel;
            out vec3 vNormal;
            out vec2 vUv;
            out vec3 vWorld;
            void main() {
                vNormal = normalize(mat3(uModel) * aNormal);
                vUv = aUv;
                vWorld = (uModel * vec4(aPos, 1.0)).xyz;
                gl_Position = uMvp * vec4(aPos, 1.0);
            }
        """

        // Lambert from an ambient, a sun and a softer fill on the other side (as in the iPhone app); a little shine on metal
        internal const val FRAGMENT = """#version 300 es
            precision mediump float;
            in vec3 vNormal;
            in vec2 vUv;
            in vec3 vWorld;
            uniform vec4 uColor;
            uniform vec4 uTop;
            uniform sampler2D uTex;
            uniform int uHasTex;
            uniform float uShine;
            uniform vec3 uEye;
            out vec4 fragColor;
            void main() {
                vec3 n = normalize(vNormal);
                vec4 base = n.y > 0.9 ? uTop : uColor;
                if (uHasTex == 1) base = vec4(texture(uTex, vUv).rgb, base.a);
                vec3 sun = normalize(vec3(0.6, 1.4, 0.9));
                vec3 fill = normalize(vec3(-0.7, 1.2, -0.8));
                float light = 0.52 + 0.75 * max(dot(n, sun), 0.0) + 0.42 * max(dot(n, fill), 0.0);
                vec3 c = base.rgb * min(light, 1.25);
                if (uShine > 0.0) {
                    vec3 v = normalize(uEye - vWorld);
                    vec3 h = normalize(sun + v);
                    c += uShine * 0.6 * pow(max(dot(n, h), 0.0), 24.0);
                }
                fragColor = vec4(min(c, vec3(1.0)), base.a);
            }
        """
    }
}

/** Small OpenGL helpers. */
object Gl {
    fun program(vs: String, fs: String): Int {
        fun shader(type: Int, src: String): Int {
            val s = GLES30.glCreateShader(type)
            GLES30.glShaderSource(s, src)
            GLES30.glCompileShader(s)
            val ok = IntArray(1)
            GLES30.glGetShaderiv(s, GLES30.GL_COMPILE_STATUS, ok, 0)
            if (ok[0] == 0) android.util.Log.e("GC3D", GLES30.glGetShaderInfoLog(s))
            return s
        }
        val p = GLES30.glCreateProgram()
        GLES30.glAttachShader(p, shader(GLES30.GL_VERTEX_SHADER, vs))
        GLES30.glAttachShader(p, shader(GLES30.GL_FRAGMENT_SHADER, fs))
        GLES30.glLinkProgram(p)
        return p
    }

    fun vbo(data: FloatArray): Int {
        val ids = IntArray(1)
        GLES30.glGenBuffers(1, ids, 0)
        GLES30.glBindBuffer(GLES30.GL_ARRAY_BUFFER, ids[0])
        val fb: FloatBuffer = ByteBuffer.allocateDirect(data.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().put(data)
        fb.position(0)
        GLES30.glBufferData(GLES30.GL_ARRAY_BUFFER, data.size * 4, fb, GLES30.GL_STATIC_DRAW)
        return ids[0]
    }

    /** Position, normal and uv, eight floats a vertex. */
    fun bind(vbo: Int) {
        GLES30.glBindBuffer(GLES30.GL_ARRAY_BUFFER, vbo)
        GLES30.glEnableVertexAttribArray(0)
        GLES30.glVertexAttribPointer(0, 3, GLES30.GL_FLOAT, false, 32, 0)
        GLES30.glEnableVertexAttribArray(1)
        GLES30.glVertexAttribPointer(1, 3, GLES30.GL_FLOAT, false, 32, 12)
        GLES30.glEnableVertexAttribArray(2)
        GLES30.glVertexAttribPointer(2, 2, GLES30.GL_FLOAT, false, 32, 24)
    }

    /** A unit box centered on the origin, each face carrying the whole picture. */
    fun cube(): FloatArray {
        val faces = listOf(
            // normal, then four corners counter-clockwise seen from outside
            floatArrayOf(0f, 0f, 1f) to listOf(floatArrayOf(-.5f, -.5f, .5f), floatArrayOf(.5f, -.5f, .5f), floatArrayOf(.5f, .5f, .5f), floatArrayOf(-.5f, .5f, .5f)),
            floatArrayOf(0f, 0f, -1f) to listOf(floatArrayOf(.5f, -.5f, -.5f), floatArrayOf(-.5f, -.5f, -.5f), floatArrayOf(-.5f, .5f, -.5f), floatArrayOf(.5f, .5f, -.5f)),
            floatArrayOf(1f, 0f, 0f) to listOf(floatArrayOf(.5f, -.5f, .5f), floatArrayOf(.5f, -.5f, -.5f), floatArrayOf(.5f, .5f, -.5f), floatArrayOf(.5f, .5f, .5f)),
            floatArrayOf(-1f, 0f, 0f) to listOf(floatArrayOf(-.5f, -.5f, -.5f), floatArrayOf(-.5f, -.5f, .5f), floatArrayOf(-.5f, .5f, .5f), floatArrayOf(-.5f, .5f, -.5f)),
            floatArrayOf(0f, 1f, 0f) to listOf(floatArrayOf(-.5f, .5f, .5f), floatArrayOf(.5f, .5f, .5f), floatArrayOf(.5f, .5f, -.5f), floatArrayOf(-.5f, .5f, -.5f)),
            floatArrayOf(0f, -1f, 0f) to listOf(floatArrayOf(-.5f, -.5f, -.5f), floatArrayOf(.5f, -.5f, -.5f), floatArrayOf(.5f, -.5f, .5f), floatArrayOf(-.5f, -.5f, .5f)),
        )
        val uv = listOf(floatArrayOf(0f, 1f), floatArrayOf(1f, 1f), floatArrayOf(1f, 0f), floatArrayOf(0f, 0f))
        val out = ArrayList<Float>()
        for ((n, c) in faces) {
            for (i in listOf(0, 1, 2, 0, 2, 3)) {
                out += c[i].toList(); out += n.toList(); out += uv[i].toList()
            }
        }
        return out.toFloatArray()
    }
}
