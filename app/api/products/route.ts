import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const db = await connectToDatabase();

    if (db && Product) {
      const query = category ? { category: category.toUpperCase() } : {};
      const products = await Product.find(query).sort({ createdAt: -1 });

      if (products && products.length > 0) {
        return NextResponse.json({ success: true, products });
      }
    }

    // Fallback mock filtering
    let filtered = INITIAL_PRODUCTS;
    if (category) {
      filtered = INITIAL_PRODUCTS.filter(p => p.category === category.toUpperCase());
    }

    return NextResponse.json({
      success: true,
      products: filtered,
      source: 'fallback'
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, products: INITIAL_PRODUCTS, error: error.message },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    if (db && Product) {
      const newProduct = await Product.create(body);
      return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      product: { ...body, _id: `prod-${Date.now()}` },
      message: 'Product created (Mock Mode)'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
