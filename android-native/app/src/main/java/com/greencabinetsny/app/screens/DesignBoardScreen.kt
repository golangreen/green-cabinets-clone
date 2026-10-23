package com.greencabinetsny.app.screens

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.outlined.Palette
import androidx.compose.material.icons.outlined.Print
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material.icons.outlined.Straighten
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.core.content.res.ResourcesCompat
import androidx.print.PrintHelper
import coil3.ImageLoader
import coil3.request.ImageRequest
import coil3.request.SuccessResult
import coil3.request.allowHardware
import coil3.toBitmap
import com.greencabinetsny.app.LocalModel
import com.greencabinetsny.app.R
import com.greencabinetsny.app.Tools
import com.greencabinetsny.app.model.AppTab
import com.greencabinetsny.app.model.Attachment
import com.greencabinetsny.app.model.Content
import com.greencabinetsny.app.model.Finish
import com.greencabinetsny.app.model.HouseColors
import com.greencabinetsny.app.model.LengthUnit
import com.greencabinetsny.app.model.Panel
import com.greencabinetsny.app.model.ProjectBasket
import com.greencabinetsny.app.model.WoodSpecies
import com.greencabinetsny.app.model.colorOf
import com.greencabinetsny.app.model.loadBitmap
import com.greencabinetsny.app.render.Textures
import com.greencabinetsny.app.ui.ActionButton
import com.greencabinetsny.app.ui.ActionKind
import com.greencabinetsny.app.ui.ActionRow
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.Radius
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Type
import com.greencabinetsny.app.ui.card
import com.greencabinetsny.app.ui.page
import com.greencabinetsny.app.ui.pressable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.text.DateFormat
import java.util.Date
import kotlin.math.max
import kotlin.math.min

/**
 * Turns a line on the request ("Tafisa Cream Puff (TFL: M2034)") back into its
 * swatch: a supplier decor, a wood, a paint or stain, or a work photo.
 */
class BoardPick(line: String) {
    val name: String
    val detail: String
    val finish: Finish?
    val panel: Panel?
    val photo: String?
    val hex: String

    init {
        val p = Panel.all.firstOrNull { it.requestLine == line }
        val f = (HouseColors.paints + HouseColors.stains).firstOrNull { it.requestLine == line }
        val w = WoodSpecies.all.firstOrNull { Finish.wood(it).requestLine == line }
        val work = Content.photos.firstOrNull { it.requestLine == line }
        when {
            p != null -> { name = p.name; detail = listOfNotNull(if (p.isCountertop) "Countertop" else null, p.brand, p.code).joinToString(" · "); finish = null; panel = p; photo = null; hex = p.tone ?: p.hex.ifEmpty { "#D8D4CE" } }
            f != null -> { name = f.name; detail = f.detail; finish = f; panel = null; photo = null; hex = f.hex }
            w != null -> { name = w.name; detail = "Solid wood"; finish = Finish.wood(w); panel = null; photo = null; hex = w.swatch }
            work != null -> { name = work.title; detail = "A look we built"; finish = null; panel = null; photo = work.id; hex = "#221F1C" }
            line.startsWith("Paint to match: ") -> {
                val h = line.split(" ").firstOrNull { it.startsWith("#") } ?: "#D8D4CE"
                name = "Paint to match"; detail = h; finish = null; panel = null; photo = null; hex = h
            }
            else -> { name = line; detail = ""; finish = null; panel = null; photo = null; hex = "#221F1C" }
        }
    }

    @Composable
    fun Swatch(modifier: Modifier) {
        when {
            panel != null -> PanelSwatch(panel, modifier, 360)
            finish != null -> FinishSwatch(finish, modifier, 360)
            photo != null -> com.greencabinetsny.app.ui.PhotoView(photo, modifier, corner = 0.dp)
            else -> Box(modifier.background(colorOf(hex)))
        }
    }

    /** The picture for a printed page: fetched if needed, else null (the color) */
    suspend fun picture(context: Context): Bitmap? = when {
        panel?.thumbUrl != null -> {
            val req = ImageRequest.Builder(context).data(panel.thumbUrl).size(360).allowHardware(false).build()
            (ImageLoader(context).execute(req) as? SuccessResult)?.image?.toBitmap()
        }
        finish != null -> Textures.load(context, finish)
        photo != null -> assetBitmap(context, photo, 600)
        else -> null
    }
}

/**
 * Everything the person made and picked, on one page: the pictures, the
 * finishes they like with their codes, and their sizes. Theirs to keep (save,
 * print, share) or to send to us.
 */
@Composable
fun DesignBoardScreen(onClose: () -> Unit) {
    val model = LocalModel.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var preparing by remember { mutableStateOf(false) }
    var viewing by remember { mutableStateOf<Int?>(null) }
    // Showing the board already sent (nothing new collected since)
    val showingSent = model.basket.isEmpty && model.sentBasket != null
    val b = if (showingSent) model.sentBasket ?: model.basket else model.basket

    fun export(pdf: Boolean) {
        if (preparing) return
        preparing = true
        scope.launch {
            val poster = withContext(Dispatchers.IO) { BoardPoster.make(context, b, model.unit) { model.file(it) } }
            if (pdf) {
                // Print straight from the phone (or save as PDF from the print screen)
                PrintHelper(context).apply { scaleMode = PrintHelper.SCALE_MODE_FIT }.printBitmap("Green Cabinets design board", poster)
            } else {
                Tools.share(context, listOf(poster))
            }
            preparing = false
        }
    }

    Dialog(onClose, DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false)) {
        BackHandler { onClose() }
        Box(Modifier.fillMaxSize().background(Brand.ink)) {
            Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(top = 96.dp, bottom = Space.section)) {
                Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.xl)) {
                    Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
                        val sent = model.lastSent
                        if (showingSent && sent != null) {
                            Row(horizontalArrangement = Arrangement.spacedBy(Space.xs), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Filled.CheckCircle, null, tint = Brand.brass, modifier = Modifier.size(16.dp))
                                Text("Sent to Green Cabinets ${DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(sent))}", color = Brand.brass, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                        } else Text("YOUR KITCHEN, SO FAR", style = Type.eyebrow)
                        Text("Design board", style = Type.hero)
                        Text("Keep adding as you go. Save it, print it, or share it with anyone helping you decide.", style = Type.secondary)
                    }
                    if (b.isEmpty) {
                        Column(Modifier.fillMaxWidth().card(), verticalArrangement = Arrangement.spacedBy(Space.l)) {
                            Text("Nothing here yet. Try cabinets in AR, design your kitchen, or pick finishes you like. It all collects here.", style = Type.body)
                            ActionRow { m ->
                                ActionButton("Plan the room", m, icon = Icons.Outlined.Straighten) { onClose(); model.tab = AppTab.Plan }
                                ActionButton("Pick finishes", m, icon = Icons.Outlined.Palette, kind = ActionKind.Secondary) { onClose(); model.tab = AppTab.Materials }
                            }
                        }
                    } else {
                        Pictures(b.items) { viewing = it }
                        if (b.picks.isNotEmpty()) {
                            Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                                Text("FINISHES AND LOOKS", style = Type.eyebrow)
                                b.picks.chunked(3).forEach { row ->
                                    Row(horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                                        row.forEach { line ->
                                            val p = remember(line) { BoardPick(line) }
                                            Column(Modifier.weight(1f).semantics(mergeDescendants = true) {}, verticalArrangement = Arrangement.spacedBy(Space.xs)) {
                                                p.Swatch(Modifier.fillMaxWidth().aspectRatio(1f).clip(RoundedCornerShape(Radius.chip)).border(1.dp, Brand.line, RoundedCornerShape(Radius.chip)))
                                                Text(p.name, color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, maxLines = 2)
                                                Text(p.detail, style = Type.caption, maxLines = 2)
                                            }
                                        }
                                        repeat(3 - row.size) { Box(Modifier.weight(1f)) }
                                    }
                                }
                            }
                        }
                        if (b.lengths.isNotEmpty() || b.roomLines.isNotEmpty()) {
                            val u = model.unit.forText
                            Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                                Text("SIZES", style = Type.eyebrow)
                                Column(Modifier.fillMaxWidth().card(), verticalArrangement = Arrangement.spacedBy(Space.s)) {
                                    b.lengths.forEachIndexed { i, l ->
                                        Row {
                                            Text(l.name.ifEmpty { "Length ${i + 1}" }, style = Type.subhead, modifier = Modifier.weight(1f))
                                            Text(u.length(l.meters), color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                                        }
                                    }
                                    b.roomLines.take(4).forEach { Text(it, style = Type.footnote) }
                                }
                            }
                        }
                        Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
                            if (!showingSent) ActionButton("Send it to Green Cabinets", Modifier.fillMaxWidth(), icon = Icons.AutoMirrored.Outlined.Send) {
                                onClose(); model.tab = AppTab.Quote
                            }
                            ActionRow { m ->
                                ActionButton(if (preparing) "Preparing…" else "Save or share", m, icon = Icons.Outlined.Share, kind = ActionKind.Secondary, enabled = !preparing) { export(false) }
                                ActionButton("Print", m, icon = Icons.Outlined.Print, kind = ActionKind.Secondary, enabled = !preparing) { export(true) }
                            }
                        }
                    }
                }
            }
            Row(Modifier.fillMaxWidth().background(Brand.ink.copy(alpha = 0.94f)).padding(top = 36.dp, start = Space.s, end = Space.s, bottom = Space.s),
                verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onClose) { Icon(Icons.Default.Close, "Close", tint = Brand.ivory) }
                Text("Design board", style = Type.bar, modifier = Modifier.weight(1f))
            }
        }
        viewing?.let { PictureViewer(b.items, it) { viewing = null } }
    }
}

@Composable
private fun Pictures(items: List<Attachment>, onOpen: (Int) -> Unit) {
    if (items.isEmpty()) return
    val model = LocalModel.current
    Column(verticalArrangement = Arrangement.spacedBy(Space.m)) {
        Text("PICTURES", style = Type.eyebrow)
        var first by remember(items.first().id) { mutableStateOf<Bitmap?>(null) }
        LaunchedEffect(items.first().id) { first = withContext(Dispatchers.IO) { loadBitmap(model.file(items.first()), 1200) } }
        Box(Modifier.fillMaxWidth().height(260.dp).clip(RoundedCornerShape(Radius.photo)).background(Brand.raised)
            .pressable(label = "Opens it full screen, to save, print or share") { onOpen(0) }.semantics { contentDescription = items.first().title }) {
            first?.let { Image(it.asImageBitmap(), null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize()) }
        }
        if (items.size > 1) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                itemsIndexed(items.drop(1), key = { _, a -> a.id }) { i, a ->
                    var img by remember(a.id) { mutableStateOf<Bitmap?>(null) }
                    LaunchedEffect(a.id) { img = withContext(Dispatchers.IO) { loadBitmap(model.file(a), 300) } }
                    Box(Modifier.size(120.dp).clip(RoundedCornerShape(Radius.chip)).background(Brand.raised).pressable { onOpen(i + 1) }
                        .semantics { contentDescription = a.title }) {
                        img?.let { Image(it.asImageBitmap(), null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize()) }
                    }
                }
            }
        }
    }
}

/** The board as one page on drawing paper, in the brand's type, sized for a US letter sheet at 2.5x. */
object BoardPoster {
    private const val K = 2.5f
    private const val W = 612f
    private const val H = 792f

    suspend fun make(context: Context, b: ProjectBasket, unit: LengthUnit, fileOf: (Attachment) -> File): Bitmap {
        val pics = b.items.take(4).mapNotNull { loadBitmap(fileOf(it), 1400) }
        val swatches = b.picks.take(8).map { line -> BoardPick(line).let { Triple(it, it.picture(context), it.hex) } }
        val u = unit.forText
        val sizes = b.lengths.take(6).mapIndexed { i, l -> l.name.ifEmpty { "Length ${i + 1}" } to u.length(l.meters) }.toMutableList()
        for (line in b.roomLines.take(4)) {
            val parts = line.split(":", limit = 2).map { it.trim() }
            if (parts.size == 2) sizes += parts[0] to parts[1]
        }
        val serif = ResourcesCompat.getFont(context, R.font.cormorant_medium) ?: Typeface.SERIF
        val italic = ResourcesCompat.getFont(context, R.font.cormorant_medium_italic) ?: Typeface.SERIF

        val out = Bitmap.createBitmap((W * K).toInt(), (H * K).toInt(), Bitmap.Config.ARGB_8888)
        val c = Canvas(out)
        c.scale(K, K)
        c.drawColor(0xFFF1EFEA.toInt())
        val ink = 0xFF26221E.toInt()
        val soft = 0xFF70685E.toInt()
        val dim = 0xFF8A6A2F.toInt()
        val p = Paint(Paint.ANTI_ALIAS_FLAG)
        fun text(s: String, x: Float, y: Float, size: Float, color: Int, face: Typeface = Typeface.DEFAULT, spacing: Float = 0f, right: Boolean = false, bold: Boolean = false) {
            p.typeface = if (bold) Typeface.create(face, Typeface.BOLD) else face
            p.textSize = size; p.color = color; p.letterSpacing = spacing
            p.textAlign = if (right) Paint.Align.RIGHT else Paint.Align.LEFT
            c.drawText(s, x, y, p)
        }
        fun fit(s: String, max: Float, size: Float): String {
            p.textSize = size
            if (p.measureText(s) <= max) return s
            var t = s
            while (t.isNotEmpty() && p.measureText("$t…") > max) t = t.dropLast(1)
            return "$t…"
        }
        fun image(img: Bitmap, r: RectF, radius: Float) {
            c.save()
            val path = android.graphics.Path().apply { addRoundRect(r, radius, radius, android.graphics.Path.Direction.CW) }
            c.clipPath(path)
            val k = max(r.width() / img.width, r.height() / img.height)
            val w = img.width * k
            val h = img.height * k
            c.drawBitmap(img, null, RectF(r.centerX() - w / 2, r.centerY() - h / 2, r.centerX() + w / 2, r.centerY() + h / 2), Paint(Paint.FILTER_BITMAP_FLAG))
            c.restore()
        }
        val m = 36f
        var y = m + 9f
        text("GREEN CABINETS NY", m, y, 9f, dim, spacing = 0.22f, bold = true)
        text(DateFormat.getDateInstance(DateFormat.LONG).format(Date()), W - m, y, 9f, soft, right = true)
        y += 44f
        text("Design board", m, y, 40f, ink, serif)
        y += 16f
        pics.firstOrNull()?.let { hero ->
            val h = if (pics.size > 1) 230f else 320f
            image(hero, RectF(m, y, W - m, y + h), 10f); y += h + 10f
        }
        if (pics.size > 1) {
            val rest = pics.drop(1).take(3)
            val w = (W - 2 * m - 10f * (rest.size - 1)) / rest.size
            rest.forEachIndexed { i, img -> image(img, RectF(m + i * (w + 10f), y, m + i * (w + 10f) + w, y + 88f), 8f) }
            y += 88f + 18f
        } else y += 8f
        if (swatches.isNotEmpty()) {
            text("FINISHES AND LOOKS", m, y + 8f, 8f, dim, spacing = 0.2f, bold = true)
            y += 18f
            val cw = (W - 2 * m - 12f * 3) / 4
            swatches.chunked(4).forEach { row ->
                row.forEachIndexed { i, (pick, img, hex) ->
                    val x = m + i * (cw + 12f)
                    val r = RectF(x, y, x + cw, y + 48f)
                    if (img != null) image(img, r, 6f) else {
                        val col = colorOf(hex)
                        p.color = android.graphics.Color.argb(255, (col.red * 255).toInt(), (col.green * 255).toInt(), (col.blue * 255).toInt())
                        c.drawRoundRect(r, 6f, 6f, p)
                    }
                    text(fit(pick.name, cw, 9f), x, y + 60f, 9f, ink, bold = true)
                    text(fit(pick.detail, cw, 7.5f), x, y + 71f, 7.5f, soft)
                }
                y += 84f
            }
            y += 6f
        }
        if (sizes.isNotEmpty()) {
            text("SIZES", m, y + 8f, 8f, dim, spacing = 0.2f, bold = true)
            y += 22f
            val colW = (W - 2 * m - 24f) / 2
            sizes.chunked(2).forEach { row ->
                row.forEachIndexed { i, (k, v) ->
                    val x = m + i * (colW + 24f)
                    text(v, x + colW, y, 9f, ink, right = true, bold = true)
                    p.textSize = 9f; p.typeface = Typeface.DEFAULT
                    text(fit(k, colW - p.measureText(v) - 8f, 9f), x, y, 9f, soft)
                }
                y += 13f
            }
        }
        val footY = H - m
        p.color = (0x26 shl 24) or (ink and 0xFFFFFF)
        c.drawRect(m, footY - 18f, W - m, footY - 17.5f, p)
        text("Designed in Bushwick since 2009", m, footY, 13f, ink, italic)
        text("greencabinetsny.com  ·  ${Content.EMAIL}", W - m, footY, 8.5f, soft, right = true)
        return out
    }
}
