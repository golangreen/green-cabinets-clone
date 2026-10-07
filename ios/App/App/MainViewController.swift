import UIKit
import WebKit
import Capacitor

/// The app's web view. Registers the native room scan so the page can call it
/// as `RoomScan` (see src/lib/scan/roomScan.ts).
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(RoomScanPlugin())
        #if DEBUG
        installDebugStart()
        #endif
    }

    // The site is dark; keep the status bar light on it.
    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }

    #if DEBUG
    /// Debug builds only (screenshots, checks). Compiled out of App Store builds.
    ///   -startPath /scan?sample=1   open the app on that page
    ///   -scrollTo #pricing          then scroll to that element
    ///   -scrollBy 60                plus or minus this many points
    private func installDebugStart() {
        let args = ProcessInfo.processInfo.arguments
        func arg(_ k: String) -> String? {
            guard let i = args.firstIndex(of: k), i + 1 < args.count else { return nil }
            return args[i + 1]
        }
        let path = arg("-startPath") ?? ""
        let sel = arg("-scrollTo") ?? ""
        let by = Double(arg("-scrollBy") ?? "0") ?? 0
        guard !path.isEmpty || !sel.isEmpty else { return }
        let js = """
        (function () {
          var path = \(String(reflecting: path)), sel = \(String(reflecting: sel)), by = \(by), tries = 0;
          function ready() { return document.querySelector('#root > *'); }
          function scroll() {
            if (!sel) return;
            var e = document.querySelector(sel);
            if (!e) { if (tries++ < 40) setTimeout(scroll, 250); return; }
            window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY + by);
          }
          function go() {
            if (!ready()) { setTimeout(go, 200); return; }
            if (path) { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')); }
            setTimeout(scroll, 1800);
          }
          go();
        })();
        """
        bridge?.webView?.configuration.userContentController.addUserScript(
            WKUserScript(source: js, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
    }
    #endif
}
