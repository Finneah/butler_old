import {SET_INTERVALS} from './_actionTypes';

const initialState = {
  intervals: [],
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_INTERVALS:
      return {
        ...state,
        intervals: action.intervals,
      };

    default:
      return state;
  }
};

export default reducer;
