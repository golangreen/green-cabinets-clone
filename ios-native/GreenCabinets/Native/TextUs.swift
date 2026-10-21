import UIKit
import MessageUI
import UniformTypeIdentifiers

/// Texting the office from inside the app: Messages' own compose sheet,
/// already addressed and started, so the person only adds their words and
/// stays in the app. The number lives only here and is never printed on a
/// screen of the app.
@MainActor
enum TextUs {
    private static var delegate: ComposeDelegate?

    static func open(_ body: String, image: UIImage?, sent: @escaping () -> Void) {
        guard let host = Tools.top() else { return }
        guard MFMessageComposeViewController.canSendText() else {
            offerEmail(from: host, body: body)
            return
        }
        let vc = MFMessageComposeViewController()
        vc.recipients = [Content.textNumber]
        vc.body = body
        if let image, MFMessageComposeViewController.canSendAttachments(),
           let data = image.scaledJPEG(maxSide: 1600, quality: 0.8) {
            vc.addAttachmentData(data, typeIdentifier: UTType.jpeg.identifier, filename: "Green Cabinets.jpg")
        }
        let d = ComposeDelegate { result in
            delegate = nil
            if result == .sent { sent() }
        }
        delegate = d
        vc.messageComposeDelegate = d
        host.present(vc, animated: true)
    }

    /// No Messages on this device (an iPad without iMessage, an iPhone with
    /// no SIM): email the same words instead.
    private static func offerEmail(from host: UIViewController, body: String) {
        let alert = UIAlertController(title: "Texting isn't set up on this device",
                                      message: "Email us instead. We reply within 24 hours.",
                                      preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Not now", style: .cancel))
        let email = UIAlertAction(title: "Email us", style: .default) { _ in
            var c = URLComponents()
            c.scheme = "mailto"
            c.path = Content.email
            c.queryItems = [URLQueryItem(name: "body", value: body)]
            if let url = c.url { UIApplication.shared.open(url) }
        }
        alert.addAction(email)
        alert.preferredAction = email
        host.present(alert, animated: true)
    }
}

/// Email the office from inside the app (Mail's own sheet), or through the
/// person's own mail app when Mail isn't set up.
@MainActor
enum EmailUs {
    private static var delegate: MailDelegate?

    static func open(subject: String = "My project", body: String = "") {
        guard let host = Tools.top() else { return }
        guard MFMailComposeViewController.canSendMail() else {
            var c = URLComponents()
            c.scheme = "mailto"
            c.path = Content.email
            c.queryItems = [URLQueryItem(name: "subject", value: subject)] + (body.isEmpty ? [] : [URLQueryItem(name: "body", value: body)])
            if let url = c.url { UIApplication.shared.open(url) }
            return
        }
        let vc = MFMailComposeViewController()
        vc.setToRecipients([Content.email])
        vc.setSubject(subject)
        if !body.isEmpty { vc.setMessageBody(body, isHTML: false) }
        let d = MailDelegate { delegate = nil }
        delegate = d
        vc.mailComposeDelegate = d
        host.present(vc, animated: true)
    }
}

private final class MailDelegate: NSObject, MFMailComposeViewControllerDelegate {
    private let finish: () -> Void
    init(_ finish: @escaping () -> Void) { self.finish = finish }

    func mailComposeController(_ controller: MFMailComposeViewController, didFinishWith result: MFMailComposeResult, error: Error?) {
        controller.dismiss(animated: true)
        finish()
    }
}

private final class ComposeDelegate: NSObject, MFMessageComposeViewControllerDelegate {
    private let finish: (MessageComposeResult) -> Void
    init(_ finish: @escaping (MessageComposeResult) -> Void) { self.finish = finish }

    func messageComposeViewController(_ controller: MFMessageComposeViewController, didFinishWith result: MessageComposeResult) {
        controller.dismiss(animated: true)
        finish(result)
    }
}
