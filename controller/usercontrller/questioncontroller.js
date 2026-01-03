const QN = require('../../models/questions')
const Tags = require('../../models/tag')
const user = require('../../models/user')
const Badge = require('../../models/badge')
const Filter  =require('bad-words')
const ANS = require('../../models/answer')
const filter = new Filter()

const { findOneAndUpdate } = require('../../models/user');
const socket = require('socket.io')
const Report = require('../../models/report')

const addQn = async (req, res) => {
 try{
  const cHtml = req.body.CHtml;
  // const Content = req.body.Content;
  let editor = req.body.editorContent;
  const tags = req.body.tags

  let searchTextRegex =/(<pre\b[^>]>)([\s\S]?)(<\/pre>)/gi;
  
  editor =  editor.replace(searchTextRegex,`<div class=" bg-gray-800 rounded-lg overflow-hidden mt-6">
  <div class="flex justify-between">
      <div id="header-buttons" class="py-3 px-4 flex">
          <div class="rounded-full w-3 h-3 bg-red-500 mr-2"></div>
          <div class="rounded-full w-3 h-3 bg-yellow-500 mr-2"></div>
          <div class="rounded-full w-3 h-3 bg-green-500"></div>
      </div>
      <button  class="p-2 text-center bg-gray-800 text-gray-100 hover:bg-gray-700 rounded flex justify-between items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="pr-1">
              <path fill="currentColor" fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v9a2 2 0 002 2h2v2a2 2 0 002 2h9a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H4zm9 4V4H4v9h2V8a2 2 0 012-2h5zM8 8h9v9H8V8z"/>
          </svg>
          Copy
      </button>
  </div>
  <div class="w-full mx-2 my-2 overflow-auto">
  $1$2$3
  </div>
</div>`);

  const data = res.locals.jwt_user;
  const email = data.email;
  const Id = await user.findOne({email:email},{_id:1})
 const id = Id._id.toString()

//  if(filter.isProfane(Content)){
//   return res.status(200).json("Don't use false langaugue")
//  }else{
  const qns = new QN({
    // title: Content,
    titlehtml: cHtml,
    body: editor,
    user:id,
    tags:tags,
  });
  await qns.save();
await user.findOneAndUpdate({_id:id},{$inc:{qncount:1}})
 
res.status(200).json({success:true})
// }
 }catch(err){
  console.log(err,'error')
  res.status(500).json('something went wrong')
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
    const answer = await ANS.find({question: ID}).populate('user').sort({createdAt: -1})
    console.log(qn);
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
        answer,
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
    const tags = await Tags.find({})
    res.json({
        tags
    })
   }catch(err){
    res.json({
      error:'tags not found'
    })
   }
}

const getHomeData = async (req, res) => {
  try {
    const questions = await QN.find(
      { state: "active" },
      {
        title: 1,
        titlehtml: 1,
        body: 1,
        answer: 1,
        tags:1,
        createdAt: 1,
        upvote: 1,
        downvote: 1
      }
    )
      .populate("user", "_id username") 
      .populate("tags","_id name")
      .sort({ createdAt: -1 });

    const formatted = questions.map(q => ({
      _id: q._id,
      title: q.title,
      titlehtml: q.titlehtml,
      body: q.body,
      answer: q.answer,
      tags:q.tags,
      upvoteCount: q.upvote?.length || 0,
      downvoteCount: q.downvote?.length || 0,
      createdAt: q.createdAt,
      user: q.user
    }));

    const tags = await QN.aggregate([
  { $unwind: '$tags' },
  {
    $addFields: {
      tagObjectId: {
        $toObjectId: '$tags'
      }
    }
  },
  {
    $group: {
      _id: '$tagObjectId',
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: 'tags',
      localField: '_id',
      foreignField: '_id',
      as: 'tag'
    }
  },
  { $unwind: '$tag' },
  {
    $project: {
      _id: '$tag._id',
      name: '$tag.name',
      image: '$tag.image',
      point: '$tag.point',
      count: 1
    }
  }
]);

    res.json({ 
      questions: formatted,
      topTags: tags
     });
  } catch (err) {
    res.json({ error: err });
  }
};

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

const voteQuestion = async (req, res) => {
  try {
    const { questionId, vote } = req.body;

    const { email } = res.locals.jwt_user;

    const userDoc = await user.findOne({ email }, { _id: 1 });
    if (!userDoc) {
      return res.status(401).json({ success: false });
    }

    const userId = userDoc._id;

    const question = await QN.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false });
    }

    const hasUpvoted = question.upvote.some(
      (id) => id.equals(userId)
    );
    const hasDownvoted = question.downvote.some(
      (id) => id.equals(userId)
    );

    if (vote === 'up') {
      if (hasUpvoted) {
        question.upvote.pull(userId);
      } else {
        question.upvote.addToSet(userId);
        question.downvote.pull(userId);
      }
    }

    if (vote === 'down') {
      if (hasDownvoted) {
        question.downvote.pull(userId);
      } else {
        question.downvote.addToSet(userId);
        question.upvote.pull(userId);
      }
    }

    await question.save();

    return res.json({
      success: true,
      voteStatus: {
        upvoted: question.upvote.some(id => id.equals(userId)),
        downvoted: question.downvote.some(id => id.equals(userId))
      },
      counts: {
        upvotes: question.upvote.length,
        downvotes: question.downvote.length
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

  module.exports ={
    addQn,
    // searchQn,
    tagForQn,
    getHomeData,
    singleQn,
    addReport,
    voteQuestion,
}