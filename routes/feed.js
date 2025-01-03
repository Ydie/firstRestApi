const express = require('express')
const { body } = require('express-validator')
//? Controllers
const feedController = require('../controllers/feed.js')
//? Express Router
const router = express.Router()
// GET /feed/posts
router.get('/posts', feedController.getPosts)
// GET /feed/post
router.post(
	'/post',
	[body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })],
	feedController.createPost
)
router.get('/post/:postId', feedController.getPost)
module.exports = router
