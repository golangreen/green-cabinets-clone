package com.greencabinetsny.app

import android.content.Intent
import com.greencabinetsny.app.model.AppModel
import com.greencabinetsny.app.model.AppTab
import com.greencabinetsny.app.model.KitchenShape

/**
 * Debug builds only: open a screen straight from adb, for screenshots.
 *   adb shell am start -n com.greencabinetsny.myapp/com.greencabinetsny.app.MainActivity --es tab plan --es open sizes
 *   --es typed l|u|galley|one   a kitchen from typed sizes, opened
 *   --ef scroll 0.5             start a scrolling tab part way down
 */
object DebugLaunch {
    var scroll: Float? = null
        private set

    fun apply(intent: Intent?, m: AppModel) {
        if (!BuildConfig.DEBUG || intent == null) return
        when (intent.getStringExtra("tab")) {
            "work" -> m.tab = AppTab.Work
            "plan" -> m.tab = AppTab.Plan
            "materials" -> m.tab = AppTab.Materials
            "quote" -> m.tab = AppTab.Quote
            "home" -> m.tab = AppTab.Home
        }
        when (val o = intent.getStringExtra("open")) {
            null -> {}
            "board" -> m.showBoard = true
            "match" -> m.showColorMatch = true
            else -> { m.tab = AppTab.Plan; m.planRoute = o }
        }
        intent.getStringExtra("typed")?.let { t ->
            val shape = KitchenShape.entries.firstOrNull { it.label.lowercase().startsWith(t) } ?: return@let
            val (room, picked) = shape.room(shape.start, 8.0, true)
            val s = m.keep(room, shape.line(shape.start, 8.0, true), picked)
            m.tab = AppTab.Plan
            m.planRoute = s.id
        }
        if (intent.hasExtra("scroll")) scroll = intent.getFloatExtra("scroll", 0f)
    }
}
