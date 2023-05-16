import React, {useEffect} from 'react';
import {StatusBar, SafeAreaView} from 'react-native';

import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import RNUxcam from 'react-native-ux-cam';
import FlashMessage from 'react-native-flash-message';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {PersistGate} from 'redux-persist/integration/react';

import store from './src/store';
import Navigator from './src/Navigator';
import Colors1 from './src/Assets/Colors';
import {getToken} from './src/Utils/PNHelper';

let persistor = persistStore(store);
const App = () => {
  const backgroundStyle = {
    flex: 1,
    backgroundColor: Colors.lighter,
  };

  const configuration = {
    userAppKey: 'zu7navhukd8le57',
    enableAutomaticScreenNameTagging: false,
    enableImprovedScreenCapture: true,
  };

  RNUxcam.startWithConfiguration(configuration);

  useEffect(() => {
    getToken();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={backgroundStyle}>
          <StatusBar
            backgroundColor={Colors1.primary}
            barStyle="light-content"
          />
          <Navigator />

          <FlashMessage
            position="top"
            hideOnPress={true}
            duration={800}
            floating={true}
          />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

export default App;
