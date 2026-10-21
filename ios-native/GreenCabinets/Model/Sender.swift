import Foundation

/// Sends a request to the Green Cabinets office (orders@greencabinetsny.com)
/// through the same email functions the website uses. With pictures or a
/// scan it goes as one email with attachments; text only goes as a message.
enum Sender {
    private static let base = URL(string: "https://cqkvrqkelzdctlloobos.supabase.co/functions/v1/")!
    /// The public (publishable) key the website also ships; it only allows calling these functions.
    private static let publicKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa3ZycWtlbHpkY3RsbG9vYm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNjc2NDUsImV4cCI6MjEwNjk0MzY0NX0.rM63zdRewZbq1Ix4XuJzEZBCUrvx6Tc_4GH8Dxud1pA"

    struct Request {
        var name: String
        var email: String
        var phone: String
        var projectType: String
        var details: [String]
        var note: String
        var basket: ProjectBasket
        var unit: LengthUnit
        /// How long the form has been open (the office's spam check wants a person's pace)
        var elapsed: TimeInterval
    }

    enum Failure: LocalizedError {
        case server(String)
        var errorDescription: String? {
            switch self { case .server(let m): return m }
        }
    }

    /// Sends and returns the reference shown to the person.
    static func send(_ r: Request) async throws -> String {
        let ref = r.basket.scanID ?? AppModel.newReference()
        let guardInfo: [String: Any] = ["hp": "", "elapsedMs": Int(max(r.elapsed, 3.5) * 1000)]
        let phone = r.phone.trimmingCharacters(in: .whitespaces)

        if r.basket.items.isEmpty && r.basket.room == nil {
            var lines = ["Project: \(r.projectType)"] + r.details
            if !r.basket.picks.isEmpty { lines += ["", "Picked:"] + r.basket.picks.map { "- \($0)" } }
            lines += lengthLines(r)
            if !r.note.isEmpty { lines += ["", r.note] }
            // The office takes up to 1000 characters
            let message = "Sent from the Green Cabinets iPhone app\n\n" + lines.joined(separator: "\n")
            var body: [String: Any] = [
                "name": r.name, "email": r.email,
                "message": String(message.prefix(1000)),
                "projectType": r.projectType.lowercased(), "spamGuard": guardInfo,
            ]
            if phone.count >= 10 { body["phone"] = String(phone.prefix(20)) }
            try await post("send-contact-form", body)
            return ref
        }

        // Pictures: the scan's first, then the rest, at most 10 (the office's limit)
        let ordered = r.basket.items.filter { $0.kind == .scan } + r.basket.items.filter { $0.kind != .scan }
        let images = ordered.prefix(10).enumerated().map { i, a -> [String: Any] in
            let clean = a.title.replacingOccurrences(of: "[^A-Za-z0-9 ._-]", with: "", options: .regularExpression)
            return ["name": "\(i + 1) \(clean.prefix(60)) \(ref).jpg", "data": a.jpeg.base64EncodedString()]
        }
        // At most 20 lines: the lengths share lines so a long list can't push the room off
        let picks = packed(r.basket.picks).enumerated().map { $0.offset == 0 ? "Picked: " + $0.element : $0.element }
        var summary = ["Project: \(r.projectType)"] + r.details + picks + packed(lengthLines(r)) + r.basket.roomLines
        summary = Array(summary.prefix(20)).map { String($0.prefix(600)) }
        var body: [String: Any] = [
            "kind": r.basket.room != nil ? "scan" : "quote",
            "name": r.name, "email": r.email,
            "scanId": ref, "summary": summary, "images": images, "spamGuard": guardInfo,
        ]
        if !phone.isEmpty { body["phone"] = String(phone.prefix(20)) }
        if !r.note.isEmpty { body["note"] = String(r.note.prefix(1000)) }
        if let room = r.basket.room { body["room"] = room.json }
        try await post("send-room-scan", body)
        return ref
    }

    private static func lengthLines(_ r: Request) -> [String] {
        r.basket.lengths.enumerated().map { i, l in
            let name = l.name.trimmingCharacters(in: .whitespaces)
            return "\(name.isEmpty ? "Length \(i + 1)" : name): \(r.unit.forText.length(l.meters))"
        }
    }

    /// Joins short lines into a few lines of at most 590 characters.
    private static func packed(_ items: [String]) -> [String] {
        guard items.count > 1 else { return items }
        var out: [String] = [], cur = ""
        for i in items {
            if !cur.isEmpty && cur.count + i.count + 3 > 590 { out.append(cur); cur = "" }
            cur += cur.isEmpty ? i : " · " + i
        }
        if !cur.isEmpty { out.append(cur) }
        return out
    }

    private static func post(_ fn: String, _ body: [String: Any]) async throws {
        var req = URLRequest(url: base.appendingPathComponent(fn))
        req.httpMethod = "POST"
        req.timeoutInterval = 60
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(publicKey, forHTTPHeaderField: "apikey")
        req.setValue("Bearer \(publicKey)", forHTTPHeaderField: "Authorization")
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["error"] as? String
            throw Failure.server(msg ?? "That didn't go through. Check your connection and try again.")
        }
    }
}
