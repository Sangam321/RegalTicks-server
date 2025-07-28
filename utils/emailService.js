import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify connection
transporter.verify((error) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

// Send OTP email function
export const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Regal Ticks" <${process.env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Your Regal Ticks Login OTP',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your One-Time Password</h2>
          <p style="font-size: 16px;">Use the following code to login:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #2c3e50; letter-spacing: 3px;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This code is valid for 10 minutes.</p>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

// For testing purposes
export default transporter;