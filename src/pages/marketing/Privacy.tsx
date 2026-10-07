import { useLayoutEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const UPDATED = "October 7, 2026";

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "Who we are",
    p: [
      "Green Cabinets NY (\"Green Cabinets\", \"we\", \"us\") designs and installs custom cabinetry in Brooklyn, Manhattan and Queens. This policy covers greencabinetsny.com and the Green Cabinets iPhone app. Questions: orders@greencabinetsny.com.",
    ],
  },
  {
    h: "What we collect, and when",
    p: [
      "Contact and quote requests: your name, email, phone number, address and the project details you type, when you send a form.",
      "Drawings and files: blueprints, elevations, cabinet lists or photos of them that you upload or take in the cost estimator.",
      "Room scans (app): when you scan a room, Apple's RoomPlan builds an outline of the room on your iPhone: walls, doors, windows and fixed items such as cabinets, with their sizes. No photos or video of your home are saved or sent. The scan stays on your iPhone unless you tap Send to Green Cabinets; then we receive the room outline, a picture of the 3D room, and the name, email, phone and note you enter.",
      "Website analytics: on the website (not in the app) we use Google Analytics to understand which pages are useful. It uses cookies and collects device and usage information such as pages viewed.",
      "On your device: the website and app remember a few things in your browser storage, such as your last scan and the contact details you typed, so you don't have to enter them again. You can clear them at any time.",
    ],
  },
  {
    h: "Camera",
    p: [
      "The app asks for the camera for two things you start yourself: scanning a room, and photographing drawings for a quote. For a room scan, Apple's RoomPlan uses the camera and LiDAR scanner to measure the room; those camera frames are processed on your iPhone and are not stored or sent. A photo of a drawing is sent only when you upload it.",
    ],
  },
  {
    h: "How we use it",
    p: [
      "To answer you, prepare quotes and drawings, plan your cabinets from your room's measurements, schedule consultations and installations, and improve our website. We do not use your information for advertising tracking, and we never sell it.",
    ],
  },
  {
    h: "Who we share it with",
    p: [
      "Only the service providers that run our website and email, and only to provide those services: our hosting and database provider (Supabase), our email provider (Resend), and Google Analytics on the website. We may also share information if the law requires it.",
    ],
  },
  {
    h: "How long we keep it",
    p: [
      "Project messages, quotes and room scans are kept for as long as we need them for your project and our business records, then deleted. You can ask us to delete them sooner.",
    ],
  },
  {
    h: "Your choices",
    p: [
      "You can ask to see, correct or delete the information we hold about you, or to delete a website account, by emailing orders@greencabinetsny.com. We reply within 30 days. You can turn off cookies in your browser, and you can remove the camera permission in your iPhone's Settings at any time.",
    ],
  },
  {
    h: "Children",
    p: ["Our services are for adults. We do not knowingly collect information from children under 13."],
  },
  {
    h: "Changes",
    p: ["If we change this policy we will update this page and the date at the top."],
  },
];

const Privacy = () => {
  useLayoutEffect(() => {
    document.documentElement.classList.add("theme-lux");
    return () => document.documentElement.classList.remove("theme-lux");
  }, []);

  return (
    <div className="min-h-screen bg-ink text-ivory">
      <Helmet>
        <title>Privacy Policy | Green Cabinets NY</title>
        <meta name="description" content="How Green Cabinets NY collects, uses and protects your information on greencabinetsny.com and in the Green Cabinets iPhone app." />
        <link rel="canonical" href="https://greencabinetsny.com/privacy" />
      </Helmet>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 md:pt-36">
        <p className="lux-eyebrow mb-5">Privacy policy</p>
        <h1 className="lux-display text-[clamp(2.6rem,6vw,4.5rem)]">Your information, handled with care.</h1>
        <p className="mt-4 font-display text-sm text-stone">Last updated {UPDATED}</p>
        {SECTIONS.map((s) => (
          <section key={s.h} className="mt-12 border-t border-white/15 pt-6">
            <h2 className="lux-display text-[1.9rem]">{s.h}</h2>
            {s.p.map((t) => (
              <p key={t.slice(0, 24)} className="lux-body mt-4 text-ivory/80">
                {t}
              </p>
            ))}
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
