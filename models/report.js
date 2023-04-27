const mongoose = require('mongoose')

const reportSchema = mongoose.Schema({
    reason:{
        type:String
    },
    user:{
        type:mongoose.Types.ObjectId
    },
    question:{
        type:mongoose.Types.ObjectId
    }
},{timestamps:true})

const report = module.exports = mongoose.model('report',reportSchema) 