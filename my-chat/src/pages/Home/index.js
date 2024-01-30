import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import './style.css'
import socket from '../../config/socket.config'
import axiosInstance from '../../config/http-config'
import { getConversations, setOnline } from '../../reducers/conversationReducer'
import ChatList from './chatList'
import { sendMessage } from '../../reducers/messageReducer'
import Peer from 'simple-peer'
import Icon from '@mdi/react'
import { mdiPhone, mdiPhoneHangup } from '@mdi/js'

const Home = (props) => {
  const sct = socket
  const { conversation, messages } = props
  const [message, setMessage] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [caller, setCaller] = useState('');
  const [call, setCall] = useState({});
  const [requestedCall, setRequestedCall] = useState();
  const [me, setMe] = useState('');
  const connectionRef = useRef();
  const [showCall, setShowCall] = useState(false);
  const [callDuration, setCallDuration] = useState('0:00');
  const [mic, setMic] = useState(false);

  useEffect(() => {
    props.getConversations();
  }, []);

  useEffect(() => {
    props.conversations.forEach(conversation => {
      if(conversation.private && conversation.user_id == call.user_id){
        console.log(conversation);
        setCaller(conversation);
      }
    });
  }, [call]);

  const getUserMedia = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(currentStream);
      myVideo.current.srcObject = currentStream;
      setMic(true);
    } catch (err) {
      console.log(err);
      alert("Please allow microphone permission for audio call")
    }
  };

  useEffect(() => {
    socket.connect();
    socket.on('me', (id) => setMe(id));
    socket.on('online_users', (users) => {
      console.log(users);
      props.setOnline(users);
    });

    socket.on('callUser', ({ from, name: callerName, signal, user_id }) => {
      setShowCall(true);
      console.log("Ringing...");
      console.log(from, callerName, signal);
      console.log("PROPS:", props);
      setCall({ isReceivingCall: true, from, name: callerName, signal, user_id: user_id });
    });

    socket.on('callCancelled', (data) => {
      console.log("DATA:", data);
      if(!callAccepted && call.from === data.from ){
        console.log("END");
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.destroy();
        connectionRef.current = peer;
        setCall({});
        setShowCall(false);
      }
    });

    const peer = new Peer({ initiator: true, trickle: false, stream });
    connectionRef.current = peer;
    getUserMedia();
  }, []);

  const callUser = (id, conversation) => {
    console.log("CALL TO:", id);
    const peer = new Peer({ initiator: true, trickle: false, stream });
    setRequestedCall(conversation);
    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: props.socket_id, user_id: props.current_user.id });
    });
    peer.on('stream', (currentStream) => {
      console.log("data sending...");
      userVideo.current.srcObject = currentStream;
    });
    socket.on('callAccepted', (signal) => {
      console.log("Call accepted..");
      setCallAccepted(true);
      peer.signal(signal);
    });
    peer.on('close', (data) => {
      console.log("Call closed..");
      setCall({});
      setCallAccepted(false);
      setRequestedCall();
      socket.off("callAccepted");
    })
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  const submit_message = async (event) => {
    if (event.key === 'Enter' && message) {
      setMessage('');
      const result = await props.sendMessage({
        data: message,
        conversation_id: conversation.id
      });
    }
  }

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });
    peer.on('stream', (currentStream) => {
      setShowCall(true);
      userVideo.current.srcObject = currentStream;
    });
    peer.on('destroy', (data) => {
      console.log("Call ended....");
    });
    peer.on('close', (data) => {
      console.log("Call closed..");
      setCall({});
      setCallAccepted(false);
      setRequestedCall();
      setShowCall(false);
      socket.off("callAccepted");
    })
    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const rejectCall = () => {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.destroy();
    connectionRef.current = peer;
  }

  const cancelledCall = () => {
    console.log(requestedCall);
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.destroy();
    connectionRef.current = peer;
    socket.emit("callCancelled", {
      to: props.active_users[requestedCall.user_id],
      from: props.socket_id
    });
    setRequestedCall();
  }

  const SetCallDuration = (seconds) => {
    var sec_num = parseInt(seconds, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    setCallDuration(hours+':'+minutes+':'+seconds);   
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-md-3'>
          <div className='card chat_list'>
            <div className='card-body'>
              <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button className="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">Chat</button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">Contact</button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-contact" type="button" role="tab" aria-controls="pills-contact" aria-selected="false">Find</button>
                </li>
              </ul>
              <div className="tab-content" id="pills-tabContent">
                <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab" tabIndex="0">
                  <ChatList />
                  {/* <audio playsInline controls muted ref={myVideo} autoPlay width="600">
                    <source
                  </audio> */}
                  <audio ref={myVideo} muted controls volume="true" autoPlay style={{ display: 'none'}} />
                  {stream ? 
                    <audio ref={userVideo} onTimeUpdate={(e) => {
                      SetCallDuration(userVideo.current.currentTime);
                    }} controls autoPlay style={{ display: 'none'}} />
                  : ""}
                  {Object.keys(call).length !== 0 ? <button className='btn btn-primary' onClick={() => answerCall()}>Ringing...</button> : ""}
                </div>
                <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab" tabIndex="0">...</div>
                <div className="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab" tabIndex="0">...</div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-md-9'>
          {conversation ?
            <div className='card chat_body'>
              <div className='card-header d-flex justify-content-between'>
                <span class="btn btn-info px-2 py-2 my-1 position-relative rounded-circle align-middle" style={{ width: '42px', height: '40px'}}>
                  <span>{`${conversation.title.split(" ").map((ele)=>ele[0].toUpperCase()).join('')}`}</span>
                </span>
                <p className='text-capitalize flex-grow-1 ps-2'>{conversation.title}</p>
                {conversation?.private && props.active_users[conversation.user_id] ? 
                  <button disabled={!mic ? 'disabled' : ''} title={!mic ? 'Please allow microphone permission' : 'Call'} className='btn btn-dark' onClick={() => callUser(props.active_users[conversation.user_id], conversation)}>
                    <Icon
                      path={mdiPhone}
                      title="Call"
                      size={1}
                    />
                  </button>
                :""}
              </div>
              <div className='card-body overflow-auto d-flex flex-column-reverse'>
                {messages?.map((msg, index) => {
                  let msg_created_at = new Date(msg.createdAt)
                  let msg_time = `${msg_created_at.getHours()}:${msg_created_at.getMinutes() > 9 ? msg_created_at.getMinutes() : `0${msg_created_at.getMinutes()}`}`
                  let msg_date = index > 0 && (new Date(messages[index - 1].createdAt).toDateString() !== msg_created_at.toDateString()) ? new Date(messages[index - 1].createdAt).toDateString() : ""
                  return (
                    <div key={`msg_${msg.id}`}>
                      <div className={`row ${props.current_user.id === msg.sender_id ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className='col-8'>
                          <div className={`card mb-1 ${props.current_user.id === msg.sender_id ? 'text-bg-primary' : ''}`}>
                            {props.current_user.id !== msg.sender_id ?
                              <>
                                <small className='ms-2 mt-1 text-capitalize text-primary'>{msg.sender.full_name}</small>
                              </>
                              : ""}
                            <p className="card-text px-2 py-1">
                              {msg.data}
                            </p>
                          </div>
                          <p className='text-end'>{msg_time}</p>
                        </div>
                      </div>
                      {msg_date ? <center><p className='py-2'>{msg_date}</p></center> : ""}
                    </div>
                  )
                })}
              </div>
              <div className='card-footer'>
                <input type='text' className='form-control' value={message} onKeyDown={submit_message} onChange={(event) => setMessage(event.target.value)} />
              </div>
            </div>
          :
            <div className='card chat_body'>
              <div className='card-body m-auto'>
                <span className=''>
                  Welcome to the chat
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      {showCall && caller ?
        <div className='call_box'>
          <div class="alert alert-primary text-center" role="alert">
            <span class="btn btn-info px-2 py-2 my-1 position-relative rounded-circle" style={{width: '42px', height: '42px'}}>
              {`${caller.title.split(" ").map((ele)=>ele[0].toUpperCase()).join('')}`}
            </span>
            <h5 className="text-capitalize">{caller.title}</h5>
            {callAccepted ?
              <>
                <span role="status" className='text-white mb-2'>{callDuration}</span><br/>
                <button className='btn btn-danger' onClick={() => leaveCall()}>
                  <Icon
                    path={mdiPhoneHangup}
                    title="End Call"
                    size={1}
                  />
                </button>
              </>
              :
              Object.keys(call).length !== 0 ? 
                <>
                  <button className='btn btn-success me-2' onClick={() => answerCall()}>
                    <Icon
                      path={mdiPhone}
                      title="Accept Call"
                      size={1}
                      />
                  </button>
                  <button className='btn btn-danger' onClick={() => rejectCall()}>
                    <Icon
                      path={mdiPhoneHangup}
                      title="End Call"
                      size={1}
                    />
                  </button>
                </>
                : ""
            }
          </div>
        </div>
      :""}

      {requestedCall ?
        <div className='call_box'>
          <div class="alert alert-primary text-center" role="alert">
            <span class="btn btn-info px-2 py-2 my-1 position-relative rounded-circle" style={{width: '42px', height: '42px'}}>
              {`${requestedCall.title.split(" ").map((ele)=>ele[0].toUpperCase()).join('')}`}
            </span>
            <h5 className="text-capitalize">{requestedCall.title}</h5>
            {callAccepted ?
              <>
                <span role="status" className='text-white'>{callDuration}</span><br/>
                <button className='btn btn-danger' onClick={() => leaveCall()}>
                  <Icon
                    path={mdiPhoneHangup}
                    title="End Call"
                    size={1}
                  />
                </button>
              </>
              :
              <>
                <span class="spinner-border spinner-border-sm text-white" aria-hidden="true"></span>&nbsp;&nbsp;
                <span role="status" className='text-white'>Call inprogress...</span><br/>
                <button className='btn btn-danger' onClick={() => cancelledCall()}>
                  <Icon
                    path={mdiPhoneHangup}
                    title="End Call"
                    size={1}
                  />
                </button>
              </>            
            }
            {/* {Object.keys(call).length !== 0 ? <button className='btn btn-primary' onClick={() => answerCall()}>Accept</button> : ""} */}
          </div>
        </div>
      :""}
    </div>

  )
}

const mapStateToProps = (state) => ({
  conversations: state.conversations.list,
  chats: state.conversations.list,
  conversation: state.conversations?.active,
  active_users: state.conversations.active_users,
  messages: state.messages?.list[state.conversations?.active?.id],
  current_user: state.session.current_user,
  socket_id: state.session.socket_id
})

const mapDispatchToProps = {
  getConversations,
  sendMessage,
  setOnline
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)