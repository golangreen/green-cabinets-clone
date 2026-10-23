package com.greencabinetsny.app.ui

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.wrapContentWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import com.greencabinetsny.app.R

/** Green Cabinets colors, the same tokens as greencabinetsny.com and the iPhone app. */
object Brand {
    val ink = Color(0xFF0E0D0C)
    /** Grouped surfaces and cards, one step up from the page */
    val surface = Color(0xFF171513)
    /** Anything raised above a card (chips, wells) */
    val raised = Color(0xFF221F1C)
    val ivory = Color(0xFFF2ECE2)
    /** Secondary text: 7:1 on ink */
    val stone = Color(0xFFA8A196)
    val brass = Color(0xFFC6A15B)
    /** Hairlines and card edges */
    val line = Color(0x21F2ECE2)
    /** The drawing paper behind plans and the 3D room */
    val paper = Color(0xFFF1EFEA)
    val error = Color(0xFFECA092)
}

/** Spacing on a 4 dp grid, by role. */
object Space {
    val xs = 4.dp
    val s = 8.dp
    val m = 12.dp
    val l = 16.dp
    val xl = 24.dp
    val section = 40.dp
    /** Side margin for page content */
    val gutter = 20.dp
    /** Widest a page's text column gets (tablets), so lines stay easy to read */
    val pageMax = 820.dp
}

object Radius {
    val card = 22.dp
    val photo = 18.dp
    val chip = 12.dp
}

/** Page content: the side margin, and on a wide screen a centered column. */
fun Modifier.page(): Modifier = this
    .fillMaxWidth()
    .wrapContentWidth(Alignment.CenterHorizontally)
    .widthIn(max = Space.pageMax)
    .padding(horizontal = Space.gutter)

val Cormorant = FontFamily(
    Font(R.font.cormorant_medium, FontWeight.Medium),
    Font(R.font.cormorant_medium_italic, FontWeight.Medium, FontStyle.Italic),
    Font(R.font.cormorant_semibold, FontWeight.SemiBold),
)

/** Cormorant Garamond for display only (the brand's voice), the system font for everything people read and operate. */
object Type {
    val hero = TextStyle(fontFamily = Cormorant, fontWeight = FontWeight.Medium, fontSize = 42.sp, lineHeight = 44.sp, letterSpacing = (-0.015).em, color = Brand.ivory)
    val heroItalic = hero.copy(fontStyle = FontStyle.Italic, color = Brand.brass)
    val section = TextStyle(fontFamily = Cormorant, fontWeight = FontWeight.Medium, fontSize = 31.sp, lineHeight = 34.sp, letterSpacing = (-0.01).em, color = Brand.ivory)
    val screen = TextStyle(fontFamily = Cormorant, fontWeight = FontWeight.SemiBold, fontSize = 38.sp, lineHeight = 42.sp, color = Brand.ivory)
    val bar = TextStyle(fontFamily = Cormorant, fontWeight = FontWeight.SemiBold, fontSize = 22.sp, color = Brand.ivory)
    val card = TextStyle(fontFamily = Cormorant, fontWeight = FontWeight.Medium, fontSize = 24.sp, lineHeight = 27.sp, color = Brand.ivory)
    fun display(size: Int) = TextStyle(fontFamily = Cormorant, fontWeight = FontWeight.Medium, fontSize = size.sp, lineHeight = (size * 1.08).sp, color = Brand.ivory)
    val eyebrow = TextStyle(fontSize = 12.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 0.13.em, color = Brand.brass)
    val body = TextStyle(fontSize = 17.sp, lineHeight = 25.sp, color = Brand.ivory.copy(alpha = 0.86f))
    val secondary = TextStyle(fontSize = 15.sp, lineHeight = 21.sp, color = Brand.stone)
    val headline = TextStyle(fontSize = 17.sp, lineHeight = 22.sp, fontWeight = FontWeight.SemiBold, color = Brand.ivory)
    val subhead = TextStyle(fontSize = 15.sp, lineHeight = 20.sp, color = Brand.ivory)
    val footnote = TextStyle(fontSize = 13.sp, lineHeight = 18.sp, color = Brand.stone)
    val caption = TextStyle(fontSize = 12.sp, lineHeight = 16.sp, color = Brand.stone)
}

/** One motion vocabulary: critically damped springs by default, no overshoot. */
object Motion {
    fun <T> snappy() = spring<T>(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = 440f)
    fun <T> settle() = spring<T>(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = 250f)
    fun <T> press() = spring<T>(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = 1500f)
}

@Composable
fun GreenCabinetsTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Brand.brass, onPrimary = Brand.ink,
            secondary = Brand.ivory, onSecondary = Brand.ink,
            background = Brand.ink, onBackground = Brand.ivory,
            surface = Brand.ink, onSurface = Brand.ivory,
            surfaceVariant = Brand.surface, onSurfaceVariant = Brand.stone,
            surfaceContainer = Brand.surface, surfaceContainerHigh = Brand.raised,
            surfaceContainerHighest = Brand.raised, surfaceContainerLow = Brand.surface,
            outline = Brand.line, outlineVariant = Brand.line,
            error = Brand.error,
        ),
        typography = Typography(),
        content = content,
    )
}
