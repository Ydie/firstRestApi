const express = require('express')
const bodyParser = require('body-parser')
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

app.listen(8080)
