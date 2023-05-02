const QNS = require('../../models/questions')
const Report = require('../../models/report')
const ANS = require('../../models/answer')
const Comments = require('../../models/comment')

const reportedQns = async(req,res)=>{
    try{
        const questions = await QNS.find({reportcount:{$gt:0},state:'active'})
        res.json({
            questions
        })
    }catch(e){
        res.status(500).json('internal server error')
    }
   
}

const singleReport = async(req,res)=>{
    try{
        const Id = req.query.Id
        const question = await QNS.findOne({_id:Id}).populate('user')
        const answers= await ANS.find({question:Id})
        const reports = await Report.find({question:Id})
        const comments = await Comments.find({question:Id})
    
        res.json({
            question,
            answers,
            reports,
            comments
        })
    }catch(e){
        res.status(500).json('internal server error')
    }
    
}
const blockQuestion = async (req,res)=>{
    try{
        console.log("Hello");
        const Id=req.query.id
        console.log(Id);
        await QNS.findOneAndUpdate({_id:Id},{$set:{state:'reported'}})
        res.json({
            success:true
        })
    }catch(e){
        res.status(500).json('internal server error')
    }
   
}
module.exports = {
    reportedQns,
    singleReport,
    blockQuestion
}