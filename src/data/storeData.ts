import { Product, Review, SkinConcern, RoutineStep } from '../types';

export const STORE_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'MEDICUBE PDRN PINK',
    subtitle: 'Rose PDRN Peptide Serum',
    src: '/products/medicube-pink.jpg',
    bg: '#EFA6B7',
    panel: '#FDF0F3',
    themeColor: '#DF4D6E',
    darkTone: false,
    price: '$36.00',
    numericPrice: 36,
    originalPrice: '$45.00',
    volume: '30 ml / 1.01 fl. oz.',
    category: 'Serums',
    rating: 4.9,
    reviewsCount: 384,
    badge: 'Bestseller',
    clinicalClaim: '+192% Collagen Synthesis & Instant Plump',
    benefits: [
      'Visibly tightens loosened dermal matrix and sagging pores',
      'Infuses bio-compatible Salmon DNA (Sodium DNA) for cellular repair',
      'Provides a glassy, luminous Korean dewy finish without greasiness',
      'Soothes micro-redness with fresh Damask Rose Hydrosol'
    ],
    keyIngredients: ['Rose PDRN (Sodium DNA)', '5 Types Peptide Complex', 'Damask Rose Water', 'Niacinamide 2%'],
    allIngredients: 'Water, Rosa Damascena Flower Water, Butylene Glycol, Dipropylene Glycol, Glycerin, Sodium DNA (PDRN), Niacinamide, 1,2-Hexanediol, Oligopeptide-1, Palmitoyl Pentapeptide-4, Copper Tripeptide-1, Centella Asiatica Extract, Adenosine, Ethylhexylglycerin.',
    howToUse: [
      'After cleansing and toning, dispense 2–3 drops onto fingertips.',
      'Gently pat across face and neck along skin texture until fully absorbed.',
      'Follow with your favorite barrier moisturizer for locked-in glow.'
    ],
    ritualStep: 'Step 03 · Targeted Ampoule & Firming Treatment',
    skinType: 'All Skin Types, Dull, Loss of Firmness',
    fullDescription: 'Biomimetic salmon DNA peptide ampoule suspended in fresh Damask rose dewdrops. Restores depleted skin matrix, shrinks pore perimeter, and bestows an ethereal Korean glass glow.',
    stockStatus: 'In Stock',
    beforeAfterSummary: '98% noted noticeable cheek plumpness within 7 days; 94% reported refined pore texture.',
    faqs: [
      { q: 'Is this suitable for sensitive or acne-prone skin?', a: 'Yes. PDRN is an anti-inflammatory regenerative active thoroughly dermatologically tested for zero pore-clogging.' },
      { q: 'Can I use this daily?', a: 'Yes, both morning and night. For daytime use, follow with SPF 50+.' }
    ]
  },
  {
    id: 2,
    name: 'MEDICUBE EGF NAD',
    subtitle: 'Firming & Deep Collagen Serum',
    src: '/products/medicube-firming.jpg',
    bg: '#5E101D',
    panel: '#3F0811',
    themeColor: '#E11D48',
    darkTone: true,
    price: '$42.00',
    numericPrice: 42,
    originalPrice: '$52.00',
    volume: '30 ml / 1.01 fl. oz.',
    category: 'Serums',
    rating: 4.95,
    reviewsCount: 512,
    badge: 'Award Winner',
    clinicalClaim: '-34% Wrinkle Depth & +140% Dermal Density',
    benefits: [
      'Epidermal Growth Factor (EGF) activates cellular skin regeneration',
      'Pure NAD+ restores mitochondrial cellular vitality and elasticity',
      'Packed with antioxidant-rich ruby pomegranate and wild strawberries',
      'Rich, velvety micro-cushion texture with zero sticky residue'
    ],
    keyIngredients: ['EGF | NAD Cell Complex', 'Collagen Extract 10,000ppm', 'Ruby Pomegranate', 'Alpine Strawberry'],
    allIngredients: 'Collagen Extract, Punica Granatum (Pomegranate) Fruit Extract, Fragaria Chiloensis (Strawberry) Fruit Extract, Nicotinamide Adenine Dinucleotide (NAD), sh-Oligopeptide-1 (EGF), Hydrolyzed Elastin, Squalane, Ceramide NP, Beta-Glucan.',
    howToUse: [
      'Press dropper to dispense 3–4 drops directly to cleansed cheeks and forehead.',
      'Smooth in an upward lifting motion toward the temples.',
      'Use morning and evening for maximum collagen synthesis.'
    ],
    ritualStep: 'Step 03 · Cellular Longevity & Deep Dermal Rebound',
    skinType: 'Mature, Dry, Loss of Elasticity',
    fullDescription: 'High-potency cellular regeneration concentrate utilizing Epidermal Growth Factor and pure NAD to reactivate dormant fibroblasts while infusing ruby pomegranate antioxidants.',
    stockStatus: 'In Stock',
    beforeAfterSummary: '-34% clinical wrinkle reduction measured at crow\'s feet after 14 days of twice-daily use.',
    faqs: [
      { q: 'What makes NAD+ special in Korean skincare?', a: 'NAD+ is the master longevity coenzyme that powers cellular ATP, allowing aging skin to rebuild collagen like young skin.' }
    ]
  },
  {
    id: 3,
    name: 'MEDICUBE KOJIC ACID',
    subtitle: 'Turmeric Niacinamide Serum',
    src: '/products/medicube-turmeric.jpg',
    bg: '#E4980E',
    panel: '#FCF2DC',
    themeColor: '#D97706',
    darkTone: false,
    price: '$34.00',
    numericPrice: 34,
    originalPrice: '$42.00',
    volume: '30 ml / 1.01 fl. oz.',
    category: 'Serums',
    rating: 4.88,
    reviewsCount: 420,
    badge: 'Trending',
    clinicalClaim: '97% Dark Spot Dispersion & Tone Uniformity',
    benefits: [
      'Fades stubborn sun damage, post-blemish marks, and melasma',
      'Synergistic 1% Kojic Acid + 5% Niacinamide halts melanin transfer',
      'Golden Turmeric Rhizome provides potent calming anti-inflammatory relief',
      'Delivers an immediate dewy, golden hour lit-from-within sheen'
    ],
    keyIngredients: ['Kojic Acid 1%', 'Turmeric Rhizome Extract', 'Niacinamide 5%', 'Centella Asiatica'],
    allIngredients: 'Curcuma Longa (Turmeric) Root Extract, Niacinamide, Butylene Glycol, Kojic Acid, Glycerin, Centella Asiatica Extract, Glycyrrhiza Glabra (Licorice) Root Extract, Arbutin, Sodium Hyaluronate, Tocopherol, Allantoin.',
    howToUse: [
      'Apply 2–3 drops to clean, slightly damp skin after cleansing.',
      'Focus gently on areas with dark spots, uneven pigmentation, or discoloration.',
      'Always follow with daily broad-spectrum SPF 50 during morning rituals.'
    ],
    ritualStep: 'Step 03 · Tone Perfection & Hyperpigmentation Eraser',
    skinType: 'Uneven Tone, Hyperpigmentation, Post-Blemish',
    fullDescription: 'Liposomal turmeric and kojic acid bio-synergy that dissolves stubborn post-acne blemishes and sun damage while preserving moisture barrier integrity.',
    stockStatus: 'In Stock',
    beforeAfterSummary: '97% reported noticeable lightening of dark spots after 21 days; 91% noted a brighter overall tone.'
  },
  {
    id: 4,
    name: 'BIODANCE BIO-COLLAGEN',
    subtitle: 'Real Deep Hydration Mask Ampoule',
    src: '/products/biodance.png',
    bg: '#E8EAF5',
    panel: '#F2F3FA',
    themeColor: '#6366F1',
    darkTone: false,
    price: '$28.00',
    numericPrice: 28,
    originalPrice: '$35.00',
    volume: '50 ml / 1.69 fl. oz.',
    category: 'Masks',
    rating: 4.96,
    reviewsCount: 680,
    badge: 'Viral Sensation',
    clinicalClaim: 'Overnight Pore Shrinking & 100-Hour Moisture Seal',
    benefits: [
      'Ultra-low molecular weight bio-collagen (243Da) penetrates deeper than standard collagen',
      'Galactomyces ferment filtrate refines skin grain and purifies congestion',
      'Creates a breathable hydro-shield that locks moisture for 100 continuous hours',
      'Hypoallergenic and EWG green-grade certified for zero irritation'
    ],
    keyIngredients: ['Oligo-Hyaluronic Acid', 'Bio-Collagen 5000ppm', 'Galactomyces Ferment', 'Ceramide NP'],
    allIngredients: 'Collagen Extract, Galactomyces Ferment Filtrate, Glycereth-26, Niacinamide, Chondrus Crispus Extract, Ceramide NP, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Betaine, Allantoin, Panthenol.',
    howToUse: [
      'Apply generously across face before sleeping or as a deep surge treatment.',
      'Pat lightly until the essence transforms into a protective luminous glaze.',
      'Wake up to pore-less, radiant, bouncing glass skin.'
    ],
    ritualStep: 'Step 04 · Deep Hydro-Penetration & Night Seal',
    skinType: 'Dehydrated, Enlarged Pores, Flaky Skin',
    fullDescription: 'Clinical-grade hydro-barrier ampoule utilizing micro-molecular bio-collagen to lock in moisture for continuous dewy firmness and pore refinement.',
    stockStatus: 'In Stock',
    beforeAfterSummary: 'Noticeable pore reduction of 38% after a single overnight application.'
  },
  {
    id: 5,
    name: 'MEDICUBE ZERO PORE PAD 2.0',
    subtitle: 'Dual-Textured Exfoliating Toner Pads',
    src: '/products/medicube.png',
    bg: '#EBF4F6',
    panel: '#F0F8FA',
    themeColor: '#0EA5E9',
    darkTone: false,
    price: '$32.00',
    numericPrice: 32,
    originalPrice: '$38.00',
    volume: '70 pads / 155 g',
    category: 'Cleansers',
    rating: 4.87,
    reviewsCount: 840,
    badge: 'Cult Classic',
    clinicalClaim: 'Clinically Proven 1-Step Pore Tightening',
    benefits: [
      'Patented Anti-Sebum P complex controls excess oil and shrinks sebum glands',
      'Dual embossed texture lifts dead dead skin cells and sweeps trapped impurities',
      'AHA + BHA blend dissolves blackheads without stripping natural moisture',
      'Preps skin perfectly for optimal serum and ampoule absorption'
    ],
    keyIngredients: ['AHA (Fruit Complex)', 'BHA (Salicylic Acid)', 'Anti-Sebum P', 'Tea Tree Leaf Extract'],
    allIngredients: 'Water, Methylpropanediol, Tromethamine, Lactic Acid, Alcohol Denat., 1,2-Hexanediol, Panthenol, Salicylic Acid, Melaleuca Alternifolia (Tea Tree) Leaf Extract, Oenothera Biennis (Evening Primrose) Flower Extract.',
    howToUse: [
      'After cleansing, wipe gently with the embossed side across face, avoiding eyes.',
      'Turn the pad over and use the silky smooth side to soothe and tone.',
      'Lightly pat remaining essence into skin. Do not rinse off.'
    ],
    ritualStep: 'Step 02 · Tone, Pore Purify & Chemical Exfoliation',
    skinType: 'Oily, Combination, Textured, Congested',
    fullDescription: 'Award-winning Korean toner pads soaked in pore-refining fruit acids and soothing botanical tea tree essence to minimize visible pores.',
    stockStatus: 'In Stock'
  },
  {
    id: 6,
    name: 'SKINCARE ESSENTIALS HYDRA-INFUSION',
    subtitle: 'Micro-Essence Skin Booster',
    src: '/products/skincare-3.png',
    bg: '#F5ECE3',
    panel: '#FAF2EB',
    themeColor: '#CA8A04',
    darkTone: false,
    price: '$30.00',
    numericPrice: 30,
    originalPrice: '$38.00',
    volume: '150 ml / 5.07 fl. oz.',
    category: 'Moisturizers',
    rating: 4.85,
    reviewsCount: 290,
    badge: 'Hydration Essential',
    clinicalClaim: '300% Deeper Moisture Transport Into Epidermis',
    benefits: [
      'Fermented green tea water base neutralizes environmental free radicals',
      '7-weight molecular hyaluronic acid deeply floods all dermal layers',
      'Restores healthy pH 5.5 acidic mantle balance after washing',
      'Lightweight water-gel slip that leaves zero film or residue'
    ],
    keyIngredients: ['7-Molecular Hyaluronic Acid', 'Fermented Camellia Sinensis', 'Trehalose', 'Centella Asiatica'],
    allIngredients: 'Camellia Sinensis Leaf Water, Glycerin, Butylene Glycol, 1,2-Hexanediol, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Trehalose, Panthenol, Allantoin, Centella Asiatica Extract.',
    howToUse: [
      'Pour a generous coin-sized amount into clean palms.',
      'Press gently into face and neck for 30 seconds to lock in moisture.',
      'Layer 2–3 times using the Korean "7-skin method" for extreme glass glow.'
    ],
    ritualStep: 'Step 02 · Deep Moisture Prime & Balance',
    skinType: 'Dehydrated, Sensitive, All Types',
    fullDescription: 'Essential Korean hydrating essence that re-awakens dehydrated skin cells and creates a plump, fertile canvas for active serums.',
    stockStatus: 'In Stock'
  },
  {
    id: 7,
    name: 'GLOW COLLECTION BARRIER REPAIR',
    subtitle: 'Ceramide Peptide Cushion Cream',
    src: '/products/skincare-4.png',
    bg: '#E3EDF0',
    panel: '#EDF5F7',
    themeColor: '#0284C7',
    darkTone: false,
    price: '$38.00',
    numericPrice: 38,
    originalPrice: '$48.00',
    volume: '60 ml / 2.02 fl. oz.',
    category: 'Moisturizers',
    rating: 4.92,
    reviewsCount: 340,
    badge: 'Seoul Editors Pick',
    clinicalClaim: 'Strengthens Damaged Moisture Barrier in 72 Hours',
    benefits: [
      'Bio-identical 5-Ceramide complex (EOP, NS, NP, AS, AP) repairs cracked barrier',
      'Deep olive squalane mimics natural sebum to prevent transepidermal water loss',
      'Silky whipped cushion texture that melts upon skin contact',
      'Creates a luminous protective shield against dry indoor air and pollution'
    ],
    keyIngredients: ['5-Ceramide Complex', 'Olive Squalane 3%', 'Phytosphingosine', 'Oat Beta-Glucan'],
    allIngredients: 'Water, Squalane, Butylene Glycol, Caprylic/Capric Triglyceride, Glycerin, Ceramide NP, Ceramide NS, Ceramide AS, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Beta-Glucan, Hydrogenated Lecithin.',
    howToUse: [
      'Warm a pea-sized amount between clean fingertips.',
      'Smooth upward across face as the final moisturizing step in your ritual.',
      'Use night and day for continuous barrier defense.'
    ],
    ritualStep: 'Step 04 · Moisture Lock & Barrier Seal',
    skinType: 'Dry, Sensitive, Compromised Barrier, Winter Skin',
    fullDescription: 'Luxurious lipid-restoring cushion cream engineered to heal compromised skin barriers and preserve the glassy radiance of your serums.',
    stockStatus: 'In Stock'
  },
  {
    id: 8,
    name: 'LI FEI ROSE QUARTZ CONTOUR ROLLER',
    subtitle: 'Dual-Node Cryo Sculpting Facial Tool',
    src: '/products/facial-roller.jpg',
    bg: '#FADEE5',
    panel: '#FDF0F3',
    themeColor: '#EC3460',
    darkTone: false,
    price: '$32.00',
    numericPrice: 32,
    originalPrice: '$42.00',
    volume: 'Grade-A Natural Rose Quartz Crystal',
    category: 'Tools & Rollers',
    rating: 4.97,
    reviewsCount: 468,
    badge: 'Clinical Tool',
    clinicalClaim: '-38% Instant Facial Puffiness & +94% Serum Bio-Absorption',
    benefits: [
      'Sculpts jawline, drains lymph fluid, and lifts sagging facial contour',
      'Naturally cold crystal calms redness, soothes inflammation, and shrinks pore perimeter',
      'Dual-node engineering: Large stone for cheeks & neck, precision node for under-eyes & brow bone',
      'Drives active PDRN and EGF serum molecules 94% deeper into the dermal matrix'
    ],
    keyIngredients: ['100% Brazilian Rose Quartz', 'Rose Gold Ergonomic Frame', 'Silent Silicone Cushioning'],
    allIngredients: 'Authentic high-density Brazilian Rose Quartz crystal with custom medical-grade zinc alloy mounting and noise-free glide bearings.',
    howToUse: [
      'Apply 3–4 drops of Medicube PDRN Pink or EGF NAD serum to provide slip.',
      'Roll from collarbone upward along the neck to open lymphatic drainage channels.',
      'Sweep from chin along the jawline toward earlobes with gentle medium pressure (repeat 5x).',
      'Use the smaller node under the eyes from inner corner outward toward temples.'
    ],
    ritualStep: 'Step 03.5 · Lymphatic Drainage & Cryo Contour Sculpting',
    skinType: 'All Skin Types · Morning Puffiness, Laxity & Contouring',
    fullDescription: 'Custom-crafted from certified Grade-A Brazilian Rose Quartz crystal, this cooling contour roller stimulates lymphatic drainage, drains stagnant morning fluid, and sculpts cheekbones while boosting serum absorption.',
    stockStatus: 'In Stock',
    beforeAfterSummary: '-38% measured cheek puffiness in 10 minutes; 96% reported immediate jawline lift and dewy clarity.',
    faqs: [
      { q: 'Should I keep the roller in the refrigerator?', a: 'Yes! Storing it in the fridge provides intense cryo-depuffing that constricts capillaries and reduces morning puffiness in minutes.' },
      { q: 'Can I use this over active serums?', a: 'Yes, rolling directly over your serums or sheet masks increases topical penetration by up to 94%.' }
    ]
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Products', count: 8, desc: 'The complete Seoul curation' },
  { id: 'serums', name: 'Serums & Ampoules', count: 3, desc: 'Targeted high-potency treatments' },
  { id: 'cleansers', name: 'Cleansers & Toners', count: 2, desc: 'Gentle, pH-balanced prep' },
  { id: 'moisturizers', name: 'Moisturizers & Creams', count: 2, desc: 'Barrier lipid restoration' },
  { id: 'masks', name: 'Collagen & Sheet Masks', count: 1, desc: 'Overnight regenerative hydro-plump' },
  { id: 'rollers', name: 'Facial Rollers & Tools', count: 1, desc: 'Lymphatic drainage & contour sculpt' },
  { id: 'sets', name: 'Sets & Bundles', count: 2, desc: 'Curated complete K-beauty rituals' },
];

export const SKIN_CONCERNS: SkinConcern[] = [
  {
    id: 'dullness',
    title: 'Dullness & Dark Spots',
    subtitle: 'Post-Blemish Marks & Uneven Melanin',
    description: 'Target stubborn hyperpigmentation, sun damage, and sluggish cellular turnover with clinical liposomal kojic acid and brightening turmeric.',
    iconName: 'Sun',
    recommendedProductId: 3, // Medicube Kojic Acid
    targetActives: ['Kojic Acid 1%', 'Turmeric Rhizome', 'Niacinamide 5%'],
    clinicalResult: '97% Dark Spot Dispersion in 3 Weeks'
  },
  {
    id: 'aging',
    title: 'Loss of Firmness & Wrinkles',
    subtitle: 'Fine Lines, Sagging & Volume Loss',
    description: 'Restore cellular energy with Epidermal Growth Factor and pure NAD+ longevity coenzymes that stimulate dormant fibroblasts to produce fresh collagen.',
    iconName: 'Shield',
    recommendedProductId: 2, // Medicube EGF NAD
    targetActives: ['EGF | NAD Coenzyme', 'Collagen Extract', 'Ruby Pomegranate'],
    clinicalResult: '-34% Wrinkle Depth in 14 Days'
  },
  {
    id: 'barrier',
    title: 'Compromised Barrier & Redness',
    subtitle: 'Dehydration, Irritation & Texture',
    description: 'Rebuild structural integrity with biomimetic salmon PDRN and five essential ceramide lipids that lock moisture and eliminate redness.',
    iconName: 'Sparkles',
    recommendedProductId: 1, // Medicube PDRN Pink
    targetActives: ['Rose PDRN (Sodium DNA)', '5 Peptide Complex', 'Centella'],
    clinicalResult: '+192% Collagen & Rapid Soothing'
  },
  {
    id: 'pores',
    title: 'Enlarged Pores & Rough Grain',
    subtitle: 'Excess Sebum, Blackheads & Texture',
    description: 'Dissolve trapped sebum and tighten loosened pore perimeters using ultra-low molecular bio-collagen and AHA/BHA botanical exfoliants.',
    iconName: 'Droplets',
    recommendedProductId: 4, // Biodance Collagen
    targetActives: ['Micro Bio-Collagen', 'Galactomyces', 'Ceramide NP'],
    clinicalResult: 'Visible Pore Reduction After Overnight Use'
  }
];

export const ROUTINE_STEPS: RoutineStep[] = [
  {
    step: 1,
    title: 'Cleanse & Purify',
    koreanName: '클렌징 (Double Cleanse)',
    description: 'Melt away sunscreen, makeup, and airborne micro-dust with gentle oil followed by a low-pH water cleanser that protects your acid mantle.',
    tip: 'Never squeak-clean your face; stripping lipids causes rebound oiliness.',
    recommendedProductIds: [5]
  },
  {
    step: 2,
    title: 'Tone & Prep Pore Canvas',
    koreanName: '토너 & 각질 관리 (Exfoliate & Balance)',
    description: 'Saturate freshly cleansed skin with balancing fruit acids and multi-weight hydration to restore optimal skin pH and prep receptor channels.',
    tip: 'Pat on damp skin within 60 seconds of washing to trap water.',
    recommendedProductIds: [5, 6]
  },
  {
    step: 3,
    title: 'Targeted Treatment & Ampoule',
    koreanName: '앰플 & 세럼 (Target Actives)',
    description: 'This is the engine of Korean skincare. Concentrated serums (PDRN, EGF NAD, or Kojic Acid) penetrate deep to solve specific skin goals.',
    tip: 'Press with warm palms rather than rubbing to encourage micro-absorption.',
    recommendedProductIds: [1, 2, 3]
  },
  {
    step: 4,
    title: 'Moisturize & Seal Barrier',
    koreanName: '수분 크림 (Lipid Lock)',
    description: 'Encase your active nutrients under a bio-identical ceramide cushion cream to stop evaporation and lock moisture for 72+ hours.',
    tip: 'Warm a pea-sized amount between fingers before smoothing upward.',
    recommendedProductIds: [4, 7]
  },
  {
    step: 5,
    title: 'Protect & Shield (AM Ritual)',
    koreanName: '자외선 차단 (UV Glass Shield)',
    description: 'Finish every daytime routine with broad-spectrum SPF 50+ to protect your newfound glow from premature photo-aging and UV pigmentation.',
    tip: 'Reapply every 2–3 hours if outdoors under direct sunlight.',
    recommendedProductIds: [1]
  }
];

export const STORE_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 1,
    productName: 'MEDICUBE PDRN PINK',
    author: 'Evelyn C.',
    email: 'evelyn@example.com',
    rating: 5,
    date: '2026-10-05',
    title: 'The genuine Korean glass skin glow is REAL',
    comment: 'I was skeptical about PDRN salmon DNA, but within five days my skin felt completely transformed. My cheeks have this lit-from-within bouncing radiance that makeup used to fake. Fast shipping direct from Seoul!',
    verified: true,
    helpfulCount: 24,
    skinConcern: 'Dullness & Loss of Elasticity',
    skinType: 'Combination / Sensitive'
  },
  {
    id: 'rev-2',
    productId: 1,
    productName: 'MEDICUBE PDRN PINK',
    author: 'Jin-Hee L.',
    email: 'jinhee@example.com',
    rating: 4,
    date: '2026-10-02',
    title: 'Love the glow, but slightly sticky',
    comment: 'The glow is undeniable. My skin looks so healthy. It is a bit sticky for the first 10 minutes so I recommend waiting before applying makeup. Otherwise, perfect!',
    verified: true,
    helpfulCount: 8,
    skinConcern: 'Dehydration',
    skinType: 'Oily'
  },
  {
    id: 'rev-3',
    productId: 2,
    productName: 'MEDICUBE EGF NAD',
    author: 'Clara M.',
    email: 'clara@example.com',
    rating: 5,
    date: '2026-10-01',
    title: 'Noticeable firming around mouth and smile lines',
    comment: 'The NAD+ and EGF combo is top-tier science. The texture is rich like liquid ruby velvet. My smile lines and forehead look smoothed out. Worth every penny, 100% authentic packaging with tamper seal.',
    verified: true,
    helpfulCount: 42,
    skinConcern: 'Fine lines & Firmness',
    skinType: 'Dry / Mature'
  },
  {
    id: 'rev-4',
    productId: 8,
    productName: 'LI FEI ROSE QUARTZ CONTOUR ROLLER',
    author: 'Min-Ji K.',
    email: 'minji@example.com',
    rating: 5,
    date: '2026-10-06',
    title: 'Jawline contour visible within 10 minutes',
    comment: 'I keep the rose quartz roller in my skincare fridge and pair it with Medicube PDRN Pink serum every morning. The before and after in the mirror is wild — morning puffiness along my jaw and under eyes drains right down to the neck.',
    verified: true,
    helpfulCount: 156,
    media: [
      { type: 'image', url: '/rolling/after.jpg', thumbnailUrl: '/rolling/after.jpg' }
    ],
    skinConcern: 'Rolling Facial Lift & Depuff',
    skinType: 'Sensitive / Sluggish Lymphatic'
  }
];

export const ROLLING_FACIAL_REVIEWS: Review[] = [
  STORE_REVIEWS[3], // rev-4 which is the roller review
];

export const FAQS = [
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
    category: 'Skincare Advice',
    q: 'Can I combine PDRN Pink, EGF NAD, and Kojic Acid serums?',
    a: 'Yes! Korean multi-serum layering is designed for complementary synergy. In the morning, use the Kojic Acid Turmeric serum for antioxidant protection, followed by PDRN Pink for daily elasticity. In the evening, apply the EGF NAD Firming serum for cellular overnight repair.'
  },
  {
    category: 'Skin Safety',
    q: 'Are your products safe for sensitive, reactive, or acne-prone skin?',
    a: 'Every product in our collection is non-comedogenic, hypoallergenic, dermatologically tested, and free from artificial parabens, sulfates, and harsh artificial colorants.'
  },
  {
    category: 'Returns & Guarantee',
    q: 'What is your 30-Day Radiant Skin Guarantee?',
    a: 'We want you to love your Korean skincare ritual. If a product does not suit your skin, simply reach out to our team within 30 days of receiving your order for an easy refund or complimentary expert skincare consultation.'
  }
];
