const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BroadcastRoomSchema = new Schema({
    roomID : Number ,
    participants: [{userID:Number, videoStream: { type: Schema.Types.ObjectId, ref: 'VideoStream' }}], 
    creator : Number , 
    startTime : Date , 
    endTime : Date , 
    isLive : Boolean ,
    videoStreams :[String] , 
    mainVideo : String  

})
const BroadcastRoom = mongoose.model("BroadcastRoom", BroadcastRoomSchema)

module.exports = BroadcastRoom
