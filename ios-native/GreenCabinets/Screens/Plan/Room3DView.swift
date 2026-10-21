import SwiftUI
import SceneKit
import simd

/// The scanned room in 3D, built natively with SceneKit: walls with their
/// doors and windows cut out, the floor, and the cabinets and appliances.
/// One finger turns it, two pinch and slide (the system camera control),
/// walls between you and the room fade so you always see inside, and in
/// select mode a tap picks a wall.
final class Room3DController: NSObject, SCNSceneRendererDelegate {
    weak var view: SCNView?
    var onTapWall: ((Int) -> Void)?
    var selecting = false

    private var room: ScannedRoom?
    private var span: Float = 4
    private var topH: Float = 2.6
    private var walls: [WallInfo] = []
    private var objects: [(node: SCNNode, wall: Int?)] = []
    private var selected: Set<Int> = []
    private let lock = NSLock()
    /// Off while a picture is taken, so the fades are already where they end
    private var fades = true
    private weak var world: SCNNode?
    /// The new cabinets, each with its wall
    private var parts: [(node: SCNNode, wall: Int)] = []
    /// Walls wearing new cabinets: what the scan found there is hidden
    private var replaced: Set<Int> = []
    private var shownKey = ""
    /// A wall picture is being taken: the other walls step back
    private var isolating = false
    /// The front of the new cabinets, seen from above
    private var kitchen: [SIMD2<Float>] = []

    private struct WallInfo {
        var nodes: [SCNNode]
        /// The solid pieces only (not glass or doors): these take the pick color
        var pieces: [SCNNode] = []
        var mid: SIMD2<Float>
        var normal: SIMD2<Float>
        var len: Float
        var height: Float
    }

    private static let wallColor = UIColor(red: 0.925, green: 0.91, blue: 0.875, alpha: 1)
    private static let wallTop = UIColor(red: 0.45, green: 0.42, blue: 0.38, alpha: 1)
    private static let objectColors: [String: UIColor] = [
        "cabinet": UIColor(red: 0.79, green: 0.65, blue: 0.49, alpha: 1), "table": UIColor(red: 0.73, green: 0.55, blue: 0.37, alpha: 1),
        "fridge": UIColor(red: 0.84, green: 0.85, blue: 0.87, alpha: 1), "stove": UIColor(red: 0.73, green: 0.75, blue: 0.77, alpha: 1),
        "oven": UIColor(red: 0.73, green: 0.75, blue: 0.77, alpha: 1), "dishwasher": UIColor(red: 0.84, green: 0.85, blue: 0.87, alpha: 1),
        "washer": UIColor(red: 0.84, green: 0.85, blue: 0.87, alpha: 1), "sink": UIColor(red: 0.95, green: 0.96, blue: 0.97, alpha: 1),
        "toilet": UIColor(red: 0.95, green: 0.96, blue: 0.97, alpha: 1), "tub": UIColor(red: 0.95, green: 0.96, blue: 0.97, alpha: 1),
        "bed": UIColor(red: 0.66, green: 0.72, blue: 0.78, alpha: 1), "sofa": UIColor(red: 0.62, green: 0.69, blue: 0.63, alpha: 1),
        "tv": UIColor(red: 0.23, green: 0.25, blue: 0.27, alpha: 1),
    ]

    // MARK: Building

    func build(_ room: ScannedRoom, in view: SCNView) {
        self.room = room
        self.view = view
        let scene = SCNScene()
        scene.background.contents = Brand.uiPaper
        view.scene = scene
        view.delegate = self

        let b = room.bounds
        let cx = Float((b.min.x + b.max.x) / 2), cz = Float((b.min.y + b.max.y) / 2)
        span = max(Float(b.max.x - b.min.x), Float(b.max.y - b.min.y), 2)
        topH = max(2.4, Float(room.ceiling))
        let fy = room.floorLevel

        let ambient = SCNNode()
        ambient.light = SCNLight()
        ambient.light?.type = .ambient
        ambient.light?.intensity = 520
        scene.rootNode.addChildNode(ambient)
        let sun = SCNNode()
        sun.light = SCNLight()
        sun.light?.type = .directional
        sun.light?.intensity = 750
        sun.position = SCNVector3(span * 0.6, span * 1.4, span * 0.9)
        sun.look(at: SCNVector3(0, 0, 0))
        scene.rootNode.addChildNode(sun)
        // A softer light from the other side, so walls facing away from the sun still read
        let fill = SCNNode()
        fill.light = SCNLight()
        fill.light?.type = .directional
        fill.light?.intensity = 420
        fill.position = SCNVector3(-span * 0.7, span * 1.2, -span * 0.8)
        fill.look(at: SCNVector3(0, 0, 0))
        scene.rootNode.addChildNode(fill)

        let world = SCNNode()
        world.position = SCNVector3(-cx, 0, -cz)
        scene.rootNode.addChildNode(world)
        self.world = world
        parts = []
        replaced = []
        shownKey = ""

        // Floors, a soft warm tint
        for poly in room.floorPolygons {
            let path = UIBezierPath()
            for (i, p) in poly.enumerated() {
                let q = CGPoint(x: p.x, y: -p.y)
                i == 0 ? path.move(to: q) : path.addLine(to: q)
            }
            path.close()
            let shape = SCNShape(path: path, extrusionDepth: 0.01)
            shape.materials = [Self.material(UIColor(red: 0.95, green: 0.93, blue: 0.88, alpha: 1))]
            let n = SCNNode(geometry: shape)
            n.eulerAngles.x = -.pi / 2
            n.position.y = -0.004
            world.addChildNode(n)
        }

        // Walls, built in pieces around their doors and windows
        let wallT: Float = 0.1
        walls = []
        for (wi, w) in room.walls.enumerated() {
            let a = SIMD2<Float>(Float(w.a[0]), Float(w.a[1])), bb = SIMD2<Float>(Float(w.b[0]), Float(w.b[1]))
            let len = simd_length(bb - a)
            let H = Float(w.h)
            let n = SIMD2<Float>(Float(room.outward(w).x), Float(room.outward(w).y))
            var info = WallInfo(nodes: [], mid: (a + bb) / 2 - SIMD2(cx, cz), normal: n, len: len, height: H)
            guard len >= 0.05 else { walls.append(info); continue }
            let u = (bb - a) / len
            let rot = atan2(-u.y, u.x)
            let base = Float(w.y.map { max(0, $0 - w.h / 2 - fy) } ?? 0)
            let at: (Float) -> SIMD2<Float> = { a + u * $0 }
            let piece: (Float, Float, Float, Float) -> Void = { s0, s1, y0, y1 in
                guard s1 - s0 >= 0.005, y1 - y0 >= 0.005 else { return }
                let box = SCNBox(width: CGFloat(s1 - s0), height: CGFloat(y1 - y0), length: CGFloat(wallT), chamferRadius: 0)
                let side = Self.material(Self.wallColor)
                box.materials = [side, side, side, side, Self.material(Self.wallTop), side]
                let node = SCNNode(geometry: box)
                let p = at((s0 + s1) / 2)
                node.position = SCNVector3(p.x, base + (y0 + y1) / 2, p.y)
                node.eulerAngles.y = rot
                node.name = "wall-\(wi)"
                world.addChildNode(node)
                info.nodes.append(node)
                info.pieces.append(node)
            }
            var cur: Float = 0
            for hole in room.holes(in: w) {
                let s0 = max(cur, Float(hole.s0)), s1 = Float(hole.s1)
                guard s0 < s1 else { continue }
                let bot = Float(hole.bottom), top = Float(hole.top)
                piece(cur, s0, 0, H)
                piece(s0, s1, 0, bot)
                piece(s0, s1, top, H)
                let p = at((s0 + s1) / 2)
                switch hole.kind {
                case .window:
                    let glass = SCNBox(width: CGFloat(s1 - s0), height: CGFloat(top - bot), length: 0.025, chamferRadius: 0)
                    let m = Self.material(UIColor(red: 0.56, green: 0.79, blue: 0.93, alpha: 1))
                    m.transparency = 0.4
                    glass.materials = [m]
                    let g = SCNNode(geometry: glass)
                    g.position = SCNVector3(p.x, base + (bot + top) / 2, p.y)
                    g.eulerAngles.y = rot
                    g.name = "wall-\(wi)"
                    world.addChildNode(g)
                    info.nodes.append(g)
                case .door:
                    let leaf = SCNBox(width: CGFloat(s1 - s0), height: CGFloat(top - bot), length: 0.04, chamferRadius: 0)
                    leaf.materials = [Self.material(UIColor(red: 0.64, green: 0.48, blue: 0.32, alpha: 1))]
                    let d = SCNNode(geometry: leaf)
                    if hole.open {
                        // Open door: the leaf swung into the room from its hinge side
                        let hinge = at(s0)
                        let inward = -n
                        let r2 = atan2(-inward.y, inward.x)
                        let dir = SIMD2<Float>(cos(r2), -sin(r2))
                        d.position = SCNVector3(hinge.x + dir.x * (s1 - s0) / 2, base + (bot + top) / 2, hinge.y + dir.y * (s1 - s0) / 2)
                        d.eulerAngles.y = r2
                    } else {
                        d.position = SCNVector3(p.x, base + (bot + top) / 2, p.y)
                        d.eulerAngles.y = rot
                    }
                    d.name = "wall-\(wi)"
                    world.addChildNode(d)
                    info.nodes.append(d)
                case .opening:
                    break
                }
                cur = s1
            }
            piece(cur, len, 0, H)
            walls.append(info)
        }

        // Fixed things as simple blocks
        objects = []
        for o in room.objects {
            let rot = atan2(-Float(o.axis.y), Float(o.axis.x))
            let bot = Float(o.y.map { max(0, $0 - o.h / 2 - fy) } ?? 0)
            let box = SCNBox(width: CGFloat(o.w), height: CGFloat(o.h), length: CGFloat(o.d), chamferRadius: 0.006)
            box.materials = [Self.material(Self.objectColors[o.cat] ?? UIColor(red: 0.81, green: 0.78, blue: 0.73, alpha: 1))]
            let node = SCNNode(geometry: box)
            node.position = SCNVector3(Float(o.c[0]), bot + Float(o.h) / 2, Float(o.c[1]))
            node.eulerAngles.y = rot
            node.name = "object"
            world.addChildNode(node)
            objects.append((node, room.wallIndex(for: o)))
        }

        let camera = SCNCamera()
        camera.fieldOfView = 45
        camera.zNear = 0.05
        camera.zFar = Double(span * 20)
        let cam = SCNNode()
        cam.camera = camera
        cam.name = "camera"
        scene.rootNode.addChildNode(cam)
        view.pointOfView = cam
        resetCamera(top: false, animated: false)

        view.allowsCameraControl = true
        view.defaultCameraController.interactionMode = .orbitTurntable
        view.defaultCameraController.inertiaEnabled = true
        view.defaultCameraController.maximumVerticalAngle = 88
        view.defaultCameraController.minimumVerticalAngle = 4
        view.defaultCameraController.target = SCNVector3(0, topH * 0.3, 0)
        applySelection()
    }

    private static func material(_ color: UIColor) -> SCNMaterial {
        let m = SCNMaterial()
        m.diffuse.contents = color
        m.lightingModel = .lambert
        m.isDoubleSided = false
        return m
    }

    // MARK: Camera

    func resetCamera(top: Bool, animated: Bool) {
        guard let view, let cam = view.pointOfView ?? view.scene?.rootNode.childNode(withName: "camera", recursively: false) else { return }
        SCNTransaction.begin()
        SCNTransaction.animationDuration = animated ? 0.45 : 0
        SCNTransaction.animationTimingFunction = CAMediaTimingFunction(controlPoints: 0.23, 1, 0.32, 1)
        if top {
            cam.position = SCNVector3(0, span * 2.1, 0.001)
            cam.look(at: SCNVector3(0, 0, 0), up: SCNVector3(0, 0, -1), localFront: SCNNode.localFront)
        } else {
            cam.position = SCNVector3(span * 1.05, span * 1.3, span * 1.45)
            cam.look(at: SCNVector3(0, topH * 0.3, 0), up: SCNVector3(0, 1, 0), localFront: SCNNode.localFront)
        }
        SCNTransaction.commit()
        view.defaultCameraController.target = SCNVector3(0, top ? 0 : topH * 0.3, 0)
    }

    /// Turns the room to face the picked walls from across it, a little above:
    /// how you would stand to look at the new kitchen.
    func focus(on picked: Set<Int>, animated: Bool) {
        guard let view, let cam = view.pointOfView else { return }
        let list = picked.sorted().filter { walls.indices.contains($0) }
        guard !list.isEmpty else { return }
        var n = SIMD2<Float>(0, 0), m = SIMD2<Float>(0, 0)
        for i in list { n += walls[i].normal; m += walls[i].mid }
        m /= Float(list.count)
        // Walls facing each other (a galley) cancel out: look down the aisle between them
        if simd_length(n) < 0.01 {
            let w = walls[list[0]].normal
            n = SIMD2(-w.y, w.x)
        } else {
            n = simd_normalize(n)
        }
        // Step back until every end of every picked wall, floor to wall-cabinet
        // top, sits inside the view, looking down a little
        let aspect = Float(max(view.bounds.width, 1) / max(view.bounds.height, 1))
        let tanV = tan(Float(45 * Double.pi / 360)) * 0.9
        let tanH = tanV * aspect
        let pitch: Float = 0.6
        var corners: [SIMD3<Float>] = []
        for i in list {
            let w = walls[i]
            let along = SIMD2<Float>(-w.normal.y, w.normal.x) * w.len / 2
            for p in [w.mid - along, w.mid + along] {
                corners += [SIMD3(p.x, 0, p.y), SIMD3(p.x, min(w.height, 2.45), p.y)]
            }
        }
        let target = SIMD3<Float>(m.x, 1.0, m.y)
        func fits(_ back: Float) -> Bool {
            let c = SIMD3<Float>(m.x - n.x * back, 1.0 + back * tan(pitch), m.y - n.y * back)
            let f = simd_normalize(target - c)
            let r = simd_normalize(simd_cross(f, SIMD3(0, 1, 0)))
            let u = simd_cross(r, f)
            return corners.allSatisfy { p in
                let v = p - c
                let z = simd_dot(v, f)
                return z > 0.1 && abs(simd_dot(v, r) / z) <= tanH && abs(simd_dot(v, u) / z) <= tanV
            }
        }
        var back = topH * 1.2
        for _ in 0..<40 where !fits(back) { back *= 1.06 }
        let eye = m - n * back
        let dist = back / cos(pitch)
        SCNTransaction.begin()
        SCNTransaction.animationDuration = animated ? 0.5 : 0
        SCNTransaction.animationTimingFunction = CAMediaTimingFunction(controlPoints: 0.23, 1, 0.32, 1)
        cam.position = SCNVector3(eye.x, 1.0 + dist * sin(pitch), eye.y)
        cam.look(at: SCNVector3(m.x, 1.0, m.y), up: SCNVector3(0, 1, 0), localFront: SCNNode.localFront)
        SCNTransaction.commit()
        view.defaultCameraController.target = SCNVector3(m.x, 1.0, m.y)
    }

    // MARK: Picking walls

    func setSelected(_ s: Set<Int>) {
        lock.lock(); selected = s; lock.unlock()
        applySelection()
    }

    private func applySelection() {
        lock.lock(); let s = selected; let cabinets = !replaced.isEmpty; let alone = isolating; lock.unlock()
        let brass = Brand.uiBrass
        for (i, w) in walls.enumerated() {
            for n in w.pieces {
                guard let m = n.geometry?.materials else { continue }
                // With new cabinets on them, picked walls stay wall colored except while picking
                let on = s.contains(i) && (!cabinets || (selecting && !alone))
                for (k, mat) in m.enumerated() where k != 4 {
                    mat.diffuse.contents = on ? brass : Self.wallColor
                }
            }
        }
    }

    @objc func tapped(_ g: UITapGestureRecognizer) {
        guard selecting, let view else { return }
        let hits = view.hitTest(g.location(in: view), options: [.searchMode: SCNHitTestSearchMode.all.rawValue, .ignoreHiddenNodes: true])
        for h in hits where h.node.presentation.opacity > 0.5 {
            if let name = h.node.name, name.hasPrefix("wall-"), let i = Int(name.dropFirst(5)) {
                onTapWall?(i)
                return
            }
            if h.node.name == "object" { continue }
        }
    }

    // MARK: New cabinets

    /// Shows the laid-out cabinets (or takes them away), rebuilding only when they change.
    func show(_ layout: KitchenLayout?, key: String, look: () -> LayoutNodes.Look) {
        guard let room, let world else { return }
        let k = layout == nil ? "" : key
        guard k != shownKey else { return }
        shownKey = k
        for p in parts { p.node.removeFromParentNode() }
        var next: [(node: SCNNode, wall: Int)] = []
        if let layout, !layout.isEmpty {
            next = LayoutNodes.build(room: room, layout: layout, look: look())
            for p in next {
                p.node.name = "cabinet"
                world.addChildNode(p.node)
            }
        }
        let carrying = Set(layout?.pieces.map(\.wall) ?? []).filter { walls.indices.contains($0) }
        lock.lock()
        parts = next
        replaced = carrying
        // Points along the front of the new cabinets, to see whether a wall hides them
        kitchen = carrying.flatMap { i -> [SIMD2<Float>] in
            let w = walls[i]
            let along = SIMD2<Float>(-w.normal.y, w.normal.x)
            return [0.1, 0.3, 0.5, 0.7, 0.9].map { w.mid + along * (Float($0) - 0.5) * w.len - w.normal * 0.6 }
        }
        lock.unlock()
        applySelection()
        view?.setNeedsDisplay()
    }

    // MARK: Cut-away, every frame

    func renderer(_ renderer: SCNSceneRenderer, updateAtTime time: TimeInterval) {
        guard let pov = renderer.pointOfView else { return }
        updateFades(from: pov.presentation.worldPosition)
    }

    /// Which walls, things and cabinets step back, seen from this point.
    private func updateFades(from p: SCNVector3) {
        let cam = SIMD2<Float>(p.x, p.z)
        lock.lock()
        let picked = selected, gone = replaced, pieces = parts, alone = isolating, middle = kitchen
        lock.unlock()
        // With new cabinets showing, the cabinets say what was picked; walls just cut away
        let s: Set<Int> = gone.isEmpty || alone ? picked : []
        let anyPicked = !s.isEmpty
        var behind = Set<Int>()
        for (i, w) in walls.enumerated() {
            // A wall whose outside faces the camera would hide the room: fade it
            let outside = simd_dot(cam - w.mid, w.normal) > 0 && p.y < Float(w.height) * 4
            if outside { behind.insert(i) }
            var target: CGFloat = outside ? 0.13 : 1
            // A picture of one wall: every other wall all but disappears
            if alone && !s.contains(i) { target = 0.06 }
            // A wall standing between you and the new cabinets steps aside too
            if !middle.isEmpty, !gone.contains(i), p.y < Float(w.height) * 4 {
                let along = SIMD2<Float>(-w.normal.y, w.normal.x) * w.len / 2
                if middle.contains(where: { Self.crosses(cam, $0, w.mid - along, w.mid + along) }) { target = 0.13 }
            }
            if anyPicked && !s.contains(i) { target = min(target, 0.25) }
            if anyPicked && s.contains(i) && gone.isEmpty { target = 1 }
            fade(w.nodes, to: target)
        }
        for o in objects {
            var target: CGFloat = anyPicked && !(o.wall.map { s.contains($0) } ?? false) ? 0.15 : 1
            // Against a wall that is cut away: it steps back with it
            if let w = o.wall, behind.contains(w) { target = min(target, 0.25) }
            // Replaced by the new cabinets
            if let w = o.wall, gone.contains(w) { target = 0 }
            fade([o.node], to: target)
        }
        for part in pieces {
            // Seen from behind through a cut-away wall, they step back with it
            var target: CGFloat = behind.contains(part.wall) ? 0.18 : 1
            if anyPicked && !s.contains(part.wall) { target = min(target, 0.15) }
            fade([part.node], to: target)
        }
    }

    /// Whether two segments on the floor cross.
    private static func crosses(_ a: SIMD2<Float>, _ b: SIMD2<Float>, _ c: SIMD2<Float>, _ d: SIMD2<Float>) -> Bool {
        func side(_ p: SIMD2<Float>, _ q: SIMD2<Float>, _ r: SIMD2<Float>) -> Float { (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x) }
        return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0
    }

    /// Walls ease out of the way as the room turns, rather than popping.
    private func fade(_ nodes: [SCNNode], to target: CGFloat) {
        guard nodes.contains(where: { abs($0.opacity - target) > 0.01 }) else { return }
        lock.lock(); let animate = fades; lock.unlock()
        SCNTransaction.begin()
        SCNTransaction.animationDuration = animate ? 0.18 : 0
        SCNTransaction.animationTimingFunction = CAMediaTimingFunction(name: .easeOut)
        for n in nodes { n.opacity = target }
        SCNTransaction.commit()
    }

    // MARK: Pictures

    func snapshot() -> UIImage? {
        lock.lock(); fades = false; lock.unlock()
        defer { lock.lock(); fades = true; lock.unlock() }
        // Settle every fade for this view first, so the picture never shows the frame before
        if let pov = view?.pointOfView { updateFades(from: pov.worldPosition) }
        SCNTransaction.flush()
        return view?.snapshot()
    }

    /// One wall framed straight on from inside the room.
    func snapshotWall(_ i: Int) -> UIImage? {
        guard let view, walls.indices.contains(i), let scene = view.scene else { return nil }
        let w = walls[i]
        let prev = view.pointOfView
        let cam = SCNNode()
        let c = SCNCamera()
        c.fieldOfView = 50
        c.zNear = 0.05
        c.zFar = Double(span * 20)
        cam.camera = c
        let aspect = Float(max(view.bounds.width, 1) / max(view.bounds.height, 1))
        let fov = Float(50 * Double.pi / 180)
        let need = max(w.height / (2 * tan(fov / 2)), w.len / (2 * tan(fov / 2) * aspect))
        let dist = need * 1.15
        let inside = w.mid - w.normal * dist
        cam.position = SCNVector3(inside.x, w.height / 2, inside.y)
        cam.look(at: SCNVector3(w.mid.x, w.height / 2, w.mid.y), up: SCNVector3(0, 1, 0), localFront: SCNNode.localFront)
        scene.rootNode.addChildNode(cam)
        let old = selected
        lock.lock(); fades = false; isolating = true; lock.unlock()
        defer { lock.lock(); fades = true; isolating = false; lock.unlock(); applySelection() }
        setSelected([i])
        view.pointOfView = cam
        updateFades(from: cam.worldPosition)
        SCNTransaction.flush()
        let img = view.snapshot()
        view.pointOfView = prev
        cam.removeFromParentNode()
        setSelected(old)
        return img
    }
}

struct Room3DView: UIViewRepresentable {
    let room: ScannedRoom
    let controller: Room3DController
    var selected: Set<Int>
    var selecting: Bool
    /// New cabinets to show, and what they wear
    var layout: KitchenLayout? = nil
    /// Changes whenever the cabinets or what they wear change
    var layoutKey = ""
    var look: () -> LayoutNodes.Look = { LayoutNodes.Look(doorColor: .white, counterColor: .white) }
    var onTapWall: (Int) -> Void

    func makeUIView(context: Context) -> SCNView {
        let v = SCNView()
        v.antialiasingMode = .multisampling4X
        v.preferredFramesPerSecond = 60
        v.isPlaying = true
        v.rendersContinuously = false
        v.backgroundColor = Brand.uiPaper
        controller.build(room, in: v)
        let tap = UITapGestureRecognizer(target: controller, action: #selector(Room3DController.tapped(_:)))
        v.addGestureRecognizer(tap)
        v.isAccessibilityElement = true
        v.accessibilityLabel = "Your room in 3D. Drag to turn it, pinch to zoom."
        return v
    }

    func updateUIView(_ v: SCNView, context: Context) {
        controller.selecting = selecting
        controller.onTapWall = onTapWall
        controller.setSelected(selected)
        controller.show(layout, key: layoutKey, look: look)
    }
}
