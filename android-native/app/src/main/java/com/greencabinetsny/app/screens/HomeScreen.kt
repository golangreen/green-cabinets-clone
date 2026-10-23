package com.greencabinetsny.app.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
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
import androidx.compose.material.icons.automirrored.outlined.Message
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.outlined.Colorize
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.DocumentScanner
import androidx.compose.material.icons.outlined.Elevator
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.ExpandMore
import androidx.compose.material.icons.outlined.Palette
import androidx.compose.material.icons.outlined.Stairs
import androidx.compose.material.icons.outlined.Straighten
import androidx.compose.material.icons.outlined.ViewInAr
import androidx.compose.material.icons.outlined.VolumeDown
import androidx.compose.material.icons.outlined.Window
import androidx.compose.material3.Icon
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.positionChange
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.setProgress
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.greencabinetsny.app.DebugLaunch
import com.greencabinetsny.app.LocalModel
import com.greencabinetsny.app.LocalNav
import com.greencabinetsny.app.Tools
import com.greencabinetsny.app.model.AppTab
import com.greencabinetsny.app.model.Content
import com.greencabinetsny.app.model.Panel
import com.greencabinetsny.app.model.Supplier
import com.greencabinetsny.app.ui.ActionButton
import com.greencabinetsny.app.ui.ActionKind
import com.greencabinetsny.app.ui.ActionRow
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.FactView
import com.greencabinetsny.app.ui.Hairline
import com.greencabinetsny.app.ui.IconWell
import com.greencabinetsny.app.ui.Motion
import com.greencabinetsny.app.ui.PhotoView
import com.greencabinetsny.app.ui.Radius
import com.greencabinetsny.app.ui.SectionHeader
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Type
import com.greencabinetsny.app.ui.card
import com.greencabinetsny.app.ui.isWide
import com.greencabinetsny.app.ui.page
import com.greencabinetsny.app.ui.pressable
import java.text.NumberFormat
import kotlin.math.abs
import kotlin.math.roundToInt

@Composable
fun HomeScreen() {
    val scroll = rememberScrollState()
    LaunchedEffect(scroll.maxValue) {
        DebugLaunch.scroll?.let { if (scroll.maxValue > 0) scroll.scrollTo((scroll.maxValue * it).roundToInt()) }
    }
    Column(Modifier.fillMaxSize().verticalScroll(scroll).padding(bottom = Space.section), verticalArrangement = Arrangement.spacedBy(Space.section)) {
        Hero()
        Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.section)) {
            StartHere()
            ToolsSection()
            RecentWork()
            MaterialsStrip()
            DrawingReveal()
            Steps()
            Pricing()
            Buildings()
            Faqs()
            Contact()
        }
    }
}

@Composable
private fun Hero() {
    val model = LocalModel.current
    val h = if (isWide()) 520.dp else 440.dp
    Box {
        Box(Modifier.fillMaxWidth().height(h)) {
            AsyncImage(
                model = "file:///android_asset/img/${Content.HERO}.jpg",
                contentDescription = "White oak kitchen with a marble waterfall island, built by Green Cabinets",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
            // The photo stays bright; only its lower edge melts into the page
            Box(Modifier.fillMaxWidth().height(170.dp).align(Alignment.BottomCenter).background(Brush.verticalGradient(listOf(Color.Transparent, Brand.ink))))
            // Keeps the status bar legible over the photo
            Box(Modifier.fillMaxWidth().height(110.dp).background(Brush.verticalGradient(listOf(Brand.ink.copy(alpha = 0.55f), Color.Transparent))))
        }
        Column(Modifier.padding(top = h - 64.dp).page(), verticalArrangement = Arrangement.spacedBy(Space.l)) {
            Text("SINCE 2009 · DESIGNED IN BUSHWICK", style = Type.eyebrow)
            Text(
                buildAnnotatedString {
                    append("Most NYC kitchens were never designed for ")
                    withStyle(SpanStyle(fontStyle = FontStyle.Italic, color = Brand.brass)) { append("stock cabinets.") }
                },
                style = Type.hero,
                modifier = Modifier.semantics { heading() },
            )
            Text("Custom kitchens, vanities and closets for Brooklyn, Manhattan, Queens and Staten Island.", style = Type.body)
            Spacer(Modifier.height(Space.xs))
            ActionRow { m ->
                ActionButton("Get a quote", m) { model.tab = AppTab.Quote }
                ActionButton("Plan your room", m, kind = ActionKind.Secondary) { model.tab = AppTab.Plan }
            }
        }
    }
}

// Start here

/**
 * The whole app in three steps, for anyone opening it for the first time.
 * Each step ticks off as it's done, and the next one is the one in brass.
 */
@Composable
private fun StartHere() {
    val model = LocalModel.current
    val b = model.basket
    val shown = b.items.isNotEmpty() || b.lengths.isNotEmpty() || b.room != null
    val picked = b.picks.isNotEmpty()
    val sent = model.lastSent != null && b.isEmpty
    val current = if (sent) 0 else if (!shown) 1 else if (!picked) 2 else 3
    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
        SectionHeader("Start here", "Three steps to your kitchen.")
        Column(Modifier.fillMaxWidth().card(Space.l)) {
            JourneyRow(1, "Show us your room", "Measure it, scan it, or try cabinets in AR", shown || sent, current == 1) { model.tab = AppTab.Plan }
            Hairline()
            JourneyRow(2, "Pick what you love", "Real panels and colors, from home", picked || sent, current == 2) { model.tab = AppTab.Materials }
            Hairline()
            JourneyRow(3, "Send it to us", if (sent) "Sent. We reply within 24 hours." else "We reply within 24 hours", sent, current == 3) { model.tab = AppTab.Quote }
        }
        if (!b.isEmpty || model.sentBasket != null) {
            Row(
                Modifier.heightIn(min = 48.dp).pressable { model.openBoard() },
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(Space.s),
            ) {
                Icon(Icons.Outlined.Dashboard, null, tint = Brand.brass, modifier = Modifier.size(20.dp))
                Text("See it all on your design board", color = Brand.brass, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

/** One step: a number (a check once done), what to do, and where it goes. */
@Composable
private fun JourneyRow(n: Int, title: String, text: String, done: Boolean, current: Boolean, onClick: () -> Unit) {
    val fill by animateColorAsState(if (done || current) Brand.brass else Color.Transparent, Motion.snappy(), label = "step")
    Row(
        Modifier
            .fillMaxWidth()
            .heightIn(min = 64.dp)
            .pressable(0.99f, label = text, onClick = onClick)
            .semantics(mergeDescendants = true) {
                contentDescription = "Step $n of 3. $title"
                stateDescription = if (done) "Done" else if (current) "Next" else ""
            }
            .padding(vertical = Space.m),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Space.m),
    ) {
        Box(
            Modifier.size(36.dp).clip(CircleShape).background(fill)
                .border(1.5.dp, if (done || current) Color.Transparent else Brand.stone.copy(alpha = 0.6f), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            if (done) Icon(Icons.Default.Check, null, tint = Brand.ink, modifier = Modifier.size(20.dp))
            else Text("$n", style = Type.headline.copy(color = if (current) Brand.ink else Brand.ivory))
        }
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(title, style = Type.headline)
            Text(text, style = Type.secondary)
        }
        Icon(Icons.Default.KeyboardArrowRight, null, tint = Brand.stone)
    }
}

// Tools

@Composable
private fun ToolsSection() {
    val model = LocalModel.current
    val nav = LocalNav.current
    val tools = listOf(
        Triple(Icons.Outlined.ViewInAr, "Cabinets in AR", "Place real-size cabinets in your kitchen") to { nav.open(AppTab.Plan, Route.Cabinets) },
        Triple(Icons.Outlined.Straighten, "Measure", "Walls, gaps and windows with the camera") to { nav.open(AppTab.Plan, Route.Measure) },
        Triple(Icons.Outlined.Window, "Design my kitchen", "Your kitchen's shape and sizes, new cabinets and the price") to { nav.open(AppTab.Plan, Route.Sizes) },
        Triple(Icons.Outlined.DocumentScanner, "Scan drawings", "Plans or a sketch, straightened") to { model.tab = AppTab.Plan; model.planRoute = "drawings" },
        Triple(Icons.Outlined.Colorize, "Match a color", "Find the real panel closest to any color") to { model.showColorMatch = true },
        Triple(Icons.Outlined.Dashboard, "Design board", "Your pictures and picks on one page") to { model.openBoard() },
    )
    val columns = if (isWide()) 3 else 2
    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
        SectionHeader("Tools", "Try it in your own room.", "Everything you make here goes with your quote request.")
        Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
            tools.chunked(columns).forEach { row ->
                Row(Modifier.fillMaxWidth().height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                    row.forEach { (t, action) -> ToolTile(t.first, t.second, t.third, Modifier.weight(1f).fillMaxHeight(), action) }
                    repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
                }
            }
        }
    }
}

/** One tool on the home screen: an icon, what it does, and a tap opens it. */
@Composable
fun ToolTile(icon: ImageVector, title: String, detail: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Column(
        modifier.heightIn(min = 168.dp).pressable(onClick = onClick).semantics(mergeDescendants = true) {}.card(),
        verticalArrangement = Arrangement.spacedBy(Space.s),
    ) {
        IconWell(icon)
        Spacer(Modifier.weight(1f))
        Text(title, style = Type.headline)
        Text(detail, style = Type.footnote)
    }
}

// Work

@Composable
private fun RecentWork() {
    val model = LocalModel.current
    val nav = LocalNav.current
    val list = Content.photos.take(8)
    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
        Row(verticalAlignment = Alignment.Bottom) {
            SectionHeader("Our work", "Made for the room.", modifier = Modifier.weight(1f))
            Text("See all", color = Brand.brass, fontSize = 15.sp, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.heightIn(min = 44.dp).pressable { model.tab = AppTab.Work }.padding(top = Space.m))
        }
        LazyRow(horizontalArrangement = Arrangement.spacedBy(Space.m), verticalAlignment = Alignment.Top) {
            items(list, key = { it.id }) { p ->
                Column(
                    Modifier.width(250.dp).pressable(label = p.title) { nav.push(Route.Photo(list.map { it.id }, p.id)) },
                    verticalArrangement = Arrangement.spacedBy(Space.s),
                ) {
                    PhotoView(p.id, Modifier.size(250.dp, 310.dp), description = p.title)
                    Text(p.title, style = Type.footnote, minLines = 2, maxLines = 2)
                }
            }
        }
    }
}

// Materials

/** Our three main suppliers' favorites, side by side */
private val strip: List<Panel>
    get() {
        val lists = Supplier.main.map { it.picks }
        return (0 until 3).flatMap { i -> lists.mapNotNull { it.getOrNull(i * 2) } }
    }

@Composable
private fun MaterialsStrip() {
    val model = LocalModel.current
    val nav = LocalNav.current
    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
        SectionHeader("Materials", "Real panels, real samples.", "Mostly Tafisa, Shinnoki and Egger. Pick the ones you like and we bring them to your home.")
        LazyRow(horizontalArrangement = Arrangement.spacedBy(Space.m), verticalAlignment = Alignment.Top) {
            items(strip, key = { it.id }) { p ->
                Column(
                    Modifier.width(110.dp).pressable(label = p.name) { nav.push(Route.PanelDetail(p.id)) },
                    verticalArrangement = Arrangement.spacedBy(Space.xs),
                ) {
                    PanelSwatch(p, Modifier.size(110.dp).clip(RoundedCornerShape(Radius.chip)).border(1.dp, Brand.line, RoundedCornerShape(Radius.chip)), px = 330)
                    Text(p.name, color = Brand.ivory, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, minLines = 2, maxLines = 2, lineHeight = 17.sp)
                    Text(p.brand, style = Type.caption)
                }
            }
        }
        ActionRow { m ->
            ActionButton("Browse materials", m, icon = Icons.Outlined.Palette, kind = ActionKind.Secondary) { model.tab = AppTab.Materials }
            ActionButton("Match a color", m, icon = Icons.Outlined.Colorize, kind = ActionKind.Secondary) { model.showColorMatch = true }
        }
    }
}

// Drawn, then built

/**
 * The same kitchen as a drawing and as built: drag the line to compare.
 * Buttons move it for people who can't drag; a vertical swipe still scrolls the page.
 */
@Composable
private fun DrawingReveal() {
    var split by rememberSaveable { mutableFloatStateOf(0.5f) }
    val shown by animateFloatAsState(split, Motion.snappy(), label = "split")
    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
        SectionHeader("Drawn, then built", "Nothing is cut until you approve the drawing.", "The same kitchen: our drawing, and the finished room.")
        BoxWithConstraints(
            Modifier
                .fillMaxWidth()
                .aspectRatio(1.5f)
                .clip(RoundedCornerShape(Radius.photo))
                .pointerInput(Unit) {
                    // Sideways moves the line; up and down is left to the page
                    awaitEachGesture {
                        val down = awaitFirstDown(requireUnconsumed = false)
                        var sideways: Boolean? = null
                        var start = split
                        var total = androidx.compose.ui.geometry.Offset.Zero
                        while (true) {
                            val e = awaitPointerEvent()
                            val c = e.changes.firstOrNull { it.id == down.id } ?: break
                            if (!c.pressed) break
                            total += c.positionChange()
                            if (sideways == null && total.getDistance() > 8f) { sideways = abs(total.x) > abs(total.y); start = split }
                            if (sideways == true) {
                                c.consume()
                                split = (start + total.x / size.width).coerceIn(0f, 1f)
                            }
                        }
                    }
                }
                .semantics {
                    contentDescription = "Drawing compared with the finished kitchen"
                    stateDescription = "${(split * 100).roundToInt()} percent drawing"
                    progressBarRangeInfo = ProgressBarRangeInfo(split, 0f..1f, 10)
                    setProgress { split = it.coerceIn(0f, 1f); true }
                },
        ) {
            val w = maxWidth
            PhotoView("photo-design-reality-kitchen-1", Modifier.fillMaxSize(), corner = 0.dp)
            Box(Modifier.fillMaxSize().drawWithContent {
                clipRect(right = size.width * shown) { this@drawWithContent.drawContent() }
            }) {
                PhotoView("story-galley-kitchen-drawing", Modifier.fillMaxSize(), corner = 0.dp)
            }
            Box(Modifier.offset(x = w * shown - 1.dp).width(2.dp).fillMaxHeight().background(Brand.ivory))
            Box(
                Modifier.offset(x = w * shown - 18.dp).align(Alignment.CenterStart).size(36.dp).shadow(6.dp, CircleShape).clip(CircleShape).background(Brand.ivory),
                contentAlignment = Alignment.Center,
            ) {
                Text("↔", color = Brand.ink, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
        Row(Modifier.fillMaxWidth()) {
            Text("Drawing", color = Brand.brass, fontSize = 15.sp, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.heightIn(min = 44.dp).pressable { split = 1f }.padding(vertical = Space.m))
            Spacer(Modifier.weight(1f))
            Text("Finished", color = Brand.brass, fontSize = 15.sp, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.heightIn(min = 44.dp).pressable { split = 0f }.padding(vertical = Space.m))
        }
    }
}

// How it works

@Composable
private fun Steps() {
    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
        SectionHeader("How it works", "From a crooked wall to a finished kitchen.", "Most kitchens take 4 to 6 weeks from approved drawings to install.")
        Content.steps.forEachIndexed { i, s ->
            Row(horizontalArrangement = Arrangement.spacedBy(Space.l), modifier = Modifier.semantics(mergeDescendants = true) {}) {
                PhotoView(s.image, Modifier.size(96.dp), corner = Radius.chip)
                Column(verticalArrangement = Arrangement.spacedBy(Space.xs)) {
                    Text("STEP ${i + 1}", style = Type.eyebrow)
                    Text(s.title, style = Type.card)
                    Text(s.text, style = Type.secondary)
                }
            }
        }
    }
}

// Pricing

@Composable
private fun Pricing() {
    var feet by rememberSaveable { mutableFloatStateOf(16f) }
    val mine = if (feet >= 10) Content.tiers.firstOrNull { feet.toDouble() in it.feet } else null
    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
        SectionHeader("Pricing", "Real numbers, before the first visit.", "What NYC kitchens cost with us in 2026.")
        PriceCheck(feet) { feet = it }
        Content.tiers.forEach { t ->
            val isMine = t == mine
            val edge by animateColorAsState(if (isMine) Brand.brass else Color.Transparent, Motion.snappy(), label = "tier")
            Column(
                Modifier.fillMaxWidth().border(1.5.dp, edge, RoundedCornerShape(Radius.card)).card()
                    .semantics(mergeDescendants = true) { stateDescription = if (isMine) "Your size" else "" },
                verticalArrangement = Arrangement.spacedBy(Space.s),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(t.name.uppercase(), style = Type.eyebrow, modifier = Modifier.weight(1f))
                    Text(t.size, style = Type.footnote)
                }
                Text(t.range, style = Type.display(32))
                Text(t.note, style = Type.secondary)
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(Space.m), modifier = Modifier.padding(top = Space.xs)) {
            Content.rates.forEach { (v, l) -> FactView(v, l, Modifier.weight(1f)) }
        }
    }
}

/**
 * Slide to the length of your cabinets and see what kitchens that size cost
 * with us, straight from the published 2026 ranges.
 */
@Composable
private fun PriceCheck(feet: Float, onChange: (Float) -> Unit) {
    val haptics = LocalHapticFeedback.current
    val tier = if (feet >= 10) Content.tiers.firstOrNull { feet.toDouble() in it.feet } else null
    val perFoot = (feet * 350 / 50).roundToInt() * 50
    Column(Modifier.fillMaxWidth().card(), verticalArrangement = Arrangement.spacedBy(Space.m)) {
        Text("Try it: how long are your cabinets?", style = Type.headline)
        Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(Space.s)) {
            Text("${feet.roundToInt()}", style = Type.display(48))
            Text("feet of cabinets", style = Type.secondary, modifier = Modifier.padding(bottom = 8.dp))
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.s)) {
            Text("6", style = Type.footnote)
            Slider(
                value = feet,
                onValueChange = {
                    val v = it.roundToInt().toFloat()
                    if (v != feet) {
                        val before = if (feet >= 10) Content.tiers.firstOrNull { t -> feet.toDouble() in t.feet } else null
                        val after = if (v >= 10) Content.tiers.firstOrNull { t -> v.toDouble() in t.feet } else null
                        if (before != after) haptics.performHapticFeedback(HapticFeedbackType.SegmentTick)
                        onChange(v)
                    }
                },
                valueRange = 6f..40f,
                modifier = Modifier.weight(1f).semantics { contentDescription = "Feet of cabinets"; stateDescription = "${feet.roundToInt()} feet" },
                colors = SliderDefaults.colors(thumbColor = Brand.ivory, activeTrackColor = Brand.brass, inactiveTrackColor = Brand.ivory.copy(alpha = 0.18f)),
            )
            Text("40", style = Type.footnote)
        }
        Text(tier?.let { "${it.name}: ${it.range}" } ?: "About \$${NumberFormat.getIntegerInstance().format(perFoot)} at \$350 a foot",
            style = Type.headline.copy(color = Brand.brass))
        Text("Add up the walls that get cabinets. We confirm every size when we visit.", style = Type.footnote)
    }
}

// Buildings

@Composable
private fun Buildings() {
    val icons = mapOf("doc" to Icons.Outlined.Description, "elevator" to Icons.Outlined.Elevator, "quiet" to Icons.Outlined.VolumeDown, "stairs" to Icons.Outlined.Stairs)
    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
        SectionHeader("Install day", "Built for New York buildings.", "Most installs take 3 to 7 days. The building sets the schedule, so we plan around it.")
        Column(Modifier.fillMaxWidth().card()) {
            Content.buildings.forEachIndexed { i, p ->
                Row(Modifier.padding(vertical = Space.m).semantics(mergeDescendants = true) {}, horizontalArrangement = Arrangement.spacedBy(Space.l)) {
                    Icon(icons[p.icon] ?: Icons.Outlined.Description, null, tint = Brand.brass, modifier = Modifier.size(26.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(p.title, style = Type.headline)
                        Text(p.text, style = Type.secondary)
                    }
                }
                if (i < Content.buildings.lastIndex) Hairline()
            }
        }
    }
}

// FAQ

@Composable
private fun Faqs() {
    var open by rememberSaveable { mutableStateOf<String?>(null) }
    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
        SectionHeader("Questions", "What people ask first.")
        Column(Modifier.fillMaxWidth().card()) {
            Content.faqs.forEachIndexed { i, f ->
                val isOpen = open == f.question
                val turn by animateFloatAsState(if (isOpen) 180f else 0f, Motion.snappy(), label = "chev")
                Column {
                    Row(
                        Modifier.fillMaxWidth().heightIn(min = 52.dp).pressable(0.99f) { open = if (isOpen) null else f.question }
                            .semantics { stateDescription = if (isOpen) "Expanded" else "Collapsed" },
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(f.question, style = Type.headline, modifier = Modifier.weight(1f).padding(vertical = Space.s))
                        Icon(Icons.Outlined.ExpandMore, null, tint = Brand.brass, modifier = Modifier.rotate(turn))
                    }
                    AnimatedVisibility(isOpen, enter = expandVertically(Motion.snappy()) + fadeIn(), exit = shrinkVertically(Motion.snappy()) + fadeOut()) {
                        Text(f.answer, style = Type.secondary, modifier = Modifier.padding(bottom = Space.m))
                    }
                }
                if (i < Content.faqs.lastIndex) Hairline()
            }
        }
    }
}

// Contact

@Composable
private fun Contact() {
    val model = LocalModel.current
    val context = LocalContext.current
    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
        SectionHeader("By appointment", "We bring the samples to you.",
            "In Brooklyn, Manhattan, Queens and Staten Island. Tell us about the room and we'll book a free visit at your home.")
        ActionButton("Get a quote", Modifier.fillMaxWidth(), icon = Icons.AutoMirrored.Outlined.Send) { model.tab = AppTab.Quote }
        ActionRow { m ->
            ActionButton("Text us", m, icon = Icons.AutoMirrored.Outlined.Message, kind = ActionKind.Secondary) { Tools.textUs(context) }
            ActionButton("Email us", m, icon = Icons.Outlined.Email, kind = ActionKind.Secondary) { Tools.emailUs(context) }
        }
    }
}
