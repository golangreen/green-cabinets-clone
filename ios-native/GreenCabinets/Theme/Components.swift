import SwiftUI
import UIKit

// MARK: - Buttons

/// Press feedback on touch-down: a slight scale (or, with Reduce Motion, a dim)
/// that never changes layout bounds.
struct PressableStyle: ButtonStyle {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    var scale: CGFloat = 0.97

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .contentShape(Rectangle())
            .scaleEffect(configuration.isPressed && !reduceMotion ? scale : 1)
            .opacity(configuration.isPressed && reduceMotion ? 0.75 : 1)
            .animation(Motion.press, value: configuration.isPressed)
    }
}

extension View {
    /// The one primary action on a screen: brass, ink label. Liquid Glass on iOS 26.
    @ViewBuilder
    func primaryActionStyle() -> some View {
        if #available(iOS 26.0, *) {
            self.buttonStyle(.glassProminent).tint(Brand.brass).foregroundStyle(Brand.ink).controlSize(.large)
        } else {
            self.buttonStyle(.borderedProminent).tint(Brand.brass).foregroundStyle(Brand.ink).controlSize(.large)
        }
    }

    /// A secondary action next to a primary one.
    @ViewBuilder
    func secondaryActionStyle() -> some View {
        if #available(iOS 26.0, *) {
            self.buttonStyle(.glass).tint(Brand.ivory).controlSize(.large)
        } else {
            self.buttonStyle(.bordered).tint(Brand.ivory).controlSize(.large)
        }
    }

    /// Controls floating over a picture or the 3D room: dark glass, ivory label.
    @ViewBuilder
    func floatingControlStyle() -> some View {
        if #available(iOS 26.0, *) {
            self.buttonStyle(.glassProminent).tint(Brand.ink.opacity(0.78)).foregroundStyle(Brand.ivory)
        } else {
            self.buttonStyle(.borderedProminent).tint(Brand.ink.opacity(0.82)).foregroundStyle(Brand.ivory)
        }
    }

    /// A raised card on the page.
    func card(padding: CGFloat = Space.l) -> some View {
        self.padding(padding)
            .background(Brand.surface, in: RoundedRectangle(cornerRadius: Radius.card, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Radius.card, style: .continuous).strokeBorder(Brand.line, lineWidth: 1))
    }

    /// The tab bar tucks away while reading, on iOS 26.
    @ViewBuilder
    func minimizesTabBarOnScroll() -> some View {
        if #available(iOS 26.0, *) {
            self.tabBarMinimizeBehavior(.onScrollDown)
        } else {
            self
        }
    }
}

/// A label that fills the button: used inside primary and secondary actions.
struct ActionLabel: View {
    let title: String
    var systemImage: String?

    var body: some View {
        HStack(spacing: Space.s) {
            if let systemImage { Image(systemName: systemImage).imageScale(.medium) }
            Text(title).font(.body.weight(.semibold))
        }
        .frame(maxWidth: .infinity, minHeight: 34)
    }
}

/// Two actions side by side, stacked when the text size is very large.
struct ActionRow<Content: View>: View {
    @Environment(\.dynamicTypeSize) private var typeSize
    @ViewBuilder let content: Content

    var body: some View {
        let layout = typeSize.isAccessibilitySize ? AnyLayout(VStackLayout(spacing: Space.m)) : AnyLayout(HStackLayout(spacing: Space.m))
        layout { content }
    }
}

// MARK: - Headings

struct SectionHeader: View {
    let eyebrow: String
    let title: String
    var subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: Space.s) {
            Text(eyebrow).eyebrow()
            Text(title).sectionTitle().fixedSize(horizontal: false, vertical: true)
            if let subtitle {
                Text(subtitle).secondaryText().fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - Photos

/// A bundled photo filling its frame, cropped, with continuous corners.
struct PhotoView: View {
    let name: String
    var corner: CGFloat = Radius.photo

    var body: some View {
        Color.clear
            .overlay {
                Image(name).resizable().scaledToFill()
            }
            .clipShape(RoundedRectangle(cornerRadius: corner, style: .continuous))
            .contentShape(RoundedRectangle(cornerRadius: corner, style: .continuous))
    }
}

// MARK: - Feedback

enum Haptics {
    static func light() { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
    static func success() { UINotificationFeedbackGenerator().notificationOccurred(.success) }
    static func warning() { UINotificationFeedbackGenerator().notificationOccurred(.warning) }
}

/// A short confirmation at the top of the screen ("4 pictures added").
struct ToastView: View {
    let text: String

    var body: some View {
        HStack(spacing: Space.s) {
            Image(systemName: "checkmark.circle.fill").foregroundStyle(Brand.brass)
            Text(text).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory)
        }
        .padding(.horizontal, Space.l)
        .padding(.vertical, Space.m)
        .background(.ultraThinMaterial, in: Capsule())
        .overlay(Capsule().strokeBorder(Brand.line))
        .accessibilityElement(children: .combine)
    }
}

// MARK: - Small pieces

/// A single fact: a big serif value over a small label.
struct FactView: View {
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value).font(.display(26, relativeTo: .title2)).foregroundStyle(Brand.ivory)
                .minimumScaleFactor(0.7).lineLimit(1)
            Text(label).font(.footnote).foregroundStyle(Brand.stone)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .combine)
    }
}

/// A bullet line with a brass mark.
struct BulletRow: View {
    let text: String
    var symbol = "checkmark"

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: Space.m) {
            Image(systemName: symbol).font(.footnote.weight(.semibold)).foregroundStyle(Brand.brass)
                .accessibilityHidden(true)
            Text(text).bodyText().fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
