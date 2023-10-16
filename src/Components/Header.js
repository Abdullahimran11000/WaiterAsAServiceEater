import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  Alert,
  AppState,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';
import {callWaiter, paymentRequest} from '../Server/Methods/Listing';
import {showMessage} from 'react-native-flash-message';
import {getTablesList} from '../Regex/SessionCheck';

import CountDown from 'react-native-countdown-component';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../Assets/Colors';
import moment from 'moment';
import StringsOfLanguages from '../Language/StringsOfLanguages';

const Header = props => {
  const dispatch = useDispatch();
  const {baseURL, socket, navigation, name, viewFlag, setViewFlag} = props;

  const {user, session} = useSelector(store => store.sessionReducer);
  const {newOrderTime} = useSelector(store => store.timerReducer);
  const {orders} = useSelector(store => store.totalReducer);
  const {count} = useSelector(store => store.cartReducer);

  let startTime = 0;
  let endTime = 0;
  const [flag, setFlag] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [orderTime, setOrderTime] = useState(0);
  const [payLoader, setPayLoader] = useState(false);
  const [waiterLoader, setWaiterLoader] = useState(false);
  const [shouldSetState, setShouldSetState] = useState(true);

  const {layout_setting} = user;
  const location_id = user?.role[0]?.staff_location_id;

  const bgStyle = {
    backgroundColor: layout_setting?.basecolor,
  };

  const handleAppState = appState => {
    if (appState == 'background') {
      startTime = moment(Date.now());
    } else {
      endTime = moment(Date.now());
      let diff = moment.duration(endTime.diff(startTime));
      let seconds = Math.floor(diff.asSeconds());

      setSeconds(seconds);
    }
  };

  useEffect(() => {
    const subs = AppState.addEventListener('change', handleAppState);

    return () => {
      subs.remove();
    };
  }, []);

  /* This `useEffect` hook is watching for changes in the `newOrderTime` variable and if it changes, it
  sets the `orderTime` state to the new value of `newOrderTime`. The `shouldSetState` variable is
  used to prevent an infinite loop of state updates. */
  useEffect(() => {
    if (shouldSetState) setOrderTime(newOrderTime);
  }, [newOrderTime]);

  /**
   * The function handleClosePress navigates back to the previous screen.
   */
  const handleClosePress = () => {
    if (viewFlag) {
      setViewFlag(false);
    } else {
      navigation.goBack();
    }
  };

  /**
   * The function handles a press event on a cart button and navigates to the Cart screen with a
   * baseURL parameter.
   */
  const handleCartPress = () =>
    navigation.navigate('Cart', {
      baseURL: baseURL,
    });

  /**
   * The function "callTheWaiter" calls the waiter and displays a success or warning message based on
   * the response.
   */
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

  /**
   * The function handles the checkout process by making a payment request and updating the UI based on
   * the response.
   */
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

  return (
    <View style={[styles.topContainer, bgStyle]}>
      <TouchableOpacity style={styles.backBtn} onPress={handleClosePress}>
        <Ionicons name="chevron-back" color={Colors.white} size={30} />
      </TouchableOpacity>

      {name && (
        <Text
          style={[styles.headerText, {color: layout_setting?.h2_text_color}]}>
          {name}
        </Text>
      )}

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

            if (seconds > 0) {
              dispatch({
                type: 'SET_NEW_ORDER_TIME',
                payload: newOrderTime - seconds,
              });

              setSeconds(0);
            } else {
              dispatch({
                type: 'SET_NEW_ORDER_TIME',
                payload: newOrderTime - 1,
              });
            }
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
              {StringsOfLanguages.Pay_Now}
            </Text>
          )}
        </Pressable>

        <Pressable style={styles.waiterBtn} onPress={callTheWaiter}>
          {waiterLoader ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.waiterTxt}>
              {StringsOfLanguages.Call_waiter}
            </Text>
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
  );
};

export default Header;

const styles = StyleSheet.create({
  topContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
  },

  backBtn: {padding: 10},

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
});
