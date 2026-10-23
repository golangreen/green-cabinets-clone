package com.greencabinetsny.app.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.calculatePan
import androidx.compose.foundation.gestures.calculateZoom
import androidx.compose.ui.input.pointer.positionChanged
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Message
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.greencabinetsny.app.LocalModel
import com.greencabinetsny.app.LocalNav
import com.greencabinetsny.app.Tools
import com.greencabinetsny.app.model.Content
import com.greencabinetsny.app.model.WorkCategory
import com.greencabinetsny.app.model.WorkPhoto
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.PhotoView
import com.greencabinetsny.app.ui.Radius
import com.greencabinetsny.app.ui.ScreenTitle
import com.greencabinetsny.app.ui.Segmented
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Type
import com.greencabinetsny.app.ui.isWide
import com.greencabinetsny.app.ui.page
import kotlin.math.max

/** The line on the quote request: "Look: White oak with a marble waterfall island" */
val WorkPhoto.requestLine: String get() = "Look: $title"

/**
 * The finished work, as an editorial mosaic: one large photo, then two side
 * by side (three on a tablet). A filter at the top, a tap opens the photo.
 */
@Composable
fun WorkScreen() {
    var filter by rememberSaveable { mutableStateOf<WorkCategory?>(null) }
    val photos = Content.photos.filter { filter == null || it.category == filter }
    val wide = isWide()
    LazyColumn(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(Space.m)) {
        item {
            Column(Modifier.page().windowInsetsPadding(WindowInsets(0)), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
                ScreenTitle("Our work", "Kitchens, vanities, closets and built-ins, made for the buildings they live in.")
                Segmented(listOf<WorkCategory?>(null, WorkCategory.Kitchens, WorkCategory.Baths, WorkCategory.Closets), filter,
                    label = { it?.let { c -> if (c == WorkCategory.Baths) "Baths" else if (c == WorkCategory.Closets) "Closets" else "Kitchens" } ?: "All" }) {
                    filter = it
                }
                Spacer(Modifier)
            }
        }
        // One big, then two (or three) side by side
        val per = if (wide) 4 else 3
        val groups = photos.chunked(per)
        items(groups, key = { (filter?.name ?: "all") + it.first().id }) { g ->
            Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.m)) {
                WorkTile(g[0], photos, 1.35f, Modifier.fillMaxWidth())
                if (g.size > 1) {
                    Row(horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                        for (i in 1 until per) {
                            val p = g.getOrNull(i)
                            if (p != null) WorkTile(p, photos, 0.82f, Modifier.weight(1f))
                            else Spacer(Modifier.weight(1f).aspectRatio(0.82f))
                        }
                    }
                }
            }
        }
        item { BottomSpace() }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun WorkTile(p: WorkPhoto, list: List<WorkPhoto>, aspect: Float, modifier: Modifier) {
    val nav = LocalNav.current
    val model = LocalModel.current
    val context = LocalContext.current
    val haptics = LocalHapticFeedback.current
    var menu by remember { mutableStateOf(false) }
    Box(modifier) {
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(aspect)
                .clip(RoundedCornerShape(Radius.photo))
                .combinedClickable(
                    onClickLabel = "Opens the photo",
                    onLongClick = { haptics.performHapticFeedback(HapticFeedbackType.LongPress); menu = true },
                ) { nav.push(Route.Photo(list.map { it.id }, p.id)) }
                .semantics { contentDescription = p.title },
        ) {
            PhotoView(p.id, Modifier.fillMaxSize(), corner = 0.dp)
            Text(
                p.title, color = Brand.ivory, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, maxLines = 2,
                modifier = Modifier.align(Alignment.BottomStart).fillMaxWidth()
                    .background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.65f))))
                    .padding(Space.m),
            )
        }
        // Long-press: text us about it, add it to the quote, or share it
        DropdownMenu(menu, onDismissRequest = { menu = false }, containerColor = Brand.raised) {
            DropdownMenuItem(text = { Text("Text us about it") }, onClick = {
                menu = false
                Tools.textUs(context, "Hi Green Cabinets, I like this look: ${p.title}. ", assetBitmap(context, p.id))
            })
            DropdownMenuItem(text = { Text(if (model.isPicked(p.requestLine)) "Remove from quote" else "Add to quote") }, onClick = {
                menu = false
                model.togglePick(p.requestLine)
            })
            DropdownMenuItem(text = { Text("Share") }, onClick = {
                menu = false
                assetBitmap(context, p.id)?.let { Tools.share(context, listOf(it)) }
            })
        }
    }
}

/** Full-screen photos: swipe between them, pinch or double-tap to look closer, and ask about a look you like. */
@Composable
fun PhotoDetailScreen(ids: List<String>, start: String) {
    val photos = ids.mapNotNull { id -> Content.photos.firstOrNull { it.id == id } }
    val pager = rememberPagerState(initialPage = max(0, photos.indexOfFirst { it.id == start })) { photos.size }
    val context = LocalContext.current
    val haptics = LocalHapticFeedback.current
    LaunchedEffect(pager) { snapshotFlow { pager.settledPage }.collect { haptics.performHapticFeedback(HapticFeedbackType.SegmentTick) } }
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        HorizontalPager(pager, Modifier.fillMaxSize(), beyondViewportPageCount = 1) { i ->
            ZoomableImage(photos[i].id, photos[i].title)
        }
        val photo = photos.getOrNull(pager.currentPage)
        TopBar("${pager.currentPage + 1} of ${photos.size}", overlay = true) {
            IconButton(onClick = { photo?.let { p -> assetBitmap(context, p.id)?.let { Tools.share(context, listOf(it)) } } }) {
                Icon(Icons.Outlined.Share, "Share", tint = Brand.ivory)
            }
        }
        if (photo != null) {
            Column(
                Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                    .background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f))))
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .padding(Space.l),
                verticalArrangement = Arrangement.spacedBy(Space.m),
            ) {
                AnimatedContent(photo, transitionSpec = { fadeIn(tween(160)) togetherWith fadeOut(tween(120)) }, label = "caption") { p ->
                    Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
                        Text(p.category.label.uppercase(), style = Type.eyebrow)
                        Text(p.title, style = Type.card)
                    }
                }
                AskRow("Hi Green Cabinets, I like this look: ${photo.title}. ", photo.requestLine) { assetBitmap(context, photo.id) }
            }
        }
    }
}

/** A photo you can pinch, double-tap and pan. */
@Composable
private fun ZoomableImage(name: String, title: String) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    val shown by animateFloatAsState(scale, label = "zoom")
    Box(
        Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures(onDoubleTap = { p ->
                    if (scale > 1f) { scale = 1f; offset = Offset.Zero } else {
                        scale = 2.5f
                        offset = (Offset(size.width / 2f, size.height / 2f) - p) * 1.5f
                    }
                })
            }
            .pointerInput(Unit) {
                // Only takes over for a pinch or once zoomed, so a swipe still turns the page
                awaitEachGesture {
                    awaitFirstDown(requireUnconsumed = false)
                    do {
                        val e = awaitPointerEvent()
                        val fingers = e.changes.count { it.pressed }
                        if (fingers >= 2 || scale > 1f) {
                            val next = (scale * e.calculateZoom()).coerceIn(1f, 4f)
                            scale = next
                            val pan = e.calculatePan()
                            val maxX = size.width * (scale - 1) / 2
                            val maxY = size.height * (scale - 1) / 2
                            offset = if (scale <= 1f) Offset.Zero
                            else Offset((offset.x + pan.x).coerceIn(-maxX, maxX), (offset.y + pan.y).coerceIn(-maxY, maxY))
                            e.changes.forEach { if (it.positionChanged()) it.consume() }
                        }
                    } while (e.changes.any { it.pressed })
                }
            },
    ) {
        AsyncImage(
            model = "file:///android_asset/img/$name.jpg",
            contentDescription = title,
            contentScale = ContentScale.Fit,
            modifier = Modifier.fillMaxSize().graphicsLayer {
                scaleX = shown; scaleY = shown
                translationX = offset.x; translationY = offset.y
            },
        )
    }
}
