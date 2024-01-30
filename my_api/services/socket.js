const socket_io = (io) => {
  let online_users = {}
  io.on('connection', async(socket) => {
  console.log('new client connected');
  console.log("SOCKET:", socket.id);


  const { User, Conversation, Message } = require('../models');

//   console.log("SOCKET:", socket.handshake.session);
  if(socket.handshake.session?.current_user){
    const current_user = socket.handshake.session.current_user
    console.log(current_user.id);    

    if(current_user){
      online_users[current_user.id] = socket.id;
      console.log("ONLINE USERS:", online_users);      
      io.emit('online_users', online_users);
    }

    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
      io.to(room).emit('send_message', 'welcome....');
    });

    socket.on('send_message', (room, message) => {
      let msg = {};
      msg.sender_id = current_user.id;
      msg.conversation_id = room
      msg.data = message
      Message.create(msg).then((data)=>{
        let result = data.toJSON()
        result.sender = {
          id: current_user.id,
          full_name: current_user.full_name
        }
        console.log(result);
        io.to(room).emit('message', result);
      })
      .catch((err)=> {
        console.log("ERROR:", err);
      })
    });

    socket.on("callUser", ({ userToCall, signalData, from, user_id }) => {
      console.log("Call progres...");
      console.log(userToCall);
      console.log(signalData);
      console.log(from);
      console.log("USER ID:", user_id);
      io.to(userToCall).emit("callUser", { signal: signalData, from: from, user_id: user_id });
    });

    socket.on("answerCall", (data) => {
      console.log("Call accepted...", data);
      io.to(data.to).emit("callAccepted", data.signal)
    });

    socket.on("callCancelled", (data) => {
      console.log("Call cancelled...", data);
      io.to(data.to).emit("callCancelled", data.from);
    });

    // const user = await User.update({ online: true }, {
    //   where: {
    //     id: current_user.id
    //   }
    // });


    // User.findOne({ 
    //   where: {
    //     id: current_user?.id
    //   },
    //   include: [
    //     {
    //       model: Conversation,
    //       as: 'receiverable',
    //       include: [{
    //         model: User,
    //         as: 'creator'
    //       }],
    //     },
    //     {
    //       model: Conversation,
    //       as: 'creator',
    //       include: [{
    //         model: User,
    //         as: 'receiverable'
    //       }],
    //     }
    //   ]
    // }).then((data) => {
    //   const result = data.toJSON()
    //   const conversations = result.receiverable.concat(result.creator);
    //   conversations.map((conversation) => {
    //     let chat_room = `chat_room_${conversation.id}`;
    //     console.log("============================");
    //     console.log("CR:", chat_room);
    //     console.log("============================");
    //     socket.join(chat_room)
    //     socket.on('message', (message) => {
    //       console.log("-------------------------");
    //       console.log("MESSAGE:", message);
    //       console.log("-------------------------");
    //       // Broadcast the message to everyone in the room
    //       io.to(chat_room).emit('message', message);
    //     });
    //   })
    // });
  }
  

//   socket.on('sendMessage', (message) => {
//     io.emit('message', message);
//   });  

  socket.on('disconnect', async() => {
    console.log(`Socket ${socket.id} disconnected`);
    if(socket.handshake.session?.current_user){
      const current_user = socket.handshake.session.current_user
      console.log(current_user.id);
      if(current_user){
        delete online_users[current_user.id];
        console.log("ONLINE USERS:", online_users);
        io.emit('online_users', online_users);
        const user = await User.update({ online: false }, {
          where: {
            id: current_user.id
          }
        });
        console.log("offline", user);
      }
    }
  });
});
}

module.exports = socket_io;