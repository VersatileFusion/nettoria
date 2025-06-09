const { Blog, Category, Tag } = require("../models");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const { Op } = require("sequelize");
const slugify = require("slugify");

const blogController = {
  /**
   * Get all blog posts with pagination and filters
   */
  getAllPosts: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, category, tag } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (category) where.categoryId = category;
      if (tag) where["$tags.id$"] = tag;

      const posts = await Blog.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            attributes: ["id", "name"],
          },
          {
            model: Tag,
            attributes: ["id", "name"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data: {
          posts: posts.rows,
          total: posts.count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(posts.count / limit),
        },
      });
    } catch (error) {
      logger.error("Error in getAllPosts:", error);
      next(error);
    }
  },

  /**
   * Get blog post by ID
   */
  getPostById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const post = await Blog.findByPk(id, {
        include: [
          {
            model: Category,
            attributes: ["id", "name"],
          },
          {
            model: Tag,
            attributes: ["id", "name"],
          },
        ],
      });

      if (!post) {
        return next(new ApiError("Blog post not found", 404));
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      logger.error("Error in getPostById:", error);
      next(error);
    }
  },

  /**
   * Create a new blog post
   */
  createPost: async (req, res, next) => {
    try {
      const { title, content, category, tags, featuredImage } = req.body;

      // Create or find category
      const [categoryInstance] = await Category.findOrCreate({
        where: { name: category },
      });

      // Create blog post
      const post = await Blog.create({
        title,
        content,
        categoryId: categoryInstance.id,
        featuredImage,
        createdBy: req.user.id,
      });

      // Handle tags
      if (tags && tags.length > 0) {
        const tagInstances = await Promise.all(
          tags.map((tagName) =>
            Tag.findOrCreate({
              where: { name: tagName },
            })
          )
        );
        await post.setTags(tagInstances.map(([tag]) => tag));
      }

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error) {
      logger.error("Error in createPost:", error);
      next(error);
    }
  },

  /**
   * Update a blog post
   */
  updatePost: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, content, category, tags, featuredImage } = req.body;

      const post = await Blog.findByPk(id);
      if (!post) {
        return next(new ApiError("Blog post not found", 404));
      }

      // Update category if provided
      if (category) {
        const [categoryInstance] = await Category.findOrCreate({
          where: { name: category },
        });
        post.categoryId = categoryInstance.id;
      }

      // Update post fields
      if (title) post.title = title;
      if (content) post.content = content;
      if (featuredImage) post.featuredImage = featuredImage;

      await post.save();

      // Update tags if provided
      if (tags) {
        const tagInstances = await Promise.all(
          tags.map((tagName) =>
            Tag.findOrCreate({
              where: { name: tagName },
            })
          )
        );
        await post.setTags(tagInstances.map(([tag]) => tag));
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      logger.error("Error in updatePost:", error);
      next(error);
    }
  },

  /**
   * Delete a blog post
   */
  deletePost: async (req, res, next) => {
    try {
      const { id } = req.params;

      const post = await Blog.findByPk(id);
      if (!post) {
        return next(new ApiError("Blog post not found", 404));
      }

      await post.destroy();

      res.json({
        success: true,
        message: "Blog post deleted successfully",
      });
    } catch (error) {
      logger.error("Error in deletePost:", error);
      next(error);
    }
  },

  /**
   * Get all blog categories
   */
  getCategories: async (req, res, next) => {
    try {
      const categories = await Category.findAll({
        include: [
          {
            model: Blog,
            attributes: ["id"],
          },
        ],
      });

      res.json({
        success: true,
        data: categories.map((category) => ({
          ...category.toJSON(),
          postCount: category.Blogs.length,
        })),
      });
    } catch (error) {
      logger.error("Error in getCategories:", error);
      next(error);
    }
  },

  /**
   * Get all blog tags
   */
  getTags: async (req, res, next) => {
    try {
      const tags = await Tag.findAll({
        include: [
          {
            model: Blog,
            attributes: ["id"],
          },
        ],
      });

      res.json({
        success: true,
        data: tags.map((tag) => ({
          ...tag.toJSON(),
          postCount: tag.Blogs.length,
        })),
      });
    } catch (error) {
      logger.error("Error in getTags:", error);
      next(error);
    }
  },

  /**
   * Search blog posts
   */
  searchPosts: async (req, res, next) => {
    try {
      const { query } = req.query;

      const posts = await Blog.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${query}%` } },
            { content: { [Op.iLike]: `%${query}%` } },
          ],
        },
        include: [
          {
            model: Category,
            attributes: ["id", "name"],
          },
          {
            model: Tag,
            attributes: ["id", "name"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data: posts,
      });
    } catch (error) {
      logger.error("Error in searchPosts:", error);
      next(error);
    }
  },

  // Create a new blog post
  createBlog: async (req, res) => {
    try {
      const { title, content, featuredImage, metaDescription, metaKeywords } =
        req.body;
      const slug = slugify(title, { lower: true });

      const blog = await Blog.create({
        title,
        content,
        slug,
        featuredImage,
        author: req.user.id,
        metaDescription,
        metaKeywords,
      });

      res.status(201).json({
        success: true,
        data: blog,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get all blog posts
  getAllBlogs: async (req, res) => {
    try {
      const { page = 1, limit = 10, status = "published" } = req.query;
      const offset = (page - 1) * limit;

      const blogs = await Blog.findAndCountAll({
        where: { status },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: blogs.rows,
        total: blogs.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(blogs.count / limit),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get single blog post
  getBlog: async (req, res) => {
    try {
      const blog = await Blog.findByPk(req.params.id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          error: "Blog post not found",
        });
      }

      res.status(200).json({
        success: true,
        data: blog,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Update blog post
  updateBlog: async (req, res) => {
    try {
      const {
        title,
        content,
        featuredImage,
        status,
        metaDescription,
        metaKeywords,
      } = req.body;
      const blog = await Blog.findByPk(req.params.id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          error: "Blog post not found",
        });
      }

      // Check if user is the author
      if (blog.author !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to update this blog post",
        });
      }

      const updateData = {
        title: title || blog.title,
        content: content || blog.content,
        featuredImage: featuredImage || blog.featuredImage,
        status: status || blog.status,
        metaDescription: metaDescription || blog.metaDescription,
        metaKeywords: metaKeywords || blog.metaKeywords,
      };

      if (title) {
        updateData.slug = slugify(title, { lower: true });
      }

      const updatedBlog = await blog.update(updateData);

      res.status(200).json({
        success: true,
        data: updatedBlog,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Delete blog post
  deleteBlog: async (req, res) => {
    try {
      const blog = await Blog.findByPk(req.params.id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          error: "Blog post not found",
        });
      }

      // Check if user is the author
      if (blog.author !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to delete this blog post",
        });
      }

      await blog.destroy();

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Search blog posts
  searchBlogs: async (req, res) => {
    try {
      const { query, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const blogs = await Blog.findAndCountAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { content: { [Op.like]: `%${query}%` } },
          ],
          status: "published",
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: blogs.rows,
        total: blogs.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(blogs.count / limit),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = blogController;
