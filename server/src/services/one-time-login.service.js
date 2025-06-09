const crypto = require("crypto");
const User = require("../models/user.model");
const OneTimeLogin = require("../models/one-time-login.model");
const { NotFoundError, ValidationError } = require("../utils/errors");
const { sendEmail } = require("../utils/email");

class OneTimeLoginService {
  static async generateOneTimeLogin(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const oneTimeLogin = new OneTimeLogin({
      userId: user._id,
      token,
      expiresAt,
    });

    await oneTimeLogin.save();

    // Send email with login link
    const loginLink = `${process.env.FRONTEND_URL}/one-time-login?token=${token}`;
    await sendEmail({
      to: email,
      subject: "One-Time Login Link",
      html: `
                <p>Click the link below to log in to your account:</p>
                <a href="${loginLink}">${loginLink}</a>
                <p>This link will expire in 15 minutes.</p>
            `,
    });

    return { message: "One-time login link sent to your email" };
  }

  static async validateOneTimeLogin(token) {
    const oneTimeLogin = await OneTimeLogin.findOne({
      token,
      expiresAt: { $gt: new Date() },
      used: false,
    });

    if (!oneTimeLogin) {
      throw new ValidationError("Invalid or expired token");
    }

    const user = await User.findById(oneTimeLogin.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Mark token as used
    oneTimeLogin.used = true;
    await oneTimeLogin.save();

    // Generate JWT token for the user
    const jwtToken = user.generateAuthToken();

    return {
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }

  static async checkOneTimeLoginStatus(token) {
    const oneTimeLogin = await OneTimeLogin.findOne({ token });

    if (!oneTimeLogin) {
      return { valid: false, message: "Invalid token" };
    }

    if (oneTimeLogin.used) {
      return { valid: false, message: "Token already used" };
    }

    if (oneTimeLogin.expiresAt < new Date()) {
      return { valid: false, message: "Token expired" };
    }

    return { valid: true, message: "Token is valid" };
  }
}

module.exports = OneTimeLoginService;
