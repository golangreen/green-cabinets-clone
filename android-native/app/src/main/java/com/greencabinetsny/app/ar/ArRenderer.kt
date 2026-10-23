package com.greencabinetsny.app.ar

import android.graphics.Bitmap
import android.opengl.GLES11Ext
import android.opengl.GLES30
import android.opengl.GLSurfaceView
import android.opengl.GLUtils
import android.opengl.Matrix
import com.google.ar.core.Coordinates2d
import com.google.ar.core.Frame
import com.google.ar.core.Plane
import com.google.ar.core.Point
import com.google.ar.core.Session
import com.google.ar.core.TrackingState
import com.greencabinetsny.app.model.DoorStyle
import com.greencabinetsny.app.render.Gl
import com.greencabinetsny.app.render.Material
import com.greencabinetsny.app.render.RoomRenderer
import com.greencabinetsny.app.render.Rgba
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

/** The cabinets a person can place, sizes in inches (width, height, depth), and how high off the floor the box sits. */
enum class CabinetKind(val title: String, val w: Float, val h: Float, val d: Float, val lift: Float = 0f) {
    Base24("Base 24\"", 24f, 34.5f, 24f),
    Base36("Base 36\"", 36f, 34.5f, 24f),
    Drawers24("Drawers 24\"", 24f, 34.5f, 24f),
    Wall30("Wall 30\"", 30f, 30f, 12f, 54f),
    Tall24("Pantry 24\"", 24f, 84f, 24f);

    val size: FloatArray get() = floatArrayOf(w * I, h * I, d * I)
    val liftM: Float get() = lift * I
    val hasCounter: Boolean get() = this == Base24 || this == Base36 || this == Drawers24

    companion object { const val I = 0.0254f }
}

/** A box in a cabinet's own space: origin at the middle of its floor footprint, front facing +z. */
class Part(val x: Float, val y: Float, val z: Float, val w: Float, val h: Float, val d: Float, val m: Material, val finish: Boolean)

/** One placed cabinet: where it stands on the floor, which way it faces, and its parts. */
class Placed(var kind: CabinetKind, var x: Float, var y: Float, var z: Float, var yaw: Float) {
    var parts: List<Part> = emptyList()
}

/** One measurement: two points in the room, and the second one may still be following the aim. */
class Measurement(val a: FloatArray, var b: FloatArray?)

/**
 * Draws what the camera sees with ARCore, and over it either the cabinets a
 * person places (the same boxes, doors and pulls as the iPhone app) or the
 * lines of a tape measure.
 */
class ArRenderer(private val view: GLSurfaceView, private val measuring: Boolean) : GLSurfaceView.Renderer {
    private val lock = Any()
    var session: Session? = null
    private var program = 0
    private var bgProgram = 0
    private var cube = 0
    private var cameraTex = 0
    private var bgQuad: FloatBuffer = ByteBuffer.allocateDirect(8 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
    private var bgUv: FloatBuffer = ByteBuffer.allocateDirect(8 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
    private var width = 1
    private var height = 1
    private var rotation = 0
    private val proj = FloatArray(16)
    private val viewM = FloatArray(16)
    private val vp = FloatArray(16)
    private val model = FloatArray(16)
    private val mvp = FloatArray(16)

    // Cabinets
    val cabinets = mutableListOf<Placed>()
    var selected: Placed? = null
    var finish: Material = Material(Rgba(0.85f, 0.83f, 0.8f))
    private var finishKey: String? = null
    private val textures = HashMap<String, Int>()
    private val pending = HashMap<String, Bitmap>()
    var door: DoorStyle = DoorStyle.Shaker
    var counter: Material? = null
    /** No pick outline in a picture */
    private var hideOutline = false

    // Measuring
    val measurements = mutableListOf<Measurement>()
    /** Where the aim lands on a surface now, or null */
    @Volatile var aim: FloatArray? = null
        private set

    /** Floor found: the hint changes */
    @Volatile var tracking = false
        private set
    @Volatile var hasPlane = false
        private set

    /** Called after every frame with the screen points of the measurement labels */
    var onLabels: ((List<Pair<FloatArray, Float>>) -> Unit)? = null

    private var captureRequest: ((Bitmap?) -> Unit)? = null
    private var lastFrame: Frame? = null

    fun setRotation(r: Int) { rotation = r }

    fun setFinish(key: String, m: Material, bitmap: Bitmap?) = synchronized(lock) {
        finish = m.copy(texture = if (bitmap != null) key else null)
        finishKey = key
        if (bitmap != null && !textures.containsKey(key)) pending[key] = bitmap
        rebuild()
    }

    fun setCounter(key: String, m: Material, bitmap: Bitmap?) = synchronized(lock) {
        counter = m.copy(texture = if (bitmap != null) key else null)
        if (bitmap != null && !textures.containsKey(key)) pending[key] = bitmap
        rebuild()
    }

    fun chooseDoor(d: DoorStyle) = synchronized(lock) { door = d; rebuild() }

    private fun rebuild() { for (c in cabinets) c.parts = Cabinet.build(c.kind, finish, door, counter) }

    /** Places a cabinet on the floor where the person tapped, facing them. */
    fun tapPlace(x: Float, y: Float, kind: CabinetKind): Placed? = synchronized(lock) {
        val frame = lastFrame ?: return null
        // A tap on a cabinet picks it
        pickCabinet(x, y)?.let { c -> selected = if (selected === c) null else c; return c }
        val hit = frame.hitTest(x, y).firstOrNull { h ->
            val t = h.trackable
            t is Plane && t.type == Plane.Type.HORIZONTAL_UPWARD_FACING && t.isPoseInPolygon(h.hitPose)
        } ?: return null
        val p = hit.hitPose
        val cam = frame.camera.pose
        val yaw = atan2(cam.tx() - p.tx(), cam.tz() - p.tz())
        place(kind, p.tx(), p.ty(), p.tz(), yaw)
    }

    private fun place(kind: CabinetKind, x: Float, y: Float, z: Float, yaw: Float): Placed {
        val c = Placed(kind, x, y, z, yaw)
        c.parts = Cabinet.build(kind, finish, door, counter)
        cabinets += c
        selected = c
        return c
    }

    /** The next cabinet goes flush against the right side of the picked one. */
    fun addNext(kind: CabinetKind): Placed? = synchronized(lock) {
        val cur = selected ?: return null
        val rx = cos(cur.yaw)
        val rz = -sin(cur.yaw)
        val bx = -sin(cur.yaw)
        val bz = -cos(cur.yaw)
        val along = (cur.kind.size[0] + kind.size[0]) / 2
        // Keep the backs on the same wall line when depths differ (wall vs base)
        val back = (cur.kind.size[2] - kind.size[2]) / 2
        place(kind, cur.x + rx * along + bx * back, cur.y, cur.z + rz * along + bz * back, cur.yaw)
    }

    fun removeSelected() = synchronized(lock) {
        val cur = selected ?: return
        cabinets.remove(cur)
        selected = cabinets.lastOrNull()
    }

    /** Moves the picked cabinet to where the finger is on the floor. */
    fun dragTo(x: Float, y: Float) = synchronized(lock) {
        val c = selected ?: return
        val frame = lastFrame ?: return
        val hit = frame.hitTest(x, y).firstOrNull { it.trackable is Plane } ?: return
        c.x = hit.hitPose.tx(); c.z = hit.hitPose.tz()
    }

    fun turnSelected(by: Float) = synchronized(lock) { selected?.let { it.yaw += by } }

    /** Whether a cabinet is under this point (without picking it). */
    fun cabinetAt(x: Float, y: Float): Boolean = synchronized(lock) { pickCabinet(x, y) != null }

    fun selectAt(x: Float, y: Float): Boolean = synchronized(lock) {
        val c = pickCabinet(x, y) ?: return false
        selected = c
        true
    }

    // Measuring

    /** "+": starts a measurement at the aim, or ends the one in progress. */
    fun addPoint(): Boolean = synchronized(lock) {
        val a = aim ?: return false
        val last = measurements.lastOrNull()
        if (last != null && last.b == null) last.b = a.copyOf() else measurements += Measurement(a.copyOf(), null)
        true
    }

    fun undo() {
        synchronized(lock) {
            val last = measurements.lastOrNull() ?: return
            if (last.b != null) last.b = null else measurements.removeAt(measurements.lastIndex)
        }
    }

    fun lengths(): List<Double> = synchronized(lock) {
        measurements.mapNotNull { m -> m.b?.let { b -> dist(m.a, b).toDouble() } }
    }

    /** The camera frame and everything drawn over it, as a picture. */
    fun capture(hideSelection: Boolean, done: (Bitmap?) -> Unit) = synchronized(lock) {
        hideOutline = hideSelection
        captureRequest = done
        view.requestRender()
    }

    // GL

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        GLES30.glClearColor(0f, 0f, 0f, 1f)
        program = Gl.program(RoomRenderer.VERTEX, RoomRenderer.FRAGMENT)
        bgProgram = Gl.program(BG_VERTEX, BG_FRAGMENT)
        cube = Gl.vbo(Gl.cube())
        val ids = IntArray(1)
        GLES30.glGenTextures(1, ids, 0)
        cameraTex = ids[0]
        GLES30.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, cameraTex)
        GLES30.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES30.GL_TEXTURE_WRAP_S, GLES30.GL_CLAMP_TO_EDGE)
        GLES30.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES30.GL_TEXTURE_WRAP_T, GLES30.GL_CLAMP_TO_EDGE)
        GLES30.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES30.GL_TEXTURE_MIN_FILTER, GLES30.GL_LINEAR)
        GLES30.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES30.GL_TEXTURE_MAG_FILTER, GLES30.GL_LINEAR)
        bgQuad.put(floatArrayOf(-1f, -1f, 1f, -1f, -1f, 1f, 1f, 1f)).position(0)
        textures.clear()
        session?.setCameraTextureName(cameraTex)
    }

    override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
        width = w; height = h
        GLES30.glViewport(0, 0, w, h)
        session?.setDisplayGeometry(rotation, w, h)
    }

    override fun onDrawFrame(gl: GL10?) {
        GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT or GLES30.GL_DEPTH_BUFFER_BIT)
        val s = session ?: return
        s.setCameraTextureName(cameraTex)
        val frame = try { s.update() } catch (e: Exception) { return }
        synchronized(lock) {
            lastFrame = frame
            uploadPending()
            drawBackground(frame)
            val camera = frame.camera
            tracking = camera.trackingState == TrackingState.TRACKING
            if (!tracking) { finishCapture(); return }
            hasPlane = hasPlane || s.getAllTrackables(Plane::class.java).any { it.trackingState == TrackingState.TRACKING && it.type == Plane.Type.HORIZONTAL_UPWARD_FACING }
            camera.getProjectionMatrix(proj, 0, 0.05f, 100f)
            camera.getViewMatrix(viewM, 0)
            Matrix.multiplyMM(vp, 0, proj, 0, viewM, 0)

            GLES30.glEnable(GLES30.GL_DEPTH_TEST)
            GLES30.glEnable(GLES30.GL_CULL_FACE)
            GLES30.glUseProgram(program)
            Gl.bind(cube)
            val eye = floatArrayOf(camera.pose.tx(), camera.pose.ty(), camera.pose.tz())
            GLES30.glUniform3f(GLES30.glGetUniformLocation(program, "uEye"), eye[0], eye[1], eye[2])
            GLES30.glUniform1i(GLES30.glGetUniformLocation(program, "uTex"), 0)

            if (measuring) drawMeasure(frame) else drawCabinets()
            GLES30.glDisable(GLES30.GL_DEPTH_TEST)
            finishCapture()
        }
    }

    private fun finishCapture() {
        val cb = captureRequest ?: return
        captureRequest = null
        val buf = ByteBuffer.allocateDirect(width * height * 4).order(ByteOrder.nativeOrder())
        GLES30.glReadPixels(0, 0, width, height, GLES30.GL_RGBA, GLES30.GL_UNSIGNED_BYTE, buf)
        val b = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        buf.rewind()
        b.copyPixelsFromBuffer(buf)
        val flip = android.graphics.Matrix().apply { preScale(1f, -1f) }
        val out = Bitmap.createBitmap(b, 0, 0, width, height, flip, true)
        hideOutline = false
        view.post { cb(out) }
    }

    private fun drawBackground(frame: Frame) {
        if (frame.hasDisplayGeometryChanged()) {
            bgQuad.position(0)
            frame.transformCoordinates2d(Coordinates2d.OPENGL_NORMALIZED_DEVICE_COORDINATES, bgQuad, Coordinates2d.TEXTURE_NORMALIZED, bgUv)
        }
        if (frame.timestamp == 0L) return
        GLES30.glDisable(GLES30.GL_DEPTH_TEST)
        GLES30.glDepthMask(false)
        GLES30.glUseProgram(bgProgram)
        GLES30.glActiveTexture(GLES30.GL_TEXTURE0)
        GLES30.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, cameraTex)
        GLES30.glBindBuffer(GLES30.GL_ARRAY_BUFFER, 0)
        bgQuad.position(0); bgUv.position(0)
        GLES30.glVertexAttribPointer(0, 2, GLES30.GL_FLOAT, false, 0, bgQuad)
        GLES30.glVertexAttribPointer(1, 2, GLES30.GL_FLOAT, false, 0, bgUv)
        GLES30.glEnableVertexAttribArray(0)
        GLES30.glEnableVertexAttribArray(1)
        GLES30.glDrawArrays(GLES30.GL_TRIANGLE_STRIP, 0, 4)
        GLES30.glDisableVertexAttribArray(1)
        GLES30.glDepthMask(true)
    }

    private fun box(x: Float, y: Float, z: Float, yaw: Float, w: Float, h: Float, d: Float, m: Material, alpha: Float = 1f) {
        Matrix.setIdentityM(model, 0)
        Matrix.translateM(model, 0, x, y, z)
        Matrix.rotateM(model, 0, Math.toDegrees(yaw.toDouble()).toFloat(), 0f, 1f, 0f)
        Matrix.scaleM(model, 0, w, h, d)
        Matrix.multiplyMM(mvp, 0, vp, 0, model, 0)
        GLES30.glUniformMatrix4fv(GLES30.glGetUniformLocation(program, "uMvp"), 1, false, mvp, 0)
        GLES30.glUniformMatrix4fv(GLES30.glGetUniformLocation(program, "uModel"), 1, false, model, 0)
        val c = m.color
        GLES30.glUniform4f(GLES30.glGetUniformLocation(program, "uColor"), c.r, c.g, c.b, c.a * alpha)
        GLES30.glUniform4f(GLES30.glGetUniformLocation(program, "uTop"), c.r, c.g, c.b, c.a * alpha)
        GLES30.glUniform1f(GLES30.glGetUniformLocation(program, "uShine"), m.shine)
        val tex = m.texture?.let { textures[it] }
        if (tex != null) {
            GLES30.glActiveTexture(GLES30.GL_TEXTURE0)
            GLES30.glBindTexture(GLES30.GL_TEXTURE_2D, tex)
            GLES30.glUniform1i(GLES30.glGetUniformLocation(program, "uHasTex"), 1)
        } else GLES30.glUniform1i(GLES30.glGetUniformLocation(program, "uHasTex"), 0)
        GLES30.glDrawArrays(GLES30.GL_TRIANGLES, 0, 36)
    }

    private fun drawCabinets() {
        for (c in cabinets) {
            val cs = cos(c.yaw)
            val sn = sin(c.yaw)
            for (p in c.parts) {
                // Local (x, z) turned by yaw about the vertical
                val wx = c.x + p.x * cs + p.z * sn
                val wz = c.z - p.x * sn + p.z * cs
                box(wx, c.y + p.y, wz, c.yaw, p.w, p.h, p.d, p.m)
            }
        }
        // The picked cabinet: a soft brass shell around it
        val sel = selected
        if (sel != null && !hideOutline) {
            GLES30.glEnable(GLES30.GL_BLEND)
            GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)
            GLES30.glDepthMask(false)
            val s = sel.kind.size
            box(sel.x, sel.y + sel.kind.liftM + s[1] / 2, sel.z, sel.yaw, s[0] + 0.03f, s[1] + 0.03f, s[2] + 0.03f, Material(Rgba(0.78f, 0.63f, 0.36f, 0.22f)))
            GLES30.glDepthMask(true)
            GLES30.glDisable(GLES30.GL_BLEND)
        }
    }

    private fun drawMeasure(frame: Frame) {
        // Where the middle of the screen lands on a surface
        val hit = frame.hitTest(width / 2f, height / 2f).firstOrNull { h ->
            val t = h.trackable
            (t is Plane && t.isPoseInPolygon(h.hitPose)) || (t is Point && t.orientationMode == Point.OrientationMode.ESTIMATED_SURFACE_NORMAL)
        }
        aim = hit?.hitPose?.let { floatArrayOf(it.tx(), it.ty(), it.tz()) }
        val dot = Material(Rgba(0.95f, 0.93f, 0.89f))
        val line = Material(Rgba(0.78f, 0.63f, 0.36f))
        val labels = mutableListOf<Pair<FloatArray, Float>>()
        for (m in measurements) {
            val b = m.b ?: aim ?: continue
            box(m.a[0], m.a[1], m.a[2], 0f, 0.012f, 0.012f, 0.012f, dot)
            box(b[0], b[1], b[2], 0f, 0.012f, 0.012f, 0.012f, dot)
            segment(m.a, b, line)
            screen(floatArrayOf((m.a[0] + b[0]) / 2, (m.a[1] + b[1]) / 2, (m.a[2] + b[2]) / 2))?.let { labels += it to dist(m.a, b) }
        }
        aim?.let { a -> box(a[0], a[1], a[2], 0f, 0.008f, 0.002f, 0.008f, dot) }
        onLabels?.invoke(labels)
    }

    /** A thin bar from a to b */
    private fun segment(a: FloatArray, b: FloatArray, m: Material) {
        val dx = b[0] - a[0]; val dy = b[1] - a[1]; val dz = b[2] - a[2]
        val len = sqrt(dx * dx + dy * dy + dz * dz)
        if (len < 0.001f) return
        Matrix.setIdentityM(model, 0)
        Matrix.translateM(model, 0, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2)
        // Turn the box's x axis onto the segment
        val yaw = Math.toDegrees(atan2(-dz.toDouble(), dx.toDouble())).toFloat()
        val pitch = Math.toDegrees(atan2(dy.toDouble(), sqrt((dx * dx + dz * dz).toDouble()))).toFloat()
        Matrix.rotateM(model, 0, yaw, 0f, 1f, 0f)
        Matrix.rotateM(model, 0, pitch, 0f, 0f, 1f)
        Matrix.scaleM(model, 0, len, 0.004f, 0.004f)
        Matrix.multiplyMM(mvp, 0, vp, 0, model, 0)
        GLES30.glUniformMatrix4fv(GLES30.glGetUniformLocation(program, "uMvp"), 1, false, mvp, 0)
        GLES30.glUniformMatrix4fv(GLES30.glGetUniformLocation(program, "uModel"), 1, false, model, 0)
        GLES30.glUniform4f(GLES30.glGetUniformLocation(program, "uColor"), m.color.r, m.color.g, m.color.b, 1f)
        GLES30.glUniform4f(GLES30.glGetUniformLocation(program, "uTop"), m.color.r, m.color.g, m.color.b, 1f)
        GLES30.glUniform1i(GLES30.glGetUniformLocation(program, "uHasTex"), 0)
        GLES30.glUniform1f(GLES30.glGetUniformLocation(program, "uShine"), 0f)
        GLES30.glDrawArrays(GLES30.GL_TRIANGLES, 0, 36)
    }

    /** A point in the room on the screen, in pixels, or null when behind the camera. */
    private fun screen(p: FloatArray): FloatArray? {
        val v = floatArrayOf(p[0], p[1], p[2], 1f)
        val o = FloatArray(4)
        Matrix.multiplyMV(o, 0, vp, 0, v, 0)
        if (o[3] <= 0) return null
        return floatArrayOf((o[0] / o[3] + 1) / 2 * width, (1 - o[1] / o[3]) / 2 * height)
    }

    private fun pickCabinet(x: Float, y: Float): Placed? {
        val inv = FloatArray(16)
        if (!Matrix.invertM(inv, 0, vp, 0)) return null
        val nx = 2f * x / width - 1f
        val ny = 1f - 2f * y / height
        fun un(z: Float): FloatArray {
            val o = FloatArray(4)
            Matrix.multiplyMV(o, 0, inv, 0, floatArrayOf(nx, ny, z, 1f), 0)
            return floatArrayOf(o[0] / o[3], o[1] / o[3], o[2] / o[3])
        }
        val near = un(-1f)
        val far = un(1f)
        val d = floatArrayOf(far[0] - near[0], far[1] - near[1], far[2] - near[2])
        val l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2])
        for (i in 0..2) d[i] /= l
        var best: Placed? = null
        var bt = Float.MAX_VALUE
        for (c in cabinets) {
            val s = c.kind.size
            val cy = c.y + c.kind.liftM + s[1] / 2
            // Into the cabinet's own space
            val cs = cos(-c.yaw); val sn = sin(-c.yaw)
            val ox = near[0] - c.x; val oy = near[1] - cy; val oz = near[2] - c.z
            val lo = floatArrayOf(ox * cs + oz * sn, oy, -ox * sn + oz * cs)
            val ld = floatArrayOf(d[0] * cs + d[2] * sn, d[1], -d[0] * sn + d[2] * cs)
            val half = floatArrayOf(s[0] / 2, s[1] / 2, s[2] / 2)
            var tmin = -Float.MAX_VALUE
            var tmax = Float.MAX_VALUE
            var miss = false
            for (k in 0..2) {
                if (abs(ld[k]) < 1e-6f) { if (lo[k] < -half[k] || lo[k] > half[k]) miss = true } else {
                    var t1 = (-half[k] - lo[k]) / ld[k]
                    var t2 = (half[k] - lo[k]) / ld[k]
                    if (t1 > t2) { val t = t1; t1 = t2; t2 = t }
                    tmin = max(tmin, t1); tmax = min(tmax, t2)
                    if (tmin > tmax) miss = true
                }
            }
            if (!miss && tmax > 0 && tmin < bt) { bt = tmin; best = c }
        }
        return best
    }

    private fun uploadPending() {
        for ((k, bmp) in pending) {
            val ids = IntArray(1)
            GLES30.glGenTextures(1, ids, 0)
            GLES30.glBindTexture(GLES30.GL_TEXTURE_2D, ids[0])
            GLES30.glTexParameteri(GLES30.GL_TEXTURE_2D, GLES30.GL_TEXTURE_MIN_FILTER, GLES30.GL_LINEAR_MIPMAP_LINEAR)
            GLES30.glTexParameteri(GLES30.GL_TEXTURE_2D, GLES30.GL_TEXTURE_MAG_FILTER, GLES30.GL_LINEAR)
            GLUtils.texImage2D(GLES30.GL_TEXTURE_2D, 0, bmp, 0)
            GLES30.glGenerateMipmap(GLES30.GL_TEXTURE_2D)
            textures[k] = ids[0]
        }
        pending.clear()
    }

    companion object {
        fun dist(a: FloatArray, b: FloatArray): Float {
            val dx = a[0] - b[0]; val dy = a[1] - b[1]; val dz = a[2] - b[2]
            return sqrt(dx * dx + dy * dy + dz * dz)
        }

        private const val BG_VERTEX = """#version 300 es
            layout(location = 0) in vec2 aPos;
            layout(location = 1) in vec2 aUv;
            out vec2 vUv;
            void main() { vUv = aUv; gl_Position = vec4(aPos, 0.0, 1.0); }
        """
        private const val BG_FRAGMENT = """#version 300 es
            #extension GL_OES_EGL_image_external_essl3 : require
            precision mediump float;
            in vec2 vUv;
            uniform samplerExternalOES uTex;
            out vec4 fragColor;
            void main() { fragColor = texture(uTex, vUv); }
        """
    }
}

/**
 * One cabinet, built from boxes at real size: the box, a recessed toe kick,
 * doors (or drawer fronts) in the chosen style, bar pulls, and a stone top on
 * base cabinets. Origin is the middle of the floor footprint, front facing +z.
 */
object Cabinet {
    fun build(kind: CabinetKind, finish: Material, door: DoorStyle, counter: Material?): List<Part> {
        val out = mutableListOf<Part>()
        val s = kind.size
        val w = s[0]; val h = s[1]; val d = s[2]
        val y0 = kind.liftM
        val toe = if (kind == CabinetKind.Wall30) 0f else 4.5f * CabinetKind.I
        val dark = Material(Rgba(0.12f, 0.12f, 0.12f))
        val pull = Material(Rgba(0.78f, 0.63f, 0.36f), shine = 0.6f)
        val stone = Material(Rgba(0.94f, 0.94f, 0.94f), shine = 0.3f)
        val t = 0.019f
        fun box(bw: Float, bh: Float, bd: Float, x: Float, y: Float, z: Float, m: Material, f: Boolean = true) {
            out += Part(x, y, z, bw, bh, bd, m, f)
        }
        // A door or drawer front: a frame of four rails around a center panel, or a flat slab
        fun front(fw: Float, fh: Float, x: Float, y: Float, z: Float) {
            if (door == DoorStyle.Flat) { box(fw, fh, t, x, y, z, finish); return }
            val frame = if (door == DoorStyle.SlimShaker) 1.5f * CabinetKind.I else 2.25f * CabinetKind.I
            val rail = min(frame, min(fw, fh) * 0.22f)
            box(fw, rail, t, x, y + fh / 2 - rail / 2, z, finish)
            box(fw, rail, t, x, y - fh / 2 + rail / 2, z, finish)
            box(rail, fh - 2 * rail, t, x - fw / 2 + rail / 2, y, z, finish)
            box(rail, fh - 2 * rail, t, x + fw / 2 - rail / 2, y, z, finish)
            // The center panel: sunk for shaker, standing proud for raised
            val panelZ = if (door == DoorStyle.Raised) z + 0.004f else z - 0.006f
            box(fw - 2 * rail, fh - 2 * rail, t * 0.6f, x, y, panelZ, finish)
        }
        val boxH = h - toe
        box(w, boxH, d - t, 0f, y0 + toe + boxH / 2, -t / 2, finish)
        if (toe > 0) box(w - 0.02f, toe, d - 0.08f, 0f, toe / 2, -0.04f, dark, false)
        val frontY = y0 + toe
        val fh = boxH - 0.006f
        val z = d / 2 - t / 2
        if (kind == CabinetKind.Drawers24) {
            var y = frontY + 0.003f
            for (p in listOf(0.44f, 0.34f, 0.22f)) {
                val dh = fh * p - 0.003f
                front(w - 0.006f, dh, 0f, y + dh / 2, z)
                box(min(0.3f, w * 0.5f), 0.012f, 0.012f, 0f, y + dh - min(0.06f, dh * 0.25f), d / 2 + 0.014f, pull, false)
                y += dh + 0.003f
            }
        } else {
            val leaves = if (w > 21 * CabinetKind.I) 2 else 1
            val lw = (w - 0.006f * leaves) / leaves
            for (i in 0 until leaves) {
                val x = -w / 2 + 0.003f + lw / 2 + i * (lw + 0.006f)
                front(lw, fh, x, frontY + fh / 2 + 0.003f, z)
                // Vertical bar pull near the meeting edge (top for base, bottom for wall)
                val px = if (leaves == 2) (if (i == 0) x + lw / 2 - 0.04f else x - lw / 2 + 0.04f) else x + lw / 2 - 0.04f
                val py = if (kind == CabinetKind.Wall30) frontY + 0.12f else frontY + fh - 0.12f
                box(0.012f, if (kind == CabinetKind.Tall24) 0.3f else 0.15f, 0.012f, px, py, d / 2 + 0.014f, pull, false)
            }
        }
        if (kind.hasCounter) box(w + 0.002f, 0.03f, d + 0.025f, 0f, y0 + h + 0.015f, 0.0125f, counter ?: stone, false)
        return out
    }
}
