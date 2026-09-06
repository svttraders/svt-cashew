import { NextRequest, NextResponse } from 'next/server';

interface OtpEntry {
  otp: string;
  name: string;
  expiresAt: number;
}

declare global {
  var __svt_otp_cache: Map<string, OtpEntry> | undefined;
}

const otpCache = global.__svt_otp_cache || new Map<string, OtpEntry>();

export async function POST(req: NextRequest) {
  try {
    const { email, phone, otp } = await req.json();

    const targetIdentifier = (phone || email || '').toLowerCase().trim();

    if (!targetIdentifier || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone/Email and verification code are required.' },
        { status: 400 }
      );
    }

    const entry = otpCache.get(targetIdentifier);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'No verification code was requested, or it has expired.' },
        { status: 400 }
      );
    }

    if (Date.now() > entry.expiresAt) {
      otpCache.delete(targetIdentifier);
      return NextResponse.json(
        { success: false, error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    if (entry.otp.trim() !== otp.toString().trim()) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code. Please check and try again.' },
        { status: 400 }
      );
    }

    // Code matches! Clear entry and return verified
    otpCache.delete(targetIdentifier);

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Phone/Email successfully verified.',
    });
  } catch (error: any) {
    console.error('Error in verify-otp route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
