const express = require('express')
//? Controllers
const feedController = require('../controllers/feed.js')
//? Express Router
const router = express.Router()
router.get('/posts', feedController.getPosts)
router.post('/post', feedController.createPost)
module.exports = router
