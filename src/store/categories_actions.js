import {SET_CATEGORIES} from './_actionTypes';

export const setCategories = categories => {
  return {
    type: SET_CATEGORIES,
    categories: categories,
  };
};
