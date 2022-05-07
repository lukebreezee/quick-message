import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useContext, useState} from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  Text,
  TextInput,
} from 'react-native';
import authContext from '../../context/auth/context';
import {ACTIONS} from '../../context/auth/reducer';
import {nonAuthInstance} from '../../api/axiosConfig';

export default ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [state, dispatch] = useContext(authContext);

  const handleSubmit = async () => {
    const loginResponse = await nonAuthInstance
      .post('/user/login', {
        email,
        password,
      })
      .catch();

    // const loginResponse = await fetch('http://10.0.2.2:3000/user/login', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     email,
    //     password,
    //   }),
    // });

    // const data = await loginResponse.json();
    // console.log(data);

    const loginData = loginResponse.data;

    if (!loginData.success) {
      setStatus(loginData.message);
      return;
    }

    try {
      await AsyncStorage.setItem(
        'QUICKMESSAGE_ACCESS_TOKEN',
        loginData.accessToken
      );
      await AsyncStorage.setItem(
        'QUICKMESSAGE_REFRESH_TOKEN',
        loginData.refreshToken
      );
    } catch {
      setStatus('An error has occured');
      return;
    }

    dispatch({type: ACTIONS.LOG_IN_OUT});

    setStatus('Success!');
  };

  return (
    <SafeAreaView>
      <Text>Login</Text>
      <TextInput
        placeholder="Email"
        autoCorrect={false}
        autoCapitalize="none"
        onChangeText={text => setEmail(text)}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        autoCorrect={false}
        autoCapitalize="none"
        onChangeText={text => setPassword(text)}
      />
      <Button title="Submit" onPress={() => handleSubmit()} />
      <Button title="Sign Up" onPress={() => navigation.navigate('register')} />
      {status.length !== 0 && <Text>{status}</Text>}
    </SafeAreaView>
  );
};
