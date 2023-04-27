const user = require("../../models/user");

const userList = async (req, res) => {
  try{
    const users = await user.find(
      { category: { $ne: "admin" } },
      { username: 1, email: 1, _id: 1, phone: 1, access: 1 }
    );
    res.json({
      users,
    });
  }catch(e){
    res.status('500').json('internal server error')
  }
   
  };
  
  const manageUser = async (req, res) => {
    try{
      const acc = req.body.access;
      const ID = req.body.Id;
      const newacc = !acc;
    
      await user.findOneAndUpdate({ _id: ID }, { $set: { access: newacc } });
      res.json({
        success: true,
      })
    }catch(e){
      res.status('500').json('internal server error')
    }
   ;
  };
  
  const ediUser = async (req, res) => {
    try{
      const id = req.body.Id
      const username = req.body.username
      const email = req.body.email
      const phone = req.body.phone
    
      await user.findOneAndUpdate({_id:id},{$set:{username:username,email:email,phone:phone}})
      res.json({
        success:true
      })
    }catch(e){
      res.status('500').json('internal server error')
    }
   
  }

  module.exports ={
    userList,
    manageUser,
    ediUser,
  }