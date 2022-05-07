import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {SERVER_URI} from './constants';

const fetchNewToken = async dispatch => {
  const refreshToken = await AsyncStorage.getItem('QUICKMESSAGE_REFRESH_TOKEN');

  const tokenQuery = await axios.post(`${SERVER_URI}/token`, {
    token: refreshToken,
  });

  const newAccessToken = tokenQuery.data.accessToken;
  await AsyncStorage.setItem('QUICKMESSAGE_ACCESS_TOKEN', newAccessToken);
  return newAccessToken;
};

export {fetchNewToken};
