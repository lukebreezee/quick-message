import React, {useContext, useEffect, useState} from 'react';
import {Button, SafeAreaView, Text, TextInput} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authContext from '../../context/auth/context';
import {ACTIONS} from '../../context/auth/reducer';

export default () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [allFieldsFilledOut, setAllFieldsFilledOut] = useState(false);
  const [status, setStatus] = useState('');
  const [fetchedUsername, setFetchedUsername] = useState('');
  const [state, dispatch] = useContext(authContext);

  useEffect(() => {
    const databaseFields = {
      firstName,
      lastName,
      username,
      email,
      password,
      confirm,
    };

    setAllFieldsFilledOut(
      Object.keys(databaseFields).reduce((fieldsEmpty, key) => {
        if (databaseFields[key].trim().length === 0) {
          fieldsEmpty = false;
        }
        return fieldsEmpty;
      }, true)
    );
  }, [firstName, lastName, username, email, password, confirm]);

  const checkEmail = emailToTest => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToTest);
  };

  const handleSubmit = async () => {
    if (!checkEmail(email)) {
      setStatus('Email is invalid');
      return;
    }

    const hasProperLength = password.length > 10 || password.length < 25;
    let hasCapital = false;
    let hasNumber = false;
    const capitalRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;

    for (const char of password) {
      if (capitalRegex.test(char)) {
        hasCapital = true;
      } else if (numberRegex.test(char)) {
        hasNumber = true;
      }
    }

    if (!hasProperLength || !hasCapital || !hasNumber) {
      setStatus(
        'Password must contain a capital letter, a number, and be between 10-25 characters'
      );
      return;
    }

    if (password !== confirm) {
      setStatus('Passwords must match');
      return;
    }

    const registerResponse = await axios.post(
      'http://localhost:3000/user/register',
      {
        firstName,
        lastName,
        username,
        email,
        password,
      }
    );

    const registerData = registerResponse.data;

    if (!registerData.success) {
      setStatus(registerData.message);
      return;
    }

    try {
      await AsyncStorage.setItem(
        'QUICKMESSAGE_ACCESS_TOKEN',
        registerData.accessToken
      );
      await AsyncStorage.setItem(
        'QUICKMESSAGE_REFRESH_TOKEN',
        registerData.refreshToken
      );
    } catch (err) {
      setStatus('An error has occured');
      return;
    }

    dispatch({type: ACTIONS.LOG_IN_OUT});
    setStatus('Success!');
  };

  return (
    <SafeAreaView>
      <Text>Register</Text>
      <TextInput
        placeholder="First Name"
        onChangeText={text => setFirstName(text)}
        autoCorrect={false}
      />
      <TextInput
        placeholder="Last Name"
        onChangeText={text => setLastName(text)}
        autoCorrect={false}
      />
      <TextInput
        placeholder="Username"
        onChangeText={text => setUsername(text)}
        autoCorrect={false}
        autoCapitalize="none"
      />
      <TextInput
        autoCorrect={false}
        autoCapitalize="none"
        placeholder="Email"
        onChangeText={text => setEmail(text)}
      />
      <TextInput
        placeholder="Password"
        autoCorrect={false}
        autoCapitalize="none"
        secureTextEntry
        onChangeText={text => setPassword(text)}
      />
      <TextInput
        placeholder="Confirm Password"
        autoCorrect={false}
        autoCapitalize="none"
        secureTextEntry
        onChangeText={text => setConfirm(text)}
      />
      <Button
        title="Submit"
        onPress={() => handleSubmit()}
        disabled={!allFieldsFilledOut}
      />
      {status.length !== 0 && <Text>{status}</Text>}
      {fetchedUsername.length !== 0 && <Text>{fetchedUsername}</Text>}
    </SafeAreaView>
  );
};
