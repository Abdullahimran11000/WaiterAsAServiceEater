import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import moment from 'moment';
import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';
import {showMessage} from 'react-native-flash-message';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Colors from '../Assets/Colors';
import {GetLocationTables, StartSession} from '../Server/Methods/Listing';
import StringsOfLanguages from '../Language/StringsOfLanguages';
import {useOrientation} from '../hooks/useOrientaion';

const TablesList = () => {
  const {isLandscape} = useOrientation();
  const dispatch = useDispatch();
  const {user} = useSelector(store => store.sessionReducer);
  const location_id = user?.role[0]?.staff_location_id;
  const {layout_setting} = user;

  const [fcm, setFcm] = useState('');
  const [tables, setTables] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    apiCall();

    AsyncStorage.getItem('fcmToken')
      .then(token => {
        setFcm(token);
      })
      .catch(error => {
        console.log('get fcm error ', error);
      });
  }, []);

  const apiCall = () => {
    try {
      GetLocationTables(location_id)
        .then(res => {
          setIsLoading(false);
          const {status, data} = res;
          if (status == 200 || status == 201) setTables(data);
        })
        .catch(error => {
          setIsLoading(false);
          console.log('GetLocationTablesErrorInsideTry: ', error);
          if (Object.keys(error?.response?.data).length > 0) {
            showMessage({
              message: error.response.data.message,
              type: 'warning',
              duration: 1800,
            });
          } else {
            showMessage({
              message: error?.message,
              type: 'warning',
            });
          }
        });
    } catch (error) {
      setIsLoading(false);
      console.log('GetLocationTablesError: ', error);
    }
  };

  const handleTablePress = table => setSelectedTable(table);

  const handleStartSessionPress = () => {
    setIsLoading(true);

    try {
      const formData = {
        location_id: selectedTable.loc_id,
        table_id: selectedTable.table_id,
        session_status: 'started',
        session_date: moment().format('yyyy-MM-DD'),
        start_time: moment().format('hh:mm:ss'),
        tab_device_token: fcm,
      };
      console.log('FCM ', fcm);
      console.log('selectedTable.loc_id ', selectedTable.loc_id);
      StartSession(formData)
        .then(res => {
          const {status, data} = res;

          if (status == 200 || status == 201) {
            setIsLoading(false);

            dispatch({
              type: 'START_SESSION',
              payload: data,
            });

            showMessage({
              message: 'Session Started',
              type: 'success',
            });
          } else {
            setIsLoading(false);
            showMessage({
              message: 'Could not start session',
              type: 'warning',
            });
          }
        })
        .catch(error => {
          setIsLoading(false);
          console.log('start session api error ', error);

          showMessage({
            message: 'Could not start session',
            type: 'warning',
          });
        });
    } catch (error) {
      setIsLoading(false);
      console.log('start session error ', error);

      showMessage({
        message: 'Could not start session',
        type: 'warning',
      });
    }
  };

  const handleRefreshPressed = () => {
    setIsLoading(true);
    apiCall();
  };

  const bgStyle = {
    backgroundColor: layout_setting?.basecolor,
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={'large'} color={Colors.primary} />
    </View>
  ) : (
    <View style={styles.container}>
      <View style={[styles.headerContainer, bgStyle]}>
        <Text style={[styles.nameText, {color: layout_setting?.h2_text_color}]}>
          {tables?.name}
        </Text>
      </View>

      <View style={styles.locationInfoContainer}>
        <Text
          style={[styles.headerText, {color: layout_setting?.h2_text_color}]}>
          {StringsOfLanguages.Tables_List}
        </Text>
        <Text style={{color: Colors.black}}>{StringsOfLanguages.Session}</Text>
      </View>

      <ScrollView
        style={{flex: 0.7}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.tablesWrapper}>
          {tables?.Tables?.map((table, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  selectedTable?.table_name == table.table_name
                    ? styles.selectedTablesContainer
                    : styles.tablesContainer,
                  {opacity: table.is_table_available ? 1 : 0.5},
                  {
                    borderColor:
                      selectedTable?.table_name == table.table_name &&
                      layout_setting?.highlight_color,
                  },
                  {
                    height: isLandscape ? 100 : 130,
                    width: isLandscape ? '10%' : '15%',
                  },
                ]}
                onPress={() => handleTablePress(table)}
                disabled={!table.is_table_available}>
                <FastImage
                  source={
                    table.is_table_available
                      ? require('../Assets/Images/table_empty.png')
                      : require('../Assets/Images/table_booked.png')
                  }
                  style={styles.imgStyle}
                  resizeMode="contain"
                />

                <Text
                  style={[
                    styles.tableNameText,
                    {color: layout_setting?.highlight_text_color},
                  ]}>
                  {table.table_name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomContainer,
          {
            flex: isLandscape ? 0.15 : 0.1,
            width: isLandscape ? '40%' : '100%',
            alignSelf: 'center',
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.startSessionButton,
            bgStyle,
            {marginHorizontal: isLandscape ? 10 : 0},
          ]}
          onPress={handleStartSessionPress}>
          <Text style={styles.startSessionText}>
            {StringsOfLanguages.Start_Session}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.refreshBtn, bgStyle]}
          onPress={handleRefreshPressed}>
          <EvilIcons name="refresh" size={30} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TablesList;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {flex: 1},

  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: Colors.primary,
  },

  backBtn: {padding: 10},

  nameText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginVertical: 10,
    color: Colors.white,
  },

  locationInfoContainer: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    fontSize: 35,
    letterSpacing: 2,
    fontWeight: 'bold',
    marginVertical: 5,
    color: Colors.black,
  },

  tablesWrapper: {
    marginTop: '5%',
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-evenly',
  },

  tablesContainer: {
    padding: 10,

    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.white,
    justifyContent: 'space-evenly',
  },

  selectedTablesContainer: {
    padding: 10,
    borderWidth: 3,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    justifyContent: 'space-evenly',
  },

  imgStyle: {
    width: '75%',
    height: '70%',
    borderRadius: 10,
  },

  tableNameText: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
  },

  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },

  startSessionButton: {
    width: '90%',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },

  startSessionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },

  refreshBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
});
