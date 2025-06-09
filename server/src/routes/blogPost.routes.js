const express = require('express');
const router = express.Router();
const blogPostController = require('../controllers/blogPostController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Validation middleware
const validateComment = [
  body('content').trim().notEmpty().withMessage('Comment content is required')
];

// Public routes
router.get('/:slug', blogPostController.getBlogPost);
router.get('/:slug/related', blogPostController.getRelatedPosts);
router.get('/:blogId/comments', blogPostController.getBlogComments);

// Protected routes
router.post(
  '/:blogId/comments',
  [authMiddleware, validateComment],
  blogPostController.addComment
);
router.put(
  '/comments/:id',
  [authMiddleware, validateComment],
  blogPostController.updateComment
);
router.delete(
  '/comments/:id',
  authMiddleware,
  blogPostController.deleteComment
);

module.exports = router; 