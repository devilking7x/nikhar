/**
 * Clearly-labeled sample data for DEMO mode (no YOUCAM_API_KEY configured).
 * Every demo response carries `demo: true` and the UI renders a
 * "Demo preview — connect API key for live analysis" badge.
 * These numbers are illustrative only, never presented as a real analysis.
 */
import type { SkinAnalysis } from './youcam.js';

export const DEMO_SKIN: SkinAnalysis = {
  glowScore: 74,
  skinAge: 27,
  concerns: [
    { id: 'radiance', score: 62 },
    { id: 'dark_circle', score: 64 },
    { id: 'moisture', score: 66 },
    { id: 'pore', score: 68 },
    { id: 'oiliness', score: 70 },
    { id: 'texture', score: 71 },
    { id: 'eye_bag', score: 72 },
    { id: 'redness', score: 78 },
    { id: 'firmness', score: 80 },
    { id: 'age_spot', score: 82 },
    { id: 'acne', score: 84 },
    { id: 'wrinkle', score: 88 },
  ],
};

export const DEMO_TONE_COLOR = '#c68e5e';

/** Demo try-on results (AI-generated sample renders, clearly labeled in UI). */
export const DEMO_VTO: Record<string, string> = {
  'tshirt-blush': '/garments/demo-vto-tshirt.jpg',
  'jacket-indigo': '/garments/demo-vto-jacket.jpg',
  'blazer-lavender': '/garments/demo-vto-blazer.jpg',
  'kurta-maroon': '/garments/demo-vto-kurta.jpg',
  'dress-rose': '/garments/demo-vto-dress.jpg',
  'lehenga-emerald': '/garments/demo-vto-lehenga.jpg',
};
