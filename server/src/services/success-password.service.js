const crypto = require("crypto");
const User = require("../models/user.model");
const { NotFoundError, ValidationError } = require("../utils/errors");
const { sendEmail } = require("../utils/email");

class SuccessPasswordService {
  static async setSuccessPassword(userId, password) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Hash the success password
    const hashedPassword = await this.hashPassword(password);
    user.successPassword = hashedPassword;
    await user.save();

    return { message: "Success password set successfully" };
  }

  static async verifySuccessPassword(userId, password) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.successPassword) {
      throw new ValidationError("Success password not set");
    }

    const isValid = await this.comparePassword(password, user.successPassword);
    if (!isValid) {
      throw new ValidationError("Invalid success password");
    }

    return { message: "Success password verified successfully" };
  }

  static async resetSuccessPassword(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Generate a new random success password
    const newPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await this.hashPassword(newPassword);

    user.successPassword = hashedPassword;
    await user.save();

    // Send email with new success password
    await sendEmail({
      to: user.email,
      subject: "Success Password Reset",
      html: `
                <p>Your success password has been reset.</p>
                <p>New success password: <strong>${newPassword}</strong></p>
                <p>Please keep this password secure and do not share it with anyone.</p>
            `,
    });

    return { message: "Success password reset successfully" };
  }

  static async hashPassword(password) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        process.env.PASSWORD_SALT,
        100000,
        64,
        "sha512",
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey.toString("hex"));
        }
      );
    });
  }

  static async comparePassword(password, hash) {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }
}

module.exports = SuccessPasswordService;
