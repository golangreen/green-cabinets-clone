import SwiftUI

/// The tools, launched from any tab. What they make goes into the project
/// basket, which the Quote tab sends.
@MainActor
extension AppModel {
    func openCabinets(wearing finish: Finish? = nil, counter: Finish? = nil) {
        Task { @MainActor in
            // The decor or stone someone chose must be there; fetch it first
            for finish in [finish, counter].compactMap({ $0 }) {
                guard let url = finish.remote, !ARTexture.isReady(finish) else { continue }
                let slow = Task { @MainActor in
                    try? await Task.sleep(for: .milliseconds(400))
                    if !Task.isCancelled { self.say("Getting the \(finish.name) sample…", haptic: false) }
                }
                let img = await SwatchImages.shared.image(url, px: ARTexture.px)
                slow.cancel()
                if toast?.hasPrefix("Getting the") == true { toast = nil }
                guard img != nil else {
                    say("That sample didn't load. Check your connection and try again.", haptic: false)
                    Haptics.warning()
                    return
                }
            }
            // Defaults that haven't arrived yet simply aren't offered
            let list = Finish.arList(startingWith: finish).filter { ARTexture.isReady($0) }
            Tools.openCabinets(finishes: list, counter: counter) { photos in
                self.add(images: photos, kind: .ar, title: "Cabinets in AR")
            }
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

    func openBoard() {
        tab = .plan
        planPath = ["board"]
    }

    func showSampleScan() {
        tab = .plan
        planPath = ["sample"]
    }

    /// A text to the office, already started; a picture from the app can go with it.
    func textUs(_ body: String = "Hi Green Cabinets, ", image: String? = nil) {
        textUs(body, picture: image.flatMap { UIImage(named: $0) })
    }

    func textUs(_ body: String, picture: UIImage?) {
        TextUs.open(body, image: picture) { [weak self] in
            self?.say("Message sent")
        }
    }
}
