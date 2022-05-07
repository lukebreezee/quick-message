import {createContext} from 'react';

export const initialState = {
  isLoggedIn: false,
};

const context = createContext(initialState);

export default context;
