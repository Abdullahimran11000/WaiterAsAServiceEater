import {combineReducers} from '@reduxjs/toolkit';

import {cartReducer} from './cart';
import {sessionReducer} from './Sessions';
import {timerReducer} from './Timer';
import {popupReducer} from './Popup';
import {productReducer} from './Product';

export default combineReducers({
  cartReducer,
  sessionReducer,
  timerReducer,
  popupReducer,
  productReducer,
});
