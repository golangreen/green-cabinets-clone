import Foundation
import UIKit
import Capacitor
import ARKit
import RealityKit
import Combine

/// A tape measure in the camera, on every iPhone and iPad with ARKit.
///
/// A ring in the middle of the screen sits on whatever surface it points at
/// (floor, wall, counter). Tap + to start a line, move the phone to the other
/// end, tap + again: the length shows on the line. Measure as many as needed;
/// the shutter saves a picture with the lengths written on it, and Done hands
/// the lengths and pictures back to the page.
@objc(ARMeasurePlugin)
public class ARMeasurePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ARMeasurePlugin"
    public let jsName = "ARMeasure"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise)
    ]

    @objc func open(_ call: CAPPluginCall) {
        guard ARWorldTrackingConfiguration.isSupported else { call.reject("unavailable"); return }
        let unit = call.getString("unit") ?? "ftin"
        DispatchQueue.main.async { [weak self] in
            let vc = ARMeasureViewController(unit: unit)
            vc.onDone = { lengths, photos in call.resolve(["lengths": lengths, "photos": photos]) }
            vc.modalPresentationStyle = .fullScreen
            guard let host = self?.bridge?.viewController else { call.reject("no view"); return }
            host.present(vc, animated: true)
        }
    }
}

final class ARMeasureViewController: UIViewController {
    var onDone: (([Double], [String]) -> Void)?

    private struct Line {
        let a: SIMD3<Float>
        let b: SIMD3<Float>
        let anchor: AnchorEntity
        let label: UILabel
        var meters: Float { simd_distance(a, b) }
    }

    private let unit: String
    private var arView: ARView!
    private let coaching = ARCoachingOverlayView()
    private let reticle = UIView()
    private let hint = UILabel()
    private let addButton = UIButton(type: .custom)
    private let undoButton = UIButton(type: .system)
    private let shutter = UIButton(type: .custom)
    private let doneButton = UIButton(type: .system)
    private let closeButton = UIButton(type: .system)
    private let liveLabel = UILabel()
    private var lines: [Line] = []
    private var start: SIMD3<Float>?
    private var startAnchor: AnchorEntity?
    private var live: ModelEntity?
    private var current: SIMD3<Float>?
    private var photos: [String] = []
    private var tick: Cancellable?

    private let ink = UIColor(red: 14 / 255, green: 13 / 255, blue: 12 / 255, alpha: 1)
    private let ivory = UIColor(red: 242 / 255, green: 236 / 255, blue: 226 / 255, alpha: 1)
    private let brass = UIColor(red: 198 / 255, green: 161 / 255, blue: 91 / 255, alpha: 1)

    init(unit: String) {
        self.unit = unit
        super.init(nibName: nil, bundle: nil)
    }
    required init?(coder: NSCoder) { fatalError() }

    override var prefersStatusBarHidden: Bool { true }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        arView = ARView(frame: view.bounds)
        arView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(arView)

        coaching.session = arView.session
        coaching.goal = .anyPlane
        coaching.activatesAutomatically = true
        coaching.frame = view.bounds
        coaching.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        arView.addSubview(coaching)

        buildChrome()
        tick = arView.scene.subscribe(to: SceneEvents.Update.self) { [weak self] _ in self?.update() }
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        let config = ARWorldTrackingConfiguration()
        config.planeDetection = [.horizontal, .vertical]
        if ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) { config.sceneReconstruction = .mesh }
        arView.session.run(config)
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        arView.session.pause()
    }

    // MARK: - Lengths

    private func format(_ m: Float) -> String {
        let inches = Double(m) / 0.0254
        switch unit {
        case "cm": return String(format: "%.1f cm", Double(m) * 100)
        case "in": return String(format: "%.1f\"", inches)
        default:
            // Feet and inches to the nearest quarter inch
            let q = (inches * 4).rounded() / 4
            let ft = Int(q / 12)
            let rest = q - Double(ft) * 12
            let r = rest == rest.rounded() ? String(Int(rest)) : String(format: "%g", rest)
            return ft > 0 ? "\(ft)' \(r)\"" : "\(r)\""
        }
    }

    private func pillLabel(_ l: UILabel) {
        l.font = .monospacedDigitSystemFont(ofSize: 16, weight: .semibold)
        l.textColor = ink
        l.backgroundColor = ivory
        l.textAlignment = .center
        l.layer.cornerRadius = 14
        l.clipsToBounds = true
    }

    private func sizeLabel(_ l: UILabel) {
        let s = l.intrinsicContentSize
        l.bounds = CGRect(x: 0, y: 0, width: s.width + 22, height: 30)
    }

    // Every frame: the ring finds the surface, the open line follows it, labels follow their lines
    private func update() {
        let center = CGPoint(x: arView.bounds.midX, y: arView.bounds.midY)
        let hit = arView.raycast(from: center, allowing: .estimatedPlane, alignment: .any).first
        if let h = hit {
            current = SIMD3<Float>(h.worldTransform.columns.3.x, h.worldTransform.columns.3.y, h.worldTransform.columns.3.z)
            reticle.layer.borderColor = brass.cgColor
            addButton.isEnabled = true
            addButton.alpha = 1
        } else {
            current = nil
            reticle.layer.borderColor = ivory.withAlphaComponent(0.5).cgColor
            addButton.isEnabled = false
            addButton.alpha = 0.5
        }

        if let a = start, let b = current {
            drawLive(a, b)
            liveLabel.text = format(simd_distance(a, b))
            sizeLabel(liveLabel)
            liveLabel.isHidden = false
            if let p = arView.project((a + b) / 2) { liveLabel.center = p }
        } else {
            liveLabel.isHidden = true
        }

        for l in lines {
            if let p = arView.project((l.a + l.b) / 2), inFront((l.a + l.b) / 2) {
                l.label.center = p
                l.label.isHidden = false
            } else {
                l.label.isHidden = true
            }
        }
    }

    private func inFront(_ p: SIMD3<Float>) -> Bool {
        let cam = arView.cameraTransform
        let fwd = -SIMD3<Float>(cam.matrix.columns.2.x, cam.matrix.columns.2.y, cam.matrix.columns.2.z)
        return simd_dot(p - cam.translation, fwd) > 0
    }

    private func segment(_ a: SIMD3<Float>, _ b: SIMD3<Float>, color: UIColor) -> ModelEntity {
        let len = max(simd_distance(a, b), 0.0001)
        let e = ModelEntity(mesh: .generateBox(size: [0.004, 0.004, len]), materials: [UnlitMaterial(color: color)])
        e.position = (a + b) / 2
        e.orientation = simd_quatf(from: [0, 0, 1], to: simd_normalize(b - a))
        return e
    }

    private func dot(_ p: SIMD3<Float>) -> AnchorEntity {
        let anchor = AnchorEntity(world: p)
        anchor.addChild(ModelEntity(mesh: .generateSphere(radius: 0.006), materials: [UnlitMaterial(color: ivory)]))
        arView.scene.addAnchor(anchor)
        return anchor
    }

    private func drawLive(_ a: SIMD3<Float>, _ b: SIMD3<Float>) {
        live?.removeFromParent()
        let seg = segment(a, b, color: brass)
        startAnchor?.addChild(seg)
        // Child of the start dot, so position it relative to that point
        seg.position = seg.position - a
        live = seg
    }

    @objc private func addPoint() {
        guard let p = current else { return }
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        if let a = start {
            live?.removeFromParent()
            live = nil
            let anchor = startAnchor ?? dot(a)
            let seg = segment(a, p, color: brass)
            seg.position = seg.position - a
            anchor.addChild(seg)
            let end = ModelEntity(mesh: .generateSphere(radius: 0.006), materials: [UnlitMaterial(color: ivory)])
            end.position = p - a
            anchor.addChild(end)
            let label = UILabel()
            pillLabel(label)
            label.text = format(simd_distance(a, p))
            sizeLabel(label)
            view.insertSubview(label, belowSubview: hint)
            lines.append(Line(a: a, b: p, anchor: anchor, label: label))
            start = nil
            startAnchor = nil
            hint.text = "\(lines.count) measured. Tap + to measure another."
        } else {
            start = p
            startAnchor = dot(p)
            hint.text = "Move to the other end and tap + again"
        }
        undoButton.isHidden = lines.isEmpty && start == nil
    }

    @objc private func undo() {
        if start != nil {
            startAnchor?.removeFromParent()
            start = nil
            startAnchor = nil
            live = nil
        } else if let last = lines.popLast() {
            last.anchor.removeFromParent()
            last.label.removeFromSuperview()
        }
        undoButton.isHidden = lines.isEmpty && start == nil
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    // MARK: - Pictures

    /// The camera picture with the lengths written on it, like on screen.
    private func capture(_ done: @escaping () -> Void) {
        let shown = lines.filter { !$0.label.isHidden }.map { ($0.label.text ?? "", $0.label.center) }
        let viewSize = arView.bounds.size
        arView.snapshot(saveToHDR: false) { [weak self] image in
            guard let self = self, let image = image else { done(); return }
            let k = image.size.width / viewSize.width
            let out = UIGraphicsImageRenderer(size: image.size).image { _ in
                image.draw(at: .zero)
                let font = UIFont.monospacedDigitSystemFont(ofSize: 16 * k, weight: .semibold)
                for (text, c) in shown {
                    let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: self.ink]
                    let ts = (text as NSString).size(withAttributes: attrs)
                    let r = CGRect(x: c.x * k - ts.width / 2 - 11 * k, y: c.y * k - 15 * k, width: ts.width + 22 * k, height: 30 * k)
                    self.ivory.setFill()
                    UIBezierPath(roundedRect: r, cornerRadius: 14 * k).fill()
                    (text as NSString).draw(at: CGPoint(x: r.midX - ts.width / 2, y: r.midY - ts.height / 2), withAttributes: attrs)
                }
            }
            if let d = out.scaledJPEG(maxSide: 1800) { self.photos.append(d.base64EncodedString()) }
            done()
        }
    }

    @objc private func takePicture() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        let flash = UIView(frame: view.bounds)
        flash.backgroundColor = .white
        view.addSubview(flash)
        UIView.animate(withDuration: 0.25, animations: { flash.alpha = 0 }) { _ in flash.removeFromSuperview() }
        capture { [weak self] in
            guard let self = self else { return }
            self.shutter.setTitle("\(self.photos.count)", for: .normal)
        }
    }

    private func finish() {
        tick?.cancel()
        let lengths = lines.map { Double($0.meters) }
        let photos = self.photos
        dismiss(animated: true) { [weak self] in self?.onDone?(lengths, photos) }
    }

    @objc private func close() { finish() }

    @objc private func done() {
        // Keep one picture of the lines if none was taken
        if photos.isEmpty && !lines.isEmpty { capture { [weak self] in self?.finish() } } else { finish() }
    }

    // MARK: - Layout

    private func pill(_ b: UIButton, _ title: String, filled: Bool = false) {
        b.setTitle(title, for: .normal)
        b.titleLabel?.font = .systemFont(ofSize: 15, weight: .semibold)
        b.setTitleColor(filled ? ink : ivory, for: .normal)
        b.backgroundColor = filled ? ivory : ink.withAlphaComponent(0.72)
        b.layer.cornerRadius = 22
        b.contentEdgeInsets = UIEdgeInsets(top: 0, left: 16, bottom: 0, right: 16)
        b.translatesAutoresizingMaskIntoConstraints = false
        b.heightAnchor.constraint(greaterThanOrEqualToConstant: 44).isActive = true
    }

    private func buildChrome() {
        reticle.translatesAutoresizingMaskIntoConstraints = false
        reticle.isUserInteractionEnabled = false
        reticle.layer.cornerRadius = 18
        reticle.layer.borderWidth = 2.5
        reticle.layer.borderColor = ivory.withAlphaComponent(0.5).cgColor
        let pin = UIView()
        pin.backgroundColor = ivory
        pin.layer.cornerRadius = 3
        pin.translatesAutoresizingMaskIntoConstraints = false
        reticle.addSubview(pin)
        view.addSubview(reticle)

        pillLabel(liveLabel)
        liveLabel.isHidden = true
        view.addSubview(liveLabel)

        hint.text = "Point the ring at one end and tap +"
        hint.textColor = ivory
        hint.font = .systemFont(ofSize: 15, weight: .medium)
        hint.numberOfLines = 0
        hint.textAlignment = .center
        hint.backgroundColor = ink.withAlphaComponent(0.6)
        hint.layer.cornerRadius = 12
        hint.clipsToBounds = true
        hint.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(hint)

        pill(closeButton, "Close")
        closeButton.addTarget(self, action: #selector(close), for: .touchUpInside)
        pill(doneButton, "Done", filled: true)
        doneButton.addTarget(self, action: #selector(done), for: .touchUpInside)
        pill(undoButton, "Undo")
        undoButton.isHidden = true
        undoButton.addTarget(self, action: #selector(undo), for: .touchUpInside)
        [closeButton, doneButton, undoButton].forEach(view.addSubview)

        addButton.translatesAutoresizingMaskIntoConstraints = false
        addButton.backgroundColor = ivory
        addButton.layer.cornerRadius = 36
        addButton.layer.borderWidth = 4
        addButton.layer.borderColor = brass.cgColor
        addButton.setTitle("+", for: .normal)
        addButton.setTitleColor(ink, for: .normal)
        addButton.titleLabel?.font = .systemFont(ofSize: 38, weight: .light)
        addButton.accessibilityLabel = "Add a point"
        addButton.addTarget(self, action: #selector(addPoint), for: .touchUpInside)
        view.addSubview(addButton)

        shutter.translatesAutoresizingMaskIntoConstraints = false
        shutter.backgroundColor = ink.withAlphaComponent(0.72)
        shutter.layer.cornerRadius = 26
        shutter.layer.borderWidth = 2
        shutter.layer.borderColor = ivory.cgColor
        shutter.setTitleColor(ivory, for: .normal)
        shutter.titleLabel?.font = .systemFont(ofSize: 15, weight: .semibold)
        shutter.accessibilityLabel = "Take a picture"
        shutter.addTarget(self, action: #selector(takePicture), for: .touchUpInside)
        view.addSubview(shutter)

        let g = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            reticle.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            reticle.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            reticle.widthAnchor.constraint(equalToConstant: 36),
            reticle.heightAnchor.constraint(equalToConstant: 36),
            pin.centerXAnchor.constraint(equalTo: reticle.centerXAnchor),
            pin.centerYAnchor.constraint(equalTo: reticle.centerYAnchor),
            pin.widthAnchor.constraint(equalToConstant: 6),
            pin.heightAnchor.constraint(equalToConstant: 6),

            closeButton.topAnchor.constraint(equalTo: g.topAnchor, constant: 12),
            closeButton.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 16),
            doneButton.topAnchor.constraint(equalTo: g.topAnchor, constant: 12),
            doneButton.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -16),
            hint.topAnchor.constraint(equalTo: closeButton.bottomAnchor, constant: 12),
            hint.centerXAnchor.constraint(equalTo: g.centerXAnchor),
            hint.widthAnchor.constraint(lessThanOrEqualTo: g.widthAnchor, constant: -48),

            addButton.bottomAnchor.constraint(equalTo: g.bottomAnchor, constant: -16),
            addButton.centerXAnchor.constraint(equalTo: g.centerXAnchor),
            addButton.widthAnchor.constraint(equalToConstant: 72),
            addButton.heightAnchor.constraint(equalToConstant: 72),
            undoButton.centerYAnchor.constraint(equalTo: addButton.centerYAnchor),
            undoButton.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 20),
            shutter.centerYAnchor.constraint(equalTo: addButton.centerYAnchor),
            shutter.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -24),
            shutter.widthAnchor.constraint(equalToConstant: 52),
            shutter.heightAnchor.constraint(equalToConstant: 52),
        ])
    }
}
