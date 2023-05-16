import {getUniqueId} from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getToken() {
  let fcm = await AsyncStorage.getItem('fcmToken');

  try {
    fcm = await getUniqueId();
    console.log('FCMGETTOKEN', fcm);
    if (fcm) await AsyncStorage.setItem('fcmToken', fcm);
  } catch (error) {
    console.log('error gettig fcm', error);
  }
}
