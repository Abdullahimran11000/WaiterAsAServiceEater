import React from 'react';
import {TouchableOpacity, StyleSheet, Text, View} from 'react-native';
import {WINDOW_WIDTH} from '../Utils/Size';
import {useDispatch} from 'react-redux';

import FastImage from 'react-native-fast-image';
import Colors from '../Assets/Colors';
import Feather from 'react-native-vector-icons/Feather';
import Swiper from 'react-native-swiper';
import AntDesign from 'react-native-vector-icons/AntDesign';

const NewProductCard = ({baseURL, item, price, navigation, setViewFlag}) => {
  const dispatch = useDispatch();

  const onNamePress = () => {
    dispatch({
      type: 'SET_PRODUCT',
      payload: item,
    });

    setViewFlag(true);
    // navigation.navigate('ProductDetails', {baseURL: baseURL});
  };

  const {MenuMedia} = item;
  return (
    <TouchableOpacity
      style={item.highlighted ? styles.containerHighlighted : styles.container}
      onPress={onNamePress}>
      {MenuMedia.length === 0 ? (
        <FastImage
          resizeMode="cover"
          style={styles.image}
          source={{uri: baseURL + '/restaurant_data/' + item?.menu_photo}}>
          <View style={styles.rowView}>
            <Text style={styles.title}>
              {item.menu_name.replaceAll('�', '')}
            </Text>

            {item.highlighted && (
              <FastImage
                source={require('../Assets/Icons/star.png')}
                style={{width: 25, height: 25}}
                resizeMode="contain"
              />
            )}
          </View>

          <View style={styles.rowBottomView}>
            <Feather name="eye" size={22} color={Colors.white} />
            <View style={styles.btnContainer}>
              <Text style={styles.priceText}>€ {price.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.overlay} />
        </FastImage>
      ) : (
        <>
          <Swiper
            removeClippedSubviews={false}
            showsButtons={true}
            showsPagination={false}
            autoplay={true}
            loop={true}
            autoplayTimeout={3.5}
            nextButton={<AntDesign name="right" size={24} color={'white'} />}
            prevButton={<AntDesign name="left" size={24} color={'white'} />}>
            {MenuMedia.map(pic => {
              return (
                <FastImage
                  resizeMode="cover"
                  style={styles.image}
                  source={{
                    uri: baseURL + '/restaurant_data/' + pic?.menu_photo,
                  }}>
                  <View style={styles.overlay} />
                </FastImage>
              );
            })}
          </Swiper>
          <View style={styles.rowView}>
            <Text style={styles.title}>
              {item.menu_name.replaceAll('�', '')}
            </Text>

            {item.highlighted && (
              <FastImage
                source={require('../Assets/Icons/star.png')}
                style={{width: 25, height: 25}}
                resizeMode="contain"
              />
            )}
          </View>

          <View style={styles.rowBottomView}>
            <Feather name="eye" size={22} color={Colors.white} />
            <View style={styles.btnContainer}>
              <Text style={styles.priceText}>€ {price.toFixed(2)}</Text>
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

export default NewProductCard;

const styles = StyleSheet.create({
  container: {
    height: 190,
    width: '49%',
    borderRadius: 14,
    marginVertical: 10,
    overflow: 'hidden',
  },
  containerHighlighted: {
    height: 190,
    width: '49%',
    borderRadius: 14,
    marginVertical: 10,
    overflow: 'hidden',
    borderColor: Colors.green,
    borderWidth: 3,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.3,
    backgroundColor: Colors.black,
    height: 190,
    width: WINDOW_WIDTH,
  },
  image: {
    height: '100%',
    width: '100%',
    padding: 7,
    justifyContent: 'space-between',
  },
  rowView: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  rowBottomView: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    padding: 7,
  },
  title: {
    zIndex: 1,
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    fontFamily: 'FreeSans',
  },
  btnContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    marginHorizontal: 5,
    paddingVertical: 7,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'FreeSans',
    color: Colors.primary,
  },
});
