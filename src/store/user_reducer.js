import {SET_USER, TOGGLE_IS_LOGGED_IN} from './_actionTypes';

const initialState = {
  user: undefined,
  isLoggedIn: false,
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.user,
      };
    case TOGGLE_IS_LOGGED_IN:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
      };

    default:
      return state;
  }
};

export default reducer;
