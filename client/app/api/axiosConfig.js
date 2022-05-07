import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {fetchNewToken} from '../helpers';
import {Platform} from 'react-native';
const baseURL =
  Platform.OS === 'ios' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

const authInstance = axios.create({
  baseURL,
});

authInstance.defaults.validateStatus = status => {
  return (status >= 200 && status < 300) || status === 401 || status === 403;
};

authInstance.interceptors.request.use(async config => {
  const accessToken = await AsyncStorage.getItem('QUICKMESSAGE_ACCESS_TOKEN');
  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

authInstance.interceptors.response.use(async response => {
  if (response.status === 403) {
    await fetchNewToken();
    const accessToken = await AsyncStorage.getItem('QUICKMESSAGE_ACCESS_TOKEN');
    response.config.headers.Authorization = `Bearer ${accessToken}`;

    return authInstance.request(response.config);
  }

  return response;
});

const nonAuthInstance = axios.create({baseURL});

export {authInstance, nonAuthInstance};
