// DOM Elements
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const otpForm = document.getElementById("otpForm");
const otpVerificationForm = document.getElementById("otpVerificationForm");
const otpInput = document.getElementById("otpInput");
const otpMessage = document.getElementById("otpMessage");
const otpTimer = document.getElementById("otpTimer");
const resendOtpBtn = document.getElementById("resendOtpBtn");

// API endpoints
const API_BASE_URL = "http://localhost:5000/api"; // Updated to match backend port

// Authentication functions
const auth = {
  // Store token in localStorage
  setToken(token) {
    localStorage.setItem("authToken", token);
  },

  // Get token from localStorage
  getToken() {
    return localStorage.getItem("authToken");
  },

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem("authToken");
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Handle login
  async login(identifier, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the token
      this.setToken(data.token);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Handle logout
  logout() {
    this.removeToken();
    window.location.href = "/login.html";
  },

  // Handle registration
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Handle forgot password
  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset request failed");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Handle OTP request
  async requestOTP(phoneNumber) {
    try {
      console.log("Sending OTP request for:", phoneNumber);
      console.log("API URL:", `${API_BASE_URL}/auth/request-login-otp`);

      const response = await fetch(`${API_BASE_URL}/auth/request-login-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "خطا در ارسال کد تایید");
      }

      // If we're in development mode and got the code, show it
      if (data.data && data.data.verificationCode) {
        alert(`کد تایید: ${data.data.verificationCode}`);
      }

      return data;
    } catch (error) {
      console.error("Error in requestOTP:", error);
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        throw new Error(
          "خطا در ارتباط با سرور. لطفا اتصال اینترنت خود را بررسی کنید"
        );
      }
      throw error;
    }
  },

  // Handle OTP verification
  async verifyOTP(phoneNumber, otp) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-login-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, verificationCode: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("کد تایید نامعتبر است");
        } else if (response.status === 404) {
          throw new Error("کاربری با این شماره تلفن یافت نشد");
        } else {
          throw new Error(data.message || "خطا در تایید کد");
        }
      }

      // Store the token if login successful
      if (data.data && data.data.token) {
        this.setToken(data.data.token);
      }

      return data;
    } catch (error) {
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        throw new Error(
          "خطا در ارتباط با سرور. لطفا اتصال اینترنت خود را بررسی کنید"
        );
      }
      throw error;
    }
  },
};

// Export the auth object
window.auth = auth;

// Utility Functions
function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? "red" : "green";
  element.style.display = "block";
}

function hideMessage(element) {
  if (!element) return;
  element.style.display = "none";
}

function startOtpTimer() {
  let timeLeft = 60;
  otpTimer.textContent = `Time remaining: ${timeLeft} seconds`;

  const timer = setInterval(() => {
    timeLeft--;
    otpTimer.textContent = `Time remaining: ${timeLeft} seconds`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      otpTimer.textContent = "OTP expired";
      resendOtpBtn.disabled = false;
    }
  }, 1000);
}

// Event Listeners
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage(otpMessage);

    const formData = new FormData(signupForm);
    const userData = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          otpMessage,
          "OTP sent successfully! Please check your email.",
          false
        );
        otpForm.style.display = "block";
        signupForm.style.display = "none";
        startOtpTimer();
      } else {
        showMessage(otpMessage, data.message || "Registration failed", true);
      }
    } catch (error) {
      showMessage(otpMessage, "An error occurred. Please try again.", true);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage(otpMessage);

    const formData = new FormData(loginForm);
    const credentials = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          otpMessage,
          "OTP sent successfully! Please check your email.",
          false
        );
        otpForm.style.display = "block";
        loginForm.style.display = "none";
        startOtpTimer();
      } else {
        showMessage(otpMessage, data.message || "Login failed", true);
      }
    } catch (error) {
      showMessage(otpMessage, "An error occurred. Please try again.", true);
    }
  });
}

if (otpVerificationForm) {
  otpVerificationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage(otpMessage);

    const formData = new FormData(otpVerificationForm);
    const otpData = {
      email: formData.get("email"),
      otp: formData.get("otp"),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(otpData),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(otpMessage, "OTP verified successfully!", false);
        // Redirect to dashboard or home page
        window.location.href = "/dashboard.html";
      } else {
        showMessage(
          otpMessage,
          data.message || "OTP verification failed",
          true
        );
      }
    } catch (error) {
      showMessage(otpMessage, "An error occurred. Please try again.", true);
    }
  });
}

if (resendOtpBtn) {
  resendOtpBtn.addEventListener("click", async () => {
    hideMessage(otpMessage);
    resendOtpBtn.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: document.querySelector('input[name="email"]').value,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(otpMessage, "New OTP sent successfully!", false);
        startOtpTimer();
      } else {
        showMessage(otpMessage, data.message || "Failed to resend OTP", true);
        resendOtpBtn.disabled = false;
      }
    } catch (error) {
      showMessage(otpMessage, "An error occurred. Please try again.", true);
      resendOtpBtn.disabled = false;
    }
  });
}
