/* eslint-disable react-hooks/exhaustive-deps */
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, StatusBar} from 'react-native';
import AuthStack from '../stacks/AuthStack';
import authContext from '../context/auth/context';
import MessagingStack from '../stacks/MessagingStack';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default () => {
  const [state, dispatch] = useContext(authContext);
  const [currentNavigator, setCurrentNavigator] = useState(
    <ActivityIndicator />
  );

  useEffect(() => {
    const setNavigator = async () => {
      const accessToken = await AsyncStorage.getItem(
        'QUICKMESSAGE_ACCESS_TOKEN'
      );
      if (!accessToken) {
        setCurrentNavigator(<AuthStack />);
      } else {
        setCurrentNavigator(<MessagingStack />);
      }
    };

    setNavigator();
  }, [state.isLoggedIn]);

  return (
    <>
      <StatusBar style="auto" />
      {currentNavigator}
    </>
  );
};
