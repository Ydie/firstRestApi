const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
//? Routes
const feedRoutes = require('./routes/feed.js')

const app = express()

// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded <form>
app.use(bodyParser.json()) // application/json

//! CORS Issue fixed by serwer site code. Allow cross access beetwen site and serwer
//! * means every site is allowed to access
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
	next()
})

app.use('/feed', feedRoutes)

mongoose
	.connect('mongodb+srv://mariuszek:12354@cluster0.hg3h2.mongodb.net/feed?retryWrites=true&w=majority&appName=Cluster0')
	.then(result => {
		app.listen(8080)
	})
	.catch(err => console.log(err))
