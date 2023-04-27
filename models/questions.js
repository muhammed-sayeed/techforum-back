const mongoose = require('mongoose')
const tag = require('./tag')
const user = require('./user')

const qnSchema = mongoose.Schema({
    title:{
        type:String
    },
    titlehtml:{
        type:String
    },
    body:{
        type:String
    },
    answer:{
        type:[]
    },
   user:{
    type:String,
    ref:user
   },
   tags:{
    type:[],
    ref:tag
   },
   upvote:{
   type:[]
   },
   downvote:{
    type:[]
   },
 reportcount:{
    type:Number,
    default:0
 },
 state:{
    type:String,
    default:'active'
 }
   
},{timestamps:true})

const questions = module.exports = mongoose.model('questions',qnSchema) 