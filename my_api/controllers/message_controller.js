const { Message } = require('../models');
const socket = require('socket.io');
const { User } = require('../models');

exports.search = async function(req, res, next){
  Message.findAll({ 
    where: {
      conversation_id: req.body.conversation_id
    },
    include: [{
      model: User,
      as: 'sender',
    }],
    order: [
      ['createdAt', 'DESC']
    ]
  }).then((data) => {
    res.json({
      messages: data
    });
  });
}

exports.create = async function(req, res, next){
  let message = req.body.message;
  message.sender_id = req.session.current_user.id;
  Message.create(message).then((data) => {
    console.log(io);
    io.to(data.conversation_id).emit('message', data);
    res.json({
      data: data
    });
  })
  .catch((error) => {
    res.json({
      error: error
    });
  });
}