import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import Colors from '../Assets/Colors';
import {useOrientation} from '../hooks/useOrientaion';
import {WINDOW_HEIGHT} from '../Utils/Size';

const CategoryCard = ({baseURL, item, onPress}) => {
  const {isLandscape} = useOrientation();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, {width: isLandscape ? '14%' : '20%'}]}>
      <View style={styles.imageContainer}>
        <View style={{width:'100%' , height:'55%',alignItems:'center'}}>
          <FastImage
            style={styles.image}
            source={{uri: baseURL + '/restaurant_data/' + item?.image}}
            resizeMode="contain"
          />
        </View>
      </View>
      <Text style={styles.title}>{item?.name}</Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 7,

    marginVertical: 10,
    alignItems: 'center',
  },
  imageContainer: {
    height: 150,
    width: '100%',
    borderRadius: 12,
    // overflow: 'hidden',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  image: {width: '85%', height: '74%', borderRadius: 10},
  title: {
    fontSize: 16,
    color: Colors.black,
  },
});
