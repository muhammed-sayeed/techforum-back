const mongoose = require('mongoose')
const questions = require('./questions')
const user = require('./user')

const commentSchema = mongoose.Schema({
    body:{
        type:String
    },
    question:{
        type:mongoose.Types.ObjectId,
        ref:questions
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:user
    }
},{timestamps:true})

const comments = module.exports = mongoose.model('comments',commentSchema)