const crypto = require("crypto");
const { User } = require("../models");
const { sendEmail } = require("../utils/email");
const { createToken } = require("../utils/jwt");

class OneTimeLoginService {
  static async generateToken(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in user's record
    await user.update({
      oneTimeLoginToken: token,
      oneTimeLoginExpires: expiresAt
    });

    // Send email with login link
    const loginLink = `${process.env.FRONTEND_URL}/one-time-login?token=${token}`;
    await sendEmail({
      to: email,
      subject: "One-Time Login Link",
      html: `
        <h1>One-Time Login Link</h1>
        <p>Click the link below to log in to your account:</p>
        <a href="${loginLink}">${loginLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `
    });

    return { message: "One-time login link sent to your email" };
  }

  static async validateToken(token) {
    const user = await User.findOne({
      where: {
        oneTimeLoginToken: token,
        oneTimeLoginExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    // Clear the one-time login token
    await user.update({
      oneTimeLoginToken: null,
      oneTimeLoginExpires: null
    });

    // Generate JWT token
    const jwtToken = createToken(user);

    return {
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  static async checkTokenStatus(token) {
    const user = await User.findOne({
      where: {
        oneTimeLoginToken: token
      }
    });

    if (!user) {
      return { valid: false, message: "Invalid token" };
    }

    if (user.oneTimeLoginExpires < new Date()) {
      return { valid: false, message: "Token expired" };
    }

    return { valid: true, message: "Token is valid" };
  }
}

module.exports = OneTimeLoginService;
