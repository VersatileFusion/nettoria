import ErrorHandler from "../utils/errorHandler";

class AuthService {
  static async login(email, password) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ErrorHandler.handleError(error));
    }
  }

  static async register(userData) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ErrorHandler.handleError(error));
    }
  }

  static async setup2FA() {
    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ErrorHandler.handleError(error));
    }
  }

  static async verify2FA(code) {
    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ErrorHandler.handleError(error));
    }
  }

  static async requestPasswordReset(email) {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ErrorHandler.handleError(error));
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ErrorHandler.handleError(error));
    }
  }

  static async logout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message);
      }

      // Clear any local storage or session storage
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      return data;
    } catch (error) {
      throw new Error(ErrorHandler.handleError(error));
    }
  }

  static isAuthenticated() {
    return document.cookie.includes("auth_token");
  }

  static getToken() {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];
  }
}

export default AuthService;
