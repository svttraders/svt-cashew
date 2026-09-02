import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const { token, device } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'FCM Token is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      const adminTokensCol = mongoose.connection.collection('AdminTokens');
      await adminTokensCol.updateOne(
        { token },
        { $set: { token, device, updatedAt: new Date() } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, message: 'FCM Token stored successfully in MongoDB' });
    }

    return NextResponse.json({
      success: true,
      message: 'FCM Token received (Fallback mode)',
      token,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
