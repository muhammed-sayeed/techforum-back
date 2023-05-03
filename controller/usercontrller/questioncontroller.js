const QN = require('../../models/questions')
const Tags = require('../../models/tag')
const user = require('../../models/user')
const Badge = require('../../models/badge')

const { findOneAndUpdate } = require('../../models/user');
const socket = require('socket.io')
const Report = require('../../models/report')

const addQn = async (req, res) => {
 try{
  const cHtml = req.body.CHtml;
  const Content = req.body.Content;
  const editor = req.body.editorContent;
  const tags = req.body.tags

  const data = res.locals.jwt_user;
  const email = data.email;
  const Id = await user.findOne({email:email},{_id:1})
 const id = Id._id.toString()

  const qns = new QN({
    title: Content,
    titlehtml: cHtml,
    body: editor,
    user:id,
    tags:tags,
  });
  await qns.save();
await user.findOneAndUpdate({_id:id},{$inc:{qncount:1}})
 
res.status('200').json({success:true})
 }catch(err){
  res.status('500').json('something went wrong')
 }
};

const singleQn = async (req,res)=>{
  try{
    const data = res.locals.jwt_user;
  const email = data.email;
  const Id = await user.findOne({email:email},{_id:1})
 const id = Id._id.toString()

    const ID = req.query.Id
    const qn = await QN.findOne({_id:ID}).populate('user').populate('tags')

    activity = ''
 qn.upvote.forEach((el)=>{
  if(el == id){
    activity = 'upvoted'
  }
  qn.downvote.forEach((el)=>{
    if(el == id){
      activity = 'downvoted'
    }
  })
 })
    res.json({
        qn,
        activity
    })
  }catch(err){
    res.json({
      error:'page not found'
    })
  }
}



// const searchQn = async (req, res) => {
//     const data = req.query.data;
//     console.log(data);
//     const tokenizer = new natural.WordTokenizer();
//     const userQn = tokenizer.tokenize(data.toLowerCase());
//   };

  const tagForQn = async(req,res)=>{
   try{
    const tags = await Tags.find({},{name:1,_id:1})
    res.json({
        tags
    })
   }catch(err){
    res.json({
      error:'tags not found'
    })
   }
}

const getQuestions = async (req,res)=>{
 try{
  const questions = await QN.find({state:'active'}).populate('user').sort({createAt:-1})
  res.json({
    questions
  })
 }catch(err){
 res.json({
  error:'page not found'
 })
 }
}




const qnUpVoted = async (req,res)=>{
  try{
    const id = req.body.Id
  const data = res.locals.jwt_user;
  const email = data.email;
  const Id = await user.findOne({email:email},{_id:1})
  const ID = Id._id.toString()
  console.log(ID);
 const voted = await QN.findOne({_id:id,upvote:{$in:[ID]}})
 if(voted){
  await QN.findOneAndUpdate({_id: id}, {$pull: {upvote: ID}})
  res.json({
    success:false
  })
 }else{
  await QN.findOneAndUpdate({_id: id}, {$addToSet: {upvote: ID}})
  await QN.findOneAndUpdate({_id:id},{$pull: {downvote : ID}})
  res.json({
    success:true
  })
 }
  }catch(err){
    res.json({
      error:'somthing went wrong'
    })
  }
}

const qnDownVoted = async (req,res)=>{
 try{
  const id = req.body.Id
  const data = res.locals.jwt_user;
  const email = data.email;
  const Id = await user.findOne({email:email},{_id:1})
  const ID = Id._id.toString()

  const voted = await QN.findOne({_id:id,downvote:{$in:[ID]}})
 if(voted){
  await QN.findOneAndUpdate({_id: id}, {$pull: {downvote: ID}})
  res.json({
    success:true
  })
 }else{
  await QN.findOneAndUpdate({_id: id}, {$addToSet: {downvote: ID}})
  await QN.findOneAndUpdate({_id:id}, {$pull: {upvote: ID}})
  res.json({
    success:false
  })
 }
 }catch(err){
  res.json({
    error:'somthing went wrong'
  })
}
}



const addReport = async (req,res)=>{
try{
  const reason = req.body.reason
  const qnId = req.body.Id
  const data = res.locals.jwt_user;
   const email = data.email;
   const Id = await user.findOne({email:email},{_id:1})
   const ID = Id._id.toString()
 
   const newReport = new Report ({
     reason:reason,
     user:ID,
     question:qnId
   })
 
  await newReport.save()
  await QN.findOneAndUpdate({_id:qnId},{$inc:{reportcount:1}})
  res.json({
   success:true
  })
}catch(err){
  res.json({
    error:'somthing went wrong'
  })
}

}






  module.exports ={
    addQn,
    // searchQn,
    tagForQn,
    getQuestions,
    singleQn,
   
    qnUpVoted,
    qnDownVoted,
  
    addReport,
 
}