import {createReducer} from '@reduxjs/toolkit';

const initialState = {
  cartData: [],
  count: 0,
};

export const cartReducer = createReducer(initialState, {
  //This is the action that will be called when the action is dispatched

  ADD_TO_CART: (state, action) => {
    const {payload} = action;
    let items = [...state.cartData];
    items.push(payload.item);

    return {
      ...state,
      cartData: items,
      count: payload.n,
    };
  },

  CHANGE_QUANTITY: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      cartData: payload.newState,
      count: payload.n,
    };
  },

  SET_COUNT: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      count: payload,
    };
  },

  CLEAR_CART: state => {
    return {
      ...state,
      cartData: [],
      count: 0,
    };
  },
});
