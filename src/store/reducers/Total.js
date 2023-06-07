import {createReducer} from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  sessionTotal: 0.0,
};

export const totalReducer = createReducer(initialState, {
  //This is the action that will be called when the action is dispatched

  ADD_ORDER: (state, action) => {
    const {payload} = action;
    let items = [...state.orders];
    items.push(payload);

    return {
      ...state,
      orders: items,
    };
  },

  SET_SESSION_TOTAL: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      sessionTotal: parseFloat(state.sessionTotal) + parseFloat(payload),
    };
  },

  RESET_SESSION_TOTAL: state => {
    return {
      ...state,
      orders: [],
      sessionTotal: 0.0,
    };
  },
});
