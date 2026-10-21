import SwiftUI
import PhotosUI

/// The request: what the project is, everything made with the tools, and how
/// to reach the person. One button sends it all to the office.
struct QuoteView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @AppStorage("contact.name") private var name = ""
    @AppStorage("contact.email") private var email = ""
    @AppStorage("contact.phone") private var phone = ""
    @State private var projectType = "Kitchen"
    @State private var door = "Not sure yet"
    @AppStorage("contact.role") private var role = "Homeowner"
    @State private var timing = "In 1 to 3 months"
    @State private var place = ""
    @State private var notes = ""
    @State private var photoPicks: [PhotosPickerItem] = []
    @State private var sending = false
    @State private var error: String?
    @State private var showErrors = false
    @State private var sentRef: String?
    @State private var openedAt = Date()
    @State private var viewing: PictureSet?
    @FocusState private var focus: Field?

    private enum Field { case place, notes, name, email, phone }
    private static let types = ["Kitchen", "Bathroom vanity", "Closet", "Built-ins", "Commercial millwork", "Something else"]
    private static let doors = ["Not sure yet"] + DoorStyle.allCases.map(\.rawValue)
    /// The three kinds of client on greencabinetsny.com
    private static let roles = ["Homeowner", "Designer or architect", "Building or business"]
    private static let timings = ["As soon as possible", "In 1 to 3 months", "In 3 to 6 months", "Just planning"]
    /// The office's message limit, with room for the project lines
    private static let noteLimit = 800

    private var nameError: String? { name.trimmingCharacters(in: .whitespaces).count < 2 ? "Add your name so we know who to reply to." : nil }
    private var emailError: String? {
        let e = email.trimmingCharacters(in: .whitespaces)
        return e.range(of: #"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$"#, options: .regularExpression) == nil ? "Add an email like name@example.com." : nil
    }
    private var phoneError: String? {
        let digits = phone.filter(\.isNumber)
        return !phone.isEmpty && digits.count < 10 ? "Add the full number with area code, or leave it empty." : nil
    }

    var body: some View {
        NavigationStack {
            Group {
                if let sentRef { sent(sentRef) } else { form }
            }
            .background(Brand.ink)
            .navigationTitle("Quote")
        }
        .onAppear { openedAt = Date() }
        // Something added after a send starts the next request
        .onChange(of: model.basket.count) { old, new in if new > old { sentRef = nil } }
    }

    // MARK: Form

    private var form: some View {
        @Bindable var model = model
        return Form {
            Section {
                Text("Tell us about the room. We reply within 24 hours and book a free consultation at your home.")
                    .secondaryText()
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets(top: 0, leading: 4, bottom: 0, trailing: 4))
            }

            Section {
                Picker("Project", selection: $projectType) { ForEach(Self.types, id: \.self) { Text($0) } }
                Picker("Door style", selection: $door) { ForEach(Self.doors, id: \.self) { Text($0) } }
                Picker("Timing", selection: $timing) { ForEach(Self.timings, id: \.self) { Text($0) } }
                TextField("Neighborhood or building", text: $place)
                    .textContentType(.addressCity)
                    .submitLabel(.next)
                    .focused($focus, equals: .place)
                    .onSubmit { focus = .notes }
                TextField("Anything we should know (optional)", text: $notes, axis: .vertical)
                    .lineLimit(3...8)
                    .focused($focus, equals: .notes)
                    .onChange(of: notes) { _, v in
                        if v.count > Self.noteLimit { notes = String(v.prefix(Self.noteLimit)) }
                    }
            } header: {
                Text("Your project")
            } footer: {
                if notes.count > Self.noteLimit - 100 {
                    Text("\(Self.noteLimit - notes.count) characters left").monospacedDigit()
                }
            }
            .listRowBackground(Brand.surface)

            attachments

            Section {
                Picker("I'm a", selection: $role) { ForEach(Self.roles, id: \.self) { Text($0) } }
                field("Your name", text: $name, error: nameError, content: .name, keyboard: .default, f: .name, next: .email)
                    .textInputAutocapitalization(.words)
                field("Email", text: $email, error: emailError, content: .emailAddress, keyboard: .emailAddress, f: .email, next: .phone)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                field("Phone (optional)", text: $phone, error: phoneError, content: .telephoneNumber, keyboard: .phonePad, f: .phone, next: nil)
            } header: {
                Text("How to reach you")
            } footer: {
                Text("Only used to reply about your project.")
            }
            .listRowBackground(Brand.surface)

            Section {
                Button(action: send) {
                    HStack(spacing: Space.s) {
                        if sending { ProgressView().tint(Brand.ink) }
                        Text(sending ? "Sending…" : "Send to Green Cabinets").font(.body.weight(.semibold))
                    }
                    .frame(maxWidth: .infinity, minHeight: 34)
                }
                .primaryActionStyle()
                .disabled(sending)
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())
                if let error {
                    Label(error, systemImage: "exclamationmark.triangle")
                        .font(.footnote)
                        .foregroundStyle(Brand.error)
                        .listRowBackground(Color.clear)
                        .accessibilityAddTraits(.isStaticText)
                }
            }

            Section("Rather talk?") {
                Button { model.textUs() } label: { Label("Text us", systemImage: "message") }
                Button { EmailUs.open() } label: { Label("Email us", systemImage: "envelope") }
            }
            .listRowBackground(Brand.surface)
        }
        .scrollContentBackground(.hidden)
        .scrollDismissesKeyboard(.interactively)
        .debugScroll()
        .toolbar {
            // The phone keypad has no return key
            ToolbarItemGroup(placement: .keyboard) {
                Spacer()
                Button("Done") { focus = nil }.fontWeight(.semibold)
            }
        }
        .onChange(of: photoPicks) { _, picks in load(picks) }
        .fullScreenCover(item: $viewing) { PictureViewer(set: $0) }
    }

    private func field(_ title: String, text: Binding<String>, error: String?, content: UITextContentType, keyboard: UIKeyboardType, f: Field, next: Field?) -> some View {
        VStack(alignment: .leading, spacing: Space.xs) {
            TextField(title, text: text)
                .textContentType(content)
                .keyboardType(keyboard)
                .submitLabel(next == nil ? .done : .next)
                .focused($focus, equals: f)
                .onSubmit { focus = next }
                .frame(minHeight: 32)
            if showErrors, let error {
                Text(error).font(.footnote).foregroundStyle(Brand.error)
            }
        }
        .accessibilityElement(children: .combine)
    }

    // MARK: Attachments

    @ViewBuilder
    private var attachments: some View {
        @Bindable var model = model
        Section {
            ForEach(model.basket.picks, id: \.self) { line in
                Label(line, systemImage: "swatchpalette")
                    .font(.subheadline)
                    .foregroundStyle(Brand.ivory)
            }
            .onDelete { model.basket.picks.remove(atOffsets: $0) }
            if !model.basket.items.isEmpty {
                ScrollView(.horizontal) {
                    HStack(spacing: Space.m) {
                        ForEach(model.basket.items) { a in
                            Thumb(attachment: a, open: {
                                let items = model.basket.items
                                let imgs = items.compactMap { UIImage(data: $0.jpeg) }
                                if let i = items.firstIndex(where: { $0.id == a.id }), imgs.count == items.count {
                                    viewing = PictureSet(images: imgs, titles: items.map(\.title), index: i)
                                }
                            }) {
                                withAnimation(Motion.ui(reduceMotion)) {
                                    model.basket.items.removeAll { $0.id == a.id }
                                    if !model.basket.items.contains(where: { $0.kind == .scan }) {
                                        model.basket.room = nil
                                        model.basket.roomLines = []
                                        model.basket.scanID = nil
                                    }
                                }
                            }
                        }
                    }
                    .padding(.vertical, Space.xs)
                }
                .scrollIndicators(.hidden)
            }
            if model.basket.room != nil {
                Label("Room scan \(model.basket.scanID ?? "") with all its measurements", systemImage: "cube.transparent")
                    .font(.subheadline)
                // The cabinets laid out on it, and their price
                ForEach(model.basket.roomLines.filter { $0.hasPrefix("New cabinets:") || $0.hasPrefix("Countertop:") }, id: \.self) { line in
                    Label(line, systemImage: "cabinet")
                        .font(.subheadline)
                        .foregroundStyle(Brand.ivory)
                }
            }
            ForEach($model.basket.lengths) { $l in
                HStack {
                    TextField("Name it (sink wall, window...)", text: $l.name)
                        .font(.subheadline)
                    Text(model.unit.forText.length(l.meters))
                        .font(.subheadline.weight(.semibold))
                        .monospacedDigit()
                        .foregroundStyle(Brand.ivory)
                }
            }
            .onDelete { model.basket.lengths.remove(atOffsets: $0) }

            PhotosPicker(selection: $photoPicks, maxSelectionCount: 6, matching: .images) {
                Label("Add photos of the room", systemImage: "photo.on.rectangle")
            }
            Button { model.openDrawings() } label: { Label("Scan a drawing", systemImage: "doc.viewfinder") }
                .disabled(!Tools.docScanSupported)
            Button { model.tab = .plan } label: { Label("Measure, scan or try cabinets in AR", systemImage: "ruler") }
            if model.basket.picks.isEmpty {
                Button { model.tab = .materials } label: { Label("Pick finishes you like", systemImage: "swatchpalette") }
            }
            if !model.basket.isEmpty {
                Button { model.openBoard() } label: { Label("See it all on your design board", systemImage: "rectangle.on.rectangle") }
            }
        } header: {
            Text("Attached")
        } footer: {
            Text(model.basket.items.count > 10
                 ? "The first 10 pictures go with your request."
                 : "Pictures, lengths, scans and finishes help us price it right the first time.")
        }
        .listRowBackground(Brand.surface)
    }

    private func load(_ picks: [PhotosPickerItem]) {
        guard !picks.isEmpty else { return }
        Task {
            var images: [UIImage] = []
            for p in picks {
                if let d = try? await p.loadTransferable(type: Data.self), let img = UIImage(data: d) { images.append(img) }
            }
            await MainActor.run {
                model.add(images: images, kind: .photo, title: "Photo")
                photoPicks = []
            }
        }
    }

    // MARK: Sending

    private func send() {
        showErrors = true
        guard nameError == nil, emailError == nil, phoneError == nil else {
            focus = nameError != nil ? .name : (emailError != nil ? .email : .phone)
            Haptics.warning()
            error = "Check the highlighted details above."
            return
        }
        error = nil
        sending = true
        focus = nil
        var details = ["Client: \(role)", "Door style: \(door)", "Timing: \(timing)"]
        if !place.trimmingCharacters(in: .whitespaces).isEmpty { details.append("Where: \(place)") }
        let req = Sender.Request(name: name.trimmingCharacters(in: .whitespaces), email: email.trimmingCharacters(in: .whitespaces),
                                 phone: phone, projectType: projectType, details: details,
                                 note: notes.trimmingCharacters(in: .whitespacesAndNewlines), basket: model.basket,
                                 unit: model.unit, elapsed: Date().timeIntervalSince(openedAt))
        Task {
            do {
                let ref = try await Sender.send(req)
                await MainActor.run {
                    sending = false
                    Haptics.success()
                    model.sentBasket = model.basket
                    model.basket = ProjectBasket()
                    model.lastSent = .now
                    notes = ""
                    place = ""
                    showErrors = false
                    withAnimation(Motion.ui(reduceMotion)) { sentRef = ref }
                }
            } catch {
                await MainActor.run {
                    sending = false
                    Haptics.warning()
                    self.error = (error as? LocalizedError)?.errorDescription ?? "That didn't go through. Check your connection and try again."
                }
            }
        }
    }

    private func sent(_ ref: String) -> some View {
        ScrollView {
        VStack(alignment: .leading, spacing: Space.l) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 56))
                .foregroundStyle(Brand.brass)
                .symbolEffect(.bounce, value: ref)
                .accessibilityHidden(true)
            Text("It's with us.").heroTitle()
            Text("Reference \(ref).").font(.subheadline.monospaced()).foregroundStyle(Brand.stone)
            VStack(alignment: .leading, spacing: Space.l) {
                Text("What happens next").eyebrow()
                NextStep(n: 1, title: "We reply within 24 hours", text: "By email or text, to book a time that suits you.")
                NextStep(n: 2, title: "We come to you", text: "A free visit with door and finish samples. We measure every wall.")
                NextStep(n: 3, title: "You approve the drawing", text: "Nothing is cut until you do. We handle the building paperwork.")
            }
            .card()
            Button { withAnimation(Motion.ui(reduceMotion)) { sentRef = nil; openedAt = Date() } } label: {
                ActionLabel(title: "Start another request")
            }
            .secondaryActionStyle()
            Spacer(minLength: 0)
        }
        .padding(Space.gutter)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .contain)
        }
        .scrollIndicators(.hidden)
    }
}

/// A numbered step in "What happens next".
private struct NextStep: View {
    let n: Int
    let title: String
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: Space.m) {
            Text("\(n)")
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Brand.ink)
                .frame(width: 28, height: 28)
                .background(Brand.brass, in: Circle())
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.headline).foregroundStyle(Brand.ivory)
                Text(text).secondaryText().fixedSize(horizontal: false, vertical: true)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Step \(n). \(title). \(text)")
    }
}

/// One attached picture with a remove button.
private struct Thumb: View {
    let attachment: Attachment
    let open: () -> Void
    let remove: () -> Void

    var body: some View {
        ZStack(alignment: .topTrailing) {
            if let img = UIImage(data: attachment.jpeg) {
                Image(uiImage: img).resizable().scaledToFill()
                    .frame(width: 96, height: 96)
                    .clipShape(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous))
                    .contentShape(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous))
                    .onTapGesture(perform: open)
                    .accessibilityAddTraits(.isButton)
                    .accessibilityHint("Opens it full screen, to save, print or share")
                    // Long-press to see it large
                    .contextMenu {
                        Button(action: open) { Label("Open", systemImage: "arrow.up.left.and.arrow.down.right") }
                        ShareLink(item: Image(uiImage: img), preview: SharePreview(attachment.title, image: Image(uiImage: img)))
                        Button(role: .destructive, action: remove) { Label("Remove", systemImage: "trash") }
                    } preview: {
                        Image(uiImage: img).resizable().aspectRatio(contentMode: .fit).frame(width: 340)
                    }
                    .accessibilityLabel(attachment.title)
            }
            Button(action: remove) {
                Image(systemName: "xmark")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Brand.ivory)
                    .frame(width: 26, height: 26)
                    .background(.black.opacity(0.7), in: Circle())
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .offset(x: 10, y: -10)
            .accessibilityLabel("Remove \(attachment.title)")
        }
        .padding(.top, 10)
        .padding(.trailing, 10)
    }
}
