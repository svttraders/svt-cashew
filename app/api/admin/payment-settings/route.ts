import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PaymentSettings from '@/lib/models/PaymentSettings';

// In-memory default fallback
let inMemoryPaymentSettings = {
  razorpay: {
    enabled: true,
    title: 'Razorpay Online Gateway',
    description: 'UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, EMI & Wallets',
    badge: 'Recommended • Fast & Secure',
    discountPercent: 0,
    minOrder: 0,
  },
  cod: {
    enabled: true,
    title: 'Cash on Delivery (COD)',
    description: 'Pay in cash upon doorstep delivery in Hyderabad & Uppal region',
    extraFee: 0,
    minOrder: 0,
    maxOrder: 25000,
    allowedRegions: 'Hyderabad, Uppal & All India',
  },
  directUpi: {
    enabled: true,
    title: 'Direct UPI QR Scan & Pay',
    description: 'Scan SVT Official QR via PhonePe, GPay, Paytm or BHIM with instant zero-fee settlement',
    upiId: '9515273464@ybl',
    payeeName: 'Sidhi Vinayaka Traders',
    qrImageUrl: '',
    discountPercent: 0,
  },
  customMethods: [],
  additionalCharges: [
    {
      id: 'express_pack',
      name: 'Eco-Friendly Airtight Tin/Pouch Packaging',
      description: 'Zero-spill multi-layer food grade airtight sealing for lasting freshness',
      amount: 0,
      type: 'FLAT',
      isOptional: true,
      defaultSelected: true,
      enabled: true,
    },
  ],
  verificationSettings: {
    requireDoubleCheck: true,
    enableWhatsAppUpdates: true,
    allowCustomerNotes: true,
  },
  updatedAt: new Date(),
};

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db && PaymentSettings) {
      let settings = await PaymentSettings.findOne();
      if (!settings) {
        settings = await PaymentSettings.create(inMemoryPaymentSettings);
      }
      return NextResponse.json({ success: true, settings });
    }

    return NextResponse.json({
      success: true,
      settings: inMemoryPaymentSettings,
      source: 'memory',
    });
  } catch (error: any) {
    console.error('GET /api/admin/payment-settings error:', error);
    return NextResponse.json({
      success: true,
      settings: inMemoryPaymentSettings,
      error: error.message,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    inMemoryPaymentSettings = {
      ...inMemoryPaymentSettings,
      ...body,
      updatedAt: new Date(),
    };

    const db = await connectToDatabase();
    if (db && PaymentSettings) {
      const updated = await PaymentSettings.findOneAndUpdate(
        {},
        { $set: inMemoryPaymentSettings },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return NextResponse.json({
        success: true,
        settings: updated,
        message: 'Payment settings and additional charges updated successfully!',
      });
    }

    return NextResponse.json({
      success: true,
      settings: inMemoryPaymentSettings,
      message: 'Payment settings saved to active memory!',
    });
  } catch (error: any) {
    console.error('PUT /api/admin/payment-settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update payment settings' },
      { status: 500 }
    );
  }
}
