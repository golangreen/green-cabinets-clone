import { useState } from "react";
import { MessageSquare, Mail } from "lucide-react";
import { openQuote } from "@/lib/quote";
import ContactGateDialog from "@/components/privacy/ContactGateDialog";
import { useContactUnlock } from "@/components/privacy/contactUnlock";
import photo from "@/assets/gallery/natural-wood-galley-kitchen.jpeg";

// Base64 so scrapers don't read them from the bundle; revealed after the human check
const LINKS = {
  text: () => `sms:+1${atob("NzE4ODA0NTQ4OA==")}`,
  email: () => `mailto:${atob("b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20=")}`,
};

const ContactCta = () => {
  const { unlocked } = useContactUnlock();
  const [pending, setPending] = useState<keyof typeof LINKS | null>(null);

  const go = (kind: keyof typeof LINKS) => {
    if (unlocked) {
      window.location.href = LINKS[kind]();
      return;
    }
    setPending(kind);
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative scroll-mt-20 overflow-hidden bg-ink">
      <img
        src={photo}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-28 sm:px-6 md:py-44 lg:px-10">
        <div data-reveal="up" className="max-w-4xl">
          <p className="lux-eyebrow mb-6">Start a project</p>
          <h2 id="contact-title" className="lux-display text-[clamp(2.8rem,7vw,6.5rem)] text-ivory">
            Let&rsquo;s measure <em className="italic text-brass">your</em> room.
          </h2>
          <p className="lux-body mt-6 max-w-xl text-base sm:text-lg text-ivory/75">
            Tell us about the space and we&rsquo;ll book a free in-home consultation. We bring the samples.
          </p>
        </div>

        <div
          data-reveal="up"
          style={{ "--d": "120ms" } as React.CSSProperties}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <button type="button" onClick={openQuote} className="lux-btn">
            Request a quote
          </button>
          <button type="button" onClick={() => go("text")} className="lux-btn-ghost">
            <MessageSquare className="h-4 w-4" aria-hidden="true" /> Text Golan
          </button>
          <button type="button" onClick={() => go("email")} className="lux-btn-ghost">
            <Mail className="h-4 w-4" aria-hidden="true" /> Email us
          </button>
        </div>

        <p data-reveal="up" className="mt-8 font-display text-sm text-stone">
          By appointment only · Brooklyn, Manhattan &amp; Queens
        </p>
      </div>

      <ContactGateDialog
        open={pending !== null}
        onOpenChange={(o) => !o && setPending(null)}
        onVerified={() => {
          if (pending) window.location.href = LINKS[pending]();
          setPending(null);
        }}
      />
    </section>
  );
};

export default ContactCta;
