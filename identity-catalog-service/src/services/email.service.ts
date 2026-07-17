import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendOtpEmail(to: string, otp: string, purpose: 'signup' | 'forgotPassword'): Promise<void> {
  const subject = purpose === 'signup' 
    ? 'Verify your Fashion Store account' 
    : 'Reset your Fashion Store password';

  const title = purpose === 'signup'
    ? 'Welcome to Fashion Store!'
    : 'Password Reset Request';

  const actionText = purpose === 'signup'
    ? 'To complete your registration, please use the following One-Time Password (OTP):'
    : 'We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:';

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #3E1F0F; text-align: center; font-size: 24px;">${title}</h2>
      <p style="color: #333333; font-size: 16px; line-height: 1.5;">Hello,</p>
      <p style="color: #333333; font-size: 16px; line-height: 1.5;">${actionText}</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #B58463; padding: 12px 24px; background-color: #f8f8f8; border-radius: 8px; border: 2px dashed #B58463;">
          ${otp}
        </span>
      </div>
      
      <p style="color: #666666; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
      <p style="color: #666666; font-size: 14px; text-align: center;">If you didn't request this email, you can safely ignore it.</p>
      
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0;" />
      <p style="color: #999999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Fashion Store. All rights reserved.</p>
    </div>
  `;

  await resend.emails.send({
    from: env.RESEND_FROM, // uses custom domain if set, defaults to onboarding@resend.dev
    to,
    subject,
    html,
  });
}
