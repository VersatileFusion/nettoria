const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { validatePassword } = require('../utils/validation');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت اطلاعات پروفایل'
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, company, address } = req.body;

        // Check if email is already taken by another user
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'این ایمیل قبلاً ثبت شده است'
                });
            }
        }

        // Update user profile
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                firstName,
                lastName,
                email,
                phone,
                company,
                address
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            data: user,
            message: 'پروفایل با موفقیت بروزرسانی شد'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در بروزرسانی پروفایل'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate new password
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            return res.status(400).json({
                success: false,
                message: passwordError
            });
        }

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'رمز عبور فعلی اشتباه است'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'رمز عبور با موفقیت تغییر کرد'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در تغییر رمز عبور'
        });
    }
};

// Get security settings
exports.getSecuritySettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('twoFactorEnabled');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                twoFactorEnabled: user.twoFactorEnabled
            }
        });
    } catch (error) {
        console.error('Get security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت تنظیمات امنیتی'
        });
    }
};

// Update security settings
exports.updateSecuritySettings = async (req, res) => {
    try {
        const { twoFactorEnabled } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { twoFactorEnabled },
            { new: true }
        ).select('twoFactorEnabled');

        res.status(200).json({
            success: true,
            data: user,
            message: 'تنظیمات امنیتی با موفقیت بروزرسانی شد'
        });
    } catch (error) {
        console.error('Update security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در بروزرسانی تنظیمات امنیتی'
        });
    }
};

// Toggle two-factor authentication
exports.toggleTwoFactor = async (req, res) => {
    try {
        const { enabled } = req.body;
        const user = await User.findById(req.user.id);

        if (enabled) {
            // Generate new secret
            const secret = speakeasy.generateSecret({
                name: `Nettoria:${user.email}`
            });

            // Generate QR code
            const qrCode = await QRCode.toDataURL(secret.otpauth_url);

            // Save secret temporarily
            user.twoFactorSecret = secret.base32;
            await user.save();

            res.status(200).json({
                success: true,
                data: {
                    qrCode,
                    secret: secret.base32
                }
            });
        } else {
            // Disable 2FA
            user.twoFactorEnabled = false;
            user.twoFactorSecret = undefined;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'احراز هویت دو مرحله‌ای غیرفعال شد'
            });
        }
    } catch (error) {
        console.error('Toggle 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در تغییر وضعیت احراز هویت دو مرحله‌ای'
        });
    }
};

// Verify two-factor authentication
exports.verifyTwoFactor = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.twoFactorSecret) {
            return res.status(400).json({
                success: false,
                message: 'ابتدا باید احراز هویت دو مرحله‌ای را فعال کنید'
            });
        }

        // Verify code
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                message: 'کد تایید نامعتبر است'
            });
        }

        // Enable 2FA
        user.twoFactorEnabled = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'احراز هویت دو مرحله‌ای با موفقیت فعال شد'
        });
    } catch (error) {
        console.error('Verify 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در تایید احراز هویت دو مرحله‌ای'
        });
    }
};

// Get notification settings
exports.getNotificationSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('notificationSettings');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
        }

        res.status(200).json({
            success: true,
            data: user.notificationSettings
        });
    } catch (error) {
        console.error('Get notification settings error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت تنظیمات اعلان‌ها'
        });
    }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
    try {
        const { notify_email, notify_sms, notify_service, notify_payment } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                notificationSettings: {
                    notify_email,
                    notify_sms,
                    notify_service,
                    notify_payment
                }
            },
            { new: true }
        ).select('notificationSettings');

        res.status(200).json({
            success: true,
            data: user.notificationSettings,
            message: 'تنظیمات اعلان‌ها با موفقیت بروزرسانی شد'
        });
    } catch (error) {
        console.error('Update notification settings error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در بروزرسانی تنظیمات اعلان‌ها'
        });
    }
};

// Get login history
exports.getLoginHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('loginHistory');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
        }

        res.status(200).json({
            success: true,
            data: user.loginHistory
        });
    } catch (error) {
        console.error('Get login history error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت تاریخچه ورود'
        });
    }
}; 