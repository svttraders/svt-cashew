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
    const isPrimarySuperAdmin = cleanEmail === 'pa0174492@gmail.com' || cleanEmail === 'sahuravindra897@gmail.com';

    const db = await connectToDatabase();
    if (!db || !User) {
      return NextResponse.json({
        success: true,
        user: { uid, email, displayName, role: isPrimarySuperAdmin ? 'super-admin' : 'user', isActive: true },
        message: 'Mock sync (Database connection unavailable)',
      });
    }

    // Check if user already exists in DB by firebaseUid OR email
    const existingUser = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: cleanEmail }],
    });

    let assignedRole: 'super-admin' | 'admin' | 'user' = 'user';
    if (isPrimarySuperAdmin) {
      assignedRole = 'super-admin';
    } else if (existingUser && (existingUser.role === 'admin' || existingUser.role === 'super-admin')) {
      assignedRole = existingUser.role;
    }

    const userDoc = await User.findOneAndUpdate(
      { $or: [{ firebaseUid: uid }, { email: cleanEmail }] },
      {
        $set: {
          firebaseUid: uid,
          email: cleanEmail,
          displayName: displayName || existingUser?.displayName || cleanEmail.split('@')[0],
          photoURL: photoURL || existingUser?.photoURL || '',
          role: assignedRole,
          isActive: existingUser ? existingUser.isActive : true,
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
