package com.greencabinetsny.app.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage

/** Press feedback on touch-down: a slight scale that never changes layout bounds. */
@Composable
fun Modifier.pressable(scale: Float = 0.97f, role: Role = Role.Button, label: String? = null, onClick: () -> Unit): Modifier {
    val source = remember { MutableInteractionSource() }
    val pressed by source.collectIsPressedAsState()
    val s by animateFloatAsState(if (pressed) scale else 1f, Motion.press(), label = "press")
    return this
        .graphicsLayer { scaleX = s; scaleY = s }
        .clickable(interactionSource = source, indication = null, role = role, onClickLabel = label, onClick = onClick)
}

/** A raised card on the page. */
fun Modifier.card(padding: Dp = Space.l): Modifier = this
    .clip(RoundedCornerShape(Radius.card))
    .background(Brand.surface)
    .border(1.dp, Brand.line, RoundedCornerShape(Radius.card))
    .padding(padding)

enum class ActionKind { Primary, Secondary, Floating }

/** A full-width action: brass for the one primary action on a screen, glassy ivory for the rest. */
@Composable
fun ActionButton(
    title: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    kind: ActionKind = ActionKind.Primary,
    enabled: Boolean = true,
    tint: Color? = null,
    onClick: () -> Unit,
) {
    val bg = when (kind) {
        ActionKind.Primary -> Brand.brass
        ActionKind.Secondary -> Brand.ivory.copy(alpha = 0.12f)
        ActionKind.Floating -> Brand.ink.copy(alpha = 0.8f)
    }
    val fg = tint ?: if (kind == ActionKind.Primary) Brand.ink else Brand.ivory
    Row(
        modifier
            .heightIn(min = 52.dp)
            .clip(RoundedCornerShape(50))
            .background(if (enabled) bg else bg.copy(alpha = bg.alpha * 0.45f))
            .then(if (kind != ActionKind.Primary) Modifier.border(1.dp, Brand.line, RoundedCornerShape(50)) else Modifier)
            .then(if (enabled) Modifier.pressable(onClick = onClick) else Modifier)
            .padding(horizontal = Space.l, vertical = Space.m),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (icon != null) {
            Icon(icon, null, tint = fg.copy(alpha = if (enabled) 1f else 0.5f), modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(Space.s))
        }
        Text(title, color = fg.copy(alpha = if (enabled) 1f else 0.5f), fontSize = 17.sp, fontWeight = FontWeight.SemiBold, maxLines = 2)
    }
}

/** True when the person has turned the text size way up: side-by-side actions stack. */
@Composable
fun largeText(): Boolean = LocalDensity.current.fontScale >= 1.6f

/** Two actions side by side, stacked when the text size is very large. */
@Composable
fun ActionRow(content: @Composable (Modifier) -> Unit) {
    if (largeText()) {
        Column(verticalArrangement = Arrangement.spacedBy(Space.m)) { content(Modifier.fillMaxWidth()) }
    } else {
        Row(horizontalArrangement = Arrangement.spacedBy(Space.m)) { content(Modifier.weight(1f)) }
    }
}

@Composable
fun SectionHeader(eyebrow: String, title: String, subtitle: String? = null, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxWidth().semantics(mergeDescendants = true) { heading() }, verticalArrangement = Arrangement.spacedBy(Space.s)) {
        Text(eyebrow.uppercase(), style = Type.eyebrow)
        Text(title, style = Type.section)
        if (subtitle != null) Text(subtitle, style = Type.secondary)
    }
}

/** The big serif title at the top of a tab, with a short line under it. */
@Composable
fun ScreenTitle(title: String, subtitle: String? = null, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxWidth().statusBarsPadding().padding(top = Space.l), verticalArrangement = Arrangement.spacedBy(Space.xs)) {
        Text(title, style = Type.screen, modifier = Modifier.semantics { heading() })
        if (subtitle != null) Text(subtitle, style = Type.secondary)
    }
}

/** A bundled photo filling its frame, cropped, with rounded corners. */
@Composable
fun PhotoView(name: String, modifier: Modifier = Modifier, corner: Dp = Radius.photo, description: String? = null) {
    AsyncImage(
        model = "file:///android_asset/img/$name.jpg",
        contentDescription = description,
        contentScale = ContentScale.Crop,
        modifier = modifier.clip(RoundedCornerShape(corner)),
    )
}

/** A single fact: a big serif value over a small label. */
@Composable
fun FactView(value: String, label: String, modifier: Modifier = Modifier) {
    Column(modifier.semantics(mergeDescendants = true) {}, verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(value, style = Type.display(26), maxLines = 1, overflow = TextOverflow.Ellipsis)
        Text(label, style = Type.footnote)
    }
}

/** A bullet line with a brass mark. */
@Composable
fun BulletRow(text: String, icon: ImageVector = Icons.Default.Check) {
    Row(horizontalArrangement = Arrangement.spacedBy(Space.m), modifier = Modifier.fillMaxWidth()) {
        Icon(icon, null, tint = Brand.brass, modifier = Modifier.padding(top = 4.dp).size(16.dp))
        Text(text, style = Type.body)
    }
}

/** A thin rule between rows in a card. */
@Composable
fun Hairline() {
    Box(Modifier.fillMaxWidth().heightIn(min = 1.dp, max = 1.dp).background(Brand.line))
}

/** A short confirmation at the top of the screen ("4 pictures added"). */
@Composable
fun Toast(text: String, modifier: Modifier = Modifier) {
    Row(
        modifier
            .clip(RoundedCornerShape(50))
            .background(Brand.raised.copy(alpha = 0.96f))
            .border(1.dp, Brand.line, RoundedCornerShape(50))
            .padding(horizontal = Space.l, vertical = Space.m),
        horizontalArrangement = Arrangement.spacedBy(Space.s),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(Icons.Default.CheckCircle, null, tint = Brand.brass, modifier = Modifier.size(20.dp))
        Text(text, color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
    }
}

/** A segmented control: ivory pill on the chosen segment. */
@Composable
fun <T> Segmented(options: List<T>, selected: T, label: (T) -> String, modifier: Modifier = Modifier, onSelect: (T) -> Unit) {
    val haptics = LocalHapticFeedback.current
    Row(
        modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(50))
            .background(Brand.ivory.copy(alpha = 0.1f))
            .padding(3.dp),
    ) {
        options.forEach { o ->
            val on = o == selected
            Box(
                Modifier
                    .weight(1f)
                    .heightIn(min = 40.dp)
                    .clip(RoundedCornerShape(50))
                    .background(if (on) Brand.ivory else Color.Transparent)
                    .clickable(role = Role.Tab) {
                        if (!on) haptics.performHapticFeedback(HapticFeedbackType.SegmentTick)
                        onSelect(o)
                    }
                    .padding(horizontal = Space.s, vertical = Space.s),
                contentAlignment = Alignment.Center,
            ) {
                Text(label(o), color = if (on) Brand.ink else Brand.ivory.copy(alpha = 0.85f), fontSize = 14.sp,
                    fontWeight = if (on) FontWeight.SemiBold else FontWeight.Normal, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

/** A round icon well in brass. */
@Composable
fun IconWell(icon: ImageVector, size: Dp = 48.dp) {
    Box(Modifier.size(size).clip(CircleShape).background(Brand.brass.copy(alpha = 0.12f)), contentAlignment = Alignment.Center) {
        Icon(icon, null, tint = Brand.brass, modifier = Modifier.size(size * 0.5f))
    }
}

/** Wide screens (tablets, unfolded phones). */
@Composable
fun isWide(): Boolean = LocalConfiguration.current.screenWidthDp >= 600

@Composable
fun ColumnScope.Gap(h: Dp) = Spacer(Modifier.heightIn(min = h, max = h))

@Composable
fun RowScope.Fill() = Spacer(Modifier.weight(1f))
