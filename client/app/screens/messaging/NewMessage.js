import React, {useContext, useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import {getUsersFromDB} from '../../api/serverCalls';
import authContext from '../../context/auth/context';

export default ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [userMatches, setUserMatches] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      const userList = await getUsersFromDB();
      setUsers(userList);
    };

    getUsers();
  });

  const handleUserSearch = query => {
    if (query.trim().length === 0) {
      setUserMatches([]);
      return;
    }
    const foundUsers = users.filter(user => {
      const trimmedQuery = query.trim().toUpperCase();
      const slicedUsername = user.username
        .slice(0, trimmedQuery.length)
        .toUpperCase();
      if (slicedUsername === trimmedQuery) {
        return true;
      }
      return false;
    });

    setUserMatches(foundUsers);
  };

  return (
    <SafeAreaView>
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate('message screen')}>
        <Text>New Message</Text>
      </TouchableWithoutFeedback>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Search"
        onChangeText={text => handleUserSearch(text)}
      />
      {userMatches.length !== 0 &&
        userMatches.map((user, idx) => (
          <Text
            key={idx}
            onPress={() => navigation.navigate('message screen', {user})}>
            {user.username}
          </Text>
        ))}
    </SafeAreaView>
  );
};
