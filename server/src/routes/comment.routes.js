const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middleware/auth.middleware");
const { auth, adminAuth } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Validation middleware
const validateComment = [
  body("content").trim().notEmpty().withMessage("Comment content is required"),
];

// Public routes
router.get("/blogs/:blogId/comments", commentController.getBlogComments);

// Protected routes (require authentication)
router.post(
  "/blogs/:blogId/comments",
  [authMiddleware.protect, validateComment],
  commentController.addComment
);
router.put(
  "/comments/:id",
  [authMiddleware.protect, validateComment],
  commentController.updateComment
);
router.delete("/comments/:id", authMiddleware.protect, commentController.deleteComment);

// Admin routes
router.put(
  "/admin/comments/:id/moderate",
  [authMiddleware.protect, adminAuth],
  commentController.moderateComment
);

module.exports = router; 