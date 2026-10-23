package com.greencabinetsny.app.model

import kotlin.math.roundToInt

/**
 * A door or drawer front in wall coordinates: along the piece from its start,
 * and up from the floor. Shared by the wall drawings and the 3D cabinets.
 */
data class Front(
    val x0: Float, val x1: Float, val y0: Float, val y1: Float,
    val drawer: Boolean,
    /** Where the pull goes on a door: at the left or right edge, near the top or the bottom */
    val pullRight: Boolean = false,
    val pullHigh: Boolean = true,
)

object Fronts {
    fun of(p: KitchenLayout.Piece): List<Front> {
        val gap = 0.003f
        val w = p.width.toFloat()
        val inches = (p.width / KitchenLayout.INCH).roundToInt()
        val doors = if (inches >= 24) 2 else 1
        fun doorsRow(y0: Float, y1: Float, high: Boolean): List<Front> = (0 until doors).map { i ->
            val a = w * i / doors
            val b = w * (i + 1) / doors
            // Pairs open from the middle; a single door opens on its right
            Front(a + gap, b - gap, y0 + gap, y1 - gap, false, pullRight = doors == 1 || i == 0, pullHigh = high)
        }
        val top = p.top.toFloat()
        val kick = KitchenLayout.TOE_KICK.toFloat()
        return when (p.kind) {
            KitchenLayout.Kind.Base, KitchenLayout.Kind.Sink -> {
                val split = top - 0.152f
                listOf(Front(gap, w - gap, split + gap, top - gap, true)) + doorsRow(kick, split, true)
            }
            KitchenLayout.Kind.Drawers -> {
                val a = top - 0.152f
                val b = kick + (a - kick) / 2
                listOf(
                    Front(gap, w - gap, a + gap, top - gap, true),
                    Front(gap, w - gap, b + gap, a - gap, true),
                    Front(gap, w - gap, kick + gap, b - gap, true),
                )
            }
            KitchenLayout.Kind.Wall -> doorsRow(p.bottom.toFloat(), top, false)
            KitchenLayout.Kind.Tall -> {
                val split = kick + (top - kick) * 0.58f
                doorsRow(kick, split, true) + doorsRow(split, top, false)
            }
            else -> emptyList()
        }
    }
}
