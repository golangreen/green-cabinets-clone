import UIKit
import ARKit
import AVFoundation
import VisionKit

/// Opens the camera tools full screen, the way the system presents its own
/// cameras, and hands the results back. Each tool dismisses itself.
@MainActor
enum Tools {
    static var arSupported: Bool {
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-fakeAR") { return true }
        #endif
        return ARWorldTrackingConfiguration.isSupported
    }

    static var docScanSupported: Bool { VNDocumentCameraViewController.isSupported }

    /// The view controller on top, to present from.
    static func top() -> UIViewController? {
        let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first { $0.activationState == .foregroundActive }
            ?? UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
        var vc = scene?.windows.first { $0.isKeyWindow }?.rootViewController ?? scene?.windows.first?.rootViewController
        while let next = vc?.presentedViewController { vc = next }
        return vc
    }

    // MARK: Camera access

    /// Every tool needs the camera. The first time, iOS asks; if it was turned
    /// off for the app, say so and offer Settings instead of a black screen.
    private static func withCamera(_ go: @escaping () -> Void, otherwise: @escaping () -> Void = {}) {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            go()
        case .notDetermined:
            Task { @MainActor in
                if await AVCaptureDevice.requestAccess(for: .video) { go() } else { otherwise() }
            }
        default:
            cameraOff()
            otherwise()
        }
    }

    private static func cameraOff() {
        guard let host = top() else { return }
        let alert = UIAlertController(title: "The camera is off for Green Cabinets",
                                      message: "Turn on Camera for Green Cabinets in Settings to use this tool.",
                                      preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Not now", style: .cancel))
        let settings = UIAlertAction(title: "Open Settings", style: .default) { _ in
            if let url = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(url) }
        }
        alert.addAction(settings)
        alert.preferredAction = settings
        host.present(alert, animated: true)
    }

    // MARK: AR

    static func openCabinets(finishes: [Finish], done: @escaping ([UIImage]) -> Void) {
        guard arSupported else { return }
        withCamera {
            guard let host = top() else { return }
            let vc = ARDesignViewController(finishes: finishes)
            vc.onDone = done
            vc.modalPresentationStyle = .fullScreen
            host.present(vc, animated: true)
        }
    }

    static func openMeasure(unit: LengthUnit, done: @escaping ([Double], [UIImage]) -> Void) {
        guard arSupported else { return }
        withCamera {
            guard let host = top() else { return }
            let vc = ARMeasureViewController(unit: unit)
            vc.onDone = done
            vc.modalPresentationStyle = .fullScreen
            host.present(vc, animated: true)
        }
    }

    // MARK: Drawings

    private static var scanDelegate: DocScanDelegate?

    static func scanDocuments(done: @escaping ([UIImage]) -> Void) {
        guard docScanSupported else { return }
        withCamera {
            guard let host = top() else { return }
            let vc = VNDocumentCameraViewController()
            let delegate = DocScanDelegate { pages in
                scanDelegate = nil
                done(pages)
            }
            scanDelegate = delegate
            vc.delegate = delegate
            host.present(vc, animated: true)
        }
    }

    // MARK: Room scan

    static func scanRoom(several: Bool, done: @escaping (ScannedRoom?) -> Void) {
        #if canImport(RoomPlan) && !targetEnvironment(macCatalyst)
        guard #available(iOS 16.0, *), RoomCapture.isSupported else { done(nil); return }
        withCamera({
            guard let host = top() else { done(nil); return }
            let vc = RoomScanViewController(labels: [:], several: several)
            vc.onDone = { dict in
                guard let data = try? JSONSerialization.data(withJSONObject: dict),
                      let room = try? JSONDecoder().decode(ScannedRoom.self, from: data) else { done(nil); return }
                done(room)
            }
            vc.onCancel = { done(nil) }
            vc.modalPresentationStyle = .fullScreen
            host.present(vc, animated: true)
        }, otherwise: { done(nil) })
        #else
        done(nil)
        #endif
    }
}

/// Apple's document scanner: finds the page, flattens it and evens the light.
final class DocScanDelegate: NSObject, VNDocumentCameraViewControllerDelegate {
    private let finish: ([UIImage]) -> Void
    init(_ finish: @escaping ([UIImage]) -> Void) { self.finish = finish }

    func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
        let pages = (0..<min(scan.pageCount, 10)).map { scan.imageOfPage(at: $0) }
        controller.dismiss(animated: true) { self.finish(pages) }
    }
    func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
        controller.dismiss(animated: true) { self.finish([]) }
    }
    func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
        controller.dismiss(animated: true) { self.finish([]) }
    }
}
