import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const { uid, email, displayName, photoURL } = await request.json();

    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: 'User UID and Email are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    // Designate pa0174492@gmail.com and sahuravindra897@gmail.com as super-admins
    const isSuperAdmin = cleanEmail === 'pa0174492@gmail.com' || cleanEmail === 'sahuravindra897@gmail.com';
    const role = isSuperAdmin ? 'super-admin' : 'user';

    const db = await connectToDatabase();
    if (!db || !User) {
      return NextResponse.json({
        success: true,
        user: { uid, email, displayName, role, isActive: true },
        message: 'Mock sync (Database connection unavailable)',
      });
    }

    const userDoc = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $set: {
          email,
          displayName: displayName || email.split('@')[0],
          photoURL: photoURL || '',
          role,
          isActive: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      user: userDoc,
    });
  } catch (error: any) {
    console.error('User sync API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error syncing user' },
      { status: 500 }
    );
  }
}
