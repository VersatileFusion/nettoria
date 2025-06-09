const nodemailer = require('nodemailer');
const { ApiError } = require('./error.middleware');
const logger = require('../utils/logger');

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Email templates
const emailTemplates = {
    welcome: (name) => ({
        subject: 'خوش آمدید به نتوریا',
        html: `
            <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif;">
                <h2>سلام ${name} عزیز</h2>
                <p>به نتوریا خوش آمدید!</p>
                <p>حساب کاربری شما با موفقیت ایجاد شد.</p>
                <p>برای شروع، لطفا ایمیل خود را تایید کنید.</p>
                <a href="${process.env.FRONTEND_URL}/verify-email" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                ">تایید ایمیل</a>
            </div>
        `
    }),

    passwordReset: (name, token) => ({
        subject: 'بازنشانی رمز عبور',
        html: `
            <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif;">
                <h2>سلام ${name} عزیز</h2>
                <p>درخواست بازنشانی رمز عبور برای حساب کاربری شما دریافت شد.</p>
                <p>برای بازنشانی رمز عبور، روی لینک زیر کلیک کنید:</p>
                <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                ">بازنشانی رمز عبور</a>
                <p>این لینک تا 1 ساعت معتبر است.</p>
            </div>
        `
    }),

    orderConfirmation: (name, orderId) => ({
        subject: 'تایید سفارش',
        html: `
            <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif;">
                <h2>سلام ${name} عزیز</h2>
                <p>سفارش شما با موفقیت ثبت شد.</p>
                <p>شماره سفارش: ${orderId}</p>
                <p>برای مشاهده جزئیات سفارش، روی لینک زیر کلیک کنید:</p>
                <a href="${process.env.FRONTEND_URL}/orders/${orderId}" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                ">مشاهده سفارش</a>
            </div>
        `
    })
};

// Send email notification
const sendEmail = async (to, template, data) => {
    try {
        const { subject, html } = emailTemplates[template](data);
        
        await transporter.sendMail({
            from: `"نتوریا" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });

        logger.info('Email sent successfully:', { to, template });
    } catch (error) {
        logger.error('Email sending failed:', error);
        throw new ApiError('خطا در ارسال ایمیل', 500);
    }
};

// Send SMS notification
const sendSMS = async (to, message) => {
    try {
        // Implement SMS sending logic here
        // This is a placeholder for the actual SMS service integration
        logger.info('SMS sent successfully:', { to });
    } catch (error) {
        logger.error('SMS sending failed:', error);
        throw new ApiError('خطا در ارسال پیامک', 500);
    }
};

// Notification middleware
const notificationMiddleware = {
    // Send welcome email
    sendWelcomeEmail: async (req, res, next) => {
        try {
            const { email, firstName } = req.user;
            await sendEmail(email, 'welcome', firstName);
            next();
        } catch (error) {
            next(error);
        }
    },

    // Send password reset email
    sendPasswordResetEmail: async (req, res, next) => {
        try {
            const { email, firstName, resetToken } = req.user;
            await sendEmail(email, 'passwordReset', { name: firstName, token: resetToken });
            next();
        } catch (error) {
            next(error);
        }
    },

    // Send order confirmation email
    sendOrderConfirmationEmail: async (req, res, next) => {
        try {
            const { email, firstName } = req.user;
            const { orderId } = req.body;
            await sendEmail(email, 'orderConfirmation', { name: firstName, orderId });
            next();
        } catch (error) {
            next(error);
        }
    }
};

module.exports = {
    sendEmail,
    sendSMS,
    notificationMiddleware
}; 