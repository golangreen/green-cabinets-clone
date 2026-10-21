import SwiftUI

/// The kitchen designer for every iPhone: pick the shape closest to yours,
/// set how long each wall is, and see new cabinets on it, with the price,
/// exactly as after a room scan.
enum KitchenShape: String, CaseIterable, Identifiable {
    case oneWall = "One wall"
    case l = "L-shape"
    case u = "U-shape"
    case galley = "Galley"
    var id: String { rawValue }

    /// The lengths to ask for, in plain words
    var fields: [String] {
        switch self {
        case .oneWall: return ["The wall"]
        case .l: return ["Back wall", "Side wall"]
        case .u: return ["Back wall", "Each side wall"]
        case .galley: return ["Each wall", "Space between the counters"]
        }
    }

    /// Feet to start from: a typical New York kitchen
    var start: [Double] {
        switch self {
        case .oneWall: return [12]
        case .l: return [12, 8]
        case .u: return [10, 8]
        case .galley: return [12, 4]
        }
    }

    func range(_ i: Int) -> ClosedRange<Double> { self == .galley && i == 1 ? 3...8 : 4...30 }

    /// The side open to the rest of the home
    var openWall: Int { self == .galley ? 1 : 2 }

    /// The room as a scan would see it: the cabinet walls, and the open side
    /// toward the rest of the home. Walls go back, right, front, left.
    func room(_ feet: [Double], ceiling: Double, window: Bool) -> (ScannedRoom, Set<Int>) {
        let ft = 0.3048, inch = 0.0254
        let a = feet[0] * ft
        let counters = 2 * 25.5 * inch
        let depth: Double
        let picked: Set<Int>
        switch self {
        case .oneWall: depth = 10 * ft; picked = [0]
        case .l: depth = feet[1] * ft; picked = [0, 1]
        case .u: depth = feet[1] * ft; picked = [0, 1, 3]
        case .galley: depth = feet[1] * ft + counters; picked = [0, 2]
        }
        let h = ceiling * ft
        let corners = [[0, 0], [a, 0], [a, depth], [0, depth]]
        var room = try! JSONDecoder().decode(ScannedRoom.self, from: Data("{}".utf8))
        room.v = 2
        room.walls = (0..<4).map { i in
            let p = corners[i], q = corners[(i + 1) % 4]
            return .init(a: p, b: q, len: hypot(q[0] - p[0], q[1] - p[1]), h: h)
        }
        room.floors = [.init(poly: corners, y: 0)]
        do {
            let w = room.walls[openWall]
            let len = w.len, inset = min(0.3, len * 0.1)
            let d = [(w.b[0] - w.a[0]) / len, (w.b[1] - w.a[1]) / len]
            let s = [w.a[0] + d[0] * inset, w.a[1] + d[1] * inset], e = [w.b[0] - d[0] * inset, w.b[1] - d[1] * inset]
            room.openings = [.init(a: s, b: e, len: len - 2 * inset, h: h)]
        }
        // A window centered on the back wall, above the counter
        if window && a >= 6 * ft {
            let w = 36 * inch, wh = 42 * inch
            room.windows = [.init(a: [a / 2 - w / 2, 0], b: [a / 2 + w / 2, 0], len: w, h: wh, y: 42 * inch + wh / 2)]
        }
        return (room, picked)
    }

    /// For the office: what was typed, so nobody mistakes it for a scan
    func line(_ feet: [Double], ceiling: Double, window: Bool) -> String {
        let sizes = zip(fields, feet).map { "\($0.0.lowercased()) \(Self.text($0.1))" }.joined(separator: ", ")
        return "Sizes typed in the app (no scan): \(rawValue.lowercased()) kitchen, \(sizes), ceiling \(Int(ceiling)) ft" + (window ? ", window over the sink" : "")
    }

    static func text(_ feet: Double) -> String {
        let whole = Int(feet), inches = Int(((feet - Double(whole)) * 12).rounded())
        return inches == 0 ? "\(whole)'" : "\(whole)' \(inches)\""
    }
}

struct KitchenSizesView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var shape: KitchenShape = .l
    @State private var feet: [Double] = KitchenShape.l.start
    @State private var ceiling: Double = 8
    @State private var window = true

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                Text("Pick the shape closest to yours, then set how long each wall is. A tape measure is plenty: we check every size at the visit.")
                    .secondaryText().fixedSize(horizontal: false, vertical: true)

                LazyVGrid(columns: [GridItem(.flexible(), spacing: Space.m), GridItem(.flexible())], spacing: Space.m) {
                    ForEach(KitchenShape.allCases) { s in
                        Button {
                            withAnimation(Motion.ui(reduceMotion)) {
                                shape = s
                                feet = s.start
                            }
                        } label: {
                            VStack(spacing: Space.s) {
                                ShapeIcon(shape: s, feet: s.start, run: shape == s ? Brand.ink : Brand.brass,
                                          line: shape == s ? Brand.ink.opacity(0.55) : Brand.stone.opacity(0.7))
                                    .frame(height: 70)
                                Text(s.rawValue).font(.headline).foregroundStyle(shape == s ? Brand.ink : Brand.ivory)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(Space.m)
                            .background(shape == s ? Brand.brass : Brand.surface, in: RoundedRectangle(cornerRadius: Radius.chip, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).strokeBorder(shape == s ? .clear : Brand.line))
                        }
                        .buttonStyle(PressableStyle())
                        .accessibilityAddTraits(shape == s ? .isSelected : [])
                    }
                }
                .sensoryFeedback(.selection, trigger: shape)

                VStack(alignment: .leading, spacing: Space.l) {
                    ForEach(Array(shape.fields.enumerated()), id: \.offset) { i, name in
                        if feet.indices.contains(i) {
                            LengthStepper(title: name, feet: $feet[i], range: shape.range(i))
                        }
                    }
                    VStack(alignment: .leading, spacing: Space.s) {
                        Text("Ceiling").font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory)
                        Picker("Ceiling", selection: $ceiling) {
                            Text("8 ft").tag(8.0)
                            Text("9 ft").tag(9.0)
                            Text("10 ft").tag(10.0)
                        }
                        .pickerStyle(.segmented)
                    }
                    Toggle(isOn: $window) {
                        Text("A window over the sink").font(.subheadline).foregroundStyle(Brand.ivory)
                    }
                    .tint(Brand.brass)
                    .frame(minHeight: 44)
                }
                .card()

                ShapeIcon(shape: shape, feet: feet, labels: true)
                    .frame(height: 180)
                    .frame(maxWidth: .infinity)
                    .accessibilityHidden(true)

                Button { open() } label: {
                    ActionLabel(title: "See my new kitchen", systemImage: "cube.transparent")
                }
                .primaryActionStyle()

                if RoomCapture.isSupported {
                    Button { model.openRoomScan(several: false) } label: {
                        ActionLabel(title: "Scan the room instead", systemImage: "viewfinder")
                    }
                    .secondaryActionStyle()
                }
            }
            .padding(.horizontal, Space.gutter)
            .padding(.bottom, Space.section)
        }
        .scrollIndicators(.hidden)
        .debugScroll()
        .background(Brand.ink)
        .navigationTitle("Your kitchen's sizes")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if let s = DebugLaunch.value("-shape").flatMap({ v in KitchenShape.allCases.first { $0.rawValue.lowercased().hasPrefix(v) } }) {
                shape = s
                feet = s.start
            }
        }
    }

    private func open() {
        let (room, picked) = shape.room(feet, ceiling: ceiling, window: window)
        let saved = model.keep(scan: room, typed: shape.line(feet, ceiling: ceiling, window: window), picked: picked)
        Haptics.success()
        model.planPath.append(saved.id)
    }
}

/// One length with big minus and plus buttons, in half-foot steps.
private struct LengthStepper: View {
    let title: String
    @Binding var feet: Double
    let range: ClosedRange<Double>

    var body: some View {
        HStack(spacing: Space.m) {
            Text(title).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ivory)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: Space.s)
            step("minus", by: -0.5)
            Text(KitchenShape.text(feet))
                .font(.title2.weight(.semibold)).foregroundStyle(Brand.ivory)
                .monospacedDigit()
                .frame(minWidth: 76)
                .contentTransition(.numericText(value: feet))
            step("plus", by: 0.5)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title)
        .accessibilityValue(KitchenShape.text(feet).replacingOccurrences(of: "'", with: " feet").replacingOccurrences(of: "\"", with: " inches"))
        .accessibilityAdjustableAction { d in
            switch d {
            case .increment: change(0.5)
            case .decrement: change(-0.5)
            @unknown default: break
            }
        }
    }

    private func step(_ symbol: String, by delta: Double) -> some View {
        Button { change(delta) } label: {
            Image(systemName: symbol)
                .font(.headline)
                .foregroundStyle(Brand.ink)
                .frame(width: 44, height: 44)
                .background(Brand.ivory, in: Circle())
        }
        .buttonStyle(PressableStyle())
        .disabled(!range.contains(feet + delta))
        .opacity(range.contains(feet + delta) ? 1 : 0.35)
        .buttonRepeatBehavior(.enabled)
    }

    private func change(_ delta: Double) {
        let v = feet + delta
        guard range.contains(v) else { return }
        withAnimation(Motion.snappy) { feet = v }
        Haptics.light()
    }
}

/// The shape from above: the room's outline, the cabinet runs in brass, and
/// (with labels) each length on its wall.
struct ShapeIcon: View {
    let shape: KitchenShape
    let feet: [Double]
    var labels = false
    var run = Brand.brass
    var line = Brand.stone

    var body: some View {
        Canvas { ctx, size in
            let (room, picked) = shape.room(feet, ceiling: 8, window: false)
            guard let f = room.floors?.first?.poly, f.count == 4 else { return }
            let w = f[2][0], d = f[2][1]
            let pad: Double = labels ? 34 : 6
            let s = min((Double(size.width) - 2 * pad) / w, (Double(size.height) - 2 * pad) / d)
            let ox = (Double(size.width) - w * s) / 2, oz = (Double(size.height) - d * s) / 2
            func pt(_ p: [Double]) -> CGPoint { CGPoint(x: ox + p[0] * s, y: oz + p[1] * s) }
            for (i, wall) in room.walls.enumerated() {
                var p = Path()
                p.move(to: pt(wall.a)); p.addLine(to: pt(wall.b))
                ctx.stroke(p, with: .color(line), style: StrokeStyle(lineWidth: labels ? 2 : 1.5, dash: i == shape.openWall ? [4, 4] : []))
                guard picked.contains(i) else { continue }
                // The cabinet run along this wall, drawn inside the room
                let dx = wall.b[0] - wall.a[0], dz = wall.b[1] - wall.a[1]
                let len = max(hypot(dx, dz), 0.001)
                var nx = -dz / len, nz = dx / len
                let mid = [(wall.a[0] + wall.b[0]) / 2, (wall.a[1] + wall.b[1]) / 2]
                if (w / 2 - mid[0]) * nx + (d / 2 - mid[1]) * nz < 0 { nx = -nx; nz = -nz }
                let depth = 0.61
                var path = Path()
                path.move(to: pt(wall.a)); path.addLine(to: pt(wall.b))
                path.addLine(to: pt([wall.b[0] + nx * depth, wall.b[1] + nz * depth]))
                path.addLine(to: pt([wall.a[0] + nx * depth, wall.a[1] + nz * depth]))
                path.closeSubpath()
                ctx.fill(path, with: .color(run))
            }
            guard labels else { return }
            for i in shape.fields.indices where feet.indices.contains(i) {
                let text = Text("\(KitchenShape.text(feet[i]))").font(.subheadline.weight(.semibold)).foregroundColor(Brand.ivory)
                let p: CGPoint
                switch (shape, i) {
                case (.galley, 1): p = CGPoint(x: ox + w * s / 2, y: oz + d * s / 2)
                case (_, 0): p = CGPoint(x: ox + w * s / 2, y: oz - 16)
                default: p = CGPoint(x: ox + w * s + 22, y: oz + d * s / 2)
                }
                ctx.draw(text, at: p, anchor: .center)
            }
        }
    }
}
