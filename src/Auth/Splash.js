import React from 'react';
import {StyleSheet, View} from 'react-native';

import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';

const moveForward = navigation => {
  const {user} = useSelector(store => store.sessionReducer);

  setTimeout(() => {
    if (user == null) navigation.replace('Login');
    else navigation.replace('TablesList');
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
});
