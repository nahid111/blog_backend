const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const queryFilter = require('../middleware/queryFilter');
const joiValidator = require('../middleware/joiValidator');
const postSchema = require('../schemas/postSchema');
const Post = require('../models/Post');

const {
  getAllPosts, createPost, getPostById, deletePostById, likePost, unLikePost, addComment, deleteComment
} = require("../controllers/post");


router.get("/", queryFilter(Post), getAllPosts);
router.post("/", protect, joiValidator(postSchema.createPost, 'body'), createPost);
router.get("/:post_id", protect, getPostById);
router.delete("/:post_id", protect, deletePostById);
router.put('/like/:post_id', protect, likePost);
router.put('/unlike/:post_id', protect, unLikePost);
router.post('/comment/:post_id', protect, joiValidator(postSchema.addComment, 'body'), addComment);
router.delete("/comment/:post_id/:comment_id", protect, deleteComment);


module.exports = router;

