import Foundation
import UIKit
import Capacitor
import VisionKit

/// Apple's document scanner for drawings and floor plans: it finds the page
/// edges, flattens it and evens out the light, one page or many. Each page
/// comes back to the page as a JPEG.
@objc(DocScanPlugin)
public class DocScanPlugin: CAPPlugin, CAPBridgedPlugin, VNDocumentCameraViewControllerDelegate {
    public let identifier = "DocScanPlugin"
    public let jsName = "DocScan"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "available", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scan", returnType: CAPPluginReturnPromise)
    ]
    private var pending: CAPPluginCall?

    @objc func available(_ call: CAPPluginCall) {
        call.resolve(["ok": VNDocumentCameraViewController.isSupported])
    }

    @objc func scan(_ call: CAPPluginCall) {
        guard VNDocumentCameraViewController.isSupported else { call.reject("unavailable"); return }
        pending = call
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let host = self.bridge?.viewController else { call.reject("no view"); return }
            let vc = VNDocumentCameraViewController()
            vc.delegate = self
            host.present(vc, animated: true)
        }
    }

    public func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
        var pages: [String] = []
        for i in 0..<min(scan.pageCount, 10) {
            if let d = scan.imageOfPage(at: i).scaledJPEG(maxSide: 2000, quality: 0.75) { pages.append(d.base64EncodedString()) }
        }
        controller.dismiss(animated: true) { [weak self] in
            self?.pending?.resolve(["pages": pages])
            self?.pending = nil
        }
    }

    public func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
        controller.dismiss(animated: true) { [weak self] in
            self?.pending?.resolve(["pages": []])
            self?.pending = nil
        }
    }

    public func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
        controller.dismiss(animated: true) { [weak self] in
            self?.pending?.reject("failed")
            self?.pending = nil
        }
    }
}
