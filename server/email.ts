
import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('Warning: SENDGRID_API_KEY not set. Email functionality will not work.');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'your-verified-sender@example.com',
      subject,
      html,
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  const html = `
    <h1>Password Reset Request</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  
  return sendEmail(email, 'Password Reset Request', html);
};
