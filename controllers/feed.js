const { validationResult } = require('express-validator')
const fs = require('fs')
const path = require('path')
const io = require('../socket.js')
const Post = require('../models/post.js')
const User = require('../models/user.js')
exports.getPosts = (req, res, next) => {
	const currentPage = req.query.page || 1
	const perPage = 2
	let totalItems
	Post.find()
		.countDocuments()
		.then(count => {
			totalItems = count
			return Post.find()
				.skip((currentPage - 1) * perPage)
				.limit(perPage)
		})
		.then(posts => {
			res.status(200).json({
				message: 'Fetched posts successfully',
				posts: posts,
				totalItems: totalItems,
			})
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500
			}
			next(err)
		})
}
exports.createPost = (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed,Entered data is incorrect')
		error.statusCode = 422
		throw error
	}
	if (!req.file) {
		const error = new Error('No image provided')
		error.statusCode = 422
		throw error
	}
	const imageUrl = req.file.path.replace(/\\/g, '/') // Poprawione: użyj req.file.path
	const title = req.body.title
	const content = req.body.content
	let creator
	const post = new Post({
		title: title,
		content: content,
		imageUrl: imageUrl,
		creator: req.userId,
	})

	post
		.save()
		.then(result => {
			return User.findById(req.userId)
		})
		.then(user => {
			creator = user
			user.posts.push(post)
			io.getIO().emit('posts', { action: 'create', post: post })
			return user.save()
		})
		.then(result => {
			res.status(201).json({
				message: 'Post created successfully',
				post: post,
				creator: { _id: creator._id, name: creator.name },
			})
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500
			}
			next(err)
		})
}

exports.getPost = async (req, res, next) => {
	const postId = req.params.postId
	try {
		const post = await Post.findById(postId)

		if (!post) {
			const error = new Error('could not find post')
			error.statusCodce = 404
			throw error
		}
		res.status(200).json({ message: 'Post fetched', post: post })
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500
		}
		next(err)
	}
}
exports.updatePost = (req, res, next) => {
	const postId = req.params.postId
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed,Entered data is incorrect')
		error.statusCode = 422
		throw error
	}
	const title = req.body.title
	const content = req.body.content
	let imageUrl = req.body.image
	if (req.file) {
		imageUrl = req.file.path.replace(/\\/g, '/')
	}
	if (!imageUrl && !req.file) {
		const error = new Error('No image provided')
		error.statusCode = 422
		throw error
	}
	Post.findById(postId)
		.then(post => {
			if (!post) {
				const error = new Error('Could not find a post!')
				error.statusCode = 404
				throw Error
			}
			if (post.creator.toString() !== req.userId) {
				const error = new Error('Not authorized')
				error.statusCode = 403
				throw error
			}
			if (imageUrl !== post.imageUrl) {
				clearImage(post.imageUrl)
			}
			post.title = title
			post.imageUrl = imageUrl
			post.content = content
			return post.save()
		})
		.then(result => {
			res.status(200).json({ message: 'Post updated', post: result })
		})
		.catch(error => {
			if (!error.statusCode) {
				error.statusCode = 500
				next(error)
			}
		})
}

exports.deletePost = (req, res, next) => {
	console.log(req.userId)
	const postId = req.params.postId
	Post.findById(postId)
		.then(post => {
			if (!post) {
				const error = new Error('Could not find post')
				error.statusCode = 404
				throw error
			}
			if (post.creator.toString() !== req.userId) {
				const error = new Error('Not authorized')
				error.statusCode = 403
				throw error
			}
			clearImage(post.imageUrl)
			return Post.findByIdAndDelete(postId)
		})
		.then(result => {
			return User.findById(req.userId)
		})
		.then(user => {
			user.posts.pull(postId)
			return user.save()
		})
		.then(result => {
			res.status(200).json({ message: 'Post Deleted' })
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500
				next(err)
			}
		})
}

const clearImage = filePath => {
	const fullPath = path.join(__dirname, '..', filePath)
	fs.unlink(fullPath, err => {
		if (err) {
			console.log('Failed to delete file:', fullPath, err)
		} else {
			console.log('File deleted:', fullPath)
		}
	})
}
