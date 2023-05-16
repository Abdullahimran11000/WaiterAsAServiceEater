import {createReducer} from '@reduxjs/toolkit';

const initialState = {
  newOrderTime: 0,
};

export const timerReducer = createReducer(initialState, {
  //This is the action that will be called when the action is dispatched

  SET_NEW_ORDER_TIME: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      newOrderTime: payload,
    };
  },
});
