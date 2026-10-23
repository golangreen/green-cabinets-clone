package com.greencabinetsny.app.screens

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircleOutline
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.outlined.AddPhotoAlternate
import androidx.compose.material.icons.outlined.CameraAlt
import androidx.compose.material.icons.outlined.Colorize
import androidx.compose.material.icons.outlined.Gesture
import androidx.compose.material.icons.outlined.PhotoLibrary
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.setProgress
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.exifinterface.media.ExifInterface
import com.greencabinetsny.app.LocalModel
import com.greencabinetsny.app.LocalNav
import com.greencabinetsny.app.model.AppTab
import com.greencabinetsny.app.model.Attachment
import com.greencabinetsny.app.model.Panel
import com.greencabinetsny.app.model.Supplier
import com.greencabinetsny.app.model.colorOf
import com.greencabinetsny.app.ui.ActionButton
import com.greencabinetsny.app.ui.ActionKind
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.Hairline
import com.greencabinetsny.app.ui.Radius
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Type
import com.greencabinetsny.app.ui.card
import com.greencabinetsny.app.ui.page
import com.greencabinetsny.app.ui.pressable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import kotlin.math.cbrt
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.roundToInt
import kotlin.math.sqrt

/** The matching: a photo's color against every cabinet decor's measured tone, as the eye sees it (CIE Lab). */
object ColorMatch {
    data class Result(val panel: Panel, val distance: Double) {
        val closeness: String get() = when {
            distance < 6 -> "Very close"
            distance < 12 -> "Close"
            else -> "Similar"
        }
    }

    /** Every cabinet decor's color, worked out once (stone slabs are for counters, and too patterned to match by color) */
    private val catalog: List<Pair<Panel, Lab>> by lazy {
        Panel.all.filter { it.supplier != Supplier.Raphael }.mapNotNull { p -> p.tone?.let { p to Lab.of(it) } }
    }

    /** The average color in a small patch around a spot of the photo (0..1 each way). */
    fun sample(img: Bitmap, x: Float, y: Float): Int {
        val w = img.width
        val h = img.height
        val r = max(4, (min(w, h) * 0.02f).toInt())
        val cx = (x * w).toInt().coerceIn(0, w - 1)
        val cy = (y * h).toInt().coerceIn(0, h - 1)
        var sr = 0L; var sg = 0L; var sb = 0L; var n = 0
        for (py in max(0, cy - r) until min(h, cy + r)) for (px in max(0, cx - r) until min(w, cx + r)) {
            val c = img.getPixel(px, py)
            sr += (c shr 16) and 0xFF; sg += (c shr 8) and 0xFF; sb += c and 0xFF; n++
        }
        if (n == 0) return 0
        return (0xFF shl 24) or ((sr / n).toInt() shl 16) or ((sg / n).toInt() shl 8) or (sb / n).toInt()
    }

    /** The panels nearest in color. */
    fun closest(rgb: Int, count: Int): List<Result> {
        val t = Lab.of(rgb)
        return catalog.map { Result(it.first, t.distance(it.second)) }.sortedBy { it.distance }.take(count)
    }

    fun hex(rgb: Int) = String.format("#%02X%02X%02X", (rgb shr 16) and 0xFF, (rgb shr 8) and 0xFF, rgb and 0xFF)

    /** CIE L*a*b*, D65 */
    class Lab(val l: Double, val a: Double, val b: Double) {
        /** Lightness counts half: light in a photo shifts brightness far more than hue, and hue is what people mean by "this color" */
        fun distance(o: Lab): Double {
            val dl = (l - o.l) * 0.5
            return sqrt(dl * dl + (a - o.a) * (a - o.a) + (b - o.b) * (b - o.b))
        }

        companion object {
            fun of(hex: String): Lab {
                val v = hex.trim().removePrefix("#").toLongOrNull(16)?.toInt() ?: 0
                return of(v)
            }

            fun of(rgb: Int): Lab {
                fun lin(v: Int): Double { val x = v / 255.0; return if (x <= 0.04045) x / 12.92 else ((x + 0.055) / 1.055).pow(2.4) }
                val r = lin((rgb shr 16) and 0xFF); val g = lin((rgb shr 8) and 0xFF); val bl = lin(rgb and 0xFF)
                val x = (0.4124 * r + 0.3576 * g + 0.1805 * bl) / 0.95047
                val y = (0.2126 * r + 0.7152 * g + 0.0722 * bl)
                val z = (0.0193 * r + 0.1192 * g + 0.9505 * bl) / 1.08883
                fun f(t: Double) = if (t > 0.008856) cbrt(t) else 7.787 * t + 16.0 / 116.0
                return Lab(116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z)))
            }
        }
    }
}

/** Upright and no larger than maxSide, so the pixels match what's on screen. */
private fun readPhoto(context: android.content.Context, uri: Uri, maxSide: Int = 1600): Bitmap? = runCatching {
    val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, o) }
    var s = 1
    while (max(o.outWidth, o.outHeight) / s > maxSide * 2) s *= 2
    val raw = context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = s }) } ?: return null
    val turn = context.contentResolver.openInputStream(uri)?.use { ExifInterface(it).rotationDegrees } ?: 0
    val k = min(1f, maxSide.toFloat() / max(raw.width, raw.height))
    val m = Matrix().apply { postScale(k, k); postRotate(turn.toFloat()) }
    Bitmap.createBitmap(raw, 0, 0, raw.width, raw.height, m, true)
}.getOrNull()

/**
 * Saw a color you love (a magazine, a friend's kitchen, a screenshot)? A photo
 * of it, a drag onto the color, and the closest real panels from our
 * suppliers come up, or we paint it that exact color.
 */
@Composable
fun ColorMatchSheet(onClose: () -> Unit) {
    val model = LocalModel.current
    val nav = LocalNav.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var photo by remember { mutableStateOf<Bitmap?>(null) }
    var spot by remember { mutableStateOf(Offset(0.5f, 0.5f)) }
    var menu by remember { mutableStateOf(false) }
    val shot = remember { File(File(context.cacheDir, "share").apply { mkdirs() }, "color-photo.jpg") }
    val shotUri = remember { FileProvider.getUriForFile(context, "${context.packageName}.files", shot) }

    fun use(uri: Uri) {
        scope.launch {
            val img = withContext(Dispatchers.IO) { readPhoto(context, uri) } ?: return@launch
            photo = img
            spot = Offset(0.5f, 0.5f)
        }
    }
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { it?.let(::use) }
    val camera = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { ok -> if (ok) use(shotUri) }
    val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        if (ok) camera.launch(shotUri) else model.say("Allow the camera in Settings to take a photo")
    }
    fun openCamera() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) camera.launch(shotUri)
        else permission.launch(Manifest.permission.CAMERA)
    }
    fun choose() = pick.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))

    Dialog(onClose, DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false)) {
        BackHandler { onClose() }
        Box(Modifier.fillMaxSize().background(Brand.ink)) {
            Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(top = 96.dp, bottom = Space.section)) {
                val img = photo
                if (img == null) {
                    Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
                        Box(Modifier.size(88.dp).clip(CircleShape).background(Brand.brass.copy(alpha = 0.12f)), contentAlignment = Alignment.Center) {
                            Icon(Icons.Outlined.Colorize, null, tint = Brand.brass, modifier = Modifier.size(44.dp))
                        }
                        Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
                            Text("Saw a color you love?", style = Type.hero)
                            Text("In a magazine, online or in a friend's kitchen. Take a photo of it and drag onto the color. We find the closest real panels, or paint it that exact color.", style = Type.body)
                        }
                        Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                            ActionButton("Take a photo", Modifier.fillMaxWidth(), icon = Icons.Outlined.CameraAlt) { openCamera() }
                            ActionButton("Choose a photo", Modifier.fillMaxWidth(), icon = Icons.Outlined.PhotoLibrary, kind = ActionKind.Secondary) { choose() }
                        }
                    }
                } else {
                    val rgb = remember(img, spot) { ColorMatch.sample(img, spot.x, spot.y) }
                    val matches = remember(rgb) { ColorMatch.closest(rgb, 6) }
                    Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
                        SamplePhoto(img, spot, Color(rgb)) { spot = it }
                        Row(horizontalArrangement = Arrangement.spacedBy(Space.s), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Outlined.Gesture, null, tint = Brand.stone, modifier = Modifier.size(16.dp))
                            Text("Drag the circle onto the color you want.", style = Type.footnote)
                        }
                        Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                            Text("CLOSEST REAL PANELS", style = Type.eyebrow)
                            // Updates follow the finger instantly: dozens a second, nothing to animate
                            Column(Modifier.fillMaxWidth().card()) {
                                matches.forEachIndexed { i, m ->
                                    MatchRow(m) { onClose(); nav.open(AppTab.Materials, Route.PanelDetail(m.panel.id)) }
                                    if (i < matches.lastIndex) Hairline()
                                }
                            }
                        }
                        // "We paint it this exact color": the photo goes with the request
                        val line = "Paint to match: ${ColorMatch.hex(rgb)} (photo attached)"
                        val picked = model.isPicked(line)
                        Row(Modifier.fillMaxWidth().card(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                            Box(Modifier.size(56.dp).clip(RoundedCornerShape(Radius.chip)).background(Color(rgb)).border(1.dp, Brand.line, RoundedCornerShape(Radius.chip)))
                            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text("Paint it this exact color", style = Type.headline)
                                Text("We match any color in a satin paint.", style = Type.footnote)
                            }
                            PickButton(picked) {
                                if (!picked) model.add(listOf(img), Attachment.Kind.Photo, "Color to match", quiet = true)
                                model.togglePick(line)
                            }
                        }
                        Text("Photos shift with the light, so treat this as a starting point. We bring the real samples to compare in your room.", style = Type.footnote)
                    }
                }
            }
            Row(Modifier.fillMaxWidth().background(Brand.ink.copy(alpha = 0.94f)).padding(top = 36.dp, start = Space.s, end = Space.s, bottom = Space.s),
                verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onClose) { Icon(Icons.Default.Close, "Close", tint = Brand.ivory) }
                Text("Match a color", style = Type.bar, modifier = Modifier.weight(1f))
                if (photo != null) Box {
                    IconButton(onClick = { menu = true }) { Icon(Icons.Outlined.AddPhotoAlternate, "New photo", tint = Brand.ivory) }
                    DropdownMenu(menu, onDismissRequest = { menu = false }, containerColor = Brand.raised) {
                        DropdownMenuItem(text = { Text("Take a photo") }, onClick = { menu = false; openCamera() })
                        DropdownMenuItem(text = { Text("Choose a photo") }, onClick = { menu = false; choose() })
                    }
                }
            }
        }
    }
}

/** The photo with a ring you drag onto the color; the ring fills with what it reads. */
@Composable
private fun SamplePhoto(img: Bitmap, spot: Offset, color: Color, onMove: (Offset) -> Unit) {
    val density = LocalDensity.current
    val aspect = img.width.toFloat() / img.height
    BoxWithConstraints(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
        val w = min(maxWidth.value, 440f * aspect).dp
        Box(
            Modifier.widthIn(max = w).fillMaxWidth().aspectRatio(aspect).clip(RoundedCornerShape(Radius.photo))
                .pointerInput(Unit) {
                    fun move(p: Offset) = onMove(Offset((p.x / size.width).coerceIn(0f, 1f), (p.y / size.height).coerceIn(0f, 1f)))
                    detectTapGestures { move(it) }
                }
                .pointerInput(Unit) {
                    detectDragGestures(onDragStart = { p -> onMove(Offset((p.x / size.width).coerceIn(0f, 1f), (p.y / size.height).coerceIn(0f, 1f))) }) { c, _ ->
                        onMove(Offset((c.position.x / size.width).coerceIn(0f, 1f), (c.position.y / size.height).coerceIn(0f, 1f)))
                    }
                }
                .semantics {
                    contentDescription = "Your photo"
                    stateDescription = "Color picked, ${ColorMatch.hex(android.graphics.Color.argb(255, (color.red * 255).roundToInt(), (color.green * 255).roundToInt(), (color.blue * 255).roundToInt()))}"
                    // Without dragging: step the sample spot across the photo
                    progressBarRangeInfo = ProgressBarRangeInfo(spot.y * 10 + spot.x, 0f..11f, 0)
                    setProgress { v ->
                        var x = spot.x + if (v > spot.y * 10 + spot.x) 0.1f else -0.1f
                        var y = spot.y
                        if (x > 1f) { x = 0f; y = min(1f, y + 0.1f) }
                        if (x < 0f) { x = 1f; y = max(0f, y - 0.1f) }
                        onMove(Offset(x, y)); true
                    }
                },
        ) {
            Image(img.asImageBitmap(), null, contentScale = ContentScale.FillBounds, modifier = Modifier.fillMaxSize())
            BoxWithConstraints(Modifier.fillMaxSize()) {
                val x = maxWidth * spot.x - 22.dp
                val y = maxHeight * spot.y - 22.dp
                Box(
                    Modifier.offset(x, y).size(44.dp).shadow(6.dp, CircleShape).clip(CircleShape).background(color)
                        .border(3.dp, Brand.ivory, CircleShape).padding(3.dp).border(1.dp, Brand.ink.copy(alpha = 0.5f), CircleShape),
                )
            }
        }
    }
}

/** One close panel: swatch, name, how close, and add to quote. */
@Composable
private fun MatchRow(m: ColorMatch.Result, onOpen: () -> Unit) {
    val model = LocalModel.current
    val p = m.panel
    val picked = model.isPicked(p.requestLine)
    Row(Modifier.fillMaxWidth().padding(vertical = Space.s), verticalAlignment = Alignment.CenterVertically) {
        Row(Modifier.weight(1f).pressable(0.99f, onClick = onOpen).semantics(mergeDescendants = true) {},
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.m)) {
            PanelSwatch(p, Modifier.size(56.dp).clip(RoundedCornerShape(Radius.chip)).border(1.dp, Brand.line, RoundedCornerShape(Radius.chip)), 180)
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(p.name, style = Type.headline, maxLines = 1)
                Text(listOfNotNull(p.brand, p.code).joinToString(" · "), style = Type.footnote, maxLines = 1)
                Text(m.closeness, color = Brand.brass, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
        }
        PickButton(picked) { model.togglePick(p.requestLine) }
    }
}

/** Add to quote, as a round button: plus, or a brass check once added. */
@Composable
fun PickButton(picked: Boolean, onClick: () -> Unit) {
    Box(Modifier.size(48.dp).pressable(label = if (picked) "Remove from quote" else "Add to quote", onClick = onClick)
        .semantics { contentDescription = if (picked) "Remove from quote" else "Add to quote" }, contentAlignment = Alignment.Center) {
        Icon(if (picked) Icons.Filled.CheckCircle else Icons.Filled.AddCircleOutline, null, tint = if (picked) Brand.brass else Brand.ivory.copy(alpha = 0.85f), modifier = Modifier.size(28.dp))
    }
}
