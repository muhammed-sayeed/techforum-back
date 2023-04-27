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


router.get('/userlist',userList)
router.post('/manageuser',manageUser)
router.post('/edituser',ediUser)
router.post('/addtag',addTag)
router.get('/taglist',tagList)
router.put('/edittag',editTag)
router.delete('/removetag',removeTag)
router.get('/moderatorlist',moderatorlist)
router.post('/addcommunity',addCommunity)
router.get('/communitylist',communityList)
router.post('/removecommunity',removeCommunity)
router.put('/updateimg',updateImg)
router.post('/addbadge',addBadge)
router.get('/badgelist',badgeList)
router.post('/removemember',removeMember)
router.patch('/editbadge',editBadge)
router.get('/reportqns',reportedQns)
router.get('/getsingleqn',singleReport)
router.put('/blockqn',blockQuestion)
router.get('/checkname',checkName)

module.exports = router