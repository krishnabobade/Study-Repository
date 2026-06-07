const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.resend.com',
  port: process.env.EMAIL_PORT || process.env.SMTP_PORT || 465,
  secure: Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 465) === 465,
  auth: {
    user: process.env.EMAIL_USERNAME || process.env.SMTP_USER || 'resend',
    pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || 'YOUR_API_KEY'
  }
});

const getHtmlTemplate = (htmlContent) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Inter', -apple-system, sans-serif; background-color: #F8FAFC; margin: 0; padding: 0; color: #0F172A; }
      .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); border: 1px solid #E2E8F0; }
      .header { background: #6558f5; padding: 32px 40px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
      .content { padding: 40px; line-height: 1.6; font-size: 16px; color: #334155; }
      .content h2 { color: #0F172A; font-size: 20px; font-weight: 600; margin-top: 0; }
      .btn { display: inline-block; padding: 14px 28px; background-color: #6558f5; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; text-align: center; }
      .footer { padding: 24px 40px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 13px; color: #64748B; }
      .disclaimer { font-size: 12px; color: #94A3B8; margin-top: 16px; }
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
        <p>You received this email because you're a member of Study Repository.</p>
        <p class="disclaimer">&copy; ${new Date().getFullYear()} Academic Portal Platform. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.FROM_EMAIL || 'Study Repository Support <onboarding@resend.dev>',
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
