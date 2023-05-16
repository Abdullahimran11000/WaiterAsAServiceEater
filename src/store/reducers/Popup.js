import {createReducer} from '@reduxjs/toolkit';

const initialState = {
  isPopReceived: false,
  popupData: null,
};

export const popupReducer = createReducer(initialState, {
  //This is the action that will be called when the action is dispatched

  SET_POPUP_DATA: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      popupData: payload,
    };
  },

  SET_IS_POPUP_RECEIVED: (state, action) => {
    const {payload} = action;

    return {
      ...state,
      isPopReceived: payload,
    };
  },
});
