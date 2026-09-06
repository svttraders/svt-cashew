export interface SpiceIngredient {
  name: string;
  iconUrl?: string;
  description?: string;
  image?: string;
}

export interface NutritionalInfo {
  calories?: string;
  protein?: string;
  fats?: string;
  carbs?: string;
  dietaryFiber?: string;
}

export interface Product {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  category: 'RAW' | 'FLAVORED';
  grade?: string; // "W180", "W210", "W240", "W320"
  flavor?: string; // "Tandoori", "Peri Peri", "Pudina", "Magic Masala"
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  weightOptions: string[]; // ["250g", "500g", "1kg", "5kg Wholesale"]
  images: string[];
  description: string;
  shortDescription?: string;
  badgeText?: string;
  benefits?: string[];
  ingredients?: string[];
  nutritionalInfo?: NutritionalInfo;
  spiceBreakdown?: SpiceIngredient[];
  isAvailable: boolean;
  rating?: number;
  reviewsCount?: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    _id: "prod-001",
    title: "Peri Peri Roasted Cashews (1kg)",
    slug: "peri-peri-cashew",
    category: "FLAVORED",
    flavor: "Peri Peri",
    price: 880,
    originalPrice: 990,
    discountPercent: 11,
    weightOptions: ["250g", "500g", "1kg"],
    images: [
      "/images/tandoori_cashews_hero.webp",
      "/images/royal_cashew_roastery.webp",
      "/images/cashew-nuts-ai-generated.webp",
      "/images/raw-cashews-nuts-bowl-marble-background.webp"
    ],
    description: "Fiery Peri Peri spice infused into giant oil-free roasted cashews. Spicy, smoky chili profile crafted directly from our signature Uppal roasting recipes.",
    shortDescription: "Fiery African bird's eye chili infused slow-roasted cashews.",
    badgeText: "HOT & SPICY",
    benefits: ["Zero Cholesterol", "High Plant Protein", "Oil-Free Roasting", "Heart Healthy"],
    ingredients: ["Premium Whole Cashews", "Peri Peri Spices", "Smoked Paprika", "Rock Salt"],
    nutritionalInfo: {
      calories: "560 kcal / 100g",
      protein: "18.5g",
      fats: "44.0g",
      carbs: "29.8g",
      dietaryFiber: "3.4g"
    },
    spiceBreakdown: [
      { name: "Peri Peri Chili", description: "Hot fiery red spice", image: "/images/tandoori_cashews_hero.webp" },
      { name: "Smoked Paprika", description: "Deep smoky aroma", image: "/images/royal_cashew_roastery.webp" },
      { name: "Roasted Cumin", description: "Earthy warmth", image: "/images/raw_cashews_hero.webp" },
      { name: "Sea Salt", description: "Pure mineral salt", image: "/images/raw-cashews-nuts-bowl-marble-background.webp" }
    ],
    isAvailable: true,
    stockQuantity: 150,
    lowStockThreshold: 20,
    rating: 5.0,
    reviewsCount: 142,
    isBestseller: true
  },
  {
    _id: "prod-002",
    title: "W180 King Jumbo Raw Cashews (1kg)",
    slug: "w180-jumbo-raw-cashew",
    category: "RAW",
    grade: "W180",
    price: 900,
    originalPrice: 1050,
    discountPercent: 14,
    weightOptions: ["250g", "500g", "1kg", "5kg Wholesale"],
    images: [
      "/images/raw_cashews_hero.webp",
      "/images/raw-cashews-nuts-bowl-marble-background.webp",
      "/images/raw-cashews-nuts-marble-background.webp",
      "/images/cashew-nuts-ai-generated.webp"
    ],
    description: "The rarest supreme grade 'King of Cashews' - 180 nuts per pound. 100% natural, unroasted, creamy, giant nuts directly processed in Uppal, Hyderabad.",
    shortDescription: "Extra large King Jumbo grade whole raw cashews with pure buttery sweetness.",
    badgeText: "KING JUMBO W180",
    benefits: ["Rich in Magnesium & Zinc", "Natural Immunity Booster", "100% Raw & Unprocessed", "Gluten-Free"],
    ingredients: ["100% Whole Raw Cashew Nuts (Grade W180)"],
    nutritionalInfo: {
      calories: "553 kcal / 100g",
      protein: "18.2g",
      fats: "43.8g",
      carbs: "30.1g",
      dietaryFiber: "3.3g"
    },
    isAvailable: true,
    stockQuantity: 200,
    lowStockThreshold: 25,
    rating: 5.0,
    reviewsCount: 210,
    isBestseller: true
  },
  {
    _id: "prod-003",
    title: "Tandoori Masala Cashews (1kg)",
    slug: "tandoori-masala-cashew",
    category: "FLAVORED",
    flavor: "Tandoori",
    price: 860,
    originalPrice: 950,
    discountPercent: 9,
    weightOptions: ["250g", "500g", "1kg"],
    images: [
      "/images/tandoori_cashews_hero.webp",
      "/images/royal_cashew_roastery.webp",
      "/images/cashew-nuts-ai-generated.webp",
      "/images/raw-cashews-nuts-bowl-marble-background.webp"
    ],
    description: "Authentic Hyderabadi clay-oven style tandoori seasoning infused into slow-roasted cashews with a touch of ghee aroma.",
    shortDescription: "Rich tandoori baked spice blend coated over crunchy cashews.",
    badgeText: "CHEF SPECIAL",
    benefits: ["Digestive Spices", "High Energy Snack", "No Preservatives"],
    ingredients: ["Roasted Cashews", "Kashmiri Chilli", "Garam Masala", "Black Salt"],
    nutritionalInfo: {
      calories: "558 kcal / 100g",
      protein: "18.0g",
      fats: "43.5g",
      carbs: "31.0g",
      dietaryFiber: "3.2g"
    },
    spiceBreakdown: [
      { name: "Kashmiri Chilli", description: "Vibrant red heat", image: "/images/tandoori_cashews_hero.webp" },
      { name: "Roasted Cumin", description: "Earthy warmth", image: "/images/raw_cashews_hero.webp" },
      { name: "Black Salt", description: "Chatpata tang", image: "/images/royal_cashew_roastery.webp" }
    ],
    isAvailable: true,
    stockQuantity: 120,
    lowStockThreshold: 15,
    rating: 4.8,
    reviewsCount: 88
  },
  {
    _id: "prod-004",
    title: "Pudina Masala Herb Cashews (1kg)",
    slug: "pudina-masala-cashew",
    category: "FLAVORED",
    flavor: "Pudina",
    price: 850,
    originalPrice: 920,
    discountPercent: 8,
    weightOptions: ["250g", "500g", "1kg"],
    images: [
      "/images/royal_cashew_roastery.webp",
      "/images/raw-cashews-nuts-bowl-marble-background.webp",
      "/images/tandoori_cashews_hero.webp",
      "/images/raw_cashews_hero.webp"
    ],
    description: "Cool garden-fresh mint leaf blend with roasted coriander, black pepper, and Himalayan pink salt.",
    shortDescription: "Refreshing fresh mint and roasted black pepper crunchy cashews.",
    badgeText: "HERBAL CRUNCH",
    benefits: ["Refreshing Mint Herbs", "Low Sodium", "Antioxidant Rich"],
    ingredients: ["Roasted Cashews", "Dried Mint Leaf", "Coriander", "Pink Salt"],
    nutritionalInfo: {
      calories: "550 kcal / 100g",
      protein: "18.1g",
      fats: "43.0g",
      carbs: "30.5g",
      dietaryFiber: "3.5g"
    },
    spiceBreakdown: [
      { name: "Fresh Mint Leaf", description: "Cool mint aroma", image: "/images/royal_cashew_roastery.webp" },
      { name: "Coriander", description: "Citrusy herb notes", image: "/images/raw_cashews_hero.webp" }
    ],
    isAvailable: true,
    stockQuantity: 95,
    lowStockThreshold: 10,
    rating: 4.9,
    reviewsCount: 64
  },
  {
    _id: "prod-005",
    title: "W210 Supreme Whole Cashews (1kg)",
    slug: "w210-supreme-cashew",
    category: "RAW",
    grade: "W210",
    price: 880,
    originalPrice: 980,
    discountPercent: 10,
    weightOptions: ["250g", "500g", "1kg", "5kg Wholesale"],
    images: [
      "/images/raw-cashews-nuts-marble-background.webp",
      "/images/raw_cashews_hero.webp",
      "/images/raw-cashews-nuts-bowl-marble-background.webp",
      "/images/cashew-nuts-ai-generated.webp"
    ],
    description: "Premium large whole cashews (210 count/lb). Ideal for daily snacking, festive gifting, and rich gravies.",
    shortDescription: "Generously sized whole jumbo cashews perfect for festive gifting.",
    badgeText: "POPULAR JUMBO",
    benefits: ["Rich in Essential Minerals", "Sweet Natural Creaminess", "100% Whole Kernels"],
    ingredients: ["100% Whole Raw Cashews (Grade W210)"],
    nutritionalInfo: {
      calories: "553 kcal / 100g",
      protein: "18.2g",
      fats: "43.8g",
      carbs: "30.1g",
      dietaryFiber: "3.3g"
    },
    isAvailable: true,
    stockQuantity: 180,
    lowStockThreshold: 20,
    rating: 4.9,
    reviewsCount: 175
  },
  {
    _id: "prod-006",
    title: "Magic Masala Spiced Cashews (1kg)",
    slug: "magic-masala-cashew",
    category: "FLAVORED",
    flavor: "Magic Masala",
    price: 870,
    originalPrice: 960,
    discountPercent: 9,
    weightOptions: ["250g", "500g", "1kg"],
    images: [
      "/images/cashew-nuts-ai-generated.webp",
      "/images/tandoori_cashews_hero.webp",
      "/images/royal_cashew_roastery.webp",
      "/images/raw-cashews-nuts-bowl-marble-background.webp"
    ],
    description: "A secret 12-spice blend crafted specifically for SVT. Sweet, spicy, tangy, and irresistibly crunchable.",
    shortDescription: "Chatpata sweet-spicy secret 12-spice roasted nut blend.",
    badgeText: "BESTSELLER",
    benefits: ["Chatpata Flavour Profile", "Crunchy Roast", "Zero Trans Fat"],
    ingredients: ["Roasted Cashews", "Dry Mango Amchur", "Cumin", "Clove", "Cardamom", "Spices"],
    nutritionalInfo: {
      calories: "556 kcal / 100g",
      protein: "18.3g",
      fats: "43.7g",
      carbs: "30.8g",
      dietaryFiber: "3.4g"
    },
    spiceBreakdown: [
      { name: "Secret Spice", description: "Signature recipe", image: "/images/tandoori_cashews_hero.webp" },
      { name: "Dry Mango", description: "Chatpata flavor", image: "/images/royal_cashew_roastery.webp" }
    ],
    isAvailable: true,
    stockQuantity: 110,
    lowStockThreshold: 15,
    rating: 4.9,
    reviewsCount: 93,
    isBestseller: true
  }
];
