package com.greencabinetsny.app.screens

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.graphics.BitmapFactory
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.outlined.CameraAlt
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.DocumentScanner
import androidx.compose.material.icons.outlined.Straighten
import androidx.compose.material.icons.outlined.ViewInAr
import androidx.compose.material.icons.outlined.Window
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.setProgress
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult
import com.greencabinetsny.app.LocalModel
import com.greencabinetsny.app.LocalNav
import com.greencabinetsny.app.ar.ArSupport
import com.greencabinetsny.app.model.AppTab
import com.greencabinetsny.app.model.Attachment
import com.greencabinetsny.app.model.Content
import com.greencabinetsny.app.model.KitchenShape
import com.greencabinetsny.app.model.LengthUnit
import com.greencabinetsny.app.model.ProjectBasket
import com.greencabinetsny.app.ui.ActionButton
import com.greencabinetsny.app.ui.ActionKind
import com.greencabinetsny.app.ui.ActionRow
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.Hairline
import com.greencabinetsny.app.ui.Motion
import com.greencabinetsny.app.ui.PhotoView
import com.greencabinetsny.app.ui.Radius
import com.greencabinetsny.app.ui.ScreenTitle
import com.greencabinetsny.app.ui.Segmented
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Type
import com.greencabinetsny.app.ui.card
import com.greencabinetsny.app.ui.page
import com.greencabinetsny.app.ui.pressable
import java.text.DateFormat
import java.util.Date
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

fun Context.activity(): Activity? {
    var c: Context? = this
    while (c is ContextWrapper) {
        if (c is Activity) return c
        c = c.baseContext
    }
    return null
}

/** Google's document scanner: finds the page, straightens it and cleans it up. Pictures go with the project. */
@Composable
fun rememberDrawingScanner(): () -> Unit {
    val model = LocalModel.current
    val context = LocalContext.current
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) { r ->
        if (r.resultCode != Activity.RESULT_OK) return@rememberLauncherForActivityResult
        val pages = GmsDocumentScanningResult.fromActivityResultIntent(r.data)?.pages ?: return@rememberLauncherForActivityResult
        val bitmaps = pages.mapNotNull { p ->
            runCatching { context.contentResolver.openInputStream(p.imageUri)?.use { BitmapFactory.decodeStream(it) } }.getOrNull()
        }
        model.add(bitmaps, Attachment.Kind.Drawing, "Drawing")
    }
    return {
        val activity = context.activity()
        if (activity != null) {
            val options = GmsDocumentScannerOptions.Builder()
                .setGalleryImportAllowed(true)
                .setPageLimit(10)
                .setResultFormats(GmsDocumentScannerOptions.RESULT_FORMAT_JPEG)
                .setScannerMode(GmsDocumentScannerOptions.SCANNER_MODE_FULL)
                .build()
            GmsDocumentScanning.getClient(options).getStartScanIntent(activity)
                .addOnSuccessListener { launcher.launch(IntentSenderRequest.Builder(it).build()) }
                .addOnFailureListener { model.say("The scanner isn't available on this device") }
        }
    }
}

/**
 * The tools that start a project from the person's own room. What they make
 * collects in "Your project", sent from the Quote tab.
 */
@Composable
fun PlanScreen() {
    val model = LocalModel.current
    val nav = LocalNav.current
    val context = LocalContext.current
    val scanDrawing = rememberDrawingScanner()
    val ar = remember { ArSupport.check(context) }
    var units by remember { mutableStateOf(false) }

    LaunchedEffect(model.planRoute) {
        if (model.planRoute == "drawings") {
            model.planRoute = null
            scanDrawing()
        }
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = Space.section)) {
        Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
            ScreenTitle("Plan", "Use the camera to show us the room. We plan your cabinets from what you send.")

            ToolCard(Content.HERO, Icons.Outlined.ViewInAr, "Cabinets in your room",
                "Place real-size base, drawer, wall and pantry cabinets with the camera. Drag them into place, line up a run, and try every finish.",
                if (ar) null else "This device can't run the AR camera.") {
                ActionButton("Open the camera", Modifier.fillMaxWidth(), icon = Icons.Outlined.CameraAlt, enabled = ar) { nav.push(Route.Cabinets) }
            }

            ToolCard("story-door-samples-measure", Icons.Outlined.Straighten, "Measure with the camera",
                "Point at one end of a wall, a gap or a window, tap +, move to the other end and tap + again. Measure as many as you like.",
                if (ar) "Close, usually within an inch. We confirm every size on site." else "This device can't run the AR camera.") {
                Row(horizontalArrangement = Arrangement.spacedBy(Space.m), verticalAlignment = Alignment.CenterVertically) {
                    ActionButton("Start measuring", Modifier.weight(1f), icon = Icons.Outlined.Straighten, enabled = ar) { nav.push(Route.Measure) }
                    Box {
                        ActionButton(if (model.unit == LengthUnit.None) LengthUnit.FtIn.label else model.unit.label, Modifier.widthIn(min = 96.dp),
                            kind = ActionKind.Secondary) { units = true }
                        DropdownMenu(units, onDismissRequest = { units = false }, containerColor = Brand.raised) {
                            LengthUnit.entries.filter { it != LengthUnit.None }.forEach { u ->
                                DropdownMenuItem(text = { Text(u.label) }, onClick = { units = false; model.chooseUnit(u) })
                            }
                        }
                    }
                }
            }

            ToolCard("photo-natural-wood-galley-kitchen", Icons.Outlined.Window, "Design your new kitchen",
                "Pick your kitchen's shape and type how long the walls are. We put new cabinets on them in 3D, check the plan against the NKBA kitchen guidelines and show you the price.",
                null) {
                Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                    ActionButton("Type my kitchen's sizes", Modifier.fillMaxWidth(), icon = Icons.Outlined.Straighten) { nav.push(Route.Sizes) }
                    ActionButton("Try it on a sample room", Modifier.fillMaxWidth(), icon = Icons.Outlined.ViewInAr, kind = ActionKind.Secondary) {
                        nav.push(Route.Room("sample"))
                    }
                }
            }

            ToolCard("story-galley-kitchen-drawing", Icons.Outlined.DocumentScanner, "Scan your drawings",
                "Architect's plans, a building floor plan or a sketch on paper. The scanner finds the page, straightens it and cleans it up.", null) {
                ActionButton("Scan a drawing", Modifier.fillMaxWidth(), icon = Icons.Outlined.DocumentScanner) { scanDrawing() }
            }

            if (model.scans.isNotEmpty()) SavedRooms()
            ProjectSummary(model.basket, onBoard = { model.openBoard() }, onSend = { model.tab = AppTab.Quote })
        }
    }
}

@Composable
private fun SavedRooms() {
    val model = LocalModel.current
    val nav = LocalNav.current
    Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
        Text("YOUR ROOMS", style = Type.eyebrow)
        Column(Modifier.fillMaxWidth().card()) {
            model.scans.forEachIndexed { i, s ->
                Row(
                    Modifier.fillMaxWidth().pressable(0.99f) { nav.push(Route.Room(s.id)) }.semantics(mergeDescendants = true) {}.padding(vertical = Space.m),
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.m),
                ) {
                    Icon(Icons.Outlined.ViewInAr, null, tint = Brand.brass, modifier = Modifier.size(24.dp))
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(if (s.typed != null) "Kitchen from typed sizes" else "${model.unit.forText.area(s.room.floorArea)} · ${s.room.walls.size} walls", style = Type.headline)
                        Text("${s.id} · ${DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(s.date))}", style = Type.footnote)
                    }
                    Icon(Icons.Default.KeyboardArrowRight, null, tint = Brand.stone)
                }
                if (i < model.scans.lastIndex) Hairline()
            }
        }
    }
}

@Composable
private fun ProjectSummary(b: ProjectBasket, onBoard: () -> Unit, onSend: () -> Unit) {
    Column(Modifier.fillMaxWidth().card(), verticalArrangement = Arrangement.spacedBy(Space.m)) {
        Text("YOUR PROJECT", style = Type.eyebrow)
        if (b.isEmpty) {
            Text("Nothing yet. Pictures, lengths and rooms you make here are kept for your quote request.", style = Type.secondary)
        } else {
            Text(summaryText(b), style = Type.body)
            ActionRow { m ->
                ActionButton("Design board", m, icon = Icons.Outlined.Dashboard, kind = ActionKind.Secondary, onClick = onBoard)
                ActionButton("Send", m, icon = Icons.AutoMirrored.Outlined.Send, onClick = onSend)
            }
        }
    }
}

fun summaryText(b: ProjectBasket): String {
    val parts = mutableListOf<String>()
    val pics = b.items.size
    if (pics > 0) parts += if (pics == 1) "1 picture" else "$pics pictures"
    if (b.lengths.isNotEmpty()) parts += if (b.lengths.size == 1) "1 length" else "${b.lengths.size} lengths"
    if (b.picks.isNotEmpty()) parts += if (b.picks.size == 1) "1 favorite" else "${b.picks.size} favorites"
    if (b.room != null) parts += "a kitchen plan"
    val joined = when (parts.size) {
        0 -> ""
        1 -> parts[0]
        2 -> "${parts[0]} and ${parts[1]}"
        else -> parts.dropLast(1).joinToString(", ") + " and " + parts.last()
    }
    return "$joined ready to send."
}

/** One tool: a photo band, what it does, and its actions. */
@Composable
fun ToolCard(image: String, icon: ImageVector, title: String, text: String, note: String?, actions: @Composable () -> Unit) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(Radius.card)).background(Brand.surface).border(1.dp, Brand.line, RoundedCornerShape(Radius.card))) {
        Box(Modifier.fillMaxWidth().height(150.dp)) {
            PhotoView(image, Modifier.fillMaxSize(), corner = 0.dp)
            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(0.5f to Color.Transparent, 1f to Brand.surface)))
            Box(Modifier.align(Alignment.BottomStart).padding(Space.l).size(52.dp).clip(CircleShape).background(Brand.brass), contentAlignment = Alignment.Center) {
                Icon(icon, null, tint = Brand.ink, modifier = Modifier.size(26.dp))
            }
        }
        Column(Modifier.padding(Space.l), verticalArrangement = Arrangement.spacedBy(Space.m)) {
            Text(title, style = Type.card, modifier = Modifier.semantics { heading() })
            Text(text, style = Type.body)
            if (note != null) Text(note, style = Type.footnote)
            Box(Modifier.padding(top = Space.xs)) { actions() }
        }
    }
}

// Kitchen sizes

/**
 * The kitchen designer for every phone: pick the shape closest to yours, set
 * how long each wall is, and see new cabinets on it, with the price.
 */
@Composable
fun KitchenSizesScreen() {
    val model = LocalModel.current
    val nav = LocalNav.current
    val haptics = LocalHapticFeedback.current
    var shape by rememberSaveable { mutableStateOf(KitchenShape.L) }
    val feet = remember { mutableStateListOf<Double>().apply { addAll(KitchenShape.L.start) } }
    var ceiling by rememberSaveable { mutableDoubleStateOf(8.0) }
    var window by rememberSaveable { mutableStateOf(true) }

    DetailScaffold("Your kitchen's sizes") {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = Space.section)) {
            Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
                Text("Pick the shape closest to yours, then set how long each wall is. A tape measure is plenty: we check every size at the visit.", style = Type.secondary)

                Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                    KitchenShape.entries.chunked(2).forEach { row ->
                        Row(horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                            row.forEach { s ->
                                val on = shape == s
                                val bg by animateColorAsState(if (on) Brand.brass else Brand.surface, Motion.snappy(), label = "shape")
                                Column(
                                    Modifier.weight(1f).clip(RoundedCornerShape(Radius.chip)).background(bg)
                                        .border(1.dp, if (on) Color.Transparent else Brand.line, RoundedCornerShape(Radius.chip))
                                        .pressable {
                                            if (!on) haptics.performHapticFeedback(HapticFeedbackType.SegmentTick)
                                            shape = s
                                            feet.clear(); feet.addAll(s.start)
                                        }
                                        .semantics { selected = on }
                                        .padding(Space.m),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(Space.s),
                                ) {
                                    ShapeIcon(s, s.start, Modifier.fillMaxWidth().height(70.dp), run = if (on) Brand.ink else Brand.brass,
                                        line = if (on) Brand.ink.copy(alpha = 0.55f) else Brand.stone.copy(alpha = 0.7f))
                                    Text(s.label, style = Type.headline.copy(color = if (on) Brand.ink else Brand.ivory))
                                }
                            }
                        }
                    }
                }

                Column(Modifier.fillMaxWidth().card(), verticalArrangement = Arrangement.spacedBy(Space.l)) {
                    shape.fields.forEachIndexed { i, name ->
                        if (i < feet.size) LengthStepper(name, feet[i], shape.range(i)) { feet[i] = it }
                    }
                    Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
                        Text("Ceiling", color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                        Segmented(listOf(8.0, 9.0, 10.0), ceiling, label = { "${it.toInt()} ft" }) { ceiling = it }
                    }
                    Row(Modifier.heightIn(min = 48.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("A window over the sink", style = Type.subhead, modifier = Modifier.weight(1f))
                        Switch(window, { window = it }, colors = SwitchDefaults.colors(checkedTrackColor = Brand.brass, checkedThumbColor = Brand.ivory))
                    }
                }

                ShapeIcon(shape, feet.toList(), Modifier.fillMaxWidth().height(180.dp), labels = true)

                ActionButton("See my new kitchen", Modifier.fillMaxWidth(), icon = Icons.Outlined.ViewInAr) {
                    val (room, picked) = shape.room(feet.toList(), ceiling, window)
                    val saved = model.keep(room, shape.line(feet.toList(), ceiling, window), picked)
                    haptics.performHapticFeedback(HapticFeedbackType.Confirm)
                    nav.push(Route.Room(saved.id))
                }
            }
        }
    }
}

/** One length with big minus and plus buttons, in half-foot steps. */
@Composable
private fun LengthStepper(title: String, feet: Double, range: ClosedFloatingPointRange<Double>, onChange: (Double) -> Unit) {
    val haptics = LocalHapticFeedback.current
    fun change(d: Double) {
        val v = feet + d
        if (v in range) { onChange(v); haptics.performHapticFeedback(HapticFeedbackType.SegmentTick) }
    }
    Row(
        Modifier.semantics(mergeDescendants = true) {
            contentDescription = title
            stateDescription = KitchenShape.text(feet).replace("'", " feet").replace("\"", " inches")
            progressBarRangeInfo = ProgressBarRangeInfo(feet.toFloat(), range.start.toFloat()..range.endInclusive.toFloat(), ((range.endInclusive - range.start) * 2).toInt() - 1)
            setProgress { v -> val s = (Math.round(v * 2) / 2.0).coerceIn(range); onChange(s); true }
        },
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.m),
    ) {
        Text(title, color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
        StepButton(Icons.Default.Remove, (feet - 0.5) in range) { change(-0.5) }
        Text(KitchenShape.text(feet), color = Brand.ivory, fontSize = 22.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.widthIn(min = 76.dp),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        StepButton(Icons.Default.Add, (feet + 0.5) in range) { change(0.5) }
    }
}

@Composable
private fun StepButton(icon: ImageVector, enabled: Boolean, onClick: () -> Unit) {
    Box(
        Modifier.size(48.dp).clip(CircleShape).background(Brand.ivory.copy(alpha = if (enabled) 1f else 0.35f))
            .then(if (enabled) Modifier.pressable(onClick = onClick) else Modifier),
        contentAlignment = Alignment.Center,
    ) { Icon(icon, null, tint = Brand.ink) }
}

/** The shape from above: the room's outline, the cabinet runs in brass, and (with labels) each length on its wall. */
@Composable
fun ShapeIcon(shape: KitchenShape, feet: List<Double>, modifier: Modifier, labels: Boolean = false, run: Color = Brand.brass, line: Color = Brand.stone) {
    val measurer = rememberTextMeasurer()
    Canvas(modifier) {
        val (room, picked) = shape.room(feet, 8.0, false)
        val f = room.floors?.firstOrNull()?.poly ?: return@Canvas
        if (f.size != 4) return@Canvas
        val w = f[2][0]
        val d = f[2][1]
        val pad = (if (labels) 34 else 6).dp.toPx()
        val s = min((size.width - 2 * pad) / w, (size.height - 2 * pad) / d).toFloat()
        val ox = ((size.width - w * s) / 2).toFloat()
        val oz = ((size.height - d * s) / 2).toFloat()
        fun pt(p: List<Double>) = Offset(ox + (p[0] * s).toFloat(), oz + (p[1] * s).toFloat())
        room.walls.forEachIndexed { i, wall ->
            drawLine(line, pt(wall.a), pt(wall.b), strokeWidth = (if (labels) 2f else 1.5f).dp.toPx(),
                pathEffect = if (i == shape.openWall) PathEffect.dashPathEffect(floatArrayOf(4.dp.toPx(), 4.dp.toPx())) else null)
            if (i !in picked) return@forEachIndexed
            // The cabinet run along this wall, drawn inside the room
            val dx = wall.b[0] - wall.a[0]
            val dz = wall.b[1] - wall.a[1]
            val len = max(hypot(dx, dz), 0.001)
            var nx = -dz / len
            var nz = dx / len
            val mid = listOf((wall.a[0] + wall.b[0]) / 2, (wall.a[1] + wall.b[1]) / 2)
            if ((w / 2 - mid[0]) * nx + (d / 2 - mid[1]) * nz < 0) { nx = -nx; nz = -nz }
            val depth = 0.61
            val path = Path().apply {
                moveTo(pt(wall.a).x, pt(wall.a).y)
                lineTo(pt(wall.b).x, pt(wall.b).y)
                pt(listOf(wall.b[0] + nx * depth, wall.b[1] + nz * depth)).let { lineTo(it.x, it.y) }
                pt(listOf(wall.a[0] + nx * depth, wall.a[1] + nz * depth)).let { lineTo(it.x, it.y) }
                close()
            }
            drawPath(path, run)
        }
        if (!labels) return@Canvas
        shape.fields.indices.filter { it < feet.size }.forEach { i ->
            val text = measurer.measure(KitchenShape.text(feet[i]), TextStyle(color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold))
            val c = when {
                shape == KitchenShape.Galley && i == 1 -> Offset(ox + (w * s / 2).toFloat(), oz + (d * s / 2).toFloat())
                i == 0 -> Offset(ox + (w * s / 2).toFloat(), oz - 16.dp.toPx())
                else -> Offset(ox + (w * s).toFloat() + 22.dp.toPx(), oz + (d * s / 2).toFloat())
            }
            drawText(text, topLeft = Offset(c.x - text.size.width / 2f, c.y - text.size.height / 2f))
        }
    }
}
