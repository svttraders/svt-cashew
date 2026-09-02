import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/lib/models/Feedback';

const MOCK_FEEDBACK = [
  { _id: 'f1', name: 'Ravindra Sahu', email: 'sahuravindra897@gmail.com', phone: '+91 9515273464', type: 'REVIEW', message: 'The W180 King Jumbo cashews are huge and crunchy! Peri Peri flavour is spicy and delicious.', rating: 5, status: 'RESOLVED', createdAt: '2026-08-20' },
  { _id: 'f2', name: 'Ketan Kumar', email: 'ketan@gmail.com', phone: '+91 8919620379', type: 'INQUIRY', subject: 'Bulk Wedding Order', message: 'Interested in ordering 50kg W180 cashews for wedding gifting counter in Uppal.', rating: 5, status: 'PENDING', createdAt: '2026-08-22' },
  { _id: 'f3', name: 'Priya Sharma', email: 'priya@gmail.com', type: 'COMPLAINT', subject: 'Delivery Time', message: 'Wanted delivery by 4 PM yesterday. Please update tracking number.', status: 'PENDING', createdAt: '2026-08-22' }
];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db && Feedback) {
      const feedback = await Feedback.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, feedback });
    }
    return NextResponse.json({ success: true, feedback: MOCK_FEEDBACK });
  } catch (error: any) {
    return NextResponse.json({ success: true, feedback: MOCK_FEEDBACK, error: error.message });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    if (db && Feedback) {
      const item = await Feedback.create(body);
      return NextResponse.json({ success: true, feedback: item }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      feedback: { ...body, _id: `f-${Date.now()}`, status: 'PENDING', createdAt: new Date().toISOString() },
      message: 'Feedback submitted (Mock Mode)'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, adminResponse } = await request.json();
    const db = await connectToDatabase();

    if (db && Feedback && id) {
      const updated = await Feedback.findByIdAndUpdate(
        id,
        { $set: { status, adminResponse } },
        { new: true }
      );
      return NextResponse.json({ success: true, feedback: updated });
    }
    return NextResponse.json({ success: true, message: 'Status updated (Mock Mode)' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
