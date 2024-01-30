import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../config/http-config";
import socket from "../config/socket.config";

const initialState = {
  list: [],
  status: 'idle',
  value: 0,
  active_users: {}
};

export const getConversations = createAsyncThunk(
  'fetchConversations',
  async (payload, { getState }) => {
    const current_user = getState().session.current_user;
    const response = await axiosInstance.get('/conversations');
    let result = response?.data?.conversations
    return result;
  }
);

export const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    startConversation: (state, action) => {
      state.list.map(conversation => {
        if(conversation.id == action.payload){
          conversation.active = true;
          const res = socket.emit('join_room', conversation.id);
          state.active = conversation;
        }else{
          conversation.active = false;
        }
      });
    },
    setOnline: (state, action) => {
      // console.log("ON:", action.payload);
      state.active_users = action.payload;
      // state.list.map(conversation => {
      //   if(conversation.private){
      //     console.log("CPM:", conversation.user_id);
      //     conversation.online = Boolean(action.payload[conversation.user_id]);
      //     conversation.socket_id = action.payload[conversation.user_id];
      //   }
      // });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.status = 'idle';
        state.list = action.payload;
      });
  },
});

export const { startConversation, setOnline } = conversationSlice.actions

export default conversationSlice.reducer;