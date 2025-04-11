const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

console.log("Initializing Wallet Routes...");

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Virtual wallet management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Wallet:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "wlt-12345"
 *         userId:
 *           type: string
 *           example: "usr-67890"
 *         balance:
 *           type: number
 *           example: 250.50
 *         currency:
 *           type: string
 *           example: "USD"
 *         status:
 *           type: string
 *           enum: [active, suspended, closed]
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-04-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-20T15:40:00Z"
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "txn-12345"
 *         walletId:
 *           type: string
 *           example: "wlt-12345"
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal, payment, refund, credit]
 *           example: "deposit"
 *         amount:
 *           type: number
 *           example: 100.00
 *         currency:
 *           type: string
 *           example: "USD"
 *         description:
 *           type: string
 *           example: "Deposit via credit card"
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, reversed]
 *           example: "completed"
 *         reference:
 *           type: string
 *           example: "ord-67890"
 *         metadata:
 *           type: object
 *           properties:
 *             paymentMethod:
 *               type: string
 *               example: "credit_card"
 *             lastFour:
 *               type: string
 *               example: "4242"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-20T15:30:00Z"
 */

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get user's wallet information
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       $ref: '#/components/schemas/Wallet'
 *       404:
 *         description: Wallet not found
 *       401:
 *         description: Not authenticated
 */
router.get("/", authMiddleware.protect, (req, res) => {
  console.log(`Fetching wallet for user ID: ${req.user.id}`);

  // Sample wallet data
  const wallet = {
    id: "wlt-12345",
    userId: req.user.id,
    balance: 250.5,
    currency: "USD",
    status: "active",
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-06-20T15:40:00Z",
  };

  res.status(200).json({
    status: "success",
    data: {
      wallet,
    },
  });
});

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get user's wallet transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, payment, refund, credit]
 *         description: Filter transactions by type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, reversed]
 *         description: Filter transactions by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for transaction history (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for transaction history (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Not authenticated
 */
router.get("/transactions", authMiddleware.protect, (req, res) => {
  console.log(`Fetching transactions for user ID: ${req.user.id}`);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const type = req.query.type;
  const status = req.query.status;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Sample transactions data
  const transactions = [
    {
      id: "txn-12345",
      walletId: "wlt-12345",
      type: "deposit",
      amount: 100.0,
      currency: "USD",
      description: "Deposit via credit card",
      status: "completed",
      reference: null,
      metadata: {
        paymentMethod: "credit_card",
        lastFour: "4242",
      },
      createdAt: "2023-06-20T15:30:00Z",
    },
    {
      id: "txn-67890",
      walletId: "wlt-12345",
      type: "payment",
      amount: -49.99,
      currency: "USD",
      description: "Payment for Database Service",
      status: "completed",
      reference: "ord-67890",
      metadata: {
        serviceId: "svc-98765",
        serviceName: "Database Service",
      },
      createdAt: "2023-06-21T09:45:00Z",
    },
    {
      id: "txn-24680",
      walletId: "wlt-12345",
      type: "credit",
      amount: 20.0,
      currency: "USD",
      description: "Credit for referral",
      status: "completed",
      reference: "ref-12345",
      metadata: {
        referral: "usr-13579",
      },
      createdAt: "2023-06-25T14:20:00Z",
    },
  ];

  // Apply filters
  let filteredTransactions = [...transactions];

  if (type) {
    filteredTransactions = filteredTransactions.filter(
      (txn) => txn.type === type
    );
  }

  if (status) {
    filteredTransactions = filteredTransactions.filter(
      (txn) => txn.status === status
    );
  }

  if (startDate) {
    const startTimestamp = new Date(startDate).getTime();
    filteredTransactions = filteredTransactions.filter((txn) => {
      const txnTimestamp = new Date(txn.createdAt).getTime();
      return txnTimestamp >= startTimestamp;
    });
  }

  if (endDate) {
    const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000; // Include the entire end day
    filteredTransactions = filteredTransactions.filter((txn) => {
      const txnTimestamp = new Date(txn.createdAt).getTime();
      return txnTimestamp <= endTimestamp;
    });
  }

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  res.status(200).json({
    status: "success",
    results: paginatedTransactions.length,
    data: {
      transactions: paginatedTransactions,
    },
  });
});

/**
 * @swagger
 * /api/wallet/deposit:
 *   post:
 *     summary: Deposit funds to wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethodId
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100.00
 *                 minimum: 10.00
 *               paymentMethodId:
 *                 type: string
 *                 example: "pm-12345"
 *     responses:
 *       200:
 *         description: Deposit successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     wallet:
 *                       $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authenticated
 */
router.post("/deposit", authMiddleware.protect, (req, res) => {
  console.log(`Processing deposit for user ID: ${req.user.id}`, req.body);

  const { amount, paymentMethodId } = req.body;

  // Validate amount
  if (!amount || typeof amount !== "number" || amount < 10) {
    return res.status(400).json({
      status: "error",
      message: "Amount must be a number greater than or equal to 10",
    });
  }

  // Validate payment method
  if (!paymentMethodId) {
    return res.status(400).json({
      status: "error",
      message: "Payment method ID is required",
    });
  }

  // Sample payment methods data
  const paymentMethods = {
    "pm-12345": {
      id: "pm-12345",
      type: "credit_card",
      details: {
        lastFour: "4242",
        cardType: "Visa",
        expiryMonth: "12",
        expiryYear: "2025",
      },
    },
  };

  // Check if payment method exists
  if (!paymentMethods[paymentMethodId]) {
    return res.status(404).json({
      status: "error",
      message: "Payment method not found",
    });
  }

  const paymentMethod = paymentMethods[paymentMethodId];

  // Sample wallet data
  const wallet = {
    id: "wlt-12345",
    userId: req.user.id,
    balance: 250.5,
    currency: "USD",
    status: "active",
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-06-20T15:40:00Z",
  };

  // Generate transaction ID
  const transactionId = `txn-${Math.floor(Math.random() * 100000)}`;

  // Create transaction
  const transaction = {
    id: transactionId,
    walletId: wallet.id,
    type: "deposit",
    amount: parseFloat(amount.toFixed(2)),
    currency: "USD",
    description: `Deposit via ${paymentMethod.type}`,
    status: "completed",
    reference: null,
    metadata: {
      paymentMethod: paymentMethod.type,
      lastFour: paymentMethod.details.lastFour,
    },
    createdAt: new Date().toISOString(),
  };

  // Update wallet balance
  const updatedWallet = {
    ...wallet,
    balance: parseFloat((wallet.balance + amount).toFixed(2)),
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({
    status: "success",
    data: {
      transaction,
      wallet: updatedWallet,
    },
  });
});

/**
 * @swagger
 * /api/wallet/withdraw:
 *   post:
 *     summary: Withdraw funds from wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - withdrawalMethodId
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50.00
 *                 minimum: 10.00
 *               withdrawalMethodId:
 *                 type: string
 *                 example: "wm-12345"
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     wallet:
 *                       $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Bad request or insufficient funds
 *       401:
 *         description: Not authenticated
 */
router.post("/withdraw", authMiddleware.protect, (req, res) => {
  console.log(`Processing withdrawal for user ID: ${req.user.id}`, req.body);

  const { amount, withdrawalMethodId } = req.body;

  // Validate amount
  if (!amount || typeof amount !== "number" || amount < 10) {
    return res.status(400).json({
      status: "error",
      message: "Amount must be a number greater than or equal to 10",
    });
  }

  // Validate withdrawal method
  if (!withdrawalMethodId) {
    return res.status(400).json({
      status: "error",
      message: "Withdrawal method ID is required",
    });
  }

  // Sample wallet data
  const wallet = {
    id: "wlt-12345",
    userId: req.user.id,
    balance: 250.5,
    currency: "USD",
    status: "active",
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-06-20T15:40:00Z",
  };

  // Check for sufficient funds
  if (wallet.balance < amount) {
    return res.status(400).json({
      status: "error",
      message: "Insufficient funds",
    });
  }

  // Sample withdrawal methods data
  const withdrawalMethods = {
    "wm-12345": {
      id: "wm-12345",
      type: "bank_account",
      details: {
        bankName: "Example Bank",
        accountNumber: "*****6789",
      },
    },
  };

  // Check if withdrawal method exists
  if (!withdrawalMethods[withdrawalMethodId]) {
    return res.status(404).json({
      status: "error",
      message: "Withdrawal method not found",
    });
  }

  const withdrawalMethod = withdrawalMethods[withdrawalMethodId];

  // Generate transaction ID
  const transactionId = `txn-${Math.floor(Math.random() * 100000)}`;

  // Create transaction
  const transaction = {
    id: transactionId,
    walletId: wallet.id,
    type: "withdrawal",
    amount: -parseFloat(amount.toFixed(2)), // Negative amount for withdrawal
    currency: "USD",
    description: `Withdrawal to ${withdrawalMethod.details.bankName}`,
    status: "pending", // Withdrawals typically pending until processed
    reference: null,
    metadata: {
      withdrawalMethod: withdrawalMethod.type,
      bankName: withdrawalMethod.details.bankName,
      accountNumber: withdrawalMethod.details.accountNumber,
    },
    createdAt: new Date().toISOString(),
  };

  // Update wallet balance
  const updatedWallet = {
    ...wallet,
    balance: parseFloat((wallet.balance - amount).toFixed(2)),
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({
    status: "success",
    data: {
      transaction,
      wallet: updatedWallet,
    },
  });
});

/**
 * @swagger
 * /api/wallet/transfer:
 *   post:
 *     summary: Transfer funds to another user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - recipientId
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 25.00
 *                 minimum: 5.00
 *               recipientId:
 *                 type: string
 *                 example: "usr-98765"
 *               note:
 *                 type: string
 *                 example: "Payment for hosting services"
 *     responses:
 *       200:
 *         description: Transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     wallet:
 *                       $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Bad request or insufficient funds
 *       404:
 *         description: Recipient not found
 *       401:
 *         description: Not authenticated
 */
router.post("/transfer", authMiddleware.protect, (req, res) => {
  console.log(`Processing transfer for user ID: ${req.user.id}`, req.body);

  const { amount, recipientId, note } = req.body;

  // Validate amount
  if (!amount || typeof amount !== "number" || amount < 5) {
    return res.status(400).json({
      status: "error",
      message: "Amount must be a number greater than or equal to 5",
    });
  }

  // Validate recipient
  if (!recipientId) {
    return res.status(400).json({
      status: "error",
      message: "Recipient ID is required",
    });
  }

  // Sample wallet data
  const wallet = {
    id: "wlt-12345",
    userId: req.user.id,
    balance: 250.5,
    currency: "USD",
    status: "active",
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-06-20T15:40:00Z",
  };

  // Check for sufficient funds
  if (wallet.balance < amount) {
    return res.status(400).json({
      status: "error",
      message: "Insufficient funds",
    });
  }

  // Sample users data
  const users = {
    "usr-98765": {
      id: "usr-98765",
      name: "Jane Doe",
      email: "jane@example.com",
      walletId: "wlt-67890",
    },
  };

  // Check if recipient exists
  if (!users[recipientId]) {
    return res.status(404).json({
      status: "error",
      message: "Recipient not found",
    });
  }

  const recipient = users[recipientId];

  // Generate transaction ID
  const transactionId = `txn-${Math.floor(Math.random() * 100000)}`;
  const transferReference = `trf-${Math.floor(Math.random() * 100000)}`;

  // Create transaction
  const transaction = {
    id: transactionId,
    walletId: wallet.id,
    type: "withdrawal",
    amount: -parseFloat(amount.toFixed(2)), // Negative amount for sender
    currency: "USD",
    description: note || `Transfer to ${recipient.name}`,
    status: "completed",
    reference: transferReference,
    metadata: {
      transferType: "user",
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientWalletId: recipient.walletId,
    },
    createdAt: new Date().toISOString(),
  };

  // Update wallet balance
  const updatedWallet = {
    ...wallet,
    balance: parseFloat((wallet.balance - amount).toFixed(2)),
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({
    status: "success",
    data: {
      transaction,
      wallet: updatedWallet,
    },
  });
});

// For demonstration only - mock endpoint
router.get("/demo", (req, res) => {
  res.json({
    message: "Wallet API is working (mock mode)",
    demoWallet: {
      id: "wlt-demo",
      balance: 100.0,
      currency: "USD",
    },
    demoTransactions: [
      {
        id: "txn-demo-1",
        type: "deposit",
        amount: 100.0,
        status: "completed",
      },
      {
        id: "txn-demo-2",
        type: "payment",
        amount: -25.0,
        status: "completed",
      },
    ],
  });
});

console.log("Wallet Routes initialized successfully");

module.exports = router;
