package com.greencabinetsny.app.render

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.Rect
import android.opengl.GLSurfaceView
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.calculateCentroid
import androidx.compose.foundation.gestures.calculatePan
import androidx.compose.foundation.gestures.calculateZoom
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.positionChange
import androidx.compose.ui.input.pointer.util.VelocityTracker
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.viewinterop.AndroidView
import coil3.ImageLoader
import coil3.request.ImageRequest
import coil3.request.SuccessResult
import coil3.request.allowHardware
import coil3.toBitmap
import com.greencabinetsny.app.model.Finish
import com.greencabinetsny.app.model.ScannedRoom
import javax.microedition.khronos.egl.EGL10
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.egl.EGLDisplay
import kotlin.math.abs

/** Holds the live 3D view so the screen can turn it, focus it and take its pictures. */
class Room3DController {
    var renderer: RoomRenderer? = null
        internal set
    var onTapWall: ((Int) -> Unit)? = null
    var selecting = false

    fun focus(picked: Set<Int>, animated: Boolean) = renderer?.focus(picked, animated)
    fun resetCamera(top: Boolean, animated: Boolean) = renderer?.resetCamera(top, animated)
    fun snapshot(): Bitmap? = renderer?.snapshot(1600, 1152)
    fun snapshotWall(i: Int): Bitmap? = renderer?.snapshot(1600, 1152, wall = i)
}

/** 4x multisampling when the phone has it, plain otherwise. */
private class Msaa : GLSurfaceView.EGLConfigChooser {
    override fun chooseConfig(egl: EGL10, display: EGLDisplay): EGLConfig {
        fun pick(samples: Int): EGLConfig? {
            val attrs = intArrayOf(
                EGL10.EGL_RED_SIZE, 8, EGL10.EGL_GREEN_SIZE, 8, EGL10.EGL_BLUE_SIZE, 8, EGL10.EGL_ALPHA_SIZE, 8,
                EGL10.EGL_DEPTH_SIZE, 16, EGL10.EGL_RENDERABLE_TYPE, 0x40,
                EGL10.EGL_SAMPLE_BUFFERS, if (samples > 0) 1 else 0, EGL10.EGL_SAMPLES, samples,
                EGL10.EGL_NONE,
            )
            val n = IntArray(1)
            val configs = arrayOfNulls<EGLConfig>(1)
            return if (egl.eglChooseConfig(display, attrs, configs, 1, n) && n[0] > 0) configs[0] else null
        }
        return pick(4) ?: pick(0) ?: run {
            val n = IntArray(1)
            val configs = arrayOfNulls<EGLConfig>(1)
            egl.eglChooseConfig(display, intArrayOf(EGL10.EGL_RENDERABLE_TYPE, 0x40, EGL10.EGL_DEPTH_SIZE, 16, EGL10.EGL_NONE), configs, 1, n)
            configs[0]!!
        }
    }
}

/**
 * The room in 3D: one finger turns it (with a little momentum after a flick),
 * two pinch and slide, and while picking a tap chooses a wall.
 */
@Composable
fun Room3DView(room: ScannedRoom, controller: Room3DController, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val view = remember {
        GLSurfaceView(context).apply {
            setEGLContextClientVersion(3)
            setEGLConfigChooser(Msaa())
            preserveEGLContextOnPause = true
            val r = RoomRenderer(this)
            setRenderer(r)
            renderMode = GLSurfaceView.RENDERMODE_WHEN_DIRTY
            controller.renderer = r
            r.setScene(RoomScene(room))
        }
    }
    DisposableEffect(view) {
        view.onResume()
        onDispose { view.onPause() }
    }
    AndroidView(
        factory = { view },
        modifier = modifier
            .semantics { contentDescription = "Your room in 3D. Drag to turn it, pinch to zoom." }
            .pointerInput(controller) {
                awaitEachGesture {
                    val down = awaitFirstDown(requireUnconsumed = false)
                    val r = controller.renderer ?: return@awaitEachGesture
                    r.stopFling()
                    val tracker = VelocityTracker()
                    tracker.addPosition(down.uptimeMillis, down.position)
                    var moved = 0f
                    var multi = false
                    var lastTime = down.uptimeMillis
                    while (true) {
                        val e = awaitPointerEvent()
                        val pressed = e.changes.filter { it.pressed }
                        if (pressed.isEmpty()) break
                        if (pressed.size >= 2) {
                            multi = true
                            val z = e.calculateZoom()
                            val p = e.calculatePan()
                            if (abs(z - 1f) > 0.001f) r.zoom(z)
                            if (p != Offset.Zero) r.pan(p.x, p.y)
                        } else {
                            val c = pressed[0]
                            val d = c.positionChange()
                            moved += d.getDistance()
                            if (!multi && moved > 6f) r.turn(d.x, d.y)
                            tracker.addPosition(c.uptimeMillis, c.position)
                            lastTime = c.uptimeMillis
                        }
                        e.changes.forEach { it.consume() }
                    }
                    if (!multi && moved <= 12f) {
                        // A tap: pick the wall under the finger
                        if (controller.selecting) r.pick(down.position.x, down.position.y)?.let { i -> controller.onTapWall?.invoke(i) }
                    } else if (!multi) {
                        val v = tracker.calculateVelocity()
                        // px per second into px per millisecond
                        if (abs(v.x) + abs(v.y) > 300f) r.fling(v.x / 1000f, v.y / 1000f)
                    }
                }
            },
    )
}

/** Door and countertop pictures for the 3D cabinets: the supplier's photo, a bundled wood, or grain tinted to a color. */
object Textures {
    /** Door textures don't need more than this */
    const val PX = 1024
    private val cache = HashMap<String, Bitmap>()

    fun key(f: Finish) = "f:${f.id}"

    fun cached(f: Finish): Bitmap? = synchronized(cache) { cache[key(f)] }

    /** Loads (or makes) the picture for a finish; null means a flat color. */
    suspend fun load(context: Context, f: Finish): Bitmap? {
        cached(f)?.let { return it }
        val bmp: Bitmap? = when {
            f.remote != null -> {
                val req = ImageRequest.Builder(context).data(f.remote).size(PX).allowHardware(false).build()
                (ImageLoader(context).execute(req) as? SuccessResult)?.image?.toBitmap()
            }
            f.texture != null -> runCatching {
                context.assets.open("img/${f.texture}.jpg").use { BitmapFactory.decodeStream(it) }
            }.getOrNull()?.let { if (f.cropCenter) center(it) else it }
            f.grain -> runCatching { context.assets.open("img/grain.jpg").use { BitmapFactory.decodeStream(it) } }.getOrNull()?.let { tinted(it, f.hex) }
            else -> null
        }
        if (bmp != null) synchronized(cache) { cache[key(f)] = bmp }
        return bmp
    }

    /** The middle of a slab photo: grain only, no bark or bench */
    fun center(img: Bitmap): Bitmap {
        val w = img.width
        val h = img.height
        return Bitmap.createBitmap(img, (w * 0.36f).toInt(), (h * 0.2f).toInt(), (w * 0.28f).toInt(), (h * 0.56f).toInt())
    }

    /** Grain lines multiplied over a color */
    fun tinted(grain: Bitmap, hex: String): Bitmap {
        val out = Bitmap.createBitmap(grain.width, grain.height, Bitmap.Config.ARGB_8888)
        val c = Canvas(out)
        c.drawColor(com.greencabinetsny.app.model.colorOf(hex).let { android.graphics.Color.argb(255, (it.red * 255).toInt(), (it.green * 255).toInt(), (it.blue * 255).toInt()) })
        val p = Paint().apply { xfermode = PorterDuffXfermode(PorterDuff.Mode.MULTIPLY); alpha = 178 }
        c.drawBitmap(grain, null, Rect(0, 0, out.width, out.height), p)
        return out
    }
}
