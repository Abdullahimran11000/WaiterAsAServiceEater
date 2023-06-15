import React, {useEffect, useState, useContext} from 'react';
import {
  Text,
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {inflate} from 'react-native-gzip';
import {useSelector, useDispatch} from 'react-redux';
import {SocketContext} from '../Context/SocketContext';

import Colors from '../Assets/Colors';
import Popup from '../Components/Popup';
import Header from '../Components/Header';

import NewProductCard from '../Components/NewProductCard';
import ProductDetails from './ProductDetails';

const CategoryProducts = ({navigation, route}) => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);

  const {isPopReceived} = useSelector(store => store.popupReducer);
  const {user} = useSelector(store => store.sessionReducer);

  const {layout_setting} = user;
  const {baseURL, dishTags, index, current} = route.params;

  const [viewFlag, setViewFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(index);
  const [currentCategory, setCurrentCategory] = useState(current);
  const [showSearchedData, setShowSearchedData] = useState(false);

  /* The above code is a React functional component that uses the useEffect hook. It decompresses a
  string of compressed data (route.params.categories) using the inflate function, then parses the
  decompressed data into a JavaScript object using JSON.parse. The resulting object is then set as
  the state of the component using the setCategories function. The setIsLoading function is also
  used to set the loading state of the component to false. The useEffect hook also returns a cleanup
  function that resets some state variables. */
  useEffect(() => {
    const decompression = async () => {
      let decompressed = await inflate(route.params.categories);
      setCategories(JSON.parse(decompressed));
      setIsLoading(false);
    };

    decompression();

    return () => {
      setShowSearchedData(false);
      setSearchResult([]);
      setSelectedTag('');
    };
  }, []);

  /**
   * This function sets the selected category, clears the selected tag, hides searched data, and
   * updates the current category based on the provided index.
   */
  const setSelectedCategory = index => {
    setSelectedIndex(index);
    setSelectedTag('');
    setShowSearchedData(false);
    setCurrentCategory(categories[index]);
  };

  /**
   * The function handles a selected tag by filtering through categories and menus to find matches and
   * display the results.
   */
  const handleTagPres = tagName => {
    if (tagName != selectedTag) {
      let matched = [];
      setSelectedTag(tagName);

      categories.forEach(cat => {
        cat.Menus.forEach(menu => {
          menu.MenuTags.forEach(tag => {
            if (tag.Dish_Tag.tag_name == tagName) {
              matched.push(menu);
            }
          });
        });
      });

      setSearchResult(matched);
      setShowSearchedData(true);
    }
  };

  /**
   * This function sets the state of a popup to not received and null.
   */
  const handlePopClose = () => {
    dispatch({
      type: 'SET_IS_POPUP_RECEIVED',
      payload: false,
    });

    dispatch({
      type: 'SET_POPUP_DATA',
      payload: null,
    });
  };

  /**
   * The function handles rendering of a category item with a touchable opacity and updates the selected
   * category based on the index.
   * @returns A component that renders a TouchableOpacity with a Text component inside, displaying the
   * name of an item and changing its background color and text color based on whether it is selected or
   * not. The onPress function updates the selected category index.
   */
  const handleRenderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedCategory(index)}
        style={[
          styles.categoryCard,
          {
            marginVertical: 3,
            elevation: 3,
            backgroundColor:
              selectedIndex == index || showSearchedData
                ? layout_setting?.basecolor
                : Colors.white,
          },
        ]}>
        <Text
          style={{
            fontFamily: 'FreeSans',
            color:
              selectedIndex == index || showSearchedData
                ? Colors.white
                : Colors.primary,
          }}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  /**
   * The function returns a TouchableOpacity component with a Text component displaying a dish tag name
   * and an onPress event handler.
   * @returns A React component that renders a TouchableOpacity with a Text component inside. The Text
   * component displays a hashtag followed by the tag name from the item object passed as a parameter.
   * The onPress event of the TouchableOpacity is set to call the handleTagPres function with the
   * tag_name property of the item object as an argument. The style of the Text component is determined
   * by the selectedTag state variable.
   */
  const handleRenderDishTags = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => handleTagPres(item.tag_name)}
        style={{
          ...styles.categoryCard,
          paddingHorizontal: 0,
          paddingRight: 12,
        }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'FreeSans',
            color: selectedTag == item.tag_name ? Colors.primary : Colors.grey,
          }}>
          #{item.tag_name}
        </Text>
      </TouchableOpacity>
    );
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={'large'} color={Colors.primary} />
    </View>
  ) : (
    <>
      <View style={[styles.container, {opacity: isPopReceived ? 0.5 : 1}]}>
        <Header
          baseURL={baseURL}
          socket={socket}
          navigation={navigation}
          name={currentCategory.name}
          viewFlag={viewFlag}
          setViewFlag={setViewFlag}
        />

        {viewFlag ? (
          <ProductDetails baseURL={baseURL} setViewFlag={setViewFlag} />
        ) : (
          <>
            <View style={styles.categoriesRowContainer}>
              <FlatList
                horizontal
                data={categories}
                renderItem={handleRenderItem}
                initialScrollIndex={selectedIndex}
                keyExtractor={(item, index) => index}
                contentContainerStyle={{flexGrow: 1}}
                showsHorizontalScrollIndicator={false}
              />
            </View>

            <View style={styles.categoriesRowContainer}>
              <FlatList
                horizontal
                data={dishTags}
                renderItem={handleRenderDishTags}
                keyExtractor={(item, index) => index}
                contentContainerStyle={{flexGrow: 1}}
                showsHorizontalScrollIndicator={false}
              />
            </View>

            {showSearchedData == true && searchResult.length == 0 ? (
              <View style={styles.noResultBody}>
                <Text style={styles.noResultBodyText}>
                  No matching product found
                </Text>
              </View>
            ) : showSearchedData ? (
              <View style={styles.body}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{flexGrow: 1}}>
                  <View style={styles.searchDataWrapper}>
                    {currentCategory.Menus.length > 0 &&
                      currentCategory.Menus.map((product, index) => {
                        let priceWithTax =
                          product.menu_price +
                          product.menu_price * (product.menu_tax / 100);

                        return (
                          <NewProductCard
                            baseURL={baseURL}
                            key={index}
                            item={product}
                            price={priceWithTax}
                            navigation={navigation}
                            setViewFlag={setViewFlag}
                          />
                        );
                      })}

                    {searchResult.map((data, index) => {
                      return (
                        <NewProductCard
                          baseURL={baseURL}
                          key={index}
                          item={data}
                          price={data.menu_price}
                          navigation={navigation}
                          setViewFlag={setViewFlag}
                        />
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            ) : (
              <View style={styles.body}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{flexGrow: 1}}>
                  <View style={styles.productWrapper}>
                    <Text style={styles.productTitle}>
                      {currentCategory.name}
                    </Text>

                    <View style={styles.productDetailsWrapper}>
                      {currentCategory.Menus.map((product, index) => {
                        let priceWithTax =
                          product.menu_price +
                          product.menu_price * (product.menu_tax / 100);

                        return (
                          <NewProductCard
                            baseURL={baseURL}
                            key={index}
                            item={product}
                            price={priceWithTax}
                            navigation={navigation}
                            setViewFlag={setViewFlag}
                          />
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
              </View>
            )}
          </>
        )}
      </View>

      {isPopReceived && (
        <View style={styles.popupContainer}>
          <Popup handlePopClose={handlePopClose} />
        </View>
      )}
    </>
  );
};

export default CategoryProducts;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  popupContainer: {
    top: '35%',
    left: '15%',
    right: '15%',
    bottom: '35%',
    borderRadius: 10,
    position: 'absolute',
    backgroundColor: Colors.lightBlue,
  },

  container: {flex: 1},

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
  },

  backBtn: {padding: 10},

  btnsContainer: {
    flex: 0.08,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cartBtnContainer: {
    marginRight: 10,
    backgroundColor: Colors.green,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 6,
  },

  cartBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cartCounterView: {
    zIndex: 1,
    width: 18,
    height: 18,
    borderRadius: 10,
    marginRight: -7,
    marginBottom: -5,
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    backgroundColor: Colors.offWhite,
  },

  cartCounter: {fontSize: 14, color: Colors.primary, fontWeight: 'bold'},

  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors.white,
    fontFamily: 'FreeSans',
  },

  waiterBtn: {
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginRight: 7,
  },
  waiterTxt: {
    color: Colors.white,
    fontSize: 10,
  },

  categoriesRowContainer: {
    marginVertical: 5,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },

  scrollView: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryCard: {
    borderRadius: 50,
    marginHorizontal: 5,
    paddingVertical: 10,
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  searchContainer: {
    borderRadius: 50,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },

  body: {flex: 1, paddingHorizontal: 0},

  noResultBody: {
    height: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  noResultBodyText: {fontSize: 22, color: Colors.black},

  searchDataWrapper: {
    flexWrap: 'wrap',
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  productWrapper: {marginVertical: 2},
  searchInput: {width: '95%', color: Colors.black},

  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: Colors.black,
    fontFamily: 'FreeSans',
  },

  productDetailsWrapper: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  productDetailsContainer: {
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

  descriptionText: {
    fontSize: 14,
    marginVertical: 2,
    color: Colors.black,
    fontFamily: 'FreeSans',
  },

  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  priceContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
