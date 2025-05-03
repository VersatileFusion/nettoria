// Login with email/phone and password
login: async (req, res) => {
  console.log("Processing login request", req.body);

  try {
    // Support both 'identifier' field (from API docs) and direct email/phoneNumber
    const { identifier, email, phoneNumber, password } = req.body;
    
    // Determine which identifier to use (prioritize explicit identifier field)
    const userIdentifier = identifier || email || phoneNumber;

    if (!userIdentifier || !password) {
      console.log("Login failed: Missing identifier or password");
      return res.status(400).json({
        status: "error",
        message: "Please provide email/phone and password",
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { email: userIdentifier },
          { phoneNumber: userIdentifier },
        ],
      },
    });

    if (!user || !(await user.comparePassword(password))) {
      console.log(`Login failed: Invalid credentials for ${userIdentifier}`);
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = authUtils.generateToken(user);

    console.log(`Login successful for ${userIdentifier}`);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
          nationalId: user.nationalId,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Login failed",
      error: error.message,
    });
  }
}, 