const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'نام الزامی است'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'نام خانوادگی الزامی است'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'ایمیل الزامی است'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'لطفا یک ایمیل معتبر وارد کنید']
    },
    phone: {
        type: String,
        required: [true, 'شماره موبایل الزامی است'],
        unique: true,
        trim: true,
        match: [/^09[0-9]{9}$/, 'لطفا یک شماره موبایل معتبر وارد کنید']
    },
    password: {
        type: String,
        required: [true, 'رمز عبور الزامی است'],
        minlength: [8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'],
        select: false
    },
    company: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    notificationSettings: {
        notify_email: {
            type: Boolean,
            default: true
        },
        notify_sms: {
            type: Boolean,
            default: true
        },
        notify_service: {
            type: Boolean,
            default: true
        },
        notify_payment: {
            type: Boolean,
            default: true
        }
    },
    loginHistory: [{
        date: {
            type: Date,
            default: Date.now
        },
        ip: String,
        device: String,
        status: {
            type: String,
            enum: ['success', 'failed'],
            default: 'success'
        }
    }],
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Add login history
userSchema.methods.addLoginHistory = async function(ip, device, status) {
    this.loginHistory.unshift({
        ip,
        device,
        status
    });

    // Keep only last 10 login attempts
    if (this.loginHistory.length > 10) {
        this.loginHistory = this.loginHistory.slice(0, 10);
    }

    if (status === 'success') {
        this.lastLogin = new Date();
    }

    await this.save();
};

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.twoFactorSecret;
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 