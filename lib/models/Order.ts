import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ICustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  colony: string;
  city: string;
  pincode: string;
}

export interface IOrder extends Document {
  orderId: string;
  userId?: string;
  customerDetails: ICustomerDetails;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: 'UPI' | 'COD' | 'CARD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  fulfillmentStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  trackingNumber?: string;
  courierPartner?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String },
    customerDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String, required: true },
      colony: { type: String, required: true, default: 'Surya Nagar Colony' },
      city: { type: String, required: true, default: 'Hyderabad' },
      pincode: { type: String, required: true, default: '500039' },
    },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'COD', 'CARD', 'ONLINE'],
      default: 'ONLINE',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
      default: 'PENDING',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    trackingNumber: { type: String },
    courierPartner: { type: String },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
