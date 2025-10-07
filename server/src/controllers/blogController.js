const Blog = require('../models/Blog');
const { Op } = require('sequelize');
const slugify = require('slugify');

// Get all blogs with pagination and filters
exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      status: 'published'
    };

    if (category) {
      whereClause.category = category;
    }

    if (tag) {
      whereClause.tags = { [Op.contains]: [tag] };
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const blogs = await Blog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['publishedAt', 'DESC']],
      include: ['author']
    });

    res.json({
      blogs: blogs.rows,
      totalPages: Math.ceil(blogs.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
};

// Get single blog by slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      where: { slug: req.params.slug },
      include: ['author']
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    await blog.increment('viewCount');

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog', error: error.message });
  }
};

// Create new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featuredImage } = req.body;
    const slug = slugify(title, { lower: true });

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      authorId: req.user.id,
      status: 'draft'
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog', error: error.message });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category, tags, featuredImage, status } = req.body;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is author or admin
    if (blog.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = {
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      status
    };

    if (title) {
      updates.slug = slugify(title, { lower: true });
    }

    if (status === 'published' && !blog.publishedAt) {
      updates.publishedAt = new Date();
    }

    await blog.update(updates);

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is author or admin
    if (blog.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await blog.destroy();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
};

// Get blog categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Blog.findAll({
      attributes: ['category'],
      where: {
        category: { [Op.not]: null },
        status: 'published'
      },
      group: ['category']
    });

    res.json(categories.map(cat => cat.category));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get blog tags
exports.getTags = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      attributes: ['tags'],
      where: {
        status: 'published'
      }
    });

    const tags = [...new Set(blogs.flatMap(blog => blog.tags))];
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tags', error: error.message });
  }
};

// Update blog status (admin only)
exports.updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be draft, published, or archived' });
    }

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const updates = { status };
    
    if (status === 'published' && !blog.publishedAt) {
      updates.publishedAt = new Date();
    }

    await blog.update(updates);

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog status', error: error.message });
  }
}; 