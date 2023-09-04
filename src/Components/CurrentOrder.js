import React, {useEffect, useState, useContext} from 'react';
import {
  Text,
  View,
  Alert,
  Pressable,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';

import moment from 'moment';
import FastImage from 'react-native-fast-image';
import {useSelector, useDispatch} from 'react-redux';
import {showMessage} from 'react-native-flash-message';
import AntDesign from 'react-native-vector-icons/AntDesign';

import Colors from '../Assets/Colors';
import {WINDOW_WIDTH} from '../Utils/Size';
import {getTablesList} from '../Regex/SessionCheck';
import {PlaceOrder} from '../Server/Methods/Listing';
import {SocketContext} from '../Context/SocketContext';

const CurrentOrder = ({route, handleBackPress}) => {
  const baseURL = route?.params?.baseURL;

  const dispatch = useDispatch();
  const socket = useContext(SocketContext);

  const {cartData, count} = useSelector(store => store.cartReducer);
  const {newOrderTime} = useSelector(store => store.timerReducer);
  const {session, user} = useSelector(store => store.sessionReducer);

  const {layout_setting} = user;
  const basecolor = layout_setting?.basecolor;

  const location_id = user?.role[0]?.staff_location_id;
  const {decimal_places, tax_label, wait_time} =
    user.assignedLocations[0].Location;

  const menuTags = 'MenuTags';
  const [totalTax, setTotalTax] = useState(0);
  const [subTotalAmount, setSubTotalAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  /* The above code is using the useEffect hook in React to calculate the subtotal, total amount, and
  total tax of items in a shopping cart. It is iterating through the cartData array and adding up
  the item prices and taxes for each item. It also checks for any nested items within each item and
  adds up their taxes as well. Finally, it sets the calculated values using the useState hook. */
  useEffect(() => {
    let amount = 0;
    let total_tax = totalTax;
    cartData.forEach(element => {
      amount += element.itemPrice;
      total_tax +=
        (element.itemOwnPrice * element.itemTax * element.itemQuantity) / 100;

      for (const key in element) {
        if (element[key].id != -1) {
          if (Array.isArray(element[key]) && key != menuTags) {
            element[key].map(item => {
              total_tax = total_tax + item.calculated_tax;
            });
          } else if (
            element[key].calculated_tax != undefined &&
            element[key].calculated_tax != null
          ) {
            total_tax =
              parseFloat(total_tax) + parseFloat(element[key].calculated_tax);
          }
        }
      }
      // total_tax *= element.itemQuantity;
    });

    setSubTotalAmount(amount - total_tax);
    setTotalAmount(amount);
    setTotalTax(total_tax);
  }, []);

  /**
   * The function handles the removal of an item from a cart and updates the total amount, total tax,
   * and sub-total amount accordingly.
   */
  const handleRemoveItemPressed = itemIndex => {
    let n = 0;

    const newState = cartData.map((item, ind) => {
      const newItem = {...item};
      if (ind == itemIndex) {
        let amount = totalAmount - newItem.itemPrice;
        let singleTax = (newItem.itemOwnPrice * newItem.itemTax) / 100;
        let total_tax = totalTax - singleTax * newItem.itemQuantity;

        n = count - newItem.itemQuantity;

        for (const key in newItem) {
          if (newItem[key].id != -1) {
            if (Array.isArray(newItem[key]) && key != menuTags) {
              newItem[key].map(item => {
                total_tax =
                  total_tax - item.calculated_tax * newItem.itemQuantity;
              });
            } else if (
              newItem[key].calculated_tax != undefined &&
              newItem[key].calculated_tax != null
            ) {
              total_tax =
                parseFloat(total_tax) -
                parseFloat(newItem[key].calculated_tax) * newItem.itemQuantity;
            }
          }
        }

        setSubTotalAmount(amount - total_tax);
        setTotalAmount(amount);
        setTotalTax(total_tax);

        newItem.itemQuantity = 0;
      }
      return newItem;
    });

    if (newState[itemIndex].itemQuantity == 0) {
      newState.splice(itemIndex, 1);
      showMessage({
        message: 'Removed from cart',
        type: 'warning',
      });
    }

    dispatch({
      type: 'CHANGE_QUANTITY',
      payload: {newState, n},
    });
  };

  /**
   * This function handles the increment of quantity and price of an item in a shopping cart using
   * Redux.
   */
  const handleReduxIncreament = itemIndex => {
    setDisabled(true);

    let n = count + 1;

    const newState = cartData.map((item, ind) => {
      const newItem = {...item};
      if (ind == itemIndex) {
        let unitPrice = newItem.itemPrice / newItem.itemQuantity;

        newItem.itemPrice = newItem.itemPrice + unitPrice;
        newItem.itemQuantity = newItem.itemQuantity + 1;

        let amount = totalAmount + unitPrice;
        let total_tax =
          totalTax + (newItem.itemOwnPrice * newItem.itemTax) / 100;

        for (const key in newItem) {
          if (newItem[key].id != -1) {
            if (Array.isArray(newItem[key]) && key != menuTags) {
              newItem[key].map(item => {
                total_tax = total_tax + item.calculated_tax;
              });
            } else if (
              newItem[key].calculated_tax != undefined &&
              newItem[key].calculated_tax != null
            ) {
              total_tax =
                parseFloat(total_tax) + parseFloat(newItem[key].calculated_tax);
            }
          }
        }

        setSubTotalAmount(amount - total_tax);
        setTotalAmount(amount);
        setTotalTax(total_tax);
      }
      return newItem;
    });

    dispatch({
      type: 'CHANGE_QUANTITY',
      payload: {newState, n},
    });

    setDisabled(false);
  };

  /**
   * This function handles the decrement of an item's quantity in a shopping cart and updates the total
   * amount and tax accordingly.
   */
  const handleReduxDecreament = itemIndex => {
    setDisabled(true);

    let n = count - 1;

    const newState = cartData.map((item, ind) => {
      const newItem = {...item};
      if (ind == itemIndex) {
        let unitPrice = newItem.itemPrice / newItem.itemQuantity;

        newItem.itemPrice = newItem.itemPrice - unitPrice;
        newItem.itemQuantity = newItem.itemQuantity - 1;

        let amount = totalAmount - unitPrice;
        let total_tax =
          totalTax - (newItem.itemOwnPrice * newItem.itemTax) / 100;

        for (const key in newItem) {
          if (newItem[key].id != -1) {
            if (Array.isArray(newItem[key]) && key != menuTags) {
              newItem[key].map(item => {
                total_tax = total_tax - item.calculated_tax;
              });
            } else if (
              newItem[key].calculated_tax != undefined &&
              newItem[key].calculated_tax != null
            ) {
              total_tax =
                parseFloat(total_tax) - parseFloat(newItem[key].calculated_tax);
            }
          }
        }

        setSubTotalAmount(amount - total_tax);
        setTotalAmount(amount);
        setTotalTax(total_tax);
      }
      return newItem;
    });

    if (newState[itemIndex].itemQuantity == 0) {
      newState.splice(itemIndex, 1);
      showMessage({
        message: 'Removed from cart',
        type: 'warning',
      });
    }

    dispatch({
      type: 'CHANGE_QUANTITY',
      payload: {newState, n},
    });

    setDisabled(false);
  };

  /**
   * The function handles placing an order by sending a request to the server with the necessary data
   * and updating the state accordingly.
   */
  const handlePlaceOrder = () => {
    setIsLoading(true);
    getTablesList(location_id, session.table_id, async res => {
      if (res) {
        if (newOrderTime > 0) {
          showMessage({
            message: `Please wait for ${wait_time} minute(s) to place a new order`,
            type: 'info',
          });

          handleBackPress();
        } else {
          try {
            let menuItems = [];
            let menuOptions = [];
            let tax = 0;
            let checkbox_tax = 0;

            cartData.forEach(element => {
              for (const key in element) {
                if (typeof element[key] == 'object') {
                  if (Array.isArray(element[key]) && key != menuTags) {
                    if (element[key].length > 0) {
                      let optionValues = [];
                      element[key].forEach(el => {
                        optionValues.push({
                          optionCount: 1,
                          value: el.value,
                          option_value_id: el.optionValueId,
                          price: el.optionPrice,
                          order_item_tax: el.calculated_tax,
                          order_item_tax_percentage: el.percentage_tax,
                          menu_option_type: el.menuOptionType,
                        });
                        checkbox_tax += el.calculated_tax;
                      });

                      menuOptions.push({
                        menu_option_id: element[key][0]?.menuOptionId,
                        option_id: element[key][0]?.optionId,
                        display_type: element[key][0]?.displayType,
                        Option_Values: optionValues,
                      });
                      tax += element[key].calculated_tax;
                    }
                  } else if (
                    typeof element[key].id === 'string' &&
                    element[key].id.length > 0 &&
                    key != menuTags
                  ) {
                    menuOptions.push({
                      menu_option_id: element[key].menuOptionId,
                      option_id: element[key].optionId,
                      display_type: element[key].displayType,
                      Option_Values: [
                        {
                          optionCount: 1,
                          value: element[key].value,
                          option_value_id: element[key].optionValueId,
                          price: element[key].optionPrice,
                          order_item_tax: element[key].calculated_tax,
                          order_item_tax_percentage:
                            element[key].percentage_tax,
                          menu_option_type: element[key].menuOptionType,
                        },
                      ],
                    });
                    tax += element[key].calculated_tax;
                  } else {
                    if (element[key].id > 0 && key != menuTags) {
                      menuOptions.push({
                        menu_option_id: element[key].menuOptionId,
                        option_id: element[key].optionId,
                        display_type: element[key].displayType,
                        Option_Values: [
                          {
                            optionCount: 1,
                            value: element[key].value,
                            option_value_id: element[key].optionValueId,
                            price: element[key].optionPrice,
                            order_item_tax: element[key].calculated_tax,
                            order_item_tax_percentage:
                              element[key].percentage_tax,
                            menu_option_type: element[key].menuOptionType,
                          },
                        ],
                      });
                      tax += element[key].calculated_tax;
                    }
                  }
                }
              }

              let order_item_tax = parseFloat(
                (
                  element.itemOwnPrice *
                  element.itemQuantity *
                  (element.itemTax / 100)
                ).toFixed(4),
              );

              menuItems.push({
                menu_id: element.itemId,
                menu_name: element.itemName,
                MenuOptions: menuOptions,
                menu_type: element.menu_type,
                itemCount: element.itemQuantity,
                menu_price: element.itemOwnPrice,
                comment: element.itemSpecial,
                order_menu_tax: order_item_tax,
                menu_tax_percentage: element.itemTax,
              });

              menuOptions = [];
            });

            const formData = {
              user_id: user.assignedLocations[0].user_id,
              table_no: session.table_id,
              menu_items: menuItems,
              session_id: session.session_id,
              total_items: cartData.length,
              order_time: moment().format('hh:mm:ss'),
              order_date: moment().format('yyyy-MM-DD'),
              order_type_id: 2,
              order_variant: 'small',
              discount_id: 1,
              total_discount: 0,
              totalPrice: parseFloat(totalAmount.toFixed(decimal_places)),
              comment: '',
              qrcode: '',
              qrcodedata: '',
              promocode_id: null,
              payment_status_id: 2,
              order_tax: Math.round(totalTax * 1e2) / 1e2,
            };

            PlaceOrder(location_id, formData)
              .then(res => {
                const {status, data} = res;

                if (status == 200 || status == 201) {
                  setIsLoading(false);

                  socket.emit('order_placed', {
                    order_id: data?.order?.order_id,
                  });

                  showMessage({
                    message: 'Order Placed Successfully',
                    type: 'success',
                  });

                  dispatch({
                    type: 'ADD_ORDER',
                    payload: cartData,
                  });

                  dispatch({
                    type: 'SET_SESSION_TOTAL',
                    payload: parseFloat(totalAmount).toFixed(decimal_places),
                  });

                  dispatch({
                    type: 'CLEAR_CART',
                  });

                  startTimer();
                } else {
                  setIsLoading(false);
                  showMessage({
                    message: 'Could not palce order',
                    type: 'warning',
                  });
                }
              })
              .catch(error => {
                setIsLoading(false);
                console.log('Place Order api error ', error);

                showMessage({
                  message: 'Could not palce order',
                  type: 'warning',
                });
              });
          } catch (error) {
            setIsLoading(false);
            console.log('Place Order error ', error);

            showMessage({
              message: 'Could not palce order',
              type: 'warning',
            });
          }
        }
      } else {
        setIsLoading(false);
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

  /**
   * The function sets a new order time and handles a back press.
   */
  const startTimer = () => {
    dispatch({
      type: 'SET_NEW_ORDER_TIME',
      payload: wait_time * 60,
    });

    handleBackPress();
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={'large'} color={Colors.primary} />
    </View>
  ) : (
    <View style={styles.bodyContainer}>
      <ScrollView
        style={styles.ordersWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        {cartData?.map((order, index) => {
          return (
            <View key={index} style={styles.orderContainer}>
              <Pressable
                style={styles.crossBtnContainer}
                onPress={() => handleRemoveItemPressed(index)}>
                <AntDesign name="closecircle" size={20} color={Colors.black} />
              </Pressable>

              <View style={styles.productImageContainer}>
                <FastImage
                  source={{
                    uri: baseURL + '/restaurant_data/' + order?.itemImage,
                  }}
                  style={styles.imgStyle}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.productNameContainer}>
                <Text style={styles.productName}>
                  {order.itemName.replaceAll('�', '')}
                </Text>
                <Text style={styles.productDescription}>
                  {order.itemDescription || 'No Description Added'}
                </Text>
              </View>

              <View style={styles.productQuantityContainer}>
                <View style={styles.productPriceContainer}>
                  <Text style={styles.cardProductPrice}>
                    € {order.itemPrice.toFixed(decimal_places)}
                  </Text>
                </View>

                <View style={styles.countingBtns}>
                  <Pressable
                    disabled={disabled}
                    onPress={() => handleReduxDecreament(index)}>
                    <AntDesign
                      name="minussquare"
                      size={WINDOW_WIDTH < 420 ? 23 : 25}
                      color={Colors.primary}
                    />
                  </Pressable>

                  <Text style={styles.productPriceText}>
                    {order.itemQuantity}
                  </Text>

                  <Pressable
                    disabled={disabled}
                    onPress={() => handleReduxIncreament(index)}>
                    <AntDesign
                      name="plussquare"
                      size={WINDOW_WIDTH < 420 ? 23 : 25}
                      color={Colors.primary}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.horizotalLine} />

      <View style={styles.statsWrapper}>
        <View style={styles.statContainer}>
          <Text style={styles.productPriceText}>Subtotal</Text>
          <Text style={styles.productPriceText}>
            € {subTotalAmount.toFixed(decimal_places)}
          </Text>
        </View>

        <View style={styles.statContainer}>
          <Text style={styles.statText}>{`Total (Incl. ${tax_label})`}</Text>
          <Text style={styles.statText}>
            € {totalAmount.toFixed(decimal_places)}
          </Text>
        </View>

        <Pressable
          disabled={cartData.length == 0 ? true : false}
          style={[styles.checkoutButtonContainer, {backgroundColor: basecolor}]}
          onPress={handlePlaceOrder}>
          <Text style={styles.checkoutText}>Place Order</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default CurrentOrder;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bodyContainer: {flex: 0.85},
  ordersWrapper: {flex: 0.8},

  orderContainer: {
    marginVertical: 2,
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },

  crossBtnContainer: {
    flex: WINDOW_WIDTH < 420 ? 0.08 : 0.04,
    padding: 5,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  productImageContainer: {
    flex: 0.1,
    borderRadius: 10,
    marginVertical: 10,
  },

  imgStyle: {
    height: 75,
    width: '100%',
    borderRadius: 10,
  },

  productNameContainer: {
    flex: 0.75,
    padding: 5,
    borderRadius: 10,
    marginVertical: 10,
  },

  productName: {fontSize: 18, color: Colors.primary, paddingVertical: 3},
  productDescription: {fontSize: 14, color: Colors.black, paddingVertical: 3},

  productQuantityContainer: {
    flexShrink: 1,
    padding: 5,
    borderRadius: 10,
    marginVertical: 10,
  },

  productPriceContainer: {alignItems: 'flex-end', paddingVertical: 2},

  cardProductPrice: {
    fontSize: WINDOW_WIDTH < 420 ? 20 : 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  countingBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  productPriceText: {fontSize: 14, color: Colors.black},

  horizotalLine: {
    height: 1,
    width: '98%',
    alignSelf: 'center',
    backgroundColor: Colors.black,
  },

  statsWrapper: {
    flex: 0.2,
    padding: 10,
    justifyContent: 'space-around',
  },

  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statText: {fontSize: 18, fontWeight: 'bold', color: Colors.black},

  checkoutButtonContainer: {
    padding: 10,
    width: '90%',
    borderRadius: 50,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },

  checkoutText: {fontSize: 22, fontWeight: 'bold', color: Colors.white},
});
