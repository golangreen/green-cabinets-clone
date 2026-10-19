/**
 * Service + per-linear-foot Offer schema for the homepage, where the services
 * and the $/linear-foot pricing are shown. (Moved here from index.html so it
 * no longer appears on every URL.) Prices must match the homepage Pricing
 * section; change them together.
 */
export const HOME_SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://greencabinetsny.com/#service-kitchen",
      "serviceType": "Custom Kitchen Cabinets",
      "name": "Custom Kitchen Cabinets in Brooklyn, Manhattan & Queens",
      "description": "Bespoke kitchen cabinetry designed, built, and installed in NYC. Shaker, slim shaker, and modern styles using FSC-certified hardwoods and low-VOC finishes.",
      "provider": {
        "@id": "https://greencabinetsny.com/#localbusiness"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": "Brooklyn"
        },
        {
          "@type": "City",
          "name": "Manhattan"
        },
        {
          "@type": "City",
          "name": "Queens"
        }
      ],
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "350",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "350",
          "priceCurrency": "USD",
          "unitText": "linear foot"
        },
        "url": "https://greencabinetsny.com/"
      }
    },
    {
      "@type": "Service",
      "@id": "https://greencabinetsny.com/#service-vanity",
      "serviceType": "Custom Bathroom Vanities",
      "name": "Custom Bathroom Vanities NYC",
      "description": "Made-to-measure bathroom vanities with premium materials and hardware, designed and installed throughout NYC.",
      "provider": {
        "@id": "https://greencabinetsny.com/#localbusiness"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": "Brooklyn"
        },
        {
          "@type": "City",
          "name": "Manhattan"
        },
        {
          "@type": "City",
          "name": "Queens"
        }
      ],
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "350",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "350",
          "priceCurrency": "USD",
          "unitText": "linear foot"
        },
        "url": "https://greencabinetsny.com/"
      }
    },
    {
      "@type": "Service",
      "@id": "https://greencabinetsny.com/#service-closets",
      "serviceType": "Custom Closet Systems",
      "name": "Custom Closet Systems Brooklyn & NYC",
      "description": "Custom closet organization and built-in storage systems engineered for NYC apartments and brownstones.",
      "provider": {
        "@id": "https://greencabinetsny.com/#localbusiness"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": "Brooklyn"
        },
        {
          "@type": "City",
          "name": "Manhattan"
        },
        {
          "@type": "City",
          "name": "Queens"
        }
      ]
    }
  ]
} as const;
