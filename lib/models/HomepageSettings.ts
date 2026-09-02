import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHomepageSettings extends Document {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroButtonText: string;
  heroButtonLink: string;
  announcementText?: string;
  rawCardImage?: string;
  rawCardSubtitle?: string;
  flavoredCardImage?: string;
  flavoredCardSubtitle?: string;
  secondaryTitle: string;
  secondarySubtitle: string;
  secondaryImageUrl: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  updatedAt: Date;
}

const HomepageSettingsSchema: Schema = new Schema<IHomepageSettings>(
  {
    heroTitle: {
      type: String,
      default: 'Supreme Quality Handpicked Cashews',
    },
    heroSubtitle: {
      type: String,
      default: 'Directly sourced from trusted orchards and freshly processed at our facility in Uppal, Hyderabad. Experience unmatched crunch and natural flavor.',
    },
    heroImageUrl: {
      type: String,
      default: '/images/raw_cashews_hero.webp',
    },
    heroButtonText: { type: String, default: 'Shop All Products' },
    heroButtonLink: { type: String, default: '#shop' },
    announcementText: { 
      type: String, 
      default: 'Direct Uppal Roastery Counter • 100% Pure W180 Jumbo & Gourmet Spiced Cashews • Wholesale & Retail' 
    },
    rawCardImage: { type: String, default: '/images/raw_cashews_hero.webp' },
    rawCardSubtitle: { type: String, default: 'Grade W180 & W210 supreme size whole nuts. Naturally sweet, high crunch.' },
    flavoredCardImage: { type: String, default: '/images/tandoori_cashews_hero.webp' },
    flavoredCardSubtitle: { type: String, default: 'Peri Peri, Tandoori Masala & Pudina Herb infused with pure spices.' },
    secondaryTitle: { type: String, default: 'Artisanal Flavoured Blends' },
    secondarySubtitle: { type: String, default: 'Slow roasted with rich Indian spices for an irresistible crunch.' },
    secondaryImageUrl: {
      type: String,
      default: '/images/tandoori_cashews_hero.webp',
    },
    secondaryButtonText: { type: String, default: 'Explore Flavours' },
    secondaryButtonLink: { type: String, default: '/category/flavored' },
  },
  { timestamps: true }
);

const HomepageSettings: Model<IHomepageSettings> =
  mongoose.models.HomepageSettings ||
  mongoose.model<IHomepageSettings>('HomepageSettings', HomepageSettingsSchema);

export default HomepageSettings;
