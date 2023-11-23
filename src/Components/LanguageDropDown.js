import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import {lang} from '../Language/LanguageArray';
import StringsOfLanguages from '../Language/StringsOfLanguages';
import SelectDropdown from 'react-native-select-dropdown';
import Colors from '../Assets/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {WINDOW_WIDTH} from '../Utils/Size';

const LanguageDropDown = props => {
  const [language, setLanguage] = useState('language');
  const storeData = async item => {
    try {
      await AsyncStorage.setItem('Language', item);
    } catch (error) {
      console.log('set language error ', error);
    }
  };

  const setIcon = () => {
    return (
      <View style={{left: 6, alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={'flag-variant'} size={40} color={Colors.white} />
      </View>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('Language')
        .then(item => {
          setLanguage(item);
        })
        .catch(error => {
          console.log('get language error ', error);
        });
    }, []),
  );

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
        defaultValue={""}
        defaultButtonText={language}
        // defaultButtonText={<Text>{language}</Text>}
        // searchPlaceHolder=''
        renderDropdownIcon={setIcon}
        rowTextStyle={{fontSize: 14}}
        buttonStyle={{
          width: 150,
          borderColor: Colors.primary,
          borderWidth: 1,
          backgroundColor: Colors.primary,
          borderRadius: 10,
        }}
        dropdownStyle={{width: 100, borderRadius: 5}}
      />
    </View>
  );
};

export default LanguageDropDown;

const styles = StyleSheet.create({});
