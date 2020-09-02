const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
const broadCast = require('./Routes/broadCast')
const chatRoom = require('./Routes/chatRoom')
const message = require('./Routes/message')
const videoStream = require('./Routes/videoStream')

require('dotenv').config()

const { DB_URL } = process.env
console.log(DB_URL)
mongoose.connect(DB_URL, {useNewUrlParser: true,useUnifiedTopology: true, useFindAndModify: false})


app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'node_modules')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
  next()
})

app.use('/broadCast', broadCast)
// app.use('/chatRoom', chatRoom)
// app.use('/message', message)
// app.use('/videoStream', videoStream)

app.listen(8080, () => console.log("server up and running on port 8080"))
