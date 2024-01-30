import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../config/http-config";
import { store } from "../index";
import socket from "../config/socket.config";

const initialState = {
  list: {},
  status: 'idle',
};

export const sendMessage = createAsyncThunk(
  'sendMessage',
  async (payload, { getState }) => {
    console.log("PAYLOAD:", payload);
    try {
      const result = await socket.emit('send_message', payload.conversation_id, payload.data);
      console.log("RR:", result);    
      return "okay";
    } catch (error) {
      return "fail";  
    }
    // const response = await axiosInstance.post('/send_message', {
    //   message: payload.message
    // });
    // // let result = response?.data?.conversations
    // let result = ""
    // console.log("RES:", result);
    // result.forEach(async msg => {
    //   console.log(msg);
    // });
    // return result;
  }
);

export const getMessages = createAsyncThunk(
  'getMessages', 
  async (payload) => {
    try {
      const response = await axiosInstance.post('/get_messages', {
        conversation_id: payload.conversation_id
      });
      console.log(response);
      let result = response?.data?.messages
      return({
        conversation_id: payload.conversation_id,
        messages: result
      });      
    } catch (error) {
      console.log("ERROR:", error);
      return error      
    }
  }
);

export const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      let msg = action.payload;
      if(msg.conversation_id){
        state.list[msg.conversation_id] = [ msg, ...state.list[msg.conversation_id] ];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.status = 'idle';
        console.log(action.payload);
        state.list[action.payload.conversation_id] = action.payload.messages
      })
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'idle';
      });
  },
});

export const { addMessage } = messageSlice.actions;

export default messageSlice.reducer;