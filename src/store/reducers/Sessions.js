import {createReducer} from '@reduxjs/toolkit';

const initialState = {
  session: null,
  orders: [],
  user: null,
  cloudIp: '',
  sessionTotal: 0.0,
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
      orders: [],
      sessionTotal: 0.0,
    };
  },

  SET_CLOUD_IP: (state, action) => {
    const {payload} = action;
    state.cloudIp = payload;
  },

  ADD_ORDER: (state, action) => {
    const {payload} = action;
    let items = [...state.orders];
    items.push(payload);

    return {
      ...state,
      orders: items,
    };
  },

  SET_USER: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      user: payload,
    };
  },

  SET_SESSION_TOTAL: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      sessionTotal: parseFloat(state.sessionTotal) + parseFloat(payload),
    };
  },
});
