const express = require('express')
const { body } = require('express-validator')
const isAuth = require('../middleware/is-auth.js')
//? Controllers
const feedController = require('../controllers/feed.js')
//? Express Router
const router = express.Router()
// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts)
// GET /feed/post
router.post(
	'/post',
	isAuth,
	[body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })],
	feedController.createPost
)
router.get('/post/:postId', isAuth, feedController.getPost)
router.put(
	'/post/:postId',
	isAuth,
	[body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })],
	feedController.updatePost
)
router.delete('/post/:postId', isAuth, feedController.deletePost)
module.exports = router
