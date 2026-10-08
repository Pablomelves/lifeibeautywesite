import { Product, Review, Order, Customer, Discount, StoreContent } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "MEDICUBE PDRN PINK",
    subtitle: "Rose PDRN Peptide Serum",
    src: "/products/medicube-pink.jpg",
    bg: "#EFA6B7",
    panel: "#FDF0F3",
    themeColor: "#DF4D6E",
    darkTone: false,
    price: "$36.00",
    numericPrice: 36,
    originalPrice: "$45.00",
    compareAtPrice: "$45.00",
    volume: "30 ml / 1.01 fl. oz.",
    category: "Serums",
    rating: 4.9,
    reviewsCount: 384,
    badge: "Bestseller",
    clinicalClaim: "+192% Collagen Synthesis & Instant Plump",
    benefits: [
      "Visibly tightens loosened dermal matrix and sagging pores",
      "Infuses bio-compatible Salmon DNA (Sodium DNA) for cellular repair",
      "Provides a glassy, luminous Korean dewy finish without greasiness",
      "Soothes micro-redness with fresh Damask Rose Hydrosol"
    ],
    keyIngredients: [
      "Rose PDRN (Sodium DNA)",
      "5 Types Peptide Complex",
      "Damask Rose Water",
      "Niacinamide 2%"
    ],
    allIngredients: "Water, Rosa Damascena Flower Water, Butylene Glycol, Dipropylene Glycol, Glycerin, Sodium DNA (PDRN), Niacinamide, 1,2-Hexanediol, Oligopeptide-1, Palmitoyl Pentapeptide-4, Copper Tripeptide-1, Centella Asiatica Extract, Adenosine, Ethylhexylglycerin.",
    howToUse: [
      "After cleansing and toning, dispense 2–3 drops onto fingertips.",
      "Gently pat across face and neck along skin texture until fully absorbed.",
      "Follow with your favorite barrier moisturizer for locked-in glow."
    ],
    ritualStep: "Step 03 · Targeted Ampoule & Firming Treatment",
    skinType: "All Skin Types, Dull, Loss of Firmness",
    fullDescription: "Biomimetic salmon DNA peptide ampoule suspended in fresh Damask rose dewdrops. Restores depleted skin matrix, shrinks pore perimeter, and bestows an ethereal Korean glass glow.",
    stockStatus: "In Stock",
    stockQuantity: 42,
    sku: "LF-SER-101",
    status: "active",
    beforeAfterSummary: "98% noted noticeable cheek plumpness within 7 days; 94% reported refined pore texture.",
    faqs: [
      {
        q: "Is this suitable for sensitive or acne-prone skin?",
        a: "Yes. PDRN is an anti-inflammatory regenerative active thoroughly dermatologically tested for zero pore-clogging."
      },
      {
        q: "Can I use this daily?",
        a: "Yes, both morning and night. For daytime use, follow with SPF 50+."
      }
    ]
  },
  {
    id: 2,
    name: "MEDICUBE EGF NAD",
    subtitle: "Firming & Deep Collagen Serum",
    src: "/products/medicube-firming.jpg",
    bg: "#5E101D",
    panel: "#3F0811",
    themeColor: "#E11D48",
    darkTone: true,
    price: "$42.00",
    numericPrice: 42,
    originalPrice: "$52.00",
    compareAtPrice: "$52.00",
    volume: "30 ml / 1.01 fl. oz.",
    category: "Serums",
    rating: 4.95,
    reviewsCount: 512,
    badge: "Award Winner",
    clinicalClaim: "-34% Wrinkle Depth & +140% Dermal Density",
    benefits: [
      "Epidermal Growth Factor (EGF) activates cellular skin regeneration",
      "Pure NAD+ restores mitochondrial cellular vitality and elasticity",
      "Packed with antioxidant-rich ruby pomegranate and wild strawberries",
      "Rich, velvety micro-cushion texture with zero sticky residue"
    ],
    keyIngredients: [
      "EGF | NAD Cell Complex",
      "Collagen Extract 10,000ppm",
      "Ruby Pomegranate",
      "Alpine Strawberry"
    ],
    allIngredients: "Collagen Extract, Punica Granatum (Pomegranate) Fruit Extract, Fragaria Chiloensis (Strawberry) Fruit Extract, Nicotinamide Adenine Dinucleotide (NAD), sh-Oligopeptide-1 (EGF), Hydrolyzed Elastin, Squalane, Ceramide NP, Beta-Glucan.",
    howToUse: [
      "Press dropper to dispense 3–4 drops directly to cleansed cheeks and forehead.",
      "Smooth in an upward lifting motion toward the temples.",
      "Use morning and evening for maximum collagen synthesis."
    ],
    ritualStep: "Step 03 · Cellular Longevity & Deep Dermal Rebound",
    skinType: "Mature, Dry, Loss of Elasticity",
    fullDescription: "High-potency cellular regeneration concentrate utilizing Epidermal Growth Factor and pure NAD to reactivate dormant fibroblasts while infusing ruby pomegranate antioxidants.",
    stockStatus: "In Stock",
    stockQuantity: 28,
    sku: "LF-SER-102",
    status: "active",
    beforeAfterSummary: "-34% clinical wrinkle reduction measured at crow's feet after 14 days of twice-daily use.",
    faqs: [
      {
        q: "What makes NAD+ special in Korean skincare?",
        a: "NAD+ is the master longevity coenzyme that powers cellular ATP, allowing aging skin to rebuild collagen like young skin."
      }
    ]
  },
  {
    id: 3,
    name: "MEDICUBE KOJIC ACID",
    subtitle: "Turmeric Niacinamide Serum",
    src: "/products/medicube-turmeric.jpg",
    bg: "#E4980E",
    panel: "#FCF2DC",
    themeColor: "#D97706",
    darkTone: false,
    price: "$34.00",
    numericPrice: 34,
    originalPrice: "$42.00",
    compareAtPrice: "$42.00",
    volume: "30 ml / 1.01 fl. oz.",
    category: "Serums",
    rating: 4.88,
    reviewsCount: 420,
    badge: "Trending",
    clinicalClaim: "97% Dark Spot Dispersion & Tone Uniformity",
    benefits: [
      "Fades stubborn sun damage, post-blemish marks, and melasma",
      "Synergistic 1% Kojic Acid + 5% Niacinamide halts melanin transfer",
      "Golden Turmeric Rhizome provides potent calming anti-inflammatory relief",
      "Delivers an immediate dewy, golden hour lit-from-within sheen"
    ],
    keyIngredients: [
      "Kojic Acid 1%",
      "Turmeric Rhizome Extract",
      "Niacinamide 5%",
      "Centella Asiatica"
    ],
    allIngredients: "Curcuma Longa (Turmeric) Root Extract, Niacinamide, Butylene Glycol, Kojic Acid, Glycerin, Centella Asiatica Extract, Glycyrrhiza Glabra (Licorice) Root Extract, Arbutin, Sodium Hyaluronate, Tocopherol, Allantoin.",
    howToUse: [
      "Apply 2–3 drops to clean, slightly damp skin after cleansing.",
      "Focus gently on areas with dark spots, uneven pigmentation, or discoloration.",
      "Always follow with daily broad-spectrum SPF 50 during morning rituals."
    ],
    ritualStep: "Step 03 · Tone Perfection & Hyperpigmentation Eraser",
    skinType: "Uneven Tone, Hyperpigmentation, Post-Blemish",
    fullDescription: "Liposomal turmeric and kojic acid bio-synergy that dissolves stubborn post-acne blemishes and sun damage while preserving moisture barrier integrity.",
    stockStatus: "In Stock",
    stockQuantity: 6,
    sku: "LF-SER-103",
    status: "active",
    beforeAfterSummary: "97% reported noticeable lightening of dark spots after 21 days; 91% noted a brighter overall tone."
  },
  {
    id: 4,
    name: "BIODANCE BIO-COLLAGEN",
    subtitle: "Real Deep Hydration Mask Ampoule",
    src: "/products/biodance.png",
    bg: "#E8EAF5",
    panel: "#F2F3FA",
    themeColor: "#6366F1",
    darkTone: false,
    price: "$28.00",
    numericPrice: 28,
    originalPrice: "$35.00",
    compareAtPrice: "$35.00",
    volume: "50 ml / 1.69 fl. oz.",
    category: "Masks",
    rating: 4.96,
    reviewsCount: 680,
    badge: "Viral Sensation",
    clinicalClaim: "Overnight Pore Shrinking & 100-Hour Moisture Seal",
    benefits: [
      "Ultra-low molecular weight bio-collagen (243Da) penetrates deeper than standard collagen",
      "Galactomyces ferment filtrate refines skin grain and purifies congestion",
      "Creates a breathable hydro-shield that locks moisture for 100 continuous hours",
      "Hypoallergenic and EWG green-grade certified for zero irritation"
    ],
    keyIngredients: [
      "Oligo-Hyaluronic Acid",
      "Bio-Collagen 5000ppm",
      "Galactomyces Ferment",
      "Ceramide NP"
    ],
    allIngredients: "Collagen Extract, Galactomyces Ferment Filtrate, Glycereth-26, Niacinamide, Chondrus Crispus Extract, Ceramide NP, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Betaine, Allantoin, Panthenol.",
    howToUse: [
      "Apply generously across face before sleeping or as a deep surge treatment.",
      "Pat lightly until the essence transforms into a protective luminous glaze.",
      "Wake up to pore-less, radiant, bouncing glass skin."
    ],
    ritualStep: "Step 04 · Deep Hydro-Penetration & Night Seal",
    skinType: "Dehydrated, Enlarged Pores, Flaky Skin",
    fullDescription: "Clinical-grade hydro-barrier ampoule utilizing micro-molecular bio-collagen to lock in moisture for continuous dewy firmness and pore refinement.",
    stockStatus: "In Stock",
    stockQuantity: 18,
    sku: "LF-MAS-104",
    status: "active",
    beforeAfterSummary: "Noticeable pore reduction of 38% after a single overnight application."
  },
  {
    id: 5,
    name: "MEDICUBE ZERO PORE PAD 2.0",
    subtitle: "Dual-Textured Exfoliating Toner Pads",
    src: "/products/medicube.png",
    bg: "#EBF4F6",
    panel: "#F0F8FA",
    themeColor: "#0EA5E9",
    darkTone: false,
    price: "$32.00",
    numericPrice: 32,
    originalPrice: "$38.00",
    compareAtPrice: "$38.00",
    volume: "70 pads / 155 g",
    category: "Cleansers",
    rating: 4.87,
    reviewsCount: 840,
    badge: "Cult Classic",
    clinicalClaim: "Clinically Proven 1-Step Pore Tightening",
    benefits: [
      "Patented Anti-Sebum P complex controls excess oil and shrinks sebum glands",
      "Dual embossed texture lifts dead dead skin cells and sweeps trapped impurities",
      "AHA + BHA blend dissolves blackheads without stripping natural moisture",
      "Preps skin perfectly for optimal serum and ampoule absorption"
    ],
    keyIngredients: [
      "AHA (Fruit Complex)",
      "BHA (Salicylic Acid)",
      "Anti-Sebum P",
      "Tea Tree Leaf Extract"
    ],
    allIngredients: "Water, Methylpropanediol, Tromethamine, Lactic Acid, Alcohol Denat., 1,2-Hexanediol, Panthenol, Salicylic Acid, Melaleuca Alternifolia (Tea Tree) Leaf Extract, Oenothera Biennis (Evening Primrose) Flower Extract.",
    howToUse: [
      "After cleansing, wipe gently with the embossed side across face, avoiding eyes.",
      "Turn the pad over and use the silky smooth side to soothe and tone.",
      "Lightly pat remaining essence into skin. Do not rinse off."
    ],
    ritualStep: "Step 02 · Tone, Pore Purify & Chemical Exfoliation",
    skinType: "Oily, Combination, Textured, Congested",
    fullDescription: "Award-winning Korean toner pads soaked in pore-refining fruit acids and soothing botanical tea tree essence to minimize visible pores.",
    stockStatus: "In Stock",
    stockQuantity: 35,
    sku: "LF-CLE-105",
    status: "active"
  },
  {
    id: 6,
    name: "SKINCARE ESSENTIALS HYDRA-INFUSION",
    subtitle: "Micro-Essence Skin Booster",
    src: "/products/skincare-3.png",
    bg: "#F5ECE3",
    panel: "#FAF2EB",
    themeColor: "#CA8A04",
    darkTone: false,
    price: "$30.00",
    numericPrice: 30,
    originalPrice: "$38.00",
    compareAtPrice: "$38.00",
    volume: "150 ml / 5.07 fl. oz.",
    category: "Moisturizers",
    rating: 4.85,
    reviewsCount: 290,
    badge: "Hydration Essential",
    clinicalClaim: "300% Deeper Moisture Transport Into Epidermis",
    benefits: [
      "Fermented green tea water base neutralizes environmental free radicals",
      "7-weight molecular hyaluronic acid deeply floods all dermal layers",
      "Restores healthy pH 5.5 acidic mantle balance after washing",
      "Lightweight water-gel slip that leaves zero film or residue"
    ],
    keyIngredients: [
      "7-Molecular Hyaluronic Acid",
      "Fermented Camellia Sinensis",
      "Trehalose",
      "Centella Asiatica"
    ],
    allIngredients: "Camellia Sinensis Leaf Water, Glycerin, Butylene Glycol, 1,2-Hexanediol, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Trehalose, Panthenol, Allantoin, Centella Asiatica Extract.",
    howToUse: [
      "Pour a generous coin-sized amount into clean palms.",
      "Press gently into face and neck for 30 seconds to lock in moisture.",
      "Layer 2–3 times using the Korean '7-skin method' for extreme glass glow."
    ],
    ritualStep: "Step 02 · Deep Moisture Prime & Balance",
    skinType: "Dehydrated, Sensitive, All Types",
    fullDescription: "Essential Korean hydrating essence that re-awakens dehydrated skin cells and creates a plump, fertile canvas for active serums.",
    stockStatus: "In Stock",
    stockQuantity: 35,
    sku: "LF-MOI-106",
    status: "active"
  },
  {
    id: 7,
    name: "GLOW COLLECTION BARRIER REPAIR",
    subtitle: "Ceramide Peptide Cushion Cream",
    src: "/products/skincare-4.png",
    bg: "#E3EDF0",
    panel: "#EDF5F7",
    themeColor: "#0284C7",
    darkTone: false,
    price: "$38.00",
    numericPrice: 38,
    originalPrice: "$48.00",
    compareAtPrice: "$48.00",
    volume: "60 ml / 2.02 fl. oz.",
    category: "Moisturizers",
    rating: 4.92,
    reviewsCount: 340,
    badge: "Seoul Editors Pick",
    clinicalClaim: "Strengthens Damaged Moisture Barrier in 72 Hours",
    benefits: [
      "Bio-identical 5-Ceramide complex (EOP, NS, NP, AS, AP) repairs cracked barrier",
      "Deep olive squalane mimics natural sebum to prevent transepidermal water loss",
      "Silky whipped cushion texture that melts upon skin contact",
      "Creates a luminous protective shield against dry indoor air and pollution"
    ],
    keyIngredients: [
      "5-Ceramide Complex",
      "Olive Squalane 3%",
      "Phytosphingosine",
      "Oat Beta-Glucan"
    ],
    allIngredients: "Water, Squalane, Butylene Glycol, Caprylic/Capric Triglyceride, Glycerin, Ceramide NP, Ceramide NS, Ceramide AS, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Beta-Glucan, Hydrogenated Lecithin.",
    howToUse: [
      "Warm a pea-sized amount between clean fingertips.",
      "Smooth upward across face as the final moisturizing step in your ritual.",
      "Use night and day for continuous barrier defense."
    ],
    ritualStep: "Step 04 · Moisture Lock & Barrier Seal",
    skinType: "Dry, Sensitive, Compromised Barrier, Winter Skin",
    fullDescription: "Luxurious lipid-restoring cushion cream engineered to heal compromised skin barriers and preserve the glassy radiance of your serums.",
    stockStatus: "In Stock",
    stockQuantity: 35,
    sku: "LF-MOI-107",
    status: "active"
  },
  {
    id: 8,
    name: "LI FEI ROSE QUARTZ CONTOUR ROLLER",
    subtitle: "Dual-Node Cryo Sculpting Facial Tool",
    src: "/products/facial-roller.jpg",
    bg: "#FADEE5",
    panel: "#FDF0F3",
    themeColor: "#EC3460",
    darkTone: false,
    price: "$32.00",
    numericPrice: 32,
    originalPrice: "$42.00",
    compareAtPrice: "$42.00",
    volume: "Grade-A Natural Rose Quartz Crystal",
    category: "Tools & Rollers",
    rating: 4.97,
    reviewsCount: 468,
    badge: "Clinical Tool",
    clinicalClaim: "-38% Instant Facial Puffiness & +94% Serum Bio-Absorption",
    benefits: [
      "Sculpts jawline, drains lymph fluid, and lifts sagging facial contour",
      "Naturally cold crystal calms redness, soothes inflammation, and shrinks pore perimeter",
      "Dual-node engineering: Large stone for cheeks & neck, precision node for under-eyes & brow bone",
      "Drives active PDRN and EGF serum molecules 94% deeper into the dermal matrix"
    ],
    keyIngredients: [
      "100% Brazilian Rose Quartz",
      "Rose Gold Ergonomic Frame",
      "Silent Silicone Cushioning"
    ],
    allIngredients: "Authentic high-density Brazilian Rose Quartz crystal with custom medical-grade zinc alloy mounting and noise-free glide bearings.",
    howToUse: [
      "Apply 3–4 drops of Medicube PDRN Pink or EGF NAD serum to provide slip.",
      "Roll from collarbone upward along the neck to open lymphatic drainage channels.",
      "Sweep from chin along the jawline toward earlobes with gentle medium pressure (repeat 5x).",
      "Use the smaller node under the eyes from inner corner outward toward temples."
    ],
    ritualStep: "Step 03.5 · Lymphatic Drainage & Cryo Contour Sculpting",
    skinType: "All Skin Types · Morning Puffiness, Laxity & Contouring",
    fullDescription: "Custom-crafted from certified Grade-A Brazilian Rose Quartz crystal, this cooling contour roller stimulates lymphatic drainage, drains stagnant morning fluid, and sculpts cheekbones while boosting serum absorption.",
    stockStatus: "In Stock",
    stockQuantity: 35,
    sku: "LF-TOO-108",
    status: "active",
    beforeAfterSummary: "-38% measured cheek puffiness in 10 minutes; 96% reported immediate jawline lift and dewy clarity.",
    faqs: [
      {
        q: "Should I keep the roller in the refrigerator?",
        a: "Yes! Storing it in the fridge provides intense cryo-depuffing that constricts capillaries and reduces morning puffiness in minutes."
      },
      {
        q: "Can I use this over active serums?",
        a: "Yes, rolling directly over your serums or sheet masks increases topical penetration by up to 94%."
      }
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    productId: 1,
    productName: "MEDICUBE PDRN PINK",
    author: "Min-ji Song",
    email: "minji@example.com",
    rating: 5,
    title: "The salmon DNA ampoule is an authentic miracle",
    comment: "Within 4 days of morning and evening application, cheek tightness returned. The Damask rose dewy scent is delicate and non-sensitizing.",
    date: "Yesterday",
    status: "approved",
    featured: true,
    verified: true,
    skinConcern: "Loss of Firmness & Dullness",
    photos: ["/products/medicube-pink.jpg"],
    likes: 34
  },
  {
    id: 2,
    productId: 1,
    productName: "MEDICUBE PDRN PINK",
    author: "Elena Rostova",
    email: "elena@example.com",
    rating: 5,
    title: "Glass skin without greasy residue",
    comment: "Obsessed with the texture. It sinks right in and leaves a reflective mirror glow that lasts through a 10-hour flight.",
    date: "3 days ago",
    status: "approved",
    featured: true,
    verified: true,
    skinConcern: "Dehydration",
    photos: ["/products/medicube-pink-square.jpg"],
    likes: 19
  },
  {
    id: 3,
    productId: 2,
    productName: "MEDICUBE EGF NAD",
    author: "Clara Beaumont",
    email: "clara@example.com",
    rating: 5,
    title: "Noticeably smoothed fine lines around eye contour",
    comment: "The NAD+ peptide science actually delivers. My skin density feels completely restored and bounce has returned.",
    date: "5 days ago",
    status: "approved",
    featured: true,
    verified: true,
    skinConcern: "Deep Expression Lines",
    photos: ["/products/medicube-firming.jpg"],
    likes: 27
  },
  {
    id: 4,
    productId: 3,
    productName: "MEDICUBE KOJIC ACID",
    author: "Jasmine Lee",
    email: "jasmine@example.com",
    rating: 4,
    title: "Gentle on post-acne pigmentation",
    comment: "Fade speed is impressive. Turmeric usually stains but this clear golden serum is elegant and spotless.",
    date: "6 days ago",
    status: "approved",
    featured: false,
    verified: true,
    skinConcern: "Post-Blemish Marks",
    photos: ["/products/medicube-turmeric.jpg"],
    likes: 12
  },
  {
    id: 5,
    productId: 8,
    productName: "LI FEI ROSE QUARTZ CONTOUR ROLLER",
    author: "Maya Lin",
    email: "maya@example.com",
    rating: 5,
    title: "Heaviest, coldest Brazilian quartz I have ever held",
    comment: "Nightly lymphatic drainage with the Medicube pink serum has transformed my morning jawline puffiness.",
    date: "1 week ago",
    status: "approved",
    featured: true,
    verified: true,
    skinConcern: "Puffiness & Lymphatic Flow",
    photos: ["/products/facial-roller.jpg"],
    likes: 45
  },
  {
    id: 6,
    productId: 1,
    productName: "MEDICUBE PDRN PINK",
    author: "Jordan Taylor",
    email: "jordan@example.com",
    rating: 5,
    title: "Fast shipping and beautifully packaged",
    comment: "Came in 2 days in sustainable insulated box. Bottle was sealed with Seoul verification badge intact.",
    date: "2 hours ago",
    status: "approved",
    featured: false,
    verified: true,
    skinConcern: "First-time Customer",
    likes: 8
  },
  {
    id: 7,
    productId: 4,
    productName: "BIODANCE BIO-COLLAGEN",
    author: "Rebecca Thorne",
    email: "rebecca@example.com",
    rating: 5,
    title: "Woke up looking like a glazed ceramic dumpling",
    comment: "Left it on overnight for 6 hours until transparent. My pores are literally invisible this morning.",
    date: "Just now",
    status: "approved",
    featured: true,
    verified: true,
    skinConcern: "Enlarged Pores",
    photos: ["/products/biodance.png"],
    likes: 52
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "LF-1048",
    orderNumber: "#LF-1048",
    date: "2026-10-07 10:14 AM",
    createdAt: "2026-10-08T08:18:15.920Z",
    customer: {
      name: "Evelyn Vance",
      email: "evelyn.vance@example.com",
      phone: "+1 (555) 392-8812",
      address: "742 Evergreen Terrace, Apt 4B",
      city: "Portland",
      state: "OR",
      country: "United States",
      zip: "97201"
    },
    items: [
      {
        productId: 1,
        name: "MEDICUBE PDRN PINK",
        price: 36,
        quantity: 2,
        image: "/products/medicube-pink.jpg",
        variant: "30 ml / 1.01 fl. oz."
      },
      {
        productId: 8,
        name: "LI FEI ROSE QUARTZ CONTOUR ROLLER",
        price: 32,
        quantity: 1,
        image: "/products/facial-roller.jpg",
        variant: "Standard Brazilian Rose Quartz"
      }
    ],
    subtotal: 104,
    discountCode: "GLOW15",
    discountAmount: 15.6,
    shippingCost: 0,
    total: 88.4,
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    trackingNumber: "",
    carrier: "USPS Priority",
    notes: "Gift packaging requested with personalized Seoul handwritten card."
  },
  {
    id: "LF-1047",
    orderNumber: "#LF-1047",
    date: "2026-10-06 04:22 PM",
    createdAt: "2026-10-07T08:18:15.921Z",
    customer: {
      name: "Chloe Takahashi",
      email: "chloe.t@example.com",
      phone: "+1 (555) 782-9901",
      address: "1204 Sunset Blvd, Suite 210",
      city: "Los Angeles",
      state: "CA",
      country: "United States",
      zip: "90026"
    },
    items: [
      {
        productId: 2,
        name: "MEDICUBE EGF NAD",
        price: 42,
        quantity: 1,
        image: "/products/medicube-firming.jpg",
        variant: "30 ml / 1.01 fl. oz."
      },
      {
        productId: 4,
        name: "BIODANCE BIO-COLLAGEN",
        price: 28,
        quantity: 2,
        image: "/products/biodance.png",
        variant: "50 ml / 1.69 fl. oz."
      }
    ],
    subtotal: 98,
    discountAmount: 0,
    shippingCost: 0,
    total: 98,
    paymentStatus: "paid",
    fulfillmentStatus: "shipped",
    trackingNumber: "9400111899223199842109",
    carrier: "FedEx Express"
  },
  {
    id: "LF-1046",
    orderNumber: "#LF-1046",
    date: "2026-10-05 09:30 AM",
    createdAt: "2026-10-06T08:18:15.921Z",
    customer: {
      name: "Marcus Sterling",
      email: "marcus.s@luxuryglow.co",
      phone: "+1 (555) 234-5519",
      address: "55 Wall Street, Penthouse B",
      city: "New York",
      state: "NY",
      country: "United States",
      zip: "10005"
    },
    items: [
      {
        productId: 1,
        name: "MEDICUBE PDRN PINK",
        price: 36,
        quantity: 3,
        image: "/products/medicube-pink.jpg",
        variant: "30 ml / 1.01 fl. oz."
      },
      {
        productId: 3,
        name: "MEDICUBE KOJIC ACID",
        price: 34,
        quantity: 2,
        image: "/products/medicube-turmeric.jpg",
        variant: "30 ml / 1.01 fl. oz."
      }
    ],
    subtotal: 176,
    discountCode: "SEOUL20",
    discountAmount: 35.2,
    shippingCost: 0,
    total: 140.8,
    paymentStatus: "paid",
    fulfillmentStatus: "delivered",
    trackingNumber: "9374889676090123984501",
    carrier: "DHL Express",
    notes: "VIP repeat purchaser. Send complimentary barrier trial kit."
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "CUST-01",
    name: "Evelyn Vance",
    email: "evelyn.vance@example.com",
    phone: "+1 (555) 392-8812",
    ordersCount: 4,
    totalSpent: 348.5,
    lastOrderDate: "2026-10-07",
    tags: ["VIP", "Repeat Buyer", "Damask Rose Club"],
    notes: "Prefers peptide and rose formulas. Highly engaged with Seoul skincare routine guides.",
    joinedDate: "2026-02-14",
    shippingAddress: {
      address: "742 Evergreen Terrace, Apt 4B",
      city: "Portland, OR",
      country: "United States",
      zip: "97201"
    }
  },
  {
    id: "CUST-02",
    name: "Chloe Takahashi",
    email: "chloe.t@example.com",
    phone: "+1 (555) 782-9901",
    ordersCount: 3,
    totalSpent: 265,
    lastOrderDate: "2026-10-06",
    tags: ["EGF Devotee", "Verified Reviewer"],
    notes: "Sensitive barrier skin profile. Loves the cooling feel of Biodance night masks.",
    joinedDate: "2026-04-18",
    shippingAddress: {
      address: "1204 Sunset Blvd, Suite 210",
      city: "Los Angeles, CA",
      country: "United States",
      zip: "90026"
    }
  },
  {
    id: "CUST-03",
    name: "Marcus Sterling",
    email: "marcus.s@luxuryglow.co",
    phone: "+1 (555) 234-5519",
    ordersCount: 7,
    totalSpent: 890,
    lastOrderDate: "2026-10-05",
    tags: ["Top Tier VIP", "Bulk Buyer"],
    notes: "Orders multiple bottles of Medicube serums per order. Corporate skincare gifts.",
    joinedDate: "2025-11-09",
    shippingAddress: {
      address: "55 Wall Street, Penthouse B",
      city: "New York, NY",
      country: "United States",
      zip: "10005"
    }
  }
];

export const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: "DISC-01",
    code: "GLOW15",
    type: "percentage",
    value: 15,
    minPurchase: 40,
    usageCount: 148,
    usageLimit: 500,
    active: true,
    expiresAt: "2026-12-31",
    description: "15% Off storewide on orders over $40 (Site Banner Code)"
  },
  {
    id: "DISC-02",
    code: "WELCOME10",
    type: "fixed",
    value: 10,
    minPurchase: 50,
    usageCount: 89,
    usageLimit: 1000,
    active: true,
    expiresAt: "2026-12-31",
    description: "$10 Off your first order over $50"
  },
  {
    id: "DISC-03",
    code: "SEOUL20",
    type: "percentage",
    value: 20,
    minPurchase: 75,
    usageCount: 43,
    usageLimit: 200,
    active: true,
    expiresAt: "2026-11-15",
    description: "20% VIP Autumn hydration discount on orders over $75"
  },
  {
    id: "DISC-04",
    code: "FREESHIP",
    type: "fixed",
    value: 5,
    minPurchase: 35,
    usageCount: 215,
    active: true,
    description: "Free standard domestic courier shipping"
  }
];

export const INITIAL_CONTENT: StoreContent = {
  announcementText: "DIRECT FROM SEOUL · COMPLIMENTARY EXPRESS DISPATCH OVER $40",
  promoCode: "GLOW15",
  promoBadge: "15% OFF AT CHECKOUT",
  heroHeadline: "SEOUL CELLULAR RENEWAL",
  heroSubhead: "Biomimetic Salmon PDRN · Pure NAD+ · Rose Quartz Contour",
  heroTagline: "Curated clinical Korean skincare designed to deliver luminous hydration, dermal density, and true glass glow.",
  bannerPromoTitle: "THE GLOW ARCHITECTURE",
  bannerPromoSubtitle: "Clinical Korean botanical actives engineered for rapid cellular barrier rebound.",
  bannerPromoDiscount: "USE CODE GLOW15 FOR 15% OFF FIRST RITUAL",
  brandStoryTitle: "PURITY · POTENCY · PRESERVATION",
  brandStoryText: "Li Fei Beauty curates strictly authentic, temperature-controlled Korean formulations direct from Seoul's premier dermatological research laboratories."
};
