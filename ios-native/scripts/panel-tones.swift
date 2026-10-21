// Measures the average color of every supplier photo in panels.json (the
// middle 60%, away from edges and shadows) and writes Resources/tones.json,
// which the app's "Match a color" compares against.
// Run from the repo root: swift ios-native/scripts/panel-tones.swift
import Foundation
import CoreImage

struct P: Decodable { let id: String; let thumb: String; let hiRes: String; let hex: String }
let root = "ios-native/GreenCabinets/Resources/"
let panels = try JSONDecoder().decode([P].self, from: Data(contentsOf: URL(fileURLWithPath: root + "panels.json")))
let ctx = CIContext()
var tones: [String: String] = [:]
let lock = NSLock()
let group = DispatchGroup()
let sem = DispatchSemaphore(value: 8)

func average(_ data: Data) -> String? {
    guard let img = CIImage(data: data) else { return nil }
    let e = img.extent
    let r = e.insetBy(dx: e.width * 0.2, dy: e.height * 0.2)
    let avg = img.applyingFilter("CIAreaAverage", parameters: [kCIInputExtentKey: CIVector(cgRect: r)])
    var px = [UInt8](repeating: 0, count: 4)
    ctx.render(avg, toBitmap: &px, rowBytes: 4, bounds: CGRect(x: avg.extent.minX, y: avg.extent.minY, width: 1, height: 1),
               format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB))
    return String(format: "#%02X%02X%02X", px[0], px[1], px[2])
}

for p in panels {
    if !p.hex.isEmpty { tones[p.id] = p.hex; continue }
    let s = p.thumb.isEmpty ? p.hiRes : p.thumb
    guard let url = URL(string: s) else { continue }
    group.enter(); sem.wait()
    URLSession.shared.dataTask(with: url) { data, _, _ in
        defer { sem.signal(); group.leave() }
        guard let data, let hex = average(data) else { print("no tone:", p.id); return }
        lock.lock(); tones[p.id] = hex; lock.unlock()
    }.resume()
}
group.wait()
let out = try JSONSerialization.data(withJSONObject: tones, options: [.sortedKeys])
try out.write(to: URL(fileURLWithPath: root + "tones.json"))
print(tones.count, "tones of", panels.count)
