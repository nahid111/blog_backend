const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Post = require("../models/Post");



// @desc    Get all posts
// @route   GET /api/v1/post
// @access  Public
exports.getAllPosts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.filteredResults);
});



// @desc      Create Post
// @route     POST /api/v1/post
// @access    Private
exports.createPost = asyncHandler(async (req, res, next) => {

  const newPost = new Post({
    text: req.body.text,
    name: req.user.name,
    avatar: req.user.avatar,
    user: req.user._id,
  });
  
  const post = await newPost.save();

  res.status(200).json({ success: true, data: post });
});



// @desc      Get Post by ID
// @route     GET /api/v1/post/:post_id
// @access    public
exports.getPostById = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.post_id);
  if (!post) return next(new ErrorResponse(404, `Post Not Found`));
  res.status(200).json({ success: true, data: post });
});



// @desc      Delete post by Id
// @route     DELETE /api/v1/post/:post_id
// @access    Private
exports.deletePostById = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.post_id);
  if (!post) return next(new ErrorResponse(404, `Post Not Found`));
  // check user
  if (post.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse(401, `User not authorized`));
  }
  await post.remove();
  res.status(200).json({ success: true, data: {} });
});



// @desc      Like a post
// @route     PUT /api/v1/post/like/:post_id
// @access    Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.post_id);
  if (!post) return next(new ErrorResponse(404, `Post Not Found`));

  // check if Post is already Liked by User
  if ( post.likes.filter( (like) => like.user.toString() === req.user._id.toString() ).length > 0 ) {
    return next(new ErrorResponse(404, `Post already liked by this User`));
  }

  post.likes.unshift({ user: req.user._id });
  await post.save();
  res.status(200).json({ success: true, data: post.likes });
});



// @desc      Unlike a post
// @route     PUT /api/v1/post/unlike/:post_id
// @access    Private
exports.unLikePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.post_id);
  if (!post) return next(new ErrorResponse(404, `Post Not Found`));

  // check if Post is already Liked by User
  if ( post.likes.filter( (like) => like.user.toString() === req.user._id.toString() ).length === 0 ) {
    return next(new ErrorResponse(404, `Post hasn't been liked yet by this User`));
  }

  let like = post.likes.find(like => like.user.toString() === req.user._id.toString());
  like.remove();
  await post.save();
  res.status(200).json({ success: true, data: post.likes });
});



// @desc      Add a Comment on a Post
// @route     POST /api/v1/post/comment/:post_id
// @access    Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.post_id);
  if (!post) return next(new ErrorResponse(404, `Post Not Found`));

  const newComment = {
    text: req.body.text,
    name: req.user.name,
    avatar: req.user.avatar,
    user: req.user._id,
  };

  post.comments.unshift(newComment);
  await post.save();

  res.status(200).json({ success: true, data: post.comments });
});



// @desc      Delete a Comment from a Post
// @route     POST /api/v1/post/comment/:post_id/:comment_id
// @access    Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.post_id);
  if (!post) return next(new ErrorResponse(404, `Post Not Found`));

  const comment = post.comments.id(req.params.comment_id);
  if (!comment) return next(new ErrorResponse(404, `Comment Not Found`));

  // check user
  if (comment.user.toString() !== req.user._id.toString()) return next(new ErrorResponse(404, `User not authorized`));

  comment.remove();
  await post.save();

  res.status(200).json({ success: true, data: post.comments });
});