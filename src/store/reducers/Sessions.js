import {createReducer} from '@reduxjs/toolkit';

const initialState = {
  session: null,
  user: null,
  cloudIp: '',
};

export const sessionReducer = createReducer(initialState, {
  //This is the action that will be called when the action is dispatched

  START_SESSION: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      session: payload,
    };
  },

  END_SESSION: state => {
    return {
      ...state,
      session: null,
    };
  },

  SET_CLOUD_IP: (state, action) => {
    const {payload} = action;
    state.cloudIp = payload;
  },

  SET_USER: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      user: payload,
    };
  },
});
