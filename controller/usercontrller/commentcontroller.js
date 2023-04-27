const Comment = require("../../models/comment")
const user = require('../../models/user')

const addComment = async (req,res)=>{
 try{
  const comment = req.body.data.comment
  const qnId = req.body.Id
  const data = res.locals.jwt_user;
  const email = data.email;
  const id = await user.findOne({email:email},{_id:1})
  const ID = id._id.toString()
  const comm = new Comment({
    body:comment,
    question:qnId,
    user:ID
  })
  await comm.save()

  const newComment = comm
  const io =req.app.get('io')
  io.emit('comment',newComment)

  res.json({
    success:true
  })
 }catch(err){
  res.json({
    error:'somthing went wrong'
 })
 }
   
  
   
  }
  
  const getComment = async(req,res)=>{
   try{
    const Id = req.query.Id
    const comments = await Comment.find({question:Id}).populate('user')
    res.json({
     comments
    })
   }catch(err){
res.json({
  error:'comment not found'
})
   }
  }

  module.exports ={
    addComment,
    getComment,
  }