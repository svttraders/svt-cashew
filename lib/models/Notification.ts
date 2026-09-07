import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  recipientType: 'ADMIN' | 'USER' | 'ALL';
  recipientEmail?: string;
  userId?: string;
  orderId?: string;
  type: 'ORDER_PLACED' | 'ORDER_STATUS' | 'PAYMENT' | 'DELIVERY' | 'GENERAL';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    recipientType: {
      type: String,
      enum: ['ADMIN', 'USER', 'ALL'],
      default: 'USER',
      required: true,
    },
    recipientEmail: { type: String, lowercase: true, trim: true },
    userId: { type: String },
    orderId: { type: String },
    type: {
      type: String,
      enum: ['ORDER_PLACED', 'ORDER_STATUS', 'PAYMENT', 'DELIVERY', 'GENERAL'],
      default: 'ORDER_STATUS',
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
