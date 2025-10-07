const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const bcrypt = require('bcryptjs');

console.log('Initializing User model...');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'نام الزامی است'
            }
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'نام خانوادگی الزامی است'
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'لطفا یک ایمیل معتبر وارد کنید'
            },
            notEmpty: {
                msg: 'ایمیل الزامی است'
            }
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: {
                args: /^09[0-9]{9}$/,
                msg: 'لطفا یک شماره موبایل معتبر وارد کنید'
            },
            notEmpty: {
                msg: 'شماره موبایل الزامی است'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [8, 255],
                msg: 'رمز عبور باید حداقل ۸ کاراکتر باشد'
            },
            notEmpty: {
                msg: 'رمز عبور الزامی است'
            }
        }
    },
    company: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
    },
    twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    twoFactorSecret: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notificationSettings: {
        type: DataTypes.JSON,
        defaultValue: {
            notify_email: true,
            notify_sms: true,
            notify_service: true,
            notify_payment: true
        }
    },
    loginHistory: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Add login history instance method
User.prototype.addLoginHistory = async function(ip, device, status) {
    const loginHistory = this.loginHistory || [];
    loginHistory.unshift({
        date: new Date(),
        ip,
        device,
        status
    });

    // Keep only last 10 login attempts
    if (loginHistory.length > 10) {
        loginHistory.splice(10);
    }

    this.loginHistory = loginHistory;

    if (status === 'success') {
        this.lastLogin = new Date();
    }

    await this.save();
};

// Compare password instance method
User.prototype.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Get public profile instance method
User.prototype.getPublicProfile = function() {
    const userObject = this.toJSON();
    delete userObject.password;
    delete userObject.twoFactorSecret;
    return userObject;
};

console.log('User model initialized successfully');

module.exports = User; 