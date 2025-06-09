const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { body, validationResult } = require("express-validator");
const Blog = require("../models/Blog");

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
router.post("/", [authMiddleware, validateBlog], blogController.createBlog);
router.put("/:id", [authMiddleware, validateBlog], blogController.updateBlog);
router.delete("/:id", authMiddleware, blogController.deleteBlog);

// Admin routes
router.get("/admin/all", [authMiddleware, adminMiddleware], blogController.getAllBlogs);
router.put("/admin/:id/status", [authMiddleware, adminMiddleware], blogController.updateBlogStatus);

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

module.exports = router;
