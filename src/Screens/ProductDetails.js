import React, {useEffect, useState, useContext} from 'react';
import {
  Text,
  View,
  Alert,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import {useSelector, useDispatch} from 'react-redux';
import {showMessage} from 'react-native-flash-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';

import Colors from '../Assets/Colors';
import {cartLogic, cartLogicWithNoDescription} from '../Regex/CartLogic';
import {WINDOW_WIDTH} from '../Utils/Size';
import {getTablesList} from '../Regex/SessionCheck';
import {callWaiter, paymentRequest} from '../Server/Methods/Listing';
import {SocketContext} from '../Context/SocketContext';
import CountDown from 'react-native-countdown-component';

const ProductDetails = ({navigation, route}) => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);

  const {user, session, orders} = useSelector(store => store.sessionReducer);
  const {cartData, count} = useSelector(store => store.cartReducer);
  const {newOrderTime} = useSelector(store => store.timerReducer);
  const {product} = useSelector(store => store.productReducer);

  const {layout_setting} = user;
  const location_id = user?.role[0]?.staff_location_id;

  const bgStyle = {
    backgroundColor: layout_setting?.basecolor,
  };

  const {baseURL} = route?.params;
  const {decimal_places} = user.assignedLocations[0].Location;

  const {
    menu_id,
    menu_name,
    menu_price,
    menu_photo,
    menu_description,
    MenuOptions,
    MenuAllergyItems,
    menu_tax,
    menu_type,
  } = product;

  const [flag, setFlag] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [newPrice, setNewPrice] = useState(0);
  const [orderTime, setOrderTime] = useState(0);
  const [hasRequired, setHasRequired] = useState('');
  const [instructions, setInstructions] = useState('');
  const [displayPrice, setDisplayPrice] = useState([]);
  const [payLoader, setPayLoader] = useState(false);
  const [waiterLoader, setWaiterLoader] = useState(false);
  const [shouldSetState, setShouldSetState] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [basePriceValue, setBasePriceValue] = useState(menu_price);

  useEffect(() => {
    MenuOptions.forEach(el => {
      if (el.base_price == 1) setBasePriceValue(0);
      if (el.required == 1) setHasRequired(el.Option.option_name);
    });
  }, []);

  useEffect(() => {
    let prices = [...displayPrice];
    prices.push({
      optionId: -1,
      optionValueId: -1,
      price: calculateTaxPercentOfPrice(menu_price, menu_tax) + menu_price,
    });

    setDisplayPrice(prices);
  }, []);

  useEffect(() => {
    let option = {};

    MenuOptions.forEach(element => {
      let defaultValue = element.MenuOptionValues.find(
        el => el.menu_option_value_id == element.default_value_id,
      );

      if (element.Option.display_type == 'radio') {
        option = {
          ...option,
          [element.Option.option_name]: {
            value: defaultValue?.OptionValue.value || '',
            id: defaultValue?.menu_option_value_id || -1,
            menuOptionId: element.menu_option_id,
            optionId: element.Option.option_id,
            displayType: element.Option.display_type,
            optionValueId: defaultValue?.option_value_id || -1,
            optionPrice: defaultValue?.new_price,
            menuOptionType: element.option_menu_type,
          },
        };
      } else if (element.Option.display_type == 'select') {
        option = {
          ...option,
          [element.Option.option_name]: {
            value: defaultValue?.OptionValue.value || '',
            id: defaultValue?.menu_option_value_id || -1,
            menuOptionId: element.menu_option_id,
            optionId: element.Option.option_id,
            displayType: element.Option.display_type,
            optionValueId: defaultValue?.option_value_id || -1,
            optionPrice: defaultValue?.new_price || 0,
            menuOptionType: element.option_menu_type,
          },
        };
      } else {
        option = {
          ...option,
          [element.Option.option_name]: [],
        };
      }
    });

    setSelectedOptions(option);
  }, []);

  useEffect(() => {
    let price = 0;
    displayPrice.forEach(element => {
      price += element.price;
    });

    setNewPrice(price * quantity);
  }, [displayPrice, quantity]);

  useEffect(() => {
    if (shouldSetState) setOrderTime(newOrderTime);
  }, [newOrderTime]);

  const handleClosePress = () => {
    navigation.goBack();
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

  const handleCartPress = () =>
    navigation.navigate('Cart', {
      baseURL: baseURL,
    });

  const handlePriceChange = (value, basePrice, itemTax, isCheckbox = false) => {
    if (basePrice == 1) {
      let prices = [...displayPrice];

      prices[0] = {
        optionId: value.menu_option_id,
        optionValueId: value.menu_option_value_id,
        price:
          calculateTaxPercentOfPrice(value.new_price, itemTax) +
          value.new_price,
        percentage_tax: itemTax,
        calculated_tax: calculateTaxPercentOfPrice(value.new_price, itemTax),
      };

      setDisplayPrice(prices);
    } else {
      let prices = [...displayPrice];
      let index = prices.findIndex(el =>
        isCheckbox
          ? el.optionId == value.menu_option_id &&
            el.optionValueId == value.menu_option_value_id
          : el.optionId == value.menu_option_id,
      );

      if (index > -1) {
        let current = prices[index];
        if (current.optionValueId == value.menu_option_value_id) {
          prices.splice(index, 1);
        } else {
          current.optionValueId = value.menu_option_value_id;
          current.price =
            calculateTaxPercentOfPrice(value.new_price, itemTax) +
            value.new_price;
          current.percentage_tax = itemTax;
          current.calculated_tax = calculateTaxPercentOfPrice(
            value.new_price,
            itemTax,
          );
          prices[index] = current;
        }
      } else {
        prices.push({
          optionId: value.menu_option_id,
          optionValueId: value.menu_option_value_id,
          price:
            calculateTaxPercentOfPrice(value.new_price, itemTax) +
            value.new_price,
          percentage_tax: itemTax,
          calculated_tax: calculateTaxPercentOfPrice(value.new_price, itemTax),
        });
      }

      setDisplayPrice(prices);
    }
  };

  const handleRadioSelection = async (value, menu) => {
    handlePriceChange(value, menu.base_price, menu.item_tax);

    let options = {...selectedOptions};
    options[menu.Option.option_name] = {
      ...options[menu.Option.option_name],
      value: value.OptionValue.value,
      id: value.menu_option_value_id,
      optionValueId: value.option_value_id,
      optionPrice: value.new_price,
      percentage_tax: menu.item_tax,
      calculated_tax: calculateTaxPercentOfPrice(
        value.new_price,
        menu.item_tax,
      ),
    };

    await setSelectedOptions(options);
  };

  const handleSelectorSelection = async (value, menu) => {
    handlePriceChange(value, menu.base_price, menu.item_tax);

    let options = {...selectedOptions};
    let current = options[menu.Option.option_name];

    if (current.value == value.OptionValue.value)
      current = {
        ...current,
        value: '',
        id: '',
      };
    else
      current = {
        ...current,
        value: value.OptionValue.value,
        id: value.menu_option_value_id,
        optionValueId: value.option_value_id,
        optionPrice: value.new_price,
        percentage_tax: menu.item_tax,
        calculated_tax: calculateTaxPercentOfPrice(
          value.new_price,
          menu.item_tax,
        ),
      };

    options[menu.Option.option_name] = current;

    await setSelectedOptions(options);
  };

  const handleCheckboxSelection = async (value, menu) => {
    handlePriceChange(value, menu.base_price, menu.item_tax, true);

    let options = {...selectedOptions};
    let current = options[menu.Option.option_name];

    let ind = current.findIndex(el => el?.value == value.OptionValue.value);

    if (ind > -1) {
      let selections = [...current];

      selections.splice(ind, 1);
      current = selections;
    } else {
      let selections = [...current];
      selections.push({
        value: value.OptionValue.value,
        id: value.menu_option_value_id,
        menuOptionId: menu.menu_option_id,
        optionId: menu.Option.option_id,
        displayType: menu.Option.display_type,
        optionValueId: value.option_value_id,
        optionPrice: value.new_price,
        menuOptionType: menu.option_menu_type,
        percentage_tax: menu.item_tax,
        calculated_tax: calculateTaxPercentOfPrice(
          value.new_price,
          menu.item_tax,
        ),
      });

      current = selections;
    }

    options[menu.Option.option_name] = current;
    await setSelectedOptions(options);
  };

  const handleInstructionChange = text => setInstructions(text);
  const handleIncreament = () => setQuantity(prevState => prevState + 1);

  const handleDecreament = () =>
    setQuantity(prevState => (prevState > 1 ? prevState - 1 : 1));

  const handleAddToRedux = item => {
    let n = count + quantity;

    dispatch({
      type: 'ADD_TO_CART',
      payload: {item, n},
    });

    showMessage({
      message: 'Added to cart',
      type: 'success',
    });

    handleClosePress();
  };

  const handleChangeReduxQuantity = (sameIndex = -1) => {
    let n = count + quantity;
    if (sameIndex == -1) {
      sameIndex = cartData.findIndex(
        el => el.itemName == menu_name && el.itemSpecial == instructions,
      );
    }

    const newState = cartData.map((item, ind) => {
      const newItem = {...item};
      let price = newPrice || menu_price * quantity;

      if (ind == sameIndex) {
        newItem.itemQuantity = newItem.itemQuantity + quantity;
        newItem.itemPrice = newItem.itemPrice + price;
      }
      return newItem;
    });

    dispatch({
      type: 'CHANGE_QUANTITY',
      payload: {newState, n},
    });

    handleClosePress();
  };

  const handleAddToCart = () => {
    if (selectedOptions[hasRequired]?.id != -1) {
      let item = {
        itemId: menu_id,
        itemName: menu_name,
        itemOwnPrice: basePriceValue,
        itemPrice: newPrice || menu_price,
        itemDescription: menu_description,
        itemSpecial: instructions,
        itemQuantity: quantity,
        itemImage: menu_photo,
        itemTax: menu_tax,
        menu_type,
        ...selectedOptions,
      };

      if (Object.keys(selectedOptions).length == 0) {
        cartLogicWithNoDescription(cartData, item, ifExists => {
          if (!ifExists) {
            handleAddToRedux(item);
          } else {
            handleChangeReduxQuantity();
          }
        });
      } else {
        cartLogic(cartData, item, res => {
          if (res.shouldPush) {
            handleAddToRedux(item);
          } else {
            handleChangeReduxQuantity(res.sameIndex);
          }
        });
      }
    } else {
      showMessage({
        message: 'Please select the required option',
        type: 'warning',
      });
    }
  };

  const calculateTaxPercentOfPrice = (price, tax) => {
    let taxPercentOfPrice = (price * tax) / 100;
    return taxPercentOfPrice;
  };

  const renderRadioBtns = (value, index, menu) => {
    let isSelected =
      selectedOptions[menu.Option.option_name]?.value ==
      value?.OptionValue?.value;

    return (
      <TouchableOpacity
        key={index}
        style={styles.menuOptionContainer}
        onPress={() => handleRadioSelection(value, menu)}>
        <View style={styles.menuOptionNameContainer}>
          {isSelected ? (
            <Ionicons name="radio-button-on" size={18} color={Colors.primary} />
          ) : (
            <Ionicons name="radio-button-off" size={18} color={Colors.black} />
          )}
          <Text style={styles.menuOptionNameText}>
            {value?.OptionValue?.value}
          </Text>
        </View>
        <View style={styles.menuOptionPriceContainer}>
          <Text style={styles.menuOptionPriceText}>
            {value?.new_price == 0 ||
            value?.new_price === null ||
            value?.new_price === undefined
              ? 'Free'
              : `€ ${parseFloat(
                  calculateTaxPercentOfPrice(value?.new_price, menu.item_tax) +
                    value?.new_price,
                ).toFixed(2)}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectorBtns = (value, index, menu) => {
    let isSelected =
      selectedOptions[menu.Option.option_name]?.value ==
      value?.OptionValue?.value;
    return (
      <TouchableOpacity
        key={index}
        style={styles.menuOptionContainer}
        onPress={() => handleSelectorSelection(value, menu)}>
        <View style={styles.menuOptionNameContainer}>
          {isSelected ? (
            <Fontisto name="checkbox-active" size={15} color={Colors.primary} />
          ) : (
            <Fontisto name="checkbox-passive" size={15} color={Colors.black} />
          )}
          <Text style={styles.menuOptionNameText}>
            {value?.OptionValue?.value}
          </Text>
        </View>
        <View style={styles.menuOptionPriceContainer}>
          <Text style={styles.menuOptionPriceText}>
            {value?.new_price == 0 ||
            value?.new_price === null ||
            value?.new_price === undefined
              ? 'Free'
              : `€ ${parseFloat(
                  calculateTaxPercentOfPrice(value?.new_price, menu.item_tax) +
                    value?.new_price,
                ).toFixed(2)}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCheckboxBtns = (value, index, menu) => {
    let isSelected = selectedOptions[menu.Option.option_name]?.some(
      el => el?.value == value?.OptionValue?.value,
    );

    return (
      <TouchableOpacity
        key={index}
        style={styles.menuOptionContainer}
        onPress={() => handleCheckboxSelection(value, menu)}>
        <View style={styles.menuOptionNameContainer}>
          {isSelected ? (
            <Fontisto name="checkbox-active" size={15} color={Colors.primary} />
          ) : (
            <Fontisto name="checkbox-passive" size={15} color={Colors.black} />
          )}
          <Text style={styles.menuOptionNameText}>
            {value?.OptionValue?.value}
          </Text>
        </View>
        <View style={styles.menuOptionPriceContainer}>
          <Text style={styles.menuOptionPriceText}>
            {value?.new_price == 0 ||
            value?.new_price === null ||
            value?.new_price === undefined
              ? 'Free'
              : `€ ${parseFloat(
                  calculateTaxPercentOfPrice(value?.new_price, menu.item_tax) +
                    value?.new_price,
                ).toFixed(2)}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topContainer, bgStyle]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleClosePress}>
          <Ionicons name="chevron-back" color={Colors.white} size={30} />
        </TouchableOpacity>

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
            onPressIn={handleCartPress}>
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

      <ScrollView
        style={{flex: 0.93}}
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.productInfoContainer}>
          <View style={styles.productImageContainer}>
            <FastImage
              source={{uri: baseURL + '/restaurant_data/' + menu_photo}}
              style={styles.productImage}
              resizeMode="stretch"
            />
          </View>

          <View style={styles.productDescriptionContainer}>
            <View style={styles.productNameContainer}>
              <Text
                style={[
                  styles.productNameText,
                  {color: layout_setting?.h2_text_color},
                ]}>
                {menu_name.replaceAll('�', '')}
              </Text>
              <Text
                style={[
                  styles.productNameText,
                  {color: layout_setting?.h2_text_color},
                ]}>
                €{' '}
                {displayPrice.length == 0
                  ? menu_price.toFixed(decimal_places)
                  : newPrice.toFixed(decimal_places)}
              </Text>
            </View>

            <Text style={styles.productDescription}>
              {menu_description || 'No description added'}
            </Text>
          </View>
        </View>

        <View style={styles.horizontalLine} />

        {MenuAllergyItems.length > 0 && (
          <View style={styles.menuOptionsWrapper}>
            <View style={styles.menuOptionTitleContainer}>
              <Text style={styles.productNameText}>Allergens</Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              {MenuAllergyItems.map((value, index) => {
                return (
                  <Text
                    key={index}
                    style={[
                      styles.allergensText,
                      {
                        backgroundColor: layout_setting?.basecolor,
                      },
                    ]}>
                    {value.Allergy_Item.item_name}
                  </Text>
                );
              })}
            </View>
          </View>
        )}

        {MenuOptions.map((menu, index1) => {
          return (
            <View key={index1} style={styles.menuOptionsWrapper}>
              <View style={styles.menuOptionTitleContainer}>
                <Text style={styles.productNameText}>
                  {menu.Option.option_name}
                </Text>
                {menu.required == 1 && (
                  <Text style={styles.requiredText}>REQUIRED</Text>
                )}
              </View>

              {menu.MenuOptionValues.map((value, index2) => {
                return menu.Option.display_type == 'radio'
                  ? renderRadioBtns(value, index2, menu)
                  : menu.Option.display_type == 'select'
                  ? renderSelectorBtns(value, index2, menu)
                  : renderCheckboxBtns(value, index2, menu);
              })}
            </View>
          );
        })}

        <View style={styles.menuOptionsWrapper}>
          <Text style={styles.productNameText}>Add Special Instructions</Text>

          <TextInput
            value={instructions}
            style={styles.instrctionsInput}
            placeholderTextColor={Colors.grey}
            placeholder="e.g. add something extra"
            onChangeText={handleInstructionChange}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBtnsWrapper}>
        <View style={styles.countingBtns}>
          <TouchableOpacity onPress={handleDecreament}>
            <AntDesign
              name="minussquare"
              size={30}
              color={layout_setting?.basecolor}
            />
          </TouchableOpacity>

          <Text style={styles.productPriceText}>{quantity}</Text>

          <TouchableOpacity onPress={handleIncreament}>
            <AntDesign
              name="plussquare"
              size={30}
              color={layout_setting?.basecolor}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.orderBtn, bgStyle]}
          onPress={handleAddToCart}>
          <Text style={styles.orderBtnText}>ADD TO ORDER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {flex: 1},

  topContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
  },

  backBtn: {padding: 10},

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

  cartBtnContainer: {
    marginRight: 10,
    backgroundColor: '#43b149',
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

  productInfoContainer: {
    width: '80%',
    marginVertical: 10,
    alignSelf: 'center',
    flexDirection: 'row',
  },

  productImageContainer: {
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },

  productImage: {
    width: WINDOW_WIDTH < 420 ? 125 : 150,
    height: WINDOW_WIDTH < 420 ? 125 : 150,
    borderRadius: 75,
  },

  productDescriptionContainer: {
    flex: 2,
    justifyContent: 'center',
  },

  productNameContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  productNameText: {
    fontSize: WINDOW_WIDTH < 420 ? 20 : 22,
    color: Colors.black,
    fontWeight: 'bold',
    fontFamily: 'FreeSans',
  },

  productPriceText: {fontSize: 18, color: Colors.black},

  productDescription: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'FreeSans',
  },

  productType: {fontSize: 14, color: Colors.grey, marginTop: 5},

  horizontalLine: {
    width: '95%',
    borderWidth: 0.3,
    marginBottom: 10,
    alignSelf: 'center',
    borderColor: Colors.grey,
  },

  menuOptionsWrapper: {
    padding: 15,
    width: '90%',
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: 5,
    alignSelf: 'center',
    borderColor: Colors.offWhite,
    backgroundColor: Colors.white,
  },

  menuOptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  allergensText: {
    fontSize: 15,
    marginTop: 5,
    borderRadius: 20,
    paddingVertical: 5,
    color: Colors.white,
    marginHorizontal: 5,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
  },

  requiredText: {
    fontSize: 12,
    borderRadius: 5,
    color: Colors.white,
    paddingHorizontal: 3,
    backgroundColor: Colors.primary,
  },

  menuOptionContainer: {
    marginVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuOptionNameContainer: {
    // width: '90%',
    paddingVertical: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },

  menuOptionNameText: {color: Colors.black, marginLeft: 10},

  menuOptionPriceContainer: {
    width: '15%',
    paddingVertical: 5,
    alignItems: 'flex-end',
  },

  menuOptionPriceText: {color: Colors.black},

  instrctionsInput: {
    width: '100%',
    marginTop: 20,
    borderWidth: 0.5,
    borderRadius: 10,
    color: Colors.black,
    paddingHorizontal: 10,
    borderColor: Colors.grey,
  },

  bottomBtnsWrapper: {
    flex: 0.1,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },

  countingBtns: {
    flex: WINDOW_WIDTH < 420 ? 0.2 : 0.12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderBtn: {
    flex: WINDOW_WIDTH < 420 ? 0.75 : 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 10,
  },

  orderBtnText: {fontSize: 18, color: Colors.white},
});
