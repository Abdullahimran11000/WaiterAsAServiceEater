import React, {useState} from 'react';
import {Text, View, Pressable, StyleSheet} from 'react-native';

import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Colors from '../Assets/Colors';
import CurrentOrder from '../Components/CurrentOrder';
import OrdersHistory from '../Components/OrdersHistory';
import {useOrientation} from '../hooks/useOrientaion';

const Cart = ({navigation, route}) => {
  const {isLandscape} = useOrientation();
  const {user} = useSelector(store => store.sessionReducer);

  const {layout_setting} = user;
  const basecolor = layout_setting?.basecolor;

  const tabs = ['Current Order', 'Orders History'];
  const [selectedTab, setSelectedTab] = useState(0);

  /**
   * The function handles the back button press by navigating to the previous screen.
   */
  const handleBackPress = () => {
    navigation.goBack();
  };

  /**
   * The function sets the selected tab based on the index passed as a parameter.
   */
  const handleTabPress = index => setSelectedTab(index);

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {backgroundColor: basecolor}]}>
        <Pressable style={styles.backBtn} onPress={handleBackPress}>
          <Ionicons name="chevron-back" color={Colors.white} size={30} />
        </Pressable>
        <Text style={styles.headerText}>{tabs[selectedTab]}</Text>
      </View>

      <View style={[styles.tabWraper, {flex: isLandscape ? 0.2 : 0.1}]}>
        {tabs.map((tab, index) => {
          return (
            <Pressable
              key={index}
              style={{
                ...styles.activeTabContiner,
                backgroundColor:
                  index == selectedTab ? basecolor : Colors.white,
              }}
              onPress={() => handleTabPress(index)}>
              <Text
                style={{
                  ...styles.activeTabText,
                  color: index == selectedTab ? Colors.white : Colors.black,
                }}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selectedTab == 0 ? (
        <CurrentOrder route={route} handleBackPress={handleBackPress} />
      ) : (
        <OrdersHistory navigation={navigation} />
      )}
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: Colors.offWhite,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
  },

  backBtn: {padding: 10},

  headerText: {
    flex: 0.95,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.white,
  },

  tabWraper: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-evenly',
  },

  activeTabContiner: {
    flex: 0.45,
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTabText: {fontSize: 22, fontWeight: 'bold'},
});
