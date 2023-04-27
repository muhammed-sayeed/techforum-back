const mongoose = require('mongoose')
const user = require('./user')
const tag = require('./tag')

const articleSchema = mongoose.Schema({
    title:{
        type:String
    },
    titlehtml:{
        type:String
    },
    body:{
        type:String
    },
    tags:{
        type:[],
        ref:tag
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:user
    },
    state:{
        type:String,
        default:'invisible'
    },
    community:{
        type:mongoose.Types.ObjectId
    }
},{timestamps:true})

const article = module.exports = mongoose.model('article',articleSchema)