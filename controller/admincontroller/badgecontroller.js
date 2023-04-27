const Badge = require('../../models/badge')
const user = require('../../models/user')

const addBadge = async(req,res)=>{
    try{
        const name = req.body.name
        const criteria = req.body.criteria
        const badge =  new Badge ({
            name:name,
            criteria:criteria,
        })
       await badge.save()
        res.json({
            success:true
        })
    }catch(e){
        res.status('500').json('internal server error')
    }
   
}
const badgeList = async (req,res)=>{
    try{
        const badgelist = await Badge.find().populate('Achievers')
        res.json({
            badgelist
        })
    }catch(e){
        res.status('404').json('page not found')
    }
   
}
const editBadge = async (req,res)=>{
    try{
        console.log(req.body);
        const Id = req.body.id
        const name = req.body.name
        const criteria = req.body.criteria
        await Badge.findOneAndUpdate({_id:Id},{$set:{name:name,criteria:criteria}})
        res.json({
           success:true
        })
    }catch(e){
        res.status('500').json('internal server error')
    }
   
}

module.exports = {
    addBadge,
    badgeList,
    editBadge
}