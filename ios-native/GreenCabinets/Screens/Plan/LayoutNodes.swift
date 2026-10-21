import SceneKit
import UIKit
import simd

/// The new cabinets as 3D boxes for the scanned room: carcasses on a toe
/// kick, separate doors and drawer fronts with pulls, a stone top with the
/// sink, and simple stainless appliances. Built in the room's own metres.
enum LayoutNodes {
    struct Look {
        var doors: UIImage?
        var doorColor: UIColor
        var counter: UIImage?
        var counterColor: UIColor
    }

    /// Every node with the wall it stands against, so it can fade with that wall.
    static func build(room: ScannedRoom, layout: KitchenLayout, look: Look) -> [(node: SCNNode, wall: Int)] {
        let fy = room.floorLevel
        let door = material(look.doors, look.doorColor)
        let stone = material(look.counter, look.counterColor)
        let toe = material(nil, UIColor(red: 0.16, green: 0.15, blue: 0.14, alpha: 1))
        let steel = metal(UIColor(red: 0.76, green: 0.77, blue: 0.78, alpha: 1))
        let dark = metal(UIColor(red: 0.1, green: 0.1, blue: 0.11, alpha: 1))
        let pull = metal(UIColor(red: 0.2, green: 0.18, blue: 0.16, alpha: 1))
        var out: [(SCNNode, Int)] = []

        for p in layout.pieces {
            guard room.walls.indices.contains(p.wall) else { continue }
            let w = room.walls[p.wall]
            let frame = Frame(room: room, wall: w, fy: fy)
            let group = SCNNode()
            let width = Float(p.width) - 0.003
            let mid = Float((p.s0 + p.s1) / 2)
            let d = Float(p.depth)

            switch p.kind {
            case .base, .sink, .drawers, .tall, .filler:
                let kick = Float(KitchenLayout.toeKick)
                group.addChildNode(frame.box(at: mid, out: d / 2, y0: kick, y1: Float(p.top), w: width, d: d, door))
                group.addChildNode(frame.box(at: mid, out: (d - 0.075) / 2, y0: 0, y1: kick, w: width, d: d - 0.075, toe))
                if p.kind != .filler {
                    for f in fronts(p) { group.addChildNode(frame.front(f, along: Float(p.s0), out: d, door, pull: pull)) }
                }
            case .wall:
                group.addChildNode(frame.box(at: mid, out: d / 2, y0: Float(p.bottom), y1: Float(p.top), w: width, d: d, door))
                for f in fronts(p) { group.addChildNode(frame.front(f, along: Float(p.s0), out: d, door, pull: pull)) }
            case .dishwasher:
                let kick = Float(KitchenLayout.toeKick)
                group.addChildNode(frame.box(at: mid, out: (d - 0.075) / 2, y0: 0, y1: kick, w: width, d: d - 0.075, toe))
                group.addChildNode(frame.box(at: mid, out: d / 2, y0: kick, y1: Float(p.top), w: width, d: d, steel))
                group.addChildNode(frame.box(at: mid, out: d + 0.01, y0: Float(p.top) - 0.09, y1: Float(p.top) - 0.075, w: width * 0.7, d: 0.02, pull))
            case .fridge:
                let h = Float(p.top)
                group.addChildNode(frame.box(at: mid, out: d / 2, y0: 0, y1: h, w: width, d: d, steel))
                // French doors over a freezer drawer
                group.addChildNode(frame.box(at: mid, out: d + 0.002, y0: h * 0.34, y1: h * 0.345, w: width, d: 0.006, dark))
                group.addChildNode(frame.box(at: mid, out: d + 0.002, y0: h * 0.345, y1: h, w: 0.006, d: 0.006, dark))
                for x in [mid - 0.03, mid + 0.03] {
                    group.addChildNode(frame.box(at: x, out: d + 0.03, y0: h * 0.45, y1: h * 0.85, w: 0.016, d: 0.02, steel))
                }
                group.addChildNode(frame.box(at: mid, out: d + 0.03, y0: h * 0.29, y1: h * 0.305, w: width * 0.6, d: 0.02, steel))
            case .range:
                let h = Float(p.top)
                group.addChildNode(frame.box(at: mid, out: d / 2, y0: 0, y1: h - 0.012, w: width, d: d, steel))
                group.addChildNode(frame.box(at: mid, out: d / 2, y0: h - 0.012, y1: h, w: width, d: d, dark))
                group.addChildNode(frame.box(at: mid, out: d + 0.003, y0: 0.2, y1: 0.62, w: width * 0.78, d: 0.006, dark))
                group.addChildNode(frame.box(at: mid, out: d + 0.03, y0: 0.66, y1: 0.675, w: width * 0.7, d: 0.02, steel))
            case .hood:
                let y0 = Float(p.bottom), y1 = Float(p.top)
                group.addChildNode(frame.box(at: mid, out: d / 2, y0: y0, y1: y0 + 0.12, w: width, d: d, steel))
                group.addChildNode(frame.box(at: mid, out: 0.14, y0: y0 + 0.12, y1: y1, w: 0.3, d: 0.28, steel))
            }
            out.append((group, p.wall))
        }

        // Stone tops, and the sink and faucet in them
        for c in layout.counters {
            guard room.walls.indices.contains(c.wall) else { continue }
            let frame = Frame(room: room, wall: room.walls[c.wall], fy: fy)
            let group = SCNNode()
            let cd = Float(KitchenLayout.counterDepth)
            let y0 = Float(KitchenLayout.baseTop)
            group.addChildNode(frame.box(at: Float((c.s0 + c.s1) / 2), out: cd / 2, y0: y0, y1: y0 + Float(KitchenLayout.counterThick),
                                         w: Float(c.s1 - c.s0), d: cd, stone))
            for s in layout.pieces where s.wall == c.wall && s.kind == .sink && s.s0 >= c.s0 - 0.01 && s.s1 <= c.s1 + 0.01 {
                let m = Float((s.s0 + s.s1) / 2), top = Float(KitchenLayout.counterTop)
                group.addChildNode(frame.box(at: m, out: 0.33, y0: top, y1: top + 0.003, w: Float(s.width) * 0.78, d: 0.43, dark))
                group.addChildNode(frame.box(at: m, out: 0.07, y0: top, y1: top + 0.32, w: 0.025, d: 0.025, steel))
                group.addChildNode(frame.box(at: m, out: 0.15, y0: top + 0.29, y1: top + 0.32, w: 0.025, d: 0.17, steel))
            }
            out.append((group, c.wall))
        }
        return out
    }

    // MARK: Fronts

    /// A door or drawer front in wall coordinates: along the piece from its start, and up from the floor.
    struct Front {
        var x0: Float
        var x1: Float
        var y0: Float
        var y1: Float
        var drawer: Bool
        /// Where the pull goes on a door: at the left or right edge, near the top or the bottom
        var pullRight = false
        var pullHigh = true
    }

    static func fronts(_ p: KitchenLayout.Piece) -> [Front] {
        let gap: Float = 0.003
        let w = Float(p.width)
        let inches = Int((p.width / KitchenLayout.inch).rounded())
        let doors = inches >= 24 ? 2 : 1
        func doorsRow(_ y0: Float, _ y1: Float, high: Bool) -> [Front] {
            (0..<doors).map { i in
                let a = w * Float(i) / Float(doors), b = w * Float(i + 1) / Float(doors)
                // Pairs open from the middle; a single door opens on its right
                return Front(x0: a + gap, x1: b - gap, y0: y0 + gap, y1: y1 - gap, drawer: false,
                             pullRight: doors == 1 || i == 0, pullHigh: high)
            }
        }
        let top = Float(p.top), kick = Float(KitchenLayout.toeKick)
        switch p.kind {
        case .base, .sink:
            let split = top - 0.152
            return [Front(x0: gap, x1: w - gap, y0: split + gap, y1: top - gap, drawer: true)] + doorsRow(kick, split, high: true)
        case .drawers:
            let a = top - 0.152, b = kick + (a - kick) / 2
            return [Front(x0: gap, x1: w - gap, y0: a + gap, y1: top - gap, drawer: true),
                    Front(x0: gap, x1: w - gap, y0: b + gap, y1: a - gap, drawer: true),
                    Front(x0: gap, x1: w - gap, y0: kick + gap, y1: b - gap, drawer: true)]
        case .wall:
            return doorsRow(Float(p.bottom), top, high: false)
        case .tall:
            let split = kick + (top - kick) * 0.58
            return doorsRow(kick, split, high: true) + doorsRow(split, top, high: false)
        default:
            return []
        }
    }

    // MARK: Building blocks

    /// Places boxes against one wall: along it from end a, out from it into the room.
    private struct Frame {
        let a: SIMD2<Float>
        let u: SIMD2<Float>
        let n: SIMD2<Float>
        let rot: Float
        let base: Float

        init(room: ScannedRoom, wall w: ScannedRoom.Segment, fy: Double) {
            a = SIMD2(Float(w.a[0]), Float(w.a[1]))
            let b = SIMD2<Float>(Float(w.b[0]), Float(w.b[1]))
            let l = max(simd_length(b - a), 1e-4)
            u = (b - a) / l
            let o = room.outward(w)
            n = SIMD2(Float(-o.x), Float(-o.y))
            rot = atan2(-u.y, u.x)
            base = Float(w.y.map { max(0, $0 - w.h / 2 - fy) } ?? 0)
        }

        func box(at s: Float, out: Float, y0: Float, y1: Float, w: Float, d: Float, _ m: SCNMaterial) -> SCNNode {
            let g = SCNBox(width: CGFloat(max(w, 0.001)), height: CGFloat(max(y1 - y0, 0.001)), length: CGFloat(max(d, 0.001)), chamferRadius: 0)
            g.materials = [m]
            let node = SCNNode(geometry: g)
            let p = a + u * s + n * out
            node.position = SCNVector3(p.x, base + (y0 + y1) / 2, p.y)
            node.eulerAngles.y = rot
            return node
        }

        func front(_ f: Front, along start: Float, out depth: Float, _ m: SCNMaterial, pull: SCNMaterial) -> SCNNode {
            let t: Float = 0.019
            let node = box(at: start + (f.x0 + f.x1) / 2, out: depth + t / 2, y0: f.y0, y1: f.y1, w: f.x1 - f.x0, d: t, m)
            let group = SCNNode()
            group.addChildNode(node)
            // The pull: a bar across a drawer, or up the opening edge of a door
            let h = f.y1 - f.y0, w = f.x1 - f.x0
            if f.drawer {
                let len = min(w * 0.5, 0.3)
                group.addChildNode(box(at: start + (f.x0 + f.x1) / 2, out: depth + t + 0.012, y0: f.y1 - h / 2 - 0.006, y1: f.y1 - h / 2 + 0.006,
                                       w: len, d: 0.016, pull))
            } else {
                let len = min(h * 0.4, 0.14)
                let x = f.pullRight ? f.x1 - 0.04 : f.x0 + 0.04
                let y = f.pullHigh ? f.y1 - 0.06 - len : f.y0 + 0.06
                group.addChildNode(box(at: start + x, out: depth + t + 0.012, y0: y, y1: y + len, w: 0.012, d: 0.016, pull))
            }
            return group
        }
    }

    private static func material(_ image: UIImage?, _ color: UIColor) -> SCNMaterial {
        let m = SCNMaterial()
        m.diffuse.contents = image ?? color
        m.diffuse.wrapS = .clamp
        m.diffuse.wrapT = .clamp
        m.lightingModel = .lambert
        return m
    }

    private static func metal(_ color: UIColor) -> SCNMaterial {
        let m = SCNMaterial()
        m.diffuse.contents = color
        m.specular.contents = UIColor(white: 0.6, alpha: 1)
        m.shininess = 0.4
        m.lightingModel = .blinn
        return m
    }
}
