import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

const PRIMARY_SUPER_ADMINS = ['pa0174492@gmail.com', 'sahuravindra897@gmail.com'];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db && User) {
      // Auto-ensure default super admins exist in MongoDB
      for (const adminEmail of PRIMARY_SUPER_ADMINS) {
        const exists = await User.findOne({ email: adminEmail });
        if (!exists) {
          await User.create({
            firebaseUid: `admin_${adminEmail.split('@')[0]}`,
            email: adminEmail,
            displayName: adminEmail === 'sahuravindra897@gmail.com' ? 'Ravindra Sahu (Super Admin)' : 'PA Super Admin',
            role: 'super-admin',
            isActive: true,
          });
        }
      }

      const users = await User.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, users });
    }

    return NextResponse.json({
      success: true,
      users: [
        { _id: 'u1', firebaseUid: 'uid-pa', email: 'pa0174492@gmail.com', displayName: 'Super Admin PA', role: 'super-admin', isActive: true, createdAt: new Date().toISOString() },
        { _id: 'u2', firebaseUid: 'uid-ravindra', email: 'sahuravindra897@gmail.com', displayName: 'Ravindra Sahu', role: 'super-admin', isActive: true, createdAt: new Date().toISOString() },
      ],
    });
  } catch (error: any) {
    console.error('Error in admin users GET:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Grant Admin Access to an Email
export async function POST(request: Request) {
  try {
    const { email, displayName, role = 'admin' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const targetRole = PRIMARY_SUPER_ADMINS.includes(cleanEmail) ? 'super-admin' : role;

    const db = await connectToDatabase();
    if (!db || !User) {
      return NextResponse.json(
        { success: false, error: 'Database connection is not available.' },
        { status: 500 }
      );
    }

    // Check if user already exists
    const existing = await User.findOne({ email: cleanEmail });

    let updatedOrCreatedUser;
    if (existing) {
      existing.role = targetRole;
      if (displayName) existing.displayName = displayName;
      existing.isActive = true;
      updatedOrCreatedUser = await existing.save();
    } else {
      updatedOrCreatedUser = await User.create({
        firebaseUid: `grant_${Date.now()}_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
        email: cleanEmail,
        displayName: displayName || cleanEmail.split('@')[0],
        role: targetRole,
        isActive: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Admin access granted to ${cleanEmail} with role: ${targetRole}`,
      user: updatedOrCreatedUser,
    });
  } catch (error: any) {
    console.error('Error in admin users POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Update Role or Active Status
export async function PATCH(request: Request) {
  try {
    const { userId, role, isActive } = await request.json();
    const db = await connectToDatabase();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    if (db && User) {
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
      }

      // Protect root super admins from being demoted or deactivated
      const isPrimary = PRIMARY_SUPER_ADMINS.includes(targetUser.email.toLowerCase());
      if (isPrimary && (role === 'user' || isActive === false)) {
        return NextResponse.json(
          { success: false, error: 'Root Super Admin cannot be demoted or deactivated.' },
          { status: 403 }
        );
      }

      const updateFields: any = {};
      if (role !== undefined) updateFields.role = isPrimary ? 'super-admin' : role;
      if (isActive !== undefined) updateFields.isActive = isPrimary ? true : isActive;

      const updated = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
      return NextResponse.json({
        success: true,
        message: `Updated permissions for ${targetUser.email}`,
        user: updated,
      });
    }

    return NextResponse.json({ success: true, message: 'User role updated (Mock Mode)' });
  } catch (error: any) {
    console.error('Error in admin users PATCH:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Revoke Admin / Delete User
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db && User) {
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
      }

      // Protect root super admins
      if (PRIMARY_SUPER_ADMINS.includes(targetUser.email.toLowerCase())) {
        return NextResponse.json(
          { success: false, error: 'Root Super Admin account cannot be deleted.' },
          { status: 403 }
        );
      }

      await User.findByIdAndDelete(userId);
      return NextResponse.json({
        success: true,
        message: `User ${targetUser.email} has been removed.`,
      });
    }

    return NextResponse.json({ success: true, message: 'User deleted (Mock Mode)' });
  } catch (error: any) {
    console.error('Error in admin users DELETE:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

