import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdditionalCharge {
  id: string;
  name: string;
  description?: string;
  amount: number;
  type: 'FLAT' | 'PERCENT';
  isOptional: boolean;
  defaultSelected: boolean;
  enabled: boolean;
}

export interface ICustomPaymentMethod {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  extraFee: number;
  enabled: boolean;
}

export interface IPaymentSettings extends Document {
  razorpay: {
    enabled: boolean;
    title: string;
    description: string;
    badge: string;
    discountPercent: number;
    minOrder: number;
  };
  cod: {
    enabled: boolean;
    title: string;
    description: string;
    extraFee: number;
    minOrder: number;
    maxOrder: number;
    allowedRegions: string;
  };
  directUpi: {
    enabled: boolean;
    title: string;
    description: string;
    upiId: string;
    payeeName: string;
    qrImageUrl?: string;
    discountPercent: number;
  };
  customMethods: ICustomPaymentMethod[];
  additionalCharges: IAdditionalCharge[];
  verificationSettings: {
    requireDoubleCheck: boolean;
    enableWhatsAppUpdates: boolean;
    allowCustomerNotes: boolean;
  };
  updatedAt: Date;
}

const AdditionalChargeSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true, default: 0 },
    type: { type: String, enum: ['FLAT', 'PERCENT'], default: 'FLAT' },
    isOptional: { type: Boolean, default: false },
    defaultSelected: { type: Boolean, default: true },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const CustomPaymentMethodSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    instructions: { type: String, default: '' },
    extraFee: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const PaymentSettingsSchema: Schema = new Schema<IPaymentSettings>(
  {
    razorpay: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Razorpay Online Gateway' },
      description: {
        type: String,
        default: 'UPI (Google Pay, PhonePe, Paytm), Cards, NetBanking & Wallets',
      },
      badge: { type: String, default: 'Instant & Secure' },
      discountPercent: { type: Number, default: 0 },
      minOrder: { type: Number, default: 0 },
    },
    cod: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Cash on Delivery (COD)' },
      description: {
        type: String,
        default: 'Pay in cash upon doorstep delivery in Hyderabad & Uppal region',
      },
      extraFee: { type: Number, default: 0 },
      minOrder: { type: Number, default: 0 },
      maxOrder: { type: Number, default: 20000 },
      allowedRegions: { type: String, default: 'Hyderabad, Uppal & All India' },
    },
    directUpi: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Direct UPI QR Scan & Pay' },
      description: {
        type: String,
        default: 'Scan QR code using any UPI App (GPay/PhonePe) for instant payment',
      },
      upiId: { type: String, default: '9515273464@ybl' },
      payeeName: { type: String, default: 'Sidhi Vinayaka Traders' },
      qrImageUrl: { type: String, default: '' },
      discountPercent: { type: Number, default: 0 },
    },
    customMethods: [CustomPaymentMethodSchema],
    additionalCharges: [AdditionalChargeSchema],
    verificationSettings: {
      requireDoubleCheck: { type: Boolean, default: true },
      enableWhatsAppUpdates: { type: Boolean, default: true },
      allowCustomerNotes: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const PaymentSettings: Model<IPaymentSettings> =
  mongoose.models.PaymentSettings ||
  mongoose.model<IPaymentSettings>('PaymentSettings', PaymentSettingsSchema);

export default PaymentSettings;
