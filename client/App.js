import React from 'react';
import AuthProvider from './app/context/auth/Provider';
import StackDecider from './app/screens/StackDecider';
import axios from 'axios';

axios.defaults.validateStatus = status => {
  return (status >= 200 && status < 300) || status === 401 || status === 403;
};

const App = () => {
  return (
    <AuthProvider>
      <StackDecider />
    </AuthProvider>
  );
};

export default App;
