import {
  SET_ENTRYS,
  SET_YEARS,
  SET_THIS_DATE,
  SET_YEAR,
  SET_DATA,
  SET_MAIN_ENTRYS,
} from './_actionTypes';

const initialState = {
  entrys: [],
  years: [],
  thisDate: new Date(),
  year: new Date().getFullYear().toString(),
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ENTRYS:
      return {
        ...state,
        entrys: action.entrys,
      };
    case SET_MAIN_ENTRYS:
      return {
        ...state,
        main_entrys: action.main_entrys,
      };
    case SET_DATA:
      return {
        ...state,
        data: action.data,
      };
    case SET_YEARS:
      return {
        ...state,
        years: action.years,
      };
    case SET_YEAR:
      return {
        ...state,
        year: action.year,
      };
    case SET_THIS_DATE:
      return {
        ...state,
        thisDate: action.thisDate,
      };
    default:
      return state;
  }
};

export default reducer;
