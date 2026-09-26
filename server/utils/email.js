const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const createTransporter = () => {
  // Option 1: Direct Gmail Service via GMAIL_USER & GMAIL_PASS / GMAIL_APP_PASSWORD
  if (process.env.GMAIL_USER && (process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD)) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  // Option 2: Standard SMTP (Resend, SendGrid, Mailtrap, custom SMTP)
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.resend.com';
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 465);
  const user = process.env.EMAIL_USERNAME || process.env.SMTP_USER || 'resend';
  const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

const getHtmlTemplate = (htmlContent) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 0; color: #0F172A; }
      .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
      .header { background: linear-gradient(135deg, #6558f5 0%, #4f46e5 100%); padding: 32px 36px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
      .content { padding: 36px; line-height: 1.6; font-size: 15px; color: #334155; }
      .footer { padding: 20px 36px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 13px; color: #64748B; }
      .disclaimer { font-size: 12px; color: #94A3B8; margin-top: 6px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Study Repository</h1>
      </div>
      <div class="content">
        ${htmlContent}
      </div>
      <div class="footer">
        <p style="margin: 0; font-weight: 500;">Academic Study Repository Platform</p>
        <p class="disclaimer">&copy; ${new Date().getFullYear()} Study Repository. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    const fromAddress = process.env.GMAIL_USER 
      ? `Study Repository <${process.env.GMAIL_USER}>`
      : (process.env.EMAIL_FROM || process.env.FROM_EMAIL || 'Study Repository <onboarding@resend.dev>');

    const mailOptions = {
      from: fromAddress,
      to: options.email,
      subject: options.subject,
      html: getHtmlTemplate(options.htmlContent)
    };

    await transporter.sendMail(mailOptions);
    logger.info(`✅ Successfully sent email to ${options.email}`);
  } catch (err) {
    logger.error('Failed to send email: ', err);
    throw err;
  }
};

module.exports = sendEmail;
