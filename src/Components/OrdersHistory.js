import React, {useState, useContext} from 'react';
import {
  Text,
  View,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {showMessage} from 'react-native-flash-message';

import Colors from '../Assets/Colors';
import {getTablesList} from '../Regex/SessionCheck';
import {SocketContext} from '../Context/SocketContext';
import {paymentRequest} from '../Server/Methods/Listing';
import StringsOfLanguages from '../Language/StringsOfLanguages';
import {useOrientation} from '../hooks/useOrientaion';

const OrdersHistory = ({navigation}) => {
  const {isLandscape} = useOrientation();
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);

  const {session, user} = useSelector(store => store.sessionReducer);
  const {orders, sessionTotal} = useSelector(store => store.totalReducer);
  const {newOrderTime} = useSelector(store => store.timerReducer);

  const {layout_setting} = user;
  const basecolor = layout_setting?.basecolor;

  const location_id = user?.role[0]?.staff_location_id;
  const {decimal_places} = user.assignedLocations[0].Location;

  const [flag, setFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * The function handles the checkout process by making a payment request and displaying appropriate
   * messages based on the response.
   */
  const handleCheckout = () => {
    setIsLoading(true);

    getTablesList(location_id, session.table_id, async res => {
      if (res) {
        const formData = {
          user_id: user.assignedLocations[0].user_id,
          session_id: session.session_id,
          table_id: session.table_id,
        };

        paymentRequest(formData)
          .then(res => {
            console.log('resssssssssssssssssssss',res)
            const {status, data} = res;

            socket.emit('Payment_request', data?.Notification?.not_id);

            if (status == 200 || status == 201) {
              // if(newOrderTime !== 0){

              let myTimeout =  data?.api_delay_time * 1000;
              // console.log('time outtttttttttttttttttttttttttttttttttttt',myTimeout)
              console.log('if block')
              setIsLoading(false);
              setFlag(true);

                if (
                  data?.Notification?.session_id == session.session_id &&
                  data?.message.includes('customer')
                ) {
                  showMessage({
                    message: data.message,
                    type: 'warning',
                  });
  
                  
                  console.log('inneerr ifffffffff block')
  
                  setTimeout(() => {
                    setFlag(false);
                    console.log('&&&&&&&&&&&&&&&&')
                  }, myTimeout);
              // }
              
              } else if (data?.message.includes('Notification')) {
                setFlag(false);
                clearTimeout(myTimeout);

                setTimeout(() => {
                  showMessage({
                    message: data.message,
                    type: 'success',
                  });
                  console.log('innerr else ifffffffff block')
                  navigation.navigate('Servey');
                }, 3000);
              }
            }
          })
          .catch(error => {
            setIsLoading(false);
            console.log('payment api error ', error);

            showMessage({
              message: 'Could not complete payment',
              type: 'warning',
            });
          });
      } else {
        setIsLoading(false);
        console.log('new session else ')
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

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={'large'} color={Colors.primary} />
    </View>
  ) : (
    <View style={styles.bodyContainer}>
      <ScrollView
        style={styles.scrollViewStyle}
        contentContainerStyle={styles.scrollViewContentStyle}
        showsVerticalScrollIndicator={false}>
        {orders.map((order, index) => {
          return (
            <View key={index} style={styles.allOrdersWrapper}>
              <View style={styles.orderHeaderContainer}>
                <Text style={styles.statText}>
                  {' '}
                  {StringsOfLanguages.Order + '#' + index + 1}
                </Text>
              </View>

              {order.map((item, itemIndex) => {
                return (
                  <View key={itemIndex} style={styles.orderItemWrapper}>
                    <Text style={styles.productPrice}>
                      {item.itemQuantity}x
                    </Text>

                    <View style={styles.orderItemContainer}>
                      <Text style={styles.productName}>
                        {item.itemName.replaceAll('�', '')}
                      </Text>
                      <Text style={styles.productDescription}>
                        {item.itemDescription}
                      </Text>

                      {item.itemSpecial !== '' && (
                        <Text style={styles.productDescription}>
                          {item.itemSpecial}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.productPrice}>
                      € {item.itemPrice.toFixed(decimal_places)}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.bottomButtonWrapper,
          {width: isLandscape ? '30%' : '90%', alignSelf: 'center'},
        ]}>
        <Pressable
          disabled={orders.length == 0 || flag ? true : false}
          style={[
            styles.checkoutButtonContainer,
            {backgroundColor: flag ? Colors.grey : basecolor},
          ]}
          onPress={handleCheckout}>
          <Text style={styles.checkoutText}>{`Pay Now (€ ${sessionTotal.toFixed(
            2,
          )})`}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default OrdersHistory;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bodyContainer: {flex: 0.85},
  productName: {fontSize: 18, color: Colors.primary, paddingVertical: 3},
  productDescription: {fontSize: 14, color: Colors.black, paddingVertical: 3},
  productPrice: {fontSize: 18, fontWeight: 'bold', color: Colors.primary},
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

  allOrdersWrapper: {
    padding: 10,
    width: '100%',
    marginVertical: 5,
    backgroundColor: Colors.white,
  },

  orderHeaderContainer: {
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderItemWrapper: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },

  scrollViewStyle: {flex: 0.9},
  orderItemContainer: {flex: 0.95},
  scrollViewContentStyle: {flexGrow: 1},
  bottomButtonWrapper: {justifyContent: 'center'},
});
