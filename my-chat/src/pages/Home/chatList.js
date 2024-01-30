import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { startConversation } from '../../reducers/conversationReducer'
import { getMessages, addMessage } from '../../reducers/messageReducer'
import socket from '../../config/socket.config'

const ChatList = (props) => {
  const { conversations } = props

  const StartChat = async (conversation_id) => {
    const result = await props.startConversation(conversation_id);
    if(result){
      props.getMessages({
        conversation_id: conversation_id
      })
    }
    // const res = await socket.emit('join_room', conversation_id);
    // console.log("JR:", res);
  }

  useEffect(() => {
    socket.on('message', (message) => {
      console.log('Received message:', message);
      props.addMessage(message)
    });
  }, [])

  return (
    <ul className="list-group">
      {conversations.map((conversation, index) => {
        let last_msg_created_at = new Date(conversation.last_message.createdAt);
        let msg_time = `${last_msg_created_at.getHours()}:${last_msg_created_at.getMinutes() > 9 ? last_msg_created_at.getMinutes() : `0${last_msg_created_at.getMinutes()}`}`                  
        return(
          <li key={`new_conversation_${index}`} className={`list-group-item ${conversation?.active ? 'active' : ''}`} onClick={() => StartChat(conversation.id)}>
            <div className="d-flex">
              {/* <div className='rounded-circle bg-info px-2 py-2 my-1' style={{ width: '40px', height: '40px'}}> */}
                <span className="btn btn-info px-2 py-2 my-1 position-relative rounded-circle" style={{ width: '42px', height: '42px'}}>
                  {`${conversation.title.split(" ").map((ele)=>ele[0].toUpperCase()).join('')}`}
                  {conversation.private ? 
                    <span className={`position-absolute start-95 translate-middle p-1 ${props.active_users[conversation.user_id] ? "bg-success" : "bg-danger"} border border-light rounded-circle`} style={{top: "5px", right: "-7px" }}>
                      <span className="visually-hidden">New alerts</span>
                    </span>
                  : ""}
                </span>
              {/* </div> */}
              <div className='d-flex flex-column flex-grow-1 ms-2'>
                <div className="fw-bold">{conversation.title}</div>
                <div className='d-flex justify-content-center'>
                  <div className='flex-grow-1'>
                    {conversation.last_message.data}
                  </div>
                  <span className=''>{msg_time}</span>
                </div>
                {/* <span className="badge bg-info rounded-pill">14</span> */}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

const mapStateToProps = (state) => ({
  conversations: state.conversations.list,
  active_users: state.conversations.active_users,
  active_conversation: state.conversations.active,
  conversations_loading: state.conversations.status,
})

const mapDispatchToProps = {
  startConversation,
  getMessages,
  addMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatList)