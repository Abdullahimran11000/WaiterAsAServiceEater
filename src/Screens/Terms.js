import React, {useEffect, useState, useContext} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {useSelector} from 'react-redux';

import Colors from '../Assets/Colors';
import StringsOfLanguages from '../Language/StringsOfLanguages';
import LanguageDropDown from '../Components/LanguageDropDown';
import {useOrientation} from '../hooks/useOrientaion';

const Terms = ({navigation}) => {
  const {user} = useSelector(store => store.sessionReducer);
  const {terms_and_conditions} = user.assignedLocations[0].Location;
  const {layout_setting} = user;

  const {isLandscape} = useOrientation();

  const bgStyle = {
    backgroundColor: layout_setting?.basecolor,
  };

  const acceptTerms = () => navigation.replace('Categories');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.headerContainer, bgStyle]}>
        <Text style={styles.headerText}>{StringsOfLanguages.Welcome_Text}</Text>
      </View>

      <Text style={styles.termsText}>{terms_and_conditions}</Text>

      <TouchableOpacity
        style={[
          styles.acceptBtn,
          bgStyle,
          {width: isLandscape ? '30%' : '90%'},
        ]}
        onPress={acceptTerms}>
        <Text style={styles.acceptBtnText}>{StringsOfLanguages.Accept}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Terms;

const styles = StyleSheet.create({
  container: {flexGrow: 1, justifyContent: 'space-between'},

  headerContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },

  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors.white,
  },

  termsText: {
    padding: 15,
    fontSize: 15,
    color: Colors.black,
    textAlign: 'justify',
    fontFamily: 'FreeSans',
  },

  acceptBtn: {
    borderRadius: 50,
    marginVertical: 10,
    paddingVertical: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },

  acceptBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
