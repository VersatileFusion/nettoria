const axios = require("axios");

const API = "http://localhost:5000/api";
const ADMIN_TOKEN = "YOUR_ADMIN_JWT_TOKEN_HERE"; // Replace with a real admin token

async function run() {
  try {
    // 1. List all users
    const usersRes = await axios.get(`${API}/users`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    console.log("All Users:", usersRes.data);

    // 2. List all orders
    const ordersRes = await axios.get(`${API}/orders`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    console.log("All Orders:", ordersRes.data);

    // 3. List all tickets
    const ticketsRes = await axios.get(`${API}/tickets`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    console.log("All Tickets:", ticketsRes.data);

    // 4. Send a notification (mock)
    // If you have an admin notification endpoint, update the path accordingly
    // const notifRes = await axios.post(`${API}/admin/notification`, {
    //   message: 'Test notification from admin.'
    // }, {
    //   headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    // });
    // console.log('Send Notification:', notifRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.stack || err.message);
  }
}

run();
