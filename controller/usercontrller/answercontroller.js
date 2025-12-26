const ANS = require('../../models/answer');
const user = require('../../models/user')
const QN = require('../../models/questions')

const saveAnswer = async (req, res) => {
  try {
    const qnId = req.body.qnId;
    const answerText = req.body.answer;

    const data = res.locals.jwt_user;
    const email = data.email;

    const userDoc = await user.findOne({ email: email }, { _id: 1 });

    // 1️⃣ Save new answer
    const Ans = new ANS({
      body: answerText,
      question: qnId,
      user: userDoc._id,
    });

    await Ans.save();

    // 2️⃣ Push the answer _id into the question model
    await QN.findByIdAndUpdate(
      qnId,
      { $push: { answer: Ans._id } },
      { new: true }
    );

    // 3️⃣ Populate user for UI
    const newAns = await ANS.findById(Ans._id)
      .populate("user", "username email image")
      .exec();

    // 4️⃣ Emit socket event
    const io = req.app.get('io');
    io.emit('answer', newAns);

    // 5️⃣ Return response
    res.json({
      success: true,
      answer: newAns
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      error: "Something went wrong"
    });
  }
};



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