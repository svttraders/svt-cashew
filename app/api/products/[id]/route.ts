import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await connectToDatabase();

    if (db && Product) {
      let product = null;
      if (mongoose.isValidObjectId(id)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({ slug: id });
      }

      if (product) {
        return NextResponse.json({ success: true, product });
      }
    }

    const fallback = INITIAL_PRODUCTS.find(p => p._id === id || p.slug === id);
    if (fallback) {
      return NextResponse.json({ success: true, product: fallback, source: 'fallback' });
    }

    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();

    // Auto recalculate discount if price or originalPrice changed
    if (updates.originalPrice && updates.price && !updates.discountPercent) {
      if (Number(updates.originalPrice) > Number(updates.price)) {
        updates.discountPercent = Math.round(
          ((Number(updates.originalPrice) - Number(updates.price)) / Number(updates.originalPrice)) * 100
        );
      }
    }

    const db = await connectToDatabase();

    if (db && Product) {
      let updated = null;
      if (mongoose.isValidObjectId(id)) {
        updated = await Product.findByIdAndUpdate(id, { $set: updates }, { new: true });
      }
      if (!updated) {
        updated = await Product.findOneAndUpdate({ slug: id }, { $set: updates }, { new: true });
      }

      if (updated) {
        return NextResponse.json({
          success: true,
          product: updated,
          message: 'Product updated successfully in MongoDB Atlas',
        });
      }
    }

    return NextResponse.json({
      success: true,
      product: { _id: id, ...updates },
      message: 'Product updated (Mock Mode)',
    });
  } catch (error: any) {
    console.error('PATCH /api/products/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await connectToDatabase();

    if (db && Product) {
      if (mongoose.isValidObjectId(id)) {
        await Product.findByIdAndDelete(id);
      } else {
        await Product.findOneAndDelete({ slug: id });
      }

      return NextResponse.json({
        success: true,
        message: `Product ${id} deleted successfully.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Product ${id} removed (Mock Mode).`,
    });
  } catch (error: any) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
