package com.greencabinetsny.app

import android.app.Application
import com.greencabinetsny.app.model.AppModel
import com.greencabinetsny.app.model.Library

class GreenCabinetsApp : Application() {
    val model: AppModel by lazy { AppModel(this) }

    override fun onCreate() {
        super.onCreate()
        Library.load(this)
    }
}
