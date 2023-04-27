const mongoose = require('mongoose')

const tagSchema = mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    image:{
        type:String,
        default:null
    },
    point:{
        type:Number,
        default:0
    }
})

const tag = module.exports = mongoose.model('tags',tagSchema)