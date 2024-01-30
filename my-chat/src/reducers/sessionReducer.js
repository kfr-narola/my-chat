import { createSlice } from "@reduxjs/toolkit";

export const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    current_user: null,
    online: false
  },
  reducers: {
    setSession: (state, action) => {
      console.log(action);
      if(action.payload['current_user']){
        state.current_user = action.payload['current_user']
      }
      if(action.payload['online']){
        state.online = Boolean(action.payload['online'])
        state.socket_id = action.payload['socket_id']
      }
    },
  }
});

export const { setSession } = sessionSlice.actions

export default sessionSlice.reducer;