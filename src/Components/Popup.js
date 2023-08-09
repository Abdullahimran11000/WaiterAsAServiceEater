import React from 'react';
import {TouchableOpacity, StyleSheet, Text, View} from 'react-native';
import {WINDOW_HEIGHT, WINDOW_WIDTH} from '../Utils/Size';
import {useSelector} from 'react-redux';

import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Colors from '../Assets/Colors';
import {ROOT_URL} from '../Server/config';

const Popup = ({handlePopClose}) => {
  const {cloudIp} = useSelector(store => store.sessionReducer);
  const {popupData} = useSelector(store => store.popupReducer);

  let cloud_ip = cloudIp == '' ? ROOT_URL : cloudIp;

  return (
    <View style={styles.container}>
      <Text style={styles.headingText}>{popupData?.title}</Text>
      <Text style={styles.descriptionText}>{popupData?.body}</Text>

      <FastImage
        source={{uri: cloud_ip + popupData?.imageUrl}}
        style={styles.imgStyle}
        resizeMode="stretch"
      />

      <TouchableOpacity style={styles.closeBtn} onPress={handlePopClose}>
        <AntDesign name="closecircle" size={30} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

export default Popup;

const styles = StyleSheet.create({
  container: {
    width: WINDOW_WIDTH * 0.75,
    height: 350,
    borderRadius: 16,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 8,
    position: 'absolute',
    backgroundColor: Colors.primary,
    zIndex: 1,
    top: WINDOW_HEIGHT / 3,
  },

  headingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
  },

  descriptionText: {fontSize: 18, color: Colors.white},
  imgStyle: {width: '50%', height: '50%', borderRadius: 10},

  closeBtn: {
    padding: 5,
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
