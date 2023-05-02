const Tag = require('../../models/tag')

const addTag = async(req,res)=>{
     try{
      console.log(req.body);
     
      const name = req.body.name
      const description = req.body.description
     
     
    
      const tag = new Tag ({
       name:name,
       description:description,
    
      })
     await tag.save()
    
      res.json({
        success:true
    })
     }catch(e){
      res.status(500).json('int server error')
     }
    
  }
  
  const tagList = async(req,res)=>{
    try{
      const tags = await Tag.find()
      console.log(tags,'taaaaaaa');
      res.json({
        tags
      })
    }catch(e){
      res.status(500).json('internal server error')
    }
   
  }
  
  const editTag = async (req,res)=>{
   try{
    const name = req.body.name
    const description = req.body.description
    const Id = req.body.Id
   
  
  await Tag.findOneAndUpdate({_id:Id},{$set:{name:name,description:description}})
  res.json({
    success:true
  })
   }catch(e){
    res.status(500).json('internal server error')
   }
   
  }
  
  const removeTag = async (req,res)=>{
   try{
    const Id = req.query.Id
    console.log(Id);
    await Tag.findOneAndDelete({_id:Id})
    res.json({
      success:true
    })
   }catch(e){
    res.status(500).json('internal server error')
   }
   
  }
  const checkName = async (req,res)=>{
  try{
    const name = req.query.value
    const data  = await Tag.findOne({name:name})
    if(data){
      res.status('400').json('Name already Exist')
    }else{
      res.status('200').json('name is available')
    }
  }catch(err){
    res.status(500).json('internal servar error')
  }
  }

  
module.exports ={
    addTag,
    tagList,
    editTag,
    removeTag,
    checkName
}