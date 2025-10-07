import ErrorHandler from "../utils/errorHandler";

class AuthService {
  static currentUser = null;
  static authToken = null;

  // Initialize auth service
  static init() {
    this.authToken = this.getToken();
    this.currentUser = this.getCurrentUser();
    this.setupTokenRefresh();
  }

  // Set authentication token
  static setToken(token) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
    // Set cookie for server-side auth
    document.cookie = `auth_token=${token}; path=/; max-age=${24 * 60 * 60}; secure; samesite=strict`;
  }

  // Get authentication token
  static getToken() {
    if (this.authToken) return this.authToken;
    return localStorage.getItem('auth_token') || this.getTokenFromCookie();
  }

  // Get token from cookie
  static getTokenFromCookie() {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    return token || null;
  }

  // Set current user
  static setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  // Get current user
  static getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
    } catch (error) {
      this.logout();
      return false;
    }
    
    return true;
  }

  // Check if user has specific role
  static hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // Check if user is admin
  static isAdmin() {
    return this.hasRole('admin');
  }

  // Login user
  static async login(email, password) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Login failed');
      }

      if (data.data?.token) {
        this.setToken(data.data.token);
        this.setCurrentUser(data.data.user);
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
        throw new Error(data.error?.message || data.message || 'Registration failed');
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
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || '2FA setup failed');
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
        throw new Error(data.error?.message || data.message || '2FA verification failed');
      }

      if (data.data?.token) {
        this.setToken(data.data.token);
        this.currentUser = data.data.user;
        this.setCurrentUser(data.data.user);
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
        throw new Error(data.error?.message || data.message || 'Password reset request failed');
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
        throw new Error(data.error?.message || data.message || 'Password reset failed');
      }

      return data;
    } catch (error) {
      throw new Error(ErrorHandler.handleError(error));
    }
  }

  static async logout() {
    try {
      // Call logout endpoint
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
        credentials: "include",
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local data
      this.authToken = null;
      this.currentUser = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Redirect to login
      window.location.href = '/login.html';
    }
  }

  // Refresh token
  static async refreshToken() {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.data?.token) {
        this.setToken(data.data.token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Setup automatic token refresh
  static setupTokenRefresh() {
    // Check token every 5 minutes
    setInterval(() => {
      if (this.isAuthenticated()) {
        this.refreshToken();
      }
    }, 5 * 60 * 1000);
  }

  // Get user profile
  static async getProfile() {
    try {
      const response = await fetch("/api/users/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to get profile');
      }

      this.setCurrentUser(data.data.user);
      return data.data.user;
    } catch (error) {
      throw new Error(ErrorHandler.handleError(error));
    }
  }

  // Update user profile
  static async updateProfile(profileData) {
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(profileData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Profile update failed');
      }

      this.setCurrentUser(data.data.user);
      return data.data.user;
    } catch (error) {
      throw new Error(ErrorHandler.handleError(error));
    }
  }
}

// Initialize auth service when module loads
AuthService.init();

export default AuthService;
