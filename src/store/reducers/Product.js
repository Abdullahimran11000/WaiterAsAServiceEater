import {createReducer} from '@reduxjs/toolkit';

const initialState = {
  product: null,
};

export const productReducer = createReducer(initialState, {
  //This is the action that will be called when the action is dispatched

  SET_PRODUCT: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      product: payload,
    };
  },
});
