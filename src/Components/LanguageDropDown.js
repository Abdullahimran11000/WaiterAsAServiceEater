import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
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
import FastImage from 'react-native-fast-image';

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
        onSelect={(selectedItem, index, image) => {
          StringsOfLanguages.setLanguage(selectedItem.longform,selectedItem.image);

          props.onPress();
          storeData(selectedItem.longform,selectedItem.image);
        }}
        buttonTextAfterSelection={(selectedItem, index) => {
          return (
            <>
              <Text>{selectedItem.longform}</Text>
              <Image
                resizeMode="contain"
                source={selectedItem.image}
                style={{width: 20, height: 30}}
              />
            </>
          );
        }}
        rowTextForSelection={(item, index) => {
          return (
            <>
              <Text style={{color: Colors.black, fontFamily: 'FreeSans'}}>
                {item?.longform}
              </Text>
              <Image
                resizeMode="contain"
                source={item?.image}
                style={{width: 20, height: 30}}
              />
            </>
            // </View>
          );
        }}
        defaultValue={''}
        defaultButtonText={language}
        // defaultButtonText={<Text>{language}</Text>}
        // searchPlaceHolder=''
        // renderDropdownIcon={setIcon}
        rowTextStyle={{fontSize: 14}}
        buttonStyle={{
          width: 100,
          borderColor: Colors.white,
          borderWidth: 1,
          backgroundColor: Colors.grey,
          borderRadius: 10,
        }}
        dropdownStyle={{
          width: 100,
          borderRadius: 5,
          justifyContent: 'space-around',
        }}
      />
    </View>
  );
};

export default LanguageDropDown;

const styles = StyleSheet.create({});
