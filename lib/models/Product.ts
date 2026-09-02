import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISpiceBreakdown {
  name: string;
  iconUrl?: string;
  description?: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  category: 'RAW' | 'FLAVORED';
  grade?: string;
  flavor?: string;
  price: number;
  originalPrice?: number;
  weightOptions: string[];
  images: string[];
  description?: string;
  spiceBreakdown?: ISpiceBreakdown[];
  isAvailable: boolean;
  rating?: number;
  reviewsCount?: number;
  isBestseller?: boolean;
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
    weightOptions: { type: [String], default: ['500g', '1kg'] },
    images: { type: [String], default: [] },
    description: { type: String },
    spiceBreakdown: [
      {
        name: { type: String, required: true },
        iconUrl: { type: String },
        description: { type: String },
      },
    ],
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 25 },
    isBestseller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
