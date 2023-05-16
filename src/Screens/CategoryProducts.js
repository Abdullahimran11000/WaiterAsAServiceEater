import React, {useEffect, useState, useContext} from 'react';
import {
  Text,
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';

import {inflate} from 'react-native-gzip';
import {useSelector, useDispatch} from 'react-redux';
import {showMessage} from 'react-native-flash-message';
import {callWaiter, paymentRequest} from '../Server/Methods/Listing';
import {getTablesList} from '../Regex/SessionCheck';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../Assets/Colors';
import Popup from '../Components/Popup';
import NewProductCard from '../Components/NewProductCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountDown from 'react-native-countdown-component';
import {SocketContext} from '../Context/SocketContext';

const iconSize = 30;

const CategoryProducts = ({navigation, route}) => {
  const dispatch = useDispatch();
  const {count} = useSelector(store => store.cartReducer);
  const {newOrderTime} = useSelector(store => store.timerReducer);
  const {isPopReceived} = useSelector(store => store.popupReducer);
  const {orders, session, user} = useSelector(store => store.sessionReducer);
  const location_id = user?.role[0]?.staff_location_id;
  const {layout_setting} = user;

  const socket = useContext(SocketContext);

  const bgStyle = {
    backgroundColor: layout_setting?.basecolor,
  };

  const {baseURL, dishTags, index, current} = route.params;

  const [ip, setIp] = useState('');
  const [flag, setFlag] = useState(false);
  const [orderTime, setOrderTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [waiterLoader, setWaiterLoader] = useState(false);
  const [payLoader, setPayLoader] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(index);
  const [currentCategory, setCurrentCategory] = useState(current);
  const [showSearchedData, setShowSearchedData] = useState(false);
  const [shouldSetState, setShouldSetState] = useState(true);

  useEffect(() => {
    if (shouldSetState) setOrderTime(newOrderTime);
  }, [newOrderTime]);

  useEffect(() => {
    const decompression = async () => {
      let decompressed = await inflate(route.params.categories);
      setCategories(JSON.parse(decompressed));
      setIsLoading(false);
    };

    decompression();

    const getIp = async () => {
      setIp(await AsyncStorage.getItem('cloudIp'));
    };

    getIp();

    return () => {
      setShowSearchedData(false);
      setSearchResult([]);
      setSelectedTag('');
    };
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCartPress = () => navigation.navigate('Cart', {baseURL: baseURL});

  const setSelectedCategory = index => {
    setSelectedIndex(index);
    setSelectedTag('');
    setShowSearchedData(false);
    setCurrentCategory(categories[index]);
  };

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

  const handleCheckout = () => {
    setPayLoader(true);

    getTablesList(location_id, session.table_id, async res => {
      if (res) {
        const formData = {
          user_id: user.assignedLocations[0].user_id,
          session_id: session.session_id,
          table_id: session.table_id,
        };

        paymentRequest(formData)
          .then(res => {
            const {status, data} = res;

            socket.emit('Payment_request', data?.Notification?.not_id);

            if (status == 200 || status == 201) {
              let myTimeout = data?.api_delay_time * 1000;

              setPayLoader(false);
              setFlag(true);

              if (
                data?.Notification?.session_id == session.session_id &&
                data?.message.includes('customer')
              ) {
                showMessage({
                  message: data.message,
                  type: 'warning',
                });

                setTimeout(() => {
                  setFlag(false);
                }, myTimeout);
              } else if (data?.message.includes('Notification')) {
                setFlag(false);
                clearTimeout(myTimeout);

                setTimeout(() => {
                  showMessage({
                    message: data.message,
                    type: 'success',
                  });

                  navigation.navigate('Servey');
                }, 300);
              }
            }
          })
          .catch(error => {
            setPayLoader(false);
            console.log('payment api error ', error);

            showMessage({
              message: 'Could not complete payment',
              type: 'warning',
            });
          });
      } else {
        setPayLoader(false);
        Alert.alert('Session Closed', 'Start a new session', [
          {
            text: 'Ok',
            onPress: () => {
              dispatch({
                type: 'SET_NEW_ORDER_TIME',
                payload: 0,
              });

              dispatch({
                type: 'CLEAR_CART',
              });

              dispatch({
                type: 'END_SESSION',
              });
            },
          },
        ]);
      }
    });
  };

  const callTheWaiter = () => {
    setWaiterLoader(true);

    callWaiter({
      user_id: user.role[0].user_id,
      session_id: session.session_id,
      table_id: session.table_id,
    })
      .then(res => {
        const {status, data} = res;

        if (status == 200 || status == 201) {
          socket.emit('Call_Waiter_request', data?.Notification?.not_id);
          showMessage({
            message: data?.message,
            type: 'success',
          });
        } else {
          showMessage({
            message: 'Could not call the waiter',
            type: 'warning',
          });
        }
      })
      .catch(err => console.log('callWaiter err ', err))
      .finally(() => setWaiterLoader(false));
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={'large'} color={Colors.primary} />
    </View>
  ) : (
    <>
      <View style={[styles.container, {opacity: isPopReceived ? 0.5 : 1}]}>
        <View style={[styles.headerContainer, bgStyle]}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBackPress}>
            <Ionicons
              name="chevron-back"
              color={Colors.white}
              size={iconSize}
            />
          </TouchableOpacity>

          <Text
            style={[styles.headerText, {color: layout_setting?.h2_text_color}]}>
            {currentCategory.name}
          </Text>

          {orderTime > 0 && (
            <CountDown
              until={orderTime}
              size={10}
              onFinish={() => {
                setOrderTime(0);
                setShouldSetState(true);

                dispatch({
                  type: 'SET_NEW_ORDER_TIME',
                  payload: 0,
                });
              }}
              onChange={() => {
                if (shouldSetState) setShouldSetState(false);

                dispatch({
                  type: 'SET_NEW_ORDER_TIME',
                  payload: newOrderTime - 1,
                });
              }}
              digitStyle={{backgroundColor: '#FFF'}}
              digitTxtStyle={{color: '#1CC625'}}
              timeToShow={['M', 'S']}
              timeLabels={{m: '', s: ''}}
            />
          )}

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Pressable
              style={[
                styles.waiterBtn,
                {
                  borderColor:
                    orders.length == 0 || flag ? Colors.grey : Colors.white,
                },
              ]}
              onPress={handleCheckout}
              disabled={orders.length == 0 || flag ? true : false}>
              {payLoader ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text
                  style={[
                    styles.waiterTxt,
                    {
                      color:
                        orders.length == 0 || flag ? Colors.grey : Colors.white,
                    },
                  ]}>
                  Pay Now
                </Text>
              )}
            </Pressable>

            <Pressable style={styles.waiterBtn} onPress={callTheWaiter}>
              {waiterLoader ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.waiterTxt}>Call waiter</Text>
              )}
            </Pressable>

            <TouchableOpacity
              style={styles.cartBtnContainer}
              onPress={handleCartPress}>
              {count > 0 && (
                <View style={styles.cartCounterView}>
                  <Text style={styles.cartCounter}>{count}</Text>
                </View>
              )}
              <View style={styles.cartBtn}>
                <Ionicons name="cart" size={30} color={Colors.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

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
                <Text style={styles.productTitle}>{currentCategory.name}</Text>

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
                      />
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
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

  body: {flex: 1, paddingHorizontal: 20},

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
