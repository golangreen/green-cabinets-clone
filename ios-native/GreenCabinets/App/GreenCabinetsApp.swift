import SwiftUI

@main
struct GreenCabinetsApp: App {
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
    }
}
