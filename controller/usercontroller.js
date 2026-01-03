const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = require("../models/user");
const config = require("../config.json");
const Tags = require("../models/tag");
const natural = require("natural");
const Qn = require("../models/questions");
const Article = require('../models/article')

const socket = require('socket.io') 
const ANS = require('../models/answer')

const tokenList = {};

const homeView = (req, res) => {
  res.json({ success: true });
};

const signup = async (req, res) => {
 try{
  const email = req.body.email;
  const uZer = await user.findOne({ email: email });

  if (uZer) {
    res.json({
      success: false,
      msg: "Email already Registered",
    });
  } else {
    const password = req.body.password;
    console.log(password, "paaas");
    const hashedpassword = await bcrypt.hash(password, 10);
    const User = new user({
      username: req.body.username,
      // phone: req.body.phone,
      email: req.body.email,
      password: hashedpassword,
    });
    await User.save();
    let uuser = {
      email: req.body.email,
      username: req.body.username,
    };
    const token = jwt.sign(uuser, config.tokenSecret, {
      expiresIn: config.tokenLife,
    });
    const refreshToken = jwt.sign(uuser, config.refreshTokenSecret, {
      expiresIn: config.refreshLife,
    });
    let userdata = {
      username: req.body.username,
      // phone: req.body.phone,
      email: req.body.email,
      token: token,
      refreshtoken: refreshToken,
    };
    res.json({
      success: true,
      userdata,
    });
  }
 }catch(err){
  res.json({
    error:'somthing went wrong'
  })
 }
};

const login = async (req, res) => {
 try{
  const email = req.body.email;
  const password = req.body.password;

  const uZer = await user.findOne({ email: email });

  if (uZer && uZer.category == "admin") {
    const admin = {
      email: email,
      username: uZer.username,
    };
    data = await bcrypt.compare(password, uZer.password);

    if (data) {
      const token = jwt.sign(admin, config.tokenSecret, {
        expiresIn: config.tokenLife,
      });
      const refreshToken = jwt.sign(admin, config.refreshTokenSecret, {
        expiresIn: config.refreshLife,
      });
      const response = {
        username: uZer.username,
        email: uZer.email,
        role: uZer.category,
        phone: uZer.phone,
        token: token,
        refreshtoken: refreshToken,
      };
      tokenList[refreshToken] = response;

      res.json({
        success: true,
        response,
      });
    }else{
      res.status(400).json({
        success: false,
        message: "Incorrect password"
      });

    }
  } else if (uZer && uZer.access) {
    const User = {
      email: email,
      username: uZer.username,
    };
    data = await bcrypt.compare(password, uZer.password);
    console.log(config.tokenLife, "tokenlife");

    if (data) {
      const token = jwt.sign(User, config.tokenSecret, {
        expiresIn: config.tokenLife,
      });
      const refreshToken = jwt.sign(User, config.refreshTokenSecret, {
        expiresIn: config.refreshLife,
      });
      const response = {
        Id: uZer._id,
        username: uZer.username,
        email: uZer.email,
        role: uZer.category,
        phone: uZer.phone,
        token: token,
        refreshtoken: refreshToken,
      };
      tokenList[refreshToken] = response;

      res.json({
        success: true,
        response,
      });
    }else{
      res.status(400).json({
        success: false,
        message: "Incorrect password"
      });
    }
  } else {
    res.status(400).json({
        success: false,
        message: "Invalid Email"
      });
  }
 }catch(err){
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
 }
};

const refreshAccessToken = (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token missing" });
  }

  jwt.verify(refreshToken, config.refreshTokenSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const payload = {
      email: decoded.email,
      username: decoded.username
    };

    const newAccessToken = jwt.sign(payload, config.tokenSecret, {
      expiresIn: config.tokenLife
    });

    res.json({
      success: true,
      token: newAccessToken
    });
  });
};



const userProfile = async (req, res) => {
  try{
    const data = res.locals.jwt_user;
  const email = data.email;
  const Id = await user.findOne({email:email},{_id:1})
  const id = Id._id.toString()

  const profile = await user.findOne(
    { email: email },
    {
      _id: 1,
      username: 1,
      email: 1,
      createdAt: 1,
      questions:1,
      answers:1,
      image: 1,
      badges: 1,
      place:1,
      bio:1,
      education:1,
      work:1
    }
  );

  const art = await Article.find({user:id})
  profile.comments = art

  const Questions = await Qn.find({user:id}).populate('tags')
 profile.questions = Questions

 const answers = await ANS.find({user:id})
 profile.answers = answers

  res.json({
    profile,
  });
  }catch(err){
   res.json({
    error:'page not found'
   })
  }
};

const imgUpdate = async (req, res) => {
 try{
  const Id = req.body.id;
  const data = req.file;

  imgUrl = `https://codforum.onrender.com/${data.path.substring(6)}`;
  await user.findOneAndUpdate({ _id: Id }, { $set: { image: imgUrl } });

  res.json({
    success: true,
  });
 }catch(err){
  res.json({
    error:'somthing went wrong'
  })
 }
};

const updateProfile = async (req, res) => {
  try{
    const Id = req.body.Id;
  const username = req.body.username;
  
  const job = req.body.job
  const education = req.body.education
  const bio = req.body.bio
  const place = req.body.place

  await user.findOneAndUpdate(
    { _id: Id },
    { $set: { username: username, work:job,education:education,bio:bio,place:place } }
  );

  res.json({
    success: true,
  });
  }catch(err){
    res.json({
      error:'somthing went wrong'
    })
  }
};

const usersDetails = async (req, res) => {
 try{
  const data = res.locals.jwt_user;
  const email = data.email;
  const users = await user.find({
    category: { $in: ["user", "moderator"] },
    email: { $ne: email },
  });

  res.json({
    users,
  });
 }catch(err){
  error:'page not found'
 }
};

const singlrUser = async (req, res) => {
 try{
  const Id = req.query.Id;
 
  const profile = await user.findOne({ _id: Id }, { password: 0, phone: 0 });
 const Qns = await Qn.find({user:Id})
 profile.questions = Qns
 const Ans =  await ANS.find({user:Id})
 profile.answers =Ans
 const Art = await Article.find({user:Id})
 profile.comments = Art
  res.json({
    profile,
  })
 }catch(err){
  res.json({
    error:'page not found'
  })
 }
};

const searchUser = async (req, res) => {
  try{
    const skey = req.query.val;
  const data = res.locals.jwt_user;
  const email = data.email;
  console.log(skey);
  const regex = new RegExp("^" + skey + ".*", "i");
  const allUsers = await user.aggregate([
    {
      $match: {
        username: regex,
        category: { $ne: "admin" },
        email: { $ne: email },
      },
    },
  ]);
  res.json({
    success: true,
    userdetails: allUsers,
  })
  }catch(err){
   res.json({
    error:'somthing went wrong'
   })
  }
};

const searchTags = async (req, res) => {
  try{
    const skey = req.query.val;

    console.log(skey);
    const regex = new RegExp("^" + skey + ".*", "i");
    const alltags = await Tags.aggregate([
  { $match: { name: regex } },
  {
    $project: {
      _id: 1,
      name: 1,
      description: 1
    }
  }
]);
    res.json({
      success: true,
      tagdetails: alltags,
    })
  }catch(err){
   res.json({
    error:'somthing went wrong'
   })
  }
  
};



const tagQn = async (req,res)=>{
 try{
  const Id = req.query.Id
  console.log(Id);
  const qnlist = await Qn.find({tags:{$in:[Id]}}).populate('user').sort({ceatedAt: -1})
  res.json({
    qnlist
  })
 }catch(err){
 res.status(500).json('something went wrong')
 }
}

const tagBasedQn = async (req,res)=>{
  try{
    const Id = req.query.Id
  const tagDetails = await Tags.findOne({_id:Id})
  const qnlist =  await Qn.find({tags:{$in:[Id]}}).populate('user').populate('tags')

  const relatedTags = await Qn.aggregate([
      {
        $match: {
          tags: Id
        }
      },
      { $unwind: '$tags' },
      {
        $match: {
          tags: { $ne: Id }
        }
      },
      {
        $addFields: {
          tagObjectId: { $toObjectId: '$tags' }
        }
      },
      {
        $group: {
          _id: '$tagObjectId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
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
          count: 1
        }
      }
    ]);

  res.json({
    tagDetails,
    qnlist,
    relatedTags
  })
  }catch(err){
   res.status(500).json('page not found')
  }
}

const mongoose = require("mongoose");

const listOfTags = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const pageSize = parseInt(req.query.pageSize || '20', 10);
    const search = req.query.search || '';
    const sort = req.query.sort || 'popular';

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    let sortObj = {};
    if (sort === 'name') sortObj = { name: 1 };
    else if (sort === 'new') sortObj = { createdAt: -1 };
    else sortObj = { point: -1 };

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const tagsAgg = await Tags.aggregate([
      { $match: filter },

      // Convert each string tag inside questions.tags → ObjectId
      {
        $lookup: {
          from: "questions",
          let: { tagId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    { $toString: "$$tagId" }, // compare as string
                    "$tags"                   // your questions.tags are strings
                  ]
                }
              }
            }
          ],
          as: "questions"
        }
      },

      {
        $addFields: {
          totalQuestions: { $size: "$questions" },
          lastWeekQuestions: {
            $size: {
              $filter: {
                input: "$questions",
                as: "q",
                cond: { $gte: ["$$q.createdAt", lastWeek] }
              }
            }
          }
        }
      },

      { $project: { questions: 0 } },

      { $sort: sortObj },

      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]);

    const total = await Tags.countDocuments(filter);

    res.json({
      tags: tagsAgg,
      total,
      page,
      pageSize,
    });

  } catch (e) {
    console.log(e);
    res.status(500).json("internal server error");
  }
};

module.exports = {
  homeView,
  signup,
  login,
  userProfile,
  imgUpdate,
  updateProfile,
  usersDetails,
  singlrUser,
  searchUser,
  searchTags,
  tagBasedQn ,
  tagQn,
  listOfTags,
  refreshAccessToken
};
