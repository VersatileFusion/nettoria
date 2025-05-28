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

    // 1. List wallet info
    const walletRes = await axios.get(`${API}/wallet`, authHeader);
    console.log("Wallet:", walletRes.data);

    // 2. Top up wallet (mock amount)
    const topupRes = await axios.post(
      `${API}/wallet/topup`,
      { amount: 100 },
      authHeader
    );
    console.log("Top Up:", topupRes.data);

    // 3. List transactions
    const txRes = await axios.get(`${API}/wallet/transactions`, authHeader);
    console.log("Transactions:", txRes.data);

    // 4. Pay for an order (mock orderId)
    const ordersRes = await axios.get(`${API}/orders`, authHeader);
    const order = ordersRes.data[0];
    if (order) {
      const payRes = await axios.post(
        `${API}/orders/${order.id}/pay`,
        {},
        authHeader
      );
      console.log("Pay Order:", payRes.data);
    } else {
      console.log("No orders to pay");
    }
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.stack || err.message);
  }
}

run();
