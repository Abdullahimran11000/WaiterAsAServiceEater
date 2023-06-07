import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import moment from 'moment';
import {useSelector, useDispatch} from 'react-redux';
import {showMessage} from 'react-native-flash-message';

import Colors from '../Assets/Colors';
import {EndSession} from '../Server/Methods/Listing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SocketContext} from '../Context/SocketContext';

const Servey = () => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);

  const {session} = useSelector(store => store.sessionReducer);

  const [fcm, setFcm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* This `useEffect` hook is used to retrieve the FCM token from AsyncStorage and set it to the `fcm`
  state variable. It runs only once when the component mounts, as the dependency array `[]` is
  empty. */
  useEffect(() => {
    AsyncStorage.getItem('fcmToken')
      .then(token => {
        setFcm(token);
      })
      .catch(error => {
        console.log('get fcm error ', error);
      });
  }, []);

  /**
   * This function handles the closing of a session by sending a request to the server and updating the
   * session status.
   */
  const handleCloseSession = () => {
    setIsLoading(true);

    try {
      const formData = {
        session_id: session.session_id,
        location_id: session.location_id,
        table_id: session.table_id,
        session_status: 'completed',
        session_date: session.session_date,
        start_time: session.start_time,
        end_time: moment().format('hh:mm:ss'),
        tab_device_token: fcm,
      };

      EndSession(formData)
        .then(res => {
          const {status, data} = res;

          if (status == 200 || status == 201) {
            setIsLoading(false);

            dispatch({
              type: 'SET_NEW_ORDER_TIME',
              payload: 0,
            });

            dispatch({
              type: 'RESET_SESSION_TOTAL',
            });

            dispatch({
              type: 'END_SESSION',
            });

            showMessage({
              message: 'Session Completed',
              type: 'success',
            });

            socket.emit('session_ended');
          } else {
            setIsLoading(false);
            showMessage({
              message: 'Could not complete session',
              type: 'warning',
            });
          }
        })
        .catch(error => {
          setIsLoading(false);
          console.log('end session api error ', error);

          showMessage({
            message: 'Could not complete session',
            type: 'warning',
          });
        });
    } catch (error) {
      setIsLoading(false);
      console.log('end session error ', error);

      showMessage({
        message: 'Could not complete session',
        type: 'warning',
      });
    }
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={'large'} color={Colors.primary} />
    </View>
  ) : (
    <>
      <View style={styles.container}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            marginBottom: '5%',
            color: Colors.blackText,
          }}>
          {/* Servey */}
        </Text>
        {/* <TouchableOpacity onPress={handleSendServey}>
        <Text>Submit</Text>
      </TouchableOpacity> */}

        <TouchableOpacity
          style={[
            styles.startSessionButton,
            {
              paddingVertical: '1%',
            },
          ]}
          onPress={handleCloseSession}>
          <Text
            style={[
              styles.startSessionText,
              {
                fontSize: 18,
              },
            ]}>
            Finish to eat
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Servey;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startSessionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },

  startSessionButton: {
    width: '90%',
    borderRadius: 20,
    paddingVertical: 10,
    marginVertical: '1%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.red,
  },
});
