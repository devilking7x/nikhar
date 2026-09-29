/** Built-in sample garment catalog (AI-generated product shots in web/public/garments). */
export interface Garment {
  id: string;
  name: string;
  file: string;
  category: 'upper_body' | 'full_body' | 'lower_body';
  occasions: string[];
  blurb: string;
}

export const GARMENTS: Garment[] = [
  {
    id: 'tshirt-blush',
    name: 'Blush Pink Tee',
    file: 'tshirt-blush.jpg',
    category: 'upper_body',
    occasions: ['casual'],
    blurb: 'Everyday soft cotton tee in a fresh blush tone.',
  },
  {
    id: 'jacket-indigo',
    name: 'Indigo Denim Jacket',
    file: 'jacket-indigo.jpg',
    category: 'upper_body',
    occasions: ['casual'],
    blurb: 'Classic indigo denim layer for easy daytime looks.',
  },
  {
    id: 'blazer-lavender',
    name: 'Lavender Blazer',
    file: 'blazer-lavender.jpg',
    category: 'upper_body',
    occasions: ['office'],
    blurb: 'Sharp tailored blazer in calming lavender.',
  },
  {
    id: 'kurta-maroon',
    name: 'Maroon Embroidered Kurta',
    file: 'kurta-maroon.jpg',
    category: 'upper_body',
    occasions: ['festive'],
    blurb: 'Festive maroon kurta with delicate embroidery.',
  },
  {
    id: 'dress-rose',
    name: 'Rose Satin Dress',
    file: 'dress-rose.jpg',
    category: 'full_body',
    occasions: ['party'],
    blurb: 'Fluid rose satin midi for evenings out.',
  },
  {
    id: 'lehenga-emerald',
    name: 'Emerald Lehenga',
    file: 'lehenga-emerald.jpg',
    category: 'full_body',
    occasions: ['wedding', 'festive'],
    blurb: 'Regal emerald lehenga for the big celebrations.',
  },
];

export interface Occasion {
  id: string;
  name: string;
  garmentId: string;
  palette: string;
  note: string;
}

export const OCCASIONS: Occasion[] = [
  {
    id: 'casual',
    name: 'Casual Day Out',
    garmentId: 'tshirt-blush',
    palette: 'soft, fresh tones',
    note: 'relaxed silhouette, breathable fabrics',
  },
  {
    id: 'office',
    name: 'Office',
    garmentId: 'blazer-lavender',
    palette: 'muted, confident tones',
    note: 'structured shoulders, polished finish',
  },
  {
    id: 'party',
    name: 'Party',
    garmentId: 'dress-rose',
    palette: 'luminous, evening tones',
    note: 'fluid drape that catches the light',
  },
  {
    id: 'festive',
    name: 'Festive',
    garmentId: 'kurta-maroon',
    palette: 'rich celebratory tones',
    note: 'embroidery detail, graceful fall',
  },
  {
    id: 'wedding',
    name: 'Wedding',
    garmentId: 'lehenga-emerald',
    palette: 'jewel tones',
    note: 'full regal silhouette, statement look',
  },
];
