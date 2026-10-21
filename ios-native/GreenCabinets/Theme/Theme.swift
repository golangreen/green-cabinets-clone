import SwiftUI
import UIKit

/// Green Cabinets colors, the same tokens as greencabinetsny.com: warm ink,
/// ivory text, a stone grey for secondary text and brass for the one accent.
/// Screens use these names, never raw values.
enum Brand {
    static let ink = Color(red: 14 / 255, green: 13 / 255, blue: 12 / 255)
    /// Grouped surfaces and cards, one step up from the page
    static let surface = Color(red: 23 / 255, green: 21 / 255, blue: 19 / 255)
    /// Anything raised above a card (chips, wells)
    static let raised = Color(red: 34 / 255, green: 31 / 255, blue: 28 / 255)
    static let ivory = Color(red: 242 / 255, green: 236 / 255, blue: 226 / 255)
    /// Secondary text: 7:1 on ink, 6.5:1 on surface (lighter still with Increase Contrast)
    static let stone = Color(UIColor { t in
        t.accessibilityContrast == .high
            ? UIColor(red: 206 / 255, green: 200 / 255, blue: 190 / 255, alpha: 1)
            : UIColor(red: 168 / 255, green: 161 / 255, blue: 150 / 255, alpha: 1)
    })
    static let brass = Color(red: 198 / 255, green: 161 / 255, blue: 91 / 255)
    /// Hairlines and card edges (firmer with Increase Contrast)
    static let line = Color(UIColor { t in
        UIColor(red: 242 / 255, green: 236 / 255, blue: 226 / 255, alpha: t.accessibilityContrast == .high ? 0.38 : 0.13)
    })
    /// The drawing paper behind plans and the 3D room
    static let paper = Color(red: 241 / 255, green: 239 / 255, blue: 234 / 255)
    static let error = Color(red: 236 / 255, green: 160 / 255, blue: 146 / 255)

    static let uiInk = UIColor(red: 14 / 255, green: 13 / 255, blue: 12 / 255, alpha: 1)
    static let uiIvory = UIColor(red: 242 / 255, green: 236 / 255, blue: 226 / 255, alpha: 1)
    static let uiBrass = UIColor(red: 198 / 255, green: 161 / 255, blue: 91 / 255, alpha: 1)
    static let uiPaper = UIColor(red: 241 / 255, green: 239 / 255, blue: 234 / 255, alpha: 1)
}

/// Spacing on a 4 pt grid, by role.
enum Space {
    static let xs: CGFloat = 4
    static let s: CGFloat = 8
    static let m: CGFloat = 12
    static let l: CGFloat = 16
    static let xl: CGFloat = 24
    static let section: CGFloat = 40
    /// Side margin for page content
    static let gutter: CGFloat = 20
}

enum Radius {
    static let card: CGFloat = 22
    static let photo: CGFloat = 18
    static let chip: CGFloat = 12
}

// MARK: - Type

/// Cormorant Garamond for display only (the brand's voice), the system font
/// for everything people read and operate. Every size follows Dynamic Type.
extension Font {
    static func display(_ size: CGFloat, relativeTo style: Font.TextStyle = .largeTitle) -> Font {
        .custom("CormorantGaramond-Medium", size: size, relativeTo: style)
    }
    static func displayItalic(_ size: CGFloat, relativeTo style: Font.TextStyle = .largeTitle) -> Font {
        .custom("CormorantGaramond-MediumItalic", size: size, relativeTo: style)
    }
    static func displayBold(_ size: CGFloat, relativeTo style: Font.TextStyle = .title) -> Font {
        .custom("CormorantGaramond-SemiBold", size: size, relativeTo: style)
    }
}

extension View {
    /// Large display line: tight leading and slightly negative tracking, as type grows.
    func heroTitle() -> some View {
        font(.display(42)).tracking(-0.6).foregroundStyle(Brand.ivory)
    }
    func sectionTitle() -> some View {
        font(.display(31, relativeTo: .title)).tracking(-0.3).foregroundStyle(Brand.ivory)
    }
    func cardTitle() -> some View {
        font(.display(24, relativeTo: .title3)).foregroundStyle(Brand.ivory)
    }
    /// Small uppercase label in brass, with a little positive tracking for legibility.
    func eyebrow() -> some View {
        font(.caption.weight(.semibold)).tracking(1.6).textCase(.uppercase).foregroundStyle(Brand.brass)
    }
    func bodyText() -> some View {
        font(.body).foregroundStyle(Brand.ivory.opacity(0.86)).lineSpacing(3)
    }
    func secondaryText() -> some View {
        font(.subheadline).foregroundStyle(Brand.stone)
    }
}

// MARK: - Motion

/// One motion vocabulary for the app. Critically damped springs by default
/// (no overshoot), a little bounce only after a gesture that carried momentum,
/// and a plain short fade when Reduce Motion is on.
enum Motion {
    /// State changes on screen: a selection, a panel opening
    static let snappy = Animation.spring(response: 0.3, dampingFraction: 1)
    /// Things settling after they moved: a drawer, a reset
    static let settle = Animation.spring(response: 0.4, dampingFraction: 1)
    /// After a flick or a drag release
    static let momentum = Animation.spring(response: 0.35, dampingFraction: 0.82)
    /// Press feedback, under 160 ms
    static let press = Animation.spring(response: 0.16, dampingFraction: 1)

    static func ui(_ reduceMotion: Bool) -> Animation { reduceMotion ? .easeOut(duration: 0.18) : snappy }
}

// MARK: - App-wide UIKit chrome

enum Appearance {
    /// Navigation titles in the brand serif; everything else stays system.
    static func apply() {
        let large = UIFont(name: "CormorantGaramond-SemiBold", size: 38) ?? .preferredFont(forTextStyle: .largeTitle)
        let inline = UIFont(name: "CormorantGaramond-SemiBold", size: 22) ?? .preferredFont(forTextStyle: .headline)
        let bar = UINavigationBar.appearance()
        bar.largeTitleTextAttributes = [
            .font: UIFontMetrics(forTextStyle: .largeTitle).scaledFont(for: large),
            .foregroundColor: Brand.uiIvory,
        ]
        bar.titleTextAttributes = [
            .font: UIFontMetrics(forTextStyle: .headline).scaledFont(for: inline),
            .foregroundColor: Brand.uiIvory,
        ]
        UISegmentedControl.appearance().selectedSegmentTintColor = Brand.uiIvory
        UISegmentedControl.appearance().setTitleTextAttributes([.foregroundColor: Brand.uiInk], for: .selected)
        UISegmentedControl.appearance().setTitleTextAttributes([.foregroundColor: Brand.uiIvory.withAlphaComponent(0.85)], for: .normal)
    }
}
