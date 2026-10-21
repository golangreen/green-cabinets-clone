import SwiftUI

/// The tools, launched from any tab. What they make goes into the project
/// basket, which the Quote tab sends.
@MainActor
extension AppModel {
    func openCabinets(wearing finish: Finish? = nil) {
        Tools.openCabinets(finishes: Finish.arList(startingWith: finish)) { [weak self] photos in
            self?.add(images: photos, kind: .ar, title: "Cabinets in AR")
        }
    }

    func openMeasure() {
        Tools.openMeasure(unit: unit == .none ? .ftin : unit) { [weak self] lengths, photos in
            guard let self else { return }
            self.add(lengths: lengths)
            if !photos.isEmpty {
                self.add(images: photos, kind: .measure, title: "Measurement")
            } else if !lengths.isEmpty {
                self.say(lengths.count == 1 ? "1 length added to your project" : "\(lengths.count) lengths added to your project")
            }
        }
    }

    func openDrawings() {
        Tools.scanDocuments { [weak self] pages in
            self?.add(images: pages, kind: .drawing, title: "Drawing")
        }
    }

    func openRoomScan(several: Bool) {
        Tools.scanRoom(several: several) { [weak self] room in
            guard let self, let room, !room.walls.isEmpty else { return }
            let saved = self.keep(scan: room)
            Haptics.success()
            self.tab = .plan
            self.planPath = [saved.id]
        }
    }

    func showSampleScan() {
        tab = .plan
        planPath = ["sample"]
    }

    func askAbout(_ text: String) {
        quoteNote = text
        tab = .quote
    }
}
