const express = require('express')
const { body } = require('express-validator')
const isAuth = require('../middleware/is-auth.js')
const User = require('../models/user')
const authController = require('../controllers/auth')

const router = express.Router()

router.put(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Please eneter a valid email')
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then(userDoc => {
					if (userDoc) {
						return Promise.reject('Email address already exists')
					}
				})
			})
			.normalizeEmail(),
		body('password').trim().isLength({ min: 5 }),
		body('name').trim().not().isEmpty(),
	],
	authController.signup
)
router.post('/login', authController.login)
router.get('/status', isAuth, authController.getUserStatus)
router.patch('/updateStatus', isAuth, [body('status').trim().not().isEmpty()], authController.updateUserStatus)

module.exports = router
