const Joi = require("@hapi/joi");

const createPost = Joi.object({
  text: Joi.string().required(),
});

const addComment = Joi.object({
  text: Joi.string().required(),
});

const postSchema = {
  createPost,
  addComment
};

module.exports = postSchema;
