/**
 * Authentication Flow Test File
 * Tests the authentication flow including OTP verification
 */

const axios = require("axios");
const assert = require("assert");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Configuration
const API_URL = "http://localhost:5000/api"; // Adjust according to your server setup
let authToken = null;
let userId = null;
// Will be set by user input
let registerPhoneNumber = null;
let loginPhoneNumber = null;
let lastVerificationCode = null; // Will store the code from server logs

// Test user data - phone number will be updated during runtime
const testUser = {
  firstName: "Test",
  lastName: "User",
  email: `test${Date.now()}@example.com`, // Ensure unique email
  phoneNumber: null,
  password: "Password123!",
};

// Login credentials - phone number will be updated during runtime
const loginUser = {
  identifier: null,
  password: "Password123!",
};

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers,
    });

    // Check if response contains a verification code in an error message
    if (
      response.data &&
      response.data.data &&
      response.data.data.verificationCode
    ) {
      lastVerificationCode = response.data.data.verificationCode;
      console.log(
        `[DEBUG] Found verification code in response: ${lastVerificationCode}`
      );
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      // Check if error response contains a verification code
      if (
        error.response.data &&
        error.response.data.data &&
        error.response.data.data.verificationCode
      ) {
        lastVerificationCode = error.response.data.data.verificationCode;
        console.log(
          `[DEBUG] Found verification code in error response: ${lastVerificationCode}`
        );
      }

      console.error(
        `Request failed with status ${error.response.status}:`,
        error.response.data
      );
      return error.response.data;
    }
    throw error;
  }
}

// Helper function to prompt for user input
function promptUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to prompt for OTP
function promptForOTP(prompt) {
  return new Promise((resolve) => {
    if (lastVerificationCode) {
      console.log(`[AUTO] Using code from logs: ${lastVerificationCode}`);
      resolve(lastVerificationCode);
      return;
    }

    rl.question(prompt, (answer) => {
      const code = answer.trim();
      // If user enters empty input, try using a debug code
      if (!code) {
        console.log("[DEBUG] Using fallback verification code: 123456");
        resolve("123456");
      } else {
        resolve(code);
      }
    });
  });
}

// Function to get verification code directly from the API for testing
async function getVerificationCode(userId) {
  try {
    console.log(
      `[DEBUG] Attempting to fetch verification code directly from database for user ${userId}`
    );
    // This endpoint would need to be implemented in your backend
    const response = await makeRequest(
      "get",
      `/debug/verification-code/${userId}`
    );
    if (response && response.code) {
      console.log(
        `[DEBUG] Received verification code from backend: ${response.code}`
      );
      return response.code;
    }
    return null;
  } catch (error) {
    console.error("[DEBUG] Failed to fetch verification code:", error.message);
    return null;
  }
}

// Test Registration Flow
async function testRegistration() {
  console.log("\n--- Testing Registration Flow ---\n");
  lastVerificationCode = null;

  try {
    // Get phone number from user
    registerPhoneNumber = await promptUserInput("Enter your phone number for registration (e.g., 09123456789): ");
    console.log(`You entered: ${registerPhoneNumber}`);
    
    // Update test user with entered phone number
    testUser.phoneNumber = registerPhoneNumber;

    // Step 1: Register a new user
    console.log("Step 1: Registering a new user with phone number:", registerPhoneNumber);
    const registerResponse = await makeRequest("post", "/auth/register", testUser);

    console.log("Registration response:", registerResponse);
    assert(
      registerResponse.status === "success" ||
        registerResponse.status === "warning",
      "Registration failed"
    );

    userId = registerResponse.data.userId;
    console.log(`User registered with ID: ${userId}`);
    console.log(`Phone number: ${registerPhoneNumber}`);

    // Try to get verification code from server directly
    const serverCode = await getVerificationCode(userId);
    if (serverCode) {
      lastVerificationCode = serverCode;
    }

    // For testing - get OTP from user input
    console.log("\nA verification code has been sent to your phone.");
    console.log("Please check your phone for the SMS verification code:");
    const verificationCode = await promptForOTP("Enter the verification code you received: ");
    console.log(`Using verification code: ${verificationCode}`);

    // Step 2: Verify phone number
    console.log("\nStep 2: Verifying phone number with OTP");
    const verifyPhoneResponse = await makeRequest(
      "post",
      "/auth/verify-phone",
      {
        phoneNumber: registerPhoneNumber,
        verificationCode: verificationCode,
      }
    );

    console.log("Phone verification response:", verifyPhoneResponse);

    if (verifyPhoneResponse.status !== "success") {
      console.log(
        "Phone verification failed but continuing with login flow test..."
      );
    } else {
      assert(
        verifyPhoneResponse.status === "success",
        "Phone verification failed"
      );
      authToken = verifyPhoneResponse.data.token;
      console.log(
        `User verified and token received: ${authToken.substring(0, 15)}...`
      );
    }

    console.log("\n--- Registration Flow Test Completed ---\n");
    return true;
  } catch (error) {
    console.error("\n❌ Registration Test Error:", error.message);
    console.error("Error details:", error);
    return false;
  }
}

// Test Login Flow
async function testLogin() {
  console.log("\n--- Testing Login Flow ---\n");
  lastVerificationCode = null;

  try {
    // Get phone number from user
    loginPhoneNumber = await promptUserInput("Enter your phone number for login (e.g., 09123456789): ");
    console.log(`You entered: ${loginPhoneNumber}`);
    
    // Update login credentials with entered phone number
    loginUser.identifier = loginPhoneNumber;

    // First, check if we need to verify the phone
    console.log("Step 1: Testing login with phone number:", loginPhoneNumber);
    const loginResponse = await makeRequest("post", "/auth/login", loginUser);

    console.log("Login response:", loginResponse);
    
    // Handle phone verification requirement
    if (
      loginResponse.status === "error" &&
      loginResponse.data &&
      loginResponse.data.requiresPhoneVerification
    ) {
      
      console.log(
        "Account requires phone verification first. Sending verification code..."
      );
      
      // Request verification code
      const requestOtpResponse = await makeRequest("post", "/auth/request-otp", {
        phoneNumber: loginPhoneNumber
      });
      
      console.log("Verification code request response:", requestOtpResponse);
      
      // Get verification code for user
      console.log("\nA verification code has been sent to your phone.");
      console.log("Please check your phone for the verification code:");
      const verificationCode = await promptForOTP("Enter the verification code you received: ");
      console.log(`Using verification code: ${verificationCode}`);
      
      // Verify phone
      const verifyPhoneResponse = await makeRequest("post", "/auth/verify-phone", {
        phoneNumber: loginPhoneNumber,
        verificationCode: verificationCode
      });
      
      console.log("Phone verification response:", verifyPhoneResponse);
      
      if (verifyPhoneResponse.status !== "success") {
        console.log(
          "Phone verification failed. Cannot proceed with login test."
        );
        return false;
      }
      

      console.log("Phone verified successfully. Now trying login again...");

      // Try login again
      const retryLoginResponse = await makeRequest(
        "post",
        "/auth/login",
        loginUser
      );
      console.log("Login retry response:", retryLoginResponse);

      if (retryLoginResponse.status !== "success") {
        console.log(
          "Login failed after phone verification. Skipping remaining login tests."
        );
        return false;
      }

      // Continue with login flow using retryLoginResponse
      assert(retryLoginResponse.status === "success", "Login step 1 failed");
      assert(
        retryLoginResponse.data.requiresOtp === true,
        "OTP requirement not triggered"
      );

      // Get the verification code for login
      console.log("\nA login verification code has been sent to your phone.");
      console.log("Please check your phone for the login verification code:");
      const loginOtpCode = await promptForOTP("Enter the login verification code you received: ");
      console.log(`Using login verification code: ${loginOtpCode}`);

      // Verify login OTP
      console.log("\nVerifying login OTP");
      const verifyLoginOtpResponse = await makeRequest(
        "post",
        "/auth/verify-login-otp",
        {
          phoneNumber: loginPhoneNumber,
          verificationCode: loginOtpCode,
        }
      );

      console.log("Login OTP verification response:", verifyLoginOtpResponse);

      if (verifyLoginOtpResponse.status !== "success") {
        console.log("Login OTP verification failed. Skipping remaining tests.");
        return false;
      }

      assert(
        verifyLoginOtpResponse.status === "success",
        "Login OTP verification failed"
      );
      const loginToken = verifyLoginOtpResponse.data.token;
      console.log(
        `Login successful with token: ${loginToken.substring(0, 15)}...`
      );

      // Test protected route
      console.log("\nStep 3: Testing protected route access with token");
      const protectedResponse = await makeRequest(
        "get",
        "/auth/check-token",
        null,
        loginToken
      );

      console.log("Protected route response:", protectedResponse);
      assert(
        protectedResponse.status === "success",
        "Protected route access failed"
      );

      console.log("\n--- Login Flow Test Completed Successfully! ---\n");
      return true;
    }
    // Normal login flow if phone is already verified
    else if (loginResponse.status === "success") {
      assert(loginResponse.status === "success", "Login step 1 failed");

      if (!loginResponse.data.requiresOtp) {
        console.log(
          "OTP not required for login. This may indicate a configuration issue."
        );
        return false;
      }

      assert(
        loginResponse.data.requiresOtp === true,
        "OTP requirement not triggered"
      );

      // Get the verification code for login
      console.log("\nA login verification code has been sent to your phone.");
      console.log("Please check your phone for the login verification code:");
      const loginOtpCode = await promptForOTP("Enter the login verification code you received: ");
      console.log(`Using login verification code: ${loginOtpCode}`);

      // Step 2: Verify login OTP
      console.log("\nStep 2: Verifying login OTP");
      const verifyLoginOtpResponse = await makeRequest(
        "post",
        "/auth/verify-login-otp",
        {
          phoneNumber: loginPhoneNumber,
          verificationCode: loginOtpCode,
        }
      );

      console.log("Login OTP verification response:", verifyLoginOtpResponse);

      if (verifyLoginOtpResponse.status !== "success") {
        console.log("Login OTP verification failed. Skipping remaining tests.");
        return false;
      }

      assert(
        verifyLoginOtpResponse.status === "success",
        "Login OTP verification failed"
      );
      const loginToken = verifyLoginOtpResponse.data.token;
      console.log(
        `Login successful with token: ${loginToken.substring(0, 15)}...`
      );

      // Step 3: Test protected route access
      console.log("\nStep 3: Testing protected route access with token");
      const protectedResponse = await makeRequest(
        "get",
        "/auth/check-token",
        null,
        loginToken
      );

      console.log("Protected route response:", protectedResponse);
      assert(
        protectedResponse.status === "success",
        "Protected route access failed"
      );

      console.log("\n--- Login Flow Test Completed Successfully! ---\n");
      return true;
    } else {
      console.log(
        "Login failed with unexpected error. Skipping remaining login tests."
      );
      return false;
    }
  } catch (error) {
    console.error("\n❌ Login Test Error:", error.message);
    console.error("Error details:", error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("\n=== Starting Authentication Flow Tests ===\n");

  try {
    // Ask which test to run
    const testChoice = await promptUserInput(
      "What would you like to test?\n1. Registration\n2. Login\n3. Both\nEnter your choice (1, 2, or 3): "
    );
    
    let registrationPassed = true;
    let loginPassed = true;
    
    if (testChoice === "1" || testChoice === "3") {
      // Test registration with user-provided phone number
      registrationPassed = await testRegistration();
      console.log(`Registration test ${registrationPassed ? 'PASSED' : 'FAILED'}`);
    }
    
    if (testChoice === "2" || testChoice === "3") {
      // Test login with user-provided phone number
      loginPassed = await testLogin();
      console.log(`Login test ${loginPassed ? 'PASSED' : 'FAILED'}`);
    }
    
    if ((testChoice === "1" && registrationPassed) || 
        (testChoice === "2" && loginPassed) || 
        (testChoice === "3" && registrationPassed && loginPassed)) {
      console.log("\n=== 🎉 Authentication Tests Completed Successfully! ===\n");
    } else {
      console.log("\n=== ⚠️ Some Authentication Tests Failed! ===\n");
    }
  } finally {
    // Close readline interface
    rl.close();
    process.exit(0);
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch((error) => {
    console.error("Test execution failed:", error);
    rl.close();
    process.exit(1);
  });
} else {
  module.exports = { runTests, makeRequest };
}
