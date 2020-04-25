const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const joiValidator = require('../middleware/joiValidator');
const userSchema = require('../schemas/userSchema');

const {
  register, login, logout, getMe, forgotPassword, resetPassword, updateDetails, updatePassword, avatarUpload
} = require('../controllers/auth');


router.post('/login', login);
router.get('/logout', logout);
router.post('/register', joiValidator(userSchema.registerUser, 'body'), register);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
router.put('/updatedetails', protect, updateDetails);
// router.put("/avatar", protect, multerFileUpload.single('avatar'), avatarUpload);
router.put("/avatar", protect, avatarUpload);


module.exports = router;
