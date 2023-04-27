const mongoose = require('mongoose')
const user = require('./user')
const tag = require('./tag')

const communitySchema = mongoose.Schema({
    name:{
        type:String
    },
    image:{
        type:String
    },
    description:{
        type:String
    },
    admins:{
        type:[],
        ref:user
    },
    users:{
        type:[],
        ref:user
    },
    tags:{
        type:[],
        ref:tag
    }
},{timestamps:true})

const community = module.exports = mongoose.model('community',communitySchema)