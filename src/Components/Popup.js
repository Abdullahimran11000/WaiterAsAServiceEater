import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {WINDOW_HEIGHT, WINDOW_WIDTH} from '../Utils/Size';
import {useDispatch, useSelector} from 'react-redux';

import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Colors from '../Assets/Colors';
import {ROOT_URL} from '../Server/config';
import {GetLocationCategories} from '../Server/Methods/Listing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {deflate, inflate} from 'react-native-gzip';
import {useOrientation} from '../hooks/useOrientaion';
import StringsOfLanguages from '../Language/StringsOfLanguages';

const Popup = ({handlePopClose}) => {
  const {isLandscape} = useOrientation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {cloudIp} = useSelector(store => store.sessionReducer);
  const {popupData} = useSelector(store => store.popupReducer);
  const {user} = useSelector(store => store.sessionReducer);
  const location_id = user?.role[0]?.staff_location_id;

  const [categories, setCategories] = useState([]);
  const [dishTags, setDishTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [baseURL, setBaseUrl] = useState('');

  useEffect(() => {
    setIsLoading(true);
    if (popupData?.notification_for == 'menu') {
      setBaseUrlFunction();
      apiCall();
    }
  }, []);

  const setBaseUrlFunction = async () => {
    let cloudIp2 = await AsyncStorage.getItem('cloudIp');
    let url = cloudIp2 != null ? cloudIp2 : ROOT_URL;
    setBaseUrl(url);
  };

  const apiCall = () => {
    try {
      GetLocationCategories(location_id)
        .then(res => {
          const {status, data} = res;
          if (status == 200 || status == 201) {
            setCategories(data?.categories);
            setDishTags(data?.dish_tags);
            setRefreshing(false);
          }
        })
        .catch(error => {
          console.log('error:sasas ', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.log('Get Location Categories error in try-catch ', error);
    }
  };

  let cloud_ip = cloudIp == '' ? ROOT_URL : cloudIp;

  const onMenuPress = async (cat, ind, item2) => {
    let compressed = await deflate(JSON.stringify(categories));
    navigation.navigate('CategoryProducts', {
      categories: compressed,
      dishTags: dishTags,
      current: cat,
      index: ind,
      baseURL: baseURL,
      popupMenu: item2,
    });
    dispatch({
      type: 'SET_PRODUCT',
      payload: item2,
    });

    handlePopClose();
  };

  // const onMenuPress = async (item2, item) => {
  //   dispatch({
  //     type: 'SET_PRODUCT',
  //     payload: item2,
  //   });

  //   let compressed = await deflate(JSON.stringify(item));
  //   let decompressed = await inflate(compressed);

  //   navigation.navigate('ProductDetails', {
  //     baseURL: baseURL,
  //     categories: JSON.parse(decompressed),
  //     setViewFlag: true,
  //     setCheckCart: false,
  //   });
  //   handlePopClose();
  // };

  return (
    <View
      style={[
        styles.container,
        {top: isLandscape ? WINDOW_HEIGHT / 8 : WINDOW_HEIGHT / 3},
      ]}>
      <Text style={styles.headingText}>{popupData?.data?.title}</Text>
      <Text style={styles.descriptionText}>{popupData?.data?.body}</Text>

      {popupData?.notification_for == 'menu' ? (
        <>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size={'large'} color={Colors.white} />
            </View>
          ) : (
            <>
              {categories?.map((item, index) => {
                return item?.Menus?.map(item2 => {
                  if (popupData?.menu_id == item2?.menu_id) {
                    return (
                      <>
                        <FastImage
                          source={{
                            uri:
                              baseURL + '/restaurant_data/' + item2?.menu_photo,
                          }}
                          style={styles.imgStyle}
                          resizeMode="stretch"
                        />
                        <Text style={styles.descriptionText}>
                          {item2?.menu_name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            onMenuPress(item, index, item2);
                          }}
                          style={{
                            backgroundColor: user.layout_setting?.basecolor,
                            borderRadius: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 10,
                          }}>
                          <Text style={{color: Colors.black, padding: 6}}>
                            {StringsOfLanguages.Go_to_Details}
                          </Text>
                        </TouchableOpacity>
                      </>
                    );
                  }
                });
              })}
            </>
          )}
        </>
      ) : (
        <>
          <FastImage
            source={{uri: cloud_ip + popupData?.data?.imageUrl}}
            style={styles.imgStyle}
            resizeMode="stretch"
          />
        </>
      )}
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
  loadingContainer: {
    flex: 0.89,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
