import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {SERVER_URI} from '../constants';
import {fetchNewToken} from '../helpers';
import {ACTIONS} from '../context/auth/reducer';
import {authInstance} from './axiosConfig';

const getUserData = async () => {
  try {
    let firstCallPassed = true;
    let dataQuery = await authInstance.get('/user').catch(() => {
      firstCallPassed = false;
    });
    if (!firstCallPassed || !dataQuery.data.success) {
      return 'Error';
    }

    return dataQuery.data.user;
  } catch (e) {
    return 'Error';
  }
};

const logOut = async dispatch => {
  try {
    const refreshToken = await AsyncStorage.getItem(
      'QUICKMESSAGE_REFRESH_TOKEN'
    );
    if (refreshToken === null) {
      return 'Error';
    }

    var firstCallPassed = true;
    const dataQuery = await authInstance
      .delete('/token', {
        headers: {Token: refreshToken},
      })
      .catch(() => {
        firstCallPassed = false;
      });
    if (!firstCallPassed || !dataQuery.data.success) {
      return 'Error';
    }

    await AsyncStorage.removeItem('QUICKMESSAGE_ACCESS_TOKEN');
    await AsyncStorage.removeItem('QUICKMESSAGE_REFRESH_TOKEN');
    dispatch({type: ACTIONS.LOG_IN_OUT});
  } catch {
    return 'Error';
  }
};

const getUsersFromDB = async () => {
  try {
    let firstCallPassed = true;
    let dataQuery = await authInstance.get('/users').catch(() => {
      firstCallPassed = false;
    });
    if (!firstCallPassed || !dataQuery.data.success) {
      return 'Error';
    }

    return dataQuery.data.users;
  } catch {
    return 'Error';
  }
};

const getConversation = async otherEndUid => {
  try {
    const conversationResponse = await authInstance.get('/conversation', {
      headers: {
        'other-end-uid': otherEndUid,
      },
    });

    const {success, message} = conversationResponse.data;
    if (!success) return {success, message};

    const {conversation} = conversationResponse.data;
    return {success, message, conversation};
  } catch {
    return {success: false, message: 'An error has occurred'};
  }
};

const startNewConversation = async otherEndUid => {
  try {
    const conversationResponse = await authInstance.post('/conversation', {
      usersInConversation: [otherEndUid],
    });

    const {success, message} = conversationResponse.data;
    if (!success) {
      return {success, message};
    }

    const {conversation} = conversationResponse.data;
    return {success, conversation};
  } catch {
    return {success: false, message: 'An error has occurred'};
  }
};

const sendMessage = async (conversationId, text) => {
  try {
    const messageResponse = await authInstance.post('/messages', {
      conversationId,
      text,
    });

    if (!messageResponse.data.success) {
      return {success: false, message: messageResponse.data.message};
    }

    return {success: true};
  } catch {
    return {success: false, message: 'An error has occurred'};
  }
};

const fetchMessages = async conversationId => {
  try {
    const messagesResponse = await authInstance.get('/messages', {
      headers: {
        'conversation-id': conversationId,
      },
    });

    const {success, message} = messagesResponse.data;
    if (!success) {
      return {success, message, messages: null};
    }

    return {success, messages: messagesResponse.data.messages};
  } catch {
    return {success: false, message: 'An error has occurred', messages: null};
  }
};

const getAllConversations = async () => {
  try {
    const conversationsQuery = await authInstance.get('/conversation/all');

    const {success, message, conversations} = conversationsQuery.data;
    return {success, message, conversations};
  } catch {
    return {
      success: false,
      message: 'An error has occurred',
      conversations: null,
    };
  }
};

export {
  getUserData,
  logOut,
  getUsersFromDB,
  getConversation,
  startNewConversation,
  sendMessage,
  fetchMessages,
  getAllConversations,
};
