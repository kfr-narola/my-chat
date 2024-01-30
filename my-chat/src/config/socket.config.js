import { io } from "socket.io-client";
import { store } from '../index'

const socket = io(process.env.REACT_APP_SOCKET_SERVER, {
  withCredentials: true,
  autoConnect: false
});

socket.on("connect", () => {
  console.log(`I'm connected with the back-end`);
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  store.dispatch({
    type: "session/setSession",
    payload: {
      online: true,
      socket_id: socket.id
    }
  })
});

export default socket