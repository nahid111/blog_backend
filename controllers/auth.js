const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');


// Helper function to Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();
    
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    
    if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;
    }
    
    res
      .status(statusCode)
      .cookie("token", token, cookieOptions)
      .json({ success: true, token });
};


// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  // If user exists
  let user = await User.findOne({ email: email });
  if (user) {
      return next(new ErrorResponse(400, "Email already exists"));
  }
  // Create user
  user = await User.create({ name, email, password, role });
  sendTokenResponse(user, 200, res);
});


// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse(400, "Email & Password Required"));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse(401, "Invalid credentials"));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(401, "Invalid credentials"));
  }

  sendTokenResponse(user, 200, res);
});


// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), //expire in 10 seconds
    httpOnly: true
  });

  res.status(200).json({ success: true, data: {} });
});


// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(404, "User Not Found with the given email"));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  // update user to save the tokens
  await user.save({ validateBeforeSave: false });

  // Create reset url like http://devcamper.io/api/v1/auth/resetpassword/:resettoken
  // req.protocol returns http or https
  // req.get('host') returns the domain name
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) have requested to reset a password. Please make a PUT request to: \n\n ${resetUrl}`;

  // send email with password reset token
  try {
    await sendEmail({ email: user.email, subject: "Blog Reset Password", message });
    res.status(200).json({ success: true, data: "Reset Password Email sent" });
  }
  catch (err) {
    console.log(err);

    // discard exixting tokens on error
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse(500, "Sending Reset Password Email Failed"));
  }
});


// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get token from url & Hash it
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");

  // find user by the resetPasswordToken only if the expiration is greater than current time
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse(400, "Invalid token"));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // send token so that user is logged in after resetting password
  sendTokenResponse(user, 200, res);
});


// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});


// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse(401, "Password is incorrect"));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});


// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: user });
});



// @desc      Upload avatar for user
// @route     PUT /api/v1/auth/avatar
// @access    Private
// file upload using express-fileupload package
exports.avatarUpload = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!req.files) return next( new ErrorResponse(400, `No file uploaded`) );

  const file = req.files.avatar;
  console.log(`\n`, ` avatarUpload() -> file `.black.bgBrightYellow, '\n', file, '\n');

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next( new ErrorResponse(400, `Please upload an image file`) );
  }
  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next( new ErrorResponse(400, `Image size must be less than ${process.env.MAX_FILE_UPLOAD}`) );
  }
  // Create custom filename
  file.name = `avatar_${user._id}${path.parse(file.name).ext}`;

  // Saving/uploading the file, replaces the if existing with same name
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(500, `Server Error, File-Upload Failed`));
    }

    // update bootcamp with filename
    await User.findByIdAndUpdate(req.user._id, {avatar: file.name});
    res.status(200).json({ success: true, data: file.name });
  });
});




// @desc      Upload avatar for user
// @route     PUT /api/v1/auth/avatar
// @access    Private
// file upload using multer
/*
exports.avatarUpload = asyncHandler(async (req, res, next) => {
  const user = await Bootcamp.findById(req.user._id);
  
  const file = req.file;
  if (!file) return next( new ErrorResponse(400, `No file uploaded`) );
  console.log(`\n`, ` avatarUpload() -> file `.black.bgBrightYellow, '\n', file, '\n');

  // delete previous file if exists
  if(user.avatar && user.avatar !== "no-photo.jpg"){
    const filePath = path.join(process.env.FILE_UPLOAD_PATH, user.avatar);
    if (fs.existsSync(filePath)) {
      console.log(` Deleting ${filePath} `.black.bgMagenta);
      fs.unlink(filePath, (err) => err && next(err));
    }
  }

  // update bootcamp with filename
  await User.findByIdAndUpdate(req.user._id, {avatar: file.filename});
  res.status(200).json({ success: true, data: file.filename });
});
*/



