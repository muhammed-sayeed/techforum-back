const mongoos = require('mongoose')
const user = require('./user')

const chatSchema = mongoos.Schema({
    name:String,
    messages:[{
        user:{
            type:mongoos.Types.ObjectId,
            ref:user
        },
        message:String,
        messageTime:{
            type:Date,
            default:Date.now()
        }
    }]
},

)
const chat = module.exports = mongoos.model('chat',chatSchema)