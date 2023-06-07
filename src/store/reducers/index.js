import {combineReducers} from '@reduxjs/toolkit';

import {cartReducer} from './cart';
import {sessionReducer} from './Sessions';
import {timerReducer} from './Timer';
import {popupReducer} from './Popup';
import {productReducer} from './Product';
import {totalReducer} from './Total';

export default combineReducers({
  cartReducer,
  sessionReducer,
  timerReducer,
  popupReducer,
  productReducer,
  totalReducer,
});
