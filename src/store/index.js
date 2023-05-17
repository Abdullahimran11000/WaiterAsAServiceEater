import {configureStore} from '@reduxjs/toolkit';
import rootReducer from './reducers';

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {name as appName} from '../../app.json';

const persistConfig = {
  key: 'root',
  whitelist: ['cartReducer', 'sessionReducer'],
  keyPrefix: appName,
  storage: AsyncStorage,
  timeout: 10000,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
