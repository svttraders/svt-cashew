import nodemailer from 'nodemailer';

interface SendOtpOptions {
  to: string;
  name?: string;
  otp: string;
}

export const SUPER_ADMIN_EMAILS = [
  'pa0174492@gmail.com',
  'sahuravindra897@gmail.com'
];

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '').trim() : undefined;

  if (!user || !pass) return null;

  const isGmail = host.includes('gmail.com') || (user && user.endsWith('@gmail.com'));
  return nodemailer.createTransport(
    isGmail
      ? {
          service: 'gmail',
          auth: { user, pass },
        }
      : {
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        }
  );
}

function getFromAddress() {
  const user = process.env.SMTP_USER?.trim();
  return process.env.SMTP_FROM || `"Sidhi Vinayaka Traders" <${user || 'orders@svtcashews.com'}>`;
}

// ── 1. SEND OTP EMAIL ──
export async function sendOtpEmail({ to, name = 'Valued Customer', otp }: SendOtpOptions): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const transporter = getTransporter();
  const from = getFromAddress();

  if (!transporter) {
    console.log(`\n========================================`);
    console.log(`[SVT EMAIL OTP DISPATCH SIMULATION]`);
    console.log(`To: ${to} (${name})`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Fill SMTP_USER and SMTP_PASS in .env.local to send live emails.`);
    console.log(`========================================\n`);
    return { success: true, simulated: true };
  }

  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070D18; color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background-color: #0B1323; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #101B30 0%, #070D18 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }
          .title { font-size: 24px; font-weight: 800; color: #D4AF37; margin: 0; letter-spacing: 0.5px; }
          .subtitle { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; }
          .content { padding: 36px 32px; text-align: center; }
          .greeting { font-size: 16px; color: #e2e8f0; margin-bottom: 16px; font-weight: 600; }
          .desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
          .otp-box { background: rgba(212, 175, 55, 0.08); border: 2px dashed #D4AF37; border-radius: 16px; padding: 20px 32px; display: inline-block; margin: 0 auto 28px auto; }
          .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #D4AF37; font-family: monospace; }
          .expiry { font-size: 12px; color: #e2e8f0; font-weight: 500; }
          .footer { padding: 24px; text-align: center; background-color: #070D18; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: #64748b; line-height: 1.5; }
          .address { color: #94a3b8; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">Sidhi Vinayaka Traders</h1>
            <div class="subtitle">Supreme Quality Cashews • Uppal, Hyderabad</div>
          </div>
          <div class="content">
            <div class="greeting">Namaste ${name},</div>
            <div class="desc">
              Please use the verification code below to verify your email address and activate your account.
            </div>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <div class="expiry">This verification code expires in <strong>10 minutes</strong>.</div>
          </div>
          <div class="footer">
            <p>If you did not request this verification code, please ignore this email.</p>
            <p class="address">1-53/6, Surya Nagar Colony, Uppal, Hyderabad - 500039 | +91 9515273464</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: `${otp} is your Sidhi Vinayaka Traders Verification Code`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.warn('[SVT Email Warning] Nodemailer sendOtpEmail failed:', err.message || err);
    return { success: false, error: 'Email service temporarily unavailable.' };
  }
}

// ── 2. SEND ORDER CONFIRMATION TO CUSTOMER ──
export async function sendOrderConfirmationEmail(order: any): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const transporter = getTransporter();
  const from = getFromAddress();
  const customerEmail = order.customerDetails?.email;

  if (!customerEmail) {
    return { success: false, error: 'No customer email provided for order confirmation.' };
  }

  const itemsHtml = (order.items || [])
    .map(
      (it: any) => `
      <tr style="border-bottom: 1px solid #1e293b;">
        <td style="padding: 12px 8px; font-weight: 600; color: #f8fafc; font-size: 14px;">
          ${it.title} <span style="color: #94a3b8; font-size: 12px;">(${it.size})</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #cbd5e1; font-size: 13px;">${it.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; color: #D4AF37; font-weight: 700; font-size: 14px;">₹${it.price * it.quantity}</td>
      </tr>
    `
    )
    .join('');

  const additionalChargesHtml = (order.additionalCharges || [])
    .map(
      (c: any) => `
      <tr>
        <td style="padding: 4px 8px; color: #94a3b8; font-size: 13px;">${c.name}</td>
        <td style="padding: 4px 8px; text-align: right; color: #cbd5e1; font-size: 13px;">+₹${c.amount}</td>
      </tr>
    `
    )
    .join('');

  const discountHtml =
    order.discountAmount && order.discountAmount > 0
      ? `<tr>
          <td style="padding: 4px 8px; color: #34d399; font-size: 13px;">Special Discount Applied</td>
          <td style="padding: 4px 8px; text-align: right; color: #34d399; font-weight: bold; font-size: 13px;">-₹${order.discountAmount}</td>
        </tr>`
      : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation #${order.orderId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070D18; color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background-color: #0B1323; border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.6); }
        .header { background: linear-gradient(135deg, #121E36 0%, #070D18 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid rgba(212, 175, 55, 0.3); }
        .logo-title { font-size: 24px; font-weight: 900; color: #D4AF37; margin: 0; letter-spacing: 0.5px; }
        .tagline { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; }
        .status-badge { display: inline-block; background: rgba(212, 175, 55, 0.15); border: 1px solid #D4AF37; color: #D4AF37; font-weight: 800; font-size: 12px; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; margin-top: 14px; letter-spacing: 1px; }
        .body-card { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
        .summary-text { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
        .order-info-box { background: #070D18; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; display: table; width: 100%; box-sizing: border-box; }
        .info-col { display: table-cell; width: 50%; vertical-align: top; }
        .info-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .info-value { font-size: 14px; color: #e2e8f0; font-weight: 700; margin-top: 4px; }
        .table-title { font-size: 14px; font-weight: 800; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .total-box { background: rgba(212, 175, 55, 0.08); border-top: 1px dashed rgba(212, 175, 55, 0.4); border-bottom: 1px dashed rgba(212, 175, 55, 0.4); padding: 14px 12px; margin-top: 12px; }
        .total-title { font-size: 16px; font-weight: 800; color: #ffffff; }
        .total-amount { font-size: 22px; font-weight: 900; color: #D4AF37; text-align: right; }
        .address-box { background: #070D18; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 18px 20px; margin-top: 24px; }
        .address-title { font-size: 12px; font-weight: 800; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .address-text { font-size: 13px; color: #cbd5e1; line-height: 1.5; }
        .btn-track { display: block; text-align: center; background: linear-gradient(135deg, #D4AF37 0%, #B48328 100%); color: #070D18 !important; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 12px; margin: 30px auto 10px auto; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4); }
        .footer { padding: 24px; text-align: center; background-color: #070D18; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 11px; color: #64748b; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-title">Sidhi Vinayaka Traders</h1>
          <div class="tagline">Supreme Quality Cashews • Direct Uppal Roastery</div>
          <div class="status-badge">✓ Order Placed & Confirmed</div>
        </div>
        <div class="body-card">
          <div class="greeting">Namaste ${order.customerDetails?.name || 'Valued Customer'},</div>
          <div class="summary-text">
            Thank you for ordering with Sidhi Vinayaka Traders. We have received your order <strong>#${order.orderId}</strong> and our roastery team in Uppal is preparing your fresh harvest cashews.
          </div>

          <div class="order-info-box">
            <div class="info-col">
              <div class="info-label">Order Number</div>
              <div class="info-value" style="color: #D4AF37; font-family: monospace;">#${order.orderId}</div>
            </div>
            <div class="info-col">
              <div class="info-label">Payment Method</div>
              <div class="info-value">${order.paymentMethod || 'Online UPI / Card'}</div>
            </div>
          </div>

          <div class="table-title">Ordered Cashew Specialties</div>
          <table>
            <thead>
              <tr style="border-bottom: 2px solid rgba(212, 175, 55, 0.3); text-align: left;">
                <th style="padding: 8px; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Product</th>
                <th style="padding: 8px; text-align: center; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Qty</th>
                <th style="padding: 8px; text-align: right; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table style="margin-top: 10px;">
            <tbody>
              <tr>
                <td style="padding: 4px 8px; color: #94a3b8; font-size: 13px;">Subtotal</td>
                <td style="padding: 4px 8px; text-align: right; color: #cbd5e1; font-size: 13px;">₹${order.subtotal || order.totalAmount}</td>
              </tr>
              ${additionalChargesHtml}
              ${discountHtml}
            </tbody>
          </table>

          <div class="total-box">
            <table style="margin: 0;">
              <tr>
                <td class="total-title">Total Final Amount</td>
                <td class="total-amount">₹${order.totalAmount}/-</td>
              </tr>
            </table>
          </div>

          <div class="address-box">
            <div class="address-title">📍 Dispatch & Delivery Destination</div>
            <div class="address-text">
              <strong>${order.customerDetails?.name}</strong> (${order.customerDetails?.phone})<br/>
              ${order.customerDetails?.address}, ${order.customerDetails?.colony || ''}<br/>
              ${order.customerDetails?.city || 'Hyderabad'}, Telangana - ${order.customerDetails?.pincode || '500039'}
            </div>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?tab=track" class="btn-track">
            Track Live Roastery Timeline →
          </a>
        </div>

        <div class="footer">
          <p style="margin: 0 0 6px 0; color: #94a3b8; font-weight: 600;">Sidhi Vinayaka Traders • 100% Supreme Quality Cashew Guarantee</p>
          <p style="margin: 0;">1-53/6, Surya Nagar Colony, Uppal, Hyderabad - 500039 | Helpline: +91 9515273464</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`\n========================================`);
    console.log(`[CUSTOMER ORDER CONFIRMATION EMAIL SIMULATION]`);
    console.log(`To: ${customerEmail}`);
    console.log(`Order ID: #${order.orderId}`);
    console.log(`Total: ₹${order.totalAmount}`);
    console.log(`Items: ${order.items?.length} SKUs`);
    console.log(`========================================\n`);
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from,
      to: customerEmail,
      subject: `Order Confirmed: #${order.orderId} — Sidhi Vinayaka Traders`,
      html: htmlContent,
    });
    return { success: true };
  } catch (err: any) {
    console.warn('[SVT Email Warning] Customer confirmation email error:', err.message || err);
    return { success: false, error: err.message };
  }
}

// ── 3. SEND INSTANT NEW ORDER ALERT TO SUPER ADMIN & ADMINS ──
export async function sendAdminOrderAlertEmail(order: any): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const transporter = getTransporter();
  const from = getFromAddress();

  const recipients = SUPER_ADMIN_EMAILS.join(', ');

  const itemsList = (order.items || [])
    .map(
      (it: any) => `
      <tr style="border-bottom: 1px solid #334155;">
        <td style="padding: 10px 8px; color: #f8fafc; font-weight: bold; font-size: 13px;">${it.title}</td>
        <td style="padding: 10px 8px; color: #cbd5e1; font-size: 13px;">${it.size}</td>
        <td style="padding: 10px 8px; text-align: center; color: #f8fafc; font-weight: bold;">${it.quantity}</td>
        <td style="padding: 10px 8px; text-align: right; color: #D4AF37; font-weight: bold;">₹${it.price * it.quantity}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>🔔 NEW ORDER ALERT: #${order.orderId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070D18; color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 620px; margin: 30px auto; background-color: #0B1323; border: 2px solid #D4AF37; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #78350f 0%, #1e1b4b 100%); padding: 28px 24px; text-align: center; border-bottom: 2px solid #D4AF37; }
        .title { font-size: 22px; font-weight: 900; color: #FDE68A; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .sub { font-size: 13px; color: #cbd5e1; margin-top: 4px; }
        .content { padding: 30px 24px; }
        .stat-grid { display: table; width: 100%; margin-bottom: 24px; }
        .stat-card { display: table-cell; width: 50%; padding: 14px; background: #070D18; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
        .stat-num { font-size: 22px; font-weight: 900; color: #D4AF37; }
        .stat-lbl { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-top: 4px; }
        .table-title { font-size: 13px; font-weight: 800; color: #D4AF37; text-transform: uppercase; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .customer-card { background: #070D18; border-left: 4px solid #D4AF37; padding: 16px 20px; border-radius: 0 12px 12px 0; margin-bottom: 24px; }
        .btn-admin { display: block; text-align: center; background: #D4AF37; color: #070D18 !important; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 20px; border-radius: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">🔔 INCOMING ORDER ALERT</h1>
          <div class="sub">Order #${order.orderId} • SVT Uppal Roastery</div>
        </div>
        <div class="content">
          <div class="stat-grid">
            <div class="stat-card" style="margin-right: 8px;">
              <div class="stat-num">₹${order.totalAmount}/-</div>
              <div class="stat-lbl">Order Value (${order.paymentMethod || 'Online'})</div>
            </div>
            <div class="stat-card" style="margin-left: 8px;">
              <div class="stat-num">${order.paymentStatus || 'PAID'}</div>
              <div class="stat-lbl">Payment Status</div>
            </div>
          </div>

          <div class="customer-card">
            <div style="font-size: 11px; font-weight: 800; color: #D4AF37; text-transform: uppercase; margin-bottom: 6px;">Customer Details</div>
            <div style="font-size: 15px; font-weight: bold; color: #ffffff;">${order.customerDetails?.name}</div>
            <div style="font-size: 13px; color: #cbd5e1; margin-top: 2px;">
              📞 <a href="tel:${order.customerDetails?.phone}" style="color: #60a5fa; text-decoration: none;">${order.customerDetails?.phone}</a>
              ${order.customerDetails?.email ? ` | ✉️ ${order.customerDetails?.email}` : ''}
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 6px; line-height: 1.4;">
              📍 ${order.customerDetails?.address}, ${order.customerDetails?.colony || ''}, ${order.customerDetails?.city || 'Hyderabad'} - ${order.customerDetails?.pincode || '500039'}
            </div>
            ${order.notes ? `<div style="margin-top: 8px; font-size: 12px; color: #f59e0b; font-style: italic;">Special Note: "${order.notes}"</div>` : ''}
          </div>

          <div class="table-title">Ordered Line Items</div>
          <table>
            <thead>
              <tr style="border-bottom: 2px solid #D4AF37; text-align: left;">
                <th style="padding: 8px; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Product</th>
                <th style="padding: 8px; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Size</th>
                <th style="padding: 8px; text-align: center; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Qty</th>
                <th style="padding: 8px; text-align: right; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard?orderId=${order.orderId}" class="btn-admin">
            Open Admin Suite & Fulfill Order →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`\n========================================`);
    console.log(`[SUPER ADMIN NEW ORDER ALERT SIMULATION]`);
    console.log(`To Admins: ${recipients}`);
    console.log(`Order ID: #${order.orderId}`);
    console.log(`Customer: ${order.customerDetails?.name} (${order.customerDetails?.phone})`);
    console.log(`Amount: ₹${order.totalAmount}`);
    console.log(`========================================\n`);
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from,
      to: recipients,
      subject: `🚨 [NEW ORDER] #${order.orderId} for ₹${order.totalAmount} by ${order.customerDetails?.name}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (err: any) {
    console.warn('[SVT Email Warning] Admin alert email error:', err.message || err);
    return { success: false, error: err.message };
  }
}

// ── 4. SEND ORDER STATUS UPDATE EMAIL TO CUSTOMER ──
export async function sendOrderStatusUpdateEmail(
  order: any,
  status: string,
  trackingNumber?: string,
  courierPartner?: string,
  note?: string
): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const transporter = getTransporter();
  const from = getFromAddress();
  const customerEmail = order.customerDetails?.email;

  if (!customerEmail) return { success: false, error: 'No customer email' };

  const STATUS_TITLES: Record<string, { title: string; subtitle: string; color: string }> = {
    CONFIRMED: { title: 'Order Confirmed & Queued for Roasting', subtitle: 'Your batch is being freshly weighed and sorted.', color: '#3b82f6' },
    PROCESSING: { title: 'Roasting & Packaging in Progress', subtitle: 'Freshly roasted at our Uppal Roastery facility.', color: '#f59e0b' },
    SHIPPED: { title: 'Consignment Dispatched / In Transit', subtitle: 'Your cashew package is on its way to your address.', color: '#6366f1' },
    DELIVERED: { title: 'Package Delivered Successfully', subtitle: 'Thank you for choosing Sidhi Vinayaka Traders!', color: '#10b981' },
    CANCELLED: { title: 'Order Cancelled', subtitle: 'Your order has been cancelled.', color: '#ef4444' },
  };

  const currentConfig = STATUS_TITLES[status] || {
    title: `Order Status Updated to ${status}`,
    subtitle: 'Track live milestone details on your dashboard.',
    color: '#D4AF37',
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Update on Order #${order.orderId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070D18; color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 30px auto; background-color: #0B1323; border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #101B30 0%, #070D18 100%); padding: 30px 24px; text-align: center; border-bottom: 2px solid ${currentConfig.color}; }
        .title { font-size: 22px; font-weight: 900; color: ${currentConfig.color}; margin: 0; }
        .subtitle { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; }
        .content { padding: 32px 28px; }
        .status-box { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 20px; margin-bottom: 24px; text-align: center; }
        .tracking-box { background: #070D18; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; }
        .btn-track { display: block; text-align: center; background: linear-gradient(135deg, #D4AF37 0%, #B48328 100%); color: #070D18 !important; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 24px; border-radius: 12px; margin-top: 24px; }
        .footer { padding: 20px; text-align: center; background-color: #070D18; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">${currentConfig.title}</h1>
          <div class="subtitle">Order #${order.orderId} • SVT Uppal Roastery</div>
        </div>
        <div class="content">
          <p style="font-size: 15px; color: #e2e8f0; font-weight: 600;">Namaste ${order.customerDetails?.name || 'Customer'},</p>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
            We wanted to let you know that your order <strong>#${order.orderId}</strong> has advanced to the next milestone in our fulfillment pipeline.
          </p>

          <div class="status-box">
            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Current Fulfillment Milestone</div>
            <div style="font-size: 18px; font-weight: 900; color: ${currentConfig.color}; margin-top: 6px;">${status}</div>
            <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">${currentConfig.subtitle}</div>
          </div>

          ${
            trackingNumber
              ? `
            <div class="tracking-box">
              <div style="font-size: 11px; font-weight: 800; color: #D4AF37; text-transform: uppercase; margin-bottom: 6px;">🚚 Courier Consignment Information</div>
              <div style="font-size: 13px; color: #e2e8f0;"><strong>Carrier:</strong> ${courierPartner || 'SVT Express Dispatch'}</div>
              <div style="font-size: 13px; color: #e2e8f0; margin-top: 2px;"><strong>Waybill / Tracking No:</strong> <span style="font-family: monospace; color: #D4AF37;">${trackingNumber}</span></div>
            </div>
          `
              : ''
          }

          ${
            note
              ? `
            <p style="font-size: 12px; color: #94a3b8; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border-left: 3px solid #D4AF37;">
              <strong>Note from Roastery Admin:</strong> ${note}
            </p>
          `
              : ''
          }

          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?tab=track" class="btn-track">
            View Live Milestone Timeline →
          </a>
        </div>
        <div class="footer">
          Sidhi Vinayaka Traders • 1-53/6, Surya Nagar Colony, Uppal, Hyderabad - 500039
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`\n========================================`);
    console.log(`[CUSTOMER ORDER STATUS UPDATE SIMULATION]`);
    console.log(`To: ${customerEmail}`);
    console.log(`Order: #${order.orderId}`);
    console.log(`New Status: ${status}`);
    console.log(`Tracking: ${trackingNumber || 'N/A'}`);
    console.log(`========================================\n`);
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from,
      to: customerEmail,
      subject: `Order #${order.orderId} Update: ${status} — Sidhi Vinayaka Traders`,
      html: htmlContent,
    });
    return { success: true };
  } catch (err: any) {
    console.warn('[SVT Email Warning] Status update email error:', err.message || err);
    return { success: false, error: err.message };
  }
}
