import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const ROOT_URL = 'https://phpstack-920157-3520511.cloudwaysapps.com/';
const ROOT_URL = 'https://server.servall.be/';

const client = axios.create({
  baseURL: ROOT_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const clientMultiPart = axios.create({
  baseURL: ROOT_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  async config => {
    config.timeout = 60000;

    const requestConfig = config;
    let cloudIp = await AsyncStorage.getItem('cloudIp');
    requestConfig.baseURL = cloudIp != null ? cloudIp : ROOT_URL;

    let authToken = '';

    try {
      const value = await AsyncStorage.getItem('token');
      if (value !== null) {
        authToken = value;
      }
    } catch (error) {
      console.log('error in token', error);
    }

    if (authToken) {
      requestConfig.headers = {
        'x-access-token': authToken.toString(),
      };
    }
    requestConfig.paramsSerializer = params => {
      return Qs.stringify(params, {
        arrayFormat: 'brackets',
        encode: false,
      });
    };
    return requestConfig;
  },
  err => {
    console.log('errorInConfig: ', err);
    return Promise.reject(err);
  },
);

clientMultiPart.interceptors.request.use(
  async config => {
    const requestConfig = config;
    let authToken = ' ';

    try {
      const value = await AsyncStorage.getItem('token');
      if (value !== null) {
        authToken = value;
      }
    } catch (e) {
      console.log('error in token', e);
    }

    if (authToken) {
      requestConfig.headers = {
        'x-access-token': authToken.toString(),
      };
    }
    requestConfig.paramsSerializer = params => {
      return Qs.stringify(params, {
        arrayFormat: 'brackets',
        encode: false,
      });
    };
    return requestConfig;
  },
  err => {
    console.log('errorInConfig: ', err);
    return Promise.reject(err);
  },
);

export {ROOT_URL, client, clientMultiPart};
