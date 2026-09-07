import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Notification from '@/lib/models/Notification';
import { adminMessaging } from '@/lib/firebase-admin';
import { sendOrderConfirmationEmail, sendAdminOrderAlertEmail, SUPER_ADMIN_EMAILS } from '@/lib/email';
import mongoose from 'mongoose';

// In-memory fallback store if MongoDB Atlas is offline/unconfigured
const inMemoryOrders: any[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.toLowerCase().trim();
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'ADMIN'

    const db = await connectToDatabase();
    if (db && Order) {
      let query: any = {};

      // If requester is admin, return all orders
      if (role === 'ADMIN' || (email && SUPER_ADMIN_EMAILS.includes(email))) {
        query = {};
      } else if (email || userId) {
        // Filter strictly by the authenticated customer's email or user ID
        const orConditions: any[] = [];
        if (email) orConditions.push({ 'customerDetails.email': email });
        if (userId) orConditions.push({ userId });
        query = { $or: orConditions };
      } else {
        // If not authenticated and no user criteria provided, return empty array (no fake data)
        return NextResponse.json({ success: true, orders: [] });
      }

      const orders = await Order.find(query).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, orders });
    }

    // In-memory fallback (only return matching orders)
    let filtered: any[] = [];
    if (role === 'ADMIN' || (email && SUPER_ADMIN_EMAILS.includes(email))) {
      filtered = inMemoryOrders;
    } else if (email || userId) {
      filtered = inMemoryOrders.filter(
        o =>
          (email && o.customerDetails?.email?.toLowerCase().trim() === email) ||
          (userId && o.userId === userId)
      );
    }

    return NextResponse.json({
      success: true,
      orders: filtered,
      source: 'memory',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, orders: [], error: error.message });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerDetails,
      items,
      subtotal,
      discountAmount,
      additionalCharges,
      totalAmount,
      paymentMethod,
      paymentStatus,
      notes,
      whatsappUpdates,
      userId,
    } = body;

    // Generate custom shortcode orderId e.g. "SVT-8801"
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SVT-${randomCode}`;

    const initialTimeline = [
      {
        status: 'PENDING',
        title: 'Order Placed & Confirmed',
        description: 'Order received at SVT Uppal Roastery Counter and logged into system.',
        timestamp: new Date(),
        updatedBy: 'Customer / Online Store',
      },
    ];

    const newOrderData = {
      orderId,
      userId: userId || undefined,
      customerDetails: {
        name: customerDetails.name,
        phone: customerDetails.phone,
        email: customerDetails.email ? customerDetails.email.toLowerCase().trim() : '',
        address: customerDetails.address,
        colony: customerDetails.colony || 'Surya Nagar Colony',
        city: customerDetails.city || 'Hyderabad',
        pincode: customerDetails.pincode || '500039',
      },
      items,
      subtotal: subtotal || totalAmount,
      discountAmount: discountAmount || 0,
      additionalCharges: additionalCharges || [],
      totalAmount,
      paymentMethod: paymentMethod || 'ONLINE',
      paymentStatus: paymentStatus || (paymentMethod === 'COD' ? 'PENDING' : 'PAID'),
      fulfillmentStatus: 'PENDING',
      timeline: initialTimeline,
      whatsappUpdates: whatsappUpdates !== undefined ? whatsappUpdates : true,
      notes: notes || '',
      createdAt: new Date(),
    };

    let createdOrder: any = newOrderData;
    const db = await connectToDatabase();

    if (db && Order) {
      const doc = await Order.create(newOrderData);
      createdOrder = doc.toObject();
    } else {
      inMemoryOrders.unshift(newOrderData);
    }

    // ── 1. SEND ORDER CONFIRMATION EMAIL TO CUSTOMER ──
    try {
      if (customerDetails.email) {
        await sendOrderConfirmationEmail(createdOrder);
      }
    } catch (emailErr) {
      console.warn('Customer confirmation email failed:', emailErr);
    }

    // ── 2. SEND INSTANT EMAIL ALERT TO SUPER ADMIN & ADMINS ──
    try {
      await sendAdminOrderAlertEmail(createdOrder);
    } catch (adminEmailErr) {
      console.warn('Admin new order alert email failed:', adminEmailErr);
    }

    // ── 3. CREATE IN-APP NOTIFICATIONS IN DATABASE ──
    try {
      if (db && Notification) {
        // Notification for Admins
        await Notification.create({
          recipientType: 'ADMIN',
          orderId,
          type: 'ORDER_PLACED',
          title: `🔔 New Order Received: #${orderId}`,
          message: `${customerDetails.name} placed an order for ₹${totalAmount} (${paymentMethod || 'Online'}).`,
          link: `/admin/dashboard?orderId=${orderId}`,
          metadata: { totalAmount, itemsCount: items?.length, customerName: customerDetails.name },
        });

        // Notification for Customer
        if (customerDetails.email || userId) {
          await Notification.create({
            recipientType: 'USER',
            recipientEmail: customerDetails.email ? customerDetails.email.toLowerCase().trim() : undefined,
            userId: userId || undefined,
            orderId,
            type: 'ORDER_PLACED',
            title: `Order #${orderId} Placed Successfully!`,
            message: `Thank you for ordering with SVT. Your total is ₹${totalAmount}. We are sorting and preparing your fresh batch.`,
            link: `/dashboard?tab=track`,
            metadata: { orderId, totalAmount },
          });
        }
      }
    } catch (notifErr) {
      console.warn('In-app notification creation failed:', notifErr);
    }

    // ── 4. TRIGGER FCM PUSH NOTIFICATION TO ADMINS ──
    try {
      if (adminMessaging) {
        let tokens: string[] = [];
        if (db) {
          const adminTokensCol = mongoose.connection.collection('AdminTokens');
          const docs = await adminTokensCol.find({}).toArray();
          tokens = docs.map((d: any) => d.token).filter(Boolean);
        }

        if (tokens.length > 0) {
          await adminMessaging.sendEachForMulticast({
            tokens: tokens,
            notification: {
              title: '🔔 NEW ORDER RECEIVED!',
              body: `Order #${orderId} placed by ${customerDetails.name} for ₹${totalAmount}`,
            },
            data: {
              url: `/admin/dashboard?orderId=${orderId}`,
            },
          });
          console.log(`FCM push alert sent to ${tokens.length} admin devices for Order #${orderId}`);
        }
      }
    } catch (fcmErr) {
      console.warn('FCM push notification send skipped or failed:', fcmErr);
    }

    return NextResponse.json(
      {
        success: true,
        order: createdOrder,
        message: 'Order created successfully! Emails and notification dispatched.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
