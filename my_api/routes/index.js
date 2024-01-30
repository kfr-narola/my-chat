var express = require('express');
const { User } = require('../models');
const { Conversation } = require('../models');
var router = express.Router();

/* GET home page. */
router.post('/sign_in', async function(req, res, next){
  const email = req.body.user.email
  const password = req.body.user.password
  const user = await User.unscoped().findOne({ where: {
    email: email
  }})
  if(user && await user.validPassword(password, user.password)){
    let current_user = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      full_name: user.full_name,
      online: user.online
    }
    req.session.current_user = current_user
    res.json({
      current_user: current_user
    })
  }else{
    res.json({
      error: "Please enter valid email address and password"
    })
  }
})

router.post('/sign_up', async function(req, res, next){
  const user = await User.create(req.body.user).then((data) => { 
    res.json({
      data: data
    })
  })
  .catch((error) => {
    res.json({
      error: error
    })
  })
})

router.get('/test', async function(req, res, next) {
  const conversation = await Conversation.create({
    creator_id: 'd999c41b-b15f-4b42-925a-a62ee7086553',
    receiverable_id: '9507c23a-9d17-4610-b5a9-1e71923c0f37',
    receiverable_type: 'user'
  }).then((data) => { 
    res.json({
      data: data
    })
  })
  .catch((error) => {
    res.json({
      error: error
    })
  })
})

module.exports = router;
