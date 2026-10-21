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
        ambient.light?.intensity = 650
        scene.rootNode.addChildNode(ambient)
        let sun = SCNNode()
        sun.light = SCNLight()
        sun.light?.type = .directional
        sun.light?.intensity = 750
        sun.position = SCNVector3(span * 0.6, span * 1.4, span * 0.9)
        sun.look(at: SCNVector3(0, 0, 0))
        scene.rootNode.addChildNode(sun)

        let world = SCNNode()
        world.position = SCNVector3(-cx, 0, -cz)
        scene.rootNode.addChildNode(world)

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
            cam.look(at: SCNVector3(0, 0, 0))
        } else {
            cam.position = SCNVector3(span * 1.05, span * 1.3, span * 1.45)
            cam.look(at: SCNVector3(0, topH * 0.3, 0))
        }
        SCNTransaction.commit()
        view.defaultCameraController.target = SCNVector3(0, top ? 0 : topH * 0.3, 0)
    }

    // MARK: Picking walls

    func setSelected(_ s: Set<Int>) {
        lock.lock(); selected = s; lock.unlock()
        applySelection()
    }

    private func applySelection() {
        lock.lock(); let s = selected; lock.unlock()
        let brass = Brand.uiBrass
        for (i, w) in walls.enumerated() {
            for n in w.pieces {
                guard let m = n.geometry?.materials else { continue }
                let on = s.contains(i)
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

    // MARK: Cut-away, every frame

    func renderer(_ renderer: SCNSceneRenderer, updateAtTime time: TimeInterval) {
        guard let pov = renderer.pointOfView else { return }
        let p = pov.presentation.worldPosition
        let cam = SIMD2<Float>(p.x, p.z)
        lock.lock(); let s = selected; lock.unlock()
        let anyPicked = !s.isEmpty
        for (i, w) in walls.enumerated() {
            // A wall whose outside faces the camera would hide the room: fade it
            let outside = simd_dot(cam - w.mid, w.normal) > 0
            var target: CGFloat = outside && p.y < Float(w.height) * 4 ? 0.13 : 1
            if anyPicked && !s.contains(i) { target = min(target, 0.25) }
            if anyPicked && s.contains(i) { target = 1 }
            for n in w.nodes where abs(n.opacity - target) > 0.01 { n.opacity = target }
        }
        for o in objects {
            let target: CGFloat = anyPicked && !(o.wall.map { s.contains($0) } ?? false) ? 0.15 : 1
            if abs(o.node.opacity - target) > 0.01 { o.node.opacity = target }
        }
    }

    // MARK: Pictures

    func snapshot() -> UIImage? { view?.snapshot() }

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
        cam.look(at: SCNVector3(w.mid.x, w.height / 2, w.mid.y))
        scene.rootNode.addChildNode(cam)
        let old = selected
        setSelected([i])
        view.pointOfView = cam
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
    }
}
