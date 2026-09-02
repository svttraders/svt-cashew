import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { adminMessaging } from '@/lib/firebase-admin';
import mongoose from 'mongoose';

// In-memory store for orders if MongoDB Atlas is offline/unconfigured
const inMemoryOrders: any[] = [];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db && Order) {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, orders });
    }

    return NextResponse.json({
      success: true,
      orders: inMemoryOrders,
      source: 'memory'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, orders: inMemoryOrders, error: error.message });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerDetails, items, totalAmount, paymentMethod } = body;

    // Generate custom shortcode orderId e.g. "SVT-8801"
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SVT-${randomCode}`;

    const newOrderData = {
      orderId,
      customerDetails: {
        name: customerDetails.name,
        phone: customerDetails.phone,
        email: customerDetails.email || '',
        address: customerDetails.address,
        colony: customerDetails.colony || 'Surya Nagar Colony',
        city: customerDetails.city || 'Hyderabad',
        pincode: customerDetails.pincode || '500039',
      },
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: paymentMethod === 'UPI' ? 'PENDING' : 'PENDING',
      fulfillmentStatus: 'PENDING',
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

    // Trigger FCM Notification to registered Admin device tokens
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
              title: "🔔 NEW ORDER RECEIVED!",
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
      console.warn("FCM push notification send skipped or failed:", fcmErr);
    }

    return NextResponse.json(
      {
        success: true,
        order: createdOrder,
        message: 'Order created successfully!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
