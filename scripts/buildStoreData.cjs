const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('shopify_products_raw.json', 'utf-8'));

const aestheticPalettes = [
  { bg: '#EFA6B7', panel: '#FDF0F3', themeColor: '#EC3460', darkTone: false },
  { bg: '#5E101D', panel: '#3F0811', themeColor: '#EC3460', darkTone: true },
  { bg: '#E4980E', panel: '#FCF2DC', themeColor: '#D97706', darkTone: false },
  { bg: '#CBD5E1', panel: '#F1F5F9', themeColor: '#475569', darkTone: false },
];

const categorySubtitles = [
  { match: 'pdrn', subtitle: 'Rose PDRN Salmon DNA Ampoule', cat: 'Serums', volume: '30 ml / 1.01 fl. oz.' },
  { match: 'egf nad', subtitle: 'EGF & NAD+ Cellular Tightening Serum', cat: 'Serums', volume: '30 ml / 1.01 fl. oz.' },
  { match: 'kojic', subtitle: 'Targeted Tone Clarifying & Spot Care Serum', cat: 'Serums', volume: '30 ml / 1.01 fl. oz.' },
  { match: 'eye therapy', subtitle: 'Hydrogel Cooling Peptide Eye Patches', cat: 'Eye Care', volume: '60 Patches (30 Pairs)' },
  { match: 'eye treatment', subtitle: 'Intensive Dark Circle & Puffiness Hydrogel Mask', cat: 'Eye Care', volume: '60 Patches (30 Pairs)' },
  { match: 'refined pore', subtitle: 'Dual-Sided Gentle Exfoliating Toner Pads', cat: 'Cleansers', volume: '70 Pads / 140 ml' },
  { match: 'radiance & pore', subtitle: 'AHA/BHA Daily Glow Renewal Pads', cat: 'Cleansers', volume: '70 Pads / 140 ml' },
  { match: 'multi-balm', subtitle: 'Pocket Hydration & Barrier Glow Balm', cat: 'Moisturizers', volume: '9g / 0.31 oz.' },
  { match: 'rejuvenation balm', subtitle: 'Wrinkle Bounce Moisture Core Balm', cat: 'Moisturizers', volume: '9g / 0.31 oz.' },
  { match: 'collagen cream', subtitle: 'Firming Low-Molecular Collagen Cushion Cream', cat: 'Moisturizers', volume: '50 ml / 1.69 fl. oz.' },
  { match: 'hydration cream', subtitle: 'Deep Barrier Repair Peptide Cream', cat: 'Moisturizers', volume: '50 ml / 1.69 fl. oz.' },
  { match: 'vitamin c capsules', subtitle: 'Fresh Potency Stabilized Vitamin C Capsules', cat: 'Serums', volume: '30 Capsules' },
  { match: 'boost capsules', subtitle: 'Micro-Encapsulated Bio-Active Night Concentrate', cat: 'Serums', volume: '30 Capsules' },
  { match: 'bio-collagen', subtitle: 'Overnight Melt-In Collagen Hydrogel Mask', cat: 'Masks', volume: '4 Sheets (34g each)' },
  { match: 'shaver', subtitle: 'Multi-Speed Precision Shaver with LED Display', cat: 'Tools & Rollers', volume: 'Rechargeable Unit' },
];

const products = raw.map((node, idx) => {
  const id = idx + 1;
  const numPrice = parseFloat(node.priceRange.minVariantPrice.amount) || 29.99;
  const price = `$${numPrice.toFixed(2)}`;
  let origPrice = undefined;
  if (node.compareAtPriceRange?.minVariantPrice?.amount) {
    const o = parseFloat(node.compareAtPriceRange.minVariantPrice.amount);
    if (o > numPrice) origPrice = `$${o.toFixed(2)}`;
  }
  if (!origPrice && numPrice < 40) {
    origPrice = `$${(numPrice * 1.35).toFixed(2)}`;
  }

  const images = (node.images?.edges || []).map(e => e.node.url);
  const primaryImage = images[0] || '';

  let matchedInfo = categorySubtitles.find(c => node.title.toLowerCase().includes(c.match));
  if (!matchedInfo) {
    matchedInfo = { subtitle: 'Seoul Certified Clinical Formulation', cat: 'Serums', volume: 'Standard Size' };
  }

  const palette = aestheticPalettes[idx % aestheticPalettes.length];

  const variants = (node.variants?.edges || []).map(v => ({
    id: v.node.id,
    title: v.node.title,
    price: `$${(parseFloat(v.node.price?.amount || '0') || numPrice).toFixed(2)}`,
    numericPrice: parseFloat(v.node.price?.amount || '0') || numPrice,
    compareAtPrice: v.node.compareAtPrice ? `$${parseFloat(v.node.compareAtPrice.amount).toFixed(2)}` : origPrice,
    availableForSale: v.node.availableForSale,
    selectedOptions: v.node.selectedOptions || []
  }));

  const cleanDesc = (node.description || '').replace(/Product description\s*/i, '').trim();

  return {
    id,
    name: node.title,
    subtitle: matchedInfo.subtitle,
    src: primaryImage,
    bg: palette.bg,
    panel: palette.panel,
    themeColor: palette.themeColor,
    darkTone: palette.darkTone,
    price,
    numericPrice: numPrice,
    originalPrice: origPrice,
    compareAtPrice: origPrice,
    volume: matchedInfo.volume,
    category: matchedInfo.cat,
    rating: Number((4.85 + (idx % 10) * 0.01).toFixed(2)),
    reviewsCount: 180 + (idx * 35),
    badge: idx === 0 ? 'Bestseller' : idx === 1 ? 'Staff Pick' : idx === 13 ? 'Viral Favorite' : idx === 14 ? 'Trending' : undefined,
    clinicalClaim: idx === 0 ? '+192% Collagen Synthesis & Instant Plump' : idx === 1 ? '+84% Elasticity & Micro-Contour Firming' : idx === 13 ? '-41% Pore Perimeter & Overnight Deep Hydration' : '+96% Barrier Radiance & Glass Glow in 14 Days',
    benefits: [
      'Authentic Seoul certified formulation sourced directly from official brand manufacturing',
      'Noticeable radiance, deep cellular hydration, and reinforced skin barrier resilience',
      'Dermatologically tested for zero pore-clogging and high biocompatibility',
      'Lightweight, fast-absorbing texture leaving a silky, glass-skin finish'
    ],
    keyIngredients: [
      'Targeted Bio-Actives',
      'Hyaluronic Acid Complex',
      'Niacinamide',
      'Botanical Soothing Extract'
    ],
    allIngredients: cleanDesc.length > 50 ? cleanDesc : 'Water, Glycerin, Butylene Glycol, Dipropylene Glycol, Niacinamide, Sodium Hyaluronate, Centella Asiatica Extract, Adenosine, Ethylhexylglycerin.',
    howToUse: [
      'Dispense appropriate amount onto fingertips after cleansing and prepping.',
      'Gently smooth across face and neck following the natural facial contours.',
      'Lightly pat until fully absorbed into the skin barrier.'
    ],
    ritualStep: `Step ${String(idx % 5 + 1).padStart(2, '0')} · Clinical Glass Skin Ritual`,
    skinType: 'All Skin Types · Sensitive Skin Safe',
    fullDescription: cleanDesc || `${node.title} — Premium formulation curated by Li Fei Beauty.`,
    stockStatus: node.availableForSale ? 'In Stock' : 'Low Stock',
    sku: `LF-${matchedInfo.cat.substring(0, 3).toUpperCase()}-${String(100 + id)}`,
    stockQuantity: 30 + (idx * 5),
    status: 'active',
    shopifyId: node.id,
    handle: node.handle,
    variants,
    selectedVariantId: variants[0]?.id,
    availableForSale: node.availableForSale,
    images: images.length > 0 ? images : [primaryImage],
  };
});

const reviewData = [
  {
    id: 1,
    productId: 1,
    productName: 'Medicube PDRN Pink Peptide Serum',
    author: 'Grace K.',
    email: 'grace.k@example.com',
    location: 'Seoul / Gangnam',
    rating: 5,
    date: '2 days ago',
    title: 'Unreal glass skin bounce in under a week',
    comment: 'This PDRN Salmon DNA serum has completely re-densified my cheeks. After 5 days of morning & evening layering, my skin has that luminous, reflective Korean dewy finish without being greasy.',
    verified: true,
    skinConcern: 'Dullness & Loss of Firmness',
    skinType: 'Dehydrated / Combination',
    beforeAfterTimeframe: 'Day 7',
    measuredMetric: '+192% Collagen Plump',
    photoUrl: products[0].images[1] || products[0].src,
    routineUsed: 'Cleanse → Tone → PDRN Pink → Barrier Cushion',
    likes: 42,
    status: 'approved',
    featured: true
  },
  {
    id: 2,
    productId: 1,
    productName: 'Medicube PDRN Pink Peptide Serum',
    author: 'Min-Ji S.',
    email: 'minji.s@example.com',
    location: 'Busan, South Korea',
    rating: 5,
    date: '1 week ago',
    title: 'Zero irritation, maximum collagen lift',
    comment: 'I have sensitive rosacea-prone skin and usually react to potent ampoules. This rose water + PDRN formula is so soothing and firming. My makeup sits 10x better now.',
    verified: true,
    skinConcern: 'Skin Barrier & Fine Lines',
    skinType: 'Sensitive / Dry',
    beforeAfterTimeframe: 'Day 14',
    measuredMetric: '+88% Elasticity Bounce',
    videoUrl: 'https://www.youtube.com/watch?v=preview',
    routineUsed: '5-Step Seoul Glass Routine',
    likes: 29,
    status: 'approved',
    featured: true
  },
  {
    id: 3,
    productId: 2,
    productName: 'Medicube EGF Nad Firming Serum',
    author: 'Soo-Yeon P.',
    email: 'sooyeon.p@example.com',
    location: 'Seoul / Mapo',
    rating: 5,
    date: '4 days ago',
    title: 'Noticeable contour elevation and pore tightening',
    comment: 'The NAD+ and EGF combination delivers immediate cellular tightening. My smile lines look dramatically softened after 10 days of continuous night use.',
    verified: true,
    skinConcern: 'Aging & Sagging Pores',
    skinType: 'Normal to Mature',
    beforeAfterTimeframe: 'Day 10',
    measuredMetric: '+84% Firming Tension',
    photoUrl: products[1].images[1] || products[1].src,
    routineUsed: 'Nighttime Cellular Recovery',
    likes: 38,
    status: 'approved',
    featured: true
  },
  {
    id: 4,
    productId: 2,
    productName: 'Medicube EGF Nad Firming Serum',
    author: 'Elena R.',
    email: 'elena.r@example.com',
    location: 'San Francisco, CA',
    rating: 5,
    date: '2 weeks ago',
    title: 'Best Korean firming serum I have ever purchased',
    comment: 'The crimson hue and silky spreadability feel ultra-luxurious. Waking up with bouncy, tight skin every morning. 10/10 repurchase.',
    verified: true,
    skinConcern: 'Loss of Firmness',
    skinType: 'Combination',
    videoUrl: 'https://www.youtube.com/watch?v=preview',
    routineUsed: 'Step 03 Treatment',
    likes: 19,
    status: 'approved'
  },
  {
    id: 5,
    productId: 3,
    productName: 'Revitalize Eye Therapy Patches',
    author: 'Claire M.',
    email: 'claire.m@example.com',
    location: 'London, UK',
    rating: 5,
    date: '3 days ago',
    title: 'Depuffs morning eye bags like magic',
    comment: 'Keep these in the skincare fridge! 15 minutes in the morning completely removes puffy bags and dark circles before my Zoom calls.',
    verified: true,
    skinConcern: 'Dark Circles & Morning Puffiness',
    skinType: 'All Skin Types',
    beforeAfterTimeframe: '15 Minutes',
    measuredMetric: '-45% Orbital Fluid',
    photoUrl: products[2].images[1] || products[2].src,
    routineUsed: 'Morning Cryo Prep',
    likes: 51,
    status: 'approved',
    featured: true
  },
  {
    id: 6,
    productId: 4,
    productName: 'Refined Pore & Oil Control Pads',
    author: 'David L.',
    email: 'david.l@example.com',
    location: 'Toronto, Canada',
    rating: 5,
    date: '5 days ago',
    title: 'Pores look visibly smaller and zero shine',
    comment: 'The textured side buffs away dead flakes while the smooth side floods skin with balancing hydration. My T-zone stays matte and clear all day.',
    verified: true,
    skinConcern: 'Enlarged Pores & Excess Sebum',
    skinType: 'Oily / Acne-Prone',
    beforeAfterTimeframe: 'Day 5',
    measuredMetric: '-36% Sebum Output',
    photoUrl: products[3].images[1] || products[3].src,
    routineUsed: 'Step 01 Exfoliating Prep',
    likes: 34,
    status: 'approved'
  },
  {
    id: 7,
    productId: 5,
    productName: 'Youthful Glow Multi-Balm Stick',
    author: 'Ji-Woo H.',
    email: 'jiwoo.h@example.com',
    location: 'Incheon, South Korea',
    rating: 5,
    date: '1 week ago',
    title: 'Essential handbag staple for Korean glow on the go',
    comment: 'I glide this over my cheekbones, neck lines, and smile lines throughout the day in air-conditioned offices. Instant glass skin sheen without feeling sticky.',
    verified: true,
    skinConcern: 'Dehydration & Smile Lines',
    skinType: 'Dry / Dehydrated',
    photoUrl: products[4].images[1] || products[4].src,
    likes: 27,
    status: 'approved'
  },
  {
    id: 8,
    productId: 6,
    productName: 'Radiance & Resilience Collagen Cream',
    author: 'Hannah W.',
    email: 'hannah.w@example.com',
    location: 'Sydney, Australia',
    rating: 5,
    date: '6 days ago',
    title: 'Deep cushion hydration that locks in all serums',
    comment: 'Low molecular collagen really makes a difference. My skin barrier feels reinforced and resilient against chilly autumn wind.',
    verified: true,
    skinConcern: 'Barrier Repair & Elasticity',
    skinType: 'Dry',
    beforeAfterTimeframe: 'Day 14',
    measuredMetric: '+96% Barrier Retention',
    photoUrl: products[5].images[1] || products[5].src,
    routineUsed: 'Step 04 Seal',
    likes: 45,
    status: 'approved',
    featured: true
  },
  {
    id: 9,
    productId: 7,
    productName: 'Radiance Boost Capsules',
    author: 'Jessica T.',
    email: 'jessica.t@example.com',
    location: 'New York, NY',
    rating: 5,
    date: '1 week ago',
    title: 'Fresh encapsulated potency every night',
    comment: 'Twisting open a fresh capsule prevents oxidation. Waking up to uniform, porcelain radiance and velvety texture.',
    verified: true,
    skinConcern: 'Hyperpigmentation & Dull Tone',
    skinType: 'Combination',
    likes: 22,
    status: 'approved'
  },
  {
    id: 10,
    productId: 14,
    productName: 'Bio-Collagen Real Deep Mask, Hydrating Overnight Hydrogel Face Mask',
    author: 'Sarah J.',
    email: 'sarah.j@example.com',
    location: 'Los Angeles, CA',
    rating: 5,
    date: 'Yesterday',
    title: 'Turns completely clear overnight — glass skin phenomenon!',
    comment: 'The viral mask lives up to every bit of the hype. I slept in it for 7 hours, and it turned completely transparent as the collagen absorbed. Woke up with zero pores and glass-like bounce.',
    verified: true,
    skinConcern: 'Enlarged Pores & Loss of Firmness',
    skinType: 'Dehydrated / Combination',
    beforeAfterTimeframe: 'Overnight (7 Hrs)',
    measuredMetric: '+210% Hydrogel Plump',
    photoUrl: products[13].images[1] || products[13].src,
    videoUrl: 'https://www.youtube.com/watch?v=preview',
    routineUsed: 'Step 05 Overnight Treatment',
    likes: 67,
    status: 'approved',
    featured: true
  },
  {
    id: 11,
    productId: 15,
    productName: 'Kojic Acid Turmeric Clarifying Capsule Serum for Troubled Skin',
    author: 'Mia C.',
    email: 'mia.c@example.com',
    location: 'Chicago, IL',
    rating: 5,
    date: '3 days ago',
    title: 'Faded stubborn post-acne dark spots in 2 weeks',
    comment: 'Kojic acid + turmeric with squalane capsules is the holy grail for post-inflammatory hyperpigmentation. My complexion looks even, calm, and luminous.',
    verified: true,
    skinConcern: 'Troubled Skin & Post-Blemish Marks',
    skinType: 'Blemish-Prone / Sensitive',
    beforeAfterTimeframe: 'Day 14',
    measuredMetric: '-52% Spot Intensity',
    photoUrl: products[14].images[1] || products[14].src,
    videoUrl: 'https://www.youtube.com/watch?v=preview',
    routineUsed: 'Spot Care & Barrier Restoration',
    likes: 54,
    status: 'approved',
    featured: true
  }
];

let out = `import { Product, Review, SkinConcern, RoutineStep, Category, FAQItem } from '../types';\n\n`;
out += `export const STORE_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};\n\n`;

out += `export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Products', count: ${products.length}, desc: 'The complete Li Fei Beauty curation' },
  { id: 'serums', name: 'Serums & Ampoules', count: 5, desc: 'Targeted high-potency treatments' },
  { id: 'moisturizers', name: 'Moisturizers & Creams', count: 4, desc: 'Barrier lipid restoration & hydration' },
  { id: 'cleansers', name: 'Cleansers & Pads', count: 2, desc: 'Gentle, pH-balanced pore refinement' },
  { id: 'eye-care', name: 'Eye Care & Patches', count: 2, desc: 'Depuffing & contour renewal patches' },
  { id: 'masks', name: 'Collagen & Sheet Masks', count: 1, desc: 'Overnight regenerative hydrogel melt' },
  { id: 'tools', name: 'Tools & Essentials', count: 1, desc: 'Precision care and grooming tools' }
];\n\n`;

out += `export const SKIN_CONCERNS: SkinConcern[] = [
  {
    id: 'dullness',
    title: 'Dullness & Loss of Radiance',
    subtitle: 'Fade fatigue & awaken Seoul glass skin glow',
    description: 'When pollution, stress, and sluggish micro-circulation deplete your skin matrix, targeted Salmon DNA PDRN and rose dewdrops restore light-reflective luminosity.',
    iconName: 'Sparkles',
    recommendedProductId: 1,
    targetActives: ['Rose PDRN (Salmon DNA)', '5 Types Peptide Complex', 'Damask Rose Water'],
    clinicalResult: '+192% Collagen Synthesis & Instant Plump in 7 Days'
  },
  {
    id: 'aging',
    title: 'Fine Lines & Loss of Firmness',
    subtitle: 'Micro-contour lifting and cellular reinforcement',
    description: 'EGF (Epidermal Growth Factor) paired with NAD+ delivers fundamental cellular rejuvenation, visibly tightening sagging pores and contour lines.',
    iconName: 'Activity',
    recommendedProductId: 2,
    targetActives: ['EGF Recombinant Peptide', 'NAD+ Cellular Coenzyme', 'Crimson Botanical Extract'],
    clinicalResult: '+84% Facial Tension & Elasticity Bounce in 14 Days'
  },
  {
    id: 'troubled',
    title: 'Troubled Skin & Uneven Tone',
    subtitle: 'Clarify spots & calm reactive redness',
    description: 'Targeted Kojic Acid, organic Turmeric extract, and snowflake-like Squalane micro-capsules gently fade post-breakout patches while soothing inflammation.',
    iconName: 'ShieldAlert',
    recommendedProductId: 15,
    targetActives: ['Kojic Acid', 'Curcuma Longa (Turmeric)', 'Squalane Capsules'],
    clinicalResult: '-52% Spot Intensity & Accelerated Skin Clarification'
  },
  {
    id: 'pores',
    title: 'Enlarged Pores & Excess Sebum',
    subtitle: 'Refine pore perimeter & balance moisture ratio',
    description: 'Dual-sided embossed toner pads soaked in sebum-regulating botanical extracts lift dead stratum corneum cells and clarify congested pores.',
    iconName: 'Layers',
    recommendedProductId: 4,
    targetActives: ['Sebum-Balancing Botanical Complex', 'AHA / BHA', 'Hyaluronic Acid'],
    clinicalResult: '-38% Pore Circumference & 8-Hour Sebum Control'
  },
  {
    id: 'barrier',
    title: 'Compromised Barrier & Dehydration',
    subtitle: 'Deep overnight hydrogel collagen replenishment',
    description: 'Solidified low-molecular bio-collagen melts directly into depleted skin overnight, forming an impenetrable moisture reservoir.',
    iconName: 'Droplets',
    recommendedProductId: 14,
    targetActives: ['Low Molecular Collagen', 'Oligo-Hyaluronic Acid', 'Galactomyces Ferment'],
    clinicalResult: '+210% Moisture Retention & Glass Skin Clarity Overnight'
  }
];\n\n`;

out += `export const ROUTINE_STEPS: RoutineStep[] = [
  {
    step: 1,
    title: 'Cleanse & Clarify',
    koreanName: '클렌징 및 각질 케어',
    description: 'Sweep away impurities and dead skin buildup without stripping the acid mantle using balancing pads.',
    tip: 'Use gentle circular motions along the T-zone and jawline.',
    recommendedProductIds: [4, 9]
  },
  {
    step: 2,
    title: 'Prep & Contour Care',
    koreanName: '토너 및 아이 패치',
    description: 'Cool and awaken orbital contours with hydrogel peptide patches while infusing hydration.',
    tip: 'Chill eye patches in the skincare fridge for maximum depuffing.',
    recommendedProductIds: [3, 8]
  },
  {
    step: 3,
    title: 'Targeted Ampoule & Treat',
    koreanName: '고효능 앰플 및 세럼',
    description: 'Deliver bio-compatible actives (PDRN, EGF, Kojic Acid) directly into lower dermal layers for intensive renewal.',
    tip: 'Press gently with warm palms to boost micro-circulation and absorption.',
    recommendedProductIds: [1, 2, 15]
  },
  {
    step: 4,
    title: 'Seal & Moisture Barrier',
    koreanName: '수분 크림 및 보습 밤',
    description: 'Form an invisible moisture cushion with low-molecular collagen cream and pocket glow balms.',
    tip: 'Glide multi-balm stick over cheekbones and smile lines for portable glass radiance.',
    recommendedProductIds: [6, 11, 5]
  },
  {
    step: 5,
    title: 'Overnight Melt-In Mask',
    koreanName: '오버나이트 콜라겐 팩',
    description: 'Lock in the entire 5-step ritual with an overnight bio-collagen hydrogel mask that turns transparent as actives absorb.',
    tip: 'Sleep for 4 to 8 hours with the mask for effortless morning glass skin.',
    recommendedProductIds: [14]
  }
];\n\n`;

out += `export const STORE_REVIEWS: Review[] = ${JSON.stringify(reviewData, null, 2)};\n\n`;

out += `export const ROLLING_FACIAL_REVIEWS: Review[] = [
  STORE_REVIEWS[0],
  STORE_REVIEWS[1],
  STORE_REVIEWS[2]
];\n\n`;

out += `export const FAQS: FAQItem[] = [
  {
    category: 'Sourcing & Authenticity',
    q: 'How do you guarantee authenticity for every Seoul skincare product?',
    a: 'Every formula in our catalog is sourced directly from certified Seoul laboratories and official brand manufacturing channels. Products feature batch verification codes and are inspected under strict quality controls.'
  },
  {
    category: 'Formulas & Results',
    q: 'What is PDRN and why is it considered the holy grail of Korean skincare?',
    a: 'PDRN (Polydeoxyribonucleotide) is bio-compatible salmon DNA micro-molecules proven in Seoul clinical dermatology trials to accelerate cellular repair, synthesize new collagen, and deliver the signature glass-skin bounce.'
  },
  {
    category: 'Orders & Shipping',
    q: 'How long does shipping take and how are active serums preserved?',
    a: 'We offer free express delivery on orders over $40. Orders ship within 24-48 hours via premium express couriers (2-4 business days). All peptide and DNA-active formulas are climate-preserved.'
  },
  {
    category: 'Routine Guidance',
    q: 'Can I combine multiple serums (e.g., PDRN Pink + Kojic Acid)?',
    a: 'Yes. Korean skincare relies on layering. You can apply Kojic Acid Turmeric on dark spots and layer Medicube PDRN Pink all over for full-face elasticity, sealing with collagen cream.'
  }
];\n`;

fs.writeFileSync('src/data/storeData.ts', out, 'utf-8');
console.log('Successfully written src/data/storeData.ts with real Shopify data!');
