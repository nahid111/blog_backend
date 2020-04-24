const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const queryFilter = require('../middleware/queryFilter');
const joiValidator = require('../middleware/joiValidator');
const profileSchema = require('../schemas/profileSchema');
const Profile = require('../models/Profile');

const {
  getAllProfiles,
  getCurrentUserProfile,
  createOrUpdateProfile,
  getProfileByUserId,
  deleteCurrentUserProfile,
  addProfileExperience,
  deleteProfileExperience,
  addProfileEducation,
  deleteProfileEducation,
  getUserRepos
} = require("../controllers/profile");


// GET      api/profile
// GET      api/profile/me
// POST     api/profile
// GET      api/profile/user/:user_id
// DELETE   api/profile
// PUT      api/profile/experience
// DELETE   api/profile/experience/:exp_id
// PUT      api/profile/education
// DELETE   api/profile/education/:edu_id
// GET      api/profile/github/:username


router.get("/", queryFilter(Profile, {path: 'user', select: 'name avatar'}), getAllProfiles);
router.get("/me", protect, getCurrentUserProfile);
router.post("/", protect, joiValidator(profileSchema.createOrUpdateProfile, 'body'), createOrUpdateProfile);
router.get("/user/:user_id", getProfileByUserId);
router.delete("/", protect, deleteCurrentUserProfile);
router.put("/experience", protect, joiValidator(profileSchema.addProfileExperience, 'body'), addProfileExperience);
router.delete("/experience/:exp_id", protect, deleteProfileExperience);
router.put("/education", protect, joiValidator(profileSchema.addProfileEducation, 'body'), addProfileEducation);
router.delete("/education/:edu_id", protect, deleteProfileEducation);
router.get("/github/:username", getUserRepos);


module.exports = router;
