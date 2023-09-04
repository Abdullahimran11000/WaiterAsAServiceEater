import React, {useEffect, useState, useCallback} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import {deflate} from 'react-native-gzip';
import {useSelector} from 'react-redux';
import {GetLocationCategories} from '../Server/Methods/Listing';
import {WINDOW_HEIGHT} from '../Utils/Size';
import {ROOT_URL} from '../Server/config';

import Colors from '../Assets/Colors';
import FastImage from 'react-native-fast-image';
import CategoryCard from '../Components/CategoryCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Categories = ({navigation}) => {
  const {user} = useSelector(store => store.sessionReducer);
  const location_id = user?.role[0]?.staff_location_id;
  const {layout_setting} = user;

  const bgStyle = {
    backgroundColor: layout_setting?.basecolor,
  };

  const [banners, setBanners] = useState([]);
  const [dishTags, setDishTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [baseURL, setBaseUrl] = useState('');

  /**
   * This function sets the base URL for an API endpoint based on a stored IP address or a default
   * value.
   */
  const setBaseUrlFunction = async () => {
    let cloudIp = await AsyncStorage.getItem('cloudIp');
    let url = cloudIp != null ? cloudIp : ROOT_URL;

    setBaseUrl(url);
  };

  /* This is a useEffect hook that is called whenever the value of `baseURL` changes. It calls the
  `setBaseUrlFunction` function to set the base URL for an API endpoint based on a stored IP address
  or a default value. If `baseURL` is not an empty string, it calls the `apiCall` function to make
  an API call to get location categories. */
  useEffect(() => {
    setBaseUrlFunction();
    baseURL === '' ? null : apiCall();
  }, [baseURL]);

  /**
   * The function makes an API call to retrieve location categories, dish tags, and banners, and sets
   * them as state variables.
   */
  const apiCall = async () => {
    if (baseURL === '') {
      setRefreshing(false);
    } else {
      try {
        await GetLocationCategories(location_id)
          .then(res => {
            const {status, data} = res;
            if (status == 200 || status == 201) {
              setCategories(data?.categories);
              setDishTags(data?.dish_tags);
              setBanners(data?.banners);

              setIsLoading(false);
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
        setIsLoading(false);
        console.log('Get Location Categories error in try-catch ', error);
      }
    }
  };

  /* `const onRefresh` is a function that is created using the `useCallback` hook. It sets the
  `refreshing` state to `true` and then calls the `apiCall` function to make an API call to retrieve
  location categories, dish tags, and banners. The `useCallback` hook is used to memoize the
  function so that it is only recreated if any of its dependencies change. In this case, the
  function has no dependencies, so it will only be created once. This can help improve performance
  by reducing unnecessary re-renders. The `onRefresh` function is passed as a prop to the
  `RefreshControl` component in the `ScrollView` to handle the pull-to-refresh functionality. */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    apiCall();
  }, []);

  /**
   * The function handles a category press event and navigates to a screen displaying products within
   * that category.
   * @param baseURL - The baseURL parameter is likely a string representing the base URL of an API or
   * server that the app is communicating with. It could be used to construct URLs for making requests
   * to the server.
   * @param cat - The "cat" parameter in the "handleCategoryPress" function is likely referring to a
   * category object or category name that is being passed as an argument to the function. It is used
   * to determine the current category being selected by the user.
   * @param ind - ind is a variable that represents the index of the current category being pressed. It
   * is likely used to keep track of the position of the category in an array or list of categories.
   */
  const handleCategoryPress = async (baseURL, cat, ind) => {
    let compressed = await deflate(JSON.stringify(categories));
    navigation.navigate('CategoryProducts', {
      categories: compressed,
      dishTags: dishTags,
      current: cat,
      index: ind,
      baseURL: baseURL,
    });
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={'large'} color={Colors.primary} />
    </View>
  ) : (
    <View style={styles.container}>
      <View style={[styles.headerContainer, bgStyle]}>
        <Text
          style={[styles.headerText, {color: layout_setting?.h2_text_color}]}>
          Categories
        </Text>
      </View>

      <ScrollView
        style={styles.scrollViewStyle}
        contentContainerStyle={styles.scrollViewContentStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.bannersContainer}>
          <FastImage
            source={{
              uri: baseURL + '/restaurant_data/' + banners[0]?.image,
            }}
            style={styles.bannerLeft}
            resizeMode="cover"
          />
          <View style={styles.bannerLeft}>
            <FastImage
              source={{uri: baseURL + '/restaurant_data/' + banners[1]?.image}}
              style={styles.bannerRight}
              resizeMode="cover"
            />
            <FastImage
              source={{uri: baseURL + '/restaurant_data/' + banners[2]?.image}}
              style={styles.bannerRight}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.categoryHeader}>
          <Text
            style={[
              styles.categoryHeaderText,
              {color: layout_setting?.h2_text_color},
            ]}>
            SELECT A CATEGORY
          </Text>
        </View>

        <View style={styles.categoryWrapper}>
          {categories.map((category, index) => {
            return (
              <CategoryCard
                baseURL={baseURL}
                key={index}
                item={category}
                onPress={() => handleCategoryPress(baseURL, category, index)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {flex: 1},

  headerContainer: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },

  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors.white,
  },

  scrollViewStyle: {flex: 0.9},
  scrollViewContentStyle: {flexGrow: 1},

  bannersContainer: {
    width: '100%',
    flexDirection: 'row',
    height: WINDOW_HEIGHT * 0.25,
    justifyContent: 'space-between',
  },

  bannerLeft: {
    width: '49.5%',
    height: '100%',
    justifyContent: 'space-between',
  },

  bannerRight: {
    width: '100%',
    height: '48%',
  },

  categoryHeader: {
    width: '100%',
    alignItems: 'center',
    height: WINDOW_HEIGHT * 0.08,
    justifyContent: 'center',
  },

  categoryHeaderText: {
    fontSize: 25,
    color: Colors.primary,
  },

  categoryWrapper: {
    flexWrap: 'wrap',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  categoryContainer: {
    height: 200,
    padding: 10,
    width: '21%',
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    marginHorizontal: '2%',
    backgroundColor: Colors.white,
    justifyContent: 'space-evenly',
  },

  imgStyle: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },

  categoryTitle: {
    fontSize: 18,
    color: Colors.black,
  },
});
