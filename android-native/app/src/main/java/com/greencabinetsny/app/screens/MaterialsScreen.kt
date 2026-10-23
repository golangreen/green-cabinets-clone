package com.greencabinetsny.app.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.outlined.Apps
import androidx.compose.material.icons.outlined.Colorize
import androidx.compose.material.icons.outlined.FilterList
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.OpenInBrowser
import androidx.compose.material.icons.outlined.PanTool
import androidx.compose.material.icons.outlined.ViewInAr
import androidx.compose.material.icons.outlined.WarningAmber
import androidx.compose.material.icons.outlined.Brush as BrushIcon
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
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import coil3.request.ImageRequest
import coil3.request.crossfade
import com.greencabinetsny.app.LocalModel
import com.greencabinetsny.app.LocalNav
import com.greencabinetsny.app.Tools
import com.greencabinetsny.app.model.AppModel
import com.greencabinetsny.app.model.AppTab
import com.greencabinetsny.app.model.Finish
import com.greencabinetsny.app.model.HouseColors
import com.greencabinetsny.app.model.Panel
import com.greencabinetsny.app.model.Supplier
import com.greencabinetsny.app.model.WoodSpecies
import com.greencabinetsny.app.ui.ActionButton
import com.greencabinetsny.app.ui.ActionKind
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.BulletRow
import com.greencabinetsny.app.ui.Cormorant
import com.greencabinetsny.app.ui.FactView
import com.greencabinetsny.app.ui.Hairline
import com.greencabinetsny.app.ui.PhotoView
import com.greencabinetsny.app.ui.Radius
import com.greencabinetsny.app.ui.ScreenTitle
import com.greencabinetsny.app.ui.Segmented
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Type
import com.greencabinetsny.app.ui.card
import com.greencabinetsny.app.ui.page
import com.greencabinetsny.app.ui.pressable
import kotlinx.coroutines.launch
import java.net.URI
import java.text.NumberFormat
import kotlin.math.max

/** One line for the request: "Painted: Sage Green", "Solid wood: American Walnut" */
val Finish.requestLine: String get() = "$detail: $name"

val Panel.textLine: String
    get() = "Hi Green Cabinets, I like ${(if (isCountertop) "the " else "") + "$brand $name" + (code?.let { " ($it)" } ?: "")}. "

/** Doors wear a decor; a countertop stone goes on the counters. */
fun Panel.openInRoom(model: AppModel, open: () -> Unit) {
    if (isCountertop) model.arCounter = finishLook else model.arStart = finishLook
    open()
}

private sealed interface Shelf {
    data class Of(val s: Supplier) : Shelf
    data object More : Shelf
}

/**
 * The materials we build with, simple first: our three main suppliers, each
 * opening on a handful of favorites with the whole catalog one tap deeper,
 * and everything else (other suppliers, solid wood, paint) under More.
 */
@Composable
fun MaterialsScreen() {
    val model = LocalModel.current
    var shelfName by rememberSaveable { mutableStateOf("Tafisa") }
    val shelf: Shelf = Supplier.main.firstOrNull { it.label == shelfName }?.let { Shelf.Of(it) } ?: Shelf.More
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = Space.section)) {
        Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
            ScreenTitle("Materials", "The real panels and colors we build with. Pick a few you like and we bring the samples to your home.")
            ActionButton("Match a color from a photo", Modifier.fillMaxWidth(), icon = Icons.Outlined.Colorize, kind = ActionKind.Secondary) {
                model.showColorMatch = true
            }
            Segmented(Supplier.main.map { it.label } + "More", shelfName, label = { it }) { shelfName = it }
            // A new shelf crossfades instead of sliding everything at once
            AnimatedContent(shelf, transitionSpec = { fadeIn(tween(200)) togetherWith fadeOut(tween(120)) }, label = "shelf") { s ->
                when (s) {
                    is Shelf.Of -> SupplierShelf(s.s)
                    Shelf.More -> MoreShelf()
                }
            }
        }
    }
}

/** The supplier in a few plain lines, six favorites, and the way into the rest. */
@Composable
private fun SupplierShelf(supplier: Supplier) {
    val nav = LocalNav.current
    Column(verticalArrangement = Arrangement.spacedBy(Space.xl)) {
        SupplierIntro(supplier)
        Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
            Text("OUR PICKS", style = Type.eyebrow)
            PanelGrid(supplier.picks)
        }
        ActionButton("See all ${supplier.panels.size} ${supplier.label} ${supplier.unit}", Modifier.fillMaxWidth(),
            icon = Icons.Outlined.Apps, kind = ActionKind.Secondary) { nav.push(Route.SupplierAll(supplier)) }
        Hint("Not sure yet? That's normal. We bring the samples to your home and help you choose.")
    }
}

@Composable
private fun Hint(text: String, icon: androidx.compose.ui.graphics.vector.ImageVector = Icons.Outlined.PanTool) {
    Row(horizontalArrangement = Arrangement.spacedBy(Space.s)) {
        Icon(icon, null, tint = Brand.stone, modifier = Modifier.size(16.dp).padding(top = 2.dp))
        Text(text, style = Type.footnote)
    }
}

/** What the supplier is, why people choose it, and what it costs with us. */
@Composable
fun SupplierIntro(supplier: Supplier) {
    Column(Modifier.fillMaxWidth().card().semantics(mergeDescendants = true) {}, verticalArrangement = Arrangement.spacedBy(Space.s)) {
        Text(supplier.kind.uppercase(), style = Type.eyebrow)
        Text(supplier.why, style = Type.body)
        Row(horizontalArrangement = Arrangement.spacedBy(Space.l), verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = Space.xs)) {
            if (supplier == Supplier.Raphael) {
                Text("\$65 per square foot", color = Brand.brass, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            } else {
                CostMeter(supplier.cost, supplier.costWords)
            }
            Text("${supplier.panels.size} ${supplier.unit}", style = Type.footnote)
        }
    }
}

/** "$$ Mid-range": filled signs for the cost, faint ones for the rest. */
@Composable
private fun CostMeter(cost: String, words: String) {
    Row(horizontalArrangement = Arrangement.spacedBy(Space.s), verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.semantics(mergeDescendants = true) { contentDescription = "Cost: $words" }) {
        Row {
            Text(cost, color = Brand.brass, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            Text("$".repeat(max(0, 4 - cost.length)), color = Brand.stone.copy(alpha = 0.45f), fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
        }
        Text(words, style = Type.footnote)
    }
}

/** How many tiles of at least `min` fit across, never fewer than 3. */
@Composable
private fun AdaptiveGrid(count: Int, min: Dp = 100.dp, gap: Dp = Space.m, rowGap: Dp = Space.l, item: @Composable (Int, Modifier) -> Unit) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val cols = max(3, ((maxWidth + gap) / (min + gap)).toInt())
        Column(verticalArrangement = Arrangement.spacedBy(rowGap)) {
            (0 until count).chunked(cols).forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(gap), verticalAlignment = Alignment.Top) {
                    row.forEach { i -> item(i, Modifier.weight(1f)) }
                    repeat(cols - row.size) { Spacer(Modifier.weight(1f)) }
                }
            }
        }
    }
}

/** Swatches three (or more) across: the decor, its name and its code. */
@Composable
fun PanelGrid(panels: List<Panel>) {
    AdaptiveGrid(panels.size) { i, m -> PanelTile(panels[i], m) }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun PanelTile(panel: Panel, modifier: Modifier) {
    val model = LocalModel.current
    val nav = LocalNav.current
    val context = LocalContext.current
    val haptics = LocalHapticFeedback.current
    val picked = model.isPicked(panel.requestLine)
    var menu by remember { mutableStateOf(false) }
    Box(modifier) {
        Column(
            Modifier
                .combinedClickable(onClickLabel = "Opens the color", onLongClick = { haptics.performHapticFeedback(HapticFeedbackType.LongPress); menu = true }) {
                    nav.push(Route.PanelDetail(panel.id))
                }
                .semantics(mergeDescendants = true) {
                    contentDescription = listOfNotNull(panel.name, panel.code, if (picked) "in your quote" else null).joinToString(", ")
                },
            verticalArrangement = Arrangement.spacedBy(Space.xs),
        ) {
            Box {
                PanelSwatch(panel, Modifier.fillMaxWidth().aspectRatio(1f).clip(RoundedCornerShape(Radius.chip)).border(1.dp, Brand.line, RoundedCornerShape(Radius.chip)), px = 360)
                if (picked) PickedBadge(Modifier.align(Alignment.TopEnd).padding(6.dp))
            }
            // The name is how people tell decors apart: it wraps rather than cuts off
            Text(panel.name, color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, minLines = 2, maxLines = 2, lineHeight = 19.sp,
                modifier = Modifier.padding(top = Space.xs))
            panel.code?.let { Text(it, style = Type.caption, maxLines = 1) }
        }
        DropdownMenu(menu, onDismissRequest = { menu = false }, containerColor = Brand.raised) {
            DropdownMenuItem(text = { Text(if (picked) "Remove from quote" else "Add to quote") }, onClick = { menu = false; model.togglePick(panel.requestLine) })
            DropdownMenuItem(text = { Text(if (panel.isCountertop) "See it on your counters" else "See it in your room") }, onClick = {
                menu = false
                panel.openInRoom(model) { nav.open(AppTab.Plan, Route.Cabinets) }
            })
            DropdownMenuItem(text = { Text("Text us about it") }, onClick = { menu = false; Tools.textUs(context, panel.textLine) })
        }
    }
}

/** A brass check on a swatch that's in the quote. */
@Composable
fun PickedBadge(modifier: Modifier = Modifier) {
    Box(modifier.size(22.dp).clip(CircleShape).background(Brand.brass), contentAlignment = Alignment.Center) {
        Icon(Icons.Default.Check, null, tint = Brand.ink, modifier = Modifier.size(14.dp))
    }
}

/**
 * A supplier swatch: the photo when there is one (fading in once), else the
 * color, drawn as wood for woodgrain decors we only have as a color.
 */
@Composable
fun PanelSwatch(p: Panel, modifier: Modifier, px: Int = 400, large: Boolean = false) {
    Swatch(if (large) p.photoUrl else p.thumbUrl, p.color, !p.hasPhoto && p.isWoodgrain, modifier, px, p.name)
}

@Composable
fun FinishSwatch(f: Finish, modifier: Modifier, px: Int = 400) {
    val url = f.remote ?: f.texture?.let { "file:///android_asset/img/$it.jpg" }
    Swatch(url, f.color, f.grain, modifier, px, f.name, crop = f.cropCenter)
}

@Composable
private fun Swatch(url: String?, color: Color, grain: Boolean, modifier: Modifier, px: Int, name: String, crop: Boolean = false) {
    val context = LocalContext.current
    Box(modifier.background(color)) {
        if (grain) {
            AsyncImage(
                model = "file:///android_asset/img/grain.jpg", contentDescription = null, contentScale = ContentScale.Crop,
                colorFilter = ColorFilter.tint(color, BlendMode.Multiply), modifier = Modifier.fillMaxSize(),
            )
        }
        if (url != null) {
            AsyncImage(
                model = ImageRequest.Builder(context).data(url).size(px).crossfade(180).build(),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                // A slab photo: only its middle is the grain
                modifier = if (crop) Modifier.fillMaxSize().clipToBounds().graphicsLayer { scaleX = 2.4f; scaleY = 2.4f } else Modifier.fillMaxSize(),
            )
        }
    }
}

// The whole catalog

/** Every decor from one supplier, in the groups people scan by, with a menu to jump straight to a group. */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun SupplierCatalogScreen(supplier: Supplier) {
    val context = LocalContext.current
    val groups = supplier.groups
    val list = rememberLazyListState()
    val scope = rememberCoroutineScope()
    var jump by remember { mutableStateOf(false) }
    DetailScaffold(supplier.label, actions = {
        if (groups.size > 2) {
            Box {
                IconButton(onClick = { jump = true }) { Icon(Icons.Outlined.FilterList, "Jump to", tint = Brand.ivory) }
                DropdownMenu(jump, onDismissRequest = { jump = false }, containerColor = Brand.raised) {
                    groups.forEachIndexed { i, (title, panels) ->
                        DropdownMenuItem(text = { Text("$title (${panels.size})") }, onClick = {
                            jump = false
                            scope.launch { list.animateScrollToItem(1 + i * 2) }
                        })
                    }
                }
            }
        }
    }) {
        LazyColumn(state = list, modifier = Modifier.fillMaxSize()) {
            item {
                Column(Modifier.page().padding(top = Space.s, bottom = Space.xl), verticalArrangement = Arrangement.spacedBy(Space.l)) {
                    SupplierIntro(supplier)
                    if (supplier.colorGuideOnly) Hint("These colors are a guide. The real samples come with us to your home.", Icons.Outlined.Info)
                }
            }
            groups.forEach { (title, panels) ->
                stickyHeader(key = "h-$title") {
                    Row(Modifier.fillMaxWidth().background(Brand.ink.copy(alpha = 0.96f)).page().padding(vertical = Space.s).semantics { heading() }) {
                        Text(title, style = Type.headline, modifier = Modifier.weight(1f))
                        Text("${panels.size}", style = Type.secondary)
                    }
                }
                item(key = "g-$title") {
                    Box(Modifier.page().padding(top = Space.s, bottom = Space.xl)) { PanelGrid(panels) }
                }
            }
            item {
                val host = runCatching { URI(supplier.site).host.removePrefix("www.") }.getOrDefault("their site")
                Row(
                    Modifier.page().heightIn(min = 48.dp).pressable { Tools.openWeb(context, supplier.site) },
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.s),
                ) {
                    Icon(Icons.Outlined.OpenInBrowser, null, tint = Brand.brass, modifier = Modifier.size(20.dp))
                    Text("The full collection on $host", color = Brand.brass, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                }
            }
            item { BottomSpace() }
        }
    }
}

// More

/** Everything beyond the three main suppliers, folded into one short list. */
@Composable
private fun MoreShelf() {
    val nav = LocalNav.current
    Column(verticalArrangement = Arrangement.spacedBy(Space.xl)) {
        Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
            Text("MORE SUPPLIERS", style = Type.eyebrow)
            Column(Modifier.fillMaxWidth().card()) {
                Supplier.more.forEach { s ->
                    MoreRow(
                        swatches = s.picks.take(4).map { p -> { m: Modifier -> PanelSwatch(p, m, 120) } },
                        title = s.label, subtitle = listOfNotNull(s.kind, if (s == Supplier.Raphael) "\$65 per square foot" else null).joinToString(", "),
                        count = s.panels.size,
                    ) { nav.push(Route.SupplierAll(s)) }
                    Hairline()
                }
                MoreRow(
                    swatches = WoodSpecies.all.take(4).map { w -> { m: Modifier -> FinishSwatch(Finish.wood(w), m, 120) } },
                    title = "Solid wood", subtitle = "Hardwoods, compared on hardness, grain and cost", count = WoodSpecies.all.size,
                ) { nav.push(Route.WoodLibrary) }
                Hairline()
                MoreRow(
                    swatches = HouseColors.paints.take(4).map { f -> { m: Modifier -> FinishSwatch(f, m, 120) } },
                    title = "Painted and stained", subtitle = "Our house colors, or any color you bring", count = HouseColors.paints.size + HouseColors.stains.size,
                ) { nav.push(Route.Paint) }
            }
        }
        Hint("Not sure where to start? Most of our kitchens are Tafisa, Shinnoki or Egger.")
    }
}

/** One row under More: four little swatches, the name, what it is, how many. */
@Composable
private fun MoreRow(swatches: List<@Composable (Modifier) -> Unit>, title: String, subtitle: String, count: Int, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().pressable(0.99f, onClick = onClick).semantics(mergeDescendants = true) {}.padding(vertical = Space.m),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.m),
    ) {
        Box(Modifier.width((28 + 18 * (swatches.size - 1)).dp)) {
            swatches.forEachIndexed { i, s ->
                s(Modifier.offset(x = (18 * i).dp).size(28.dp).clip(CircleShape).border(2.dp, Brand.surface, CircleShape))
            }
        }
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(title, style = Type.headline)
            Text(subtitle, style = Type.footnote)
        }
        Text("$count", style = Type.secondary)
        Icon(Icons.Default.KeyboardArrowRight, null, tint = Brand.stone)
    }
}

/** The hardwoods, as on greencabinetsny.com/wood-species. */
@Composable
fun WoodLibraryScreen() {
    val nav = LocalNav.current
    DetailScaffold("Solid wood") {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = Space.section)) {
            Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.l)) {
                Text("Every hardwood we build in, with its hardness, cost and how it takes a stain.", style = Type.secondary)
                val woods = WoodSpecies.all
                BoxWithConstraints {
                    val cols = if (maxWidth > 600.dp) 4 else 2
                    Column(verticalArrangement = Arrangement.spacedBy(Space.l)) {
                        woods.chunked(cols).forEach { row ->
                            Row(horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                                row.forEach { w ->
                                    Column(
                                        Modifier.weight(1f).pressable { nav.push(Route.Wood(w.slug)) }.semantics(mergeDescendants = true) {},
                                        verticalArrangement = Arrangement.spacedBy(Space.s),
                                    ) {
                                        PhotoView(w.image, Modifier.fillMaxWidth().aspectRatio(1f))
                                        Text(w.name, style = Type.headline, maxLines = 1)
                                        Text(w.tagline, style = Type.footnote, minLines = 2, maxLines = 2)
                                    }
                                }
                                repeat(cols - row.size) { Spacer(Modifier.weight(1f)) }
                            }
                        }
                    }
                }
            }
        }
    }
}

/** Our paint colors and stains, and the promise that any color can be matched. */
@Composable
fun HouseColorsScreen() {
    DetailScaffold("Painted and stained") {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = Space.section)) {
            Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
                Text("A smooth satin paint over shaker, slim shaker or flat doors. We match any Benjamin Moore or Sherwin-Williams color you bring us.",
                    style = Type.secondary)
                listOf("Painted" to HouseColors.paints, "Stained wood" to HouseColors.stains).forEach { (title, list) ->
                    Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                        Text(title.uppercase(), style = Type.eyebrow)
                        AdaptiveGrid(list.size) { i, m -> FinishTile(list[i], m) }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun FinishTile(finish: Finish, modifier: Modifier) {
    val model = LocalModel.current
    val nav = LocalNav.current
    val haptics = LocalHapticFeedback.current
    val picked = model.isPicked(finish.requestLine)
    var menu by remember { mutableStateOf(false) }
    Box(modifier) {
        Column(
            Modifier
                .combinedClickable(onLongClick = { haptics.performHapticFeedback(HapticFeedbackType.LongPress); menu = true }) {
                    model.arStart = finish
                    nav.push(Route.FinishDetail(finish.id))
                }
                .semantics(mergeDescendants = true) { contentDescription = if (picked) "${finish.name}, in your quote" else finish.name },
            verticalArrangement = Arrangement.spacedBy(Space.xs),
        ) {
            Box {
                FinishSwatch(finish, Modifier.fillMaxWidth().aspectRatio(1f).clip(RoundedCornerShape(Radius.chip)).border(1.dp, Brand.line, RoundedCornerShape(Radius.chip)), 300)
                if (picked) PickedBadge(Modifier.align(Alignment.TopEnd).padding(6.dp))
            }
            Text(finish.name, color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, minLines = 2, maxLines = 2, lineHeight = 19.sp,
                modifier = Modifier.padding(top = Space.xs))
        }
        DropdownMenu(menu, onDismissRequest = { menu = false }, containerColor = Brand.raised) {
            DropdownMenuItem(text = { Text(if (picked) "Remove from quote" else "Add to quote") }, onClick = { menu = false; model.togglePick(finish.requestLine) })
            DropdownMenuItem(text = { Text("See it in your room") }, onClick = {
                menu = false
                model.arStart = finish
                nav.open(AppTab.Plan, Route.Cabinets)
            })
        }
    }
}

// A supplier decor

@Composable
fun PanelDetailScreen(id: String) {
    val panel = Panel.find(id) ?: return Unavailable("This color is no longer in the catalog.")
    val model = LocalModel.current
    val nav = LocalNav.current
    val context = LocalContext.current
    val supplier = panel.supplier
    DetailScaffold(panel.name) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = Space.section)) {
            Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
                PanelSwatch(panel, Modifier.fillMaxWidth().aspectRatio(1f).clip(RoundedCornerShape(Radius.photo))
                    .border(1.dp, Brand.line, RoundedCornerShape(Radius.photo)).semantics { contentDescription = "${panel.name} sample" }, px = 1200, large = true)
                Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
                    Text(listOf(panel.brand, panel.finish).filter { it.isNotEmpty() }.joinToString(" · ").uppercase(), style = Type.eyebrow)
                    Text(panel.name, style = Type.hero)
                    panel.codes.forEach { Text(it, style = Type.secondary.copy(fontFamily = FontFamily.Monospace)) }
                }
                if (supplier != null) {
                    Text(supplier.why, style = Type.body)
                    if (supplier.colorGuideOnly) Hint("The color here is a guide. We bring the real sample to your home.", Icons.Outlined.Info)
                }
                Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                    ActionButton(if (panel.isCountertop) "See it on your counters" else "See it in your room", Modifier.fillMaxWidth(), icon = Icons.Outlined.ViewInAr) {
                        panel.openInRoom(model) { nav.open(AppTab.Plan, Route.Cabinets) }
                    }
                    AskRow(panel.textLine, panel.requestLine)
                }
                if (panel.link.isNotEmpty()) {
                    val host = runCatching { URI(panel.link).host.removePrefix("www.") }.getOrDefault("the supplier's site")
                    Row(
                        Modifier.heightIn(min = 48.dp).pressable { Tools.openWeb(context, panel.link) },
                        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.s),
                    ) {
                        Icon(Icons.Outlined.OpenInBrowser, null, tint = Brand.brass, modifier = Modifier.size(20.dp))
                        Text("See it on $host", color = Brand.brass, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

// A solid wood

@Composable
fun WoodDetailScreen(slug: String) {
    val wood = WoodSpecies.all.firstOrNull { it.slug == slug } ?: return Unavailable("This wood is no longer in the list.")
    val model = LocalModel.current
    val nav = LocalNav.current
    Box(Modifier.fillMaxSize().background(Brand.ink)) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = Space.section), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
            PhotoView(wood.image, Modifier.fillMaxWidth().height(320.dp), corner = 0.dp, description = "${wood.name} grain")
            Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
                Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
                    Text("SOLID WOOD", style = Type.eyebrow)
                    Text(wood.name, style = Type.hero)
                    Text(wood.tagline, fontFamily = Cormorant, fontStyle = FontStyle.Italic, fontSize = 22.sp, color = Brand.brass)
                    Text(wood.short, style = Type.body, modifier = Modifier.padding(top = Space.xs))
                }
                Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                    ActionButton("See it in your room", Modifier.fillMaxWidth(), icon = Icons.Outlined.ViewInAr) {
                        model.arStart = Finish.wood(wood)
                        nav.open(AppTab.Plan, Route.Cabinets)
                    }
                    AskRow("Hi Green Cabinets, I'm interested in ${wood.name} cabinets. ", Finish.wood(wood).requestLine)
                }
                Column(Modifier.fillMaxWidth().card(), verticalArrangement = Arrangement.spacedBy(Space.l)) {
                    Column(verticalArrangement = Arrangement.spacedBy(Space.s), modifier = Modifier.semantics(mergeDescendants = true) {}) {
                        Row {
                            Text("Hardness", style = Type.footnote, modifier = Modifier.weight(1f))
                            Text("${NumberFormat.getIntegerInstance().format(wood.janka)} lbf Janka", color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                        }
                        Box(Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(50)).background(Brand.raised)) {
                            Box(Modifier.fillMaxWidth(wood.janka.toFloat() / WoodSpecies.HARDEST).height(8.dp).clip(RoundedCornerShape(50)).background(Brand.brass))
                        }
                    }
                    Hairline()
                    Row(horizontalArrangement = Arrangement.spacedBy(Space.l)) {
                        FactView(wood.cost, "${wood.costWords} cost", Modifier.weight(1f))
                        FactView(wood.stain, "Takes a stain", Modifier.weight(1f))
                    }
                    Hairline()
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.semantics(mergeDescendants = true) {
                        contentDescription = "Stability, ${wood.stability} out of 5"
                    }) {
                        Text("Stability", style = Type.footnote, modifier = Modifier.weight(1f))
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            (1..5).forEach { i -> Box(Modifier.size(10.dp).clip(CircleShape).background(if (i <= wood.stability) Brand.brass else Brand.raised)) }
                        }
                    }
                }
                Block("Color", wood.color)
                Block("Grain", wood.grain)
                Bullets("Why people choose it", wood.pros, Icons.Default.Check)
                Bullets("Keep in mind", wood.cons, Icons.Outlined.WarningAmber)
                Bullets("Finishes that suit it", wood.finishes, Icons.Outlined.BrushIcon)
            }
        }
        TopBar(wood.name, overlay = true)
    }
}

@Composable
private fun Block(title: String, text: String) {
    Column(verticalArrangement = Arrangement.spacedBy(Space.xs)) {
        Text(title.uppercase(), style = Type.eyebrow)
        Text(text, style = Type.body)
    }
}

@Composable
private fun Bullets(title: String, items: List<String>, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
        Text(title.uppercase(), style = Type.eyebrow)
        items.forEach { BulletRow(it, icon) }
    }
}

// A paint or stain

@Composable
fun FinishDetailScreen(id: String) {
    val finish = (HouseColors.paints + HouseColors.stains).firstOrNull { it.id == id } ?: return Unavailable("This color is no longer in the list.")
    val model = LocalModel.current
    val nav = LocalNav.current
    DetailScaffold(finish.name) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = Space.section)) {
            Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
                FinishSwatch(finish, Modifier.fillMaxWidth().aspectRatio(1f).clip(RoundedCornerShape(Radius.photo)).border(1.dp, Brand.line, RoundedCornerShape(Radius.photo)), 900)
                Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
                    Text(finish.detail.uppercase(), style = Type.eyebrow)
                    Text(finish.name, style = Type.hero)
                    Text(
                        if (finish.grain) "A stain on solid wood, so the grain shows through. We bring real stained samples to your home."
                        else "A smooth satin paint over shaker, slim shaker or flat doors. We match any color you bring us.",
                        style = Type.body,
                    )
                }
                Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                    ActionButton("See it in your room", Modifier.fillMaxWidth(), icon = Icons.Outlined.ViewInAr) {
                        model.arStart = finish
                        nav.open(AppTab.Plan, Route.Cabinets)
                    }
                    AskRow("Hi Green Cabinets, I'm interested in ${finish.name}. ", finish.requestLine)
                }
            }
        }
    }
}
