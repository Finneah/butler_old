import {SET_CATEGORIES} from './_actionTypes';

const initialState = {
  categories: undefined,
  categories_a: undefined,
  categories_e: undefined,
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CATEGORIES:
      return {
        ...state,
        categories: action.categories,
        categories_a: action.categories.filter(c => {
          if (c.typ !== 'E') {
            return c;
          }
        }),
        categories_e: action.categories.filter(c => {
          if (c.typ !== 'A') {
            return c;
          }
        }),
      };

    default:
      return state;
  }
};

export default reducer;
