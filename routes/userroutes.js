const express = require('express')
const router = express.Router()
const{tokenCheck}=require('../middleware/authenticate')

const {
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
    tagBasedQn,
    tagQn
 
    

} = require('../controller/usercontroller')

const {
    addQn,
    // searchQn,
    tagForQn,
    getQuestions,
    singleQn,
    qnUpVoted,
    qnDownVoted,
    addReport,
  
} = require('../controller/usercontrller/questioncontroller')

const {
    saveAnswer,
    getAnswer,
    ansUpVote,
    ansDownVote,
} = require('../controller/usercontrller/answercontroller')

const {
    addComment,
    getComment,
} = require('../controller/usercontrller/commentcontroller')

const {
    getChatRoom,
    chatRooms
} = require('../controller/usercontrller/chatcontroller')

const {
    communityDetails,
    tagArticle,
    addArticle,
    submitArticle,
    rejectArticle,
    addArtComment,
    singleArticle,
    joinCommunity
} = require('../controller/usercontrller/communitycontroller')



router.get('/',homeView)
router.post('/signup',signup)
router.post('/login',login)
router.post('/token',token)
router.get('/userprofile',tokenCheck,userProfile)
router.patch('/imgupdate',imgUpdate)
router.post('/updateprofile',tokenCheck,updateProfile)
router.get('/users',tokenCheck,usersDetails)
router.get('/singleuser',singlrUser),
router.get('/searchuser',tokenCheck,searchUser)
router.get('/searchtags',searchTags)
// router.get('/checkqn',searchQn)
router.post('/addqn',tokenCheck,addQn)
router.get('/tagqn',tagForQn)
router.get('/getqn',getQuestions)
router.get('/singleqn',tokenCheck,singleQn)
router.post('/saveans',tokenCheck,saveAnswer)
router.get('/getanswer',tokenCheck,getAnswer)
router.patch('/qnupvoted',tokenCheck,qnUpVoted)
router.patch('/qndownvoted',tokenCheck,qnDownVoted)
router.patch('/ansup',tokenCheck,ansUpVote)
router.patch('/ansdown',tokenCheck,ansDownVote)
router.post('/addcomment',tokenCheck,addComment)
router.get('/getcomment',getComment)
router.post('/addreport',tokenCheck,addReport)
router.get('/gettagqn',tagQn)
router.get('/getchat/:room', getChatRoom)
router.get('/getchatrooms',chatRooms)
router.get('/communitydetails',tokenCheck,communityDetails)
router.get('/tagArticle',tagArticle)
router.post('/addarticle',tokenCheck,addArticle)
router.post('/submitarticle',submitArticle)
router.post('/rejectarticle',rejectArticle)
router.post('/addartcomment',tokenCheck,addArtComment)
router.get('/singleart',singleArticle)
router.patch('/joincommunity',tokenCheck,joinCommunity)
router.get('/tagbasedqn',tagBasedQn)



module.exports = router