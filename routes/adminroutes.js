const express = require('express')
const router = express.Router()

const {
    userList,
    manageUser,
    ediUser,
   } = require('../controller/admincontroller/usercontrller')

const {
    addTag,
    tagList,
    editTag,
    removeTag,
    checkName
} = require('../controller/admincontroller/tagcontroller')

const {
    moderatorlist,
    addCommunity,
    communityList,
    removeMember,
    removeCommunity,
    updateImg,

} = require('../controller/admincontroller/communitycontroller')

const {
    addBadge,
    badgeList,
    editBadge
    
} = require('../controller/admincontroller/badgecontroller')

const {
    reportedQns,
    singleReport,
    blockQuestion
} = require('../controller/admincontroller/reportcontroller')


router.get('/userlist',tokenCheck,userList)
router.post('/manageuser',tokenCheck,manageUser)
router.post('/edituser',tokenCheck,ediUser)
router.post('/addtag',tokenCheck,addTag)
router.get('/taglist',tokenCheck.tagList)
router.put('/edittag',tokenCheck,editTag)
router.delete('/removetag',tokenCheck,removeTag)
router.get('/moderatorlist',tokenCheck,moderatorlist)
router.post('/addcommunity',tokenCheck,addCommunity)
router.get('/communitylist',tokenCheck,communityList)
router.post('/removecommunity',tokenCheck,removeCommunity)
router.put('/updateimg',tokenCheck,updateImg)
router.post('/addbadge',tokenCheck,addBadge)
router.get('/badgelist',tokenCheck,badgeList)
router.post('/removemember',tokenCheck,removeMember)
router.patch('/editbadge',tokenCheck,editBadge)
router.get('/reportqns',tokenCheck,reportedQns)
router.get('/getsingleqn',tokenCheck,singleReport)
router.put('/blockqn',tokenCheck,blockQuestion)
router.get('/checkname',tokenCheck,checkName)

module.exports = router