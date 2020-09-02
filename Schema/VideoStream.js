const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VideoStreamSchema = new Schema({
    id : Number ,
    isMuted : Boolean , 
    isDark : Boolean
})
const VideoStream = mongoose.model("VideoStream", VideoStreamSchema)

module.exports = VideoStream
