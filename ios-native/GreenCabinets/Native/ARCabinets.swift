import Foundation
import UIKit
import ARKit
import RealityKit

/// See cabinets in your own kitchen, at real size, before anything is built.
///
/// Works on every iPhone and iPad with ARKit (no LiDAR needed): the camera
/// finds the floor, a tap places a cabinet there, and the person drags it
/// along the floor or turns it with two fingers. "Add next" puts the next
/// cabinet flush against the picked one, so a whole run lines up. The finish
/// chips switch every door and side to a Green Cabinets finish (the same
/// wood and color samples as the website). The shutter saves what the camera
/// sees, cabinets included; Done hands those pictures back to the app.
/// The cabinets a person can place, sizes in inches (width, height, depth),
/// and how high off the floor the box sits.
enum CabinetKind: Int, CaseIterable {
    case base24, base36, drawers24, wall30, tall24

    var title: String {
        switch self {
        case .base24: return "Base 24\""
        case .base36: return "Base 36\""
        case .drawers24: return "Drawers 24\""
        case .wall30: return "Wall 30\""
        case .tall24: return "Pantry 24\""
        }
    }
    var size: SIMD3<Float> {
        let i: Float = 0.0254
        switch self {
        case .base24: return [24 * i, 34.5 * i, 24 * i]
        case .base36: return [36 * i, 34.5 * i, 24 * i]
        case .drawers24: return [24 * i, 34.5 * i, 24 * i]
        case .wall30: return [30 * i, 30 * i, 12 * i]
        case .tall24: return [24 * i, 84 * i, 24 * i]
        }
    }
    /// Wall cabinets hang with their bottom 54" off the floor.
    var lift: Float { self == .wall30 ? 54 * 0.0254 : 0 }
    var hasCounter: Bool { self == .base24 || self == .base36 || self == .drawers24 }
}

final class ARDesignViewController: UIViewController, ARSessionDelegate {
    var onDone: (([UIImage]) -> Void)?

    private let finishes: [Finish]
    private var finishIndex = 0
    private var kind: CabinetKind = .base24
    private var door: DoorStyle = .shaker
    private let doorButton = UIButton(type: .system)
    private var arView: ARView!
    private let coaching = ARCoachingOverlayView()
    private let hint = UILabel()
    private let kindBar = UIStackView()
    private let finishBar = UIStackView()
    private let shutter = UIButton(type: .custom)
    private let doneButton = UIButton(type: .system)
    private let closeButton = UIButton(type: .system)
    private let nextButton = UIButton(type: .system)
    private let removeButton = UIButton(type: .system)
    private let countLabel = UILabel()
    private var photos: [UIImage] = []
    private var cabinets: [CabinetEntity] = []
    private var selected: CabinetEntity? { didSet { refreshSelection() } }
    private var materials: [Int: RealityKit.Material] = [:]

    private let ink = UIColor(red: 14 / 255, green: 13 / 255, blue: 12 / 255, alpha: 1)
    private let ivory = UIColor(red: 242 / 255, green: 236 / 255, blue: 226 / 255, alpha: 1)
    private let brass = UIColor(red: 198 / 255, green: 161 / 255, blue: 91 / 255, alpha: 1)

    /// The countertop stone, when someone opened AR from a Raphael Stone slab
    private let counter: Finish?
    private lazy var counterMaterial: RealityKit.Material? = counter.flatMap { f in
        guard let img = ARTexture.image(for: f)?.cgImage,
              let tex = try? TextureResource.generate(from: img, options: .init(semantic: .color)) else { return nil }
        var m = SimpleMaterial(color: .white, roughness: 0.18, isMetallic: false)
        m.color = .init(tint: .white, texture: .init(tex))
        return m
    }

    init(finishes: [Finish], counter: Finish? = nil) {
        self.finishes = finishes.isEmpty ? Finish.arDefault : finishes
        self.counter = counter
        super.init(nibName: nil, bundle: nil)
    }
    required init?(coder: NSCoder) { fatalError() }

    override var prefersStatusBarHidden: Bool { true }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        arView = ARView(frame: view.bounds)
        arView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        arView.session.delegate = self
        view.addSubview(arView)

        coaching.session = arView.session
        coaching.goal = .horizontalPlane
        coaching.activatesAutomatically = true
        coaching.frame = view.bounds
        coaching.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        arView.addSubview(coaching)

        arView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(tapped(_:))))
        buildChrome()
        refreshSelection()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        let config = ARWorldTrackingConfiguration()
        config.planeDetection = [.horizontal]
        config.environmentTexturing = .automatic
        // LiDAR phones also hide cabinets behind real things (a counter, a person)
        if ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) {
            config.sceneReconstruction = .mesh
            arView.environment.sceneUnderstanding.options.insert(.occlusion)
        }
        arView.session.run(config)
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        arView.session.pause()
    }

    // MARK: - Controls

    /// System buttons: Liquid Glass on iOS 26, filled capsules before it.
    private func pill(_ b: UIButton, _ title: String, filled: Bool = false) {
        b.translatesAutoresizingMaskIntoConstraints = false
        b.heightAnchor.constraint(greaterThanOrEqualToConstant: 44).isActive = true
        style(b, title: title, on: filled)
    }

    private func style(_ b: UIButton, title: String? = nil, on: Bool) {
        var cfg: UIButton.Configuration
        if #available(iOS 26.0, *) {
            cfg = on ? .prominentGlass() : .glass()
        } else {
            cfg = .filled()
        }
        cfg.title = title ?? b.configuration?.title ?? b.title(for: .normal)
        cfg.cornerStyle = .capsule
        cfg.contentInsets = NSDirectionalEdgeInsets(top: 10, leading: 18, bottom: 10, trailing: 18)
        cfg.baseForegroundColor = on ? ink : ivory
        cfg.baseBackgroundColor = on ? ivory : ink.withAlphaComponent(0.6)
        cfg.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { a in
            var a = a; a.font = UIFont.systemFont(ofSize: 15, weight: .semibold); return a
        }
        b.configuration = cfg
    }

    private func buildChrome() {
        pill(closeButton, "Close")
        closeButton.addTarget(self, action: #selector(close), for: .touchUpInside)
        pill(doneButton, "Done", filled: true)
        doneButton.addTarget(self, action: #selector(done), for: .touchUpInside)
        // Door style: a pull-down, like the system's own pop-up buttons
        pill(doorButton, door.rawValue)
        doorButton.showsMenuAsPrimaryAction = true
        doorButton.changesSelectionAsPrimaryAction = true
        doorButton.menu = UIMenu(title: "Door style", children: DoorStyle.allCases.map { d in
            UIAction(title: d.rawValue, subtitle: d.detail, state: d == door ? .on : .off) { [weak self] _ in self?.pickDoor(d) }
        })
        doorButton.accessibilityLabel = "Door style"
        [closeButton, doneButton, doorButton].forEach(view.addSubview)

        hint.text = counter.map { "Move the phone slowly, then tap the floor. Base cabinets wear your \($0.name) counter." }
            ?? "Move the phone slowly, then tap the floor to place a cabinet"
        hint.textColor = ivory
        hint.font = .systemFont(ofSize: 15, weight: .medium)
        hint.numberOfLines = 0
        hint.textAlignment = .center
        hint.backgroundColor = ink.withAlphaComponent(0.6)
        hint.layer.cornerRadius = 12
        hint.clipsToBounds = true
        hint.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(hint)

        // Next to the picked cabinet: add another flush beside it, or take it away
        pill(nextButton, "Add next")
        nextButton.addTarget(self, action: #selector(addNext), for: .touchUpInside)
        pill(removeButton, "Remove")
        removeButton.addTarget(self, action: #selector(removeSelected), for: .touchUpInside)
        let actions = UIStackView(arrangedSubviews: [removeButton, nextButton])
        actions.spacing = 10
        actions.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(actions)

        // Which cabinet a tap places
        let kindScroll = UIScrollView()
        kindScroll.showsHorizontalScrollIndicator = false
        kindScroll.translatesAutoresizingMaskIntoConstraints = false
        kindBar.spacing = 8
        kindBar.translatesAutoresizingMaskIntoConstraints = false
        for k in CabinetKind.allCases {
            let b = UIButton(type: .custom)
            pill(b, k.title)
            b.tag = k.rawValue
            b.addTarget(self, action: #selector(pickKind(_:)), for: .touchUpInside)
            kindBar.addArrangedSubview(b)
        }
        kindScroll.addSubview(kindBar)
        view.addSubview(kindScroll)

        // The finish for every cabinet in the room
        let finishScroll = UIScrollView()
        finishScroll.showsHorizontalScrollIndicator = false
        finishScroll.translatesAutoresizingMaskIntoConstraints = false
        finishBar.spacing = 12
        finishBar.translatesAutoresizingMaskIntoConstraints = false
        for (i, f) in finishes.enumerated() {
            let b = UIButton(type: .custom)
            b.tag = i
            b.accessibilityLabel = f.name
            b.layer.cornerRadius = 22
            b.clipsToBounds = true
            b.layer.borderWidth = 2
            b.translatesAutoresizingMaskIntoConstraints = false
            b.widthAnchor.constraint(equalToConstant: 44).isActive = true
            b.heightAnchor.constraint(equalToConstant: 44).isActive = true
            if let img = ARTexture.image(for: f) { b.setBackgroundImage(ARTexture.chip(img), for: .normal) }
            else { b.backgroundColor = UIColor(hex: f.hex) }
            b.addTarget(self, action: #selector(pickFinish(_:)), for: .touchUpInside)
            finishBar.addArrangedSubview(b)
        }
        finishScroll.addSubview(finishBar)
        view.addSubview(finishScroll)

        shutter.translatesAutoresizingMaskIntoConstraints = false
        shutter.backgroundColor = ivory
        shutter.layer.cornerRadius = 34
        shutter.layer.borderWidth = 4
        shutter.layer.borderColor = brass.cgColor
        shutter.accessibilityLabel = "Take a picture"
        shutter.addTarget(self, action: #selector(takePicture), for: .touchUpInside)
        view.addSubview(shutter)

        countLabel.textColor = ivory
        countLabel.font = .systemFont(ofSize: 14, weight: .semibold)
        countLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(countLabel)

        let g = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            closeButton.topAnchor.constraint(equalTo: g.topAnchor, constant: 12),
            closeButton.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 16),
            doneButton.topAnchor.constraint(equalTo: g.topAnchor, constant: 12),
            doneButton.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -16),
            doorButton.centerYAnchor.constraint(equalTo: closeButton.centerYAnchor),
            doorButton.centerXAnchor.constraint(equalTo: g.centerXAnchor),
            hint.topAnchor.constraint(equalTo: closeButton.bottomAnchor, constant: 12),
            hint.centerXAnchor.constraint(equalTo: g.centerXAnchor),
            hint.widthAnchor.constraint(lessThanOrEqualTo: g.widthAnchor, constant: -48),

            shutter.bottomAnchor.constraint(equalTo: g.bottomAnchor, constant: -12),
            shutter.centerXAnchor.constraint(equalTo: g.centerXAnchor),
            shutter.widthAnchor.constraint(equalToConstant: 68),
            shutter.heightAnchor.constraint(equalToConstant: 68),
            countLabel.centerYAnchor.constraint(equalTo: shutter.centerYAnchor),
            countLabel.leadingAnchor.constraint(equalTo: shutter.trailingAnchor, constant: 16),

            finishScroll.bottomAnchor.constraint(equalTo: shutter.topAnchor, constant: -14),
            finishScroll.leadingAnchor.constraint(equalTo: g.leadingAnchor),
            finishScroll.trailingAnchor.constraint(equalTo: g.trailingAnchor),
            finishScroll.heightAnchor.constraint(equalToConstant: 48),
            finishBar.leadingAnchor.constraint(equalTo: finishScroll.contentLayoutGuide.leadingAnchor, constant: 16),
            finishBar.trailingAnchor.constraint(equalTo: finishScroll.contentLayoutGuide.trailingAnchor, constant: -16),
            finishBar.centerYAnchor.constraint(equalTo: finishScroll.centerYAnchor),

            kindScroll.bottomAnchor.constraint(equalTo: finishScroll.topAnchor, constant: -10),
            kindScroll.leadingAnchor.constraint(equalTo: g.leadingAnchor),
            kindScroll.trailingAnchor.constraint(equalTo: g.trailingAnchor),
            kindScroll.heightAnchor.constraint(equalToConstant: 48),
            kindBar.leadingAnchor.constraint(equalTo: kindScroll.contentLayoutGuide.leadingAnchor, constant: 16),
            kindBar.trailingAnchor.constraint(equalTo: kindScroll.contentLayoutGuide.trailingAnchor, constant: -16),
            kindBar.centerYAnchor.constraint(equalTo: kindScroll.centerYAnchor),

            actions.bottomAnchor.constraint(equalTo: kindScroll.topAnchor, constant: -10),
            actions.centerXAnchor.constraint(equalTo: g.centerXAnchor),
        ])
        refreshBars()
    }

    private func refreshBars() {
        for case let b as UIButton in kindBar.arrangedSubviews {
            style(b, on: b.tag == kind.rawValue)
            b.accessibilityTraits = b.tag == kind.rawValue ? [.button, .selected] : .button
        }
        for case let b as UIButton in finishBar.arrangedSubviews {
            b.layer.borderColor = (b.tag == finishIndex ? brass : ivory.withAlphaComponent(0.5)).cgColor
            b.layer.borderWidth = b.tag == finishIndex ? 3 : 1.5
            b.accessibilityTraits = b.tag == finishIndex ? [.button, .selected] : .button
        }
        countLabel.text = photos.isEmpty ? "" : "\(photos.count) saved"
    }

    private func refreshSelection() {
        let has = selected != nil
        nextButton.isHidden = !has
        removeButton.isHidden = !has
        for c in cabinets { c.setPicked(c === selected, accent: brass) }
    }

    private func buzz(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .light) {
        UIImpactFeedbackGenerator(style: style).impactOccurred()
    }

    @objc private func pickKind(_ b: UIButton) {
        kind = CabinetKind(rawValue: b.tag) ?? .base24
        buzz()
        refreshBars()
    }

    @objc private func pickFinish(_ b: UIButton) {
        finishIndex = b.tag
        buzz()
        refreshBars()
        let m = material(finishIndex)
        for c in cabinets { c.applyFinish(m) }
        hint.text = finishes[finishIndex].name
    }

    /// Every cabinet in the room switches to the new door, where it stands.
    private func pickDoor(_ d: DoorStyle) {
        door = d
        style(doorButton, title: d.rawValue, on: false)
        buzz()
        let m = material(finishIndex)
        let wasSelected = selected
        var rebuilt: [CabinetEntity] = []
        var newSelected: CabinetEntity?
        for old in cabinets {
            guard let parent = old.parent else { continue }
            let new = CabinetEntity(kind: old.kind, finish: m, door: d, counter: counterMaterial)
            new.transform = old.transform
            parent.addChild(new)
            old.removeFromParent()
            arView.installGestures([.translation, .rotation], for: new)
            rebuilt.append(new)
            if old === wasSelected { newSelected = new }
        }
        cabinets = rebuilt
        selected = newSelected
        hint.text = d.rawValue + " doors"
    }

    // MARK: - Placing

    @objc private func tapped(_ g: UITapGestureRecognizer) {
        let p = g.location(in: arView)
        // A tap on a cabinet picks it; anywhere on the floor places a new one
        if let hit = arView.entity(at: p), let cab = hit.cabinetAncestor {
            selected = (selected === cab) ? nil : cab
            buzz()
            return
        }
        guard let r = arView.raycast(from: p, allowing: .estimatedPlane, alignment: .horizontal).first else {
            hint.text = "Point at the floor and tap again"
            return
        }
        let pos = SIMD3<Float>(r.worldTransform.columns.3.x, r.worldTransform.columns.3.y, r.worldTransform.columns.3.z)
        // Face the camera, turned only around the vertical axis
        let cam = arView.cameraTransform.translation
        let yaw = atan2(cam.x - pos.x, cam.z - pos.z)
        place(at: pos, yaw: yaw)
    }

    private func place(at pos: SIMD3<Float>, yaw: Float) {
        let cab = CabinetEntity(kind: kind, finish: material(finishIndex), door: door, counter: counterMaterial)
        let anchor = AnchorEntity(world: pos)
        cab.orientation = simd_quatf(angle: yaw, axis: [0, 1, 0])
        anchor.addChild(cab)
        arView.scene.addAnchor(anchor)
        arView.installGestures([.translation, .rotation], for: cab)
        cabinets.append(cab)
        selected = cab
        hint.text = "Drag to move, turn with two fingers. \"Add next\" lines up the next one."
        buzz(.medium)
    }

    /// The next cabinet goes flush against the right side of the picked one.
    @objc private func addNext() {
        guard let cur = selected else { return }
        let w0 = cur.kind.size.x
        let w1 = kind.size.x
        let right = cur.convert(direction: [1, 0, 0], to: nil)
        let back0 = cur.kind.size.z
        let back1 = kind.size.z
        // Keep the backs on the same wall line when depths differ (wall vs base)
        let inward = cur.convert(direction: [0, 0, -1], to: nil)
        var pos = cur.position(relativeTo: nil) + right * ((w0 + w1) / 2) + inward * ((back0 - back1) / 2)
        pos.y = cur.position(relativeTo: nil).y
        let fwd = cur.convert(direction: [0, 0, 1], to: nil)
        let yaw = atan2(fwd.x, fwd.z)
        place(at: pos, yaw: yaw)
    }

    @objc private func removeSelected() {
        guard let cur = selected else { return }
        cur.anchor?.removeFromParent()
        cabinets.removeAll { $0 === cur }
        selected = cabinets.last
        buzz()
    }

    // MARK: - Pictures

    @objc private func takePicture() {
        buzz(.medium)
        let flash = UIView(frame: view.bounds)
        flash.backgroundColor = .white
        // A soft flash, not a full white-out (no abrupt brightness jump)
        flash.alpha = UIAccessibility.isReduceMotionEnabled ? 0.35 : 0.6
        view.addSubview(flash)
        UIView.animate(withDuration: 0.2, delay: 0, options: [.curveEaseOut, .allowUserInteraction], animations: { flash.alpha = 0 }) { _ in flash.removeFromSuperview() }
        // Hide the pick outline so it isn't in the picture
        let keep = selected
        selected = nil
        arView.snapshot(saveToHDR: false) { [weak self] image in
            guard let self = self else { return }
            self.selected = keep
            guard let image = image else { return }
            self.photos.append(image)
            self.refreshBars()
        }
    }

    @objc private func close() {
        // Held here, not through self: the screen may be gone when the dismissal ends
        let done = onDone, photos = self.photos
        dismiss(animated: true) { done?(photos) }
    }

    @objc private func done() {
        // Done with nothing saved still keeps what is on screen
        if photos.isEmpty && !cabinets.isEmpty {
            selected = nil
            arView.snapshot(saveToHDR: false) { [weak self] image in
                guard let self = self else { return }
                if let image { self.photos.append(image) }
                self.close()
            }
            return
        }
        close()
    }

    // MARK: - Finishes

    private func material(_ i: Int) -> RealityKit.Material {
        if let m = materials[i] { return m }
        let f = finishes[min(i, finishes.count - 1)]
        var m = SimpleMaterial(color: UIColor(hex: f.hex), roughness: 0.55, isMetallic: false)
        if let img = ARTexture.image(for: f)?.cgImage,
           let tex = try? TextureResource.generate(from: img, options: .init(semantic: .color)) {
            m.color = .init(tint: .white, texture: .init(tex))
        }
        materials[i] = m
        return m
    }

    func session(_ session: ARSession, didFailWithError error: Error) {
        hint.text = "The camera stopped. Close and open again."
    }
}

/// One cabinet, built from boxes at real size: the box, a recessed toe kick,
/// shaker doors (or drawer fronts) with a frame and a sunk center panel,
/// brass bar pulls, and a white stone top on base cabinets. Its origin is the
/// middle of the floor footprint, front facing +z.
final class CabinetEntity: Entity, HasModel, HasCollision {
    let kind: CabinetKind
    private(set) var door: DoorStyle = .shaker
    private var finishParts: [ModelEntity] = []
    private var outline: ModelEntity?

    required init() { kind = .base24; super.init() }

    init(kind: CabinetKind, finish: RealityKit.Material, door: DoorStyle = .shaker, counter: RealityKit.Material? = nil) {
        self.kind = kind
        self.door = door
        super.init()
        build(finish, counter: counter)
        // One box for taps and drags, the cabinet's full size
        let sz = kind.size
        collision = CollisionComponent(shapes: [
            ShapeResource.generateBox(size: sz).offsetBy(translation: [0, kind.lift + sz.y / 2, 0])
        ])
    }

    private func box(_ size: SIMD3<Float>, _ at: SIMD3<Float>, _ m: RealityKit.Material, finish: Bool = true, corner: Float = 0) {
        let e = ModelEntity(mesh: corner > 0 ? .generateBox(size: size, cornerRadius: corner) : .generateBox(size: size), materials: [m])
        e.position = at
        addChild(e)
        if finish { finishParts.append(e) }
    }

    private func build(_ finish: RealityKit.Material, counter: RealityKit.Material?) {
        let s = kind.size
        let w = s.x, h = s.y, d = s.z
        let y0 = kind.lift
        let toe: Float = kind == .wall30 ? 0 : 4.5 * 0.0254
        let dark = SimpleMaterial(color: UIColor(white: 0.12, alpha: 1), roughness: 0.9, isMetallic: false)
        let brass = SimpleMaterial(color: UIColor(red: 0.78, green: 0.63, blue: 0.36, alpha: 1), roughness: 0.3, isMetallic: true)
        let stone = SimpleMaterial(color: UIColor(white: 0.94, alpha: 1), roughness: 0.25, isMetallic: false)
        let door: Float = 0.019

        // The box (sides, back, top) sits behind the doors
        let boxH = h - toe
        box([w, boxH, d - door], [0, y0 + toe + boxH / 2, -door / 2], finish)
        if toe > 0 { box([w - 0.02, toe, d - 0.08], [0, toe / 2, -0.04], dark, finish: false) }

        // Fronts: doors split in two above 21", drawers stacked on a drawer base
        let front = y0 + toe
        let fh = boxH - 0.006
        let z = d / 2 - door / 2
        switch kind {
        case .drawers24:
            let parts: [Float] = [0.22, 0.34, 0.44]
            var y = front + 0.003
            for p in parts.reversed() {
                let dh = fh * p - 0.003
                shaker([w - 0.006, dh], [0, y + dh / 2, z], finish)
                box([min(0.3, w * 0.5), 0.012, 0.012], [0, y + dh - min(0.06, dh * 0.25), d / 2 + 0.014], brass, finish: false)
                y += dh + 0.003
            }
        default:
            let leaves = w > 21 * 0.0254 ? 2 : 1
            let lw = (w - 0.006 * Float(leaves)) / Float(leaves)
            for i in 0..<leaves {
                let x = -w / 2 + 0.003 + lw / 2 + Float(i) * (lw + 0.006)
                shaker([lw, fh], [x, front + fh / 2 + 0.003, z], finish)
                // Vertical bar pull near the meeting edge (top for base, bottom for wall)
                let px = leaves == 2 ? (i == 0 ? x + lw / 2 - 0.04 : x - lw / 2 + 0.04) : x + lw / 2 - 0.04
                let py = kind == .wall30 ? front + 0.12 : front + fh - 0.12
                box([0.012, kind == .tall24 ? 0.3 : 0.15, 0.012], [px, py, d / 2 + 0.014], brass, finish: false)
            }
        }
        if kind.hasCounter {
            box([w + 0.002, 0.03, d + 0.025], [0, y0 + h + 0.015, 0.0125], counter ?? stone, finish: false)
        }
    }

    /// One door or drawer front in the chosen style: a frame of four rails
    /// around a center panel (shaker 2.25", slim shaker 1.5", raised panel
    /// with the center standing proud), or one flat slab.
    private func shaker(_ size: SIMD2<Float>, _ c: SIMD3<Float>, _ m: RealityKit.Material) {
        let (w, h) = (size.x, size.y)
        let t: Float = 0.019
        if door == .flat {
            box([w, h, t], c, m, corner: 0.0015)
            return
        }
        let frame: Float = door == .slimShaker ? 1.5 * 0.0254 : 2.25 * 0.0254
        let rail = min(frame, min(w, h) * 0.22)
        box([w, rail, t], [c.x, c.y + h / 2 - rail / 2, c.z], m)
        box([w, rail, t], [c.x, c.y - h / 2 + rail / 2, c.z], m)
        box([rail, h - 2 * rail, t], [c.x - w / 2 + rail / 2, c.y, c.z], m)
        box([rail, h - 2 * rail, t], [c.x + w / 2 - rail / 2, c.y, c.z], m)
        if door == .raised {
            box([w - 2 * rail - 0.01, h - 2 * rail - 0.01, 0.022], [c.x, c.y, c.z + 0.003], m, corner: 0.005)
        } else {
            box([w - 2 * rail, h - 2 * rail, 0.008], [c.x, c.y, c.z - 0.004], m)
        }
    }

    func applyFinish(_ m: RealityKit.Material) {
        for p in finishParts { p.model?.materials = [m] }
    }

    /// A thin brass line on the floor around the picked cabinet.
    func setPicked(_ on: Bool, accent: UIColor) {
        if on, outline == nil {
            let s = kind.size
            let line = UnlitMaterial(color: accent)
            let o = ModelEntity()
            let t: Float = 0.012
            let y: Float = 0.002
            for (sz, p) in [
                (SIMD3<Float>(s.x + 0.04, 0.002, t), SIMD3<Float>(0, y, s.z / 2 + 0.02)),
                (SIMD3<Float>(s.x + 0.04, 0.002, t), SIMD3<Float>(0, y, -s.z / 2 - 0.02)),
                (SIMD3<Float>(t, 0.002, s.z + 0.04), SIMD3<Float>(-s.x / 2 - 0.02, y, 0)),
                (SIMD3<Float>(t, 0.002, s.z + 0.04), SIMD3<Float>(s.x / 2 + 0.02, y, 0)),
            ] {
                let e = ModelEntity(mesh: .generateBox(size: sz), materials: [line])
                e.position = p
                o.addChild(e)
            }
            addChild(o)
            outline = o
        } else if !on {
            outline?.removeFromParent()
            outline = nil
        }
    }
}

private extension Entity {
    var cabinetAncestor: CabinetEntity? {
        var e: Entity? = self
        while let cur = e {
            if let c = cur as? CabinetEntity { return c }
            e = cur.parent
        }
        return nil
    }
}

extension UIColor {
    convenience init(hex: String) {
        var s = hex.trimmingCharacters(in: .whitespaces)
        if s.hasPrefix("#") { s.removeFirst() }
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        self.init(red: CGFloat((v >> 16) & 0xff) / 255, green: CGFloat((v >> 8) & 0xff) / 255, blue: CGFloat(v & 0xff) / 255, alpha: 1)
    }
}

extension UIImage {
    /// JPEG no larger than maxSide on its long edge.
    func scaledJPEG(maxSide: CGFloat, quality: CGFloat = 0.8) -> Data? {
        let k = min(1, maxSide / max(size.width, size.height))
        if k >= 1 { return jpegData(compressionQuality: quality) }
        let target = CGSize(width: size.width * k, height: size.height * k)
        let fmt = UIGraphicsImageRendererFormat()
        fmt.scale = 1
        let img = UIGraphicsImageRenderer(size: target, format: fmt).image { _ in draw(in: CGRect(origin: .zero, size: target)) }
        return img.jpegData(compressionQuality: quality)
    }
}
