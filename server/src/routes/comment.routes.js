const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
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
  [authMiddleware, validateComment],
  commentController.addComment
);
router.put(
  "/comments/:id",
  [authMiddleware, validateComment],
  commentController.updateComment
);
router.delete("/comments/:id", authMiddleware, commentController.deleteComment);

// Admin routes
router.put(
  "/admin/comments/:id/moderate",
  [authMiddleware, adminMiddleware],
  commentController.moderateComment
);

module.exports = router; 