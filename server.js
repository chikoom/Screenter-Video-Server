const mongoose = require('mongoose')
const path = require('path')
const express = require('express')
const app = express()
var AWS = require('aws-sdk')

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

// Create publish parameters
const { URL_KEY, URL_SEC } = process.env

// Set region
AWS.config.update({
  accessKeyId: URL_KEY,
  secretAccessKey: URL_SEC,
  region: 'us-east-1',
})
// const client = require('twilio')(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

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
  socket.on('test', messageObj => {
    console.log(messageObj)
  })

  socket.on('message', messageObj => {
    console.log(messageObj.user)
    console.log(messageObj.msg)
    io.emit('user-message', messageObj)
  })

  socket.on('join-room', (roomID, peerUserID, currentUserID, streamID) => {
    console.log('joined room!')
    console.log('Socket room ID', roomID)
    console.log('PEER user ID', peerUserID)
    console.log('DB USER ID', currentUserID)
    console.log('USER STREAM ID', streamID)

    socket.join(roomID)

    socket
      .to(roomID)
      .broadcast.emit('user-conncted', peerUserID, currentUserID, streamID)

    socket.on('message', messageObj => {
      console.log(messageObj.user)
      console.log(messageObj.msg)
      io.in(roomID).emit('user-message', messageObj)
    })
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

app.post('/api/notification', (req, res) => {
  const { phone, showTitle, time } = req.body
  // const numbers = ['+972523641163','+972528228640','+972549093350']
  // for(let number of numbers){
  var params = {
    Message: `${showTitle} Live Start at ${time} => www.screenters.com CrAZyAwSoMe LIVE STREAMING`,
    PhoneNumber: phone,
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': {
        DataType: 'String',
        StringValue: 'Screenters',
      },
    },
  }
  // Create promise and SNS service object
  var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' })
    .publish(params)
    .promise()
  publishTextPromise.then(r => console.log(r))

  // Handle promise's fulfilled/rejected states
  publishTextPromise
    .then(function (data) {
      console.log('MessageID:' + data.MessageId + ' has sent successfully')
    })
    .catch(function (err) {
      console.error(err, err.stack)
    })
  // res.header('Content-Type', 'application/json');
  // client.messages
  //   .create({
  //     from: process.env.TWILIO_PHONE_NUMBER,
  //     to: req.body.to,
  //     body: req.body.body
  //   })
  //   .then(() => {
  //     res.send(JSON.stringify({ success: true }));
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     res.send(JSON.stringify({ success: false }));
  //   });
})

const logJoin = (roomID, peerUserID, currentUserID, streamID) => {
  console.log('joined room!')
  console.log('Socket room ID', roomID)
  console.log('PEER user ID', peerUserID)
  console.log('DB USER ID', currentUserID)
  console.log('USER STREAM ID', streamID)
}

server.listen(PORT, () => console.log('server up and running on port 8181'))
