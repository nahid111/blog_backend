const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const axios = require('axios');
const Profile = require("../models/Profile");



// @desc    Get all profiles
// @route   GET /api/v1/profile
// @access  Public
// @example {{URL}}/api/v1/profiles?select=company,status&sort=-location <br>
// @example {{URL}}/api/v1/profiles?limit=1&page=2 <br>
// @example {{URL}}/api/v1/profiles?select=skills&skills[in]=Python
exports.getAllProfiles = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.filteredResults);
});



// @desc      Get current logged in user's profile
// @route     GET /api/v1/profile/me
// @access    Private
exports.getCurrentUserProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user._id }).populate('user', ['name', 'avatar']);
  if (!profile) return next( new ErrorResponse(404, `Profile not found`) );
  res.status(200).json({ success: true, data: profile });
});



// @desc      Create or Update user profile
// @route     POST /api/v1/profile
// @access    Private
exports.createOrUpdateProfile = asyncHandler(async (req, res, next) => {
  
  const {
    company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin,
  } = req.body;

  // Build the Profile Object
  const profileFields = {};
  profileFields.user = req.user._id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubusername) profileFields.githubusername = githubusername;
  // if (skills) {
  //   profileFields.skills = skills.split(",").map((skill) => skill.trim());
  // }
  if (skills) profileFields.skills = skills;
  // Build the Social Object
  profileFields.social = {};
  if (youtube) profileFields.social.youtube = youtube;
  if (facebook) profileFields.social.facebook = facebook;
  if (twitter) profileFields.social.twitter = twitter;
  if (linkedin) profileFields.social.linkedin = linkedin;
  if (instagram) profileFields.social.instagram = instagram;

  // check if User exists
  // let user = await User.findById(req.user._id);
  // if (!user) return next( new ErrorResponse(404, `User doesn't exist`) );

  // check if profile exists
  let profile = await Profile.findOne({ user: req.user._id });

  // update profile if exists
  if (profile && profile !== null) {
    profile = await Profile.findOneAndUpdate({ user: req.user._id }, { $set: profileFields }, { new: true });
  }else{
    // create new profile if doesn't exist
    profile = new Profile(profileFields);
    await profile.save();
  }

  res.status(200).json({ success: true, data: profile });
});



// @desc      Get Profile by user ID
// @route     GET /api/v1/profile/user/:user_id
// @access    public
exports.getProfileByUserId = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.params.user_id }).populate({path: 'user', select: 'name avatar'});
  if (!profile) return next( new ErrorResponse(404, `Profile not found`) );
  res.status(200).json({ success: true, data: profile });
});



// @desc      Delete current logged in user's profile
// @route     DELETE /api/v1/profile
// @access    Private
exports.deleteCurrentUserProfile = asyncHandler(async (req, res, next) => {
  await Profile.findOneAndRemove({ user: req.user._id });
  res.status(200).json({ success: true, data: {} });
});



// @desc      Add Exprience to Current Profile
// @route     PUT /api/v1/profile/experience
// @access    Private
exports.addProfileExperience = asyncHandler(async (req, res, next) => {
  
  const newExp = {
    title: req.body.title,
    company: req.body.company,
    location: req.body.location,
    from: req.body.from,
    to: req.body.to,
    current: req.body.current,
    description: req.body.description,
  };

  const profile = await Profile.findOne({user: req.user._id});
  // array.unshift pushes elements at the begining
  profile.experience.unshift(newExp);
  await profile.save();
  res.status(200).json({ success: true, data: profile });
});



// @desc      Delete Exprience from Current Profile
// @route     DELETE /api/v1/profile/experience/:exp_id
// @access    Private
exports.deleteProfileExperience = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({user: req.user._id});
  profile.experience.id(req.params.exp_id).remove();
  await profile.save();
  return res.status(200).json({ success: true, data: profile });
});



// @desc      Add Education to Current Profile
// @route     PUT /api/v1/profile/education
// @access    Private
exports.addProfileEducation = asyncHandler(async (req, res, next) => {
  const newEdu = {
    school: req.body.school,
    degree: req.body.degree,
    fieldofstudy: req.body.fieldofstudy,
    from: req.body.from,
    to: req.body.to,
    current: req.body.current,
    description: req.body.description,
  };
  const profile = await Profile.findOne({user: req.user._id});
  profile.education.unshift(newEdu);
  await profile.save();
  return res.status(200).json({ success: true, data: profile });
});



// @desc      Delete Education from Current Profile
// @route     DELETE /api/v1/profile/education/:edu_id
// @access    Private
exports.deleteProfileEducation = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({user: req.user._id});
  profile.education.id(req.params.edu_id).remove();
  await profile.save();
  return res.status(200).json({ success: true, data: profile });
});



// @desc      Get User's Repos from Github
// @route     GET /api/v1/profile/github/:username
// @access    Public
exports.getUserRepos = asyncHandler(async (req, res, next) => {
  
  const url = `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`;

  // let config = {
  //   headers: {
  //     Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  //     "Content-Type": "application/json",
  //     'user-agent': 'node.js'
  //   }
  // };
  // let reqBody = {
  //   "the data": "to be sent"
  // };
  // const response = await axios.post(url, data, config);

  const response = await axios.get(url);
  const { data } = await response;

  res.status(200).json({ success: true, data: data });
});


