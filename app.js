const express = require('express')
const bodyparser = require('body-parser')
const config = require('./config/database')
require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const socketIO = require('socket.io')
const chatRoom = require('./models/chat')
const cron = require('node-cron')
const User = require('./models/user')
const Badge = require('./models/badge')

mongoose.connect(process.env.database)
mongoose.connection.on("connected",()=>{
    console.log('Database connected');
})



const app = express()

app.use(express.json())
app.use(bodyparser.urlencoded({extended:true}))

//cors
const corsOptions = {
    origin: ["https://codforum.site", "http://localhost:4200"],
    methods: "GET, POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type, Authorization",
    optionsSuccessStatus: 200, 
  };
  app.use(cors(corsOptions));

  app.use(express.static(path.join(__dirname,"public")))

//multer
const filestorage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"public/images")
    },
 
})  

const fileFilter =(req,file,cb) => {
  if(
    file.mimetype === "image/png" ||
    file.mimetype === "image.jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null,true)
  }else {
    cb(null, false)
  }
}

app.use(
  multer({storage:filestorage,fileFilter:fileFilter}).single('img')
)



const adminRouts = require('./routes/adminroutes')
const userRouts = require('./routes/userroutes')



app.use('/admin',adminRouts)
app.use('/',userRouts)


const server = app.listen(3000)

const io = socketIO(server,{cors:{
  origin:'*',
}})

app.set('io',io)

const chatIo = io

chatIo.on('connection',(socket)=>{

  console.log('chat io connected');
  
  socket.on('join', (data) => {          
    socket.join(data.room);
    chatRoom.find({}).then(( rooms) => {
       
        count = 0;
        rooms.forEach((room) => {
            if(room.name == data.room){
                count++;
            }
        });
        // Create the chatRoom if not already created
        if(count == 0) {
          console.log('room created',data.room);
            chatRoom.create({ name: data.room, messages: [] }); 
        }
    });
});

socket.on('message', (data) => {
  io.in(data.room).emit('new message', {user: data.user, message: data.message});
  chatRoom.updateOne({name: data.room}, { $push: { messages: { user: data.user, message: data.message } } }).then(()=>{
    console.log('message adeed')
  })
     
  
});

socket.on('typing', (data) => {
  socket.broadcast.in(data.room).emit('typing', {data: data, isTyping: true});
});

 })

 const badgeCriteria = {
  'student': user => user.qncount = 1,
 }

 function checkBadge(userId,badge){
  const user = User.findById(userId)
  return badgeCriteria[badge](user)
 }
 

 // Set up a cron job to run the badge allocation function every day at midnight
 cron.schedule('10 * * * *',()=>{
  const users = User.find();
  for(const user of users){
    for(const badge of Object.keys(badgeCriteria)){
      if(checkBadge(user._id,badge)){
       const bad = Badge.find({name:badge})
        const badgeId = bad._id
         user.badges.push(badgeId)
         user.save()
      }
    }
  }
 })



