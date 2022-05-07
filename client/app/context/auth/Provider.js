import React, {useReducer} from 'react';
import context, {initialState} from './context';
import reducer from './reducer';

export default ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <context.Provider value={[state, dispatch]}>{children}</context.Provider>
  );
};
