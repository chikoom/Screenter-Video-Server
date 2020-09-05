const express = require('express')
const BroadcastRoom = require('../Schema/BroadcastRoom')
const VideoStream = require('../Schema/VideoStream')
const router = express.Router()
const moment = require('moment')
moment().format()

const timeChecker = function (startTimeCorentShow) {
  let nowTime = moment(new Date())
  console.log(nowTime)
  let duration = moment.duration(nowTime.diff(startTimeCorentShow))
  const minutes = duration.asMinutes()
  if (minutes > 30) {
    return false
  } else {
    return true
  }
}

const checkParticipant = (room, userID) => {
  console.log(room)
  const { participants, creator } = room
  const singleParticipant = participants.find(
    participant => participant.userID === userID
  )
  const userIs = {
    creator: parseInt(creator) === userID ? true : false,
    participant: singleParticipant ? true : false,
  }
  return userIs
}

const startShow = roomID => {}

router.get('/:showID', async function (req, res) {
  // console.log(req.query)
  const userID = req.query.ID
  let roomID = req.params.showID
  let showInfo = req.body
  const timeAfterCheck = timeChecker(showInfo.startTime)
  BroadcastRoom.findOne({ roomID: roomID }, function (err, result) {
    // console.log(result)

    if (!result) {
      res.status(404).send({
        error: 'room not found',
        roomID: roomID,
      })
    } else {
      const participant = checkParticipant(result, parseInt(userID))
      console.log(participant)
    }

    if (result && timeAfterCheck) {
      res.send(result)
      console.log('the show can start')

      startShow(roomID)
    } else if (result && !timeAfterCheck) {
      res.send({
        error:
          'we dont have this room , please try diffrent id or try later , for support go to matan',
      })
      console.log(
        'you can open the show 30 min before the show start , come back later'
      )
    } else {
      res.status(404).send({
        error:
          'we dont have this room , please try diffrent id or try later , for support go to matan',
      })
      console.log(
        'we dont have this room , please try diffrent id or try later , for support go to matan'
      )
    }
  })
})

router.post('/:showID', async function (req, res) {
  //creator creat room ,sand creatorID , showID, startTime , endTime
  //need to add moment for time presentation
  let roomID = req.params.showID
  let showInfo = req.body
  let startTime = moment(showInfo.startTime).format('YYYY-MM-DD HH:mm')
  let endTime = moment(showInfo.endTime).format('YYYY-MM-DD HH:mm')

  let broadCast = new BroadcastRoom({
    roomID: roomID,
    participants: [],
    creator: showInfo.creator,
    startTime: startTime,
    endTime: endTime,
    isLive: false,
    mainVideo: null,
  })
  broadCast.save().then((err, result) => {
    if (err) res.send(err)
    else res.send(result)
  })
})

router.put('/:showID', async function (req, res) {
  //user book and unbook participants
  let { showID } = req.params
  let { userID } = req.body
  let { isBook } = req.body
  if (isBook) {
    BroadcastRoom.updateOne(
      { roomID: showID },
      { $push: { participants: { userID, VideoStream: null } } }
    ).then(function (err, bookShow) {
      if (err) res.send(err)
      else res.send(bookShow)
    })
  } else {
    BroadcastRoom.updateOne(
      { roomID: showID },
      { $pull: { participants: { userID, VideoStream: null } } }
    ).then(function (err, unbookShow) {
      if (err) res.send(err)
      else res.send(unbookShow)
    })
  }
})

router.delete('/:showID', async function (req, res) {
  const roomID = req.params.showID
  BroadcastRoom.findOneAndDelete({ roomID }).then(function (err, deleteShow) {
    if (err) res.send(err)
    else res.send(deleteShow)
  })
})

module.exports = router
