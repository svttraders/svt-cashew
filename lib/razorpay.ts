import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export interface CreateOrderParams {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  keyId: string;
}

/**
 * Creates a Razorpay Order using REST API (works across all Next.js environments)
 */
export async function createRazorpayOrder({
  amountInRupees,
  receipt,
  notes = {},
}: CreateOrderParams): Promise<{ success: boolean; order?: RazorpayOrderResponse; error?: string }> {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return {
        success: false,
        error: 'Razorpay API credentials (KEY_ID or KEY_SECRET) are missing in environment variables.',
      };
    }

    const amountInPaise = Math.round(amountInRupees * 100);
    const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`;

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt.slice(0, 40), // Razorpay receipt max 40 chars
        notes: {
          store: 'Sidhi Vinayaka Traders',
          ...notes,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay Order API error:', data);
      return {
        success: false,
        error: data.error?.description || data.error?.message || 'Failed to create Razorpay order',
      };
    }

    return {
      success: true,
      order: {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt,
        status: data.status,
        keyId: RAZORPAY_KEY_ID,
      },
    };
  } catch (error: any) {
    console.error('createRazorpayOrder exception:', error);
    return {
      success: false,
      error: error.message || 'Internal server error while creating Razorpay order',
    };
  }
}

/**
 * Cryptographically verifies Razorpay Payment Signature
 */
export function verifyRazorpaySignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  if (!RAZORPAY_KEY_SECRET || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  try {
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generated_signature === razorpay_signature;
  } catch (err) {
    console.error('verifyRazorpaySignature error:', err);
    return false;
  }
}
