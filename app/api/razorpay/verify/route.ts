import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { adminMessaging } from '@/lib/firebase-admin';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing Razorpay verification parameters' },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      console.error('Razorpay signature verification failed for order:', orderId);
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // Connect to database and update order status
    let updatedOrder: any = null;
    const db = await connectToDatabase();

    if (db && Order) {
      // Find by custom orderId (e.g. SVT-8801) or by razorpayOrderId
      updatedOrder = await Order.findOneAndUpdate(
        {
          $or: [
            { orderId: orderId },
            { razorpayOrderId: razorpay_order_id },
            { _id: mongoose.isValidObjectId(orderId) ? orderId : null },
          ].filter(Boolean),
        },
        {
          $set: {
            paymentStatus: 'PAID',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            fulfillmentStatus: 'PROCESSING',
          },
        },
        { new: true }
      );
    }

    // Trigger FCM push notification to Admin devices
    try {
      if (adminMessaging) {
        let tokens: string[] = [];
        if (db) {
          const adminTokensCol = mongoose.connection.collection('AdminTokens');
          const docs = await adminTokensCol.find({}).toArray();
          tokens = docs.map((d: any) => d.token).filter(Boolean);
        }

        if (tokens.length > 0) {
          const customerName = updatedOrder?.customerDetails?.name || 'Customer';
          const amount = updatedOrder?.totalAmount || '';
          await adminMessaging.sendEachForMulticast({
            tokens: tokens,
            notification: {
              title: "💰 PAYMENT CONFIRMED (Razorpay)!",
              body: `Order #${orderId} paid successfully by ${customerName} (₹${amount})`,
            },
            data: {
              url: `/admin/dashboard?orderId=${orderId}`,
            },
          });
        }
      }
    } catch (fcmErr) {
      console.warn('FCM alert on payment verification skipped:', fcmErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order marked as PAID.',
      order: updatedOrder || { orderId, paymentStatus: 'PAID', razorpayPaymentId: razorpay_payment_id },
    });
  } catch (error: any) {
    console.error('POST /api/razorpay/verify error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
