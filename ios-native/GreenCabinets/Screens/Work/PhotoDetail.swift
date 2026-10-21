import SwiftUI
import UIKit

// MARK: - Zoom transitions (iOS 18): a photo grows out of its thumbnail and shrinks back into it

extension View {
    @ViewBuilder
    func zoomSource(_ id: String, in ns: Namespace.ID) -> some View {
        if #available(iOS 18.0, *) { self.matchedTransitionSource(id: id, in: ns) } else { self }
    }

    @ViewBuilder
    func zoomDestination(_ id: String, in ns: Namespace.ID) -> some View {
        if #available(iOS 18.0, *) { self.navigationTransition(.zoom(sourceID: id, in: ns)) } else { self }
    }
}

/// A photo you can pinch, double-tap and pan, with the system's own scroll
/// physics (rubber-banding at the edges, momentum).
struct ZoomableImage: UIViewRepresentable {
    let name: String

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> UIScrollView {
        let s = UIScrollView()
        s.delegate = context.coordinator
        s.minimumZoomScale = 1
        s.maximumZoomScale = 4
        s.bouncesZoom = true
        s.showsVerticalScrollIndicator = false
        s.showsHorizontalScrollIndicator = false
        s.contentInsetAdjustmentBehavior = .never
        s.backgroundColor = .clear
        let iv = UIImageView(image: UIImage(named: name))
        iv.contentMode = .scaleAspectFit
        iv.isAccessibilityElement = false
        s.addSubview(iv)
        context.coordinator.imageView = iv
        let double = UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.doubleTap(_:)))
        double.numberOfTapsRequired = 2
        s.addGestureRecognizer(double)
        return s
    }

    func updateUIView(_ s: UIScrollView, context: Context) {
        DispatchQueue.main.async {
            guard let iv = context.coordinator.imageView, s.zoomScale == 1 else { return }
            iv.frame = s.bounds
            s.contentSize = s.bounds.size
        }
    }

    final class Coordinator: NSObject, UIScrollViewDelegate {
        weak var imageView: UIImageView?
        func viewForZooming(in scrollView: UIScrollView) -> UIView? { imageView }

        @objc func doubleTap(_ g: UITapGestureRecognizer) {
            guard let s = g.view as? UIScrollView else { return }
            if s.zoomScale > 1 {
                s.setZoomScale(1, animated: true)
            } else {
                let p = g.location(in: imageView)
                let w = s.bounds.width / 2.5, h = s.bounds.height / 2.5
                s.zoom(to: CGRect(x: p.x - w / 2, y: p.y - h / 2, width: w, height: h), animated: true)
            }
        }
    }
}

/// Full-screen photos: swipe between them, pinch to look closer, and ask
/// about a look you like.
struct PhotoDetailView: View {
    @Environment(AppModel.self) private var model
    let photos: [WorkPhoto]
    @State var current: String

    private var index: Int { photos.firstIndex { $0.id == current } ?? 0 }
    private var photo: WorkPhoto? { photos.first { $0.id == current } }

    var body: some View {
        TabView(selection: $current) {
            ForEach(photos) { p in
                ZoomableImage(name: p.id)
                    .ignoresSafeArea()
                    .tag(p.id)
                    .accessibilityElement()
                    .accessibilityLabel(p.title)
                    .accessibilityAddTraits(.isImage)
            }
        }
        .tabViewStyle(.page(indexDisplayMode: .never))
        .background(Color.black.ignoresSafeArea())
        .safeAreaInset(edge: .bottom) {
            if let photo {
                VStack(alignment: .leading, spacing: Space.m) {
                    Text(photo.category.rawValue).eyebrow()
                    Text(photo.title).cardTitle().fixedSize(horizontal: false, vertical: true)
                    Button {
                        model.askAbout("I like this one: \(photo.title).")
                    } label: {
                        ActionLabel(title: "Ask about this look", systemImage: "bubble.left")
                    }
                    .secondaryActionStyle()
                }
                .padding(Space.l)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(LinearGradient(colors: [.clear, .black.opacity(0.85)], startPoint: .top, endPoint: .bottom).ignoresSafeArea())
            }
        }
        .navigationTitle("\(index + 1) of \(photos.count)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.hidden, for: .navigationBar)
        .sensoryFeedback(.selection, trigger: current)
    }
}
