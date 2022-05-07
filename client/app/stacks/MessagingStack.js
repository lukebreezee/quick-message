import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../screens/messaging/Home';
import NewMessage from '../screens/messaging/NewMessage';
import MessageScreen from '../screens/messaging/MessageScreen';

const Stack = createNativeStackNavigator();

export default () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="home" component={Home} />
        <Stack.Screen name="new message" component={NewMessage} />
        <Stack.Screen name="message screen" component={MessageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
