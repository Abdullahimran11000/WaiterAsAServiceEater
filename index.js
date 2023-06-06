/**
 * @format
 */
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import {PersistGate} from 'redux-persist/integration/react';
import App from './App';
import store from './src/store';

let persistor = persistStore(store);

const ReduxProvider = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => ReduxProvider);
