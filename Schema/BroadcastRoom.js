const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BroadcastRoomSchema = new Schema({
  roomID: Number,
  participants: [
    {
      userID: { type: String, default: '' },
      videoStream: { type: Schema.Types.ObjectId, ref: 'VideoStream' },
    },
  ],
  creator: String,
  startTime: Date,
  endTime: Date,
  isLive: { type: Boolean, default: false },
  videoStreams: { type: [String], default: [] },
  mainVideo: { type: String, default: '' },
})
const BroadcastRoom = mongoose.model('BroadcastRoom', BroadcastRoomSchema)

module.exports = BroadcastRoom
