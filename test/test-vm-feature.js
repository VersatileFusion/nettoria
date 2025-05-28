const axios = require("axios");
const setupTestUser = require("./helpers/setup-test-user");

const API = "http://localhost:5000/api";

async function run() {
  try {
    // Ensure we have a verified test user
    console.log("Setting up verified test user...");
    const testUser = await setupTestUser();
    console.log(`Using verified test user (ID: ${testUser.id})`);

    // Login to get token
    console.log("Logging in to get authentication token...");
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    if (loginRes.data.data?.requiresOtp) {
      console.log("Login requires OTP verification, handling via database...");

      // Simulate completing OTP verification
      // In a real environment, we would submit the OTP code
      // For testing, we'll just assume successful verification and get the token

      // For now, use a mock token for testing
      console.log("Using mock token for testing");
      const token = "mock_token";
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };

      console.log(
        "⚠️ Note: Tests may fail due to mock token. If API server is running properly, update this code to get a real token."
      );

      // Continue with VM tests
      testVmFeatures(token, authHeader);
    } else if (loginRes.data.token) {
      // Normal login success case
      const token = loginRes.data.token;
      console.log("Authentication successful, received token");
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };

      // Run VM tests
      testVmFeatures(token, authHeader);
    } else {
      throw new Error(
        "No token received from login: " + JSON.stringify(loginRes.data)
      );
    }
  } catch (err) {
    console.error(
      "Error:",
      err.response ? err.response.data : err.stack || err.message
    );
  }
}

async function testVmFeatures(token, authHeader) {
  try {
    // 1. List available services
    console.log("\n1. Testing listing available services...");
    const servicesRes = await axios.get(`${API}/services`, authHeader);
    console.log("Services:", servicesRes.data);
    const service = servicesRes.data[0];
    if (!service) throw new Error("No services found");

    // 2. Configure a service (mock config)
    console.log("\n2. Testing service configuration...");
    const configRes = await axios.post(
      `${API}/services/configure`,
      {
        serviceId: service.id,
        cpu: 2,
        ram: 4096,
        storage: 50,
      },
      authHeader
    );
    console.log("Service Config:", configRes.data);

    // 3. Place an order
    console.log("\n3. Testing order placement...");
    const orderRes = await axios.post(
      `${API}/orders`,
      {
        serviceId: service.id,
        config: configRes.data,
      },
      authHeader
    );
    console.log("Order:", orderRes.data);

    // 4. List VMs
    console.log("\n4. Testing VM listing...");
    const vmsRes = await axios.get(`${API}/vcenter/vms`, authHeader);
    console.log("VMs:", vmsRes.data);
    const vm = vmsRes.data[0];
    if (!vm) throw new Error("No VMs found");

    // 5. Power on/off a VM
    console.log("\n5. Testing VM power operations...");
    const powerRes = await axios.post(
      `${API}/vcenter/vms/${vm.id}/power`,
      {
        action: "poweroff",
      },
      authHeader
    );
    console.log("Power Off VM:", powerRes.data);

    console.log("\n✅ All VM tests completed successfully!");
  } catch (err) {
    console.error(
      "VM Test Error:",
      err.response ? err.response.data : err.message
    );
  }
}

run();
