export interface SpiceIngredient {
  name: string;
  iconUrl?: string;
  description?: string;
  image?: string;
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
  weightOptions: string[]; // ["500g", "1kg"]
  images: string[];
  description: string;
  spiceBreakdown?: SpiceIngredient[];
  isAvailable: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewsCount?: number;
  isBestseller?: boolean;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    _id: "prod-001",
    title: "Peri Peri (1kg)",
    slug: "peri-peri-cashew",
    category: "FLAVORED",
    flavor: "Peri Peri",
    price: 880,
    originalPrice: 990,
    weightOptions: ["500g", "1kg"],
    images: [
      "/images/tandoori_cashews_hero.webp",
      "/images/cashew-nuts-ai-generated.webp",
      "/images/8556b61c-c714-4ff1-b8b4-de13c096e87d.webp",
      "/images/cd301f78-5b3b-41a1-8716-5243e6187f7e.webp"
    ],
    description: "Fiery Peri Peri spice infused into giant oil-free roasted cashews. Spicy, smoky chili profile crafted directly from our signature Uppal roasting recipes.",
    spiceBreakdown: [
      { name: "Peri Peri Chili", description: "Hot fiery red spice", image: "/images/cd301f78-5b3b-41a1-8716-5243e6187f7e.webp" },
      { name: "Smoked Paprika", description: "Deep smoky aroma", image: "/images/tandoori_cashews_hero.webp" },
      { name: "Roasted Cumin", description: "Earthy warmth", image: "/images/raw_cashews_hero.webp" },
      { name: "Sea Salt", description: "Pure mineral salt", image: "/images/8556b61c-c714-4ff1-b8b4-de13c096e87d.webp" }
    ],
    isAvailable: true,
    stockQuantity: 150,
    rating: 5.0,
    reviewsCount: 142,
    isBestseller: true
  },
  {
    _id: "prod-002",
    title: "W180 King Jumbo (1kg)",
    slug: "w180-jumbo-raw-cashew",
    category: "RAW",
    grade: "W180",
    price: 900,
    originalPrice: 1050,
    weightOptions: ["500g", "1kg"],
    images: [
      "/images/raw_cashews_hero.webp",
      "/images/raw-cashews-nuts-bowl-marble-background.webp",
      "/images/raw-cashews-nuts-marble-background.webp",
      "/images/cashew-nuts-ai-generated.webp"
    ],
    description: "The rarest supreme grade 'King of Cashews' - 180 nuts per pound. 100% natural, unroasted, creamy, giant nuts directly processed in Uppal, Hyderabad.",
    isAvailable: true,
    stockQuantity: 200,
    rating: 5.0,
    reviewsCount: 210,
    isBestseller: true
  },
  {
    _id: "prod-003",
    title: "Tandoori Masala (1kg)",
    slug: "tandoori-masala-cashew",
    category: "FLAVORED",
    flavor: "Tandoori",
    price: 860,
    originalPrice: 950,
    weightOptions: ["500g", "1kg"],
    images: [
      "/images/tandoori_cashews_hero.webp",
      "/images/cashew-nuts-ai-generated.webp",
      "/images/cd301f78-5b3b-41a1-8716-5243e6187f7e.webp",
      "/images/8556b61c-c714-4ff1-b8b4-de13c096e87d.webp"
    ],
    description: "Authentic Hyderabadi clay-oven style tandoori seasoning infused into slow-roasted cashews with a touch of ghee aroma.",
    spiceBreakdown: [
      { name: "Kashmiri Chilli", description: "Vibrant red heat", image: "/images/cd301f78-5b3b-41a1-8716-5243e6187f7e.webp" },
      { name: "Roasted Cumin", description: "Earthy warmth", image: "/images/raw_cashews_hero.webp" },
      { name: "Black Salt", description: "Chatpata tang", image: "/images/8556b61c-c714-4ff1-b8b4-de13c096e87d.webp" }
    ],
    isAvailable: true,
    stockQuantity: 120,
    rating: 4.8,
    reviewsCount: 88
  },
  {
    _id: "prod-004",
    title: "Pudina Masala (1kg)",
    slug: "pudina-masala-cashew",
    category: "FLAVORED",
    flavor: "Pudina",
    price: 850,
    originalPrice: 920,
    weightOptions: ["500g", "1kg"],
    images: [
      "/images/8556b61c-c714-4ff1-b8b4-de13c096e87d.webp",
      "/images/raw-cashews-nuts-bowl-marble-background.webp",
      "/images/tandoori_cashews_hero.webp",
      "/images/raw_cashews_hero.webp"
    ],
    description: "Cool garden-fresh mint leaf blend with roasted coriander, black pepper, and Himalayan pink salt.",
    spiceBreakdown: [
      { name: "Fresh Mint Leaf", description: "Cool mint aroma", image: "/images/8556b61c-c714-4ff1-b8b4-de13c096e87d.webp" },
      { name: "Coriander", description: "Citrusy herb notes", image: "/images/raw_cashews_hero.webp" }
    ],
    isAvailable: true,
    stockQuantity: 95,
    rating: 4.9,
    reviewsCount: 64
  },
  {
    _id: "prod-005",
    title: "W210 Supreme (1kg)",
    slug: "w210-supreme-cashew",
    category: "RAW",
    grade: "W210",
    price: 880,
    originalPrice: 980,
    weightOptions: ["500g", "1kg"],
    images: [
      "/images/raw-cashews-nuts-marble-background.webp",
      "/images/raw_cashews_hero.webp",
      "/images/raw-cashews-nuts-bowl-marble-background.webp",
      "/images/cashew-nuts-ai-generated.webp"
    ],
    description: "Premium large whole cashews (210 count/lb). Ideal for daily snacking, festive gifting, and rich gravies.",
    isAvailable: true,
    stockQuantity: 180,
    rating: 4.9,
    reviewsCount: 175
  },
  {
    _id: "prod-006",
    title: "Magic Masala (1kg)",
    slug: "magic-masala-cashew",
    category: "FLAVORED",
    flavor: "Magic Masala",
    price: 870,
    originalPrice: 960,
    weightOptions: ["500g", "1kg"],
    images: [
      "/images/cashew-nuts-ai-generated.webp",
      "/images/tandoori_cashews_hero.webp",
      "/images/8556b61c-c714-4ff1-b8b4-de13c096e87d.webp",
      "/images/cd301f78-5b3b-41a1-8716-5243e6187f7e.webp"
    ],
    description: "A secret 12-spice blend crafted specifically for SVT. Sweet, spicy, tangy, and irresistibly crunchable.",
    spiceBreakdown: [
      { name: "Secret Spice", description: "Signature recipe", image: "/images/cd301f78-5b3b-41a1-8716-5243e6187f7e.webp" },
      { name: "Dry Mango", description: "Chatpata flavor", image: "/images/8556b61c-c714-4ff1-b8b4-de13c096e87d.webp" }
    ],
    isAvailable: true,
    stockQuantity: 110,
    rating: 4.9,
    reviewsCount: 93,
    isBestseller: true
  }
];
