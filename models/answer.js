const mongoose = require('mongoose')
const user = require('./user')
const questions = require('./questions')

const answeSchema = mongoose.Schema({
    body:{
        type:String
    },
    question:{
        type:String,
        ref:questions
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:user
    },
    upvote:{
        type:[],
        default:null
    },
    downvote:{
        type:[],
        default:null
    }
},{timestamps:true})

const answers = module.exports = mongoose.model('answers',answeSchema)