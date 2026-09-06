import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFestivalTheme {
  id: string;
  name: string;
  festival: string;
  tagline: string;
  icon: string;
  category: 'FESTIVAL' | 'SEASONAL' | 'SIGNATURE';
  mode: 'LIGHT' | 'DARK';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBg: string;
  textColor: string;
  textMuted: string;
  glowColor: string;
  borderColor: string;
  announcementTicker: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroBadge: string;
  godImageUrl: string;
  godName: string;
  festivalBannerUrl: string;
  blessingQuote: string;
  bgPattern: 'rangoli' | 'mandala' | 'gulal-splash' | 'diya-pattern' | 'crescent-stars' | 'lotus-waves' | 'snow-flakes' | 'none';
  ambientEffect: 'diya-sparks' | 'gulal-burst' | 'golden-petals' | 'snow-stars' | 'crescent-stars' | 'peacock-aura' | 'roastery-gold' | 'none';
  paletteClusters?: string[];
  isCustom?: boolean;
}

export interface IThemeConfig extends Document {
  activeThemeId: string;
  activeTheme: IFestivalTheme;
  customThemes: IFestivalTheme[];
  updatedAt: Date;
}

const FestivalThemeSchema = new Schema<IFestivalTheme>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  festival: { type: String, required: true },
  tagline: { type: String, default: '' },
  icon: { type: String, default: '🪔' },
  category: { type: String, default: 'FESTIVAL' },
  mode: { type: String, enum: ['LIGHT', 'DARK'], default: 'DARK' },
  primaryColor: { type: String, default: '#D4AF37' },
  secondaryColor: { type: String, default: '#B48328' },
  accentColor: { type: String, default: '#FFD700' },
  backgroundColor: { type: String, default: '#070D18' },
  cardBg: { type: String, default: '#0A111E' },
  textColor: { type: String, default: '#F8FAFC' },
  textMuted: { type: String, default: '#94A3B8' },
  glowColor: { type: String, default: 'rgba(212, 175, 55, 0.4)' },
  borderColor: { type: String, default: 'rgba(212, 175, 55, 0.3)' },
  announcementTicker: { type: String, default: 'Direct Uppal Roastery Counter • 100% Pure W180 Jumbo Cashews' },
  heroHeadline: { type: String, default: 'Supreme Quality Handpicked Cashews' },
  heroSubtitle: { type: String, default: 'Directly sourced from trusted orchards and freshly processed at Uppal, Hyderabad.' },
  godImageUrl: { type: String, default: '/images/Header-logo.webp' },
  godName: { type: String, default: 'Sidhi Vinayaka Heritage' },
  festivalBannerUrl: { type: String, default: '/images/royal_cashew_roastery.webp' },
  blessingQuote: { type: String, default: 'Sidhi Vinayaka Traders • Delivering Purity, Crunch & Authentic Roastery Excellence.' },
  bgPattern: { type: String, default: 'mandala' },
  ambientEffect: { type: String, default: 'roastery-gold' },
  paletteClusters: [{ type: String }],
  isCustom: { type: Boolean, default: false },
});

const ThemeConfigSchema: Schema = new Schema<IThemeConfig>(
  {
    activeThemeId: { type: String, default: 'royal-gold' },
    activeTheme: { type: FestivalThemeSchema },
    customThemes: [FestivalThemeSchema],
  },
  { timestamps: true }
);

export const ThemeConfig: Model<IThemeConfig> =
  mongoose.models.ThemeConfig || mongoose.model<IThemeConfig>('ThemeConfig', ThemeConfigSchema);

export default ThemeConfig;
