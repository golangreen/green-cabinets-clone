import SwiftUI

/// The finished work, as an editorial mosaic: one large photo, then two side
/// by side. A filter at the top, a tap opens the photo full screen.
struct WorkView: View {
    @Environment(AppModel.self) private var model
    @Namespace private var zoom
    @State private var filter: WorkCategory?
    @State private var path = NavigationPath()
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var photos: [WorkPhoto] { Content.photos.filter { filter == nil || $0.category == filter } }

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: Space.xl) {
                    Text("Kitchens, vanities, closets and built-ins, made for the buildings they live in.")
                        .secondaryText()
                        .fixedSize(horizontal: false, vertical: true)

                    Picker("Show", selection: $filter) {
                        Text("All").tag(WorkCategory?.none)
                        Text("Kitchens").tag(WorkCategory?.some(.kitchens))
                        Text("Baths").tag(WorkCategory?.some(.baths))
                        Text("Closets").tag(WorkCategory?.some(.closets))
                    }
                    .pickerStyle(.segmented)
                    .sensoryFeedback(.selection, trigger: filter)

                    // A new filter crossfades the set instead of sliding every photo at once
                    mosaic
                        .id(filter)
                        .transition(.opacity)
                }
                .padding(.horizontal, Space.gutter)
                .padding(.bottom, Space.section)
                .animation(.easeOut(duration: 0.2), value: filter)
            }
            .scrollIndicators(.hidden)
            .background(Brand.ink)
            .navigationTitle("Our work")
            .navigationDestination(for: WorkPhoto.self) { p in
                PhotoDetailView(photos: photos, current: p.id)
                    .zoomDestination(p.id, in: zoom)
            }
            .onAppear {
                if DebugLaunch.value("-photo") != nil, path.isEmpty, let first = photos.first { path.append(first) }
            }
        }
    }

    private var mosaic: some View {
        let list = photos
        let groups = stride(from: 0, to: list.count, by: 3).map { Array(list[$0..<min($0 + 3, list.count)]) }
        return LazyVStack(spacing: Space.m) {
            ForEach(groups, id: \.first!.id) { g in
                tile(g[0], aspect: 1.35)
                if g.count > 1 {
                    HStack(spacing: Space.m) {
                        tile(g[1], aspect: 0.82)
                        if g.count > 2 { tile(g[2], aspect: 0.82) } else { Color.clear.aspectRatio(0.82, contentMode: .fit) }
                    }
                }
            }
        }
    }

    private func tile(_ p: WorkPhoto, aspect: CGFloat) -> some View {
        NavigationLink(value: p) {
            PhotoView(name: p.id)
                .aspectRatio(aspect, contentMode: .fit)
                .overlay(alignment: .bottomLeading) {
                    Text(p.title)
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(Brand.ivory)
                        .lineLimit(2)
                        .padding(Space.m)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(LinearGradient(colors: [.clear, .black.opacity(0.65)], startPoint: .top, endPoint: .bottom))
                        .clipShape(UnevenRoundedRectangle(bottomLeadingRadius: Radius.photo, bottomTrailingRadius: Radius.photo, style: .continuous))
                }
                .zoomSource(p.id, in: zoom)
        }
        .buttonStyle(PressableStyle())
        .workPhotoMenu(p, model: model)
        .accessibilityLabel(p.title)
        .accessibilityHint("Opens the photo")
    }
}
