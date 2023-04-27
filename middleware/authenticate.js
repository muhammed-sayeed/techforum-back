const jwt = require('jsonwebtoken')
const config = require('../config.json')

module.exports.tokenCheck = (req,res,next)=>{
   console.log(req.headers);
    const token = req.body.token || req.query.token || req.headers['authorization']
    if(token){
        jwt.verify(token,config.tokenSecret,function(err,decoded){
            if(err){
                return res.status(401).json({"error":true,"msg":'unauthorized access'})
     }
     res.locals.jwt_user = decoded;
     next()
        })
    }else{
        return res.status(401).send({
            "error":true,
            "msg":'No token Provided'
        })
    }
}