const Post = require('../models/Post');
const User = require('../models/User');

/**
 * @route  GET /api/posts
 * @desc   Get all published posts with pagination, search, filter
 * @access Public
 */
const getPosts = async (req, res) => {
  const {
    page = 1,
    limit = 9,
    search = '',
    tag = '',
    author = '',
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const query = { isPublished: true };

  // Full-text search (title + content + tags)
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by tag
  if (tag) {
    query.tags = { $in: [tag.toLowerCase()] };
  }

  // Filter by author ID
  if (author) {
    query.author = author;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const allowedSortFields = ['createdAt', 'views', 'title'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'name avatar bio')
      .select('-content -comments') // exclude heavy fields from list view
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Post.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: posts,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
};

/**
 * @route  GET /api/posts/:slug
 * @desc   Get a single post by slug (increments view count)
 * @access Public
 */
const getPostBySlug = async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { slug: req.params.slug, isPublished: true },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', 'name avatar bio email createdAt')
    .populate('comments.user', 'name avatar');

  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  // Add isLiked flag if user is logged in
  let isLiked = false;
  if (req.user) {
    isLiked = post.likes.includes(req.user._id.toString());
  }

  res.json({
    success: true,
    data: { ...post.toObject(), isLiked },
  });
};

/**
 * @route  POST /api/posts
 * @desc   Create a new post
 * @access Private
 */
const createPost = async (req, res) => {
  const { title, content, image, tags, excerpt } = req.body;

  const post = await Post.create({
    title,
    content,
    image: image || '',
    tags: tags ? tags.map((t) => t.toLowerCase().trim()) : [],
    excerpt,
    author: req.user._id,
  });

  await post.populate('author', 'name avatar bio');

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: post,
  });
};

/**
 * @route  PUT /api/posts/:id
 * @desc   Update a post (author only)
 * @access Private
 */
const updatePost = async (req, res) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  // Authorization check
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
  }

  const { title, content, image, tags, excerpt, isPublished } = req.body;

  // Update fields
  if (title) post.title = title;
  if (content) post.content = content;
  if (image !== undefined) post.image = image;
  if (tags) post.tags = tags.map((t) => t.toLowerCase().trim());
  if (excerpt) post.excerpt = excerpt;
  if (isPublished !== undefined) post.isPublished = isPublished;

  await post.save();
  await post.populate('author', 'name avatar bio');

  res.json({
    success: true,
    message: 'Post updated successfully',
    data: post,
  });
};

/**
 * @route  DELETE /api/posts/:id
 * @desc   Delete a post (author or admin only)
 * @access Private
 */
const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
  }

  await post.deleteOne();

  res.json({ success: true, message: 'Post deleted successfully' });
};

/**
 * @route  POST /api/posts/:id/like
 * @desc   Like or unlike a post (toggle)
 * @access Private
 */
const toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  const userId = req.user._id.toString();
  const alreadyLiked = post.likes.map((id) => id.toString()).includes(userId);

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId);
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();

  res.json({
    success: true,
    message: alreadyLiked ? 'Post unliked' : 'Post liked',
    likeCount: post.likes.length,
    isLiked: !alreadyLiked,
  });
};

/**
 * @route  POST /api/posts/:id/comments
 * @desc   Add a comment to a post
 * @access Private
 */
const addComment = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  const comment = {
    user: req.user._id,
    text: req.body.text,
  };

  post.comments.push(comment);
  await post.save();
  await post.populate('comments.user', 'name avatar');

  const newComment = post.comments[post.comments.length - 1];

  res.status(201).json({
    success: true,
    message: 'Comment added',
    data: newComment,
    commentCount: post.comments.length,
  });
};

/**
 * @route  DELETE /api/posts/:id/comments/:commentId
 * @desc   Delete a comment (comment owner or post author)
 * @access Private
 */
const deleteComment = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  const comment = post.comments.id(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  const isCommentOwner = comment.user.toString() === req.user._id.toString();
  const isPostAuthor = post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isCommentOwner && !isPostAuthor && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  comment.deleteOne();
  await post.save();

  res.json({
    success: true,
    message: 'Comment deleted',
    commentCount: post.comments.length,
  });
};

/**
 * @route  GET /api/posts/tags/popular
 * @desc   Get popular tags
 * @access Public
 */
const getPopularTags = async (req, res) => {
  const tags = await Post.aggregate([
    { $match: { isPublished: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  res.json({ success: true, data: tags });
};

module.exports = {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getPopularTags,
};
