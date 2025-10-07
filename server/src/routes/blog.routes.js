const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const authMiddleware = require("../middleware/auth.middleware");
const { auth, adminAuth } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const Blog = require("../models/Blog");
const BlogService = require('../services/blog.service');

// Validation middleware
const validateBlog = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
];

// Public routes
router.get("/", blogController.getAllBlogs);
router.get("/categories", blogController.getCategories);
router.get("/tags", blogController.getTags);
router.get("/:slug", blogController.getBlogBySlug);

// Protected routes (require authentication)
router.post("/", [auth, validateBlog], blogController.createBlog);
router.put("/:id", [auth, validateBlog], blogController.updateBlog);
router.delete("/:id", auth, blogController.deleteBlog);

// Admin routes
router.get("/admin/all", [auth, adminAuth], blogController.getAllBlogs);
router.put("/admin/:id/status", [auth, adminAuth], blogController.updateBlogStatus);

// Get all blogs with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const blogs = await Blog.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        blogs: blogs.rows,
        pagination: {
          total: blogs.count,
          page,
          pages: Math.ceil(blogs.count / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching blogs",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Get single blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Blog not found",
          code: "NOT_FOUND",
        },
      });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching blog",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Get all blog posts (public)
router.get('/posts',
  [
    body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    body('category').optional().isString().withMessage('Category must be a string'),
    body('search').optional().isString().withMessage('Search query must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { page = 1, limit = 10, category, search } = req.query;
      const posts = await BlogService.getPosts(page, limit, category, search);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get single blog post (public)
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await BlogService.getPost(postId);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create blog post (admin only)
router.post('/posts',
  adminAuth,
  [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('category').isString().notEmpty().withMessage('Category is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('featuredImage').optional().isURL().withMessage('Featured image must be a valid URL'),
    body('status').isIn(['draft', 'published']).withMessage('Status must be either draft or published')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = await BlogService.createPost(req.user.id, req.body);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update blog post (admin only)
router.put('/posts/:postId',
  adminAuth,
  [
    body('title').optional().isString().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().isString().notEmpty().withMessage('Content cannot be empty'),
    body('category').optional().isString().notEmpty().withMessage('Category cannot be empty'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('featuredImage').optional().isURL().withMessage('Featured image must be a valid URL'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be either draft or published')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { postId } = req.params;
      const post = await BlogService.updatePost(postId, req.body);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete blog post (admin only)
router.delete('/posts/:postId',
  adminAuth,
  async (req, res) => {
    try {
      const { postId } = req.params;
      await BlogService.deletePost(postId);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get post comments
router.get('/posts/:postId/comments',
  [
    body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { postId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const comments = await BlogService.getComments(postId, page, limit);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Add comment
router.post('/posts/:postId/comments',
  auth,
  [
    body('content').isString().notEmpty().withMessage('Comment content is required'),
    body('parentId').optional().isUUID().withMessage('Invalid parent comment ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { postId } = req.params;
      const { content, parentId } = req.body;
      const comment = await BlogService.addComment(req.user.id, postId, content, parentId);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update comment
router.put('/comments/:commentId',
  auth,
  [
    body('content').isString().notEmpty().withMessage('Comment content is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { commentId } = req.params;
      const { content } = req.body;
      const comment = await BlogService.updateComment(commentId, req.user.id, content);
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete comment
router.delete('/comments/:commentId',
  auth,
  async (req, res) => {
    try {
      const { commentId } = req.params;
      await BlogService.deleteComment(commentId, req.user.id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get blog categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await BlogService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add blog category (admin only)
router.post('/categories',
  adminAuth,
  [
    body('name').isString().notEmpty().withMessage('Category name is required'),
    body('description').optional().isString().withMessage('Description must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const category = await BlogService.addCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
