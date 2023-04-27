const mongoose = require('mongoose')
const badge = require('./badge')

const userSchema = mongoose.Schema({
    username:{
        type:String
    },
    phone:{
        type:Number
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    bio:{
       type:String,
       default:null
    },
    education:{
        type:String,
        default:null
    },
    work:{
        type:String,
        default:null
    },
    place:{
       type:String,
       default:null
    },
    image:{
        type:String,
        default:null
    },
   
    badges:{
        type:[{
            badge:{
                type:String,
                ref:'badge'
            },
            date:{
                type:Date,
                default: Date.now()
            }
        }],
        default:null
    },
    questions:{
        type:[],
        default:null
    },
    qncount:{
         type:Number,
         default:0
    },
    answers:{
        type:[],
        default:null
    },
    comments:{
        type:[],
        default:null
    },
    reputation:{
         type:Number,
         default:1
    },
  
    category:{
        type:String,
        default:'user'
    },
    access:{
        type:Boolean,
        default:true
    },
    



},{timestamps:true})

const user = module.exports = mongoose.model('user',userSchema)