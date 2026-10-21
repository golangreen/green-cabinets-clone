import UIKit

/// Long-press the app icon: Text us, Measure a wall, Get a quote.
@MainActor
enum QuickActions {
    static weak var model: AppModel?
    /// An action picked before the first screen was up (the app wasn't running)
    static var pending: String?

    static func run(_ type: String) {
        guard let model else { pending = type; return }
        switch type {
        case "text":
            model.textUs()
        case "measure":
            model.tab = .plan
            model.openMeasure()
        case "quote":
            model.tab = .quote
        case "match":
            model.showColorMatch = true
        case "board":
            model.openBoard()
        default:
            break
        }
    }

    /// Called once the first screen is up.
    static func attach(_ m: AppModel) async {
        model = m
        guard let p = pending else { return }
        pending = nil
        // Messages and the camera present over the window, so let it settle first
        try? await Task.sleep(for: .milliseconds(450))
        run(p)
    }
}

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        if let item = options.shortcutItem { QuickActions.pending = item.type }
        let c = UISceneConfiguration(name: nil, sessionRole: session.role)
        c.delegateClass = SceneDelegate.self
        return c
    }
}

final class SceneDelegate: NSObject, UIWindowSceneDelegate {
    func windowScene(_ windowScene: UIWindowScene, performActionFor shortcutItem: UIApplicationShortcutItem,
                     completionHandler: @escaping (Bool) -> Void) {
        QuickActions.run(shortcutItem.type)
        completionHandler(true)
    }
}
