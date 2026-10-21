import SwiftUI
import Observation

enum AppTab: Hashable {
    case home, work, plan, materials, quote
}

/// Something the person made with a tool, waiting to go out with their request.
struct Attachment: Identifiable, Codable, Hashable {
    enum Kind: String, Codable {
        case ar, measure, scan, drawing, photo
        var label: String {
            switch self {
            case .ar: return "AR picture"
            case .measure: return "Measurement picture"
            case .scan: return "Room scan picture"
            case .drawing: return "Drawing"
            case .photo: return "Photo"
            }
        }
    }
    var id = UUID()
    var kind: Kind
    var title: String
    var jpeg: Data
}

struct MeasuredLength: Identifiable, Codable, Hashable {
    var id = UUID()
    var meters: Double
    var name: String = ""
}

/// A room scan kept on the phone (the most recent few), so leaving the screen loses nothing.
struct SavedScan: Identifiable, Codable, Equatable {
    var id: String
    var room: ScannedRoom
    var date: Date
    var sample: Bool = false
    /// Sizes typed in by the person instead of scanned: what they typed
    var typed: String?
    /// Walls to start with new cabinets on
    var picked: [Int]?
}

/// Everything collected for one request: pictures, lengths and a scan.
/// Saved on the phone, so it survives closing the app.
struct ProjectBasket: Codable {
    var items: [Attachment] = []
    var lengths: [MeasuredLength] = []
    var scanID: String?
    var room: ScannedRoom?
    var roomLines: [String] = []
    /// Finishes, woods and looks the person liked ("Tafisa Cream Puff (TFL: M2034)")
    var picks: [String] = []

    var count: Int { items.count + lengths.count + picks.count + (room == nil ? 0 : 1) }
    var isEmpty: Bool { count == 0 }

    init() {}

    // Lenient, so a project saved by an older version still opens
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        items = try c.decodeIfPresent([Attachment].self, forKey: .items) ?? []
        lengths = try c.decodeIfPresent([MeasuredLength].self, forKey: .lengths) ?? []
        scanID = try c.decodeIfPresent(String.self, forKey: .scanID)
        room = try c.decodeIfPresent(ScannedRoom.self, forKey: .room)
        roomLines = try c.decodeIfPresent([String].self, forKey: .roomLines) ?? []
        picks = try c.decodeIfPresent([String].self, forKey: .picks) ?? []
    }
}

@Observable
final class AppModel {
    var tab: AppTab = .home
    var planPath: [String] = []
    var toast: String?
    /// "Match a color" is open
    var showColorMatch = false
    /// When the last request went to the office
    var lastSent: Date? = UserDefaults.standard.object(forKey: "lastSent") as? Date {
        didSet { UserDefaults.standard.set(lastSent, forKey: "lastSent") }
    }

    var basket = ProjectBasket() { didSet { saveBasket() } }
    /// The last board sent to the office, kept so it can still be saved or printed
    var sentBasket: ProjectBasket? { didSet { save(sentBasket, "sent.json") } }
    var scans: [SavedScan] = [] { didSet { saveScans() } }

    /// Units for measurements and drawings, remembered
    var unit: LengthUnit = .ftin { didSet { UserDefaults.standard.set(unit.rawValue, forKey: "unit") } }

    private let dir: URL = {
        let d = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
        return d
    }()

    init() {
        if let raw = UserDefaults.standard.string(forKey: "unit"), let u = LengthUnit(rawValue: raw) { unit = u }
        if let d = try? Data(contentsOf: dir.appendingPathComponent("basket.json")),
           let b = try? JSONDecoder().decode(ProjectBasket.self, from: d) { basket = b }
        if let d = try? Data(contentsOf: dir.appendingPathComponent("scans.json")),
           let s = try? JSONDecoder().decode([SavedScan].self, from: d) { scans = s }
        if let d = try? Data(contentsOf: dir.appendingPathComponent("sent.json")),
           let s = try? JSONDecoder().decode(ProjectBasket.self, from: d) { sentBasket = s }
    }

    private func save<T: Encodable>(_ value: T?, _ name: String) {
        let url = dir.appendingPathComponent(name)
        DispatchQueue.global(qos: .utility).async {
            if let value { try? JSONEncoder().encode(value).write(to: url, options: .atomic) } else { try? FileManager.default.removeItem(at: url) }
        }
    }

    private func saveBasket() {
        let b = basket, url = dir.appendingPathComponent("basket.json")
        DispatchQueue.global(qos: .utility).async { try? JSONEncoder().encode(b).write(to: url, options: .atomic) }
    }

    private func saveScans() {
        let s = scans, url = dir.appendingPathComponent("scans.json")
        DispatchQueue.global(qos: .utility).async { try? JSONEncoder().encode(s).write(to: url, options: .atomic) }
    }

    // MARK: Collecting

    func add(images: [UIImage], kind: Attachment.Kind, title: String, quiet: Bool = false) {
        let new = images.compactMap { img -> Attachment? in
            guard let data = img.scaledJPEG(maxSide: 1800, quality: 0.78) else { return nil }
            return Attachment(kind: kind, title: title, jpeg: data)
        }
        guard !new.isEmpty else { return }
        basket.items.append(contentsOf: new)
        if quiet { return }
        say(new.count == 1 ? "1 picture added to your project" : "\(new.count) pictures added to your project")
    }

    func add(lengths: [Double]) {
        guard !lengths.isEmpty else { return }
        basket.lengths.append(contentsOf: lengths.map { MeasuredLength(meters: $0) })
    }

    /// `lead` goes first (the new cabinets and their price), `tail` after the room's sizes
    func attach(scan: SavedScan, pictures: [(UIImage, String)], lead: [String] = [], tail: [String] = []) {
        basket.items.removeAll { $0.kind == .scan }
        basket.scanID = scan.id
        basket.room = scan.room
        // Typed sizes are only what was typed: no made-up floor area or ceiling
        basket.roomLines = lead + (scan.typed.map { [$0] } ?? scan.room.summaryLines(unit)) + tail
        for (img, title) in pictures {
            if let data = img.scaledJPEG(maxSide: 1800, quality: 0.8) {
                basket.items.append(Attachment(kind: .scan, title: title, jpeg: data))
            }
        }
        say("Room scan added to your project")
    }

    func keep(scan room: ScannedRoom, typed: String? = nil, picked: Set<Int>? = nil) -> SavedScan {
        let s = SavedScan(id: Self.newReference(), room: room, date: .now, typed: typed, picked: picked?.sorted())
        scans.insert(s, at: 0)
        if scans.count > 5 { scans.removeLast(scans.count - 5) }
        return s
    }

    func scan(_ id: String) -> SavedScan? {
        if id == "sample" { return SavedScan(id: "GC-SAMPLE", room: .sample, date: .now, sample: true) }
        return scans.first { $0.id == id }
    }

    // MARK: Picks

    func isPicked(_ line: String) -> Bool { basket.picks.contains(line) }

    /// "Add to quote": keeps the choice with the request, without leaving the page.
    func togglePick(_ line: String) {
        if let i = basket.picks.firstIndex(of: line) {
            basket.picks.remove(at: i)
            Haptics.light()
            say("Removed from your quote", haptic: false)
        } else {
            basket.picks.append(line)
            say("Added to your quote")
        }
    }

    func say(_ text: String, haptic: Bool = true) {
        if haptic { Haptics.success() }
        toast = text
        AccessibilityNotification.Announcement(text).post()
        let shown = text
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in
            if self?.toast == shown { self?.toast = nil }
        }
    }

    /// Short, readable reference that ties a picture to what the office received.
    static func newReference() -> String {
        let a = Array("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
        return "GC-" + String((0..<6).map { _ in a[Int.random(in: 0..<a.count)] })
    }
}
