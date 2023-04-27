const Community = require('../../models/community')
const questions = require('../../models/questions')
const QNS = require('../../models/questions')
const Article = require('../../models/article')
const Comment = require('../../models/comment')
const user = require('../../models/user')

const communityDetails = async(req,res)=>{
  try{
let userType
let isMember
 const Id = req.query.id
 const community = await Community.findOne({_id:Id}).populate('tags')
 const visibleArt = await Article.find({community:Id,state:'visible'}).populate('user').populate('tags')
 const inVisibleArt = await Article.find({community:Id,state:'invisible'}).populate('user')

const data = res.locals.jwt_user;
 const email = data.email;
 const id = await user.findOne({email:email},{_id:1})
 const ID = id._id.toString()
    const uZer = await user.findOne({email:email,category:'moderator'})
    console.log(uZer);
    if(uZer){
        userType = true
    }else{
        userType =false
    }
    const member = await Community.findOne({_id:Id,users:{$in:ID}})
    if(member){
     isMember = true
    }else{
      isMember = false
    }
const questions = await QNS.aggregate([
    {
        $lookup: {
          from: "communities",
          localField: "tags",
          foreignField: "tags",
          as: "matched_tags"
        }
      },
      {
        $match: {
          matched_tags: { $ne: [] }
        }
      }
])
res.json({
    community,
    questions,
    userType,
    visibleArt,
    inVisibleArt,
    isMember
})
   }catch(err){
    res.json({
        error:'page not found'
    })
   }
}

const tagArticle = async (req,res)=>{
  try{
    const Id = req.query.Id
    const community = await Community.findOne().populate('tags')
    const tags =community.tags
    console.log('taaaag',tags);
    res.json({
        tags
    })
  }catch(err){
    res.json({
        error:'tags not found'
    })
  }
}
const addArticle = async (req,res)=>{
    try{
        const title= req.body.Header
        const titlehtml=req.body.headerHtml
        const body=req.body.body
        const tags =req.body.tags
        const community=req.body.communityId
    
        const data = res.locals.jwt_user;
        const email = data.email;
        const id = await user.findOne({email:email},{_id:1})
        const ID = id._id.toString()
    console.log(req.body,'success');
        const newArticle = new Article({
            title:title,
            titlehtml:titlehtml,
            body:body,
            tags:tags,
            community:community,
            user:ID
        })
       await newArticle.save()
       res.json({
        success:true
       })
    }catch(err){
        res.json({
     error:'somthing went wrong'
        })
    }
   
}
const submitArticle = async(req,res)=>{
   
   try{
    const Id=req.body.Id
    await Article.findOneAndUpdate({_id:Id},{$set:{state:'visible'}})
    res.json({
        success:true
    })
   }catch(err){
    res.json({
        error:'somthing went wrong'
    })
   }
}
const rejectArticle = async (req,res)=>{
   try{
    const Id=req.body.Id
    await Article.findOneAndUpdate({_id:Id},{$set:{state:'rejected'}})
    res.json({
        success:true
    })
   }catch(err){
   res.json({
    error:'somthing went wrong'
   })
   }
}
const addArtComment = async(req,res)=>{
  
   try{
    const comment = req.body.comment.comment
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
  
   const newArtComment = comm
   const io =req.app.get('io')
   io.emit('comment',newArtComment)
 
   res.json({
     success:true
   })
   }catch(err){
res.json({
    error:'somthing went wrong'
})
   }
 
}

const singleArticle =async (req,res)=>{
   try{
    const Id = req.query.Id
    console.log(req.query);
  const Art = await Article.findOne({_id:Id,state:'visible'}).populate('user').populate('tags')
  const artComments =await Comment.find({question:Id}).populate('user')
  res.json({
    Art,
    artComments
  })
   }catch(err){
    res.json({
        error:'page not found'
    })
   }
}

const joinCommunity = async(req,res)=>{
   try{
    const Id=req.body.Id
    console.log(Id);
    const data = res.locals.jwt_user;
    const email = data.email;
    const id = await user.findOne({email:email},{_id:1})
    const ID = id._id.toString()

    const member = await Community.findOne({_id:Id,users:{$in:ID}})
  
   if(member){
    await Community.findOneAndUpdate({_id:Id},{$pull:{users:ID}})
    res.json({success:false})
   }else{
    await Community.findOneAndUpdate({_id:Id},{$addToSet:{users:ID}})
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




module.exports ={
    communityDetails,
    tagArticle,
    addArticle,
    submitArticle,
    rejectArticle,
    addArtComment,
    singleArticle,
    joinCommunity
}