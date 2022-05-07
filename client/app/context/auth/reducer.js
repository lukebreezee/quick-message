import {initialState} from './context';

export const ACTIONS = {
  LOG_IN_OUT: 'LOG IN OUT',
};

const reducer = (state = initialState, action) => {
  const tmp = {...state};

  switch (action.type) {
    case ACTIONS.LOG_IN_OUT:
      tmp.isLoggedIn = !tmp.isLoggedIn;
      break;
    default:
      return state;
  }

  return tmp;
};

export default reducer;
