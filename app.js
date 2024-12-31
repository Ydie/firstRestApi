const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
//? Routes
const feedRoutes = require('./routes/feed.js')

const app = express()
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images')
	},
	filename: (req, file, cb) => {
		cb(null, uuidv4() + '-' + file.originalname)
	},
})
const fileFilter = (req, file, cb) => {
	if (file.minetype === 'image/png' || file.minetype === 'image/jpg' || file.minetype === 'image/jpeg') {
		cb(null, true)
	} else {
		cb(null, false)
	}
}
// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded <form>
app.use(bodyParser.json()) // application/json
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))
//! CORS Issue fixed by serwer site code. Allow cross access beetwen site and serwer
//! * means every site is allowed to access
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
	next()
})

app.use('/feed', feedRoutes)
app.use((error, req, res, next) => {
	console.log(error)
	const status = error.statusCode || 500
	const message = error.message
	res.status(status).json({ message: message })
})

mongoose
	.connect('mongodb+srv://mariuszek:12354@cluster0.hg3h2.mongodb.net/feed?retryWrites=true&w=majority&appName=Cluster0')
	.then(result => {
		app.listen(8080)
	})
	.catch(err => console.log(err))
