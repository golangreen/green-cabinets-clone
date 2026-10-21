import Foundation
import simd

/// A scanned room seen from above, in metres (RoomPlan's own coordinates:
/// x to the right, z toward the viewer, y up). The same format the website
/// reads, so a scan sent from the app opens on the office computer too.
struct ScannedRoom: Codable, Equatable {
    var v: Int = 2
    var rooms: Int?
    var walls: [Segment] = []
    var doors: [Segment] = []
    var windows: [Segment] = []
    var openings: [Segment] = []
    var objects: [RoomObject] = []
    var floors: [Floor]?
    var sections: [Section]?

    struct Segment: Codable, Equatable {
        var a: [Double]
        var b: [Double]
        var len: Double
        var h: Double
        var y: Double?
        var open: Bool?
    }
    struct RoomObject: Codable, Equatable {
        var c: [Double]
        var ax: [Double]
        var w: Double
        var d: Double
        var h: Double
        var y: Double?
        var cat: String
    }
    struct Floor: Codable, Equatable {
        var poly: [[Double]]
        var y: Double?
    }
    struct Section: Codable, Equatable {
        var label: String
        var c: [Double]
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        v = try c.decodeIfPresent(Int.self, forKey: .v) ?? 1
        rooms = try c.decodeIfPresent(Int.self, forKey: .rooms)
        walls = try c.decodeIfPresent([Segment].self, forKey: .walls) ?? []
        doors = try c.decodeIfPresent([Segment].self, forKey: .doors) ?? []
        windows = try c.decodeIfPresent([Segment].self, forKey: .windows) ?? []
        openings = try c.decodeIfPresent([Segment].self, forKey: .openings) ?? []
        objects = try c.decodeIfPresent([RoomObject].self, forKey: .objects) ?? []
        floors = try c.decodeIfPresent([Floor].self, forKey: .floors)
        sections = try c.decodeIfPresent([Section].self, forKey: .sections)
    }

    static let sample: ScannedRoom = {
        guard let url = Bundle.main.url(forResource: "sampleRoom", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let room = try? JSONDecoder().decode(ScannedRoom.self, from: data) else {
            return try! JSONDecoder().decode(ScannedRoom.self, from: Data("{}".utf8))
        }
        return room
    }()

    var json: String { (try? String(data: JSONEncoder().encode(self), encoding: .utf8)) ?? "{}" }
}

// MARK: - Units

enum LengthUnit: String, CaseIterable, Identifiable, Codable {
    case ftin, inch, cm, none
    var id: String { rawValue }
    var label: String {
        switch self {
        case .ftin: return "Ft + in"
        case .inch: return "Inches"
        case .cm: return "Cm"
        case .none: return "None"
        }
    }

    /// A length in this unit; "" when the drawing should carry no sizes.
    func length(_ m: Double) -> String {
        switch self {
        case .ftin:
            let total = Int((m * 39.3701).rounded())
            let ft = total / 12, inch = total % 12
            return inch == 0 ? "\(ft)'" : "\(ft)' \(inch)\""
        case .inch: return "\(Int((m * 39.3701).rounded()))\""
        case .cm: return "\(Int((m * 100).rounded())) cm"
        case .none: return ""
        }
    }

    func area(_ m2: Double) -> String {
        switch self {
        case .cm: return String(format: "%.1f m²", m2)
        case .none: return ""
        default: return "\(Int((m2 * 10.7639).rounded()).formatted()) sq ft"
        }
    }

    /// Sizes for text summaries, never blank
    var forText: LengthUnit { self == .none ? .ftin : self }
}

// MARK: - Geometry shared by the plan, the wall drawings and the 3D room

typealias P2 = SIMD2<Double>

extension ScannedRoom.Segment {
    var pa: P2 { P2(a[0], a[1]) }
    var pb: P2 { P2(b[0], b[1]) }
}

extension ScannedRoom.RoomObject {
    var center: P2 { P2(c[0], c[1]) }
    var axis: P2 { P2(ax[0], ax.count > 1 ? ax[1] : 0) }
}

struct Hole {
    enum Kind { case door, window, opening }
    let kind: Kind
    let s0: Double
    let s1: Double
    let bottom: Double
    let top: Double
    let open: Bool
}

struct WallObject {
    let object: ScannedRoom.RoomObject
    let s0: Double
    let s1: Double
    let bottom: Double
    let top: Double
}

extension ScannedRoom {
    static let applianceNames: [String: String] = [
        "fridge": "Fridge", "stove": "Range", "oven": "Oven", "dishwasher": "DW", "washer": "Washer", "sink": "Sink",
        "toilet": "WC", "tub": "Tub", "bed": "Bed", "sofa": "Sofa", "table": "Table", "chair": "Chair",
        "fireplace": "Fireplace", "tv": "TV", "stairs": "Stairs",
    ]

    var allPoints: [P2] { walls.flatMap { [$0.pa, $0.pb] } + objects.map(\.center) }

    var bounds: (min: P2, max: P2) {
        let pts = allPoints
        guard let f = pts.first else { return (P2(0, 0), P2(1, 1)) }
        var lo = f, hi = f
        for p in pts { lo = simd_min(lo, p); hi = simd_max(hi, p) }
        return (lo, hi)
    }

    var center: P2 { let b = bounds; return (b.min + b.max) / 2 }

    /// Where the floor is: the scan's floors, else the walls' bottoms, else 0.
    var floorLevel: Double {
        let fy = (floors ?? []).compactMap(\.y)
        if let m = fy.min() { return m }
        let wy = walls.compactMap { w in w.y.map { $0 - w.h / 2 } }
        return wy.min() ?? 0
    }

    /// Outward normal of a wall (pointing away from the middle of the room).
    func outward(_ w: Segment) -> P2 {
        let d = w.pb - w.pa
        let l = simd_length(d)
        guard l > 0 else { return P2(0, 1) }
        var n = P2(-d.y / l, d.x / l)
        let mid = (w.pa + w.pb) / 2
        if simd_dot(n, mid - center) < 0 { n = -n }
        return n
    }

    /// Doors, windows and openings in this wall, as spans along it (metres from end a).
    func holes(in w: Segment) -> [Hole] {
        let fy = floorLevel
        let d = w.pb - w.pa
        let len = max(simd_length(d), 1e-6)
        let u = d / len
        var out: [Hole] = []
        let kinds: [(Hole.Kind, [Segment])] = [(.door, doors), (.window, windows), (.opening, openings)]
        for (kind, list) in kinds {
            for o in list {
                let m = (o.pa + o.pb) / 2 - w.pa
                let s = simd_dot(m, u)
                let off = abs(m.x * u.y - m.y * u.x)
                if off > 0.25 || s < -0.1 || s > len + 0.1 { continue }
                let od = o.pb - o.pa
                let ol = max(simd_length(od), 1e-6)
                if abs(simd_dot(od, u) / ol) < 0.8 { continue }
                var bottom: Double
                if let y = o.y { bottom = y - o.h / 2 - fy }
                else { bottom = kind == .window ? max(0.3, min(0.9, w.h - o.h - 0.15)) : 0 }
                bottom = max(0, bottom)
                let top = min(w.h, bottom + o.h)
                let s0 = max(0, s - o.len / 2), s1 = min(len, s + o.len / 2)
                if s1 - s0 > 0.05 && top - bottom > 0.05 {
                    out.append(Hole(kind: kind, s0: s0, s1: s1, bottom: bottom, top: top, open: o.open ?? false))
                }
            }
        }
        return out.sorted { $0.s0 < $1.s0 }
    }

    /// Cabinets and appliances standing against this wall, as spans along it.
    func objects(against w: Segment) -> [WallObject] {
        let fy = floorLevel
        let d = w.pb - w.pa
        let len = max(simd_length(d), 1e-6)
        let u = d / len
        var out: [WallObject] = []
        for o in objects {
            if abs(simd_dot(o.axis, u)) < 0.8 { continue }
            let m = o.center - w.pa
            let s = simd_dot(m, u)
            let off = abs(m.x * u.y - m.y * u.x)
            if s < -0.2 || s > len + 0.2 || off > o.d / 2 + 0.25 { continue }
            let bottom = o.y.map { max(0, $0 - o.h / 2 - fy) } ?? 0
            out.append(WallObject(object: o, s0: max(0, s - o.w / 2), s1: min(len, s + o.w / 2), bottom: bottom, top: bottom + o.h))
        }
        return out.sorted { ($0.object.cat == "cabinet" ? 0 : 1) < ($1.object.cat == "cabinet" ? 0 : 1) }
    }

    /// Which wall an object stands against, or nil.
    func wallIndex(for o: RoomObject) -> Int? {
        var best: Int?
        var bd = Double.infinity
        for (i, w) in walls.enumerated() {
            let d = w.pb - w.pa
            let len = max(simd_length(d), 1e-6)
            let u = d / len
            if abs(simd_dot(o.axis, u)) < 0.8 { continue }
            let m = o.center - w.pa
            let s = simd_dot(m, u)
            let off = abs(m.x * u.y - m.y * u.x)
            if s < -0.2 || s > len + 0.2 || off > o.d / 2 + 0.25 { continue }
            if off < bd { bd = off; best = i }
        }
        return best
    }

    static func polygonArea(_ poly: [P2]) -> Double {
        guard poly.count >= 3 else { return 0 }
        var s = 0.0
        for i in poly.indices {
            let p = poly[i], q = poly[(i + 1) % poly.count]
            s += p.x * q.y - q.x * p.y
        }
        return abs(s) / 2
    }

    var floorPolygons: [[P2]] {
        let f = (floors ?? []).filter { $0.poly.count >= 3 }.map { $0.poly.map { P2($0[0], $0[1]) } }
        if !f.isEmpty { return f }
        return walls.count >= 3 ? [walls.map(\.pa)] : []
    }

    var floorArea: Double { floorPolygons.reduce(0) { $0 + Self.polygonArea($1) } }
    var ceiling: Double { walls.map(\.h).max() ?? 0 }
    var wallRun: Double { walls.reduce(0) { $0 + $1.len } }
    var cabinetCount: Int { objects.filter { $0.cat == "cabinet" }.count }
    var appliances: [String] {
        let known = ["fridge", "stove", "oven", "sink", "dishwasher", "washer"]
        var seen: [String] = []
        for o in objects where known.contains(o.cat) && !seen.contains(o.cat) { seen.append(o.cat) }
        return seen
    }

    /// The numbers Green Cabinets needs first, as lines for the email.
    func summaryLines(_ unit: LengthUnit) -> [String] {
        let u = unit.forText
        var lines = [
            "Floor area: \(u.area(floorArea))",
            "Ceiling height: \(u.length(ceiling))",
            "Total wall length: \(u.length(wallRun)) over \(walls.count) walls",
            "Doors: \(doors.count) · Windows: \(windows.count)",
            "Existing cabinets found: \(cabinetCount)",
        ]
        if !appliances.isEmpty { lines.append("Appliances found: \(appliances.joined(separator: ", "))") }
        lines.append("Walls: " + walls.enumerated().map { "\($0.offset + 1)) \(u.length($0.element.len))" }.joined(separator: "  "))
        return lines
    }
}
