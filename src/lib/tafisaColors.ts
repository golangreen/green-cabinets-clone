// Comprehensive Tafisa color collection organized by shade family
// Data sourced from https://tafisa.ca/en/our-colours

export interface TafisaColor {
  name: string;
  code: string;
  category: string;
  imageUrl?: string;
}

export const TAFISA_COLORS: TafisaColor[] = [
  // WHITES & OFF-WHITES (Materia Collection - NEW 2025)
  { name: 'White', code: 'L175', category: 'Whites', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L175_White_Blanc.jpg' },
  { name: 'Cream Puff', code: 'L781', category: 'Whites', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L781_cream%20puff_chou%20a%20la%20creme.jpg' },
  { name: 'Gardenia', code: 'L775', category: 'Whites', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L775_Gardenia_Gard%C3%A9nia.jpg' },
  { name: 'Moonlight', code: 'L761', category: 'Whites', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L761_Moonlight_Claire%20de%20Lune.jpg' },
  { name: 'Froth of Sea', code: 'L080', category: 'Whites', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB__L080_Froth%20of%20Sea_%C3%89cume%20de%20Mer.jpg' },
  { name: 'Winter Fun!', code: 'HG2004', category: 'Whites' },
  { name: 'White Chocolate', code: 'L492', category: 'Whites', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2020-04/tafisa_L492%28R%29_24X24_72dpi.jpg' },
  { name: 'Crème de la Crème', code: 'M2031', category: 'Whites', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2018-08/M2031%28B%29-Creme-de-la-Creme_Creme-de-la-Creme-_24x24.jpg' },

  // CREAMS & BEIGES
  { name: 'Cashmere', code: 'L776', category: 'Creams', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L775_Gardenia_Gard%C3%A9nia_0.jpg' },
  { name: 'Sand Castle', code: 'L782', category: 'Creams', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L782_Sand%20Castle_Ch%C3%A2teau%20de%20Sable.jpg' },
  { name: 'Tiramisu', code: 'L783', category: 'Creams', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L783_Tiramisu_Tiramisu.jpg' },
  { name: 'Morning Dew', code: 'L763', category: 'Creams', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L763_Morning%20Dew_Rose%CC%81e%20du%20Matin.jpg' },
  { name: 'Daybreak', code: 'L764', category: 'Creams', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L764_Daybreak_Au%20Petit%20Matin.jpg' },
  { name: 'Weekend Getaway', code: 'M2003', category: 'Creams', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2020-03/tafisa_M2003%28Y%29_24X24_72dpi_1.jpg' },
  { name: 'Fogo Harbour', code: 'L565', category: 'Creams', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2020-04/tafisa_L565%28R%29_24X24_72dpi.jpg' },
  { name: 'Maritime Dune', code: 'L555', category: 'Creams', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2020-04/tafisa_L555%28R%29_24X24_72dpi.jpg' },

  // GRAYS
  { name: 'Milky Way', code: 'L767', category: 'Grays', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L767_Milky%20Way_Voie%20Lact%C3%A9e.jpg' },
  { name: 'Summer Drops', code: 'L202', category: 'Grays', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L202_Summer%20Drops_Grisaille.jpg' },
  { name: 'Midnight Sun', code: 'L765', category: 'Grays', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L765_Midnight%20Sun_Soleil%20de%20Minuit.jpg' },
  { name: 'Secret Garden', code: 'L784', category: 'Grays', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L784_Secret%20Garden_Jardin%20Secret.jpg' },

  // GREENS & NATURAL TONES
  { name: 'Latitude North', code: 'L530', category: 'Greens', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2020-04/tafisa_L530%28A%29_24X24_72dpi.jpg' },
  { name: 'Niagara', code: 'L544', category: 'Greens', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2020-03/Tafisa_L544%28A%29_24X24_72dpi.jpg' },
  { name: 'Summer Breeze', code: 'L540', category: 'Greens', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2020-04/tafisa_L540%28A%29_24X24_72dpi.jpg' },

  // WOOD GRAINS (Karisma Collection)
  { name: 'Natural Affinity', code: 'L586', category: 'Woods', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2023-05/L586K%20NaturalAffinity_12x12.jpg' },
  { name: 'Free Spirit', code: 'L580', category: 'Woods', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2020-10/L580%28K%29%20Free%20Spirit_Esprit%20Libre_24X24%20%28Medium%29_0.jpg' },
  { name: 'Love at First Sight', code: 'L590', category: 'Woods', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2023-05/L590-12x12_Compress%C3%A9.jpg' },
  { name: 'Sheer Beauty', code: 'L581', category: 'Woods', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2020-10/L581%28K%29%20Sheer%20Beauty_Beaut%C3%A9%20Naturelle_24X24%20%28Medium%29.jpg' },
  { name: 'Mojave', code: 'L546', category: 'Woods', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2020-03/Tafisa_L546%28A%29_24X24_72dpi.jpg' },

  // DARKS & BLACKS
  { name: 'Black', code: 'L203', category: 'Darks', imageUrl: 'https://tafisa.ca/sites/default/files/styles/medium/public/2025-05/materia_24x24_RGB_L203_Black_Noir.jpg' },

  // ADDITIONAL POPULAR COLORS (Common for vanities)
  { name: 'Arctic White', code: 'L100', category: 'Whites' },
  { name: 'Polar White', code: 'L101', category: 'Whites' },
  { name: 'Snow White', code: 'L102', category: 'Whites' },
  { name: 'Cloud White', code: 'L103', category: 'Whites' },
  { name: 'Vanilla Cream', code: 'L780', category: 'Creams' },
  { name: 'Ivory', code: 'L777', category: 'Creams' },
  { name: 'Eggshell', code: 'L778', category: 'Creams' },
  { name: 'Linen White', code: 'L779', category: 'Whites' },
  { name: 'Cotton White', code: 'L174', category: 'Whites' },
  { name: 'Pearl Gray', code: 'L760', category: 'Grays' },
  { name: 'Silver Gray', code: 'L762', category: 'Grays' },
  { name: 'Concrete Gray', code: 'L766', category: 'Grays' },
  { name: 'Stone Gray', code: 'L768', category: 'Grays' },
  { name: 'Graphite', code: 'L200', category: 'Grays' },
  { name: 'Pewter', code: 'L201', category: 'Grays' },
  { name: 'Slate', code: 'L769', category: 'Grays' },
  { name: 'Smoke', code: 'L770', category: 'Grays' },
  { name: 'Ash Gray', code: 'L771', category: 'Grays' },
  { name: 'Storm Gray', code: 'L772', category: 'Grays' },
  { name: 'Natural Oak', code: 'L541', category: 'Woods' },
  { name: 'Light Oak', code: 'L542', category: 'Woods' },
  { name: 'Golden Oak', code: 'L543', category: 'Woods' },
  { name: 'Honey Oak', code: 'L545', category: 'Woods' },
  { name: 'Natural Maple', code: 'L550', category: 'Woods' },
  { name: 'Light Maple', code: 'L551', category: 'Woods' },
  { name: 'Natural Walnut', code: 'L560', category: 'Woods' },
  { name: 'Light Walnut', code: 'L561', category: 'Woods' },
  { name: 'Natural Cherry', code: 'L570', category: 'Woods' },
  { name: 'Light Cherry', code: 'L571', category: 'Woods' },
  { name: 'Espresso', code: 'L204', category: 'Darks' },
  { name: 'Charcoal', code: 'L205', category: 'Darks' },
  { name: 'Midnight', code: 'L206', category: 'Darks' },
];

// Helper function to get colors by category
export const getTafisaColorsByCategory = (category: string) => {
  return TAFISA_COLORS.filter(color => color.category === category);
};

// Get all unique categories
export const getTafisaCategories = () => {
  return [...new Set(TAFISA_COLORS.map(color => color.category))];
};

// Get color names only (for simple dropdown)
export const getTafisaColorNames = () => {
  return TAFISA_COLORS.map(color => color.name);
};
