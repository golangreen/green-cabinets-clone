package com.greencabinetsny.app

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import androidx.browser.customtabs.CustomTabColorSchemeParams
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.content.FileProvider
import com.greencabinetsny.app.model.Content
import java.io.File

/** Ways out of the app: a text, an email, a supplier's site, the share sheet. */
object Tools {
    /** A message to Green Cabinets; the number is never shown on screen. */
    fun textUs(context: Context, text: String = "Hi Green Cabinets, ", picture: Bitmap? = null) {
        val intent = if (picture != null) {
            Intent(Intent.ACTION_SEND).apply {
                type = "image/jpeg"
                putExtra("address", Content.TEXT_NUMBER)
                putExtra("sms_body", text)
                putExtra(Intent.EXTRA_TEXT, text)
                putExtra(Intent.EXTRA_STREAM, shareable(context, picture, "photo.jpg"))
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
        } else {
            Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:${Content.TEXT_NUMBER}")).putExtra("sms_body", text)
        }
        try {
            context.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            emailUs(context, text)
        }
    }

    fun emailUs(context: Context, body: String = "") {
        val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:")).apply {
            putExtra(Intent.EXTRA_EMAIL, arrayOf(Content.EMAIL))
            putExtra(Intent.EXTRA_SUBJECT, "Green Cabinets")
            if (body.isNotEmpty()) putExtra(Intent.EXTRA_TEXT, body)
        }
        runCatching { context.startActivity(intent) }
    }

    /** A website inside the app, in the brand's colors. */
    fun openWeb(context: Context, url: String) {
        val tab = CustomTabsIntent.Builder()
            .setDefaultColorSchemeParams(CustomTabColorSchemeParams.Builder().setToolbarColor(0xFF0E0D0C.toInt()).build())
            .setShowTitle(true)
            .build()
        runCatching { tab.launchUrl(context, Uri.parse(url)) }
            .onFailure { runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) } }
    }

    /** Pictures through the share sheet (Save to Photos, Messages, Drive...). */
    fun share(context: Context, pictures: List<Bitmap>, text: String = Content.SHARE_LINE) {
        val uris = ArrayList(pictures.mapIndexed { i, b -> shareable(context, b, "green-cabinets-${i + 1}.jpg") })
        val intent = if (uris.size == 1) {
            Intent(Intent.ACTION_SEND).apply { type = "image/jpeg"; putExtra(Intent.EXTRA_STREAM, uris[0]) }
        } else {
            Intent(Intent.ACTION_SEND_MULTIPLE).apply { type = "image/jpeg"; putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris) }
        }
        intent.putExtra(Intent.EXTRA_TEXT, text)
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        context.startActivity(Intent.createChooser(intent, null))
    }

    fun shareFile(context: Context, file: File, mime: String) {
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.files", file)
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = mime
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(intent, null))
    }

    private fun shareable(context: Context, b: Bitmap, name: String): Uri {
        val dir = File(context.cacheDir, "share").apply { mkdirs() }
        val f = File(dir, name)
        f.outputStream().use { b.compress(Bitmap.CompressFormat.JPEG, 88, it) }
        return FileProvider.getUriForFile(context, "${context.packageName}.files", f)
    }
}
