export interface ICategoryFeatureCard {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeIcon?: string;
  badgeVariant?: 'gold' | 'spice' | 'green' | 'blue' | 'purple' | 'amber';
  linkUrl: string;
  linkText: string;
  imageUrl: string;
  accentColor?: string;
  isActive: boolean;
  order: number;
}

export const DEFAULT_CATEGORY_CARDS: ICategoryFeatureCard[] = [
  {
    id: 'card-raw',
    title: 'Raw Cashews',
    subtitle: 'Grade W180 & W210 supreme size whole nuts. Naturally sweet, high crunch.',
    badgeText: 'King Jumbo Series',
    badgeIcon: 'sparkles',
    badgeVariant: 'gold',
    linkUrl: '/category/raw',
    linkText: 'Explore Raw Grades',
    imageUrl: '/images/raw_cashews_hero.webp',
    accentColor: '#D4AF37',
    isActive: true,
    order: 1,
  },
  {
    id: 'card-flavored',
    title: 'Flavoured Cashews',
    subtitle: 'Peri Peri, Tandoori Masala & Pudina Herb infused with pure spices.',
    badgeText: 'Slow-Roast Gourmet',
    badgeIcon: 'flame',
    badgeVariant: 'spice',
    linkUrl: '/category/flavored',
    linkText: 'Explore Flavours & Spice Profile',
    imageUrl: '/images/tandoori_cashews_hero.webp',
    accentColor: '#F43F5E',
    isActive: true,
    order: 2,
  },
  {
    id: 'card-hampers',
    title: 'Festive Gift Hampers',
    subtitle: 'Luxury gold embossed gift tins and assorted celebration dry fruit box assortments.',
    badgeText: 'Royal Celebration',
    badgeIcon: 'gift',
    badgeVariant: 'amber',
    linkUrl: '/#shop',
    linkText: 'Explore Festive Hampers',
    imageUrl: '/images/cashew-nuts-ai-generated.webp',
    accentColor: '#EAB308',
    isActive: true,
    order: 3,
  },
  {
    id: 'card-wholesale',
    title: 'Wholesale & 10kg Sacks',
    subtitle: 'Direct factory wholesale pricing for sweet makers, restaurants, caterers, and corporate clients in Hyderabad.',
    badgeText: 'Direct Uppal Roastery Hub',
    badgeIcon: 'package',
    badgeVariant: 'green',
    linkUrl: 'https://wa.me/919515273464',
    linkText: 'WhatsApp Bulk Desk',
    imageUrl: '/images/raw-cashews-nuts-bowl-marble-background.webp',
    accentColor: '#10B981',
    isActive: true,
    order: 4,
  },
];
