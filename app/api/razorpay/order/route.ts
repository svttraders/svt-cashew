import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, receipt, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order amount' },
        { status: 400 }
      );
    }

    const orderReceipt = receipt || `RCPT_${Date.now()}`;
    const result = await createRazorpayOrder({
      amountInRupees: Number(amount),
      receipt: orderReceipt,
      notes: notes || {},
    });

    if (!result.success || !result.order) {
      return NextResponse.json(
        { success: false, error: result.error || 'Could not initiate Razorpay order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      keyId: result.order.keyId,
    });
  } catch (error: any) {
    console.error('POST /api/razorpay/order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
