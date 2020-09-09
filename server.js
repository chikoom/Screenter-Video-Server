const mongoose = require('mongoose')
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
  debug: true,
})

const broadCast = require('./Routes/broadCast')
const chatRoom = require('./Routes/chatRoom')
const message = require('./Routes/message')
const videoStream = require('./Routes/videoStream')
const cors = require('cors')

require('dotenv').config()
app.use(cors())

const { DB_URL } = process.env
console.log(DB_URL)
mongoose.connect(
  DB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  err => {
    console.log('Connected to DB')
    console.log(err)
  }
)

app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'node_modules')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/peerjs', peerServer)

app.get('/broadcast-room/:room', (req, res) => {
  //res.render('room', { roomID: req.params.room })
  res.send('OK')
})
app.get('/check', (req, res) => {
  //res.render('room', { roomID: req.params.room })
  res.send('OK')
})

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  )
  next()
})

const rooms = {}

io.on('connection', socket => {
  console.log('Connection recieved')
  socket.emit('FromAPI', 'HELLO!')

  socket.on('message', messageObj => {
    console.log(messageObj.user)
    console.log(messageObj.msg)
    io.emit('user-message', messageObj)
  })

  socket.on('join-room', (roomID, peerUserID, currentUserID, streamID) => {
    logJoin(roomID, peerUserID, currentUserID, streamID)

    if (rooms[roomID]) rooms[roomID].push(socket.id)
    else rooms[roomID] = [socket.id]

    socket.join(roomID)

    socket
      .to(roomID)
      .broadcast.emit('user-conncted', peerUserID, currentUserID, streamID)
  })

  socket.on('end-show', () => {
    console.log('CREATOR SAY END SHOW SAY END SHOW')
    io.emit('end-show', 'SERVER SAY END SHOW')
  })
})

app.use('/broadCast', broadCast)
// app.use('/chatRoom', chatRoom)
// app.use('/message', message)
// app.use('/videoStream', videoStream)
const PORT = process.env.PORT || 8181
server.listen(PORT, () => console.log(`server up and running on port ${PORT}`))

const logJoin = (roomID, peerUserID, currentUserID, streamID) => {
  console.log('joined room!')
  console.log('Socket room ID', roomID)
  console.log('PEER user ID', peerUserID)
  console.log('DB USER ID', currentUserID)
  console.log('USER STREAM ID', streamID)
}
