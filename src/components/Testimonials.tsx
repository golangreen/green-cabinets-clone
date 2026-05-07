import { Helmet } from "react-helmet-async";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Our co-op board is notoriously tough on contractors, but Green Cabinets handled the COI, alteration agreement, and freight elevator scheduling without us lifting a finger. Install was spotless.",
    name: "Rebecca M.",
    location: "Pre-war Co-op, Upper West Side",
  },
  {
    quote:
      "The walls in our 1920s Brooklyn Heights apartment are anything but straight. Their installers scribed every filler perfectly — you'd swear the kitchen was built into the building.",
    name: "Daniel & Priya K.",
    location: "Brownstone, Brooklyn Heights",
  },
  {
    quote:
      "Working with Green Cabinets on a Tribeca condo renovation was a dream. They knew the building's rules better than the super, and the millwork is flawless.",
    name: "Marcus T.",
    location: "Luxury Condo, Tribeca",
  },
  {
    quote:
      "I'm an interior designer and I've used a lot of NYC cabinet shops. Their tolerances, finish quality, and condo logistics are in a different league.",
    name: "Sophia L.",
    location: "Designer, Manhattan",
  },
  {
    quote:
      "They worked around our building's 9-to-5 quiet hours and finished a full kitchen install in three days without a single complaint from neighbors.",
    name: "James P.",
    location: "Co-op, Park Slope",
  },
  {
    quote:
      "Every drawer aligns, every door closes silently, every reveal is consistent. The level of precision is exactly what you'd hope for at this price point.",
    name: "Elena R.",
    location: "Condo, Long Island City",
  },
];

const Testimonials = () => {
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://greencabinetsny.com/#localbusiness",
    "name": "Green Cabinets NY",
    "url": "https://greencabinetsny.com",
    "image": "https://greencabinetsny.com/og-image.jpg",
    "telephone": "+1-718-804-5488",
    "priceRange": "$$-$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "10 Montieth St",
      "addressLocality": "Brooklyn",
      "addressRegion": "NY",
      "postalCode": "11206",
      "addressCountry": "US",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": testimonials.length.toString(),
      "bestRating": "5",
      "worstRating": "1",
    },
    "review": testimonials.map((t) => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5",
        "worstRating": "1",
      },
      "author": { "@type": "Person", "name": t.name },
      "reviewBody": t.quote,
      "publisher": { "@type": "Organization", "name": "Green Cabinets NY" },
      "locationCreated": { "@type": "Place", "name": t.location },
    })),
  };

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="py-16 sm:py-20 md:py-28 lg:py-32 bg-[#d5d5d5]"
    >
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(reviewSchema)}</script>
      </Helmet>
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 id="testimonials-heading" className="font-display text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Trusted by NYC Condo & Co-op Owners
          </h2>
          <p className="text-lg text-[#555555] leading-relaxed">
            Hear from clients across Brooklyn, Manhattan, and Queens about our condo/co-op expertise and installation precision.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="relative p-8 rounded-2xl bg-card border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-[#444444] leading-relaxed mb-6 flex-1">
                "{t.quote}"
              </blockquote>
              <figcaption>
                <div className="font-semibold text-[#1a1a1a]">{t.name}</div>
                <div className="text-sm text-[#666666]">{t.location}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
