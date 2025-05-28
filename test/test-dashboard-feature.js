const axios = require("axios");

const API = "http://localhost:5000/api";
const testUser = {
  email: "test@example.com",
  password: "Password123!",
};

async function run() {
  try {
    // Login to get token
    const loginRes = await axios.post(`${API}/auth/login`, testUser);
    const token = loginRes.data.token;
    if (!token) throw new Error("No token received from login");
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 1. List user services
    const servicesRes = await axios.get(`${API}/services`, authHeader);
    console.log("User Services:", servicesRes.data);
    const service = servicesRes.data[0];
    if (!service) throw new Error("No services found");

    // 2. List transaction history
    const txRes = await axios.get(`${API}/wallet/transactions`, authHeader);
    console.log("Transaction History:", txRes.data);

    // 3. Extend a service (mock)
    const extendRes = await axios.post(
      `${API}/services/${service.id}/extend`,
      {},
      authHeader
    );
    console.log("Extend Service:", extendRes.data);

    // 4. Cancel a service (mock)
    const cancelRes = await axios.post(
      `${API}/services/${service.id}/cancel`,
      {},
      authHeader
    );
    console.log("Cancel Service:", cancelRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.stack || err.message);
  }
}

run();
