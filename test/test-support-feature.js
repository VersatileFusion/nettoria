const axios = require("axios");

const API = "http://localhost:5000/api/tickets";
const testUser = {
  email: "test@example.com",
  password: "Password123!",
};

async function run() {
  try {
    // Login to get token
    const loginRes = await axios.post(
      "http://localhost:5000/api/auth/login",
      testUser
    );
    const token = loginRes.data.token;
    if (!token) throw new Error("No token received from login");
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 1. Create a ticket
    const createRes = await axios.post(
      API,
      {
        subject: "Test Ticket",
        category: "technical",
        message: "This is a test ticket.",
      },
      authHeader
    );
    console.log("Create Ticket:", createRes.data);
    const ticketId = createRes.data.id || createRes.data._id;
    if (!ticketId) throw new Error("Ticket creation failed");

    // 2. List tickets
    const listRes = await axios.get(API, authHeader);
    console.log("Tickets:", listRes.data);

    // 3. Reply to a ticket
    const replyRes = await axios.post(
      `${API}/${ticketId}/reply`,
      {
        message: "This is a test reply.",
      },
      authHeader
    );
    console.log("Reply:", replyRes.data);

    // 4. Close the ticket
    const closeRes = await axios.patch(
      `${API}/${ticketId}/close`,
      {},
      authHeader
    );
    console.log("Close Ticket:", closeRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.stack || err.message);
  }
}

run();
