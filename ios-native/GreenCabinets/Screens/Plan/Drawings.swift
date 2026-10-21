import SwiftUI
import UIKit
import simd

/// The scan as an architect's drawings, drawn natively so they export pixel
/// for pixel: the floor plan seen from above, and any one wall seen straight
/// on from inside the room. Ported from the website's canvas drawings, same
/// colors and conventions (wall in ink, door swings dashed, windows as glass
/// lines, architect's ticks on every dimension).
enum Ink {
    static let paper = Color(red: 241 / 255, green: 239 / 255, blue: 234 / 255)
    static let floor = Color(red: 231 / 255, green: 224 / 255, blue: 210 / 255)
    static let face = Color(red: 233 / 255, green: 226 / 255, blue: 212 / 255)
    static let wall = Color(red: 38 / 255, green: 34 / 255, blue: 30 / 255)
    static let line = Color(red: 94 / 255, green: 87 / 255, blue: 77 / 255)
    static let dim = Color(red: 138 / 255, green: 106 / 255, blue: 47 / 255)
    static let cabinet = Color(red: 220 / 255, green: 201 / 255, blue: 163 / 255)
    static let appliance = Color(red: 251 / 255, green: 250 / 255, blue: 247 / 255)
    static let brass = Color(red: 198 / 255, green: 161 / 255, blue: 91 / 255)
    static let faded = Color(red: 185 / 255, green: 177 / 255, blue: 164 / 255)
    static let glass = Color(red: 207 / 255, green: 224 / 255, blue: 230 / 255)
}

private func uprightAngle(_ a: Double) -> Double {
    var r = a
    while r > .pi / 2 { r -= .pi }
    while r < -.pi / 2 { r += .pi }
    return r
}

/// Size text on a paper chip so the line runs behind it.
private func chip(_ ctx: GraphicsContext, _ text: String, at p: CGPoint, angle: Double = 0, u: CGFloat, color: Color = Ink.dim) {
    guard !text.isEmpty else { return }
    var c = ctx
    c.translateBy(x: p.x, y: p.y)
    c.rotate(by: .radians(angle))
    let t = c.resolve(Text(text).font(.system(size: 15 * u, weight: .medium)).foregroundColor(color))
    let s = t.measure(in: CGSize(width: 2000, height: 200))
    let w = s.width + 12 * u
    c.fill(Path(CGRect(x: -w / 2, y: -11 * u, width: w, height: 22 * u)), with: .color(Ink.paper))
    c.draw(t, at: .zero, anchor: .center)
}

// MARK: - Floor plan

/// One design unit: a thousandth of the drawing's width, but never so small
/// that sizes become unreadable on a phone screen (exports are 1600 wide).
private func screenUnit(_ size: CGSize) -> Double { max(Double(size.width) / 1000, 0.78) }

struct FloorPlanDrawing {
    static func unitScale(_ size: CGSize) -> Double { screenUnit(size) }
    let room: ScannedRoom
    let unit: LengthUnit
    var selected: Set<Int> = []
    var tags = false
    /// New cabinets drawn in place of what the scan found on their walls
    var layout: KitchenLayout? = nil

    private struct Frame {
        let s: Double
        let cx: Double
        let cz: Double
        let w: Double
        let h: Double
        func X(_ x: Double) -> Double { w / 2 + (x - cx) * s }
        func Y(_ z: Double) -> Double { h / 2 + (z - cz) * s }
        func pt(_ p: P2) -> CGPoint { CGPoint(x: X(p.x), y: Y(p.y)) }
    }

    private func frame(_ size: CGSize) -> Frame {
        let b = room.bounds
        // Room around the drawing for the dimension lines and their sizes
        let u = Self.unitScale(size)
        let pad = unit == .none ? Double(size.width) * 0.07 : max(Double(size.width) * 0.11, 58 * u)
        let s = min((Double(size.width) - 2 * pad) / max(b.max.x - b.min.x, 0.5),
                    (Double(size.height) - 2 * pad) / max(b.max.y - b.min.y, 0.5))
        return Frame(s: s, cx: (b.min.x + b.max.x) / 2, cz: (b.min.y + b.max.y) / 2, w: Double(size.width), h: Double(size.height))
    }

    /// The wall nearest a point on the drawing, or nil.
    func wall(at p: CGPoint, size: CGSize) -> Int? {
        let f = frame(size)
        let u = Self.unitScale(size)
        let wallW = max(5 * u, 0.12 * f.s)
        var best: Int?
        var bd = max(36 * u, wallW * 1.6)
        for (i, w) in room.walls.enumerated() {
            let a = P2(f.X(w.a[0]), f.Y(w.a[1])), b = P2(f.X(w.b[0]), f.Y(w.b[1]))
            let d = b - a, l2 = max(simd_length_squared(d), 1)
            let q = P2(Double(p.x), Double(p.y))
            let t = max(0, min(1, simd_dot(q - a, d) / l2))
            let dist = simd_length(q - (a + t * d))
            if dist < bd { bd = dist; best = i }
        }
        return best
    }

    func draw(_ ctx: GraphicsContext, size: CGSize) {
        let f = frame(size)
        let u = CGFloat(Self.unitScale(size))
        let s = f.s
        ctx.fill(Path(CGRect(origin: .zero, size: size)), with: .color(Ink.paper))

        // Floor
        for poly in room.floorPolygons {
            var p = Path()
            for (i, q) in poly.enumerated() { i == 0 ? p.move(to: f.pt(q)) : p.addLine(to: f.pt(q)) }
            p.closeSubpath()
            ctx.fill(p, with: .color(Ink.floor))
        }

        // Objects under the walls (not where new cabinets replace them)
        let replaced = Set(layout?.pieces.map(\.wall) ?? [])
        for o in room.objects where !(room.wallIndex(for: o).map { replaced.contains($0) } ?? false) {
            let ang = atan2(o.axis.y, o.axis.x)
            var c = ctx
            c.translateBy(x: CGFloat(f.X(o.c[0])), y: CGFloat(f.Y(o.c[1])))
            c.rotate(by: .radians(ang))
            let w = CGFloat(o.w * s), d = CGFloat(o.d * s)
            let isCab = o.cat == "cabinet"
            let rect = CGRect(x: -w / 2, y: -d / 2, width: w, height: d)
            c.fill(Path(rect), with: .color(isCab ? Ink.cabinet : Ink.appliance))
            c.stroke(Path(rect), with: .color(Ink.line), lineWidth: max(1, 1.6 * u))
            if o.cat == "sink" {
                c.stroke(Path(CGRect(x: -w * 0.32, y: -d * 0.28, width: w * 0.64, height: d * 0.56)), with: .color(Ink.line), lineWidth: max(1, 1.6 * u))
            } else if o.cat == "stove" {
                let r = min(w, d) * 0.15
                for (fx, fy) in [(-0.22, -0.22), (0.22, -0.22), (-0.22, 0.22), (0.22, 0.22)] {
                    let cc = CGPoint(x: CGFloat(fx) * w, y: CGFloat(fy) * d)
                    c.stroke(Path(ellipseIn: CGRect(x: cc.x - r, y: cc.y - r, width: 2 * r, height: 2 * r)), with: .color(Ink.line), lineWidth: max(1, 1.2 * u))
                }
            } else if isCab {
                var e = Path()
                e.move(to: CGPoint(x: -w / 2, y: d / 2 - 3 * u))
                e.addLine(to: CGPoint(x: w / 2, y: d / 2 - 3 * u))
                c.stroke(e, with: .color(Ink.line), lineWidth: max(1, 1.6 * u))
            }
            if let label = ScannedRoom.applianceNames[o.cat], o.cat != "stove" {
                c.rotate(by: .radians(uprightAngle(ang) - ang))
                let fs = min(15 * u, d * 0.42, w * 0.3)
                c.draw(Text(label).font(.system(size: max(fs, 4), weight: .medium)).foregroundColor(Ink.line), at: .zero, anchor: .center)
            }
        }

        if let layout { drawLayout(layout, ctx, f, u: u) }

        // Walls
        let wallW = CGFloat(max(5 * Double(u), 0.12 * s))
        for (i, w) in room.walls.enumerated() {
            var p = Path()
            p.move(to: f.pt(w.pa))
            p.addLine(to: f.pt(w.pb))
            let color = selected.contains(i) ? Ink.brass : (selected.isEmpty ? Ink.wall : Ink.faded)
            ctx.stroke(p, with: .color(color), style: StrokeStyle(lineWidth: wallW, lineCap: .square, lineJoin: .round))
        }

        let inward: (ScannedRoom.Segment) -> P2 = { room.outward($0) * -1 }
        let cut: (ScannedRoom.Segment) -> Void = { o in
            var p = Path()
            p.move(to: f.pt(o.pa))
            p.addLine(to: f.pt(o.pb))
            ctx.stroke(p, with: .color(Ink.paper), style: StrokeStyle(lineWidth: wallW + 2, lineCap: .butt))
        }

        // Openings: a clean gap
        for o in room.openings { cut(o) }

        // Windows: the gap with a triple line of glass
        for o in room.windows {
            cut(o)
            let n = inward(o)
            let off = Double(wallW) / 2 / s
            for k in [-off, 0, off] {
                var p = Path()
                p.move(to: f.pt(o.pa + n * k))
                p.addLine(to: f.pt(o.pb + n * k))
                ctx.stroke(p, with: .color(Ink.wall), lineWidth: max(1, 1.6 * u))
            }
        }

        // Doors: the gap, the leaf standing open into the room, and its swing
        for o in room.doors {
            cut(o)
            let n = inward(o)
            let r = simd_length(o.pb - o.pa)
            let hinge = o.pa, tip = hinge + n * r
            var leaf = Path()
            leaf.move(to: f.pt(hinge))
            leaf.addLine(to: f.pt(tip))
            ctx.stroke(leaf, with: .color(Ink.wall), lineWidth: max(1.5, 2.4 * u))
            let a0 = atan2(o.b[1] - hinge.y, o.b[0] - hinge.x)
            var d = atan2(n.y, n.x) - a0
            while d > .pi { d -= 2 * .pi }
            while d < -.pi { d += 2 * .pi }
            var arc = Path()
            arc.addArc(center: f.pt(hinge), radius: CGFloat(r * s), startAngle: .radians(a0), endAngle: .radians(a0 + d), clockwise: d < 0)
            ctx.stroke(arc, with: .color(Ink.wall), style: StrokeStyle(lineWidth: max(1, 1.2 * u), dash: [6 * u, 5 * u]))
        }

        // Dimension lines outside each wall
        if unit != .none {
            let gap = max(26 * u, wallW * 2.2)
            for w in room.walls where w.len >= 0.3 {
                let n = inward(w)
                let nx = CGFloat(n.x), ny = CGFloat(n.y)
                let a = f.pt(w.pa), b = f.pt(w.pb)
                let ax = a.x - nx * gap, ay = a.y - ny * gap
                let bx = b.x - nx * gap, by = b.y - ny * gap
                var line = Path()
                line.move(to: CGPoint(x: ax, y: ay)); line.addLine(to: CGPoint(x: bx, y: by))
                line.move(to: CGPoint(x: ax + nx * gap * 0.75, y: ay + ny * gap * 0.75)); line.addLine(to: CGPoint(x: ax - nx * 6 * u, y: ay - ny * 6 * u))
                line.move(to: CGPoint(x: bx + nx * gap * 0.75, y: by + ny * gap * 0.75)); line.addLine(to: CGPoint(x: bx - nx * 6 * u, y: by - ny * 6 * u))
                ctx.stroke(line, with: .color(Ink.dim), lineWidth: max(1, 1.2 * u))
                let dx = bx - ax, dy = by - ay, l = max(hypot(dx, dy), 1), ux = dx / l, uy = dy / l
                let t = 6 * u
                var ticks = Path()
                for (px, py) in [(ax, ay), (bx, by)] {
                    ticks.move(to: CGPoint(x: px - (ux + nx) * t, y: py - (uy + ny) * t))
                    ticks.addLine(to: CGPoint(x: px + (ux + nx) * t, y: py + (uy + ny) * t))
                }
                ctx.stroke(ticks, with: .color(Ink.dim), lineWidth: max(1.5, 2 * u))
                chip(ctx, unit.length(w.len), at: CGPoint(x: (ax + bx) / 2, y: (ay + by) / 2), angle: uprightAngle(atan2(Double(dy), Double(dx))), u: u)
            }

            // Floor area in the middle of the room
            let area = room.floorArea
            if area > 0 {
                ctx.draw(Text(unit.area(area)).font(.custom("CormorantGaramond-Medium", size: 24 * u)).foregroundColor(Ink.wall),
                         at: CGPoint(x: size.width / 2, y: size.height / 2 - 12 * u), anchor: .center)
                ctx.draw(Text("Ceiling \(unit.length(room.ceiling))").font(.system(size: 13 * u)).foregroundColor(Ink.line),
                         at: CGPoint(x: size.width / 2, y: size.height / 2 + 14 * u), anchor: .center)
            }
        }

        // Wall numbers while picking: a numbered dot just inside each wall
        if tags {
            for (i, w) in room.walls.enumerated() {
                let n = inward(w)
                let off = Double(wallW) * 0.5 + Double(22 * u)
                let m = f.pt((w.pa + w.pb) / 2)
                let c = CGPoint(x: m.x + CGFloat(n.x * off), y: m.y + CGFloat(n.y * off))
                let r = 15 * u
                let on = selected.contains(i)
                ctx.fill(Path(ellipseIn: CGRect(x: c.x - r, y: c.y - r, width: 2 * r, height: 2 * r)), with: .color(on ? Ink.brass : Ink.wall))
                ctx.draw(Text("\(i + 1)").font(.system(size: 15 * u, weight: .semibold)).foregroundColor(on ? Ink.wall : Ink.paper), at: c, anchor: .center)
            }
        }
    }
}

extension FloorPlanDrawing {
    /// The new cabinets from above: boxes on the floor filled, wall cabinets dashed over them.
    private func drawLayout(_ layout: KitchenLayout, _ ctx: GraphicsContext, _ f: Frame, u: CGFloat) {
        let floor = layout.pieces.filter { $0.kind != .wall && $0.kind != .hood }
        let high = layout.pieces.filter { $0.kind == .wall }
        for p in floor + high {
            guard room.walls.indices.contains(p.wall) else { continue }
            let w = room.walls[p.wall]
            let len = max(simd_length(w.pb - w.pa), 1e-6)
            let along = (w.pb - w.pa) / len
            let n = room.outward(w) * -1
            let a = w.pa + along * p.s0, b = w.pa + along * p.s1
            var box = Path()
            box.move(to: f.pt(a)); box.addLine(to: f.pt(b))
            box.addLine(to: f.pt(b + n * p.depth)); box.addLine(to: f.pt(a + n * p.depth))
            box.closeSubpath()
            if p.kind == .wall {
                ctx.stroke(box, with: .color(Ink.line), style: StrokeStyle(lineWidth: max(1, 1.1 * u), dash: [5 * u, 4 * u]))
                continue
            }
            let appliance = [.fridge, .range, .dishwasher].contains(p.kind)
            ctx.fill(box, with: .color(appliance ? Ink.appliance : Ink.cabinet))
            ctx.stroke(box, with: .color(Ink.line), lineWidth: max(1, 1.4 * u))
            let label = p.model.isEmpty ? p.kind.label : p.model
            guard !label.isEmpty else { continue }
            let c = f.pt((a + b) / 2 + n * (p.depth / 2))
            let ang = uprightAngle(atan2(along.y, along.x))
            var t = ctx
            t.translateBy(x: c.x, y: c.y)
            t.rotate(by: .radians(ang))
            let text = t.resolve(Text(label).font(.system(size: 12 * u, weight: .semibold)).foregroundColor(Ink.wall))
            let size = text.measure(in: CGSize(width: 400, height: 100))
            if size.width < CGFloat(p.width * f.s) * 0.92 && size.height < CGFloat(p.depth * f.s) * 0.9 {
                t.draw(text, at: .zero, anchor: .center)
            }
        }
    }
}

// MARK: - One wall, seen straight on

struct WallElevationDrawing {
    static func unitScale(_ size: CGSize) -> Double { screenUnit(size) }
    let room: ScannedRoom
    let index: Int
    let unit: LengthUnit
    /// New cabinets on this wall, drawn in place of what the scan found
    var layout: KitchenLayout? = nil

    func draw(_ ctx: GraphicsContext, size: CGSize) {
        guard room.walls.indices.contains(index) else { return }
        let w = room.walls[index]
        let u = CGFloat(Self.unitScale(size))
        let W = Double(size.width), H = Double(size.height)
        let L = simd_length(w.pb - w.pa), Hm = w.h
        let dims = unit != .none

        // Seen from inside the room: flip so the wall's left end is on the viewer's left
        let dir = (w.pb - w.pa) / max(L, 1e-6)
        let n = room.outward(w)
        let flip = dir.x * -n.y + dir.y * n.x < 0
        let along: (Double) -> Double = { flip ? L - $0 : $0 }

        let padX = Double(dims ? 120 * u : 70 * u), padTop = Double(dims ? 110 * u : 60 * u), padBot = Double(dims ? 90 * u : 60 * u)
        let k = min((W - 2 * padX) / max(L, 0.5), (H - padTop - padBot) / max(Hm, 0.5))
        let x0 = (W - L * k) / 2
        let floorY = padTop + Hm * k + ((H - padTop - padBot) - Hm * k) / 2
        let X: (Double) -> CGFloat = { CGFloat(x0 + along($0) * k) }
        let Y: (Double) -> CGFloat = { CGFloat(floorY - $0 * k) }
        let span: (Double, Double) -> (CGFloat, CGFloat) = { a, b in (min(X(a), X(b)), abs(X(b) - X(a))) }

        ctx.fill(Path(CGRect(origin: .zero, size: size)), with: .color(Ink.paper))
        let wallRect = CGRect(x: CGFloat(x0), y: Y(Hm), width: CGFloat(L * k), height: CGFloat(Hm * k))
        ctx.fill(Path(wallRect), with: .color(Ink.face))

        let holes = room.holes(in: w)
        for h in holes {
            let (hx, hw) = span(h.s0, h.s1)
            let r = CGRect(x: hx, y: Y(h.top), width: hw, height: CGFloat((h.top - h.bottom) * k))
            ctx.fill(Path(r), with: .color(h.kind == .window ? Ink.glass : Ink.paper))
            ctx.stroke(Path(r), with: .color(Ink.wall), style: StrokeStyle(lineWidth: max(1.5, 2.2 * u), dash: h.kind == .opening ? [8 * u, 6 * u] : []))
            if h.kind == .window {
                ctx.stroke(Path(r.insetBy(dx: 6 * u, dy: 6 * u)), with: .color(Ink.wall), lineWidth: max(1, 1.2 * u))
                var m = Path()
                m.move(to: CGPoint(x: r.midX, y: r.minY + 6 * u)); m.addLine(to: CGPoint(x: r.midX, y: r.maxY - 6 * u))
                ctx.stroke(m, with: .color(Ink.wall), lineWidth: max(1, 1.2 * u))
                var sill = Path()
                sill.move(to: CGPoint(x: r.minX - 8 * u, y: r.maxY)); sill.addLine(to: CGPoint(x: r.maxX + 8 * u, y: r.maxY))
                ctx.stroke(sill, with: .color(Ink.wall), lineWidth: max(2, 3 * u))
            } else if h.kind == .door {
                var v = Path()
                v.move(to: CGPoint(x: r.minX, y: r.minY)); v.addLine(to: CGPoint(x: r.maxX, y: r.midY)); v.addLine(to: CGPoint(x: r.minX, y: r.maxY))
                ctx.stroke(v, with: .color(Ink.wall), style: StrokeStyle(lineWidth: max(1, 1.2 * u), dash: [7 * u, 6 * u]))
            }
        }

        let mine = layout?.pieces.filter { $0.wall == index } ?? []
        if !mine.isEmpty {
            drawCabinets(mine, ctx, X: X, Y: Y, k: k, u: u)
        }
        for p in room.objects(against: w) where mine.isEmpty {
            let (ox, ow) = span(p.s0, p.s1)
            let r = CGRect(x: ox, y: Y(p.top), width: ow, height: CGFloat((p.top - p.bottom) * k))
            let isCab = p.object.cat == "cabinet"
            ctx.fill(Path(r), with: .color(isCab ? Ink.cabinet : Ink.appliance))
            ctx.stroke(Path(r), with: .color(Ink.line), lineWidth: max(1, 1.6 * u))
            if isCab {
                let count = max(1, Int(((p.s1 - p.s0) / 0.5).rounded()))
                var doors = Path()
                for i in 1..<max(count, 1) where count > 1 {
                    let x = r.minX + r.width * CGFloat(i) / CGFloat(count)
                    doors.move(to: CGPoint(x: x, y: r.minY + (p.top < 1.2 ? 10 * u : 0)))
                    doors.addLine(to: CGPoint(x: x, y: r.maxY))
                }
                ctx.stroke(doors, with: .color(Ink.line), lineWidth: max(1, u))
                if p.top < 1.2 {
                    var top = Path()
                    top.move(to: CGPoint(x: r.minX - 4 * u, y: r.minY + 2 * u)); top.addLine(to: CGPoint(x: r.maxX + 4 * u, y: r.minY + 2 * u))
                    ctx.stroke(top, with: .color(Ink.line), lineWidth: max(2, 3 * u))
                }
            } else if let name = ScannedRoom.applianceNames[p.object.cat] {
                let fs = min(16 * u, r.height * 0.3, r.width * 0.22)
                ctx.draw(Text(name).font(.system(size: max(fs, 4), weight: .medium)).foregroundColor(Ink.line), at: CGPoint(x: r.midX, y: r.midY), anchor: .center)
            }
        }

        ctx.stroke(Path(wallRect), with: .color(Ink.wall), lineWidth: max(2, 2.6 * u))
        var floor = Path()
        floor.move(to: CGPoint(x: wallRect.minX - 30 * u, y: CGFloat(floorY))); floor.addLine(to: CGPoint(x: wallRect.maxX + 30 * u, y: CGFloat(floorY)))
        ctx.stroke(floor, with: .color(Ink.wall), lineWidth: max(3, 5 * u))

        guard dims else { return }
        func tick(_ p: inout Path, _ x: CGFloat, _ y: CGFloat) {
            p.move(to: CGPoint(x: x - 6 * u, y: y + 6 * u)); p.addLine(to: CGPoint(x: x + 6 * u, y: y - 6 * u))
        }
        // Overall width above the wall
        let yTop = wallRect.minY - 46 * u
        var hl = Path()
        hl.move(to: CGPoint(x: wallRect.minX, y: yTop)); hl.addLine(to: CGPoint(x: wallRect.maxX, y: yTop))
        hl.move(to: CGPoint(x: wallRect.minX, y: wallRect.minY - 8 * u)); hl.addLine(to: CGPoint(x: wallRect.minX, y: yTop - 6 * u))
        hl.move(to: CGPoint(x: wallRect.maxX, y: wallRect.minY - 8 * u)); hl.addLine(to: CGPoint(x: wallRect.maxX, y: yTop - 6 * u))
        ctx.stroke(hl, with: .color(Ink.dim), lineWidth: max(1, 1.2 * u))
        var ht = Path(); tick(&ht, wallRect.minX, yTop); tick(&ht, wallRect.maxX, yTop)
        ctx.stroke(ht, with: .color(Ink.dim), lineWidth: max(1.5, 2 * u))
        chip(ctx, unit.length(L), at: CGPoint(x: wallRect.midX, y: yTop), u: u)

        // A vertical size with ticks and an upright chip
        func vDim(_ x: CGFloat, _ ya: CGFloat, _ yb: CGFloat, _ text: String) {
            var v = Path()
            v.move(to: CGPoint(x: x, y: ya)); v.addLine(to: CGPoint(x: x, y: yb))
            ctx.stroke(v, with: .color(Ink.dim), lineWidth: max(1, 1.2 * u))
            var t = Path(); tick(&t, x, ya); tick(&t, x, yb)
            ctx.stroke(t, with: .color(Ink.dim), lineWidth: max(1.5, 2 * u))
            chip(ctx, text, at: CGPoint(x: x, y: (ya + yb) / 2), angle: -.pi / 2, u: u)
        }
        vDim(wallRect.maxX + 52 * u, wallRect.minY, CGFloat(floorY), unit.length(Hm))

        for h in holes {
            let (hx, hw) = span(h.s0, h.s1)
            let label = "\(unit.length(h.s1 - h.s0)) × \(unit.length(h.top - h.bottom))"
            chip(ctx, label, at: CGPoint(x: hx + hw / 2, y: Y(h.top) + min(24 * u, CGFloat((h.top - h.bottom) * k) / 2)), u: u)
            if h.bottom > 0.05 { vDim(hx - 18 * u, Y(h.bottom), CGFloat(floorY), unit.length(h.bottom)) }
        }
    }
}

extension WallElevationDrawing {
    /// The new cabinets straight on: every door and drawer, the stone top, the
    /// appliances, and each box's catalog name.
    private func drawCabinets(_ pieces: [KitchenLayout.Piece], _ ctx: GraphicsContext, X: @escaping (Double) -> CGFloat, Y: @escaping (Double) -> CGFloat, k: Double, u: CGFloat) {
        let span: (Double, Double) -> (CGFloat, CGFloat) = { a, b in (min(X(a), X(b)), abs(X(b) - X(a))) }
        let thin = max(1, 1.1 * u), mid = max(1, 1.6 * u)
        let stone = Color(red: 228 / 255, green: 225 / 255, blue: 219 / 255)
        for p in pieces {
            let (x, wd) = span(p.s0, p.s1)
            let r = CGRect(x: x, y: Y(p.top), width: wd, height: CGFloat((p.top - p.bottom) * k))
            switch p.kind {
            case .hood:
                let canopy = CGRect(x: r.minX, y: r.maxY - CGFloat(0.12 * k), width: r.width, height: CGFloat(0.12 * k))
                let chimney = CGRect(x: r.midX - CGFloat(0.15 * k), y: r.minY, width: CGFloat(0.3 * k), height: r.height - canopy.height)
                for b in [chimney, canopy] {
                    ctx.fill(Path(b), with: .color(Ink.appliance))
                    ctx.stroke(Path(b), with: .color(Ink.line), lineWidth: mid)
                }
            case .fridge, .range, .dishwasher:
                ctx.fill(Path(r), with: .color(Ink.appliance))
                ctx.stroke(Path(r), with: .color(Ink.line), lineWidth: mid)
                var d = Path()
                if p.kind == .fridge {
                    let y = Y(p.top * 0.34)
                    d.move(to: CGPoint(x: r.minX, y: y)); d.addLine(to: CGPoint(x: r.maxX, y: y))
                    d.move(to: CGPoint(x: r.midX, y: r.minY)); d.addLine(to: CGPoint(x: r.midX, y: y))
                } else if p.kind == .range {
                    d.addRect(CGRect(x: r.minX + r.width * 0.11, y: Y(0.62), width: r.width * 0.78, height: CGFloat(0.42 * k)))
                }
                ctx.stroke(d, with: .color(Ink.line), lineWidth: thin)
                let fs = min(15 * u, r.width * 0.24, r.height * 0.3)
                ctx.draw(Text(p.kind.label).font(.system(size: max(fs, 4), weight: .medium)).foregroundColor(Ink.line),
                         at: CGPoint(x: r.midX, y: p.kind == .range ? Y(0.8) : r.midY), anchor: .center)
            default:
                ctx.fill(Path(r), with: .color(Ink.cabinet))
                if p.kind.onFloor || p.kind == .tall {
                    let kick = CGRect(x: r.minX, y: Y(KitchenLayout.toeKick), width: r.width, height: CGFloat(KitchenLayout.toeKick * k))
                    ctx.fill(Path(kick), with: .color(Ink.line.opacity(0.55)))
                }
                ctx.stroke(Path(r), with: .color(Ink.line), lineWidth: mid)
                var lines = Path(), pulls = Path()
                for f in LayoutNodes.fronts(p) {
                    let (fx, fw) = span(p.s0 + Double(f.x0), p.s0 + Double(f.x1))
                    let fr = CGRect(x: fx, y: Y(Double(f.y1)), width: fw, height: CGFloat(Double(f.y1 - f.y0) * k))
                    lines.addRect(fr)
                    if f.drawer {
                        let l = min(fr.width * 0.4, CGFloat(0.25 * k))
                        pulls.move(to: CGPoint(x: fr.midX - l / 2, y: fr.midY)); pulls.addLine(to: CGPoint(x: fr.midX + l / 2, y: fr.midY))
                    } else {
                        let l = min(fr.height * 0.4, CGFloat(0.14 * k))
                        let px = X(p.s0 + Double(f.pullRight ? f.x1 - 0.04 : f.x0 + 0.04))
                        let y0 = f.pullHigh ? fr.minY + CGFloat(0.06 * k) : fr.maxY - CGFloat(0.06 * k) - l
                        pulls.move(to: CGPoint(x: px, y: y0)); pulls.addLine(to: CGPoint(x: px, y: y0 + l))
                    }
                }
                ctx.stroke(lines, with: .color(Ink.line), lineWidth: thin)
                ctx.stroke(pulls, with: .color(Ink.wall), style: StrokeStyle(lineWidth: max(1.5, 2.4 * u), lineCap: .round))
                if !p.model.isEmpty {
                    let t = ctx.resolve(Text(p.model).font(.system(size: 12 * u, weight: .semibold)).foregroundColor(Ink.dim))
                    let ts = t.measure(in: CGSize(width: 400, height: 100))
                    if ts.width < r.width * 0.92 {
                        let y = p.bottom < 0.01 ? Y(KitchenLayout.toeKick) - ts.height / 2 - 4 * u : r.maxY - ts.height / 2 - 4 * u
                        ctx.fill(Path(roundedRect: CGRect(x: r.midX - ts.width / 2 - 3 * u, y: y - ts.height / 2 - u, width: ts.width + 6 * u, height: ts.height + 2 * u),
                                      cornerRadius: 3 * u), with: .color(Ink.paper.opacity(0.85)))
                        ctx.draw(t, at: CGPoint(x: r.midX, y: y), anchor: .center)
                    }
                }
            }
        }
        // The stone top over the base run
        for c in (layout?.counters ?? []) where c.wall == index {
            let (x, wd) = span(c.s0, c.s1)
            let r = CGRect(x: x - 2 * u, y: Y(KitchenLayout.counterTop), width: wd + 4 * u, height: CGFloat(KitchenLayout.counterThick * k))
            ctx.fill(Path(r), with: .color(stone))
            ctx.stroke(Path(r), with: .color(Ink.wall), lineWidth: mid)
        }
    }
}

// MARK: - Pictures for sending and sharing

@MainActor
enum DrawingRenderer {
    static let exportSize = CGSize(width: 1600, height: 1152)

    static func plan(_ room: ScannedRoom, unit: LengthUnit, selected: Set<Int> = [], layout: KitchenLayout? = nil) -> UIImage? {
        let d = FloorPlanDrawing(room: room, unit: unit, selected: selected, layout: layout)
        return render { ctx, size in d.draw(ctx, size: size) }
    }

    static func wall(_ room: ScannedRoom, index: Int, unit: LengthUnit, layout: KitchenLayout? = nil) -> UIImage? {
        let d = WallElevationDrawing(room: room, index: index, unit: unit, layout: layout)
        return render { ctx, size in d.draw(ctx, size: size) }
    }

    private static func render(_ draw: @escaping (GraphicsContext, CGSize) -> Void) -> UIImage? {
        let view = Canvas { ctx, size in draw(ctx, size) }.frame(width: exportSize.width, height: exportSize.height)
        let r = ImageRenderer(content: view)
        r.scale = 1
        return r.uiImage
    }

    /// The Green Cabinets band on top and the reference line below, on every exported picture.
    static func branded(_ image: UIImage, title: String, reference: String) -> UIImage {
        let w = image.size.width * image.scale
        let u = w / 1000
        let band = 64 * u, foot = 40 * u
        let size = CGSize(width: w, height: image.size.height * image.scale + band + foot)
        let fmt = UIGraphicsImageRendererFormat()
        fmt.scale = 1
        return UIGraphicsImageRenderer(size: size, format: fmt).image { _ in
            Brand.uiInk.setFill()
            UIRectFill(CGRect(origin: .zero, size: size))
            image.draw(in: CGRect(x: 0, y: band, width: w, height: image.size.height * image.scale))
            let serif = UIFont(name: "CormorantGaramond-SemiBold", size: 30 * u) ?? .systemFont(ofSize: 30 * u)
            ("Green Cabinets" as NSString).draw(at: CGPoint(x: 28 * u, y: band / 2 - serif.lineHeight / 2),
                                               withAttributes: [.font: serif, .foregroundColor: Brand.uiIvory])
            let small = UIFont.systemFont(ofSize: 15 * u, weight: .semibold)
            let label = title.uppercased() as NSString
            let ls = label.size(withAttributes: [.font: small, .kern: 2 * u])
            label.draw(at: CGPoint(x: w - 28 * u - ls.width, y: band / 2 - ls.height / 2),
                       withAttributes: [.font: small, .foregroundColor: Brand.uiBrass, .kern: 2 * u])
            let note = "\(reference) · Prepared for Green Cabinets NY · greencabinetsny.com" as NSString
            let nf = UIFont.systemFont(ofSize: 13 * u)
            let ns = note.size(withAttributes: [.font: nf])
            note.draw(at: CGPoint(x: w / 2 - ns.width / 2, y: size.height - foot / 2 - ns.height / 2),
                      withAttributes: [.font: nf, .foregroundColor: Brand.uiIvory.withAlphaComponent(0.75)])
        }
    }
}
