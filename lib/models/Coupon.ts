import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string; // e.g. "WELCOME10", "SVTDIWALI"
  discountPercent: number; // e.g. 10 for 10%
  maxDiscount?: number;
  minOrderAmount?: number;
  expiresAt?: Date;
  isActive: boolean;
  usageCount: number;
}

const CouponSchema: Schema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    maxDiscount: { type: Number, default: 500 },
    minOrderAmount: { type: Number, default: 500 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;
