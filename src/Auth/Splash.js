import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';

import {version} from '../../package.json';

const moveForward = navigation => {
  const {user, session} = useSelector(store => store.sessionReducer);

  setTimeout(() => {
    if (session == null) {
      if (user == null) navigation.replace('Login');
      else navigation.replace('TablesList');
    } else {
      navigation.replace('Terms');
    }
  }, 1000);
};

const Splash = ({navigation}) => {
  moveForward(navigation);

  return (
    <View style={styles.container}>
      <FastImage
        source={require('../Assets/Images/toc.png')}
        resizeMode="contain"
        style={styles.logo}
      />

      <Text style={styles.versionText}>Version: {version}</Text>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 450,
    height: 200,
  },

  versionText: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
