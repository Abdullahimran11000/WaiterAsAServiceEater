import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {lang} from '../Language/LanguageArray';
import StringsOfLanguages from '../Language/StringsOfLanguages';
import SelectDropdown from 'react-native-select-dropdown';
import Colors from '../Assets/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';

const LanguageDropDown = props => {
  const [language, setLanguage] = useState('Language');

  const storeData = async item => {
    try {
      await AsyncStorage.setItem('Language', item);
    } catch (error) {
      console.log('set language error ', error);
    }
  };

  useFocusEffect(() => {
    AsyncStorage.getItem('Language')
      .then(item => {
        setLanguage(item);
      })
      .catch(error => {
        console.log('get language error ', error);
      });
  }, []);

  return (
    <View>
      <SelectDropdown
        data={lang}
        onSelect={(selectedItem, index) => {
          StringsOfLanguages.setLanguage(selectedItem.shortform);

          props.onPress();
          storeData(selectedItem.longform);
        }}
        buttonTextAfterSelection={(selectedItem, index) => {
          return selectedItem.longform, setLanguage(selectedItem.longform);
        }}
        rowTextForSelection={(item, index) => {
          return item.longform;
        }}
        defaultButtonText={language}
        rowTextStyle={{fontSize: 14}}
        buttonTextStyle={{fontSize: 12}}
        buttonStyle={{width: 160, borderColor: Colors.primary, borderWidth: 1}}
      />
    </View>
  );
};

export default LanguageDropDown;

const styles = StyleSheet.create({});
