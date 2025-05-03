// Register a new admin user if login fails
async function register() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name: "Admin",
      lastName: "User",
      email: "admin@nettoria.com",
      password: "admin123",
      phoneNumber: "09109924707",
      role: "admin",
    });

    console.log("Registration successful");
    authToken = response.data.token;
    return true;
  } catch (error) {
    console.error(
      "Registration failed:",
      error.response ? error.response.data : error.message
    );
    return false;
  }
}
