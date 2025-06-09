const { expect } = require("@playwright/test");

describe("Authentication Flow", () => {
  // Increase timeout for all tests in this suite
  jest.setTimeout(120000); // 2 minutes timeout

  // Helper function to wait for JavaScript to be loaded
  const waitForJS = async () => {
    console.log("Waiting for page to be ready...");
    await global.page.waitForLoadState("networkidle");
    await global.page.waitForLoadState("domcontentloaded");
    console.log("Page load states completed");
  };

  // Helper function to wait for response with retry
  const waitForResponse = async (urlPattern, timeout = 30000) => {
    console.log(`Waiting for response matching pattern: ${urlPattern}`);
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        console.log(`Attempting to wait for response (${Date.now() - startTime}ms elapsed)...`);
        const response = await global.page.waitForResponse(
          (response) => {
            const url = response.url();
            console.log(`Checking response URL: ${url}`);
            return url.includes(urlPattern);
          },
          { timeout: 10000 } // Increased timeout to 10 seconds
        );
        console.log(`Response received: ${response.url()}`);
        return response;
      } catch (error) {
        console.log(`Response wait attempt failed: ${error.message}`);
        // If we're close to timeout, throw the error
        if (Date.now() - startTime > timeout - 10000) {
          throw error;
        }
        // Otherwise, wait a bit and retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw new Error(`Timeout waiting for response matching ${urlPattern}`);
  };

  // Helper function to fill form fields
  const fillForm = async (fields) => {
    for (const [field, value] of Object.entries(fields)) {
      console.log(`Filling field: ${field} with value: ${value}`);
      const selector = `input[name="${field}"]`;
      await global.page.waitForSelector(selector, {
        state: "visible",
        timeout: 5000,
      });
      await global.page.fill(selector, value);
    }
  };

  // Helper function to click button and wait for response
  const clickAndWait = async (selector, urlPattern) => {
    console.log(
      `Clicking button: ${selector} and waiting for response: ${urlPattern}`
    );
    await global.page.waitForSelector(selector, {
      state: "visible",
      timeout: 5000,
    });
    const [response] = await Promise.all([
      waitForResponse(urlPattern),
      global.page.click(selector),
    ]);
    return response;
  };

  // Helper function to fill OTP
  const fillOTP = async (otp) => {
    console.log(`Filling OTP: ${otp}`);
    const digits = otp.split("");
    for (let i = 0; i < digits.length; i++) {
      const selector = `input[name="otp${i + 1}"]`;
      await global.page.waitForSelector(selector, {
        state: "visible",
        timeout: 5000,
      });
      await global.page.fill(selector, digits[i]);
    }
  };

  beforeEach(async () => {
    console.log("Starting test setup...");
    // Clear storage before each test
    await global.page.evaluate(() => {
      console.log("Clearing storage...");
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    console.log("Storage cleared");
  });

  test("should complete full authentication flow", async () => {
    console.log("Starting full authentication flow test...");
    // Go to signup page
    console.log("Navigating to signup page...");
    await global.page.goto(`${global.FRONTEND_URL}/signup.html`);
    console.log("Waiting for JavaScript to load...");
    await waitForJS();
    console.log("JavaScript loaded");

    // Fill signup form
    console.log("Filling signup form...");
    await fillForm({
      firstName: "Test",
      lastName: "User",
      phoneNumber: "09123456789",
      email: "test@example.com",
      password: "Test@123456",
      confirmPassword: "Test@123456",
    });
    console.log("Signup form filled");

    // Accept terms
    console.log("Accepting terms...");
    await global.page.waitForSelector("#terms", {
      state: "visible",
      timeout: 5000,
    });
    await global.page.click("#terms");
    console.log("Terms accepted");

    // Submit signup form
    console.log("Submitting signup form...");
    await clickAndWait('button[type="submit"]', "/api/auth/register");
    console.log("Signup form submitted");

    // Wait for OTP page
    console.log("Waiting for OTP page...");
    await global.page.waitForURL(
      `${global.FRONTEND_URL}/otp-verification.html`
    );
    console.log("OTP page loaded");

    // Fill OTP
    console.log("Filling OTP...");
    await fillOTP("123456");
    console.log("OTP filled");

    // Submit OTP
    console.log("Submitting OTP...");
    await clickAndWait('button[type="submit"]', "/api/auth/verify");
    console.log("OTP submitted");

    // Wait for redirect to login
    console.log("Waiting for redirect to login...");
    await global.page.waitForURL(`${global.FRONTEND_URL}/login.html`);
    console.log("Redirected to login page");

    // Fill login form
    console.log("Filling login form...");
    await fillForm({
      identifier: "test@example.com",
      password: "Test@123456",
    });
    console.log("Login form filled");

    // Submit login form
    console.log("Submitting login form...");
    await clickAndWait('button[type="submit"]', "/api/auth/login");
    console.log("Login form submitted");

    // Wait for redirect to index
    console.log("Waiting for redirect to index...");
    await global.page.waitForURL(`${global.FRONTEND_URL}/index.html`);
    console.log("Redirected to index page");

    // Verify token is stored
    console.log("Verifying token storage...");
    const token = await global.page.evaluate(() =>
      window.localStorage.getItem("token")
    );
    expect(token).toBeTruthy();
    console.log("Token verified");
  });

  test("should handle invalid login attempts", async () => {
    console.log("Starting invalid login test...");
    // Go to login page
    console.log("Navigating to login page...");
    await global.page.goto(`${global.FRONTEND_URL}/login.html`);
    console.log("Waiting for JavaScript to load...");
    await waitForJS();
    console.log("JavaScript loaded");

    // Fill login form with invalid credentials
    console.log("Filling login form with invalid credentials...");
    await fillForm({
      identifier: "wrong@example.com",
      password: "wrongpass",
    });
    console.log("Login form filled");

    // Submit login form
    console.log("Submitting login form...");
    await clickAndWait('button[type="submit"]', "/api/auth/login");
    console.log("Login form submitted");

    // Verify error message
    console.log("Verifying error message...");
    await global.page.waitForSelector("#errorMessage", {
      state: "visible",
      timeout: 5000,
    });
    const errorMessage = await global.page.textContent("#errorMessage");
    expect(errorMessage).toContain("Invalid credentials");
    console.log("Error message verified");

    // Verify no token is stored
    console.log("Verifying no token is stored...");
    const token = await global.page.evaluate(() =>
      window.localStorage.getItem("token")
    );
    expect(token).toBeFalsy();
    console.log("No token verified");
  });

  test("should handle pending verification flow", async () => {
    console.log("Starting pending verification test...");
    // Go to signup page
    console.log("Navigating to signup page...");
    await global.page.goto(`${global.FRONTEND_URL}/signup.html`);
    console.log("Waiting for JavaScript to load...");
    await waitForJS();
    console.log("JavaScript loaded");

    // Fill signup form
    console.log("Filling signup form...");
    await fillForm({
      firstName: "Pending",
      lastName: "User",
      phoneNumber: "09123456789",
      email: "pending@example.com",
      password: "Test@123456",
      confirmPassword: "Test@123456",
    });
    console.log("Signup form filled");

    // Accept terms
    console.log("Accepting terms...");
    await global.page.waitForSelector("#terms", {
      state: "visible",
      timeout: 5000,
    });
    await global.page.click("#terms");
    console.log("Terms accepted");

    // Submit signup form
    console.log("Submitting signup form...");
    await clickAndWait('button[type="submit"]', "/api/auth/register");
    console.log("Signup form submitted");

    // Wait for OTP page
    console.log("Waiting for OTP page...");
    await global.page.waitForURL(
      `${global.FRONTEND_URL}/otp-verification.html`
    );
    console.log("OTP page loaded");

    // Try to access protected page
    console.log("Attempting to access protected page...");
    await global.page.goto(`${global.FRONTEND_URL}/index.html`);
    console.log("Waiting for redirect...");
    await global.page.waitForURL(`${global.FRONTEND_URL}/login.html`);
    console.log("Redirected to login page");

    // Verify error message
    console.log("Verifying error message...");
    await global.page.waitForSelector("#errorMessage", {
      state: "visible",
      timeout: 5000,
    });
    const errorMessage = await global.page.textContent("#errorMessage");
    expect(errorMessage).toContain("Please verify your account");
    console.log("Error message verified");
  });

  test("should handle remember me functionality", async () => {
    console.log("Starting remember me test...");
    // Go to login page
    console.log("Navigating to login page...");
    await global.page.goto(`${global.FRONTEND_URL}/login.html`);
    console.log("Waiting for JavaScript to load...");
    await waitForJS();
    console.log("JavaScript loaded");

    // Fill login form
    console.log("Filling login form...");
    await fillForm({
      identifier: "test@example.com",
      password: "Test@123456",
    });
    console.log("Login form filled");

    // Check remember me
    console.log("Checking remember me...");
    await global.page.waitForSelector("#rememberMe", {
      state: "visible",
      timeout: 5000,
    });
    await global.page.click("#rememberMe");
    console.log("Remember me checked");

    // Submit login form
    console.log("Submitting login form...");
    await clickAndWait('button[type="submit"]', "/api/auth/login");
    console.log("Login form submitted");

    // Wait for redirect to index
    console.log("Waiting for redirect to index...");
    await global.page.waitForURL(`${global.FRONTEND_URL}/index.html`);
    console.log("Redirected to index page");

    // Verify token is stored in localStorage
    console.log("Verifying token in localStorage...");
    const token = await global.page.evaluate(() =>
      window.localStorage.getItem("token")
    );
    expect(token).toBeTruthy();
    console.log("Token in localStorage verified");

    // Close and reopen page
    console.log("Closing and reopening page...");
    await global.page.close();
    global.page = await global.context.newPage();
    console.log("New page created");

    // Navigate to index
    console.log("Navigating to index...");
    await global.page.goto(`${global.FRONTEND_URL}/index.html`);
    console.log("Waiting for JavaScript to load...");
    await waitForJS();
    console.log("JavaScript loaded");

    // Verify still logged in
    console.log("Verifying still logged in...");
    const currentUrl = global.page.url();
    expect(currentUrl).toBe(`${global.FRONTEND_URL}/index.html`);
    console.log("Still logged in verified");
  });
});
