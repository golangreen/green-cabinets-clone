package com.greencabinetsny.app.ar

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.opengl.GLSurfaceView
import android.view.Surface
import android.view.WindowManager
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.calculateRotation
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.positionChange
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Config
import com.google.ar.core.Session
import com.greencabinetsny.app.LocalModel
import com.greencabinetsny.app.LocalNav
import com.greencabinetsny.app.model.Attachment
import com.greencabinetsny.app.model.DoorStyle
import com.greencabinetsny.app.model.Finish
import com.greencabinetsny.app.model.HouseColors
import com.greencabinetsny.app.render.Material
import com.greencabinetsny.app.render.Rgba
import com.greencabinetsny.app.render.Textures
import com.greencabinetsny.app.screens.FinishSwatch
import com.greencabinetsny.app.screens.activity
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Type
import com.greencabinetsny.app.ui.pressable
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.roundToInt

/** ARCore, installed and running, with the camera allowed; or the reason it can't be. */
@Composable
private fun rememberArSession(onReady: (Session?) -> Unit): String? {
    val context = LocalContext.current
    var problem by remember { mutableStateOf<String?>(null) }
    var asked by remember { mutableStateOf(false) }
    var granted by remember { mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) }
    val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        granted = ok
        if (!ok) problem = "Allow the camera for Green Cabinets in Settings to use this."
    }
    LaunchedEffect(granted) {
        if (!granted) { if (!asked) { asked = true; permission.launch(Manifest.permission.CAMERA) }; return@LaunchedEffect }
        val activity = context.activity() ?: return@LaunchedEffect
        try {
            when (ArCoreApk.getInstance().requestInstall(activity, true)) {
                ArCoreApk.InstallStatus.INSTALL_REQUESTED -> return@LaunchedEffect
                else -> {}
            }
            val s = Session(context)
            val config = Config(s).apply {
                planeFindingMode = Config.PlaneFindingMode.HORIZONTAL_AND_VERTICAL
                updateMode = Config.UpdateMode.LATEST_CAMERA_IMAGE
                focusMode = Config.FocusMode.AUTO
                if (s.isDepthModeSupported(Config.DepthMode.AUTOMATIC)) depthMode = Config.DepthMode.AUTOMATIC
            }
            s.configure(config)
            onReady(s)
        } catch (e: Exception) {
            problem = "This phone can't run the AR camera. You can still type your kitchen's sizes in the Plan tab."
            onReady(null)
        }
    }
    return problem
}

/** The camera view with the renderer, kept running only while the screen is up. */
@Composable
private fun ArView(renderer: (GLSurfaceView) -> ArRenderer, session: Session?, modifier: Modifier, gestures: Modifier) {
    val context = LocalContext.current
    val view = remember {
        GLSurfaceView(context).apply {
            preserveEGLContextOnPause = true
            setEGLContextClientVersion(3)
            setEGLConfigChooser(8, 8, 8, 8, 16, 0)
        }
    }
    val r = remember { renderer(view).also { view.setRenderer(it); view.renderMode = GLSurfaceView.RENDERMODE_CONTINUOUSLY } }
    DisposableEffect(session) {
        if (session != null) {
            r.session = session
            val rot = (context.getSystemService(WindowManager::class.java))?.defaultDisplay?.rotation ?: Surface.ROTATION_0
            r.setRotation(rot)
            runCatching { session.resume() }
            view.onResume()
        }
        // The screen stays on while the camera is up
        context.activity()?.window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        onDispose {
            view.onPause()
            session?.pause()
            context.activity()?.window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        }
    }
    DisposableEffect(Unit) { onDispose { session?.close() } }
    AndroidView({ view }, modifier.then(gestures))
}

@Composable
private fun Pill(text: String, filled: Boolean = false, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier.heightIn(min = 44.dp).clip(RoundedCornerShape(50)).background(if (filled) Brand.ivory else Brand.ink.copy(alpha = 0.6f))
            .pressable(onClick = onClick).padding(horizontal = 18.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center,
    ) { Text(text, color = if (filled) Brand.ink else Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold) }
}

@Composable
private fun Hint(text: String, modifier: Modifier = Modifier) {
    Text(text, color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.Medium, textAlign = TextAlign.Center,
        modifier = modifier.widthIn(max = 420.dp).clip(RoundedCornerShape(12.dp)).background(Brand.ink.copy(alpha = 0.6f)).padding(horizontal = Space.m, vertical = Space.s))
}

/** The shutter: ivory with a brass ring. */
@Composable
private fun Shutter(onClick: () -> Unit) {
    Box(Modifier.size(68.dp).clip(CircleShape).background(Brand.ivory).border(4.dp, Brand.brass, CircleShape)
        .pressable(label = "Take a picture", onClick = onClick).semantics { contentDescription = "Take a picture" })
}

/** A soft flash, not a full white-out */
@Composable
private fun Flash(trigger: Int) {
    val a = remember { Animatable(0f) }
    LaunchedEffect(trigger) {
        if (trigger == 0) return@LaunchedEffect
        a.snapTo(0.6f); a.animateTo(0f, tween(200))
    }
    if (a.value > 0f) Box(Modifier.fillMaxSize().background(Color.White.copy(alpha = a.value)))
}

/**
 * See cabinets in your own kitchen, at real size, before anything is built.
 * The camera finds the floor, a tap places a cabinet, a drag moves it, two
 * fingers turn it, and "Add next" lines up a run. The finish chips switch every
 * door, and the shutter keeps what the camera sees, cabinets included.
 */
@Composable
fun ArCabinetsScreen() {
    val model = LocalModel.current
    val nav = LocalNav.current
    val context = LocalContext.current
    val haptics = LocalHapticFeedback.current
    val scope = rememberCoroutineScope()
    var session by remember { mutableStateOf<Session?>(null) }
    val problem = rememberArSession { session = it }
    val finishes = remember { model.arStart?.let { f -> listOf(f) + HouseColors.starters.filter { it.id != f.id } } ?: HouseColors.starters }
    val counter = remember { model.arCounter }
    var finishIndex by remember { mutableIntStateOf(0) }
    var kind by remember { mutableStateOf(CabinetKind.Base24) }
    var door by remember { mutableStateOf(DoorStyle.Shaker) }
    var doorMenu by remember { mutableStateOf(false) }
    var hint by remember { mutableStateOf(counter?.let { "Move the phone slowly, then tap the floor. Base cabinets wear your ${it.name} counter." } ?: "Move the phone slowly, then tap the floor to place a cabinet") }
    var hasSelection by remember { mutableStateOf(false) }
    val photos = remember { mutableStateListOf<Bitmap>() }
    var flash by remember { mutableIntStateOf(0) }
    var renderer by remember { mutableStateOf<ArRenderer?>(null) }

    fun close() {
        if (photos.isNotEmpty()) model.add(photos.toList(), Attachment.Kind.Ar, "Cabinets in AR")
        model.arStart = null
        model.arCounter = null
        nav.pop()
    }

    // The finish (and counter) every cabinet wears
    LaunchedEffect(renderer, finishIndex) {
        val r = renderer ?: return@LaunchedEffect
        val f = finishes[finishIndex]
        val tex = Textures.load(context, f)
        r.setFinish(Textures.key(f), Material(Rgba.of(f.hex)), tex)
    }
    LaunchedEffect(renderer) {
        val r = renderer ?: return@LaunchedEffect
        counter?.let { c -> r.setCounter(Textures.key(c), Material(Rgba.of(c.hex), shine = 0.3f), Textures.load(context, c)) }
    }

    BackHandler { close() }
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        if (problem != null) {
            Box(Modifier.fillMaxSize().padding(Space.xl), contentAlignment = Alignment.Center) { Text(problem, style = Type.body, textAlign = TextAlign.Center) }
        } else if (session != null) {
            ArView({ v -> ArRenderer(v, measuring = false).also { renderer = it } }, session, Modifier.fillMaxSize(), Modifier.pointerInput(Unit) {
                awaitEachGesture {
                    val down = awaitFirstDown()
                    val r = renderer ?: return@awaitEachGesture
                    val onCabinet = r.cabinetAt(down.position.x, down.position.y)
                    var dragging = false
                    var moved = 0f
                    var multi = false
                    while (true) {
                        val e = awaitPointerEvent()
                        val pressed = e.changes.filter { it.pressed }
                        if (pressed.isEmpty()) break
                        if (pressed.size >= 2) {
                            multi = true
                            val turn = e.calculateRotation()
                            if (abs(turn) > 0.01f) r.turnSelected(-Math.toRadians(turn.toDouble()).toFloat())
                        } else {
                            moved += pressed[0].positionChange().getDistance()
                            if (onCabinet && moved > 8f) {
                                // Dragging a cabinet picks it and slides it along the floor
                                if (!dragging) { r.selectAt(down.position.x, down.position.y); dragging = true }
                                r.dragTo(pressed[0].position.x, pressed[0].position.y)
                            }
                        }
                        e.changes.forEach { it.consume() }
                    }
                    if (!multi && moved < 12f) {
                        // A tap on a cabinet picks it; anywhere on the floor places a new one
                        val placed = r.tapPlace(down.position.x, down.position.y, kind)
                        if (placed == null) hint = "Point at the floor and tap again"
                        else { hint = "Drag to move, turn with two fingers. \"Add next\" lines up the next one."; haptics.performHapticFeedback(HapticFeedbackType.Confirm) }
                    }
                    hasSelection = r.selected != null
                }
            })
        }
        Flash(flash)

        Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).padding(Space.l)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Pill("Close") { close() }
                Box(Modifier.weight(1f), contentAlignment = Alignment.Center) {
                    Pill(door.label) { doorMenu = true }
                    DropdownMenu(doorMenu, onDismissRequest = { doorMenu = false }, containerColor = Brand.raised) {
                        DoorStyle.entries.forEach { d ->
                            DropdownMenuItem(text = { Column { Text(d.label, fontWeight = FontWeight.SemiBold); Text(d.detail, style = Type.caption) } }, onClick = {
                                doorMenu = false; door = d; renderer?.chooseDoor(d); hint = "${d.label} doors"
                                haptics.performHapticFeedback(HapticFeedbackType.SegmentTick)
                            })
                        }
                    }
                }
                Pill("Done", filled = true) {
                    // Done with nothing saved still keeps what is on screen
                    val r = renderer
                    if (photos.isEmpty() && r != null && r.cabinets.isNotEmpty()) r.capture(true) { b -> b?.let { photos += it }; close() } else close()
                }
            }
            Box(Modifier.fillMaxWidth().padding(top = Space.m), contentAlignment = Alignment.Center) { Hint(hint) }
            Box(Modifier.weight(1f))
            if (hasSelection) {
                Row(Modifier.fillMaxWidth().padding(bottom = Space.m), horizontalArrangement = Arrangement.spacedBy(Space.m, Alignment.CenterHorizontally)) {
                    Pill("Remove") { renderer?.removeSelected(); hasSelection = renderer?.selected != null; haptics.performHapticFeedback(HapticFeedbackType.SegmentTick) }
                    Pill("Add next") { renderer?.addNext(kind); haptics.performHapticFeedback(HapticFeedbackType.Confirm) }
                }
            }
            // Which cabinet a tap places
            LazyRow(horizontalArrangement = Arrangement.spacedBy(Space.s)) {
                items(CabinetKind.entries) { k ->
                    Box(Modifier.semantics { selected = k == kind }) {
                        Pill(k.title, filled = k == kind) { kind = k; haptics.performHapticFeedback(HapticFeedbackType.SegmentTick) }
                    }
                }
            }
            // The finish for every cabinet in the room
            LazyRow(Modifier.padding(vertical = Space.m), horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                items(finishes.indices.toList()) { i ->
                    val on = i == finishIndex
                    FinishSwatch(finishes[i], Modifier.size(44.dp).clip(CircleShape).border(if (on) 3.dp else 1.5.dp, if (on) Brand.brass else Brand.ivory.copy(alpha = 0.5f), CircleShape)
                        .pressable(label = finishes[i].name) { finishIndex = i; hint = finishes[i].name; haptics.performHapticFeedback(HapticFeedbackType.SegmentTick) }
                        .semantics { contentDescription = finishes[i].name; selected = on }, 160)
                }
            }
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                Shutter {
                    haptics.performHapticFeedback(HapticFeedbackType.Confirm)
                    flash++
                    renderer?.capture(true) { b -> b?.let { photos += it } }
                }
                if (photos.isNotEmpty()) Text("${photos.size} saved", color = Brand.ivory, fontSize = 14.sp, fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.align(Alignment.CenterEnd).padding(end = Space.xl))
            }
        }
    }
}

/**
 * The camera tape measure: aim the dot at one end of a wall, a gap or a
 * window, tap +, move to the other end and tap + again. Sizes show in the
 * person's units and go with the project, with a picture.
 */
@Composable
fun ArMeasureScreen() {
    val model = LocalModel.current
    val nav = LocalNav.current
    val haptics = LocalHapticFeedback.current
    val density = LocalDensity.current
    var session by remember { mutableStateOf<Session?>(null) }
    val problem = rememberArSession { session = it }
    var renderer by remember { mutableStateOf<ArRenderer?>(null) }
    var labels by remember { mutableStateOf<List<Pair<FloatArray, Float>>>(emptyList()) }
    var aiming by remember { mutableStateOf(false) }
    var count by remember { mutableIntStateOf(0) }
    val photos = remember { mutableStateListOf<Bitmap>() }
    var flash by remember { mutableIntStateOf(0) }
    val unit = model.unit.forText

    fun finish() {
        val r = renderer
        val lengths = r?.lengths() ?: emptyList()
        model.addLengths(lengths)
        if (photos.isNotEmpty()) model.add(photos.toList(), Attachment.Kind.Measure, "Measurement picture", quiet = true)
        if (lengths.isNotEmpty()) model.say(if (lengths.size == 1) "1 length added to your project" else "${lengths.size} lengths added to your project")
        nav.pop()
    }

    BackHandler { finish() }
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        if (problem != null) {
            Box(Modifier.fillMaxSize().padding(Space.xl), contentAlignment = Alignment.Center) { Text(problem, style = Type.body, textAlign = TextAlign.Center) }
        } else if (session != null) {
            ArView({ v -> ArRenderer(v, measuring = true).also { r -> renderer = r; r.onLabels = { l -> v.post { labels = l; aiming = r.aim != null } } } },
                session, Modifier.fillMaxSize(), Modifier)
        }
        // The size on each line, where it is on screen
        labels.forEach { (p, m) ->
            val x = with(density) { p[0].toDp() }
            val y = with(density) { p[1].toDp() }
            Text(unit.length(m.toDouble()), color = Brand.ink, fontSize = 15.sp, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.offset(x - 40.dp, y - 16.dp).widthIn(min = 80.dp).clip(RoundedCornerShape(50)).background(Brand.ivory)
                    .padding(horizontal = Space.s, vertical = Space.xs), textAlign = TextAlign.Center)
        }
        // The aim
        Box(Modifier.align(Alignment.Center).size(28.dp).border(2.dp, if (aiming) Brand.ivory else Brand.ivory.copy(alpha = 0.4f), CircleShape))
        Flash(flash)

        Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).padding(Space.l)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Pill("Close") { finish() }
                Box(Modifier.weight(1f))
                Pill("Done", filled = true) { finish() }
            }
            Box(Modifier.fillMaxWidth().padding(top = Space.m), contentAlignment = Alignment.Center) {
                Hint(when {
                    !aiming -> "Move the phone slowly so it can see the surfaces"
                    count % 2 == 1 -> "Move to the other end and tap +"
                    else -> "Aim at one end and tap +"
                })
            }
            Box(Modifier.weight(1f))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(Space.xl, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(52.dp).clip(CircleShape).background(Brand.ink.copy(alpha = 0.6f)).pressable(label = "Undo") {
                    renderer?.undo(); count = (count - 1).coerceAtLeast(0)
                }.semantics { contentDescription = "Undo" }, contentAlignment = Alignment.Center) {
                    Icon(Icons.AutoMirrored.Filled.Undo, null, tint = Brand.ivory)
                }
                Box(Modifier.size(72.dp).clip(CircleShape).background(Brand.ivory).pressable(label = "Add a point") {
                    if (renderer?.addPoint() == true) { count++; haptics.performHapticFeedback(HapticFeedbackType.Confirm) }
                }.semantics { contentDescription = "Add a point" }, contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Add, null, tint = Brand.ink, modifier = Modifier.size(36.dp))
                }
                Box(Modifier.size(52.dp).clip(CircleShape).background(Brand.ink.copy(alpha = 0.6f)).border(3.dp, Brand.brass, CircleShape)
                    .pressable(label = "Take a picture") { flash++; renderer?.capture(false) { b -> b?.let { photos += it } } }
                    .semantics { contentDescription = "Take a picture" })
            }
            if (photos.isNotEmpty()) Text("${photos.size} saved", color = Brand.ivory, fontSize = 14.sp, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.align(Alignment.CenterHorizontally).padding(top = Space.s))
        }
    }
}
