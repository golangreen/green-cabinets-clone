package com.greencabinetsny.app.screens

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.Message
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.PlaylistAdd
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.greencabinetsny.app.LocalModel
import com.greencabinetsny.app.LocalNav
import com.greencabinetsny.app.Tools
import com.greencabinetsny.app.ar.ArCabinetsScreen
import com.greencabinetsny.app.ar.ArMeasureScreen
import com.greencabinetsny.app.model.AppTab
import com.greencabinetsny.app.model.Supplier
import com.greencabinetsny.app.ui.ActionButton
import com.greencabinetsny.app.ui.ActionKind
import com.greencabinetsny.app.ui.ActionRow
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Type

/** Screens pushed onto a tab's own back stack. */
sealed interface Route {
    data class Photo(val ids: List<String>, val id: String) : Route
    data class PanelDetail(val id: String) : Route
    data class SupplierAll(val supplier: Supplier) : Route
    data object WoodLibrary : Route
    data class Wood(val slug: String) : Route
    data object Paint : Route
    data class FinishDetail(val id: String) : Route
    data object Sizes : Route
    data class Room(val id: String) : Route
    data object Cabinets : Route
    data object Measure : Route
}

@Composable
fun TabRoot(tab: AppTab) {
    when (tab) {
        AppTab.Home -> HomeScreen()
        AppTab.Work -> WorkScreen()
        AppTab.Plan -> PlanScreen()
        AppTab.Materials -> MaterialsScreen()
        AppTab.Quote -> QuoteScreen()
    }
}

@Composable
fun RouteScreen(route: Route) {
    when (route) {
        is Route.Photo -> PhotoDetailScreen(route.ids, route.id)
        is Route.PanelDetail -> PanelDetailScreen(route.id)
        is Route.SupplierAll -> SupplierCatalogScreen(route.supplier)
        Route.WoodLibrary -> WoodLibraryScreen()
        is Route.Wood -> WoodDetailScreen(route.slug)
        Route.Paint -> HouseColorsScreen()
        is Route.FinishDetail -> FinishDetailScreen(route.id)
        Route.Sizes -> KitchenSizesScreen()
        is Route.Room -> RoomResultScreen(route.id)
        Route.Cabinets -> ArCabinetsScreen()
        Route.Measure -> ArMeasureScreen()
    }
}

/** The bar on a pushed screen: back, a title, and actions on the right. */
@Composable
fun TopBar(title: String, modifier: Modifier = Modifier, overlay: Boolean = false, actions: @Composable RowScope.() -> Unit = {}) {
    val nav = LocalNav.current
    Row(
        modifier
            .fillMaxWidth()
            .then(if (overlay) Modifier else Modifier.background(Brand.ink))
            .windowInsetsPadding(WindowInsets.statusBars)
            .height(56.dp)
            .padding(horizontal = Space.xs),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(
            onClick = { nav.pop() },
            modifier = Modifier.semantics { contentDescription = "Back" },
        ) {
            Box(
                Modifier.size(40.dp).clip(CircleShape).background(if (overlay) Brand.ink.copy(alpha = 0.7f) else Color.Transparent),
                contentAlignment = Alignment.Center,
            ) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = Brand.ivory) }
        }
        Text(title, style = Type.bar, maxLines = 1, overflow = TextOverflow.Ellipsis, textAlign = TextAlign.Center, modifier = Modifier.weight(1f))
        Row(verticalAlignment = Alignment.CenterVertically, content = actions)
        Spacer(Modifier.width(if (overlay) Space.xs else 0.dp))
    }
}

/** A pushed screen: the bar, then the content under it. */
@Composable
fun DetailScaffold(title: String, actions: @Composable RowScope.() -> Unit = {}, content: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().background(Brand.ink)) {
        TopBar(title, actions = actions)
        Box(Modifier.weight(1f)) { content() }
    }
}

/**
 * Two ways to ask about something: a text now, or keep it with the quote
 * request (a second tap takes it out again).
 */
@Composable
fun AskRow(text: String, pick: String, picture: (() -> Bitmap?)? = null) {
    val model = LocalModel.current
    val context = LocalContext.current
    val picked = model.isPicked(pick)
    ActionRow { m ->
        ActionButton("Text us", m, icon = Icons.AutoMirrored.Outlined.Message, kind = ActionKind.Secondary) {
            Tools.textUs(context, text, picture?.invoke())
        }
        ActionButton(
            if (picked) "In your quote" else "Add to quote", m,
            icon = if (picked) Icons.Outlined.CheckCircle else Icons.Outlined.PlaylistAdd,
            kind = ActionKind.Secondary, tint = if (picked) Brand.brass else null,
        ) { model.togglePick(pick) }
    }
}

/** A photo that ships with the app, as a bitmap (for sharing and texting). */
fun assetBitmap(context: Context, name: String, maxSide: Int = 1600): Bitmap? = runCatching {
    context.assets.open("img/$name.jpg").use { input ->
        val bytes = input.readBytes()
        val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, o)
        var s = 1
        while (maxOf(o.outWidth, o.outHeight) / s > maxSide * 2) s *= 2
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, BitmapFactory.Options().apply { inSampleSize = s })
    }
}.getOrNull()

@Composable
fun BottomSpace() = Spacer(Modifier.height(Space.section))

/** Shown where a tool needs something this device doesn't have. */
@Composable
fun Unavailable(text: String) {
    Box(Modifier.fillMaxSize().padding(Space.xl), contentAlignment = Alignment.Center) {
        Text(text, style = Type.secondary, textAlign = TextAlign.Center)
    }
}
