import Foundation
import UIKit
import Capacitor
#if canImport(RoomPlan) && !targetEnvironment(macCatalyst)
import RoomPlan
import simd
#endif

/// Walk the room once, get a measured floor plan.
///
/// Apple's RoomPlan (LiDAR iPhones and iPads, iOS 16+) runs its own guided
/// scan - the live outline of walls, doors, windows and cabinets builds up as
/// the person walks around. When they tap Done, the finished room comes back
/// as a top view: every wall as a segment with its length and height, every
/// door, window and opening on its wall, and the fixed objects (cabinets,
/// sink, stove, fridge, toilet, tub...) as footprints. Meters, in the room's
/// own coordinates seen from above (x to the right, z toward the viewer).
/// The web app draws the room in 3D from that, in feet and inches, and the
/// client can send it to Green Cabinets. (Ported from the Punchlee app, same
/// owner; only the colors and wording differ.)
@objc(RoomScanPlugin)
public class RoomScanPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RoomScanPlugin"
    public let jsName = "RoomScan"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "available", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scan", returnType: CAPPluginReturnPromise)
    ]

    @objc func available(_ call: CAPPluginCall) {
        #if DEBUG
        // Store screenshots from the Simulator (no LiDAR): `-fakeLidar` shows the
        // screen a LiDAR iPhone sees. Compiled out of App Store builds.
        if ProcessInfo.processInfo.arguments.contains("-fakeLidar") { call.resolve(["ok": true, "multi": true]); return }
        #endif
        #if canImport(RoomPlan) && !targetEnvironment(macCatalyst)
        if #available(iOS 17.0, *) { call.resolve(["ok": RoomCaptureSession.isSupported, "multi": RoomCaptureSession.isSupported]); return }
        if #available(iOS 16.0, *) { call.resolve(["ok": RoomCaptureSession.isSupported, "multi": false]); return }
        #endif
        call.resolve(["ok": false])
    }

    @objc func scan(_ call: CAPPluginCall) {
        #if canImport(RoomPlan) && !targetEnvironment(macCatalyst)
        if #available(iOS 16.0, *), RoomCaptureSession.isSupported {
            let labels = call.getObject("labels") as? [String: String] ?? [:]
            let several = call.getBool("multi") ?? false
            DispatchQueue.main.async { [weak self] in
                let vc = RoomScanViewController(labels: labels, several: several)
                vc.onDone = { call.resolve($0) }
                vc.onCancel = { call.reject("cancelled") }
                vc.modalPresentationStyle = .fullScreen
                guard let host = self?.bridge?.viewController else { call.reject("no view"); return }
                host.present(vc, animated: true)
            }
            return
        }
        #endif
        call.reject("unavailable")
    }
}

#if canImport(RoomPlan) && !targetEnvironment(macCatalyst)
@available(iOS 16.0, *)
final class RoomScanViewController: UIViewController, RoomCaptureViewDelegate, RoomCaptureSessionDelegate {
    private let labels: [String: String]
    var onDone: (([String: Any]) -> Void)?
    var onCancel: (() -> Void)?
    private var captureView: RoomCaptureView!
    private let doneButton = UIButton(type: .system)
    private let cancelButton = UIButton(type: .system)
    private let hint = UILabel()
    private let nextButton = UIButton(type: .system)
    private var finishing = false
    /// Rooms scanned so far in this walk. One AR session runs through all of
    /// them (iOS 17+), so they share one coordinate space and join up into a
    /// single plan of the whole apartment.
    private var rooms: [CapturedRoom] = []
    private var multi: Bool { if #available(iOS 17.0, *) { return several }; return false }

    /// The person chose "several rooms": show Next room at each doorway.
    private let several: Bool
    init(labels: [String: String], several: Bool) { self.labels = labels; self.several = several; super.init(nibName: nil, bundle: nil) }
    required init?(coder: NSCoder) { fatalError() }
    override var prefersStatusBarHidden: Bool { true }
    private func L(_ k: String, _ f: String) -> String { labels[k] ?? f }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        captureView = RoomCaptureView(frame: view.bounds)
        captureView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        captureView.delegate = self
        captureView.captureSession.delegate = self
        view.addSubview(captureView)

        // Green Cabinets brass on warm black
        let amber = UIColor(red: 0.776, green: 0.631, blue: 0.357, alpha: 1)
        let ink = UIColor(red: 0.055, green: 0.051, blue: 0.047, alpha: 1)
        for (b, title, primary) in [(cancelButton, L("cancel", "Cancel"), false), (doneButton, L("done", "Done"), true)] {
            b.translatesAutoresizingMaskIntoConstraints = false
            var cfg = UIButton.Configuration.filled()
            cfg.title = title
            cfg.cornerStyle = .capsule
            cfg.contentInsets = NSDirectionalEdgeInsets(top: 12, leading: 22, bottom: 12, trailing: 22)
            cfg.baseBackgroundColor = primary ? amber : UIColor.black.withAlphaComponent(0.55)
            cfg.baseForegroundColor = primary ? ink : .white
            cfg.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { a in var a = a; a.font = UIFont.systemFont(ofSize: 17, weight: .bold); return a }
            b.configuration = cfg
            view.addSubview(b)
        }
        cancelButton.addTarget(self, action: #selector(cancel), for: .touchUpInside)
        if multi {
            nextButton.translatesAutoresizingMaskIntoConstraints = false
            var cfg = UIButton.Configuration.filled()
            cfg.title = L("next", "Next room")
            cfg.image = UIImage(systemName: "door.left.hand.open")
            cfg.imagePadding = 6
            cfg.cornerStyle = .capsule
            cfg.contentInsets = NSDirectionalEdgeInsets(top: 12, leading: 18, bottom: 12, trailing: 18)
            cfg.baseBackgroundColor = UIColor.black.withAlphaComponent(0.6)
            cfg.baseForegroundColor = .white
            cfg.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { a in var a = a; a.font = UIFont.systemFont(ofSize: 17, weight: .bold); return a }
            nextButton.configuration = cfg
            nextButton.addTarget(self, action: #selector(nextRoom), for: .touchUpInside)
            view.addSubview(nextButton)
        }
        doneButton.addTarget(self, action: #selector(finish), for: .touchUpInside)

        hint.translatesAutoresizingMaskIntoConstraints = false
        hint.text = L("hint", "Walk slowly around the room, pointing at the walls, corners and floor. Tap Done when the outline is complete.")
        hint.numberOfLines = 0
        hint.textAlignment = .center
        hint.textColor = .white
        hint.font = .systemFont(ofSize: 15, weight: .semibold)
        hint.backgroundColor = UIColor.black.withAlphaComponent(0.55)
        hint.layer.cornerRadius = 14
        hint.layer.masksToBounds = true
        view.addSubview(hint)

        let g = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            cancelButton.topAnchor.constraint(equalTo: g.topAnchor, constant: 8),
            cancelButton.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 12),
            doneButton.centerYAnchor.constraint(equalTo: cancelButton.centerYAnchor),
            doneButton.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -12),
            hint.bottomAnchor.constraint(equalTo: g.bottomAnchor, constant: -16),
            hint.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 16),
            hint.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -16),
            hint.heightAnchor.constraint(greaterThanOrEqualToConstant: 56)
        ])
        if multi {
            NSLayoutConstraint.activate([
                nextButton.bottomAnchor.constraint(equalTo: hint.topAnchor, constant: -12),
                nextButton.centerXAnchor.constraint(equalTo: view.centerXAnchor)
            ])
        }
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        captureView.captureSession.run(configuration: RoomCaptureSession.Configuration())
        UIApplication.shared.isIdleTimerDisabled = true
    }
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        UIApplication.shared.isIdleTimerDisabled = false
    }

    @objc private func cancel() {
        captureView.captureSession.stop()
        dismiss(animated: true) { [onCancel] in onCancel?() }
    }
    /// At a doorway: close this room, keep the same AR session, start the next.
    @objc private func nextRoom() {
        guard !finishing, #available(iOS 17.0, *) else { return }
        nextButton.isEnabled = false
        hint.text = L("saving", "Saving this room…")
        captureView.captureSession.stop(pauseARSession: false)
    }

    @objc private func finish() {
        guard !finishing else { return }
        finishing = true
        doneButton.isEnabled = false
        hint.text = L("building", "Building your room…")
        if #available(iOS 17.0, *) { captureView.captureSession.stop(pauseARSession: false) }
        else { captureView.captureSession.stop() } // RoomPlan then hands the finished room to the delegate below
    }

    // RoomCaptureViewDelegate: let RoomPlan polish the result, then send it on.
    func captureView(shouldPresent roomDataForProcessing: CapturedRoomData, error: Error?) -> Bool { true }
    func captureView(didPresent processedResult: CapturedRoom, error: Error?) {
        rooms.append(processedResult)
        if !finishing {
            // Next room: scanning carries on in the same session.
            hint.text = (labels["room"] ?? "Room {0} saved - walk into the next room and keep scanning.")
                .replacingOccurrences(of: "{0}", with: "\(rooms.count)")
            nextButton.isEnabled = true
            captureView.captureSession.run(configuration: RoomCaptureSession.Configuration())
            return
        }
        let scanned = rooms
        Task { @MainActor in
            let out = await Self.export(scanned)
            self.dismiss(animated: true) { [onDone = self.onDone] in onDone?(out) }
        }
    }

    /// All rooms as one plan: Apple's StructureBuilder joins them and cleans
    /// up shared walls (iOS 17); if that fails the rooms already share one
    /// coordinate space, so laying them side by side still lines up.
    static func export(_ rooms: [CapturedRoom]) async -> [String: Any] {
        if #available(iOS 17.0, *), rooms.count > 1,
           let s = try? await StructureBuilder(options: [.beautifyObjects]).capturedStructure(from: rooms) {
            return topView(walls: s.walls, doors: s.doors, windows: s.windows, openings: s.openings, objects: s.objects,
                           floors: s.floors, sections: s.sections, rooms: rooms.count)
        }
        if #available(iOS 17.0, *) {
            return topView(walls: rooms.flatMap(\.walls), doors: rooms.flatMap(\.doors), windows: rooms.flatMap(\.windows),
                           openings: rooms.flatMap(\.openings), objects: rooms.flatMap(\.objects),
                           floors: rooms.flatMap(\.floors), sections: rooms.flatMap(\.sections), rooms: rooms.count)
        }
        return topView(walls: rooms.flatMap(\.walls), doors: rooms.flatMap(\.doors), windows: rooms.flatMap(\.windows),
                       openings: rooms.flatMap(\.openings), objects: rooms.flatMap(\.objects), floors: [], sections: [], rooms: rooms.count)
    }

    // MARK: the room, seen from above

    private static func top(_ t: simd_float4x4) -> (c: [Double], ax: simd_float2) {
        let c = t.columns.3, x = t.columns.0
        var ax = simd_float2(x.x, x.z)
        if simd_length(ax) > 1e-5 { ax = simd_normalize(ax) }
        return ([Double(c.x), Double(c.z)], ax)
    }
    private static func segment(_ s: CapturedRoom.Surface) -> [String: Any] {
        let (c, ax) = top(s.transform)
        let half = Double(s.dimensions.x) / 2
        return ["a": [c[0] - Double(ax.x) * half, c[1] - Double(ax.y) * half],
                "b": [c[0] + Double(ax.x) * half, c[1] + Double(ax.y) * half],
                "len": Double(s.dimensions.x), "h": Double(s.dimensions.y), "y": Double(s.transform.columns.3.y)]
    }
    private static func category(_ c: CapturedRoom.Object.Category) -> String {
        switch c {
        case .storage: return "cabinet"
        case .refrigerator: return "fridge"
        case .stove: return "stove"
        case .oven: return "oven"
        case .sink: return "sink"
        case .dishwasher: return "dishwasher"
        case .washerDryer: return "washer"
        case .toilet: return "toilet"
        case .bathtub: return "tub"
        case .bed: return "bed"
        case .table: return "table"
        case .sofa: return "sofa"
        case .chair: return "chair"
        case .fireplace: return "fireplace"
        case .television: return "tv"
        case .stairs: return "stairs"
        @unknown default: return "object"
        }
    }

    /// Room types RoomPlan recognized (iOS 17): name and where the room is.
    private static func sectionList(_ sections: [Any]) -> [[String: Any]] {
        guard #available(iOS 17.0, *) else { return [] }
        return sections.compactMap { $0 as? CapturedRoom.Section }.map { sec in
            let label: String
            switch sec.label {
            case .kitchen: label = "kitchen"
            case .bathroom: label = "bathroom"
            case .bedroom: label = "bedroom"
            case .livingRoom: label = "living"
            case .diningRoom: label = "dining"
            default: label = "room"
            }
            return ["label": label, "c": [Double(sec.center.x), Double(sec.center.z)]]
        }
    }
    /// Each floor's outline seen from above - the exact area of every room.
    private static func floorList(_ floors: [CapturedRoom.Surface]) -> [[String: Any]] {
        guard #available(iOS 17.0, *) else { return [] }
        return floors.compactMap { f in
            let pts = f.polygonCorners.map { p -> [Double] in
                let w = f.transform * simd_float4(p.x, p.y, p.z, 1)
                return [Double(w.x), Double(w.z)]
            }
            return pts.count >= 3 ? ["poly": pts, "y": Double(f.transform.columns.3.y)] : nil
        }
    }

    static func topView(walls: [CapturedRoom.Surface], doors: [CapturedRoom.Surface], windows: [CapturedRoom.Surface],
                        openings: [CapturedRoom.Surface], objects: [CapturedRoom.Object], floors: [CapturedRoom.Surface],
                        sections: [Any], rooms: Int) -> [String: Any] {
        var doorList: [[String: Any]] = []
        for d in doors {
            var s = segment(d)
            if case .door(let isOpen) = d.category { s["open"] = isOpen }
            doorList.append(s)
        }
        let objectList: [[String: Any]] = objects.map { o in
            let (c, ax) = top(o.transform)
            return ["c": c, "ax": [Double(ax.x), Double(ax.y)], "w": Double(o.dimensions.x), "d": Double(o.dimensions.z),
                    "h": Double(o.dimensions.y), "y": Double(o.transform.columns.3.y), "cat": category(o.category)]
        }
        return [
            "v": 2, "rooms": rooms,
            "walls": walls.map(segment),
            "doors": doorList,
            "windows": windows.map(segment),
            "openings": openings.map(segment),
            "objects": objectList,
            "floors": floorList(floors),
            "sections": sectionList(sections)
        ]
    }
}
#endif
