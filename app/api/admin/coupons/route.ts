import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/lib/models/Coupon';

const MOCK_COUPONS = [
  { _id: 'c1', code: 'WELCOME10', discountPercent: 10, minOrderAmount: 500, maxDiscount: 200, isActive: true, usageCount: 45 },
  { _id: 'c2', code: 'SVTDIWALI', discountPercent: 15, minOrderAmount: 1000, maxDiscount: 500, isActive: true, usageCount: 88 },
  { _id: 'c3', code: 'JUMBO20', discountPercent: 20, minOrderAmount: 2000, maxDiscount: 800, isActive: false, usageCount: 12 }
];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db && Coupon) {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, coupons });
    }
    return NextResponse.json({ success: true, coupons: MOCK_COUPONS });
  } catch (error: any) {
    return NextResponse.json({ success: true, coupons: MOCK_COUPONS, error: error.message });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    if (db && Coupon) {
      const coupon = await Coupon.create(body);
      return NextResponse.json({ success: true, coupon }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      coupon: { ...body, _id: `c-${Date.now()}`, usageCount: 0 },
      message: 'Created (Mock Mode)'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await connectToDatabase();

    if (db && Coupon && id) {
      await Coupon.findByIdAndDelete(id);
    }
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
