import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  name: string;
  email: string;
  phone?: string;
  type: 'REVIEW' | 'COMPLAINT' | 'INQUIRY';
  subject?: string;
  message: string;
  rating?: number; // 1-5
  status: 'PENDING' | 'RESOLVED' | 'ARCHIVED';
  adminResponse?: string;
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema<IFeedback>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    type: { type: String, enum: ['REVIEW', 'COMPLAINT', 'INQUIRY'], default: 'INQUIRY' },
    subject: { type: String },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    status: { type: String, enum: ['PENDING', 'RESOLVED', 'ARCHIVED'], default: 'PENDING' },
    adminResponse: { type: String },
  },
  { timestamps: true }
);

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;
