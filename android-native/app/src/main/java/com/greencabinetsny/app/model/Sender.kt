package com.greencabinetsny.app.model

import android.util.Base64
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import kotlin.math.max

/**
 * Sends a request to the Green Cabinets office (orders@greencabinetsny.com)
 * through the same email functions the website and the iPhone app use. With
 * pictures or a room it goes as one email with attachments; text only goes as
 * a message.
 */
object Sender {
    private const val BASE = "https://cqkvrqkelzdctlloobos.supabase.co/functions/v1/"
    /** The public (publishable) key the website also ships; it only allows calling these functions. */
    private const val PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa3ZycWtlbHpkY3RsbG9vYm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNjc2NDUsImV4cCI6MjEwNjk0MzY0NX0.rM63zdRewZbq1Ix4XuJzEZBCUrvx6Tc_4GH8Dxud1pA"

    data class Request(
        val name: String,
        val email: String,
        val phone: String,
        val projectType: String,
        val details: List<String>,
        val note: String,
        val basket: ProjectBasket,
        val unit: LengthUnit,
        /** How long the form has been open, in seconds (the office's spam check wants a person's pace) */
        val elapsed: Double,
        /** "Android phone" or "Android tablet" */
        val device: String,
    )

    class Failure(message: String) : Exception(message)

    /** Sends and returns the reference shown to the person. */
    suspend fun send(r: Request, fileOf: (Attachment) -> File): String = withContext(Dispatchers.IO) {
        val ref = r.basket.scanID ?: AppModel.newReference()
        val guard = buildJsonObject { put("hp", ""); put("elapsedMs", (max(r.elapsed, 3.5) * 1000).toInt()) }
        val phone = r.phone.trim()

        if (r.basket.items.isEmpty() && r.basket.room == null) {
            val lines = (listOf("Project: ${r.projectType}") + r.details).toMutableList()
            if (r.basket.picks.isNotEmpty()) lines += listOf("", "Picked:") + r.basket.picks.map { "- $it" }
            lines += lengthLines(r)
            if (r.note.isNotEmpty()) lines += listOf("", r.note)
            // The office takes up to 1000 characters
            val message = "Sent from the Green Cabinets ${r.device} app\n\n" + lines.joinToString("\n")
            val body = buildJsonObject {
                put("name", r.name); put("email", r.email)
                put("message", message.take(1000))
                put("projectType", r.projectType.lowercase())
                put("spamGuard", guard)
                if (phone.length >= 10) put("phone", phone.take(20))
            }
            post("send-contact-form", body)
            return@withContext ref
        }

        // Pictures: the room's first, then the rest, at most 10 (the office's limit)
        val ordered = r.basket.items.filter { it.kind == Attachment.Kind.Scan } + r.basket.items.filter { it.kind != Attachment.Kind.Scan }
        val images = buildJsonArray {
            ordered.take(10).forEachIndexed { i, a ->
                val bytes = runCatching { fileOf(a).readBytes() }.getOrNull() ?: return@forEachIndexed
                val clean = a.title.replace(Regex("[^A-Za-z0-9 ._-]"), "").take(60)
                add(buildJsonObject {
                    put("name", "${i + 1} $clean $ref.jpg")
                    put("data", Base64.encodeToString(bytes, Base64.NO_WRAP))
                })
            }
        }
        // At most 20 lines: the lengths share lines so a long list can't push the room off
        val picks = packed(r.basket.picks).mapIndexed { i, s -> if (i == 0) "Picked: $s" else s }
        val summary = (listOf("Project: ${r.projectType}") + r.details + picks + packed(lengthLines(r)) + r.basket.roomLines)
            .take(20).map { it.take(600) }
        val body = buildJsonObject {
            put("kind", if (r.basket.room != null) "scan" else "quote")
            put("name", r.name); put("email", r.email)
            put("scanId", ref)
            put("summary", buildJsonArray { summary.forEach { add(JsonPrimitive(it)) } })
            put("images", images)
            put("spamGuard", guard)
            if (phone.isNotEmpty()) put("phone", phone.take(20))
            if (r.note.isNotEmpty()) put("note", r.note.take(1000))
            r.basket.room?.let { put("room", it.json) }
        }
        post("send-room-scan", body)
        ref
    }

    private fun lengthLines(r: Request): List<String> = r.basket.lengths.mapIndexed { i, l ->
        val name = l.name.trim()
        "${name.ifEmpty { "Length ${i + 1}" }}: ${r.unit.forText.length(l.meters)}"
    }

    /** Joins short lines into a few lines of at most 590 characters. */
    private fun packed(items: List<String>): List<String> {
        if (items.size <= 1) return items
        val out = mutableListOf<String>()
        var cur = ""
        for (i in items) {
            if (cur.isNotEmpty() && cur.length + i.length + 3 > 590) { out += cur; cur = "" }
            cur += if (cur.isEmpty()) i else " · $i"
        }
        if (cur.isNotEmpty()) out += cur
        return out
    }

    private fun post(fn: String, body: JsonObject) {
        val c = URL(BASE + fn).openConnection() as HttpURLConnection
        try {
            c.requestMethod = "POST"
            c.connectTimeout = 20_000
            c.readTimeout = 60_000
            c.doOutput = true
            c.setRequestProperty("Content-Type", "application/json")
            c.setRequestProperty("apikey", PUBLIC_KEY)
            c.setRequestProperty("Authorization", "Bearer $PUBLIC_KEY")
            c.outputStream.use { it.write(body.toString().toByteArray()) }
            val code = c.responseCode
            if (code !in 200..299) {
                val text = runCatching { c.errorStream?.bufferedReader()?.readText() }.getOrNull()
                val msg = runCatching { Library.json.parseToJsonElement(text ?: "").jsonObject["error"]?.jsonPrimitive?.content }.getOrNull()
                throw Failure(msg ?: "That didn't go through. Check your connection and try again.")
            }
        } catch (e: Failure) {
            throw e
        } catch (e: Exception) {
            throw Failure("That didn't go through. Check your connection and try again.")
        } finally {
            c.disconnect()
        }
    }
}
