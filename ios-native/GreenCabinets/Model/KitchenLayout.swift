import Foundation
import simd

/// New cabinets laid out on the walls someone picked in a room scan, the
/// way we would start the drawing: standard boxes in 3 inch steps, the
/// appliances where the scan found them (or where they usually go), a stone
/// countertop on the base run, and wall cabinets that stop at windows and
/// doors. Kitchens are priced with the published per-foot rates, so the
/// number matches the website.
struct KitchenLayout: Equatable {
    enum Style: String, CaseIterable, Identifiable {
        case kitchen = "Kitchen"
        case closets = "Closets"
        var id: String { rawValue }
    }

    enum Kind: Equatable {
        case base, sink, drawers, wall, tall
        case fridge, range, dishwasher, hood
        case filler

        var isCabinet: Bool { [.base, .sink, .drawers, .wall, .tall].contains(self) }
        var onFloor: Bool { [.base, .sink, .drawers, .dishwasher, .filler].contains(self) }
        var label: String {
            switch self {
            case .fridge: return "Fridge"
            case .range: return "Range"
            case .dishwasher: return "DW"
            case .hood: return "Hood"
            default: return ""
            }
        }
    }

    /// One box on one wall: metres along the wall from its end a, and up from the floor.
    struct Piece: Equatable {
        var wall: Int
        var kind: Kind
        var s0: Double
        var s1: Double
        var bottom: Double
        var top: Double
        var depth: Double
        /// Catalog name ("B24", "SB36", "W3036"); empty for appliances
        var model: String = ""
        var width: Double { s1 - s0 }
    }

    /// The countertop over one base run.
    struct Counter: Equatable {
        var wall: Int
        var s0: Double
        var s1: Double
    }

    /// One NKBA kitchen planning guideline, met or not
    struct Check: Equatable, Hashable {
        var ok: Bool
        var title: String
        var detail: String
    }

    var style: Style
    var pieces: [Piece] = []
    var counters: [Counter] = []
    var checks: [Check] = []

    // MARK: Sizes, as we build them

    static let inch = 0.0254
    static let baseDepth = 24 * inch
    static let counterDepth = 25.5 * inch
    static let counterTop = 36 * inch
    static let counterThick = 1.25 * inch
    static let baseTop = counterTop - counterThick
    static let toeKick = 4 * inch
    static let wallDepth = 12 * inch
    static let wallBottom = 54 * inch
    static let tallDepth = 24 * inch
    static let fridgeHeight = 70 * inch

    // MARK: Numbers for people

    var cabinets: [Piece] { pieces.filter { $0.kind.isCabinet } }
    var isEmpty: Bool { cabinets.isEmpty }
    private func feet(_ kinds: [Kind]) -> Double { pieces.filter { kinds.contains($0.kind) }.reduce(0) { $0 + $1.width } / 0.3048 }
    var baseFeet: Double { feet([.base, .sink, .drawers]) }
    var wallFeet: Double { feet([.wall]) }
    var tallFeet: Double { feet([.tall]) }
    /// Stone over the base run, in square feet
    var counterSqFt: Double { counters.reduce(0) { $0 + ($1.s1 - $1.s0) } * Self.counterDepth / (0.3048 * 0.3048) }

    /// The published rates: $225 a linear foot of base cabinets, $125 of wall
    /// cabinets, and both together ($350) for full-height closets.
    var cabinetPrice: Int? {
        guard !isEmpty else { return nil }
        return Int(((baseFeet * 225 + wallFeet * 125 + tallFeet * 350) / 50).rounded()) * 50
    }

    /// Raphael Stone, $65 a square foot
    var counterPrice: Int? { counterSqFt > 0 ? Int((counterSqFt * 65 / 10).rounded()) * 10 : nil }

    /// "9 base cabinets, 6 wall cabinets"
    var countLine: String {
        let base = pieces.filter { [.base, .sink, .drawers].contains($0.kind) }.count
        let wall = pieces.filter { $0.kind == .wall }.count
        let tall = pieces.filter { $0.kind == .tall }.count
        var parts: [String] = []
        if base > 0 { parts.append(base == 1 ? "1 base cabinet" : "\(base) base cabinets") }
        if wall > 0 { parts.append(wall == 1 ? "1 wall cabinet" : "\(wall) wall cabinets") }
        if tall > 0 { parts.append(tall == 1 ? "1 tall cabinet" : "\(tall) tall cabinets") }
        return parts.joined(separator: ", ")
    }

    /// For the office: each wall's boxes left to right, then the totals.
    func lines(walls: [Int]) -> [String] {
        guard !isEmpty else { return [] }
        var out: [String] = []
        for w in walls.sorted() {
            let low = pieces.filter { $0.wall == w && $0.bottom < 0.01 && $0.kind != .filler }.sorted { $0.s0 < $1.s0 }
            let high = pieces.filter { $0.wall == w && $0.bottom >= 0.01 && $0.kind.isCabinet }.sorted { $0.s0 < $1.s0 }
            let name: (Piece) -> String = { $0.model.isEmpty ? $0.kind.label : $0.model }
            var row = low.map(name).joined(separator: " ")
            if !high.isEmpty { row += " / above: " + high.map(name).joined(separator: " ") }
            if !row.isEmpty { out.append("Wall \(w + 1): " + row) }
        }
        var totals = countLine
        if baseFeet > 0 { totals += ", \(Int(baseFeet.rounded())) ft base" }
        if wallFeet > 0 { totals += ", \(Int(wallFeet.rounded())) ft wall" }
        if tallFeet > 0 { totals += ", \(Int(tallFeet.rounded())) ft tall" }
        if counterSqFt > 0 { totals += ", \(Int(counterSqFt.rounded())) sq ft countertop" }
        out.append("Layout from the app (\(style.rawValue.lowercased())): " + totals)
        if !checks.isEmpty {
            let missed = checks.filter { !$0.ok }.map(\.title)
            out.append("NKBA guidelines: \(checks.count - missed.count) of \(checks.count) met" + (missed.isEmpty ? "" : ". Not met: " + missed.joined(separator: "; ")))
        }
        return out
    }

    // MARK: Laying it out

    init(style: Style) { self.style = style }

    init(room: ScannedRoom, walls picked: Set<Int>, style: Style) {
        self.style = style
        let order = picked.filter { room.walls.indices.contains($0) && room.walls[$0].len >= 0.3 }
            .sorted { room.walls[$0].len > room.walls[$1].len }
        guard !order.isEmpty else { return }
        let depth = style == .kitchen ? Self.baseDepth : Self.tallDepth
        var done: [Int] = []
        var runs: [Run] = []
        for wi in order {
            let w = room.walls[wi]
            var r = Run(wall: wi, len: w.len, height: w.h, holes: room.holes(in: w), found: room.objects(against: w))
            for o in order where o != wi {
                let other = room.walls[o]
                let atA = Self.near(w.pa, other.pa) || Self.near(w.pa, other.pb)
                let atB = Self.near(w.pb, other.pa) || Self.near(w.pb, other.pb)
                // The longer wall runs into the corner; this one starts past the other's boxes
                if atA { r.cornerA = true; if done.contains(o) { r.lo = depth + 0.01; r.upperLo = Self.wallDepth + 0.01 } }
                if atB { r.cornerB = true; if done.contains(o) { r.hi = w.len - depth - 0.01; r.upperHi = w.len - Self.wallDepth - 0.01 } }
            }
            done.append(wi)
            if r.hi - r.lo >= 9 * Self.inch { runs.append(r) }
        }
        guard !runs.isEmpty else { return }
        if style == .kitchen { layKitchen(runs, room: room) } else { layClosets(runs) }
    }

    /// One picked wall and what is already on it.
    private struct Run {
        let wall: Int
        let len: Double
        let height: Double
        let holes: [Hole]
        let found: [WallObject]
        var lo = 0.0
        var hi: Double
        var upperLo = 0.0
        var upperHi: Double
        /// This end meets another picked wall
        var cornerA = false
        var cornerB = false

        init(wall: Int, len: Double, height: Double, holes: [Hole], found: [WallObject]) {
            self.wall = wall; self.len = len; self.height = height; self.holes = holes; self.found = found
            hi = len; upperHi = len
        }

        static let sill = KitchenLayout.counterTop - 0.03
        /// Spans taken on the floor: doors, openings and windows that come down low
        var floorBlocks: [(Double, Double)] {
            holes.filter { $0.kind != .window || $0.bottom < Self.sill }.map { ($0.s0 - 0.05, $0.s1 + 0.05) }
        }
        /// Spans taken higher up: every door, opening and window
        var upperBlocks: [(Double, Double)] { holes.map { ($0.s0 - 0.05, $0.s1 + 0.05) } }
        /// Windows a sink could sit under
        var sinkWindows: [Hole] { holes.filter { $0.kind == .window && $0.bottom >= Self.sill } }
        func free() -> [(Double, Double)] { KitchenLayout.subtract([(lo, hi)], floorBlocks) }
        func freeLength() -> Double { free().reduce(0) { $0 + $1.1 - $1.0 } }
    }

    private struct Placed: Equatable {
        var wall: Int
        var kind: Kind
        var s0: Double
        var s1: Double
        var width: Int
    }

    private mutating func layKitchen(_ runs: [Run], room: ScannedRoom) {
        let free: [Int: [(Double, Double)]] = Dictionary(uniqueKeysWithValues: runs.map { ($0.wall, $0.free()) })
        let ceiling = runs.map(\.height).min() ?? 2.44
        let upperIn = [42, 36, 30].first { Double(54 + $0) * Self.inch <= ceiling + 0.01 } ?? 30
        let upperTop = Self.wallBottom + Double(upperIn) * Self.inch
        let inch = Self.inch
        var placed: [Placed] = []

        func run(_ wall: Int) -> Run? { runs.first { $0.wall == wall } }
        /// Free floor, not taken by another appliance. Strict also keeps the NKBA
        /// clearances: no range or fridge jammed into a corner, no range under a
        /// window, and 21 inches to stand at an open dishwasher.
        func fits(_ wall: Int, _ a: Double, _ b: Double, _ kind: Kind, strict: Bool = true) -> Bool {
            guard let r = run(wall), let spans = free[wall] else { return false }
            guard spans.contains(where: { a >= $0.0 - 0.001 && b <= $0.1 + 0.001 }) else { return false }
            if strict {
                switch kind {
                case .fridge, .range:
                    // Room for a 12 inch cabinet between it and the corner boxes
                    let keep = Self.baseDepth + 0.01 + 12 * inch + 0.005
                    if r.cornerA && a < keep { return false }
                    if r.cornerB && b > r.len - keep { return false }
                    if kind == .range && r.holes.contains(where: { $0.kind == .window && $0.s0 < b && $0.s1 > a }) { return false }
                case .dishwasher:
                    let keep = Self.baseDepth + 21 * inch
                    if r.cornerA && a < keep - 0.005 { return false }
                    if r.cornerB && b > r.len - keep + 0.005 { return false }
                default: break
                }
            }
            return !placed.contains { $0.wall == wall && a < $0.s1 - 0.001 && b > $0.s0 + 0.001 }
        }
        /// The nearest place along the wall where it fits
        func settle(_ wall: Int, _ center: Double, _ widths: [Int], _ kind: Kind, strict: Bool = true) -> Placed? {
            guard let r = run(wall) else { return nil }
            for wIn in widths {
                let w = Double(wIn) * inch
                var best: Double?
                var c = r.lo + w / 2
                while c <= r.hi - w / 2 + 0.001 {
                    if fits(wall, c - w / 2, c + w / 2, kind, strict: strict), abs(c - center) < abs((best ?? .infinity) - center) { best = c }
                    c += inch
                }
                if let c = best { return Placed(wall: wall, kind: kind, s0: c - w / 2, s1: c + w / 2, width: wIn) }
            }
            return nil
        }
        /// Every place it could go on any picked wall, best first by `cost`
        func search(_ kind: Kind, _ widths: [Int], strict: Bool, valid: (Placed) -> Bool, cost: (Placed) -> Double) -> Placed? {
            for wIn in widths {
                let w = Double(wIn) * inch
                var best: Placed?
                var bc = Double.infinity
                for r in runs {
                    var a = r.lo
                    while a + w <= r.hi + 0.001 {
                        let p = Placed(wall: r.wall, kind: kind, s0: a, s1: a + w, width: wIn)
                        if fits(r.wall, a, a + w, kind, strict: strict) && valid(p) {
                            let c = cost(p)
                            if c < bc { bc = c; best = p }
                        }
                        a += inch
                    }
                }
                if let best { return best }
            }
            return nil
        }

        // Appliances the scan found on the picked walls stay where they are
        let found: [String: (Kind, [Int])] = ["fridge": (.fridge, [36]), "stove": (.range, [30]), "oven": (.range, [30]),
                                              "dishwasher": (.dishwasher, [24]), "sink": (.sink, [36, 33, 30])]
        for r in runs {
            for f in r.found {
                guard let (kind, widths) = found[f.object.cat] else { continue }
                if placed.contains(where: { $0.kind == kind && $0.wall == r.wall }) { continue }
                // Near a corner if that is where it really is
                if let p = settle(r.wall, (f.s0 + f.s1) / 2, widths, kind) ?? settle(r.wall, (f.s0 + f.s1) / 2, widths, kind, strict: false) {
                    placed.append(p)
                }
            }
        }

        // Then what the room is missing, placed by the NKBA guidelines (one on a
        // wall that was not picked stays where it is)
        let picked = Set(runs.map(\.wall))
        let elsewhere = room.objects.filter { o in room.wallIndex(for: o).map { !picked.contains($0) } ?? true }
        let inRoom = Set(elsewhere.map(\.cat))
        let has: (Kind) -> Bool = { k in placed.contains { $0.kind == k } }
        let needs: [Kind: Bool] = [
            .sink: !has(.sink) && !inRoom.contains("sink"),
            .dishwasher: !has(.dishwasher) && !inRoom.contains("dishwasher"),
            .range: !has(.range) && !inRoom.contains("stove") && !inRoom.contains("oven"),
            .fridge: !has(.fridge) && !inRoom.contains("fridge"),
        ]
        let landing: (Placed, [Placed]) -> (Double, Double) = { p, others in Self.landing(p, others, runs: runs, free: free) }
        let feet: (Placed, Placed) -> Double = { a, b in simd_length(Self.front(a.wall, (a.s0 + a.s1) / 2, room) - Self.front(b.wall, (b.s0 + b.s1) / 2, room)) / 0.3048 }
        /// How far a work-triangle leg is outside 4 to 9 feet
        let leg: (Double) -> Double = { max(0, 4 - $0) + max(0, $0 - 9) }
        let total = runs.reduce(0.0) { $0 + $1.freeLength() }
        var missing: [Kind] = []

        if total >= 8 * 0.3048, let longest = runs.max(by: { $0.freeLength() < $1.freeLength() }) {
            // Every way to place what is missing is scored against the NKBA
            // guidelines, and the layout that meets the most of them wins
            let win = runs.flatMap { r in r.sinkWindows.map { (r.wall, ($0.s0 + $0.s1) / 2, $0.s1 - $0.s0) } }.max { $0.2 < $1.2 }
            let target = win.map { ($0.0, $0.1) } ?? (longest.wall, (longest.lo + longest.hi) / 2)
            func mid(_ w: Int) -> Double { ((run(w)?.lo ?? 0) + (run(w)?.hi ?? 0)) / 2 }
            func fitsAmong(_ taken: [Placed], _ wall: Int, _ a: Double, _ b: Double, _ kind: Kind, strict: Bool) -> Bool {
                let saved = placed
                placed = taken
                defer { placed = saved }
                return fits(wall, a, b, kind, strict: strict)
            }
            func spots(_ kind: Kind, _ widths: [Int], _ taken: [Placed]) -> [Placed] {
                for strict in [true, false] {
                    for wIn in widths {
                        let w = Double(wIn) * inch
                        var out: [Placed] = []
                        for r in runs {
                            var a = r.lo
                            while a + w <= r.hi + 0.001 {
                                if fitsAmong(taken, r.wall, a, a + w, kind, strict: strict) {
                                    out.append(Placed(wall: r.wall, kind: kind, s0: a, s1: a + w, width: wIn))
                                }
                                a += 2 * inch
                            }
                        }
                        if !out.isEmpty { return out }
                    }
                }
                return []
            }
            /// The cheapest few, spread out so they are real alternatives
            func best(_ list: [Placed], _ k: Int, _ cost: (Placed) -> Double) -> [Placed] {
                var chosen: [Placed] = []
                for p in list.sorted(by: { cost($0) < cost($1) }) {
                    if chosen.contains(where: { $0.wall == p.wall && abs($0.s0 - p.s0) < 0.15 }) { continue }
                    chosen.append(p)
                    if chosen.count == k { break }
                }
                return chosen
            }
            let sinkCost: (Placed) -> Double = { p in
                let c = (p.s0 + p.s1) / 2
                return p.wall == target.0 ? abs(c - target.1) : 10 + abs(c - mid(p.wall))
            }
            func rangeCost(_ sink: Placed?) -> (Placed) -> Double {
                { p in
                    var c = abs((p.s0 + p.s1) / 2 - mid(p.wall)) * 0.05
                    if let s = sink {
                        c += leg(feet(p, s)) * 2
                        if p.wall == s.wall && runs.count > 1 { c += 0.5 }
                    }
                    return c
                }
            }
            func fridgeCost(_ sink: Placed?, _ range: Placed?) -> (Placed) -> Double {
                { p in
                    var c = 0.0
                    if let s = sink { c += leg(feet(p, s)) * 2 }
                    if let g = range { c += leg(feet(p, g)) * 2 }
                    if let s = sink, let g = range { c += max(0, feet(p, s) + feet(p, g) + feet(s, g) - 26) }
                    // At the end of a run
                    if let span = free[p.wall]?.first(where: { p.s0 >= $0.0 - 0.001 && p.s1 <= $0.1 + 0.001 }) {
                        c += min(p.s0 - span.0, span.1 - p.s1) * 0.4
                    }
                    return c
                }
            }
            /// How many guidelines a set of appliances misses
            func misses(_ all: [Placed]) -> Int {
                let checks = Self.nkba(placed: all, missing: [], elsewhere: elsewhere, runs: runs, room: room, counterInches: 158, landing: landing)
                return checks.filter { !$0.ok }.count
            }

            let sinks: [Placed?] = needs[.sink] == true ? best(spots(.sink, [36, 33, 30], placed), 6, sinkCost) : [nil]
            var bestSet: [Placed]?
            var bestScore = Double.infinity
            for s in sinks.isEmpty ? [nil] : sinks {
                var withSink = placed
                if let s { withSink.append(s) }
                let sinkNow = s ?? withSink.first { $0.kind == .sink }
                var dws: [Placed?] = [nil]
                if needs[.dishwasher] == true, let sn = sinkNow {
                    let w = 24 * inch
                    let sides = [(sn.s1, sn.s1 + w), (sn.s0 - w, sn.s0)].filter { fitsAmong(withSink, sn.wall, $0.0, $0.1, .dishwasher, strict: false) }
                    if !sides.isEmpty { dws = sides.map { Placed(wall: sn.wall, kind: .dishwasher, s0: $0.0, s1: $0.1, width: 24) } }
                }
                for d in dws {
                    var withDW = withSink
                    if let d { withDW.append(d) }
                    var ranges: [Placed?] = [nil]
                    if needs[.range] == true {
                        let list = best(spots(.range, [30], withDW), 6, rangeCost(sinkNow))
                        if !list.isEmpty { ranges = list }
                    }
                    for g in ranges {
                        var withRange = withDW
                        if let g { withRange.append(g) }
                        let rangeNow = g ?? withRange.first { $0.kind == .range }
                        var fridges: [Placed?] = [nil]
                        if needs[.fridge] == true {
                            let list = best(spots(.fridge, [36], withRange), 6, fridgeCost(sinkNow, rangeNow))
                            if !list.isEmpty { fridges = list }
                        }
                        for f in fridges {
                            var all = withRange
                            if let f { all.append(f) }
                            let lacking = [Kind.sink, .dishwasher, .range, .fridge].filter { k in needs[k] == true && !all.contains { $0.kind == k } }.count
                            var score = Double(lacking * 30 + misses(all) * 10)
                            if let s { score += sinkCost(s) * 0.3 }
                            if let g { score += rangeCost(sinkNow)(g) * 0.3 }
                            if let f { score += fridgeCost(sinkNow, rangeNow)(f) * 0.3 }
                            if score < bestScore { bestScore = score; bestSet = all }
                        }
                    }
                }
            }
            if let set = bestSet { placed = set }
            missing = [Kind.sink, .dishwasher, .range, .fridge].filter { k in needs[k] == true && !placed.contains { $0.kind == k } }
        }

        for r in runs {
            let mine = placed.filter { $0.wall == r.wall }.sorted { $0.s0 < $1.s0 }
            var baseFree = free[r.wall] ?? []
            for p in mine {
                baseFree = Self.subtract(baseFree, [(p.s0, p.s1)])
                switch p.kind {
                case .sink:
                    pieces.append(Piece(wall: r.wall, kind: .sink, s0: p.s0, s1: p.s1, bottom: 0, top: Self.baseTop, depth: Self.baseDepth, model: "SB\(p.width)"))
                case .dishwasher:
                    pieces.append(Piece(wall: r.wall, kind: .dishwasher, s0: p.s0, s1: p.s1, bottom: 0, top: Self.baseTop, depth: Self.baseDepth))
                case .range:
                    pieces.append(Piece(wall: r.wall, kind: .range, s0: p.s0, s1: p.s1, bottom: 0, top: Self.counterTop, depth: 26 * Self.inch))
                    pieces.append(Piece(wall: r.wall, kind: .hood, s0: p.s0, s1: p.s1, bottom: Self.counterTop + 30 * Self.inch, top: upperTop, depth: 20 * Self.inch))
                case .fridge:
                    pieces.append(Piece(wall: r.wall, kind: .fridge, s0: p.s0, s1: p.s1, bottom: 0, top: Self.fridgeHeight, depth: 30 * Self.inch))
                    // A deep cabinet over the fridge, lined up with the wall cabinets
                    let space = upperTop - Self.fridgeHeight - Self.inch
                    if let h = [24, 18, 15, 12].first(where: { Double($0) * Self.inch <= space }) {
                        pieces.append(Piece(wall: r.wall, kind: .wall, s0: p.s0, s1: p.s1, bottom: upperTop - Double(h) * Self.inch, top: upperTop,
                                            depth: Self.baseDepth, model: "W36\(h)"))
                    }
                default: break
                }
            }
            for span in baseFree {
                let boxes = Self.fill(span.1 - span.0)
                var x = span.0
                for (k, wIn) in boxes.enumerated() {
                    let w = Double(wIn) * Self.inch
                    // Drawers beside the range, where the pots live
                    let besideRange = mine.contains { $0.kind == .range && ((k == 0 && abs($0.s1 - span.0) < 0.01) || (k == boxes.count - 1 && abs($0.s0 - span.1) < 0.01)) }
                    let drawers = besideRange && [15, 18, 24, 30].contains(wIn)
                    pieces.append(Piece(wall: r.wall, kind: drawers ? .drawers : .base, s0: x, s1: x + w, bottom: 0, top: Self.baseTop,
                                        depth: Self.baseDepth, model: (drawers ? "DB" : "B") + Self.two(wIn)))
                    x += w
                }
                if span.1 - x > 0.004 {
                    pieces.append(Piece(wall: r.wall, kind: .filler, s0: x, s1: span.1, bottom: 0, top: Self.baseTop, depth: Self.baseDepth))
                }
            }

            // Countertop over the base run; where this wall meets one laid out first, that wall's top covers the corner
            var tops = Self.merge(pieces.filter { $0.wall == r.wall && $0.kind.onFloor }.map { ($0.s0, $0.s1) })
            let startsAtCorner = r.lo > 0.02, endsAtCorner = r.hi < r.len - 0.02
            tops = tops.map { t in
                (startsAtCorner && abs(t.0 - r.lo) < 0.01 ? Self.counterDepth + 0.003 : t.0,
                 endsAtCorner && abs(t.1 - r.hi) < 0.01 ? r.len - Self.counterDepth - 0.003 : t.1)
            }.filter { $0.1 - $0.0 > 0.02 }
            counters += tops.map { Counter(wall: r.wall, s0: $0.0, s1: $0.1) }

            // Wall cabinets: only over the counter, never over a window, door, range or fridge
            var over = Self.merge(pieces.filter { $0.wall == r.wall && $0.kind.onFloor }.map { ($0.s0, $0.s1) })
            over = over.map { t in
                (startsAtCorner && abs(t.0 - r.lo) < 0.01 ? r.upperLo : t.0, endsAtCorner && abs(t.1 - r.hi) < 0.01 ? r.upperHi : t.1)
            }
            var upperFree = Self.subtract(over, r.upperBlocks)
            upperFree = Self.subtract(upperFree, mine.filter { $0.kind == .range || $0.kind == .fridge }.map { ($0.s0, $0.s1) })
            for span in upperFree {
                var x = span.0
                for wIn in Self.fill(span.1 - span.0) {
                    let w = Double(wIn) * Self.inch
                    pieces.append(Piece(wall: r.wall, kind: .wall, s0: x, s1: x + w, bottom: Self.wallBottom, top: upperTop,
                                        depth: Self.wallDepth, model: "W" + Self.two(wIn) + "\(upperIn)"))
                    x += w
                }
            }
        }
        let counterInches = counters.reduce(0) { $0 + ($1.s1 - $1.s0) } / inch
        checks = Self.nkba(placed: placed, missing: missing, elsewhere: elsewhere, runs: runs, room: room, counterInches: counterInches, landing: landing)
    }

    /// Counter beside an appliance, in inches, up to the next door, open end, range or fridge.
    private static func landing(_ p: Placed, _ others: [Placed], runs: [Run], free: [Int: [(Double, Double)]]) -> (Double, Double) {
        guard let r = runs.first(where: { $0.wall == p.wall }),
              let span = free[p.wall]?.first(where: { p.s0 >= $0.0 - 0.001 && p.s1 <= $0.1 + 0.001 }) else { return (0, 0) }
        var lo = span.0, hi = span.1
        // Past a corner the counter carries on along the other wall
        var moreL = abs(span.0 - r.lo) < 0.005 && r.lo > 0.02 ? counterDepth : 0
        var moreR = abs(span.1 - r.hi) < 0.005 && r.hi < r.len - 0.02 ? counterDepth : 0
        for o in others where o.wall == p.wall && o != p && (o.kind == .fridge || o.kind == .range) {
            if o.s1 <= p.s0 + 0.001 && o.s1 > lo { lo = o.s1; moreL = 0 }
            if o.s0 >= p.s1 - 0.001 && o.s0 < hi { hi = o.s0; moreR = 0 }
        }
        return ((p.s0 - lo + moreL) / inch, (hi - p.s1 + moreR) / inch)
    }

    /// The front middle of a box on a wall, seen from above
    private static func front(_ wall: Int, _ s: Double, _ room: ScannedRoom) -> P2 {
        let w = room.walls[wall]
        let len = max(simd_length(w.pb - w.pa), 1e-6)
        return w.pa + (w.pb - w.pa) / len * s - room.outward(w) * baseDepth
    }

    /// The NKBA kitchen planning guidelines this layout can be held to, in plain words.
    private static func nkba(placed: [Placed], missing: [Kind], elsewhere: [ScannedRoom.RoomObject], runs: [Run], room: ScannedRoom,
                             counterInches: Double, landing: (Placed, [Placed]) -> (Double, Double)) -> [Check] {
        var out: [Check] = []
        let get: (Kind) -> Placed? = { k in placed.first { $0.kind == k } }
        let sides: ((Double, Double)) -> String = { l in "\(Int(max(l.0, l.1))) and \(Int(min(l.0, l.1))) inches" }
        let names: [Kind: String] = [.sink: "a sink", .dishwasher: "a dishwasher", .range: "a range", .fridge: "a fridge"]
        for k in missing {
            out.append(Check(ok: false, title: "No room for \(names[k] ?? "it") on these walls",
                             detail: "Pick one more wall, or we find the space together at the visit"))
        }
        if let s = get(.sink) {
            let l = landing(s, placed)
            let ok = max(l.0, l.1) >= 24 && min(l.0, l.1) >= 18
            out.append(Check(ok: ok, title: "Counter on both sides of the sink",
                             detail: ok ? "24 inches on one side, 18 on the other" : "\(sides(l)) now; the guide is 24 and 18"))
        }
        if let d = get(.dishwasher), let s = get(.sink) {
            let gap = d.wall == s.wall ? max(0, max(d.s0 - s.s1, s.s0 - d.s1)) / inch : 99
            var stand = true
            if let r = runs.first(where: { $0.wall == d.wall }) {
                let keep = baseDepth + 21 * inch - 0.005
                if r.cornerA && d.s0 < keep { stand = false }
                if r.cornerB && d.s1 > r.len - keep { stand = false }
            }
            out.append(Check(ok: gap <= 36 && stand, title: "Dishwasher beside the sink",
                             detail: stand ? "Within 36 inches of it, with room to stand at the open door" : "Too close to the corner to stand at it open"))
        }
        if let g = get(.range) {
            let l = landing(g, placed)
            let window = runs.first { $0.wall == g.wall }?.holes.contains { $0.kind == .window && $0.s0 < g.s1 && $0.s1 > g.s0 } ?? false
            let ok = max(l.0, l.1) >= 15 && min(l.0, l.1) >= 12
            out.append(Check(ok: ok && !window, title: "Counter on both sides of the range",
                             detail: window ? "It sits under a window, which the guidelines rule out"
                                : ok ? "15 inches on one side, 12 on the other, no window above" : "\(sides(l)) now; the guide is 15 and 12"))
        }
        if let f = get(.fridge) {
            let l = landing(f, placed)
            let ok = max(l.0, l.1) >= 15
            out.append(Check(ok: ok, title: "Counter beside the fridge",
                             detail: ok ? "15 inches on its handle side, to set things down" : "\(Int(max(l.0, l.1))) inches now; the guide is 15"))
        }
        // The work triangle, counting appliances that stay on walls that were not picked
        let point: (Kind, [String]) -> P2? = { k, cats in
            if let p = get(k) { return front(p.wall, (p.s0 + p.s1) / 2, room) }
            return elsewhere.first { cats.contains($0.cat) }?.center
        }
        if let a = point(.sink, ["sink"]), let b = point(.range, ["stove", "oven"]), let c = point(.fridge, ["fridge"]) {
            let legs = [simd_length(a - b), simd_length(b - c), simd_length(c - a)].map { $0 / 0.3048 }
            let sum = legs.reduce(0, +)
            let ok = legs.allSatisfy { $0 >= 4 && $0 <= 9 } && sum <= 26
            let each = legs.map { "\(Int($0.rounded()))" }
            out.append(Check(ok: ok, title: "Sink, range and fridge close together",
                             detail: ok ? "Each 4 to 9 feet apart, \(Int(sum.rounded())) feet around"
                                : "\(each[0]), \(each[1]) and \(each[2]) feet apart; the guide is 4 to 9 each, 26 or less around"))
        }
        let counter = Int(counterInches.rounded())
        out.append(Check(ok: counter >= 158, title: "Enough counter to work on",
                         detail: counter >= 158 ? "\(counter) inches in all, 158 or more" : "\(counter) of the 158 inches suggested: one more wall or an island adds it"))
        // Walkways between counters that face each other
        for i in runs.indices {
            for j in runs.indices where j > i {
                let a = room.walls[runs[i].wall], b = room.walls[runs[j].wall]
                let ua = (a.pb - a.pa) / max(simd_length(a.pb - a.pa), 1e-6), ub = (b.pb - b.pa) / max(simd_length(b.pb - b.pa), 1e-6)
                guard abs(simd_dot(ua, ub)) > 0.95 else { continue }
                let gap = abs(simd_dot((b.pa + b.pb) / 2 - (a.pa + a.pb) / 2, room.outward(a)))
                let clear = Int(((gap - 2 * counterDepth) / inch).rounded())
                out.append(Check(ok: clear >= 42, title: "Room to walk between the counters",
                                 detail: clear >= 42 ? "\(clear) inches, 42 or more for one cook" : "\(clear) inches; the guide is 42 for one cook"))
            }
        }
        out.append(Check(ok: true, title: "Wall cabinets 18 inches above the counter", detail: "Room for a coffee maker and a mixer"))
        return out
    }

    private mutating func layClosets(_ runs: [Run]) {
        for r in runs {
            let tallIn = [96, 90, 84].first { Double($0) * Self.inch <= r.height - 0.02 } ?? 84
            for span in r.free() {
                var x = span.0
                for wIn in Self.fill(span.1 - span.0, widths: [15, 18, 24, 27, 30]) {
                    let w = Double(wIn) * Self.inch
                    pieces.append(Piece(wall: r.wall, kind: .tall, s0: x, s1: x + w, bottom: 0, top: Double(tallIn) * Self.inch,
                                        depth: Self.tallDepth, model: "PC\(wIn)\(tallIn)"))
                    x += w
                }
            }
        }
    }

    // MARK: Helpers

    /// Even boxes from the allowed widths that fill a span, the way a shop draws it;
    /// what is left (under 3 inches) is a filler.
    static func fill(_ metres: Double, widths: [Int] = [9, 12, 15, 18, 21, 24, 27, 30, 33, 36]) -> [Int] {
        let total = Int((metres / inch + 0.001).rounded(.down))
        let ws = widths.sorted()
        guard let minW = ws.first, let maxW = ws.last, total >= minW else { return [] }
        let n = max(1, Int((Double(total) / Double(maxW)).rounded(.up)))
        guard let each = ws.last(where: { $0 <= total / n }) else { return [] }
        var out = Array(repeating: each, count: n)
        var left = total - each * n
        var grew = true
        while grew {
            grew = false
            for i in out.indices {
                if let next = ws.first(where: { $0 > out[i] }), next - out[i] <= left {
                    left -= next - out[i]
                    out[i] = next
                    grew = true
                }
            }
        }
        return out
    }

    static func two(_ inches: Int) -> String { String(format: "%02d", inches) }

    static func near(_ a: P2, _ b: P2) -> Bool { simd_length(a - b) < 0.2 }

    static func subtract(_ spans: [(Double, Double)], _ cuts: [(Double, Double)]) -> [(Double, Double)] {
        var out = spans
        for c in cuts {
            out = out.flatMap { s -> [(Double, Double)] in
                if c.1 <= s.0 || c.0 >= s.1 { return [s] }
                var r: [(Double, Double)] = []
                if c.0 > s.0 { r.append((s.0, c.0)) }
                if c.1 < s.1 { r.append((c.1, s.1)) }
                return r
            }
        }
        return out.filter { $0.1 - $0.0 > 0.004 }
    }

    static func merge(_ spans: [(Double, Double)]) -> [(Double, Double)] {
        var out: [(Double, Double)] = []
        for x in spans.sorted(by: { $0.0 < $1.0 }) {
            if let last = out.last, x.0 <= last.1 + 0.005 { out[out.count - 1].1 = max(last.1, x.1) } else { out.append(x) }
        }
        return out
    }
}
