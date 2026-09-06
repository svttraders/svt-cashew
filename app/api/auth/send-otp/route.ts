import { NextRequest, NextResponse } from 'next/server';
import { sendOtpEmail } from '@/lib/email';
import crypto from 'crypto';

interface OtpEntry {
  otp: string;
  name: string;
  expiresAt: number;
}

declare global {
  var __svt_otp_cache: Map<string, OtpEntry> | undefined;
}

const otpCache = global.__svt_otp_cache || new Map<string, OtpEntry>();
if (!global.__svt_otp_cache) {
  global.__svt_otp_cache = otpCache;
}

export async function POST(req: NextRequest) {
  try {
    const { email, phone, name } = await req.json();

    const targetIdentifier = (phone || email || '').toLowerCase().trim();

    if (!targetIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid phone number or email address.' },
        { status: 400 }
      );
    }

    // Generate cryptographically secure 6-digit numeric OTP
    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpCache.set(targetIdentifier, {
      otp,
      name: name || 'Customer',
      expiresAt,
    });

    console.log(`[SVT OTP] Generated code for ${targetIdentifier}: ${otp}`);

    // If an email is provided, send email OTP
    let emailResult: { success: boolean; error?: string; simulated?: boolean } = { success: true };
    if (email && email.includes('@')) {
      emailResult = await sendOtpEmail({
        to: email.toLowerCase().trim(),
        name: name || 'Customer',
        otp,
      });

      if (!emailResult.success) {
        console.warn(`[SVT OTP Notice] Email dispatch was not completed (${emailResult.error}). Cached code for verification.`);
      }
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      emailError: emailResult.error || null,
      message: emailResult.success
        ? `Verification code delivered to ${targetIdentifier}`
        : `Email delivery pending: ${emailResult.error || 'Check SMTP configuration'}`,
    });
  } catch (error: any) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
