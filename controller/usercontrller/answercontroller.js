const ANS = require('../../models/answer');
const user = require('../../models/user')
const QN = require('../../models/questions')

const saveAnswer = async (req,res)=>{
  try{
    const Id = req.body.qnId
    console.log(Id);
    const answer = req.body.answer
    
    const data = res.locals.jwt_user;
    const email = data.email;
    const id = await user.findOne({email:email},{_id:1})
   
  const Ans  = new ANS({
     body:answer,
     question:Id,
     user:id,
  })
  await Ans.save()
 
const newAns = Ans
const io = req.app.get('io')
io.emit('answer',newAns)
res.json({
    success:true
})
}catch(err){
    res.json({
      error:'somthing went wrong'
    })
   
}

}


const getAnswer = async (req,res)=>{
  try{
    const {Id} = req.query
    const data = res.locals.jwt_user;
    const email = data.email;
    const id = await user.findOne({email:email},{_id:1})
    const ID = id._id.toString()
    const answers = await ANS.aggregate([
      {$match: {question:Id}},
      {
        $lookup: {
          from: "users",
          localField:"user",
          foreignField:"_id",
          as:"user"
        }
      },
      {
        $project: {
          _id:1,
          upvote:1,
          downvote:1,
          body:1,
         createdAt:1,
          liked:{
            $cond: {
              if: {$in: [ID,"$upvote"]},
              then:true,
              else: {
                $cond: {
                  if: {$in: [ID, "$downvote"]},
                  then:false,
                  else: null
                }
              }
            }
          },
          user: { $arrayElemAt: ["$user", 0] }
        }
      }
    ])

    res.json(
        answers
    )
  }catch(err){
    res.json({
      error:'answer not found'
    })
  }
   
}

const ansUpVote = async (req,res)=>{
  try{
    const id = req.body.Id
    console.log(id);
    const data = res.locals.jwt_user;
    const email = data.email;
    const Id = await user.findOne({email:email},{_id:1})
    const ID = Id._id.toString()
  
    const voted = await ANS.findOne({_id:id,upvote:{$in:[ID]}})
    if(voted){
     
      await ANS.findOneAndUpdate({_id: id}, {$pull: {upvote: ID}})
      return res.json({
        success:false
      })
     }else
      
      await ANS.findOneAndUpdate({_id: id}, {$addToSet: {upvote: ID}})
      await ANS.findOneAndUpdate({_id:id},{$pull: {downvote : ID}})
      return res.json({
        success:true
      })
  }catch(err){
    res.json({
      error:'somthing went wrong'
    })
  }
   
     }
  
  
  const ansDownVote = async (req,res)=>{
    try{
      const id = req.body.Id
      const data = res.locals.jwt_user;
      const email = data.email;
      const Id = await user.findOne({email:email},{_id:1})
      const ID = Id._id.toString()
    
      const voted = await QN.findOne({_id:id,downvote:{$in:[ID]}})
      if(voted){
       await ANS.findOneAndUpdate({_id: id}, {$pull: {downvote: ID}})
       res.json({
         success:true
       })
      }else{
       await ANS.findOneAndUpdate({_id: id}, {$addToSet: {downvote: ID}})
       await ANS.findOneAndUpdate({_id:id}, {$pull: {upvote: ID}})
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

  module.exports ={
    saveAnswer,
    getAnswer,
    ansUpVote,
    ansDownVote,
  }