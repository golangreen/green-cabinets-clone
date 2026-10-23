package com.greencabinetsny.app.model

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.UUID
import kotlin.math.max
import kotlin.math.roundToInt

enum class AppTab(val label: String) { Home("Home"), Work("Our work"), Plan("Plan"), Materials("Materials"), Quote("Quote") }

/** Something the person made with a tool, waiting to go out with their request. */
@Serializable
data class Attachment(
    val id: String = UUID.randomUUID().toString(),
    val kind: Kind,
    val title: String,
    /** The JPEG, saved in the app's files */
    val file: String,
) {
    @Serializable
    enum class Kind(val label: String) { Ar("AR picture"), Measure("Measurement picture"), Scan("Room plan picture"), Drawing("Drawing"), Photo("Photo") }
}

@Serializable
data class MeasuredLength(val id: String = UUID.randomUUID().toString(), val meters: Double, val name: String = "")

/** A room kept on the phone (the most recent few), so leaving the screen loses nothing. */
@Serializable
data class SavedScan(
    val id: String,
    val room: ScannedRoom,
    val date: Long,
    val sample: Boolean = false,
    /** Sizes typed in by the person instead of scanned: what they typed */
    val typed: String? = null,
    /** Walls to start with new cabinets on */
    val picked: List<Int>? = null,
)

/** Everything collected for one request: pictures, lengths and a room. Saved on the phone. */
@Serializable
data class ProjectBasket(
    val items: List<Attachment> = emptyList(),
    val lengths: List<MeasuredLength> = emptyList(),
    val scanID: String? = null,
    val room: ScannedRoom? = null,
    val roomLines: List<String> = emptyList(),
    /** Finishes, woods and looks the person liked ("Tafisa Cream Puff (TFL: M2034)") */
    val picks: List<String> = emptyList(),
) {
    val count: Int get() = items.size + lengths.size + picks.size + (if (room == null) 0 else 1)
    val isEmpty: Boolean get() = count == 0
}

/**
 * The app's state, the same as the iPhone app's AppModel: the tab, the project
 * basket, recent rooms, units, and a short toast. Everything is saved on the
 * phone as it changes.
 */
class AppModel(private val context: Context) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val dir: File = context.filesDir
    private val prefs = context.getSharedPreferences("gc", Context.MODE_PRIVATE)

    var tab by mutableStateOf(AppTab.Home)
    var toast by mutableStateOf<String?>(null)
        private set
    private var toastJob: Job? = null

    /** "Match a color" is open */
    var showColorMatch by mutableStateOf(false)
    /** The design board is open */
    var showBoard by mutableStateOf(false)
    /** What the AR cabinets wear when they open ("See it in your room") */
    var arStart by mutableStateOf<Finish?>(null)
    /** A countertop stone to start the AR counters with */
    var arCounter by mutableStateOf<Finish?>(null)
    /** A screen to open in the Plan tab ("sizes", "sample", a saved room id) */
    var planRoute by mutableStateOf<String?>(null)

    var lastSent by mutableStateOf(prefs.getLong("lastSent", 0L).takeIf { it > 0 })
        private set

    var basket by mutableStateOf(ProjectBasket())
        private set
    var sentBasket by mutableStateOf<ProjectBasket?>(null)
        private set
    var scans by mutableStateOf<List<SavedScan>>(emptyList())
        private set

    /** Units for measurements and drawings, remembered */
    var unit by mutableStateOf(LengthUnit.entries.firstOrNull { it.name == prefs.getString("unit", null) } ?: LengthUnit.FtIn)
        private set

    init {
        basket = read("basket.json") ?: ProjectBasket()
        scans = read("scans.json") ?: emptyList()
        sentBasket = read("sent.json")
    }

    private inline fun <reified T> read(name: String): T? = runCatching {
        Library.json.decodeFromString<T>(File(dir, name).readText())
    }.getOrNull()

    private inline fun <reified T> write(name: String, value: T?) {
        val text = value?.let { Library.json.encodeToString(it) }
        scope.launch(Dispatchers.IO) {
            val f = File(dir, name)
            if (text == null) f.delete() else File(dir, "$name.tmp").apply { writeText(text) }.renameTo(f)
        }
    }

    fun updateBasket(b: ProjectBasket) {
        basket = b
        write("basket.json", b)
    }

    fun chooseUnit(u: LengthUnit) {
        unit = u
        prefs.edit().putString("unit", u.name).apply()
    }

    // Collecting

    /** Saves a picture with the project; returns the attachment. */
    fun add(images: List<Bitmap>, kind: Attachment.Kind, title: String, quiet: Boolean = false) {
        val new = images.mapNotNull { img ->
            val name = "pic-${UUID.randomUUID()}.jpg"
            val data = img.scaledJpeg(1800, 78) ?: return@mapNotNull null
            File(dir, name).writeBytes(data)
            Attachment(kind = kind, title = title, file = name)
        }
        if (new.isEmpty()) return
        updateBasket(basket.copy(items = basket.items + new))
        if (!quiet) say(if (new.size == 1) "1 picture added to your project" else "${new.size} pictures added to your project")
    }

    fun addLengths(lengths: List<Double>) {
        if (lengths.isEmpty()) return
        updateBasket(basket.copy(lengths = basket.lengths + lengths.map { MeasuredLength(meters = it) }))
    }

    fun removeItem(a: Attachment) {
        File(dir, a.file).delete()
        updateBasket(basket.copy(items = basket.items.filter { it.id != a.id }))
    }

    fun file(a: Attachment) = File(dir, a.file)

    /** `lead` goes first (the new cabinets and their price), `tail` after the room's sizes */
    fun attach(scan: SavedScan, pictures: List<Pair<Bitmap, String>>, lead: List<String> = emptyList(), tail: List<String> = emptyList()) {
        basket.items.filter { it.kind == Attachment.Kind.Scan }.forEach { File(dir, it.file).delete() }
        val kept = basket.items.filter { it.kind != Attachment.Kind.Scan }
        val pics = pictures.mapNotNull { (img, title) ->
            val name = "scan-${UUID.randomUUID()}.jpg"
            val data = img.scaledJpeg(1800, 80) ?: return@mapNotNull null
            File(dir, name).writeBytes(data)
            Attachment(kind = Attachment.Kind.Scan, title = title, file = name)
        }
        // Typed sizes are only what was typed: no made-up floor area or ceiling
        val lines = lead + (scan.typed?.let { listOf(it) } ?: scan.room.summaryLines(unit)) + tail
        updateBasket(basket.copy(items = kept + pics, scanID = scan.id, room = scan.room, roomLines = lines))
        say("Your new kitchen is in your project")
    }

    fun keep(room: ScannedRoom, typed: String? = null, picked: Set<Int>? = null): SavedScan {
        val s = SavedScan(newReference(), room, System.currentTimeMillis(), typed = typed, picked = picked?.sorted())
        scans = (listOf(s) + scans).take(5)
        write("scans.json", scans)
        return s
    }

    fun scan(id: String): SavedScan? {
        if (id == "sample") return SavedScan("GC-SAMPLE", Library.sampleRoom, System.currentTimeMillis(), sample = true)
        return scans.firstOrNull { it.id == id }
    }

    // Picks

    fun isPicked(line: String) = line in basket.picks

    /** "Add to quote": keeps the choice with the request, without leaving the page. */
    fun togglePick(line: String) {
        if (line in basket.picks) {
            updateBasket(basket.copy(picks = basket.picks - line))
            say("Removed from your quote")
        } else {
            updateBasket(basket.copy(picks = basket.picks + line))
            say("Added to your quote")
        }
    }

    fun removePick(line: String) = updateBasket(basket.copy(picks = basket.picks - line))
    fun removeLength(id: String) = updateBasket(basket.copy(lengths = basket.lengths.filter { it.id != id }))
    fun renameLength(id: String, name: String) = updateBasket(basket.copy(lengths = basket.lengths.map { if (it.id == id) it.copy(name = name) else it }))
    fun removeRoom() = updateBasket(basket.copy(room = null, scanID = null, roomLines = emptyList(), items = basket.items.filter { it.kind != Attachment.Kind.Scan }))

    /** After a successful send: keep a copy for the design board, start a fresh project. */
    fun sent() {
        sentBasket = basket
        write("sent.json", basket)
        lastSent = System.currentTimeMillis()
        prefs.edit().putLong("lastSent", lastSent ?: 0).apply()
        updateBasket(ProjectBasket())
    }

    fun say(text: String) {
        toast = text
        toastJob?.cancel()
        toastJob = scope.launch {
            delay(3000)
            if (toast == text) toast = null
        }
    }

    fun dismissToast() { toast = null }

    fun openBoard() { showBoard = true }

    fun designKitchen() {
        tab = AppTab.Plan
        planRoute = "sizes"
    }

    companion object {
        /** Short, readable reference that ties a picture to what the office received. */
        fun newReference(): String {
            val a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
            return "GC-" + (0 until 6).map { a.random() }.joinToString("")
        }
    }
}

/** At most `maxSide` pixels on the long side, as a JPEG. */
fun Bitmap.scaledJpeg(maxSide: Int, quality: Int): ByteArray? {
    val k = maxSide.toFloat() / max(width, height)
    val img = if (k < 1f) Bitmap.createScaledBitmap(this, (width * k).roundToInt(), (height * k).roundToInt(), true) else this
    return ByteArrayOutputStream().use { out ->
        if (img.compress(Bitmap.CompressFormat.JPEG, quality, out)) out.toByteArray() else null
    }
}

fun loadBitmap(file: File, maxSide: Int = 1200): Bitmap? {
    val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeFile(file.path, o)
    var sample = 1
    while (max(o.outWidth, o.outHeight) / sample > maxSide * 2) sample *= 2
    return BitmapFactory.decodeFile(file.path, BitmapFactory.Options().apply { inSampleSize = sample })
}
