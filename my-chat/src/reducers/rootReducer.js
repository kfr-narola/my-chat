import { combineReducers } from "@reduxjs/toolkit"
import sessionReducer from "./sessionReducer";
import conversationReducer from "./conversationReducer";
import messageReducer from "./messageReducer";

const rootReducer = combineReducers({
  session: sessionReducer,
  conversations: conversationReducer,
  messages: messageReducer
});

export default rootReducer