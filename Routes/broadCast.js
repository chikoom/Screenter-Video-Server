const express = require('express')
const BroadcastRoom = require('../Schema/BroadcastRoom')
const VideoStream = require('../Schema/VideoStream')
const router = express.Router()
const moment = require('moment');
moment().format();



let timeChecker = function (startTimeCorentShow) {
    let nowTime = moment(new Date());
    let duration = moment.duration(nowTime.diff(startTimeCorentShow))
    const minutes = duration.asMinutes();
    if (minutes > 30) {
        return false
    } else {
        return true
    }
}

router.get('/:showID', async function (req, res) {
    let roomID = req.params.showID
    let showInfo = req.body
    const timeAfterCheck = timeChecker(showInfo.startTime)
    BroadcastRoom.findOne({ roomID: roomID }, function (err, result) {
        console.log(result)
        if (result && timeAfterCheck) {
            res.send(result)
            console.log("the show can start")
        } else if (result && !timeAfterCheck) {
            res.send(result)
            console.log("you can open the show 30 min before the show start , come back later")
        } else {
            res.send("we dont have this room , please try diffrent id or try later , for support go to matan")
            console.log("we dont have this room , please try diffrent id or try later , for support go to matan")
        }
    })
})

router.post('/:showID', async function (req, res) {
    //creator creat room ,sand creatorID , showID, startTime , endTime
    //need to add moment for time presentation 
    let roomID = req.params.showID
    let showInfo = req.body
    let startTime = moment(showInfo.startTime).format("YYYY-MM-DD HH:mm");
    let endTime = moment(showInfo.endTime).format("YYYY-MM-DD HH:mm");

    let broadCast = new BroadcastRoom({
        roomID: roomID,
        participants: [],
        creator: showInfo.creator,
        startTime: startTime,
        endTime: endTime,
        isLive: false,
        mainVideo: null
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
        BroadcastRoom.updateOne({ roomID: showID }, { $push: { participants: { userID, VideoStream: null } } })
            .then(function (err, bookShow) {
                if (err) res.send(err)
                else res.send(bookShow)
            })
    }
    else {
        BroadcastRoom.updateOne({ roomID: showID }, { $pull: { participants: { userID, VideoStream: null } } })
            .then(function (err, unbookShow) {
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


