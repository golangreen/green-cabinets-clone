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
}

/// Everything collected for one request: pictures, lengths and a scan.
/// Saved on the phone, so it survives closing the app.
struct ProjectBasket: Codable {
    var items: [Attachment] = []
    var lengths: [MeasuredLength] = []
    var scanID: String?
    var room: ScannedRoom?
    var roomLines: [String] = []

    var count: Int { items.count + lengths.count + (room == nil ? 0 : 1) }
    var isEmpty: Bool { count == 0 }
}

@Observable
final class AppModel {
    var tab: AppTab = .home
    var planPath: [String] = []
    var toast: String?
    /// Prefilled note for the quote form ("Ask about this look")
    var quoteNote = ""

    var basket = ProjectBasket() { didSet { saveBasket() } }
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

    func add(images: [UIImage], kind: Attachment.Kind, title: String) {
        let new = images.compactMap { img -> Attachment? in
            guard let data = img.scaledJPEG(maxSide: 1800, quality: 0.78) else { return nil }
            return Attachment(kind: kind, title: title, jpeg: data)
        }
        guard !new.isEmpty else { return }
        basket.items.append(contentsOf: new)
        say(new.count == 1 ? "1 picture added to your project" : "\(new.count) pictures added to your project")
    }

    func add(lengths: [Double]) {
        guard !lengths.isEmpty else { return }
        basket.lengths.append(contentsOf: lengths.map { MeasuredLength(meters: $0) })
    }

    func attach(scan: SavedScan, pictures: [(UIImage, String)]) {
        basket.items.removeAll { $0.kind == .scan }
        basket.scanID = scan.id
        basket.room = scan.room
        basket.roomLines = scan.room.summaryLines(unit)
        for (img, title) in pictures {
            if let data = img.scaledJPEG(maxSide: 1800, quality: 0.8) {
                basket.items.append(Attachment(kind: .scan, title: title, jpeg: data))
            }
        }
        say("Room scan added to your project")
    }

    func keep(scan room: ScannedRoom) -> SavedScan {
        let s = SavedScan(id: Self.newReference(), room: room, date: .now)
        scans.insert(s, at: 0)
        if scans.count > 5 { scans.removeLast(scans.count - 5) }
        return s
    }

    func scan(_ id: String) -> SavedScan? {
        if id == "sample" { return SavedScan(id: "GC-SAMPLE", room: .sample, date: .now, sample: true) }
        return scans.first { $0.id == id }
    }

    func say(_ text: String) {
        Haptics.success()
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
