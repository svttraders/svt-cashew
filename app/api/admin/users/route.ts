import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

const MOCK_USERS = [
  { _id: 'u1', firebaseUid: 'uid-pa', email: 'pa0174492@gmail.com', displayName: 'Super Admin PA', role: 'super-admin', isActive: true, createdAt: '2026-08-01' },
  { _id: 'u2', firebaseUid: 'uid-ravindra', email: 'sahuravindra897@gmail.com', displayName: 'Ravindra Sahu', role: 'super-admin', isActive: true, createdAt: '2026-08-01' },
  { _id: 'u3', firebaseUid: 'uid-kumar', email: 'akumar@gmail.com', displayName: 'A Kumar', role: 'user', isActive: true, createdAt: '2026-08-10' }
];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db && User) {
      const users = await User.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, users });
    }
    return NextResponse.json({ success: true, users: MOCK_USERS });
  } catch (error: any) {
    return NextResponse.json({ success: true, users: MOCK_USERS, error: error.message });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, role, isActive } = await request.json();
    const db = await connectToDatabase();

    if (db && User && userId) {
      const updated = await User.findByIdAndUpdate(
        userId,
        { $set: { role, isActive } },
        { new: true }
      );
      return NextResponse.json({ success: true, user: updated });
    }
    return NextResponse.json({ success: true, message: 'User role updated (Mock Mode)' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
