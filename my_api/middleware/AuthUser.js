module.exports = async function (req, res, next) {
  if(req.session && req.session.current_user){
    const { User } = require('../models');
    next();
  }else{
    return res.status(401).json({
      error: "UNAUTHORISE ACCESS"
    })
  }
}