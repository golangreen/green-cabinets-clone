package com.greencabinetsny.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Layers
import androidx.compose.material.icons.outlined.PhotoLibrary
import androidx.compose.material.icons.outlined.Straighten
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.NavigationRailItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.unit.dp
import com.greencabinetsny.app.model.AppModel
import com.greencabinetsny.app.model.AppTab
import com.greencabinetsny.app.model.Library
import com.greencabinetsny.app.screens.ColorMatchSheet
import com.greencabinetsny.app.screens.DesignBoardScreen
import com.greencabinetsny.app.screens.Route
import com.greencabinetsny.app.screens.RouteScreen
import com.greencabinetsny.app.screens.TabRoot
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.GreenCabinetsTheme
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Toast
import com.greencabinetsny.app.ui.isWide

val LocalModel = compositionLocalOf<AppModel> { error("no model") }

/** Each tab keeps its own back stack; this pushes onto the current tab's. */
class Navigator(private val stacks: MutableMap<AppTab, SnapshotStateList<Route>>, private val model: AppModel) {
    fun stack(tab: AppTab): SnapshotStateList<Route> = stacks.getOrPut(tab) { mutableStateListOf() }
    fun push(r: Route) { stack(model.tab).add(r) }
    fun pop(): Boolean {
        val s = stack(model.tab)
        if (s.isEmpty()) return false
        s.removeAt(s.lastIndex)
        return true
    }
    fun popToRoot(tab: AppTab) { stack(tab).clear() }
    /** Jump to a tab and open a screen there */
    fun open(tab: AppTab, r: Route) {
        model.tab = tab
        stack(tab).apply { clear(); add(r) }
    }
}

val LocalNav = compositionLocalOf<Navigator> { error("no navigator") }

class MainActivity : ComponentActivity() {
    private lateinit var model: AppModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Library.load(applicationContext)
        model = (application as GreenCabinetsApp).model
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(0x00000000),
            navigationBarStyle = SystemBarStyle.dark(0x00000000),
        )
        DebugLaunch.apply(intent, model)
        setContent {
            GreenCabinetsTheme { Root(model) }
        }
    }
}

private data class TabItem(val tab: AppTab, val icon: ImageVector)

private val tabs = listOf(
    TabItem(AppTab.Home, Icons.Outlined.Home),
    TabItem(AppTab.Work, Icons.Outlined.PhotoLibrary),
    TabItem(AppTab.Plan, Icons.Outlined.Straighten),
    TabItem(AppTab.Materials, Icons.Outlined.Layers),
    TabItem(AppTab.Quote, Icons.AutoMirrored.Outlined.Send),
)

/**
 * Five tabs: the work, the tools to plan a room, the materials, and the quote
 * that collects everything. A bottom bar on phones, a side rail on tablets.
 */
@Composable
fun Root(model: AppModel) {
    val stacks = remember { mutableStateMapOf<AppTab, SnapshotStateList<Route>>() }
    val nav = remember { Navigator(stacks, model) }
    val wide = isWide()
    val haptics = LocalHapticFeedback.current
    val stack = nav.stack(model.tab)
    // The AR camera fills the whole screen
    val immersive = stack.lastOrNull().let { it is Route.Cabinets || it is Route.Measure }

    // Back: the screen first, then Home
    BackHandler(enabled = stack.isNotEmpty() || model.tab != AppTab.Home || model.showBoard) {
        when {
            model.showBoard -> model.showBoard = false
            stack.isNotEmpty() -> nav.pop()
            else -> model.tab = AppTab.Home
        }
    }

    // "Design my kitchen" and debug launches open a Plan screen directly
    LaunchedEffect(model.planRoute) {
        when (val r = model.planRoute) {
            null, "drawings" -> {}
            "sizes" -> { nav.open(AppTab.Plan, Route.Sizes); model.planRoute = null }
            "cabinets" -> { nav.open(AppTab.Plan, Route.Cabinets); model.planRoute = null }
            "measure" -> { nav.open(AppTab.Plan, Route.Measure); model.planRoute = null }
            else -> { nav.open(AppTab.Plan, Route.Room(r)); model.planRoute = null }
        }
        if (model.planRoute == "drawings") { model.tab = AppTab.Plan; nav.popToRoot(AppTab.Plan) }
    }

    fun select(t: AppTab) {
        if (t == model.tab) nav.popToRoot(t) else haptics.performHapticFeedback(HapticFeedbackType.SegmentTick)
        model.tab = t
    }

    CompositionLocalProvider(LocalModel provides model, LocalNav provides nav) {
        Scaffold(
            containerColor = Brand.ink,
            contentWindowInsets = WindowInsets(0),
            bottomBar = {
                if (!wide && !immersive) {
                    NavigationBar(containerColor = Brand.surface, tonalElevation = 0.dp) {
                        tabs.forEach { t ->
                            NavigationBarItem(
                                selected = model.tab == t.tab,
                                onClick = { select(t.tab) },
                                icon = { TabIcon(t, model) },
                                label = { Text(t.tab.label, maxLines = 1) },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = Brand.brass, selectedTextColor = Brand.brass,
                                    indicatorColor = Brand.brass.copy(alpha = 0.16f),
                                    unselectedIconColor = Brand.ivory.copy(alpha = 0.8f), unselectedTextColor = Brand.ivory.copy(alpha = 0.8f),
                                ),
                            )
                        }
                    }
                }
            },
        ) { pad ->
            Row(Modifier.fillMaxSize().padding(pad)) {
                if (wide && !immersive) {
                    NavigationRail(containerColor = Brand.surface, modifier = Modifier.fillMaxHeight().windowInsetsPadding(WindowInsets.safeDrawing)) {
                        tabs.forEach { t ->
                            NavigationRailItem(
                                selected = model.tab == t.tab,
                                onClick = { select(t.tab) },
                                icon = { TabIcon(t, model) },
                                label = { Text(t.tab.label, maxLines = 1) },
                                colors = NavigationRailItemDefaults.colors(
                                    selectedIconColor = Brand.brass, selectedTextColor = Brand.brass,
                                    indicatorColor = Brand.brass.copy(alpha = 0.16f),
                                    unselectedIconColor = Brand.ivory.copy(alpha = 0.8f), unselectedTextColor = Brand.ivory.copy(alpha = 0.8f),
                                ),
                            )
                        }
                    }
                }
                Box(Modifier.weight(1f).fillMaxHeight().background(Brand.ink)) {
                    val top = stack.lastOrNull()
                    AnimatedContent(
                        targetState = model.tab to top,
                        transitionSpec = { fadeIn(tween(180)) togetherWith fadeOut(tween(120)) },
                        label = "screen",
                    ) { (tab, route) ->
                        if (route == null) TabRoot(tab) else RouteScreen(route)
                    }
                }
            }
            Box(Modifier.fillMaxSize().statusBarsPadding().padding(top = Space.s), contentAlignment = Alignment.TopCenter) {
                AnimatedVisibility(
                    visible = model.toast != null,
                    enter = fadeIn(tween(180)) + slideInVertically(tween(220)) { -it / 2 },
                    exit = fadeOut(tween(160)),
                ) {
                    Toast(model.toast ?: "", Modifier.clickable { model.dismissToast() })
                }
            }
            if (model.showBoard) DesignBoardScreen(onClose = { model.showBoard = false })
            if (model.showColorMatch) ColorMatchSheet(onClose = { model.showColorMatch = false })
        }
    }
}

@Composable
private fun TabIcon(t: TabItem, model: AppModel) {
    if (t.tab == AppTab.Quote && model.basket.count > 0) {
        BadgedBox(badge = { Badge(containerColor = Brand.error, contentColor = Brand.ink) { Text("${model.basket.count}") } }) {
            Icon(t.icon, null)
        }
    } else {
        Icon(t.icon, null)
    }
}
