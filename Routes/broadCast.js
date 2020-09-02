const express = require('express')
const BroadcastRoom = require('../Schema/BroadcastRoom')
const VideoStream = require('../Schema/VideoStream')
const router = express.Router()
const moment = require('moment');
moment().format();



let timeChecker= async function(startTimeCorentShow){
    let nowTime = await Date() ; 
    //function that checks the time diffrents between start show and corent time and giving acsess to room
    console.log(nowTime) 
}

router.get('/:showID', async function (req, res) {
    let roomID = req.params.showID
    let showInfo = req.body
    console.log(showInfo)
    // timeChecker()
    BroadcastRoom.findOne({roomID} , function(err , result){
        if (err){
            console.log("we dont have this room , please try diffrent id or try later , for support go to matan")
        }else if(result){
            ("good , now put the time checker")
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
        startTime:startTime,
        endTime:endTime,
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
    BroadcastRoom.findOneAndDelete({roomID}).then(function (err, deleteShow) {
        if (err) res.send(err)
        else res.send(deleteShow)
    })


})

module.exports = router


