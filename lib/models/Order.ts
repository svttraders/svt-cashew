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

export interface IAdditionalChargeItem {
  id: string;
  name: string;
  amount: number;
}

export interface ITimelineEvent {
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  title: string;
  description: string;
  timestamp: Date;
  courierPartner?: string;
  trackingNumber?: string;
  updatedBy?: string;
}

export interface IOrder extends Document {
  orderId: string;
  userId?: string;
  customerDetails: ICustomerDetails;
  items: IOrderItem[];
  subtotal?: number;
  discountAmount?: number;
  additionalCharges?: IAdditionalChargeItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  fulfillmentStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  timeline: ITimelineEvent[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  trackingNumber?: string;
  courierPartner?: string;
  whatsappUpdates?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema: Schema = new Schema<ITimelineEvent>(
  {
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    courierPartner: { type: String },
    trackingNumber: { type: String },
    updatedBy: { type: String, default: 'System / Roastery Admin' },
  },
  { _id: false }
);

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
    subtotal: { type: Number },
    discountAmount: { type: Number, default: 0 },
    additionalCharges: [
      {
        id: { type: String },
        name: { type: String },
        amount: { type: Number },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      default: 'ONLINE',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    timeline: {
      type: [TimelineEventSchema],
      default: () => [
        {
          status: 'PENDING',
          title: 'Order Placed Successfully',
          description: 'Order received at SVT Uppal Roastery Counter and logged into system.',
          timestamp: new Date(),
          updatedBy: 'Customer / Checkout Engine',
        },
      ],
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    trackingNumber: { type: String },
    courierPartner: { type: String },
    whatsappUpdates: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
