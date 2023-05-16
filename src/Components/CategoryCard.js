import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import Colors from '../Assets/Colors';

const CategoryCard = ({baseURL, item, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.imageContainer}>
        <FastImage
          style={styles.image}
          source={{uri: baseURL + '/restaurant_data/' + item?.image}}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>{item?.name}</Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 7,
    width: '20%',
    marginVertical: 10,
    alignItems: 'center',
  },
  imageContainer: {
    height: 150,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  image: {width: '100%', height: '100%'},
  title: {
    fontSize: 16,
    color: Colors.black,
  },
});
