import React, {useEffect} from 'react';
import {StatusBar, SafeAreaView} from 'react-native';

import {useSelector} from 'react-redux';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {getToken} from './src/Utils/PNHelper';
import RNUxcam from 'react-native-ux-cam';
import FlashMessage from 'react-native-flash-message';
import Navigator from './src/Navigator';
import Colors1 from './src/Assets/Colors';

const App = () => {
  const {user} = useSelector(store => store.sessionReducer);

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
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        backgroundColor={
          user?.token == null
            ? Colors1.primary
            : user?.layout_setting?.basecolor
        }
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
  );
};

export default App;
