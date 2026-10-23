package com.greencabinetsny.app.screens

import android.graphics.Bitmap
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.calculatePan
import androidx.compose.foundation.gestures.calculateZoom
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.CropSquare
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material.icons.outlined.ExpandMore
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material.icons.outlined.TouchApp
import androidx.compose.material.icons.outlined.Verified
import androidx.compose.material.icons.outlined.ViewInAr
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.res.ResourcesCompat
import com.greencabinetsny.app.LocalModel
import com.greencabinetsny.app.R
import com.greencabinetsny.app.Tools
import com.greencabinetsny.app.drawing.DrawingFonts
import com.greencabinetsny.app.drawing.DrawingRenderer
import com.greencabinetsny.app.drawing.FloorPlanDrawing
import com.greencabinetsny.app.model.AppTab
import com.greencabinetsny.app.model.Finish
import com.greencabinetsny.app.model.HouseColors
import com.greencabinetsny.app.model.KitchenLayout
import com.greencabinetsny.app.model.LengthUnit
import com.greencabinetsny.app.model.Panel
import com.greencabinetsny.app.model.SavedScan
import com.greencabinetsny.app.model.WoodSpecies
import com.greencabinetsny.app.render.Rgba
import com.greencabinetsny.app.render.Room3DController
import com.greencabinetsny.app.render.Room3DView
import com.greencabinetsny.app.render.RoomScene
import com.greencabinetsny.app.render.Textures
import com.greencabinetsny.app.ui.ActionButton
import com.greencabinetsny.app.ui.ActionKind
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.FactView
import com.greencabinetsny.app.ui.Motion
import com.greencabinetsny.app.ui.Radius
import com.greencabinetsny.app.ui.Segmented
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Type
import com.greencabinetsny.app.ui.card
import com.greencabinetsny.app.ui.page
import com.greencabinetsny.app.ui.pressable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.NumberFormat
import kotlin.math.roundToInt

private fun money(v: Int) = "\$" + NumberFormat.getIntegerInstance().format(v)

/** The room: turn it in 3D or read it as a floor plan, pick the walls that get new cabinets, see them and their price, and send it all. */
@Composable
fun RoomResultScreen(id: String) {
    val model = LocalModel.current
    val scan = model.scan(id)
    if (scan == null) {
        DetailScaffold("Your room") { Unavailable("This room isn't here anymore. It may have been replaced by a newer one.") }
        return
    }
    DetailScaffold(if (scan.sample) "Sample room" else if (scan.typed != null) "Your kitchen" else "Your room") { RoomResult(scan) }
}

private class LayoutCache {
    private val store = HashMap<String, KitchenLayout>()
    fun get(style: KitchenLayout.Style, walls: Set<Int>, make: () -> KitchenLayout): KitchenLayout =
        store.getOrPut(style.name + walls.sorted().joinToString(",")) { make() }
}

@Composable
private fun RoomResult(scan: SavedScan) {
    val model = LocalModel.current
    val context = LocalContext.current
    val haptics = LocalHapticFeedback.current
    val scope = rememberCoroutineScope()
    val controller = remember { Room3DController() }
    val layouts = remember { LayoutCache() }

    var plan by remember { mutableStateOf(false) }
    var selecting by remember { mutableStateOf(false) }
    var selected by remember { mutableStateOf(scan.picked?.toSet() ?: emptySet()) }
    var added by remember { mutableStateOf(false) }
    var topView by remember { mutableStateOf(false) }
    var showCabinets by remember { mutableStateOf(true) }
    var style by remember { mutableStateOf(KitchenLayout.Style.Kitchen) }
    var doorID by remember { mutableStateOf<String?>(null) }
    var counterID by remember { mutableStateOf<String?>(null) }
    var photos by remember { mutableIntStateOf(0) }
    var working by remember { mutableStateOf(false) }

    val layout = layouts.get(style, selected) { KitchenLayout.build(scan.room, selected, style) }
    val shown = if (showCabinets && selected.isNotEmpty()) layout else null

    // Door finishes they added to their quote, then the decors and paints we use most (light oak to start)
    val doorOptions = run {
        val favorites = model.basket.picks.mapNotNull { line ->
            Panel.all.firstOrNull { it.requestLine == line }?.let { p -> if (p.isCountertop) null else p.finishLook }
                ?: (HouseColors.paints + HouseColors.stains).firstOrNull { it.requestLine == line }
                ?: WoodSpecies.all.firstOrNull { Finish.wood(it).requestLine == line }?.let { Finish.wood(it) }
        }
        val out = favorites.toMutableList()
        val oak = Panel.find("shinnoki-s4-ivory-oak")?.finishLook
        for (f in listOfNotNull(oak) + HouseColors.starters) if (out.none { it.id == f.id }) out += f
        out
    }
    val counterOptions = run {
        val out = model.basket.picks.mapNotNull { line -> Panel.all.firstOrNull { it.requestLine == line && it.isCountertop } }.toMutableList()
        listOf("raphael-calacatta-statuario", "raphael-venatino-white", "raphael-crema-taj", "raphael-travertine", "raphael-calacatta-nero", "raphael-marin-black")
            .mapNotNull { Panel.find(it) }.forEach { if (it !in out) out += it }
        out
    }
    val door = doorOptions.firstOrNull { it.id == doorID } ?: doorOptions.first()
    val counter = if (style == KitchenLayout.Style.Kitchen) (counterOptions.firstOrNull { it.id == counterID } ?: counterOptions.firstOrNull())?.finishLook else null

    // The cabinets in the room, rebuilt when they or what they wear change
    LaunchedEffect(shown, door.id, counter?.id, photos) {
        val r = controller.renderer ?: return@LaunchedEffect
        val look = RoomScene.Look(
            Textures.cached(door)?.let { Textures.key(door) }, Rgba.of(door.hex),
            counter?.let { c -> Textures.cached(c)?.let { Textures.key(c) } }, Rgba.of(counter?.hex ?: "#E7E3DC"),
        )
        listOfNotNull(door, counter).forEach { f -> Textures.cached(f)?.let { if (!r.hasTexture(Textures.key(f))) r.addTexture(Textures.key(f), it) } }
        r.setCabinets(shown, look)
    }
    // Their pictures arrive in the background
    LaunchedEffect(door.id, counter?.id) {
        var got = false
        for (f in listOfNotNull(door, counter)) {
            if (Textures.cached(f) == null && Textures.load(context, f) != null) got = true
        }
        if (got) photos++
    }
    LaunchedEffect(selected, selecting) {
        controller.selecting = selecting
        controller.renderer?.update(selected, selecting)
    }
    LaunchedEffect(selected, model.unit, style) { added = false }
    // Typed sizes open with their walls chosen: face the new kitchen
    LaunchedEffect(Unit) {
        delay(400)
        if (selected.isNotEmpty() && showCabinets) controller.focus(selected, true)
    }

    fun toggle(i: Int) {
        selected = if (i in selected) selected - i else selected + i
        haptics.performHapticFeedback(HapticFeedbackType.SegmentTick)
    }
    controller.onTapWall = { toggle(it) }

    fun faceCabinets() {
        if (!showCabinets || selected.isEmpty() || plan) return
        topView = false
        controller.focus(selected, true)
    }

    /** For the office and the design board: the cabinets and their price first, then (after the room's sizes) every box wall by wall and the NKBA checks. */
    fun layoutLines(): Pair<List<String>, List<String>> {
        val l = shown ?: return emptyList<String>() to emptyList()
        if (l.isEmpty) return emptyList<String>() to emptyList()
        val lead = mutableListOf("New cabinets: ${l.countLine}" + (l.cabinetPrice?.let { ", about ${money(it)}" } ?: "") + ", shown in ${door.detail} ${door.name}")
        val cp = l.counterPrice
        if (cp != null && counter != null) lead += "Countertop: ${counter.name}, ${l.counterSqFt.roundToInt()} sq ft, about ${money(cp)}"
        val rows = l.lines(selected)
        val walls = rows.filter { it.startsWith("Wall ") }.joinToString(" · ")
        val rest = rows.filter { !it.startsWith("Wall ") }.joinToString(". ")
        return lead to listOf(walls.take(590), rest.take(590)).filter { it.isNotEmpty() }
    }

    /** The set: the room in 3D, the floor plan, and each picked wall flat and in 3D. */
    suspend fun pictures(): List<Pair<Bitmap, String>> = withContext(Dispatchers.Default) {
        val ref = scan.id
        val unit = model.unit
        val fonts = DrawingFonts(
            ResourcesCompat.getFont(context, R.font.cormorant_medium) ?: android.graphics.Typeface.SERIF,
            ResourcesCompat.getFont(context, R.font.cormorant_semibold) ?: android.graphics.Typeface.SERIF,
        )
        val out = mutableListOf<Pair<Bitmap, String>>()
        controller.snapshot()?.let { out += DrawingRenderer.branded(it, "Room in 3D", ref, fonts) to "Room in 3D" }
        out += DrawingRenderer.branded(DrawingRenderer.plan(scan.room, unit, selected, shown, fonts), "Floor plan", ref, fonts) to "Floor plan"
        for (i in selected.sorted()) {
            out += DrawingRenderer.branded(DrawingRenderer.wall(scan.room, i, unit, shown), "Wall ${i + 1} drawing", ref, fonts) to "Wall ${i + 1} drawing"
            controller.snapshotWall(i)?.let { out += DrawingRenderer.branded(it, "Wall ${i + 1} in 3D", ref, fonts) to "Wall ${i + 1} in 3D" }
        }
        out
    }

    fun prepare(then: (List<Pair<Bitmap, String>>) -> Unit) {
        if (working) return
        working = true
        scope.launch {
            delay(60)
            val pics = pictures()
            then(pics)
            working = false
        }
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = Space.section)) {
        Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
            Segmented(listOf(false, true), plan, label = { if (it) "Floor plan" else "3D" }) { plan = it }

            // The viewer
            Box(Modifier.fillMaxWidth().height(430.dp).clip(RoundedCornerShape(Radius.card)).background(Brand.paper)) {
                Room3DView(scan.room, controller, Modifier.fillMaxSize().alpha(if (plan) 0f else 1f))
                if (plan) PlanCanvas(scan, model.unit, selected, selecting, shown) { toggle(it) }
                Row(
                    Modifier.align(Alignment.TopEnd).padding(Space.m).heightIn(min = 40.dp).clip(RoundedCornerShape(50))
                        .background(Brand.ink.copy(alpha = 0.8f))
                        .pressable(label = "Tap walls in the view to pick them") {
                            selecting = !selecting
                            if (!selecting) faceCabinets()
                        }
                        .padding(horizontal = Space.m, vertical = Space.s),
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.xs),
                ) {
                    Icon(if (selecting) Icons.Default.Check else Icons.Outlined.TouchApp, null, tint = Brand.ivory, modifier = Modifier.size(18.dp))
                    Text(if (selecting) "Done" else "Pick walls", color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                }
                if (!plan) {
                    Row(
                        Modifier.align(Alignment.BottomStart).padding(Space.m).heightIn(min = 40.dp).clip(RoundedCornerShape(50))
                            .background(Brand.ink.copy(alpha = 0.8f))
                            .pressable {
                                topView = !topView
                                controller.resetCamera(topView, true)
                            }
                            .padding(horizontal = Space.m, vertical = Space.s),
                        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.xs),
                    ) {
                        Icon(if (topView) Icons.Outlined.ViewInAr else Icons.Outlined.CropSquare, null, tint = Brand.ivory, modifier = Modifier.size(18.dp))
                        Text(if (topView) "Angled view" else "From above", color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            // The one next step, always in plain sight: choose walls, then see the kitchen
            Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                when {
                    selecting -> {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(if (selected.isEmpty()) "Tap the walls where you want cabinets" else "Tap more walls, or tap one again to take it off",
                                style = Type.headline, modifier = Modifier.weight(1f))
                            if (selected.isNotEmpty()) {
                                Text("Clear", color = Brand.brass, fontSize = 15.sp, fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.heightIn(min = 44.dp).pressable { selected = emptySet() }.padding(Space.s))
                            }
                        }
                        WallChips(scan, selected, model.unit) { toggle(it) }
                        AnimatedVisibility(selected.isNotEmpty(), enter = fadeIn(), exit = fadeOut()) {
                            ActionButton(if (style == KitchenLayout.Style.Kitchen) "See my new kitchen" else "See my new closets", Modifier.fillMaxWidth(),
                                icon = Icons.Outlined.ViewInAr) {
                                selecting = false
                                faceCabinets()
                            }
                        }
                    }
                    selected.isEmpty() -> {
                        ActionButton("Choose walls for new cabinets", Modifier.fillMaxWidth(), icon = Icons.Outlined.TouchApp) { selecting = true }
                        Text("Tap the walls in your room. We put cabinets on them and show you the price.", style = Type.secondary)
                        Text(if (plan) "Pinch to zoom in, then drag to move around." else "Drag to turn the room, pinch to zoom.", style = Type.footnote)
                    }
                    else -> Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(if (selected.size == 1) "New cabinets on 1 wall" else "New cabinets on ${selected.size} walls",
                            color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        Text("Change walls", color = Brand.brass, fontSize = 15.sp, fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.heightIn(min = 44.dp).pressable { selecting = true }.padding(Space.s))
                    }
                }
            }

            if (selected.isNotEmpty()) {
                NewCabinets(layout, style, { style = it }, doorOptions, door, { doorID = it }, counterOptions, counter, { counterID = it },
                    showCabinets) { showCabinets = it; if (it) faceCabinets() }
            }

            // Typed sizes have no measured floor or ceiling to show
            if (scan.typed == null) {
                val u = model.unit.forText
                val r = scan.room
                Column(Modifier.fillMaxWidth().card(), verticalArrangement = Arrangement.spacedBy(Space.l)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(Space.l)) {
                        FactView(u.area(r.floorArea), "Floor area", Modifier.weight(1f))
                        FactView(u.length(r.ceiling), "Ceiling", Modifier.weight(1f))
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(Space.l)) {
                        FactView(u.length(r.wallRun), "Wall length", Modifier.weight(1f))
                        FactView("${r.doors.size} · ${r.windows.size}", "Doors · windows", Modifier.weight(1f))
                    }
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
                Text("SIZES ON THE PICTURES", style = Type.eyebrow)
                Segmented(LengthUnit.entries, model.unit, label = { it.label }) { model.chooseUnit(it) }
            }

            Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                when {
                    scan.sample -> Text("This is a sample. Type your own kitchen's sizes from the Plan tab.", style = Type.secondary)
                    added -> ActionButton("Review and send", Modifier.fillMaxWidth(), icon = Icons.AutoMirrored.Outlined.Send) { model.tab = AppTab.Quote }
                    else -> ActionButton(if (working) "Preparing…" else "Add to my project", Modifier.fillMaxWidth(), icon = Icons.Outlined.Add, enabled = !working) {
                        val (lead, tail) = layoutLines()
                        prepare { pics -> model.attach(scan, pics, lead, tail); added = true }
                    }
                }
                ActionButton("Save, print or share", Modifier.fillMaxWidth(), icon = Icons.Outlined.Share, kind = ActionKind.Secondary, enabled = !working) {
                    prepare { pics -> Tools.share(context, pics.map { it.first }) }
                }
                Text("Pictures carry the Green Cabinets name and reference ${scan.id}.", style = Type.footnote)
            }
        }
    }
}

/** Every wall as a button too: easier than a small target in the drawing, and the way to pick with TalkBack. */
@Composable
private fun WallChips(scan: SavedScan, selected: Set<Int>, unit: LengthUnit, onToggle: (Int) -> Unit) {
    val u = unit.forText
    LazyRow(horizontalArrangement = Arrangement.spacedBy(Space.s)) {
        items(scan.room.walls.indices.toList()) { i ->
            val on = i in selected
            Row(
                Modifier.heightIn(min = 44.dp).clip(RoundedCornerShape(50)).background(if (on) Brand.brass else Brand.raised)
                    .pressable { onToggle(i) }.semantics { this.selected = on }
                    .padding(horizontal = Space.m),
                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.xs),
            ) {
                if (on) Icon(Icons.Default.Check, null, tint = Brand.ink, modifier = Modifier.size(16.dp))
                Text("Wall ${i + 1}", color = if (on) Brand.ink else Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                Text(u.length(scan.room.walls[i].len), color = (if (on) Brand.ink else Brand.ivory).copy(alpha = 0.8f), fontSize = 15.sp)
            }
        }
    }
}

@Composable
private fun NewCabinets(
    l: KitchenLayout, style: KitchenLayout.Style, onStyle: (KitchenLayout.Style) -> Unit,
    doors: List<Finish>, door: Finish, onDoor: (String) -> Unit,
    counters: List<Panel>, counter: Finish?, onCounter: (String) -> Unit,
    show: Boolean, onShow: (Boolean) -> Unit,
) {
    val haptics = LocalHapticFeedback.current
    Column(Modifier.fillMaxWidth().card(), verticalArrangement = Arrangement.spacedBy(Space.l)) {
        Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
            Text(if (style == KitchenLayout.Style.Kitchen) "Your new kitchen" else "Your new closets", style = Type.card)
            Segmented(KitchenLayout.Style.entries, style, label = { it.label }, onSelect = onStyle)
        }
        if (l.isEmpty) {
            Text("These walls are too short for cabinets, or doors and windows fill them. Try another wall.", style = Type.secondary)
            return@Column
        }
        // The price
        val total = l.cabinetPrice?.let { it + if (style == KitchenLayout.Style.Kitchen) l.counterPrice ?: 0 else 0 }
        Column(verticalArrangement = Arrangement.spacedBy(Space.xs), modifier = Modifier.semantics(mergeDescendants = true) {}) {
            if (total != null) Text("About ${money(total)}", style = Type.display(40).copy(color = Brand.brass))
            Text(l.countLine + (l.cabinetPrice?.let { ": about ${money(it)}" } ?: ""), style = Type.subhead)
            val cp = l.counterPrice
            if (style == KitchenLayout.Style.Kitchen && cp != null && counter != null) {
                Text("${counter.name} stone countertop, ${l.counterSqFt.roundToInt()} sq ft: about ${money(cp)}", style = Type.subhead)
            }
            Text(
                if (style == KitchenLayout.Style.Kitchen) "From our published prices: \$225 a foot for base cabinets, \$125 a foot for wall cabinets, \$65 a square foot for stone. The final price comes after we measure."
                else "From our published price: \$350 a foot for full-height cabinets. The final price comes after we measure and plan the inside.",
                style = Type.footnote,
            )
        }
        Chips("Try a door color", doors.map { it.id to it.name }, door.id, swatch = { i, m -> FinishSwatch(doors[i], m, 160) }) {
            haptics.performHapticFeedback(HapticFeedbackType.SegmentTick); onDoor(it)
        }
        if (style == KitchenLayout.Style.Kitchen && counter != null) {
            Chips("Try a countertop", counters.map { it.id to it.name }, counter.id, swatch = { i, m -> PanelSwatch(counters[i], m, 160) }) {
                haptics.performHapticFeedback(HapticFeedbackType.SegmentTick); onCounter(it)
            }
        }
        if (style == KitchenLayout.Style.Kitchen && l.checks.isNotEmpty()) Nkba(l.checks)
        Row(Modifier.heightIn(min = 48.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("Show them in the room", style = Type.subhead, modifier = Modifier.weight(1f))
            Switch(show, onShow, colors = SwitchDefaults.colors(checkedTrackColor = Brand.brass, checkedThumbColor = Brand.ivory))
        }
    }
}

/** A row of round swatches to try on the cabinets */
@Composable
private fun Chips(title: String, items: List<Pair<String, String>>, selected: String, swatch: @Composable (Int, Modifier) -> Unit, onPick: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
        Text(title, color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(Space.m), verticalAlignment = Alignment.Top) {
            items(items.indices.toList()) { i ->
                val (id, name) = items[i]
                val on = id == selected
                Column(
                    Modifier.width(68.dp).pressable { onPick(id) }.semantics(mergeDescendants = true) { contentDescription = name; this.selected = on },
                    horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(Space.xs),
                ) {
                    swatch(i, Modifier.padding(2.dp).size(52.dp).clip(CircleShape).border(if (on) 3.dp else 1.dp, if (on) Brand.brass else Brand.line, CircleShape))
                    Text(name, color = if (on) Brand.ivory else Brand.stone, fontSize = 11.sp, lineHeight = 13.sp, maxLines = 2, textAlign = TextAlign.Center)
                }
            }
        }
    }
}

/** The layout held to the NKBA kitchen planning guidelines, folded to one line until asked */
@Composable
private fun Nkba(checks: List<KitchenLayout.Check>) {
    var open by remember { mutableStateOf(false) }
    val met = checks.count { it.ok }
    val turn by animateFloatAsState(if (open) 180f else 0f, Motion.snappy(), label = "nkba")
    Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
        Row(
            Modifier.fillMaxWidth().heightIn(min = 44.dp).pressable(0.99f, label = "Shows each guideline") { open = !open }
                .semantics { stateDescription = if (open) "Showing the list" else "" },
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.s),
        ) {
            Icon(if (met == checks.size) Icons.Filled.CheckCircle else Icons.Outlined.Verified, null, tint = Brand.brass, modifier = Modifier.size(20.dp))
            Text("Meets $met of ${checks.size} NKBA kitchen design guidelines", color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
            Icon(Icons.Outlined.ExpandMore, null, tint = Brand.stone, modifier = Modifier.rotate(turn))
        }
        AnimatedVisibility(open, enter = expandVertically(tween(220)) + fadeIn(), exit = shrinkVertically(tween(180)) + fadeOut()) {
            Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
                checks.forEach { c ->
                    Row(horizontalArrangement = Arrangement.spacedBy(Space.s), modifier = Modifier.semantics(mergeDescendants = true) {
                        contentDescription = "${if (c.ok) "Met" else "Not met"}: ${c.title}. ${c.detail}"
                    }) {
                        Icon(if (c.ok) Icons.Filled.CheckCircle else Icons.Outlined.ErrorOutline, null, tint = if (c.ok) Brand.brass else Brand.error,
                            modifier = Modifier.size(18.dp).padding(top = 1.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(1.dp)) {
                            Text(c.title, color = Brand.ivory, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            Text(c.detail, style = Type.footnote)
                        }
                    }
                }
                Text("The NKBA (National Kitchen and Bath Association) guidelines are the rules designers use for a kitchen that works. We finish the plan with you.",
                    style = Type.footnote)
            }
        }
    }
}

/** The floor plan: pinch to zoom and drag when zoomed; while picking, a tap picks a wall. */
@Composable
private fun PlanCanvas(scan: SavedScan, unit: LengthUnit, selected: Set<Int>, selecting: Boolean, layout: KitchenLayout?, onTapWall: (Int) -> Unit) {
    val context = LocalContext.current
    val density = LocalDensity.current.density
    val fonts = remember {
        DrawingFonts(
            ResourcesCompat.getFont(context, R.font.cormorant_medium) ?: android.graphics.Typeface.SERIF,
            ResourcesCompat.getFont(context, R.font.cormorant_semibold) ?: android.graphics.Typeface.SERIF,
        )
    }
    var zoom by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    val drawing = FloorPlanDrawing(scan.room, unit, selected, tags = selecting, layout = layout, fonts = fonts, density = density)
    Box(
        Modifier
            .fillMaxSize()
            .background(Brand.paper)
            .semantics { contentDescription = "Floor plan, ${scan.room.walls.size} walls" }
            .pointerInput2(selecting, onTapWall, drawing, { zoom }, { offset }, { z, o -> zoom = z; offset = o }),
    ) {
        Canvas(Modifier.fillMaxSize().graphicsLayer { scaleX = zoom; scaleY = zoom; translationX = offset.x; translationY = offset.y }) {
            drawIntoCanvas { drawing.draw(it.nativeCanvas, size.width, size.height) }
        }
    }
}

/** Pinch and drag for the plan, and taps that undo the zoom to find the wall under them. */
private fun Modifier.pointerInput2(
    selecting: Boolean, onTapWall: (Int) -> Unit, drawing: FloorPlanDrawing,
    zoom: () -> Float, offset: () -> Offset, set: (Float, Offset) -> Unit,
): Modifier = this
    .pointerInput(selecting, drawing) {
        detectTapGestures(
            onDoubleTap = if (selecting) null else { _ -> set(1f, Offset.Zero) },
            onTap = { p ->
                if (!selecting) return@detectTapGestures
                val c = Offset(size.width / 2f, size.height / 2f)
                val o = offset()
                val z = zoom()
                val q = Offset((p.x - c.x - o.x) / z + c.x, (p.y - c.y - o.y) / z + c.y)
                drawing.wallAt(q.x, q.y, size.width.toFloat(), size.height.toFloat())?.let(onTapWall)
            },
        )
    }
    .pointerInput(Unit) {
        awaitEachGesture {
            awaitFirstDown(requireUnconsumed = false)
            do {
                val e = awaitPointerEvent()
                val fingers = e.changes.count { it.pressed }
                if (fingers >= 2 || zoom() > 1.01f) {
                    val z = (zoom() * e.calculateZoom()).coerceIn(1f, 5f)
                    val p = e.calculatePan()
                    val mx = size.width * (z - 1) / 2
                    val my = size.height * (z - 1) / 2
                    val o = offset() + p
                    set(z, if (z <= 1f) Offset.Zero else Offset(o.x.coerceIn(-mx, mx), o.y.coerceIn(-my, my)))
                    e.changes.forEach { it.consume() }
                }
            } while (e.changes.any { it.pressed })
        }
    }
