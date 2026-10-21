import AppIntents

// Siri, Spotlight, the Shortcuts app and the Action button: the tools people
// reach for most, without opening the app first.

struct MeasureWallIntent: AppIntent {
    static let title: LocalizedStringResource = "Measure a wall"
    static let description = IntentDescription("Opens the camera tape measure.")
    static let openAppWhenRun = true

    @MainActor func perform() async throws -> some IntentResult {
        QuickActions.run("measure")
        return .result()
    }
}

struct MatchColorIntent: AppIntent {
    static let title: LocalizedStringResource = "Match a color"
    static let description = IntentDescription("Finds the closest real cabinet panels to a color in a photo.")
    static let openAppWhenRun = true

    @MainActor func perform() async throws -> some IntentResult {
        QuickActions.run("match")
        return .result()
    }
}

struct TextOfficeIntent: AppIntent {
    static let title: LocalizedStringResource = "Text Green Cabinets"
    static let description = IntentDescription("Starts a text to the Green Cabinets office.")
    static let openAppWhenRun = true

    @MainActor func perform() async throws -> some IntentResult {
        QuickActions.run("text")
        return .result()
    }
}

struct DesignBoardIntent: AppIntent {
    static let title: LocalizedStringResource = "Open my design board"
    static let description = IntentDescription("Shows your pictures, finishes and sizes on one page.")
    static let openAppWhenRun = true

    @MainActor func perform() async throws -> some IntentResult {
        QuickActions.run("board")
        return .result()
    }
}

struct GreenCabinetsShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: MeasureWallIntent(),
                    phrases: ["Measure a wall with \(.applicationName)", "Measure with \(.applicationName)"],
                    shortTitle: "Measure a wall", systemImageName: "ruler")
        AppShortcut(intent: MatchColorIntent(),
                    phrases: ["Match a color with \(.applicationName)", "Find a cabinet color with \(.applicationName)"],
                    shortTitle: "Match a color", systemImageName: "eyedropper.halffull")
        AppShortcut(intent: DesignBoardIntent(),
                    phrases: ["Open my design board in \(.applicationName)", "Show my kitchen in \(.applicationName)"],
                    shortTitle: "Design board", systemImageName: "rectangle.on.rectangle")
        AppShortcut(intent: TextOfficeIntent(),
                    phrases: ["Text \(.applicationName)", "Message \(.applicationName)"],
                    shortTitle: "Text us", systemImageName: "message")
    }
}
