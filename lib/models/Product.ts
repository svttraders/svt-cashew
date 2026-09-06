import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISpiceBreakdown {
  name: string;
  iconUrl?: string;
  description?: string;
}

export interface INutritionalInfo {
  calories?: string;
  protein?: string;
  fats?: string;
  carbs?: string;
  dietaryFiber?: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  category: 'RAW' | 'FLAVORED';
  grade?: string;
  flavor?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  weightOptions: string[];
  images: string[];
  description?: string;
  shortDescription?: string;
  badgeText?: string;
  benefits?: string[];
  ingredients?: string[];
  nutritionalInfo?: INutritionalInfo;
  spiceBreakdown?: ISpiceBreakdown[];
  isAvailable: boolean;
  rating?: number;
  reviewsCount?: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, enum: ['RAW', 'FLAVORED'], required: true },
    grade: { type: String },
    flavor: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discountPercent: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 100 },
    lowStockThreshold: { type: Number, default: 15 },
    weightOptions: { type: [String], default: ['250g', '500g', '1kg'] },
    images: { type: [String], default: [] },
    description: { type: String },
    shortDescription: { type: String },
    badgeText: { type: String },
    benefits: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    nutritionalInfo: {
      calories: { type: String, default: '553 kcal / 100g' },
      protein: { type: String, default: '18.2g' },
      fats: { type: String, default: '43.8g' },
      carbs: { type: String, default: '30.1g' },
      dietaryFiber: { type: String, default: '3.3g' },
    },
    spiceBreakdown: [
      {
        name: { type: String, required: true },
        iconUrl: { type: String },
        description: { type: String },
      },
    ],
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 4.9 },
    reviewsCount: { type: Number, default: 28 },
    isBestseller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
