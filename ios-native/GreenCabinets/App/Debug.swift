import Foundation

/// Launch options for screenshots and checks. Debug builds only; App Store builds always get nil.
enum DebugLaunch {
    static func value(_ key: String) -> String? {
        #if DEBUG
        let args = ProcessInfo.processInfo.arguments
        guard let i = args.firstIndex(of: key), i + 1 < args.count else { return nil }
        return args[i + 1]
        #else
        return nil
        #endif
    }
}

import SwiftUI

extension View {
    /// Debug builds: `-scroll 0.5` opens a scroll view at that point of its content.
    @ViewBuilder
    func debugScroll() -> some View {
        #if DEBUG
        if let y = DebugLaunch.value("-scroll").flatMap(Double.init) {
            self.defaultScrollAnchor(UnitPoint(x: 0.5, y: y))
        } else {
            self
        }
        #else
        self
        #endif
    }
}
