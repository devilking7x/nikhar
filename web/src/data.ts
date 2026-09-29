/** Skincare knowledge: concern metadata, tips and rule-based routine builder.
 *  Cosmetic guidance only — never medical advice. */
import type { Lang } from './i18n';

export interface ConcernMeta {
  label: string;
  tip: string;
  ingredients: string[];
  about: string;
  avoid: string[];
}

const CONCERNS: Record<string, Record<Lang, ConcernMeta>> = {
  radiance: {
    en: {
      label: 'Radiance',
      tip: 'Dullness often comes from dead-cell buildup and dehydration.',
      ingredients: ['Vitamin C', 'Niacinamide', 'Gentle AHA exfoliation'],
      about: 'Radiance is how light bounces off your skin — smooth, hydrated skin glows; rough, dry skin looks dull.',
      avoid: ['Skipping sunscreen', 'Over-exfoliating', 'Very late nights'],
    },
    hi: {
      label: 'निखार',
      tip: 'मुर्झाई स्किन अक्सर डेड सेल्स और पानी की कमी से होती है।',
      ingredients: ['विटामिन C', 'नियासिनामाइड', 'हल्का AHA एक्सफोलिएशन'],
      about: 'निखार यानी स्किन पर रोशनी का खेल — चिकनी, हाइड्रेटेड स्किन चमकती है; रूखी स्किन मुर्झाई लगती है।',
      avoid: ['सनस्क्रीन छोड़ना', 'ज़्यादा एक्सफोलिएशन', 'बहुत देर रातें'],
    },
  },
  pore: {
    en: {
      label: 'Pores',
      tip: 'Pores look larger with excess oil and sun damage.',
      ingredients: ['Niacinamide', 'Salicylic acid', 'Daily sunscreen'],
      about: 'Pores are tiny openings for oil and sweat — they look larger when clogged or when skin loses firmness.',
      avoid: ['Heavy comedogenic creams', 'Picking at skin', 'Skipping cleansing after sunscreen'],
    },
    hi: {
      label: 'पोर्स',
      tip: 'ज़्यादा ऑयल और धूप से पोर्स बड़े दिखते हैं।',
      ingredients: ['नियासिनामाइड', 'सैलिसिलिक एसिड', 'रोज़ सनस्क्रीन'],
      about: 'पोर्स तेल और पसीने के छोटे छेद हैं — बंद होने या कसाव घटने पर बड़े दिखते हैं।',
      avoid: ['भारी कॉमेडोजेनिक क्रीम', 'स्किन खुरचना', 'सनस्क्रीन के बाद सफाई छोड़ना'],
    },
  },
  texture: {
    en: {
      label: 'Texture',
      tip: 'Rough texture improves with regular gentle exfoliation.',
      ingredients: ['Lactic acid', 'PHA', 'Ceramide moisturizer'],
      about: 'Texture is how smooth your skin feels — dead-cell buildup and dryness make it rough.',
      avoid: ['Harsh physical scrubs', 'Hot water face wash', 'Layering too many actives'],
    },
    hi: {
      label: 'टेक्सचर',
      tip: 'हल्के नियमित एक्सफोलिएशन से खुरदरापन कम होता है।',
      ingredients: ['लैक्टिक एसिड', 'PHA', 'सेरामाइड मॉइस्चराइज़र'],
      about: 'टेक्सचर यानी स्किन कितनी चिकनी महसूस होती है — डेड सेल्स और रूखापन इसे खुरदरा बनाते हैं।',
      avoid: ['कठोर स्क्रब', 'गर्म पानी से मुँह धोना', 'बहुत सारे एक्टिव्स एक साथ'],
    },
  },
  acne: {
    en: {
      label: 'Acne',
      tip: 'Keep it simple — harsh scrubbing usually makes breakouts worse.',
      ingredients: ['Salicylic acid', 'Benzoyl peroxide (spot)', 'Non-comedogenic moisturizer'],
      about: 'Acne happens when pores clog with oil and dead cells and bacteria join in — very common, very treatable.',
      avoid: ['Picking / popping pimples', 'Harsh scrubbing', 'Heavy oily hair products on forehead'],
    },
    hi: {
      label: 'मुँहासे',
      tip: 'सिंपल रखो — ज़ोर से रगड़ने से दाने बढ़ते हैं।',
      ingredients: ['सैलिसिलिक एसिड', 'बेंज़ॉयल पेरोक्साइड (स्पॉट)', 'नॉन-कॉमेडोजेनिक मॉइस्चराइज़र'],
      about: 'मुँहासे तब होते हैं जब तेल और डेड सेल्स से पोर्स बंद हो जाते हैं — बहुत आम है, इलाज़ संभव है।',
      avoid: ['दाने फोड़ना', 'ज़ोर से रगड़ना', 'माथे पर भारी तैलीय हेयर प्रोडक्ट्स'],
    },
  },
  redness: {
    en: {
      label: 'Redness',
      tip: 'Redness calms down with barrier repair and fewer actives.',
      ingredients: ['Centella / cica', 'Ceramides', 'Fragrance-free routine'],
      about: 'Redness is extra blood flow near the surface — from sensitivity, heat, or a damaged barrier.',
      avoid: ['Fragranced products', 'Alcohol-based toners', 'Very hot water'],
    },
    hi: {
      label: 'लाली',
      tip: 'बैरियर रिपेयर और कम एक्टिव्स से लाली शांत होती है।',
      ingredients: ['सेंटेला / सिका', 'सेरामाइड्स', 'खुशबू-रहित रूटीन'],
      about: 'लाली सतह के पास ज़्यादा खून का बहाव है — संवेदनशीलता, गर्मी या खराब बैरियर से।',
      avoid: ['खुशबूदार प्रोडक्ट्स', 'अल्कोहल वाले टोनर', 'बहुत गर्म पानी'],
    },
  },
  oiliness: {
    en: {
      label: 'Oiliness',
      tip: 'Balance oil with lightweight hydration — skipping moisturizer backfires.',
      ingredients: ['Niacinamide', 'Gel moisturizer', 'Clay mask (weekly)'],
      about: "Oiliness is sebum — your skin's natural moisturizer. Too much of it shines and clogs pores.",
      avoid: ['Skipping moisturizer (backfires)', 'Over-washing', 'Heavy matte makeup daily'],
    },
    hi: {
      label: 'ऑयलीनेस',
      tip: 'हल्की हाइड्रेशन से ऑयल संतुलित करो — मॉइस्चराइज़र छोड़ना उल्टा पड़ता है।',
      ingredients: ['नियासिनामाइड', 'जेल मॉइस्चराइज़र', 'क्ले मास्क (हफ़्ते में एक बार)'],
      about: 'ऑयलीनेस यानी सीबम — स्किन का प्राकृतिक मॉइस्चराइज़र। ज़्यादा होने पर चमकता है और पोर्स बंद करता है।',
      avoid: ['मॉइस्चराइज़र छोड़ना (उल्टा पड़ता है)', 'बार-बार मुँह धोना', 'रोज़ भारी मैट मेकअप'],
    },
  },
  age_spot: {
    en: {
      label: 'Dark spots',
      tip: 'Spots fade slowly — sunscreen is the non-negotiable step.',
      ingredients: ['Vitamin C', 'Alpha arbutin', 'SPF 30+ daily'],
      about: 'Dark spots are extra melanin from sun exposure or old inflammation — they fade slowly with care.',
      avoid: ['Sun without sunscreen', 'Picking at spots', 'Lemon / home acids on skin'],
    },
    hi: {
      label: 'काले धब्बे',
      tip: 'धब्बे धीरे-धीरे हल्के होते हैं — सनस्क्रीन सबसे ज़रूरी है।',
      ingredients: ['विटामिन C', 'अल्फा आर्बुटिन', 'रोज़ SPF 30+'],
      about: 'काले धब्बे धूप या पुरानी सूजन से बना ज़्यादा मेलानिन है — देखभाल से धीरे-धीरे हल्के होते हैं।',
      avoid: ['बिना सनस्क्रीन धूप', 'धब्बे खुरचना', 'स्किन पर नींबू / घरेलू एसिड'],
    },
  },
  moisture: {
    en: {
      label: 'Hydration',
      tip: 'Dehydrated skin looks dull — layer light hydrating steps.',
      ingredients: ['Hyaluronic acid', 'Glycerin', 'Seal with moisturizer'],
      about: 'Hydration is water inside your skin — low water makes skin dull, tight and more lined.',
      avoid: ['Long hot water on face', 'Skipping moisturizer on damp skin', 'Alcohol-heavy products'],
    },
    hi: {
      label: 'हाइड्रेशन',
      tip: 'पानी की कमी वाली स्किन मुर्झाई दिखती है — हल्की लेयर्स लगाओ।',
      ingredients: ['हयालूरोनिक एसिड', 'ग्लिसरीन', 'मॉइस्चराइज़र से सील करो'],
      about: 'हाइड्रेशन यानी स्किन के अंदर पानी — कम पानी से स्किन मुर्झाई, खिंची और झुर्रीदार लगती है।',
      avoid: ['चेहरे पर लंबा गर्म पानी', 'गीली स्किन पर मॉइस्चराइज़र न लगाना', 'अल्कोहल वाले प्रोडक्ट्स'],
    },
  },
  dark_circle: {
    en: {
      label: 'Dark circles',
      tip: 'Sleep, sun protection and gentle care help most.',
      ingredients: ['7–8h sleep', 'Sunscreen', 'Caffeine eye cream'],
      about: 'Dark circles come from thin under-eye skin showing blood vessels, plus pigmentation or shadows.',
      avoid: ['Rubbing your eyes', 'Too little sleep', 'Skipping sunscreen around eyes'],
    },
    hi: {
      label: 'डार्क सर्कल',
      tip: 'नींद, धूप से बचाव और नरम देखभाल सबसे ज़्यादा मदद करते हैं।',
      ingredients: ['7–8 घंटे नींद', 'सनस्क्रीन', 'कैफीन आई क्रीम'],
      about: 'डार्क सर्कल पतली अंडर-आई स्किन से नसें दिखने, पिगमेंटेशन या छाया से होते हैं।',
      avoid: ['आँखें मलना', 'कम नींद', 'आँखों के आसपास सनस्क्रीन न लगाना'],
    },
  },
  eye_bag: {
    en: {
      label: 'Eye bags',
      tip: 'Cold compress and less salt before bed reduce morning puffiness.',
      ingredients: ['Cold compress', 'Elevated pillow', 'Gentle eye cream'],
      about: 'Eye bags are mild swelling under the eyes — fluid, salt, sleep position and age all play a role.',
      avoid: ['Salty late-night food', 'Sleeping flat on your stomach', 'Allergenic eye products'],
    },
    hi: {
      label: 'आँखों की सूजन',
      tip: 'ठंडी सिकाई और रात को कम नमक से सुबह की सूजन घटती है।',
      ingredients: ['ठंडी सिकाई', 'ऊँचा तकिया', 'हल्की आई क्रीम'],
      about: 'आँखों की सूजन आँखों के नीचे हल्की सूजन है — पानी, नमक, सोने की पोज़िशन और उम्र असर डालते हैं।',
      avoid: ['रात को ज़्यादा नमकीन खाना', 'पेट के बल सोना', 'एलर्जी वाले आई प्रोडक्ट्स'],
    },
  },
  wrinkle: {
    en: {
      label: 'Fine lines',
      tip: 'Sunscreen today prevents most lines tomorrow.',
      ingredients: ['SPF 30+ daily', 'Retinoid (night, gradual)', 'Peptides'],
      about: 'Fine lines are where skin folds repeatedly — sun damage speeds them up more than age alone.',
      avoid: ['Skipping sunscreen', 'Smoking', 'Sleeping face-down every night'],
    },
    hi: {
      label: 'झुर्रियाँ',
      tip: 'आज का सनस्क्रीन कल की ज़्यादातर झुर्रियाँ रोकता है।',
      ingredients: ['रोज़ SPF 30+', 'रेटिनॉइड (रात, धीरे-धीरे)', 'पेप्टाइड्स'],
      about: 'झुर्रियाँ वहाँ पड़ती हैं जहाँ स्किन बार-बार मुड़ती है — उम्र से ज़्यादा धूप इन्हें तेज़ करती है।',
      avoid: ['सनस्क्रीन छोड़ना', 'धूम्रपान', 'रोज़ मुँह के बल सोना'],
    },
  },
  firmness: {
    en: {
      label: 'Firmness',
      tip: 'Firmness loves consistency — protect collagen daily.',
      ingredients: ['Sunscreen', 'Vitamin C', 'Retinoid (night)'],
      about: 'Firmness comes from collagen and elastin — sun and time break them down; protection slows it.',
      avoid: ['Unprotected sun exposure', 'Yo-yo dieting', 'Smoking'],
    },
    hi: {
      label: 'कसाव',
      tip: 'कसाव को निरंतरता पसंद है — रोज़ कोलेजन बचाओ।',
      ingredients: ['सनस्क्रीन', 'विटामिन C', 'रेटिनॉइड (रात)'],
      about: 'कसाव कोलेजन और इलास्टिन से आता है — धूप और समय इन्हें तोड़ते हैं; बचाव धीमा करता है।',
      avoid: ['बिना बचाव धूप', 'बार-बार वज़न घटना-बढ़ना', 'धूम्रपान'],
    },
  },
};

export const concernMeta = (id: string, lang: Lang): ConcernMeta =>
  CONCERNS[id]?.[lang] ?? { label: id.replace(/_/g, ' '), tip: '', ingredients: [], about: '', avoid: [] };

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

// ------------------------------------------------- Indian look packs --
/** Curated occasion packs: styling notes + skin-prep tips (bilingual).
 *  Mirrors the new occasions in server/src/catalog.ts (diwali, shaadi, office-ethnic, college). */
export interface LookPack {
  tagline: string;
  styling: string[];
  prep: string[];
}

export const PACKS: Record<string, Record<Lang, LookPack>> = {
  diwali: {
    en: {
      tagline: 'Diwali Glow',
      styling: [
        'Maroon + warm festive tones glow in diya-light',
        'Keep jewellery minimal — the embroidery is the statement',
        'Drape the dupatta over one shoulder for photos',
      ],
      prep: ['Double-cleanse before festive makeup', 'Hydrating sheet mask the night before', 'SPF even for daytime pujas'],
    },
    hi: {
      tagline: 'दिवाली ग्लो',
      styling: [
        'दीये की रोशनी में मैरून + गर्म फेस्टिव रंग खिलते हैं',
        'ज्वेलरी कम रखो — कढ़ाई ही स्टेटमेंट है',
        'फोटो के लिए दुपट्टा एक कंधे पर डालो',
      ],
      prep: ['फेस्टिव मेकअप से पहले डबल-क्लींज़', 'एक रात पहले हाइड्रेटिंग शीट मास्क', 'दिन की पूजा के लिए भी SPF'],
    },
  },
  shaadi: {
    en: {
      tagline: 'Shaadi Season',
      styling: [
        'Emerald jewel tone flatters most Indian skin tones',
        'Statement earrings over necklace with this neckline',
        'Block heels you can dance in till 2am',
      ],
      prep: ['Start your glow routine 2 weeks before', 'Sleep 7–8h through the wedding week', 'Patch-test any new product early'],
    },
    hi: {
      tagline: 'शादी सीज़न',
      styling: [
        'एमराल्ड ज्वेल टोन ज़्यादातर भारतीय स्किन टोन पर जचता है',
        'इस नेकलाइन के साथ गले के हार से बेहतर बड़े झुमके',
        'ब्लॉक हील्स — रात 2 बजे तक डांस के लिए',
      ],
      prep: ['2 हफ़्ते पहले से ग्लो रूटीन शुरू करो', 'शादी वाले हफ़्ते 7–8 घंटे सोओ', 'नया प्रोडक्ट पहले पैच-टेस्ट करो'],
    },
  },
  'office-ethnic': {
    en: {
      tagline: 'Office Ethnic',
      styling: [
        'Kurta + structured layering = boardroom-ready ethnic',
        'Nude or tan juttis keep it professional',
        'One statement ring, nothing jangly',
      ],
      prep: ['Lightweight gel moisturizer under makeup', 'Blotting papers in your desk drawer', 'SPF 30 for the commute'],
    },
    hi: {
      tagline: 'ऑफिस एथनिक',
      styling: [
        'कुर्ता + स्ट्रक्चर्ड लेयरिंग = बोर्डरूम-रेडी एथनिक',
        'न्यूड या टैन जूतियाँ — प्रोफेशनल लुक',
        'एक स्टेटमेंट रिंग, झनझनाती चीज़ें नहीं',
      ],
      prep: ['मेकअप के नीचे हल्का जेल मॉइस्चराइज़र', 'ड्रॉअर में ब्लॉटिंग पेपर्स', 'सफ़र के लिए SPF 30'],
    },
  },
  college: {
    en: {
      tagline: 'College Casual',
      styling: [
        'Denim jacket over anything = instant cool',
        'White sneakers keep it campus-ready',
        'Roll the sleeves for an effortless vibe',
      ],
      prep: ['Gentle cleanser after a dusty commute', 'Sunscreen — campus sun is real', 'Keep it simple: cleanse, moisturize, SPF'],
    },
    hi: {
      tagline: 'कॉलेज कैज़ुअल',
      styling: [
        'किसी भी चीज़ पर डेनिम जैकेट = तुरंत कूल',
        'सफ़ेद स्नीकर्स — कैम्पस-रेडी',
        'आस्तीन मोड़ो — एफर्टलेस वाइब',
      ],
      prep: ['धूल भरे सफ़र के बाद हल्का क्लींज़र', 'सनस्क्रीन — कैम्पस की धूप असली है', 'सिंपल रखो: क्लींज़, मॉइस्चराइज़, SPF'],
    },
  },
};

// ------------------------------------------------- local catalog fallback --
/** Mirrors server/src/catalog.ts — used only if /api/garments is unreachable. */
export const FALLBACK_GARMENTS = [
  { id: 'tshirt-blush', name: 'Blush Pink Tee', file: 'tshirt-blush.jpg', category: 'upper_body', occasions: ['casual'], blurb: '', tones: ['warm', 'neutral'] },
  { id: 'jacket-indigo', name: 'Indigo Denim Jacket', file: 'jacket-indigo.jpg', category: 'upper_body', occasions: ['casual', 'college'], blurb: '', tones: ['cool', 'neutral'] },
  { id: 'blazer-lavender', name: 'Lavender Blazer', file: 'blazer-lavender.jpg', category: 'upper_body', occasions: ['office'], blurb: '', tones: ['cool', 'neutral'] },
  { id: 'kurta-maroon', name: 'Maroon Embroidered Kurta', file: 'kurta-maroon.jpg', category: 'upper_body', occasions: ['festive', 'diwali', 'office-ethnic'], blurb: '', tones: ['warm', 'neutral'] },
  { id: 'dress-rose', name: 'Rose Satin Dress', file: 'dress-rose.jpg', category: 'full_body', occasions: ['party'], blurb: '', tones: ['cool', 'neutral'] },
  { id: 'lehenga-emerald', name: 'Emerald Lehenga', file: 'lehenga-emerald.jpg', category: 'full_body', occasions: ['wedding', 'festive', 'shaadi'], blurb: '', tones: ['cool', 'neutral'] },
];
export const FALLBACK_OCCASIONS = [
  { id: 'casual', name: 'Casual Day Out', garmentId: 'tshirt-blush', palette: '', note: '' },
  { id: 'office', name: 'Office', garmentId: 'blazer-lavender', palette: '', note: '' },
  { id: 'party', name: 'Party', garmentId: 'dress-rose', palette: '', note: '' },
  { id: 'festive', name: 'Festive', garmentId: 'kurta-maroon', palette: '', note: '' },
  { id: 'wedding', name: 'Wedding', garmentId: 'lehenga-emerald', palette: '', note: '' },
  { id: 'diwali', name: 'Diwali Glow', garmentId: 'kurta-maroon', palette: '', note: '' },
  { id: 'shaadi', name: 'Shaadi Season', garmentId: 'lehenga-emerald', palette: '', note: '' },
  { id: 'office-ethnic', name: 'Office Ethnic', garmentId: 'kurta-maroon', palette: '', note: '' },
  { id: 'college', name: 'College Casual', garmentId: 'jacket-indigo', palette: '', note: '' },
];
