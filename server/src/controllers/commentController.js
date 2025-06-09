const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

// Get comments for a blog post
exports.getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await Comment.findAndCountAll({
      where: {
        blogId,
        status: 'approved',
        parentId: null // Only get top-level comments
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: ['author'],
    });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.rows.map(async (comment) => {
        const replies = await Comment.findAll({
          where: {
            parentId: comment.id,
            status: 'approved'
          },
          order: [['createdAt', 'ASC']],
          include: ['author']
        });
        return {
          ...comment.toJSON(),
          replies
        };
      })
    );

    res.json({
      comments: commentsWithReplies,
      totalPages: Math.ceil(comments.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};

// Add a new comment
exports.addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, parentId } = req.body;

    // Check if blog exists
    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // If this is a reply, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      content,
      blogId,
      authorId: req.user.id,
      parentId,
      status: req.user.isAdmin ? 'approved' : 'pending'
    });

    // Include author information in response
    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: ['author']
    });

    res.status(201).json(commentWithAuthor);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is author or admin
    if (comment.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.update({ content });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is author or admin
    if (comment.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};

// Moderate a comment (admin only)
exports.moderateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await comment.update({ status });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error moderating comment', error: error.message });
  }
}; 