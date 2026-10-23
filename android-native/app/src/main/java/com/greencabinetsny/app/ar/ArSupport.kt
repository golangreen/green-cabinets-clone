package com.greencabinetsny.app.ar

import android.content.Context
import com.google.ar.core.ArCoreApk

/** Whether this phone can run ARCore (the AR cabinets and the camera tape measure). */
object ArSupport {
    fun check(context: Context): Boolean = runCatching {
        val a = ArCoreApk.getInstance().checkAvailability(context)
        a.isSupported || a == ArCoreApk.Availability.UNKNOWN_CHECKING
    }.getOrDefault(false)
}
