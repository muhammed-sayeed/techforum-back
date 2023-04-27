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
      phone: req.body.phone,
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
      phone: req.body.phone,
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
      res.status('403').json('incorrect password')
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
      res.status('403').json('incorrect password')
    }
  } else {
    res.status('422').json('Invailed Email')
  }
 }catch(err){
 
 }
};

const token = (req, res) => {
  const postData = req.body;
  if (postData.refreshToken && postData.refreshToken in tokenList) {
    const user = {
      email: postData.email,
      username: postData.username,
    };
    const token = jwt.sign(user, config.tokenSecret, {
      expiresIn: config.tokenLife,
    });
    const response = {
      token: token,
    };
    tokenList[postData.refreshToken].token = token;
    console.log(tokenList, "lliiiist");
    res.status(200).json(response);
  } else {
    res.status(404).send("Invaild Request");
  }
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

  imgUrl = `http://localhost:3000/${data.path.substring(6)}`;
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
    const alltags = await Tags.aggregate([{ $match: { name: regex } }]);
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
  const qnlist = await Qn.find({tags:{$in:[Id]}}).populate('user')
  res.json({
    qnlist
  })
 }catch(err){
 res.status('408').json('something went wrong')
 }
}

const tagBasedQn = async (req,res)=>{
  try{
    const Id = req.query.Id
  const tagDetails = await Tags.findOne({_id:Id})
  const tagQn =  await Qn.find({tags:{$in:[Id]}}).populate('user')

  res.json({
    tagDetails,
    tagQn
  })
  }catch(err){
   res.status('404').json('page not found')
  }
}




module.exports = {
  homeView,
  signup,
  login,
  token,
  userProfile,
  imgUpdate,
  updateProfile,
  usersDetails,
  singlrUser,
  searchUser,
  searchTags,
  tagBasedQn ,
  tagQn
};
