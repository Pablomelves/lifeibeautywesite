import { Product, Review, SkinConcern, RoutineStep, Category, FAQItem } from '../types';

/**
 * Li Fei Beauty store structure
 * Demo / mock products are removed; live products are dynamically loaded from Shopify.
 */
export const STORE_PRODUCTS: Product[] = [];

export const CATEGORIES: Category[] = [
  {
    id: 'serums',
    name: 'Serums & Ampoules',
    count: 0,
    desc: 'Active cellular renewal with PDRN and pure NAD+ longevity peptides.'
  },
  {
    id: 'masks',
    name: 'Bio-Collagen Masks',
    count: 0,
    desc: 'Low-molecular deep collagen hydrogel treatments.'
  },
  {
    id: 'cleansers',
    name: 'Pore Cleansers & Toners',
    count: 0,
    desc: 'Gentle exfoliating AHA/BHA pads and barrier balancing infusions.'
  },
  {
    id: 'moisturizers',
    name: 'Barrier Creams',
    count: 0,
    desc: 'Deep ceramide cushions that seal in active nutrients.'
  },
  {
    id: 'tools',
    name: 'Tools & Cryo Sculpting',
    count: 0,
    desc: 'Professional contouring rollers and lymphatic drainage tools.'
  }
];

export const SKIN_CONCERNS: SkinConcern[] = [
  {
    id: 'dullness',
    title: 'Dullness & Uneven Tone',
    subtitle: '광채 부족 · 칙칙함',
    description: 'Loss of internal luminosity from environmental oxidants, dehydration, and sluggish cellular turnover. Bio-available PDRN (Salmon DNA) and Damask Rose hydrosol accelerate cellular renewal to produce mirror glass skin.',
    iconName: 'Sun',
    recommendedProductId: 1,
    targetActives: ['PDRN (Salmon DNA)', 'Damask Rose Water', 'Niacinamide 2%'],
    clinicalResult: '+192% Collagen Synthesis & Instant Plump'
  },
  {
    id: 'elasticity',
    title: 'Loss of Firmness & Sagging',
    subtitle: '탄력 저하 · 리프팅',
    description: 'Degradation of collagen fibrils and slowed ATP regeneration causing slack jawline contour and deeper expression creases. Epidermal Growth Factor (EGF) and pure NAD+ replenish cellular mitochondrial energy.',
    iconName: 'Shield',
    recommendedProductId: 2,
    targetActives: ['EGF | NAD Cell Complex', 'Collagen Extract 10,000ppm', 'Ruby Pomegranate'],
    clinicalResult: '-34% Wrinkle Depth & +140% Dermal Density'
  },
  {
    id: 'pigmentation',
    title: 'Hyperpigmentation & Sun Spots',
    subtitle: '색소 침착 · 기미 잡티',
    description: 'Melanin overproduction triggered by UV exposure and post-inflammatory acne marks causing mottled skin tone. High-purity Kojic Acid synergized with antioxidant Turmeric interrupts tyrosinase activity.',
    iconName: 'Sparkles',
    recommendedProductId: 3,
    targetActives: ['Kojic Acid 1.5%', 'Fermented Turmeric Root', 'Niacinamide 4%'],
    clinicalResult: '-48% Melanin Density in 21 Days'
  },
  {
    id: 'pores',
    title: 'Enlarged Pores & Barrier Breakdown',
    subtitle: '늘어진 모공 · 장벽 손상',
    description: 'Depleted ceramide matrix that leaves pores exposed and slackened, unable to retain intradermal water. Oligo-hyaluronic acid and low-molecular collagen melt directly into pores, tightening diameter overnight.',
    iconName: 'Droplets',
    recommendedProductId: 4,
    targetActives: ['Oligo-Hyaluronic Acid', 'Low-Molecular Collagen 50,000ppm', 'Galactomyces'],
    clinicalResult: '-38% Pore Area & +208% Hydration Barrier'
  }
];

export const ROUTINE_STEPS: RoutineStep[] = [
  {
    step: 1,
    title: 'Double Cleanse & Exfoliate',
    koreanName: '이중 세안 · 모공 정돈',
    description: 'Melt away daily sebum, sunscreen, and pollution while clearing pore lining without stripping essential lipids.',
    tip: 'Massage in small outward circles for at least 60 seconds.',
    recommendedProductIds: []
  },
  {
    step: 2,
    title: 'Balance & Tone Prep',
    koreanName: '토너 패드 (Skin Prep)',
    description: 'Rebalance skin pH to 5.5 and sweep away loosened dead keratinocytes to prime for deep treatment absorption.',
    tip: 'Swipe gently with the textured side, then press with the soft embossed side.',
    recommendedProductIds: []
  },
  {
    step: 3,
    title: 'Targeted Ampoule / Serum',
    koreanName: '고농축 세럼 (Active Delivery)',
    description: 'Deliver concentrated active peptides, salmon DNA, and antioxidants deep into dermal layers for specific skin goals.',
    tip: 'Press with warm palms rather than rubbing to encourage micro-absorption.',
    recommendedProductIds: []
  },
  {
    step: 4,
    title: 'Moisturize & Seal Barrier',
    koreanName: '수분 크림 (Lipid Lock)',
    description: 'Apply a 5-ceramide emulsion to form a breathable lipid shield that locks in all active serum hydration.',
    tip: 'Warm a dime-sized amount between fingertips before sweeping across face and neck.',
    recommendedProductIds: []
  },
  {
    step: 5,
    title: 'Overnight Recovery or UV Shield',
    koreanName: '수면 팩 / 자외선 차단',
    description: 'Seal your ritual with an overnight bio-collagen hydrogel mask or daytime broad-spectrum SPF 50+ PA++++ shield.',
    tip: 'Reapply every 2–3 hours if outdoors under direct sunlight.',
    recommendedProductIds: []
  }
];

export const STORE_REVIEWS: Review[] = [
  {
    id: 1,
    productId: 1,
    productName: 'Rose PDRN Glass Glow Ampoule',
    author: 'Evelyn C.',
    email: 'evelyn.c@example.com',
    location: 'Los Angeles, CA',
    rating: 5,
    date: '2 days ago',
    title: 'The genuine Korean glass skin glow is REAL',
    comment: 'I was skeptical about PDRN salmon DNA, but within five days my skin felt completely transformed. My cheeks have this lit-from-within bouncing radiance that makeup used to fake. Fast shipping direct from Seoul!',
    verified: true,
    skinConcern: 'Dullness & Loss of Elasticity',
    skinType: 'Combination / Sensitive'
  },
  {
    id: 2,
    productId: 2,
    productName: 'EGF NAD+ Longevity Serum',
    author: 'Clara M.',
    email: 'clara.m@example.com',
    location: 'New York, NY',
    rating: 5,
    date: '1 week ago',
    title: 'Noticeable firming around mouth and smile lines',
    comment: 'The NAD+ and EGF combo is top-tier science. The texture is rich like liquid ruby velvet. My smile lines and forehead look smoothed out. Worth every penny, 100% authentic packaging with tamper seal.',
    verified: true,
    skinConcern: 'Fine lines & Firmness',
    skinType: 'Dry / Mature'
  },
  {
    id: 3,
    productId: 3,
    productName: 'Kojic Acid Turmeric Glow Serum',
    author: 'Sarah K.',
    email: 'sarah.k@example.com',
    location: 'Toronto, Canada',
    rating: 5,
    date: '2 weeks ago',
    title: 'Faded stubborn summer pigmentation',
    comment: 'Nothing worked on my sun spots until I used this Kojic acid and turmeric formula. It doesn’t sting or dry out my skin like harsh Western acids. Will definitely reorder the 2-pack bundle.',
    verified: true,
    skinConcern: 'Hyperpigmentation & Sun spots',
    skinType: 'Oily / Blemish-prone'
  },
  {
    id: 4,
    productId: 4,
    productName: 'Bio-Collagen Deep Mask',
    author: 'Hanna L.',
    email: 'hanna.l@example.com',
    location: 'London, UK',
    rating: 5,
    date: '3 weeks ago',
    title: 'Pores looked literally invisible the next morning',
    comment: 'I woke up and touched my face in disbelief. Zero pore visibility around my nose and forehead. It leaves this ultra-hydrated dewy bounce that lasted all day.',
    verified: true,
    skinConcern: 'Large Pores & Dehydration',
    skinType: 'All Skin Types'
  },
  {
    id: 5,
    productId: 8,
    productName: 'Li Fei Rose Quartz Contour Roller',
    author: 'Min-Ji K.',
    email: 'minji.k@example.com',
    location: 'Seoul / Seattle',
    rating: 5,
    date: '4 days ago',
    title: 'Morning puffiness vanished in literally 10 minutes',
    comment: 'I keep the roller in my mini cosmetic fridge. Rolling upward along the jawbone drains fluid immediately. The stone stays icy cold throughout the routine.',
    verified: true,
    skinConcern: 'Rolling Facial Lift & Depuff',
    skinType: 'Combination',
    beforeAfterTimeframe: '10-Min Morning Result',
    measuredMetric: '-42% Morning Puffiness',
    beforeImg: '/rolling/before.jpg',
    afterImg: '/rolling/after.jpg',
    routineUsed: 'Chilled Roller + PDRN Peptide Ampoule',
    likes: 47
  },
  {
    id: 6,
    productId: 8,
    productName: 'Li Fei Rose Quartz Contour Roller',
    author: 'Elena R.',
    email: 'elena.r@example.com',
    location: 'Miami, FL',
    rating: 5,
    date: '1 week ago',
    title: 'My jawline contour looks lifted like I had high-frequency ultrasound',
    comment: 'Consistent lymphatic rolling every night along cervical lymph nodes carved out cheekbones I had not seen in years. My aesthetician asked what procedure I had done!',
    verified: true,
    skinConcern: 'Rolling Facial Lift & Depuff',
    skinType: 'Normal / Sensitive',
    beforeAfterTimeframe: '14-Day Protocol',
    measuredMetric: '+28% Jawline Definition',
    beforeImg: '/rolling/before.jpg',
    afterImg: '/rolling/after.jpg',
    routineUsed: 'EGF NAD+ Serum + Cryo Rolling',
    likes: 38
  },
  {
    id: 7,
    productId: 8,
    productName: 'Li Fei Rose Quartz Contour Roller',
    author: 'Camille D.',
    email: 'camille.d@example.com',
    location: 'Paris, France',
    rating: 5,
    date: '2 weeks ago',
    title: 'Serums absorb twice as deep with the rolling technique',
    comment: 'Usually serums take a while to sink in. Rolling immediately forces the active peptides deep into the skin without tacky residue. My skin bounce and morning glow are unbelievable.',
    verified: true,
    skinConcern: 'Rolling Facial Lift & Depuff',
    skinType: 'Dull / Dehydrated',
    beforeAfterTimeframe: '3 Weeks Protocol',
    measuredMetric: '+92% Serum Bio-Absorption',
    beforeImg: '/rolling/before.jpg',
    afterImg: '/rolling/after.jpg',
    routineUsed: 'Kojic Acid Turmeric + Cryo Facial Roller',
    likes: 52
  }
];

export const ROLLING_FACIAL_REVIEWS: Review[] = [
  STORE_REVIEWS[4],
  STORE_REVIEWS[5],
  STORE_REVIEWS[6]
];

export const FAQS: FAQItem[] = [
  {
    category: 'Authenticity & Sourcing',
    q: 'How does Li Fei Beauty guarantee 100% authenticity?',
    a: 'We source all formulas directly from certified brand laboratories and authorized corporate headquarters in Seoul, South Korea. Every product features official manufacturer batch codes, security holographic seals, and climate-controlled temperature logistics to ensure active ingredients never degrade.'
  },
  {
    category: 'Shipping & Delivery',
    q: 'How fast is shipping and do you ship internationally?',
    a: 'We offer free express delivery on all orders over $50. US and Canadian orders arrive within 2–4 business days via DHL/FedEx Express with end-to-end tracking. Worldwide orders ship with tracked courier within 3–6 business days.'
  },
  {
    category: 'Formulas & Safety',
    q: 'Are these formulas suitable for sensitive skin?',
    a: 'Yes. All featured formulations are dermatologically tested in South Korea, hypoallergenic, alcohol-free, paraben-free, and cruelty-free. Even potent actives like PDRN and Kojic Acid are buffered with calming Centella Asiatica and Damask Rose hydrosol.'
  },
  {
    category: 'Returns & Guarantee',
    q: 'What is your 30-day Glass Skin Guarantee?',
    a: 'If you do not experience visibly plumper, more radiant skin within 30 days of consistent use, return the product for a 100% refund—even if the bottle is empty. We stand completely behind our curated Seoul skincare.'
  }
];
