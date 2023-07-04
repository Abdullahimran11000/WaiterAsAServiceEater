import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {showMessage} from 'react-native-flash-message';
import {ManagerLogin} from '../Server/Methods/Listing';

import Toast from 'react-native-simple-toast';
import FastImage from 'react-native-fast-image';
import {getUniqueId} from 'react-native-device-info';
import Entypo from 'react-native-vector-icons/Entypo';
import Foundation from 'react-native-vector-icons/Foundation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import Colors from '../Assets/Colors';
import {ROOT_URL} from '../Server/config';
import {getToken} from '../Utils/PNHelper';

const iconSize = 30;

const Login = ({navigation}) => {
  const dispatch = useDispatch();
  const {cloudIp} = useSelector(store => store.sessionReducer);

  const [fcm, setFcm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('fcmToken')
      .then(token => {
        setFcm(token);
      })
      .catch(error => {
        console.log('get fcm error ', error);
      });
  }, []);

  const handleEmailChange = text => setEmail(text);
  const handlePasswordChange = text => setPassword(text);
  const handleEyePress = () => setShowPassword(prevState => !prevState);

  const handleLoginPress = () => {
    setIsLoading(true);

    try {
      const formData = {
        email: email,
        is_tab_login: true,
        password: password,
        tab_device_token: fcm,
      };

      ManagerLogin(formData)
        .then(res => {
          console.log('LOGINRES', res);
          const {status, data} = res;

          if (status == 200 || status == 201) {
            AsyncStorage.setItem('token', data?.token)
              .then(() => {
                if (data.assignedLocations[0].Location.decimal_places == 0) {
                  let copy = {...data};
                  copy = {
                    ...data,
                    assignedLocations: data.assignedLocations.map(el => {
                      return {
                        ...el,
                        Location: {
                          ...el.Location,
                          decimal_places: 2,
                        },
                      };
                    }),
                  };

                  dispatch({
                    type: 'SET_USER',
                    payload: copy,
                  });
                } else {
                  dispatch({
                    type: 'SET_USER',
                    payload: data,
                  });
                }

                showMessage({
                  message: 'Login Successful',
                  type: 'success',
                });

                setIsLoading(false);
                navigation.replace('TablesList');
              })
              .catch(error => console.log('async errorsdsds ', error))
              .finally(() => {
                setIsLoading(true);
              });
          } else {
            setIsLoading(false);
            showMessage({
              message: 'Login Failed',
              type: 'warning',
            });
          }
        })
        .catch(error => {
          setIsLoading(false);
          console.log('login api error ', error);

          showMessage({
            message: 'Login Failed',
            type: 'warning',
          });
        });
    } catch (error) {
      setIsLoading(false);
      console.log('login error ', error);

      showMessage({
        message: 'Login Failed',
        type: 'warning',
      });
    }
  };

  const handleUpdateServer = () => {
    const urlRegExp =
      /(?:^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$|(\d+\.\d+.\d+.\d+)):\d{4}$/gm;

    if (urlRegExp.test(url)) {
      axios
        .get(`http://${url}/test_connection`)
        .then(async res => {
          if (res?.status >= 200 && res?.status <= 299) {
            await AsyncStorage.clear();
            Toast.show(res?.data, Toast.SHORT);

            dispatch({
              type: 'SET_CLOUD_IP',
              payload: `http://${url}`,
            });

            AsyncStorage.setItem('cloudIp', `http://${url}`);

            let unique_id = await getUniqueId();
            setFcm(unique_id);

            getToken();
          } else if (res.status >= 500 && res.status <= 599) {
            Toast.show('Internal server error! Your server is probably down.');
          } else {
            Toast.show('Something went wrong. Please try again later.');
          }
        })
        .catch(err => {
          if (err.message.includes('Network')) {
            Toast.show(err.message);
          } else {
            Toast.show('Invalid url');
          }
          console.log('updateServer err:', err.message);
        })
        .finally(() => {
          setModalVisible(false);
        });
    } else {
      Toast.show('Please enter valid ip address.');
    }
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={'large'} color={Colors.primary} />
    </View>
  ) : (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Sign In</Text>
      </View>

      <View style={styles.logoContainer}>
        <FastImage
          source={require('../Assets/Images/toc.png')}
          style={{width: 300, height: 200}}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bodyContainer}>
        <View style={styles.emailWrapper}>
          <Text style={styles.emailHeadingText}>Email Address</Text>
          <View style={styles.emailContainer}>
            <Icon name="email" size={iconSize} color={Colors.primary} />
            <TextInput
              value={email}
              autoCapitalize="none"
              placeholder="Email Address"
              style={styles.textInputStyle}
              textContentType="emailAddress"
              onChangeText={handleEmailChange}
            />
          </View>
        </View>

        <View style={styles.emailWrapper}>
          <Text style={styles.emailHeadingText}>Password</Text>
          <View style={styles.emailContainer}>
            <Foundation name="key" size={iconSize} color={Colors.primary} />
            <TextInput
              value={password}
              autoCapitalize="none"
              placeholder="Password"
              textContentType="newPassword"
              secureTextEntry={!showPassword}
              onChangeText={handlePasswordChange}
              style={[styles.textInputStyle, {width: '86%'}]}
            />
            <TouchableOpacity onPress={handleEyePress}>
              {!showPassword ? (
                <Entypo name="eye" size={iconSize} color={Colors.primary} />
              ) : (
                <Entypo
                  name="eye-with-line"
                  size={iconSize}
                  color={Colors.primary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLoginPress}>
          <Text style={styles.loginBtnText}>Sign In</Text>
        </TouchableOpacity>

        {ROOT_URL && cloudIp == '' ? (
          <>
            <Text
              style={{
                color: Colors.primary,
                marginVertical: 25,
                fontWeight: 'bold',
              }}>
              You're connected with cloud server.
            </Text>
            <TouchableOpacity
              style={{
                width: '40%',
                borderRadius: 20,
                paddingVertical: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.red,
              }}
              onPress={() => setModalVisible(true)}>
              <Text style={{fontSize: 16, color: Colors.white}}>
                Update Server
              </Text>
            </TouchableOpacity>
          </>
        ) : cloudIp != '' ? (
          <>
            <Text
              style={{
                color: Colors.primary,
                marginVertical: 25,
                fontWeight: 'bold',
              }}>
              You're connected with local server.
            </Text>
            <TouchableOpacity
              style={{
                width: '40%',
                borderRadius: 20,
                paddingVertical: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.red,
              }}
              onPress={() => setModalVisible(true)}>
              <Text style={{fontSize: 16, color: Colors.white}}>
                Update Server
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableOpacity
          activeOpacity={1}
          style={{backgroundColor: 'rgba(0,0,0,0.6)', flex: 1}}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.topContent}>
                <View
                  style={[
                    styles.emailContainer,
                    {backgroundColor: '#eee', marginBottom: 30, width: '85%'},
                  ]}>
                  <TextInput
                    placeholderTextColor="grey"
                    value={url}
                    placeholder="192.168.1.15:4000"
                    style={styles.textInputStyle}
                    onChangeText={setUrl}
                  />
                </View>
                <TouchableOpacity
                  style={{
                    width: '35%',
                    borderRadius: 20,
                    paddingVertical: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors.primary,
                  }}
                  onPress={handleUpdateServer}>
                  <Text style={{fontSize: 14, color: Colors.white}}>
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Login;

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

  headerText: {fontSize: 22, fontWeight: 'bold', color: Colors.white},

  logoContainer: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bodyContainer: {
    flex: 0.6,
    alignItems: 'center',
  },

  emailWrapper: {
    width: '70%',
    marginVertical: 20,
  },

  emailHeadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  emailContainer: {
    marginTop: 10,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    justifyContent: 'space-between',
  },

  textInputStyle: {
    width: '93%',
    color: Colors.black,
  },

  loginBtn: {
    width: '70%',
    marginTop: 40,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },

  loginBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '80%',
  },
  modalContent: {
    backgroundColor: 'white',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '90%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  topContent: {
    height: 170,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContentTxt: {
    color: 'black',
    marginVertical: 4,
    textAlign: 'center',
    width: '90%',
    fontFamily: 'CircularStd-Bold',
  },
});
