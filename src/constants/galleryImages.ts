import type { GalleryImage, HeroImage } from '@/types/gallery';

/**
 * Centralized gallery image registry using Vite's import.meta.glob
 * Images are dynamically imported to reduce main bundle size while ensuring they're included in the build
 */

// Dynamically import all gallery images
const galleryModules = import.meta.glob<{ default: string }>('/src/assets/gallery/*.*', { eager: true });

// Helper to get image URL from path
const getImageUrl = (filename: string): string => {
  const path = `/src/assets/gallery/${filename}`;
  return galleryModules[path]?.default || path;
};

// ==================== HERO CAROUSEL IMAGES ====================
export const HERO_IMAGES: HeroImage[] = [
  {
    id: 'modern-kitchen-island-bar-stools',
    path: getImageUrl('modern-kitchen-island-bar-stools.jpeg'),
    alt: 'Modern kitchen island with wood bar stools and marble waterfall edge'
  },
  {
    id: 'luxury-kitchen-marble-dining',
    path: getImageUrl('luxury-kitchen-marble-dining.jpeg'),
    alt: 'Luxury kitchen with marble island and wood dining table integration'
  },
  {
    id: 'modern-bathroom-wood-marble',
    path: getImageUrl('modern-bathroom-wood-marble.jpeg'),
    alt: 'Modern bathroom with floating wood cabinets and marble vanity'
  },
  {
    id: 'luxury-marble-bathroom-shower',
    path: getImageUrl('luxury-marble-bathroom-shower.jpeg'),
    alt: 'Luxury marble bathroom with wood vanity and walk-in glass shower'
  },
  {
    id: 'modern-bathroom-floating-wood-vanity',
    path: getImageUrl('modern-bathroom-floating-wood-vanity.jpeg'),
    alt: 'Modern bathroom with floating wood vanity and marble walk-in shower'
  },
  {
    id: 'natural-wood-open-concept-kitchen',
    path: getImageUrl('natural-wood-open-concept-kitchen.jpeg'),
    alt: 'Natural wood open concept kitchen with dining area'
  },
  {
    id: 'wood-kitchen-outdoor-access',
    path: getImageUrl('wood-kitchen-outdoor-access.jpeg'),
    alt: 'Wood kitchen with marble countertops and outdoor patio access'
  }
];

// ==================== GALLERY IMAGES ====================
export const GALLERY_IMAGES: GalleryImage[] = [
  // === WHITE KITCHENS ===
  {
    id: 'kitchen-modern-white',
    path: getImageUrl('kitchen-modern-white.jpg'),
    alt: 'Modern white kitchen with stainless steel appliances',
    category: 'kitchens'
  },
  {
    id: 'kitchen-fireplace',
    path: getImageUrl('kitchen-fireplace.jpg'),
    alt: 'Contemporary kitchen with fireplace feature',
    category: 'kitchens'
  },
  {
    id: 'kitchen-pendant-lights',
    path: getImageUrl('kitchen-pendant-lights.jpg'),
    alt: 'White kitchen with glass pendant lights',
    category: 'kitchens'
  },
  {
    id: 'kitchen-island-view',
    path: getImageUrl('kitchen-island-view.jpg'),
    alt: 'Kitchen island with bar seating',
    category: 'kitchens'
  },
  {
    id: 'kitchen-traditional',
    path: getImageUrl('kitchen-traditional.jpg'),
    alt: 'Traditional style kitchen installation',
    category: 'kitchens'
  },
  {
    id: 'laundry-room',
    path: getImageUrl('laundry-room.jpg'),
    alt: 'White laundry room cabinetry',
    category: 'kitchens'
  },
  {
    id: 'bright-modern-white-kitchen-open',
    path: getImageUrl('bright-modern-white-kitchen-open.jpeg'),
    alt: 'Bright modern white kitchen with open concept dining and living area',
    category: 'kitchens'
  },
  {
    id: 'modern-white-kitchen-pendants',
    path: getImageUrl('modern-white-kitchen-pendants.jpeg'),
    alt: 'Modern white kitchen with island and globe pendant lights',
    category: 'kitchens'
  },
  {
    id: 'traditional-white-kitchen-gray-island',
    path: getImageUrl('traditional-white-kitchen-gray-island.jpg'),
    alt: 'Traditional white kitchen with gray island and subway tile backsplash',
    category: 'kitchens'
  },
  {
    id: 'minimalist-white-kitchen-island',
    path: getImageUrl('minimalist-white-kitchen-island.jpg'),
    alt: 'Minimalist white kitchen with modern island and contemporary lighting',
    category: 'kitchens'
  },
  {
    id: 'contemporary-white-kitchen-blue-wall',
    path: getImageUrl('contemporary-white-kitchen-blue-wall.jpg'),
    alt: 'Contemporary white kitchen with blue accent wall and modern design',
    category: 'kitchens'
  },
  {
    id: 'contemporary-white-gray-kitchen',
    path: getImageUrl('contemporary-white-gray-kitchen.jpeg'),
    alt: 'Contemporary white kitchen with gray island and modern fixtures',
    category: 'kitchens'
  },
  {
    id: 'contemporary-white-kitchen-marble-island',
    path: getImageUrl('contemporary-white-kitchen-marble-island.webp'),
    alt: 'Contemporary white kitchen with marble waterfall island and pendant lights',
    category: 'kitchens'
  },
  {
    id: 'bright-white-kitchen-island-windows',
    path: getImageUrl('bright-white-kitchen-island-windows.webp'),
    alt: 'Bright white kitchen with island and large windows',
    category: 'kitchens'
  },
  {
    id: 'minimalist-white-kitchen-wood-floor',
    path: getImageUrl('minimalist-white-kitchen-wood-floor.webp'),
    alt: 'Minimalist white kitchen with wood flooring and clean lines',
    category: 'kitchens'
  },
  {
    id: 'modern-white-kitchen-open-living',
    path: getImageUrl('modern-white-kitchen-open-living.webp'),
    alt: 'Modern white kitchen open to living area with marble island',
    category: 'kitchens'
  },
  {
    id: 'modern-white-kitchen-black-island-copper-pendants',
    path: getImageUrl('modern-white-kitchen-black-island-copper-pendants.webp'),
    alt: 'Modern white kitchen with black island and copper pendant lights',
    category: 'kitchens'
  },
  {
    id: 'open-concept-white-kitchen-black-island-dining',
    path: getImageUrl('open-concept-white-kitchen-black-island-dining.webp'),
    alt: 'Open concept white kitchen with black island and dining area',
    category: 'kitchens'
  },
  {
    id: 'open-concept-living-black-kitchen-island-copper-pendants',
    path: getImageUrl('open-concept-living-black-kitchen-island-copper-pendants.webp'),
    alt: 'Open concept living area with black kitchen island and copper pendant lights',
    category: 'kitchens'
  },
  {
    id: 'modern-gray-white-l-shaped-kitchen',
    path: getImageUrl('modern-gray-white-l-shaped-kitchen.webp'),
    alt: 'Modern L-shaped kitchen with gray and white cabinets',
    category: 'kitchens'
  },
  {
    id: 'minimalist-white-kitchen-wood-lower-cabinets',
    path: getImageUrl('minimalist-white-kitchen-wood-lower-cabinets.webp'),
    alt: 'Minimalist white kitchen with natural wood lower cabinets',
    category: 'kitchens'
  },
  {
    id: 'contemporary-white-kitchen-wood-island-bar',
    path: getImageUrl('contemporary-white-kitchen-wood-island-bar.webp'),
    alt: 'Contemporary white kitchen with wood island bar and pendant lights',
    category: 'kitchens'
  },
  {
    id: 'contemporary-white-kitchen-wood-island-seating',
    path: getImageUrl('contemporary-white-kitchen-wood-island-seating.webp'),
    alt: 'Contemporary white kitchen with wood island and bar seating',
    category: 'kitchens'
  },
  {
    id: 'modern-white-kitchen-dining-open-concept',
    path: getImageUrl('modern-white-kitchen-dining-open-concept.webp'),
    alt: 'Modern white kitchen with open concept dining area',
    category: 'kitchens'
  },
  {
    id: 'modern-white-kitchen-island-bar-stools',
    path: getImageUrl('modern-white-kitchen-island-bar-stools.webp'),
    alt: 'Modern white kitchen with marble island and bar stools',
    category: 'kitchens'
  },
  {
    id: 'compact-kitchen-wood-island-white',
    path: getImageUrl('compact-kitchen-wood-island-white.webp'),
    alt: 'Compact white kitchen with wood island and modern appliances',
    category: 'kitchens'
  },

  // === NATURAL WOOD KITCHENS ===
  {
    id: 'modern-white-wood-island-kitchen',
    path: getImageUrl('modern-white-wood-island-kitchen.jpg'),
    alt: 'Modern white kitchen with wood island and pendant lights',
    category: 'kitchens'
  },
  {
    id: 'white-wood-island-side-view',
    path: getImageUrl('white-wood-island-side-view.jpg'),
    alt: 'White kitchen with natural wood island side view',
    category: 'kitchens'
  },
  {
    id: 'natural-wood-kitchen-marble',
    path: getImageUrl('natural-wood-kitchen-marble.jpeg'),
    alt: 'Natural wood kitchen with marble backsplash and countertops',
    category: 'kitchens'
  },
  {
    id: 'natural-wood-galley-kitchen',
    path: getImageUrl('natural-wood-galley-kitchen.jpeg'),
    alt: 'Natural wood galley kitchen with marble backsplash and white countertops',
    category: 'kitchens'
  },
  {
    id: 'natural-wood-open-concept-kitchen',
    path: getImageUrl('natural-wood-open-concept-kitchen.jpeg'),
    alt: 'Natural wood open concept kitchen with dining area',
    category: 'kitchens'
  },
  {
    id: 'wood-kitchen-outdoor-access',
    path: getImageUrl('wood-kitchen-outdoor-access.jpeg'),
    alt: 'Wood kitchen with marble countertops and outdoor patio access',
    category: 'kitchens'
  },
  {
    id: 'modern-kitchen-island-orange-stools',
    path: getImageUrl('modern-kitchen-island-orange-stools.webp'),
    alt: 'Modern kitchen with wood island, gray marble countertop, and orange bar stools',
    category: 'kitchens'
  },
  {
    id: 'contemporary-kitchen-gray-countertop',
    path: getImageUrl('contemporary-kitchen-gray-countertop.webp'),
    alt: 'Contemporary kitchen with natural wood cabinetry, gray waterfall island, and pendant lighting',
    category: 'kitchens'
  },
  {
    id: 'modern-kitchen-wood-cabinets-closeup',
    path: getImageUrl('modern-kitchen-wood-cabinets-closeup.webp'),
    alt: 'Modern kitchen wood cabinets close-up with gray marble countertops',
    category: 'kitchens'
  },
  {
    id: 'modern-kitchen-marble-waterfall-wood-base',
    path: getImageUrl('modern-kitchen-marble-waterfall-wood-base.webp'),
    alt: 'Modern kitchen with marble waterfall island and natural wood base',
    category: 'kitchens'
  },
  {
    id: 'light-wood-kitchen-marble-island-bar',
    path: getImageUrl('light-wood-kitchen-marble-island-bar.webp'),
    alt: 'Light wood kitchen with marble island and bar seating',
    category: 'kitchens'
  },
  {
    id: 'light-wood-kitchen-dining-open-concept',
    path: getImageUrl('light-wood-kitchen-dining-open-concept.webp'),
    alt: 'Light wood open concept kitchen with dining area and pendant lights',
    category: 'kitchens'
  },
  {
    id: 'modern-wood-kitchen-dark-base-cabinets',
    path: getImageUrl('modern-wood-kitchen-dark-base-cabinets.webp'),
    alt: 'Modern kitchen with natural wood upper cabinets and dark base cabinets',
    category: 'kitchens'
  },
  {
    id: 'modern-kitchen-dining-wood-marble-windows',
    path: getImageUrl('modern-kitchen-dining-wood-marble-windows.webp'),
    alt: 'Modern open concept kitchen and dining with wood cabinets, marble island, and floor-to-ceiling windows',
    category: 'kitchens'
  },

  // === GREEN KITCHENS ===
  {
    id: 'green-kitchen-marble-island',
    path: getImageUrl('green-kitchen-marble-island.png'),
    alt: 'Green cabinets with marble waterfall island and brass accents',
    category: 'kitchens'
  },
  {
    id: 'green-open-concept-kitchen',
    path: getImageUrl('green-open-concept-kitchen.png'),
    alt: 'Green open concept kitchen with marble island',
    category: 'kitchens'
  },

  // === DARK KITCHENS ===
  {
    id: 'modern-kitchen-dark-island',
    path: getImageUrl('modern-kitchen-dark-island.jpg'),
    alt: 'Modern kitchen with dark island and wood accents',
    category: 'kitchens'
  },

  // === SPECIAL FEATURES ===
  {
    id: 'luxury-kitchen-marble-dining',
    path: getImageUrl('luxury-kitchen-marble-dining.jpeg'),
    alt: 'Luxury kitchen with marble island and wood dining table integration',
    category: 'kitchens'
  },
  {
    id: 'modern-kitchen-island-bar-stools',
    path: getImageUrl('modern-kitchen-island-bar-stools.jpeg'),
    alt: 'Modern kitchen island with wood bar stools and marble waterfall edge',
    category: 'kitchens'
  },
  {
    id: 'blum-drawer-hardware-closeup',
    path: getImageUrl('blum-drawer-hardware-closeup.jpg'),
    alt: 'Close-up of premium Blum drawer hardware installation',
    category: 'kitchens'
  },
  {
    id: 'minimalist-cabinet-detail',
    path: getImageUrl('minimalist-cabinet-detail.jpg'),
    alt: 'Minimalist cabinet detail with modern hardware',
    category: 'kitchens'
  },
  {
    id: 'white-kitchen-island-drawer-organization',
    path: getImageUrl('white-kitchen-island-drawer-organization.jpg'),
    alt: 'White kitchen island drawer organization with custom dividers',
    category: 'kitchens'
  },
  {
    id: 'white-kitchen-drawer-storage-organization',
    path: getImageUrl('white-kitchen-drawer-storage-organization.jpg'),
    alt: 'White kitchen drawer storage organization system',
    category: 'kitchens'
  },
  {
    id: 'white-cabinet-lift-mechanism-hardware',
    path: getImageUrl('white-cabinet-lift-mechanism-hardware.jpg'),
    alt: 'White cabinet lift mechanism hardware installation',
    category: 'kitchens'
  },
  {
    id: 'white-kitchen-construction-dark-island',
    path: getImageUrl('white-kitchen-construction-dark-island.jpg'),
    alt: 'White kitchen construction with dark island installation progress',
    category: 'kitchens'
  },
  {
    id: 'white-kitchen-dual-islands-pendants',
    path: getImageUrl('white-kitchen-dual-islands-pendants.jpg'),
    alt: 'White kitchen with dual islands and pendant lighting',
    category: 'kitchens'
  },
  {
    id: 'white-kitchen-gray-island-bar-seating',
    path: getImageUrl('white-kitchen-gray-island-bar-seating.jpg'),
    alt: 'White kitchen with gray island and bar seating area',
    category: 'kitchens'
  },
  {
    id: 'white-kitchen-island-dining-nook',
    path: getImageUrl('white-kitchen-island-dining-nook.jpg'),
    alt: 'White kitchen island with integrated dining nook',
    category: 'kitchens'
  },
  {
    id: 'white-kitchen-island-open-shelving',
    path: getImageUrl('white-kitchen-island-open-shelving.jpg'),
    alt: 'White kitchen island with open shelving and storage',
    category: 'kitchens'
  },

  // === VANITIES & BATHROOMS ===
  {
    id: 'modern-bathroom-marble-vanity',
    path: getImageUrl('modern-bathroom-marble-vanity.jpeg'),
    alt: 'Modern bathroom with marble vanity and gold fixtures',
    category: 'vanities'
  },
  {
    id: 'modern-powder-room-marble',
    path: getImageUrl('modern-powder-room-marble.jpeg'),
    alt: 'Modern powder room with marble countertop and storage',
    category: 'vanities'
  },
  {
    id: 'modern-bathroom-wood-marble',
    path: getImageUrl('modern-bathroom-wood-marble.jpeg'),
    alt: 'Modern bathroom with floating wood cabinets and marble vanity',
    category: 'vanities'
  },
  {
    id: 'marble-bathroom-outdoor-access',
    path: getImageUrl('marble-bathroom-outdoor-access.jpeg'),
    alt: 'Luxury marble bathroom with wood vanity and outdoor access',
    category: 'vanities'
  },
  {
    id: 'luxury-marble-bathroom-shower',
    path: getImageUrl('luxury-marble-bathroom-shower.jpeg'),
    alt: 'Luxury marble bathroom with wood vanity and walk-in glass shower',
    category: 'vanities'
  },
  {
    id: 'modern-bathroom-floating-wood-vanity',
    path: getImageUrl('modern-bathroom-floating-wood-vanity.jpeg'),
    alt: 'Modern bathroom with floating wood vanity and marble walk-in shower',
    category: 'vanities'
  },
  {
    id: 'modern-bathroom-tub-wood-vanity',
    path: getImageUrl('modern-bathroom-tub-wood-vanity.webp'),
    alt: 'Modern bathroom with tub, glass shower, and natural wood floating vanity',
    category: 'vanities'
  },
  {
    id: 'contemporary-bathroom-double-vanity',
    path: getImageUrl('contemporary-bathroom-double-vanity.webp'),
    alt: 'Contemporary bathroom with double sink wood vanity and marble countertop',
    category: 'vanities'
  },
  {
    id: 'modern-bathroom-glass-shower-wood',
    path: getImageUrl('modern-bathroom-glass-shower-wood.webp'),
    alt: 'Modern bathroom with wood vanity, glass walk-in shower, and marble tiles',
    category: 'vanities'
  },
  {
    id: 'contemporary-bathroom-wood-vanity-double-sink',
    path: getImageUrl('contemporary-bathroom-wood-vanity-double-sink.webp'),
    alt: 'Contemporary bathroom with natural wood floating double vanity, marble backsplash, and mirror medicine cabinets',
    category: 'vanities'
  },
  {
    id: 'contemporary-bathroom-wood-vanity-tub-shower',
    path: getImageUrl('contemporary-bathroom-wood-vanity-tub-shower.webp'),
    alt: 'Contemporary bathroom with wood floating vanity, marble tile, built-in tub, and walk-in shower',
    category: 'vanities'
  },

  // === CLOSETS & STORAGE ===
  {
    id: 'gray-wood-bedroom-closet',
    path: getImageUrl('gray-wood-bedroom-closet.jpg'),
    alt: 'Gray wood bedroom closet with integrated drawer storage',
    category: 'closets'
  },
  {
    id: 'light-gray-tall-storage-cabinet',
    path: getImageUrl('light-gray-tall-storage-cabinet.jpg'),
    alt: 'Light gray tall storage cabinet with minimalist design',
    category: 'closets'
  },

  // === DESIGN TO REALITY ===
  {
    id: 'design-render-kitchen-1-view1',
    path: getImageUrl('design-render-kitchen-1-view1.jpeg'),
    alt: '3D rendering of modern kitchen with natural wood cabinets and dark countertop - perspective view',
    category: 'design-to-reality'
  },
  {
    id: 'design-render-kitchen-1-view2',
    path: getImageUrl('design-render-kitchen-1-view2.jpeg'),
    alt: '3D rendering of modern kitchen with natural wood cabinets and dark countertop - alternate angle',
    category: 'design-to-reality'
  },
  {
    id: 'design-render-kitchen-1-view3',
    path: getImageUrl('design-render-kitchen-1-view3.jpeg'),
    alt: 'Top-down view of modern kitchen design layout with cabinetry placement',
    category: 'design-to-reality'
  },
  {
    id: 'design-reality-kitchen-1-completed-view1',
    path: getImageUrl('design-reality-kitchen-1-completed-view1.webp'),
    alt: 'Completed modern kitchen with natural wood cabinetry and marble waterfall island',
    category: 'design-to-reality'
  },
  {
    id: 'design-reality-kitchen-1-completed-view2',
    path: getImageUrl('design-reality-kitchen-1-completed-view2.webp'),
    alt: 'Completed modern kitchen alternate view showing wood cabinets and marble details',
    category: 'design-to-reality'
  },
  {
    id: 'design-render-kitchen-2-view1',
    path: getImageUrl('design-render-kitchen-2-view1.jpg'),
    alt: '3D rendering of contemporary kitchen with dark gray cabinets - render view',
    category: 'design-to-reality'
  },
  {
    id: 'design-reality-kitchen-2-completed-view1',
    path: getImageUrl('design-reality-kitchen-2-completed-view1.webp'),
    alt: 'Completed contemporary kitchen with dark gray cabinets and marble countertops',
    category: 'design-to-reality'
  },
  {
    id: 'design-render-kitchen-2-view2',
    path: getImageUrl('design-render-kitchen-2-view2.jpg'),
    alt: '3D rendering of contemporary kitchen with dark gray cabinets - alternate view',
    category: 'design-to-reality'
  },
  {
    id: 'design-reality-kitchen-2-completed-view2',
    path: getImageUrl('design-reality-kitchen-2-completed-view2.webp'),
    alt: 'Completed contemporary kitchen alternate angle showing cabinet details',
    category: 'design-to-reality'
  },
  {
    id: 'design-reality-kitchen-2-completed-view3',
    path: getImageUrl('design-reality-kitchen-2-completed-view3.webp'),
    alt: 'Completed contemporary kitchen final view with full installation',
    category: 'design-to-reality'
  }
];

/**
 * Get images by category
 */
export const getImagesByCategory = (category: string): GalleryImage[] => {
  if (category === 'all') return GALLERY_IMAGES;
  return GALLERY_IMAGES.filter(img => img.category === category);
};

/**
 * Get image by ID
 */
export const getImageById = (id: string): GalleryImage | undefined => {
  return GALLERY_IMAGES.find(img => img.id === id);
};

/**
 * Get hero image paths for preloading
 */
export const getHeroImagePaths = (): string[] => {
  return HERO_IMAGES.map(img => img.path);
};
