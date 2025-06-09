const Joi = require("joi");

const validateBlog = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(200),
    content: Joi.string().required().min(10),
    featuredImage: Joi.string().uri().allow(""),
    metaDescription: Joi.string().max(160).allow(""),
    metaKeywords: Joi.string().max(200).allow(""),
    status: Joi.string().valid("draft", "published"),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  next();
};

module.exports = {
  validateBlog,
};
