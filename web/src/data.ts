/** Skincare knowledge: concern metadata, tips and rule-based routine builder.
 *  Cosmetic guidance only — never medical advice. */
import type { Lang } from './i18n';

export interface ConcernMeta {
  label: string;
  tip: string;
  ingredients: string[];
}

const CONCERNS: Record<string, Record<Lang, ConcernMeta>> = {
  radiance: {
    en: { label: 'Radiance', tip: 'Dullness often comes from dead-cell buildup and dehydration.', ingredients: ['Vitamin C', 'Niacinamide', 'Gentle AHA exfoliation'] },
    hi: { label: 'निखार', tip: 'मुर्झाई स्किन अक्सर डेड सेल्स और पानी की कमी से होती है।', ingredients: ['विटामिन C', 'नियासिनामाइड', 'हल्का AHA एक्सफोलिएशन'] },
  },
  pore: {
    en: { label: 'Pores', tip: 'Pores look larger with excess oil and sun damage.', ingredients: ['Niacinamide', 'Salicylic acid', 'Daily sunscreen'] },
    hi: { label: 'पोर्स', tip: 'ज़्यादा ऑयल और धूप से पोर्स बड़े दिखते हैं।', ingredients: ['नियासिनामाइड', 'सैलिसिलिक एसिड', 'रोज़ सनस्क्रीन'] },
  },
  texture: {
    en: { label: 'Texture', tip: 'Rough texture improves with regular gentle exfoliation.', ingredients: ['Lactic acid', 'PHA', 'Ceramide moisturizer'] },
    hi: { label: 'टेक्सचर', tip: 'हल्के नियमित एक्सफोलिएशन से खुरदरापन कम होता है।', ingredients: ['लैक्टिक एसिड', 'PHA', 'सेरामाइड मॉइस्चराइज़र'] },
  },
  acne: {
    en: { label: 'Acne', tip: 'Keep it simple — harsh scrubbing usually makes breakouts worse.', ingredients: ['Salicylic acid', 'Benzoyl peroxide (spot)', 'Non-comedogenic moisturizer'] },
    hi: { label: 'मुँहासे', tip: 'सिंपल रखो — ज़ोर से रगड़ने से दाने बढ़ते हैं।', ingredients: ['सैलिसिलिक एसिड', 'बेंज़ॉयल पेरोक्साइड (स्पॉट)', 'नॉन-कॉमेडोजेनिक मॉइस्चराइज़र'] },
  },
  redness: {
    en: { label: 'Redness', tip: 'Redness calms down with barrier repair and fewer actives.', ingredients: ['Centella / cica', 'Ceramides', 'Fragrance-free routine'] },
    hi: { label: 'लाली', tip: 'बैरियर रिपेयर और कम एक्टिव्स से लाली शांत होती है।', ingredients: ['सेंटेला / सिका', 'सेरामाइड्स', 'खुशबू-रहित रूटीन'] },
  },
  oiliness: {
    en: { label: 'Oiliness', tip: 'Balance oil with lightweight hydration — skipping moisturizer backfires.', ingredients: ['Niacinamide', 'Gel moisturizer', 'Clay mask (weekly)'] },
    hi: { label: 'ऑयलीनेस', tip: 'हल्की हाइड्रेशन से ऑयल संतुलित करो — मॉइस्चराइज़र छोड़ना उल्टा पड़ता है।', ingredients: ['नियासिनामाइड', 'जेल मॉइस्चराइज़र', 'क्ले मास्क (हफ़्ते में एक बार)'] },
  },
  age_spot: {
    en: { label: 'Dark spots', tip: 'Spots fade slowly — sunscreen is the non-negotiable step.', ingredients: ['Vitamin C', 'Alpha arbutin', 'SPF 30+ daily'] },
    hi: { label: 'काले धब्बे', tip: 'धब्बे धीरे-धीरे हल्के होते हैं — सनस्क्रीन सबसे ज़रूरी है।', ingredients: ['विटामिन C', 'अल्फा आर्बुटिन', 'रोज़ SPF 30+'] },
  },
  moisture: {
    en: { label: 'Hydration', tip: 'Dehydrated skin looks dull — layer light hydrating steps.', ingredients: ['Hyaluronic acid', 'Glycerin', 'Seal with moisturizer'] },
    hi: { label: 'हाइड्रेशन', tip: 'पानी की कमी वाली स्किन मुर्झाई दिखती है — हल्की लेयर्स लगाओ।', ingredients: ['हयालूरोनिक एसिड', 'ग्लिसरीन', 'मॉइस्चराइज़र से सील करो'] },
  },
  dark_circle: {
    en: { label: 'Dark circles', tip: 'Sleep, sun protection and gentle care help most.', ingredients: ['7–8h sleep', 'Sunscreen', 'Caffeine eye cream'] },
    hi: { label: 'डार्क सर्कल', tip: 'नींद, धूप से बचाव और नरम देखभाल सबसे ज़्यादा मदद करते हैं।', ingredients: ['7–8 घंटे नींद', 'सनस्क्रीन', 'कैफीन आई क्रीम'] },
  },
  eye_bag: {
    en: { label: 'Eye bags', tip: 'Cold compress and less salt before bed reduce morning puffiness.', ingredients: ['Cold compress', 'Elevated pillow', 'Gentle eye cream'] },
    hi: { label: 'आँखों की सूजन', tip: 'ठंडी सिकाई और रात को कम नमक से सुबह की सूजन घटती है।', ingredients: ['ठंडी सिकाई', 'ऊँचा तकिया', 'हल्की आई क्रीम'] },
  },
  wrinkle: {
    en: { label: 'Fine lines', tip: 'Sunscreen today prevents most lines tomorrow.', ingredients: ['SPF 30+ daily', 'Retinoid (night, gradual)', 'Peptides'] },
    hi: { label: 'झुर्रियाँ', tip: 'आज का सनस्क्रीन कल की ज़्यादातर झुर्रियाँ रोकता है।', ingredients: ['रोज़ SPF 30+', 'रेटिनॉइड (रात, धीरे-धीरे)', 'पेप्टाइड्स'] },
  },
  firmness: {
    en: { label: 'Firmness', tip: 'Firmness loves consistency — protect collagen daily.', ingredients: ['Sunscreen', 'Vitamin C', 'Retinoid (night)'] },
    hi: { label: 'कसाव', tip: 'कसाव को निरंतरता पसंद है — रोज़ कोलेजन बचाओ।', ingredients: ['सनस्क्रीन', 'विटामिन C', 'रेटिनॉइड (रात)'] },
  },
};

export const concernMeta = (id: string, lang: Lang): ConcernMeta =>
  CONCERNS[id]?.[lang] ?? { label: id.replace(/_/g, ' '), tip: '', ingredients: [] };

/** Rule-based AM/PM routine from the weakest concerns — honest, ingredient-level. */
export function buildRoutine(
  concerns: { id: string; score: number }[],
  lang: Lang,
): { am: string[]; pm: string[] } {
  const weak = [...concerns].sort((a, b) => a.score - b.score).slice(0, 3).map((c) => c.id);
  const pick = (id: string) => CONCERNS[id]?.[lang]?.ingredients ?? [];
  const am = new Set<string>();
  const pm = new Set<string>();
  const en = lang === 'en';
  am.add(en ? 'Gentle cleanser' : 'हल्का क्लींज़र');
  pm.add(en ? 'Double cleanse (oil + gentle cleanser)' : 'डबल क्लींज़ (ऑयल + हल्का क्लींज़र)');
  for (const id of weak) {
    const ing = pick(id);
    if (ing[0]) am.add(ing[0]);
    if (ing[1]) pm.add(ing[1]);
  }
  am.add(en ? 'Moisturizer' : 'मॉइस्चराइज़र');
  am.add(en ? 'Sunscreen SPF 30+' : 'सनस्क्रीन SPF 30+');
  pm.add(en ? 'Moisturizer' : 'मॉइस्चराइज़र');
  return { am: [...am].slice(0, 6), pm: [...pm].slice(0, 6) };
}

// ------------------------------------------------------------ shades --
export type Undertone = 'warm' | 'cool' | 'neutral';

export function quizUndertone(a: number[]): Undertone {
  // answers: 0 = warm-leaning, 1 = cool-leaning, 2 = neutral
  const warm = a.filter((x) => x === 0).length;
  const cool = a.filter((x) => x === 1).length;
  if (warm >= 2) return 'warm';
  if (cool >= 2) return 'cool';
  return 'neutral';
}

export interface ShadeGroup {
  undertone: Undertone;
  shades: string[];
  examples: string[];
}

export const SHADES: ShadeGroup[] = [
  {
    undertone: 'warm',
    shades: ['Honey', 'Golden Beige', 'Toffee', 'Warm Sand'],
    examples: ['Fenty 240 · MAC NC30 · Maybelline Fit Me 228'],
  },
  {
    undertone: 'cool',
    shades: ['Porcelain', 'Cool Ivory', 'Rose Beige', 'Cool Sand'],
    examples: ['Fenty 110 · MAC NW15 · Maybelline Fit Me 110'],
  },
  {
    undertone: 'neutral',
    shades: ['Natural Beige', 'True Nude', 'Soft Tan', 'Classic Ivory'],
    examples: ['Fenty 170 · MAC NC20 · Lakmé 9to5 N3'],
  },
];

// ------------------------------------------------- local catalog fallback --
/** Mirrors server/src/catalog.ts — used only if /api/garments is unreachable. */
export const FALLBACK_GARMENTS = [
  { id: 'tshirt-blush', name: 'Blush Pink Tee', file: 'tshirt-blush.jpg', category: 'upper_body', occasions: ['casual'], blurb: '' },
  { id: 'jacket-indigo', name: 'Indigo Denim Jacket', file: 'jacket-indigo.jpg', category: 'upper_body', occasions: ['casual'], blurb: '' },
  { id: 'blazer-lavender', name: 'Lavender Blazer', file: 'blazer-lavender.jpg', category: 'upper_body', occasions: ['office'], blurb: '' },
  { id: 'kurta-maroon', name: 'Maroon Embroidered Kurta', file: 'kurta-maroon.jpg', category: 'upper_body', occasions: ['festive'], blurb: '' },
  { id: 'dress-rose', name: 'Rose Satin Dress', file: 'dress-rose.jpg', category: 'full_body', occasions: ['party'], blurb: '' },
  { id: 'lehenga-emerald', name: 'Emerald Lehenga', file: 'lehenga-emerald.jpg', category: 'full_body', occasions: ['wedding', 'festive'], blurb: '' },
];
export const FALLBACK_OCCASIONS = [
  { id: 'casual', name: 'Casual Day Out', garmentId: 'tshirt-blush', palette: '', note: '' },
  { id: 'office', name: 'Office', garmentId: 'blazer-lavender', palette: '', note: '' },
  { id: 'party', name: 'Party', garmentId: 'dress-rose', palette: '', note: '' },
  { id: 'festive', name: 'Festive', garmentId: 'kurta-maroon', palette: '', note: '' },
  { id: 'wedding', name: 'Wedding', garmentId: 'lehenga-emerald', palette: '', note: '' },
];
