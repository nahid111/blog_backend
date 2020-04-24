const Joi = require("@hapi/joi");

const createOrUpdateProfile = Joi.object({
  status: Joi.string().required(),
  skills: Joi.array().items(Joi.string()),
  company: Joi.string(),
  website: Joi.string().uri(),
  location: Joi.string(),
  bio: Joi.string(),
  githubusername: Joi.string(),
  youtube: Joi.string().uri(),
  facebook: Joi.string().uri(),
  twitter: Joi.string().uri(),
  linkedin: Joi.string().uri(),
  instagram: Joi.string().uri()
});

const addProfileExperience = Joi.object({
  title: Joi.string().required(),
  company: Joi.string().required(),
  location: Joi.string(),
  from: Joi.string().required(),
  to: Joi.string(),
  current: Joi.bool(),
  description: Joi.string()
});

const addProfileEducation = Joi.object({
  school: Joi.string().required(),
  degree: Joi.string().required(),
  fieldofstudy: Joi.string().required(),
  from: Joi.string().required(),
  to: Joi.string(),
  current: Joi.bool(),
  description: Joi.string()
});

const profileSchema = {
  createOrUpdateProfile,
  addProfileExperience,
  addProfileEducation
};

module.exports = profileSchema;
