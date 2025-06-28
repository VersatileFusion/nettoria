const { Op } = require('sequelize');
const Blog = require('../models/blog');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const blogPostController = {
  // Get a single blog post by slug
  getBlogPost: async (req, res, next) => {
    try {
      const { slug } = req.params;
      
      const blogPost = await Blog.findOne({
        where: { slug, status: 'published' },
        include: [
          {
            model: Comment,
            where: { status: 'approved' },
            required: false,
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!blogPost) {
        return next(new ApiError('Blog post not found', 404));
      }

      // Increment view count
      await blogPost.increment('viewCount');

      res.json({
        success: true,
        data: blogPost
      });
    } catch (error) {
      logger.error('Error in getBlogPost:', error);
      next(error);
    }
  },

  // Get related blog posts
  getRelatedPosts: async (req, res, next) => {
    try {
      const { slug } = req.params;
      
      const currentPost = await Blog.findOne({
        where: { slug, status: 'published' }
      });

      if (!currentPost) {
        return next(new ApiError('Blog post not found', 404));
      }

      const relatedPosts = await Blog.findAll({
        where: {
          category: currentPost.category,
          status: 'published',
          id: { [Op.ne]: currentPost.id }
        },
        limit: 5,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: relatedPosts
      });
    } catch (error) {
      logger.error('Error in getRelatedPosts:', error);
      next(error);
    }
  },

  // Get comments for a blog post
  getBlogComments: async (req, res, next) => {
    try {
      const { blogId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const comments = await Comment.findAndCountAll({
        where: {
          blogId,
          status: 'approved'
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          comments: comments.rows,
          pagination: {
            total: comments.count,
            page,
            pages: Math.ceil(comments.count / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error in getBlogComments:', error);
      next(error);
    }
  },

  // Add a comment to a blog post
  addComment: async (req, res, next) => {
    try {
      const { blogId } = req.params;
      const { content } = req.body;

      // Check if blog post exists
      const blogPost = await Blog.findByPk(blogId);
      if (!blogPost) {
        return next(new ApiError('Blog post not found', 404));
      }

      const comment = await Comment.create({
        content,
        blogId,
        userId: req.user.id,
        status: 'pending' // Comments need moderation by default
      });

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully and is pending moderation'
      });
    } catch (error) {
      logger.error('Error in addComment:', error);
      next(error);
    }
  },

  // Update a comment
  updateComment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const comment = await Comment.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!comment) {
        return next(new ApiError('Comment not found or you are not authorized to edit it', 404));
      }

      await comment.update({
        content,
        status: 'pending' // Reset to pending for moderation
      });

      res.json({
        success: true,
        data: comment,
        message: 'Comment updated successfully and is pending moderation'
      });
    } catch (error) {
      logger.error('Error in updateComment:', error);
      next(error);
    }
  },

  // Delete a comment
  deleteComment: async (req, res, next) => {
    try {
      const { id } = req.params;

      const comment = await Comment.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!comment) {
        return next(new ApiError('Comment not found or you are not authorized to delete it', 404));
      }

      await comment.destroy();

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteComment:', error);
      next(error);
    }
  }
};

module.exports = blogPostController; 