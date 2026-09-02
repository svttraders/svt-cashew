import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { fulfillmentStatus, paymentStatus } = body;

    const db = await connectToDatabase();
    if (db && Order) {
      const updated = await Order.findOneAndUpdate(
        { $or: [{ _id: id }, { orderId: id }] },
        {
          ...(fulfillmentStatus && { fulfillmentStatus }),
          ...(paymentStatus && { paymentStatus }),
        },
        { new: true }
      );

      if (updated) {
        return NextResponse.json({ success: true, order: updated });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated (Mock mode)',
      orderId: id,
      fulfillmentStatus,
      paymentStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
