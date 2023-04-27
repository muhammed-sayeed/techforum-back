const mongoose = require('mongoose')
const user = require('./user')


const badgeSchema = mongoose.Schema({
    name:{
        type:String
    },
    criteria:{
        type:String
    },
    Achievers:{
        type:[],
        default:null,
        ref:'user'
    },
   
})

const badge = module.exports = mongoose.model('badge',badgeSchema)