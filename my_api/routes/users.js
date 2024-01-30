var express = require('express');
var router = express.Router();

const { User, Conversation, Message } = require('../models');
const conversation = require('../models/conversation');
const messages_controller = require('../controllers/message_controller');

/* GET current user. */
router.get('/get_current_user', async function(req, res, next) {
  res.json({
    current_user: req.session.current_user
  })
});

router.get('/conversations', async function(req, res, next) {
  let current_user = req.session.current_user

  let result = await User.findOne({
    where: {
      id: current_user?.id
    },
    include: [
      {
        model: Conversation,
        as: 'chats',
        include: [
          {
            model: User,
            as: 'members'
          },
          {
            model: Message,
            as: 'messages',
            order: [["createdAt", "DESC"]],
            limit: 1 
          }
        ]
      },
    ]
  }).then((data) => {
    res.json({
      conversations: data.chats.sort((a,b) => { return b.messages[0].createdAt - a.messages[0].createdAt}).map((chat) => {
        return({
          id: chat.id,
          title: chat.name ? chat.name : chat.members[0].id === current_user.id ? chat.members[1].full_name : chat.members[0].full_name,
          private: !Boolean(chat.name),
          user_id: !Boolean(chat.name) ? chat.members[0].id === current_user.id ? chat.members[1].id : chat.members[0].id : 0,
          last_message: chat?.messages ? chat.messages[0] : null
        })
      })
    })    
  });
    
  // let user = await User.findOne({
  //   where: {
  //     id: current_user?.id
  //   },
  //   // include: [
  //   //   {
  //   //     model: Conversation,
  //   //     as: 'receiverable',
  //   //     include: [{
  //   //       model: User,
  //   //       as: 'creator'
  //   //     }],
  //   //   },
  //   //   {
  //   //     model: Conversation,
  //   //     as: 'creator',
  //   //     include: [{
  //   //       model: User,
  //   //       as: 'receiverable'
  //   //     }],
  //   //   }
  //   // ]
  // }).then((data) => {
  //   const result = data.toJSON()
  //   const conversations = result.receiverable.concat(result.creator);
  //   res.json({
  //     conversations: conversations.map(conversation => {
  //       if(conversation.receiverable_type === "user"){
  //         return({
  //           id: conversation.id,
  //           title: conversation.creator_id === current_user.id ? conversation.receiverable.full_name : conversation.creator.full_name,
  //           online: conversation.creator_id === current_user.id ? conversation.receiverable.online : conversation.creator.online,
  //         })
  //       }
  //     })
  //   })
  // })
});

router.post('/get_messages', messages_controller.search);

router.post('/send_message', messages_controller.create);

router.get('/sign_out', async function(req, res, next){
  req.session.destroy(function(err){
    if(err){
      res.json({
        error: err
      })
    }else{
      res.json({
        status: "okay"
      })
    }
  })
});

module.exports = router;
