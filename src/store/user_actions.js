import {SET_USER, TOGGLE_IS_LOGGED_IN} from './_actionTypes';

export const setUser = (user) => {
  return {
    type: SET_USER,
    user: user,
  };
};

export const toggleIsLoggedIn = (isLoggedIn) => {
  return {
    type: TOGGLE_IS_LOGGED_IN,
    isLoggedIn: isLoggedIn,
  };
};
