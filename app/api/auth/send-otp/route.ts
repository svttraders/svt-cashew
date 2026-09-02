import { NextRequest, NextResponse } from 'next/server';
import { sendOtpEmail } from '@/lib/email';
import crypto from 'crypto';

// In-memory OTP storage with 10-minute TTL (survives requests and works in dev/prod)
interface OtpEntry {
  otp: string;
  name: string;
  expiresAt: number;
}

// Global cache declaration to prevent hot-reload wipes
declare global {
  var __svt_otp_cache: Map<string, OtpEntry> | undefined;
}

const otpCache = global.__svt_otp_cache || new Map<string, OtpEntry>();
if (!global.__svt_otp_cache) {
  global.__svt_otp_cache = otpCache;
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate cryptographically secure 6-digit numeric OTP
    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpCache.set(normalizedEmail, {
      otp,
      name: name || 'Customer',
      expiresAt,
    });

    const emailResult = await sendOtpEmail({
      to: normalizedEmail,
      name: name || 'Customer',
      otp,
    });

    return NextResponse.json({
      success: true,
      message: emailResult.simulated
        ? `Verification code simulated for ${normalizedEmail}. (Check server console or use ${otp})`
        : `Verification code sent to ${normalizedEmail}`,
      simulated: emailResult.simulated || false,
      // Provide simulated OTP in response only if SMTP is not configured yet, for effortless testing
      devOtp: emailResult.simulated ? otp : undefined,
    });
  } catch (error: any) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
