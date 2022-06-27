/* eslint-disable prettier/prettier */
import React, {useContext, useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import authContext from '../../context/auth/context';
import {getAllConversations, getUserData, logOut} from '../../api/serverCalls';
import {io} from 'socket.io-client';

export default ({navigation}) => {
  const [status, setStatus] = useState('');
  const [state, dispatch] = useContext(authContext);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);

  const handleLogOut = async () => {
    const logoutStatus = await logOut(dispatch);
    if (logoutStatus === 'Error') {
      setStatus('Error');
    }
  };

  const handleGetData = async () => {
    const user = await getUserData();
    setStatus(user);
  };

  const handleConnect = async () => {
    const socket = io('http://10.0.2.2:3000');
  };

  useEffect(() => {
    const handleGetConversations = async () => {
      try {
        const conversationsResponse = await getAllConversations();

        const {
          success,
          conversations: fetchedConversations,
        } = conversationsResponse;

        if (!success) {
          setStatus('Error loading message history');
          return;
        }

        setConversations(fetchedConversations);
      } catch {
        setStatus('Error loading message history');
      } finally {
        setLoading(false);
      }
    };

    handleGetConversations();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaView>
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate('new message')}>
        <Text>Home</Text>
      </TouchableWithoutFeedback>
      <Button title="Log Out" onPress={() => handleLogOut()} />
      <Button title="Get Data" onPress={() => handleGetData()} />
      <Button
        title="Initialize Socket Connection"
        onPress={() => handleConnect()}
      />
      {status.length !== 0 && <Text>{status}</Text>}
      <Text>Conversations:</Text>
      {conversations.map(conversation => (
        <Text key={conversation.id}>{conversation.id}</Text>
      ))}
    </SafeAreaView>
  );
};
