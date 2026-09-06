import nodemailer from 'nodemailer';

interface SendOtpOptions {
  to: string;
  name?: string;
  otp: string;
}

export async function sendOtpEmail({ to, name = 'Valued Customer', otp }: SendOtpOptions): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  // Strip spaces if user pasted a 16-character Google App Password with spaces
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '').trim() : undefined;
  const from = process.env.SMTP_FROM || `"Sidhi Vinayaka Traders" <${user || 'noreply@svtcashews.com'}>`;

  // Graceful simulation if credentials are not yet configured in .env
  if (!user || !pass) {
    console.log(`\n========================================`);
    console.log(`[SVT EMAIL OTP DISPATCH SIMULATION]`);
    console.log(`To: ${to} (${name})`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Reason: SMTP_USER or SMTP_PASS not set in .env.local.`);
    console.log(`Fill SMTP_USER and SMTP_PASS in .env.local to send live emails.`);
    console.log(`========================================\n`);
    return { success: true, simulated: true };
  }

  try {
    const isGmail = host.includes('gmail.com') || (user && user.endsWith('@gmail.com'));
    const transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: {
              user,
              pass,
            },
          }
        : {
            host,
            port,
            secure: port === 465,
            auth: {
              user,
              pass,
            },
          }
    );

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
    return { success: false, error: 'Email service temporarily unavailable. Please try again.' };
  }
}
