const chatRoom = require('../../models/chat')

const getChatRoom = (req, res, next) => {
  try{
    let room = req.params.room;
    chatRoom.find({name: room}).then(( chatroom) => {
        
        res.status(200).json({data:chatroom[0]?.messages});
    });
  }catch(err){
   res.status(500).json('internal server error')
  }
   
}

const chatRooms = (req,res,next) =>{
  try {
    
    const user = req.user._id

const chatrooms = chatRoom.find({'messages.user':user})

console.log(chatrooms,'chatRooms')

res.status(200).json({
    data:chatrooms
})

  } catch (err) {
  res.status(500).json('internal server error')
  }
}

module.exports ={
    getChatRoom,
    chatRooms
}