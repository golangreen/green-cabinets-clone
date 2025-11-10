export interface VanityTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  config: {
    brand: string;
    finish: string;
    width: string;
    widthFraction: string;
    height: string;
    heightFraction: string;
    depth: string;
    depthFraction: string;
    doorStyle: string;
    numDrawers: number;
    handleStyle: string;
  };
  tags: string[];
}

export const vanityTemplates: VanityTemplate[] = [
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    description: "Clean white finish with sleek bar handles, perfect for contemporary bathrooms",
    config: {
      brand: "Tafisa",
      finish: "White",
      width: "48",
      widthFraction: "0",
      height: "34",
      heightFraction: "8",
      depth: "21",
      depthFraction: "0",
      doorStyle: "double",
      numDrawers: 2,
      handleStyle: "bar",
    },
    tags: ["modern", "white", "double-door"],
  },
  {
    id: "rustic-charm",
    name: "Rustic Charm",
    description: "Natural oak veneer with knob handles for a warm, traditional feel",
    config: {
      brand: "Shinnoki",
      finish: "Natural Oak",
      width: "60",
      widthFraction: "0",
      height: "34",
      heightFraction: "8",
      depth: "22",
      depthFraction: "0",
      doorStyle: "double",
      numDrawers: 2,
      handleStyle: "knob",
    },
    tags: ["rustic", "oak", "traditional"],
  },
  {
    id: "compact-classic",
    name: "Compact Classic",
    description: "Single door design ideal for powder rooms and small bathrooms",
    config: {
      brand: "Tafisa",
      finish: "Cream Puff",
      width: "24",
      widthFraction: "0",
      height: "32",
      heightFraction: "0",
      depth: "18",
      depthFraction: "0",
      doorStyle: "single",
      numDrawers: 2,
      handleStyle: "bar",
    },
    tags: ["compact", "small", "single-door"],
  },
  {
    id: "luxury-spa",
    name: "Luxury Spa",
    description: "Elegant walnut finish with push-to-open mechanism for a high-end look",
    config: {
      brand: "Shinnoki",
      finish: "Pure Walnut",
      width: "72",
      widthFraction: "0",
      height: "36",
      heightFraction: "0",
      depth: "24",
      depthFraction: "0",
      doorStyle: "double",
      numDrawers: 3,
      handleStyle: "none",
    },
    tags: ["luxury", "walnut", "large"],
  },
  {
    id: "smart-storage",
    name: "Smart Storage",
    description: "All-drawer configuration maximizes storage with organized compartments",
    config: {
      brand: "Egger",
      finish: "Casella Oak",
      width: "48",
      widthFraction: "0",
      height: "32",
      heightFraction: "0",
      depth: "21",
      depthFraction: "0",
      doorStyle: "drawers",
      numDrawers: 4,
      handleStyle: "bar",
    },
    tags: ["storage", "drawers", "organized"],
  },
  {
    id: "urban-industrial",
    name: "Urban Industrial",
    description: "Grey finish with metal bar handles for a modern industrial aesthetic",
    config: {
      brand: "Tafisa",
      finish: "Milky Way Grey",
      width: "54",
      widthFraction: "0",
      height: "34",
      heightFraction: "8",
      depth: "22",
      depthFraction: "0",
      doorStyle: "double",
      numDrawers: 2,
      handleStyle: "bar",
    },
    tags: ["industrial", "grey", "modern"],
  },
  {
    id: "timeless-classic",
    name: "Timeless Classic",
    description: "Traditional white oak with elegant knob handles, never goes out of style",
    config: {
      brand: "Egger",
      finish: "White Oak",
      width: "42",
      widthFraction: "0",
      height: "34",
      heightFraction: "0",
      depth: "20",
      depthFraction: "0",
      doorStyle: "double",
      numDrawers: 2,
      handleStyle: "knob",
    },
    tags: ["classic", "oak", "traditional"],
  },
  {
    id: "sleek-contemporary",
    name: "Sleek Contemporary",
    description: "Dark walnut with handleless design for ultra-modern bathrooms",
    config: {
      brand: "Egger",
      finish: "Walnut",
      width: "66",
      widthFraction: "0",
      height: "35",
      heightFraction: "0",
      depth: "23",
      depthFraction: "0",
      doorStyle: "double",
      numDrawers: 3,
      handleStyle: "none",
    },
    tags: ["contemporary", "dark", "handleless"],
  },
];
