package com.greencabinetsny.app.screens

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.SystemClock
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Message
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.DocumentScanner
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Kitchen
import androidx.compose.material.icons.outlined.Palette
import androidx.compose.material.icons.outlined.PhotoLibrary
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material.icons.outlined.Straighten
import androidx.compose.material.icons.outlined.ViewInAr
import androidx.compose.material.icons.outlined.WarningAmber
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.greencabinetsny.app.LocalModel
import com.greencabinetsny.app.Tools
import com.greencabinetsny.app.model.AppTab
import com.greencabinetsny.app.model.Attachment
import com.greencabinetsny.app.model.DoorStyle
import com.greencabinetsny.app.model.Sender
import com.greencabinetsny.app.model.loadBitmap
import com.greencabinetsny.app.ui.ActionButton
import com.greencabinetsny.app.ui.ActionKind
import com.greencabinetsny.app.ui.Brand
import com.greencabinetsny.app.ui.Hairline
import com.greencabinetsny.app.ui.Radius
import com.greencabinetsny.app.ui.ScreenTitle
import com.greencabinetsny.app.ui.Space
import com.greencabinetsny.app.ui.Type
import com.greencabinetsny.app.ui.card
import com.greencabinetsny.app.ui.page
import com.greencabinetsny.app.ui.pressable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

private val TYPES = listOf("Kitchen", "Bathroom vanity", "Closet", "Built-ins", "Commercial millwork", "Something else")
private val DOORS = listOf("Not sure yet") + DoorStyle.entries.map { it.label }
/** The three kinds of client on greencabinetsny.com */
private val ROLES = listOf("Homeowner", "Designer or architect", "Building or business")
private val TIMINGS = listOf("As soon as possible", "In 1 to 3 months", "In 3 to 6 months", "Just planning")
/** The office's message limit, with room for the project lines */
private const val NOTE_LIMIT = 800

/**
 * The request: what the project is, everything made with the tools, and how
 * to reach the person. One button sends it all to the office.
 */
@Composable
fun QuoteScreen() {
    val model = LocalModel.current
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("contact", Context.MODE_PRIVATE) }
    var sentRef by rememberSaveable { mutableStateOf<String?>(null) }
    // Something added after a send starts the next request
    LaunchedEffect(model.basket.count) { if (model.basket.count > 0) sentRef = null }
    AnimatedContent(sentRef, transitionSpec = { fadeIn(tween(220)) togetherWith fadeOut(tween(150)) }, label = "quote") { ref ->
        if (ref != null) Sent(ref) { sentRef = null } else QuoteForm(prefs) { sentRef = it }
    }
}

@Composable
private fun QuoteForm(prefs: android.content.SharedPreferences, onSent: (String) -> Unit) {
    val model = LocalModel.current
    val context = LocalContext.current
    val haptics = LocalHapticFeedback.current
    val focus = LocalFocusManager.current
    val scope = rememberCoroutineScope()
    val wide = LocalConfiguration.current.screenWidthDp >= 600

    var name by rememberSaveable { mutableStateOf(prefs.getString("name", "") ?: "") }
    var email by rememberSaveable { mutableStateOf(prefs.getString("email", "") ?: "") }
    var phone by rememberSaveable { mutableStateOf(prefs.getString("phone", "") ?: "") }
    var role by rememberSaveable { mutableStateOf(prefs.getString("role", ROLES[0]) ?: ROLES[0]) }
    var project by rememberSaveable { mutableStateOf("Kitchen") }
    var door by rememberSaveable { mutableStateOf("Not sure yet") }
    var timing by rememberSaveable { mutableStateOf("In 1 to 3 months") }
    var place by rememberSaveable { mutableStateOf("") }
    var notes by rememberSaveable { mutableStateOf("") }
    var sending by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var showErrors by remember { mutableStateOf(false) }
    val openedAt = remember { mutableLongStateOf(SystemClock.elapsedRealtime()) }
    var viewing by remember { mutableStateOf<Int?>(null) }
    val scanDrawing = rememberDrawingScanner()
    val nameFocus = remember { FocusRequester() }
    val emailFocus = remember { FocusRequester() }
    val phoneFocus = remember { FocusRequester() }

    val nameError = if (name.trim().length < 2) "Add your name so we know who to reply to." else null
    val emailError = if (!Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]{2,}$").matches(email.trim())) "Add an email like name@example.com." else null
    val phoneError = if (phone.isNotEmpty() && phone.count { it.isDigit() } < 10) "Add the full number with area code, or leave it empty." else null

    val pickPhotos = rememberLauncherForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(6)) { uris ->
        if (uris.isEmpty()) return@rememberLauncherForActivityResult
        scope.launch {
            val images = withContext(Dispatchers.IO) {
                uris.mapNotNull { u -> runCatching { context.contentResolver.openInputStream(u)?.use { BitmapFactory.decodeStream(it) } }.getOrNull() }
            }
            model.add(images, Attachment.Kind.Photo, "Photo")
        }
    }

    fun send() {
        showErrors = true
        if (nameError != null || emailError != null || phoneError != null) {
            (if (nameError != null) nameFocus else if (emailError != null) emailFocus else phoneFocus).requestFocus()
            haptics.performHapticFeedback(HapticFeedbackType.Reject)
            error = "Check the highlighted details above."
            return
        }
        prefs.edit().putString("name", name).putString("email", email).putString("phone", phone).putString("role", role).apply()
        error = null
        sending = true
        focus.clearFocus()
        val details = mutableListOf("Client: $role", "Door style: $door", "Timing: $timing")
        if (place.isNotBlank()) details += "Where: ${place.trim()}"
        val req = Sender.Request(
            name.trim(), email.trim(), phone, project, details, notes.trim(), model.basket, model.unit,
            (SystemClock.elapsedRealtime() - openedAt.longValue) / 1000.0,
            if (wide) "Android tablet" else "Android phone",
        )
        scope.launch {
            try {
                val ref = Sender.send(req) { model.file(it) }
                sending = false
                haptics.performHapticFeedback(HapticFeedbackType.Confirm)
                model.sent()
                notes = ""; place = ""; showErrors = false
                onSent(ref)
            } catch (e: Exception) {
                sending = false
                haptics.performHapticFeedback(HapticFeedbackType.Reject)
                error = e.message ?: "That didn't go through. Check your connection and try again."
            }
        }
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).windowInsetsPadding(WindowInsets.ime).padding(bottom = Space.section)) {
        Column(Modifier.page(), verticalArrangement = Arrangement.spacedBy(Space.l)) {
            ScreenTitle("Quote", "Tell us about the room. We reply within 24 hours and book a free consultation at your home.")

            Group("Your project") {
                PickerRow("Project", TYPES, project) { project = it }
                Hairline()
                PickerRow("Door style", DOORS, door) { door = it }
                Hairline()
                PickerRow("Timing", TIMINGS, timing) { timing = it }
                Hairline()
                Field("Neighborhood or building", place, { place = it }, ime = ImeAction.Next, caps = KeyboardCapitalization.Words)
                Hairline()
                Field("Anything we should know (optional)", notes, { notes = it.take(NOTE_LIMIT) }, single = false)
            }
            if (notes.length > NOTE_LIMIT - 100) Text("${NOTE_LIMIT - notes.length} characters left", style = Type.footnote)

            Attached(onPhotos = { pickPhotos.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                onScan = scanDrawing, onView = { viewing = it })

            Group("How to reach you", footer = "Only used to reply about your project.") {
                PickerRow("I'm a", ROLES, role) { role = it }
                Hairline()
                Field("Your name", name, { name = it }, error = if (showErrors) nameError else null, ime = ImeAction.Next,
                    caps = KeyboardCapitalization.Words, focus = nameFocus, next = { emailFocus.requestFocus() })
                Hairline()
                Field("Email", email, { email = it }, error = if (showErrors) emailError else null, type = KeyboardType.Email,
                    ime = ImeAction.Next, focus = emailFocus, next = { phoneFocus.requestFocus() })
                Hairline()
                Field("Phone (optional)", phone, { phone = it }, error = if (showErrors) phoneError else null, type = KeyboardType.Phone,
                    ime = ImeAction.Done, focus = phoneFocus, next = { focus.clearFocus() })
            }

            Row(
                Modifier.fillMaxWidth().heightIn(min = 56.dp).clip(RoundedCornerShape(50)).background(Brand.brass.copy(alpha = if (sending) 0.6f else 1f))
                    .then(if (sending) Modifier else Modifier.pressable { send() }),
                horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically,
            ) {
                if (sending) {
                    CircularProgressIndicator(color = Brand.ink, strokeWidth = 2.dp, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.size(Space.s))
                }
                Text(if (sending) "Sending…" else "Send to Green Cabinets", color = Brand.ink, fontSize = 17.sp, fontWeight = FontWeight.SemiBold)
            }
            error?.let { e ->
                Row(horizontalArrangement = Arrangement.spacedBy(Space.s)) {
                    Icon(Icons.Outlined.WarningAmber, null, tint = Brand.error, modifier = Modifier.size(18.dp))
                    Text(e, color = Brand.error, fontSize = 13.sp)
                }
            }

            Group("Rather talk?") {
                LinkRow(Icons.AutoMirrored.Outlined.Message, "Text us") { Tools.textUs(context) }
                Hairline()
                LinkRow(Icons.Outlined.Email, "Email us") { Tools.emailUs(context) }
            }
        }
    }

    viewing?.let { start -> PictureViewer(model.basket.items, start) { viewing = null } }
}

@Composable
private fun Group(title: String, footer: String? = null, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(Space.s)) {
        Text(title, color = Brand.stone, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(start = Space.l))
        Column(Modifier.fillMaxWidth().card(padding = 0.dp).padding(horizontal = Space.l)) { content() }
        if (footer != null) Text(footer, style = Type.footnote, modifier = Modifier.padding(start = Space.l))
    }
}

@Composable
private fun PickerRow(title: String, options: List<String>, value: String, onPick: (String) -> Unit) {
    var open by remember { mutableStateOf(false) }
    Box {
        Row(
            Modifier.fillMaxWidth().heightIn(min = 52.dp).pressable(0.99f) { open = true }.semantics(mergeDescendants = true) {},
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(title, style = Type.subhead.copy(fontSize = 17.sp), modifier = Modifier.weight(1f))
            Text(value, color = Brand.brass, fontSize = 17.sp)
            Icon(Icons.Default.KeyboardArrowDown, null, tint = Brand.brass, modifier = Modifier.size(20.dp))
        }
        DropdownMenu(open, onDismissRequest = { open = false }, containerColor = Brand.raised) {
            options.forEach { o ->
                DropdownMenuItem(text = { Text(o, fontWeight = if (o == value) FontWeight.SemiBold else FontWeight.Normal) }, onClick = { open = false; onPick(o) })
            }
        }
    }
}

@Composable
private fun Field(
    label: String, value: String, onChange: (String) -> Unit,
    error: String? = null, single: Boolean = true, type: KeyboardType = KeyboardType.Text, ime: ImeAction = ImeAction.Default,
    caps: KeyboardCapitalization = KeyboardCapitalization.Sentences, focus: FocusRequester? = null, next: (() -> Unit)? = null,
) {
    Column {
        TextField(
            value, onChange,
            placeholder = { Text(label, color = Brand.stone.copy(alpha = 0.8f), fontSize = 17.sp) },
            singleLine = single,
            minLines = if (single) 1 else 3,
            maxLines = if (single) 1 else 8,
            textStyle = Type.subhead.copy(fontSize = 17.sp),
            keyboardOptions = KeyboardOptions(capitalization = caps, keyboardType = type, imeAction = ime, autoCorrectEnabled = type == KeyboardType.Text),
            keyboardActions = KeyboardActions(onNext = { next?.invoke() }, onDone = { next?.invoke() }),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent, unfocusedContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent, unfocusedIndicatorColor = Color.Transparent,
                cursorColor = Brand.brass, focusedTextColor = Brand.ivory, unfocusedTextColor = Brand.ivory,
            ),
            modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).offset(x = (-16).dp).then(if (focus != null) Modifier.focusRequester(focus) else Modifier)
                .semantics { if (error != null) contentDescription = "$label. $error" },
        )
        if (error != null) Text(error, color = Brand.error, fontSize = 13.sp, modifier = Modifier.padding(bottom = Space.s))
    }
}

@Composable
private fun LinkRow(icon: ImageVector, title: String, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().heightIn(min = 52.dp).pressable(0.99f, onClick = onClick), verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Space.m)) {
        Icon(icon, null, tint = Brand.brass, modifier = Modifier.size(22.dp))
        Text(title, color = Brand.brass, fontSize = 17.sp)
    }
}

/** Everything made with the tools: picks, pictures, the kitchen plan, lengths, and ways to add more. */
@Composable
private fun Attached(onPhotos: () -> Unit, onScan: () -> Unit, onView: (Int) -> Unit) {
    val model = LocalModel.current
    val b = model.basket
    Group("Attached", footer = if (b.items.size > 10) "The first 10 pictures go with your request." else "Pictures, lengths, plans and finishes help us price it right the first time.") {
        b.picks.forEach { line ->
            Row(Modifier.fillMaxWidth().heightIn(min = 48.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                Icon(Icons.Outlined.Palette, null, tint = Brand.ivory, modifier = Modifier.size(20.dp))
                Text(line, style = Type.subhead, modifier = Modifier.weight(1f))
                IconButton(onClick = { model.removePick(line) }, modifier = Modifier.semantics { contentDescription = "Remove $line" }) {
                    Icon(Icons.Default.Close, null, tint = Brand.stone, modifier = Modifier.size(18.dp))
                }
            }
            Hairline()
        }
        if (b.items.isNotEmpty()) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(Space.m), modifier = Modifier.padding(vertical = Space.m)) {
                items(b.items, key = { it.id }) { a -> Thumb(a, { onView(b.items.indexOf(a)) }) {
                    model.removeItem(a)
                    if (model.basket.items.none { it.kind == Attachment.Kind.Scan } && model.basket.room != null) model.removeRoom()
                } }
            }
            Hairline()
        }
        if (b.room != null) {
            Row(Modifier.fillMaxWidth().heightIn(min = 48.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                Icon(Icons.Outlined.ViewInAr, null, tint = Brand.ivory, modifier = Modifier.size(20.dp))
                Text("Kitchen plan ${b.scanID ?: ""} with all its measurements", style = Type.subhead)
            }
            // The cabinets laid out on it, and their price
            b.roomLines.filter { it.startsWith("New cabinets:") || it.startsWith("Countertop:") }.forEach { line ->
                Row(Modifier.fillMaxWidth().padding(bottom = Space.s), horizontalArrangement = Arrangement.spacedBy(Space.m)) {
                    Icon(Icons.Outlined.Kitchen, null, tint = Brand.ivory, modifier = Modifier.size(20.dp))
                    Text(line, style = Type.subhead)
                }
            }
            Hairline()
        }
        b.lengths.forEach { l ->
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.weight(1f)) {
                    Field("Name it (sink wall, window...)", l.name, { model.renameLength(l.id, it) })
                }
                Text(model.unit.forText.length(l.meters), color = Brand.ivory, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                IconButton(onClick = { model.removeLength(l.id) }, modifier = Modifier.semantics { contentDescription = "Remove this length" }) {
                    Icon(Icons.Default.Close, null, tint = Brand.stone, modifier = Modifier.size(18.dp))
                }
            }
            Hairline()
        }
        LinkRow(Icons.Outlined.PhotoLibrary, "Add photos of the room", onPhotos)
        Hairline()
        LinkRow(Icons.Outlined.DocumentScanner, "Scan a drawing", onScan)
        Hairline()
        LinkRow(Icons.Outlined.Straighten, "Measure or try cabinets in AR") { model.tab = AppTab.Plan }
        if (b.picks.isEmpty()) {
            Hairline()
            LinkRow(Icons.Outlined.Palette, "Pick finishes you like") { model.tab = AppTab.Materials }
        }
        if (!b.isEmpty) {
            Hairline()
            LinkRow(Icons.Outlined.Dashboard, "See it all on your design board") { model.openBoard() }
        }
    }
}

/** One attached picture with a remove button. */
@Composable
private fun Thumb(a: Attachment, open: () -> Unit, remove: () -> Unit) {
    val model = LocalModel.current
    var img by remember(a.id) { mutableStateOf<Bitmap?>(null) }
    LaunchedEffect(a.id) { img = withContext(Dispatchers.IO) { loadBitmap(model.file(a), 300) } }
    Box(Modifier.padding(top = 10.dp, end = 10.dp)) {
        Box(Modifier.size(96.dp).clip(RoundedCornerShape(Radius.chip)).background(Brand.raised).pressable(label = "Opens it full screen, to save, print or share", onClick = open)
            .semantics { contentDescription = a.title }) {
            img?.let { Image(it.asImageBitmap(), null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize()) }
        }
        Box(
            Modifier.align(Alignment.TopEnd).offset(x = 10.dp, y = (-10).dp).size(44.dp).pressable(label = "Remove ${a.title}", onClick = remove),
            contentAlignment = Alignment.Center,
        ) {
            Box(Modifier.size(26.dp).clip(CircleShape).background(Color.Black.copy(alpha = 0.7f)), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.Close, null, tint = Brand.ivory, modifier = Modifier.size(14.dp))
            }
        }
    }
}

/** Pictures full screen: swipe between them, and save, print or share. */
@Composable
fun PictureViewer(items: List<Attachment>, start: Int, onClose: () -> Unit) {
    val model = LocalModel.current
    val context = LocalContext.current
    val pager = rememberPagerState(initialPage = start.coerceIn(0, (items.size - 1).coerceAtLeast(0))) { items.size }
    Dialog(onClose, DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false)) {
        Box(Modifier.fillMaxSize().background(Color.Black)) {
            HorizontalPager(pager, Modifier.fillMaxSize()) { i ->
                var img by remember(i) { mutableStateOf<Bitmap?>(null) }
                LaunchedEffect(i) { img = withContext(Dispatchers.IO) { loadBitmap(model.file(items[i]), 2000) } }
                img?.let { Image(it.asImageBitmap(), items[i].title, contentScale = ContentScale.Fit, modifier = Modifier.fillMaxSize()) }
            }
            Row(Modifier.fillMaxWidth().windowInsetsPadding(WindowInsets(0)).padding(top = 40.dp, start = Space.s, end = Space.s), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onClose) { Icon(Icons.Default.Close, "Close", tint = Brand.ivory) }
                Text(items.getOrNull(pager.currentPage)?.title ?: "", style = Type.bar, modifier = Modifier.weight(1f))
                IconButton(onClick = {
                    items.getOrNull(pager.currentPage)?.let { a -> loadBitmap(model.file(a), 2400)?.let { Tools.share(context, listOf(it)) } }
                }) { Icon(Icons.Outlined.Share, "Save, print or share", tint = Brand.ivory) }
            }
            Text("${pager.currentPage + 1} of ${items.size}", style = Type.footnote,
                modifier = Modifier.align(Alignment.BottomCenter).windowInsetsPadding(WindowInsets.navigationBars).padding(Space.l))
        }
    }
}

@Composable
private fun Sent(ref: String, onAnother: () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Column(Modifier.page().padding(top = Space.section), verticalArrangement = Arrangement.spacedBy(Space.l)) {
            Spacer(Modifier.statusBarsPadding())
            Icon(Icons.Filled.CheckCircle, null, tint = Brand.brass, modifier = Modifier.size(56.dp))
            Text("It's with us.", style = Type.hero)
            Text("Reference $ref.", style = Type.secondary.copy(fontFamily = FontFamily.Monospace))
            Column(Modifier.fillMaxWidth().card(), verticalArrangement = Arrangement.spacedBy(Space.l)) {
                Text("WHAT HAPPENS NEXT", style = Type.eyebrow)
                NextStep(1, "We reply within 24 hours", "By email or text, to book a time that suits you.")
                NextStep(2, "We come to you", "A free visit with door and finish samples. We measure every wall.")
                NextStep(3, "You approve the drawing", "Nothing is cut until you do. We handle the building paperwork.")
            }
            ActionButton("Start another request", Modifier.fillMaxWidth(), kind = ActionKind.Secondary, onClick = onAnother)
        }
    }
}

@Composable
private fun NextStep(n: Int, title: String, text: String) {
    Row(horizontalArrangement = Arrangement.spacedBy(Space.m), modifier = Modifier.semantics(mergeDescendants = true) { contentDescription = "Step $n. $title. $text" }) {
        Box(Modifier.size(28.dp).clip(CircleShape).background(Brand.brass), contentAlignment = Alignment.Center) {
            Text("$n", color = Brand.ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        }
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(title, style = Type.headline)
            Text(text, style = Type.secondary)
        }
    }
}
