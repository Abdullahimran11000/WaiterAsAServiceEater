import React from 'react';
import {TouchableOpacity, StyleSheet, Text, View} from 'react-native';

import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';

import Colors from '../Assets/Colors';

const Popup = ({handlePopClose}) => {
  const {popupData} = useSelector(store => store.popupReducer);

  return (
    <View style={styles.container}>
      <Text style={styles.headingText}>{popupData?.title}</Text>
      <Text style={styles.descriptionText}>{popupData?.body}</Text>

      <FastImage
        source={{uri: popupData?.android?.imageUrl}}
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  headingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
  },

  descriptionText: {fontSize: 18, color: Colors.white},
  imgStyle: {width: '75%', height: '50%', borderRadius: 10},

  closeBtn: {
    padding: 5,
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
