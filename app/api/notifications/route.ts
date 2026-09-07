import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Notification from '@/lib/models/Notification';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'ADMIN' or 'USER'
    const email = searchParams.get('email')?.toLowerCase().trim();
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const db = await connectToDatabase();
    if (!db || !Notification) {
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0 });
    }

    const query: any = {};

    if (role === 'ADMIN') {
      // Admins see notifications targeted to ADMIN or ALL, or their specific email
      query.$or = [
        { recipientType: 'ADMIN' },
        { recipientType: 'ALL' },
        ...(email ? [{ recipientEmail: email }] : []),
      ];
    } else {
      // Normal users see their own notifications or broadcasts
      const userConditions: any[] = [{ recipientType: 'ALL' }];
      if (email) userConditions.push({ recipientEmail: email });
      if (userId) userConditions.push({ userId });
      query.$or = userConditions;
    }

    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...query,
      read: false,
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { notificationId, markAllRead, email, role } = body;

    const db = await connectToDatabase();
    if (!db || !Notification) {
      return NextResponse.json({ success: true, message: 'Updated' });
    }

    if (markAllRead) {
      const query: any = { read: false };
      if (role === 'ADMIN') {
        query.$or = [
          { recipientType: 'ADMIN' },
          { recipientType: 'ALL' },
          ...(email ? [{ recipientEmail: email.toLowerCase().trim() }] : []),
        ];
      } else if (email) {
        query.$or = [
          { recipientEmail: email.toLowerCase().trim() },
          { recipientType: 'ALL' },
        ];
      }

      await Notification.updateMany(query, { $set: { read: true } });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      const updated = await Notification.findByIdAndUpdate(
        notificationId,
        { $set: { read: true } },
        { new: true }
      );
      return NextResponse.json({ success: true, notification: updated });
    }

    return NextResponse.json(
      { success: false, error: 'Missing notificationId or markAllRead' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('PATCH /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recipientType = 'USER',
      recipientEmail,
      userId,
      orderId,
      type = 'GENERAL',
      title,
      message,
      link,
      metadata,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (db && Notification) {
      const doc = await Notification.create({
        recipientType,
        recipientEmail: recipientEmail ? recipientEmail.toLowerCase().trim() : undefined,
        userId,
        orderId,
        type,
        title,
        message,
        link,
        metadata,
        read: false,
      });

      return NextResponse.json({ success: true, notification: doc }, { status: 201 });
    }

    return NextResponse.json({ success: true, message: 'Notification logged' });
  } catch (error: any) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}
