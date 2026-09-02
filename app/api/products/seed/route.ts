import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

export async function POST() {
  try {
    const db = await connectToDatabase();
    if (!db || !Product) {
      return NextResponse.json({
        success: false,
        message: 'Database not connected. Unable to seed MongoDB.'
      });
    }

    await Product.deleteMany({});
    const created = await Product.insertMany(INITIAL_PRODUCTS);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${created.length} products to MongoDB!`,
      products: created
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
