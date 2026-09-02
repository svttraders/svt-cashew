import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
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
  paymentMethod: 'UPI' | 'COD' | 'CARD';
  paymentStatus: 'PENDING' | 'PAID';
  fulfillmentStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  createdAt: Date;
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
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'COD', 'CARD'],
      default: 'UPI',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
