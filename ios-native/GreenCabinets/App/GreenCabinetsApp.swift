import SwiftUI

@main
struct GreenCabinetsApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var model: AppModel

    init() {
        Appearance.apply()
        let m = AppModel()
        _model = State(initialValue: m)
        #if DEBUG
        // Screenshots and checks only (compiled out of App Store builds):
        //   -tab plan|work|materials|quote   open on that tab
        //   -open sample|wood:<slug>         push a screen there
        let args = ProcessInfo.processInfo.arguments
        func arg(_ k: String) -> String? { args.firstIndex(of: k).flatMap { $0 + 1 < args.count ? args[$0 + 1] : nil } }
        switch arg("-tab") {
        case "work": m.tab = .work
        case "plan": m.tab = .plan
        case "materials": m.tab = .materials
        case "home": m.tab = .home
        case "quote": m.tab = .quote
        default: break
        }
        if arg("-open") == "sample" { m.tab = .plan; m.planPath = ["sample"] }
        //   -quick text|measure|quote        as if picked from the app icon
        if let q = arg("-quick") { QuickActions.pending = q }
        //   -seed                            a sample project (pictures, picks, lengths)
        if args.contains("-seed") {
            var b = ProjectBasket()
            for (name, title) in [("photo-natural-wood-kitchen-marble", "Cabinets in AR"), ("photo-modern-white-kitchen-pendants", "Cabinets in AR"),
                                  ("photo-marble-wood-kitchen-island", "Cabinets in AR")] {
                if let d = UIImage(named: name)?.scaledJPEG(maxSide: 1400) { b.items.append(Attachment(kind: .ar, title: title, jpeg: d)) }
            }
            b.picks = ["Shinnoki Ivory Oak (S4 IVORY OAK)", "Tafisa Cream Puff (TFL: M2034)", "Egger Natural Davos Oak (H3331 ST10)",
                       "Painted: Greige", "Look: Natural oak with a marble backsplash"]
            b.picks = b.picks.map { line in Panel.all.first { line.hasPrefix("\($0.brand) \($0.name) (") }?.requestLine ?? line }
            b.lengths = [MeasuredLength(meters: 3.12, name: "Sink wall"), MeasuredLength(meters: 2.44, name: "Window wall"), MeasuredLength(meters: 0.91)]
            m.basket = b
        }
        #endif
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
                .preferredColorScheme(.dark)
                .tint(Brand.brass)
        }
    }
}

/// Five tabs: the work, the tools to plan a room, the materials, and the quote
/// that collects everything. Each tab keeps its own navigation.
struct RootView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        @Bindable var model = model
        TabView(selection: $model.tab) {
            HomeView()
                .tabItem { Label("Home", systemImage: "house") }
                .tag(AppTab.home)
            WorkView()
                .tabItem { Label("Our work", systemImage: "photo.on.rectangle.angled") }
                .tag(AppTab.work)
            PlanView()
                .tabItem { Label("Plan", systemImage: "ruler") }
                .tag(AppTab.plan)
            MaterialsView()
                .tabItem { Label("Materials", systemImage: "square.stack.3d.up") }
                .tag(AppTab.materials)
            QuoteView()
                .tabItem { Label("Quote", systemImage: "paperplane") }
                .badge(model.basket.count)
                .tag(AppTab.quote)
        }
        .minimizesTabBarOnScroll()
        .sensoryFeedback(.selection, trigger: model.tab)
        .overlay(alignment: .top) {
            if let toast = model.toast {
                ToastView(text: toast)
                    .padding(.top, Space.s)
                    // In from the top, out a little faster as a fade
                    .transition(reduceMotion ? .opacity : .asymmetric(insertion: .move(edge: .top).combined(with: .opacity),
                                                                      removal: .opacity.animation(.easeOut(duration: 0.18))))
                    .onTapGesture { model.toast = nil }
                    .accessibilityAddTraits(.updatesFrequently)
            }
        }
        .animation(Motion.ui(reduceMotion), value: model.toast)
        .background(Brand.ink.ignoresSafeArea())
        .sheet(isPresented: $model.showColorMatch) { ColorMatchView() }
        .task {
            SwatchImages.shared.warmAR()
            await QuickActions.attach(model)
        }
    }
}
