/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Button, SafeAreaView, Text, TextInput} from 'react-native';
import {
  fetchMessages,
  getConversation,
  sendMessage,
  startNewConversation,
} from '../../api/serverCalls';

export default ({navigation, route}) => {
  const {user} = route.params;
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);

  const handleSendMessage = async () => {
    const sendMessageResponse = await sendMessage(conversation.id, message);

    if (!sendMessageResponse.success) {
      setStatus(sendMessageResponse.message);
      return;
    }

    await handleFetchMessages(conversation.id);
    setStatus('Sent!');
  };

  const handleFetchMessages = async conversationId => {
    try {
      const {success, messages: fetchedMessages} = await fetchMessages(
        conversationId
      );

      if (!success) {
        setStatus('Error loading messages');
        return;
      }

      setMessages(fetchedMessages);
    } catch {
      setStatus('Error loading messages');
    }
  };

  const createConversation = async () => {
    try {
      const newConversationResponse = await startNewConversation(user.id);
      if (!newConversationResponse.success) {
        return {
          success: false,
          newConversationMessage: newConversationResponse.message,
        };
      }

      const {conversation: newConversation} = newConversationResponse;
      setConversation(newConversation);
      await handleFetchMessages(newConversation.id);
      return {success: true};
    } catch (e) {
      return {
        success: false,
        newConversationMessage: 'An error has occurred',
      };
    }
  };

  useEffect(() => {
    const fetchConversation = async () => {
      const conversationResponse = await getConversation(user.id);

      const {
        success: fetchConversationSuccess,
        message: fetchConversationMessage,
      } = conversationResponse;

      if (fetchConversationSuccess) {
        const {conversation: fetchedConversation} = conversationResponse;
        setConversation(fetchedConversation);
        await handleFetchMessages(fetchedConversation.id);
        setLoading(false);
        return;
      }

      if (
        !fetchConversationSuccess &&
        fetchConversationMessage !== 'Conversation not found'
      ) {
        setMessages([]);
        setLoading(false);
        return;
      }

      await createConversation();
      setLoading(false);
    };

    fetchConversation();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaView>
      <Text>{user.username}</Text>
      <Text>{conversation.id}</Text>
      <TextInput
        onChangeText={text => setMessage(text)}
        placeholder="Type message here"
      />
      <Button
        title="Send"
        disabled={message.length === 0}
        onPress={() => handleSendMessage()}
      />
      {status.length !== 0 && <Text>{status}</Text>}
      <Text>Messages:</Text>
      {messages.map(currentMessage => (
        <Text key={currentMessage.id}>{currentMessage.text}</Text>
      ))}
    </SafeAreaView>
  );
};
