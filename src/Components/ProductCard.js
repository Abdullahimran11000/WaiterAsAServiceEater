import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Path from '../Utils/Path';
import Colors from '../Assets/Colors';
import FastImage from 'react-native-fast-image';

const ProductCard = ({item, price, onNamePress, onCartPress}) => {
  const baseURL = Path.imagePath;

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onNamePress}>
      <View style={styles.imageContainer}>
        <FastImage
          resizeMode="cover"
          style={styles.productImage}
          source={{uri: baseURL + item.menu_photo}}
        />
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>{item.menu_name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>€ {price.toFixed(2)}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addToCartBtn}
            onPress={onCartPress}>
            <Text style={styles.addToCartBtnText}>Add to cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  cardContainer: {
    padding: 5,
    height: 130,
    width: '49%',
    borderRadius: 10,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },

  imageContainer: {
    width: '25%',
    height: '100%',
  },

  productImage: {
    width: '100%',
    height: '100%',
    marginRight: 10,
    borderRadius: 10,
  },

  descriptionContainer: {
    width: '72%',
    height: '100%',
    justifyContent: 'center',
  },

  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    fontFamily: 'FreeSans',
  },

  priceContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  addToCartBtn: {
    zIndex: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
  },

  addToCartBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
