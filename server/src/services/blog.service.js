const { BlogPost, Comment, Category, User } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notifications');

class BlogService {
  static async getPosts(page = 1, limit = 10, category = null, search = null) {
    const offset = (page - 1) * limit;
    const where = { status: 'published' };

    if (category) {
      where.category = category;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: posts } = await BlogPost.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      posts,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async getPost(postId) {
    const post = await BlogPost.findOne({
      where: {
        id: postId,
        status: 'published'
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Comment,
          where: { parentId: null },
          required: false,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'avatar']
            },
            {
              model: Comment,
              as: 'replies',
              include: [
                {
                  model: User,
                  attributes: ['id', 'name', 'avatar']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Increment view count
    await post.increment('views');

    return post;
  }

  static async createPost(userId, postData) {
    const { title, content, category, tags, featuredImage, status } = postData;

    // Validate category
    const categoryExists = await Category.findOne({ where: { name: category } });
    if (!categoryExists) {
      throw new Error('Invalid category');
    }

    const post = await BlogPost.create({
      userId,
      title,
      content,
      category,
      tags,
      featuredImage,
      status,
      views: 0
    });

    // Notify subscribers if post is published
    if (status === 'published') {
      await this.notifySubscribers(post);
    }

    return post;
  }

  static async updatePost(postId, updateData) {
    const post = await BlogPost.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Validate category if provided
    if (updateData.category) {
      const categoryExists = await Category.findOne({ where: { name: updateData.category } });
      if (!categoryExists) {
        throw new Error('Invalid category');
      }
    }

    // Check if status is changing to published
    const wasPublished = post.status === 'published';
    const willBePublished = updateData.status === 'published';

    await post.update(updateData);

    // Notify subscribers if post is being published for the first time
    if (!wasPublished && willBePublished) {
      await this.notifySubscribers(post);
    }

    return post;
  }

  static async deletePost(postId) {
    const post = await BlogPost.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Delete all comments associated with the post
    await Comment.destroy({ where: { postId } });

    await post.destroy();
  }

  static async getComments(postId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        postId,
        parentId: null
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'avatar']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      comments,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async addComment(userId, postId, content, parentId = null) {
    const post = await BlogPost.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment || parentComment.postId !== postId) {
        throw new Error('Invalid parent comment');
      }
    }

    const comment = await Comment.create({
      userId,
      postId,
      content,
      parentId
    });

    // Notify post author
    if (post.userId !== userId) {
      await createNotification({
        userId: post.userId,
        type: 'new_comment',
        title: 'New Comment',
        message: `Someone commented on your post "${post.title}"`,
        data: { postId, commentId: comment.id }
      });
    }

    // Notify parent comment author if it's a reply
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId, { include: [User] });
      if (parentComment && parentComment.userId !== userId) {
        await createNotification({
          userId: parentComment.userId,
          type: 'comment_reply',
          title: 'New Reply',
          message: `Someone replied to your comment on "${post.title}"`,
          data: { postId, commentId: comment.id }
        });
      }
    }

    return comment;
  }

  static async updateComment(commentId, userId, content) {
    const comment = await Comment.findOne({
      where: {
        id: commentId,
        userId
      }
    });

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    await comment.update({ content });
    return comment;
  }

  static async deleteComment(commentId, userId) {
    const comment = await Comment.findOne({
      where: {
        id: commentId,
        userId
      }
    });

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    // Delete all replies to this comment
    await Comment.destroy({
      where: { parentId: commentId }
    });

    await comment.destroy();
  }

  static async getCategories() {
    return await Category.findAll({
      attributes: ['id', 'name', 'description', 'postCount'],
      order: [['name', 'ASC']]
    });
  }

  static async addCategory(categoryData) {
    const { name, description } = categoryData;

    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: { name: { [Op.iLike]: name } }
    });

    if (existingCategory) {
      throw new Error('Category already exists');
    }

    return await Category.create({
      name,
      description,
      postCount: 0
    });
  }

  static async notifySubscribers(post) {
    // Get all users who have subscribed to the blog
    const subscribers = await User.findAll({
      where: { blogSubscribed: true }
    });

    // Create notifications for each subscriber
    for (const subscriber of subscribers) {
      await createNotification({
        userId: subscriber.id,
        type: 'new_blog_post',
        title: 'New Blog Post',
        message: `New post published: "${post.title}"`,
        data: { postId: post.id }
      });
    }
  }
}

module.exports = BlogService; 