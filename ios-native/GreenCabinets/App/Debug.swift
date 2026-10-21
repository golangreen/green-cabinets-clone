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
