import {
  SET_ENTRYS,
  SET_YEARS,
  SET_THIS_DATE,
  SET_YEAR,
  SET_DATA,
  SET_MAIN_ENTRYS,
} from './_actionTypes';

export const setEntrys = entrys => {
  return {
    type: SET_ENTRYS,
    entrys: entrys,
  };
};

export const setMainEntrys = main_entrys => {
  return {
    type: SET_MAIN_ENTRYS,
    main_entrys: main_entrys,
  };
};
export const setData = data => {
  return {
    type: SET_DATA,
    data: data,
  };
};

export const setYears = years => {
  return {
    type: SET_YEARS,
    years: years,
  };
};
export const setYear = year => {
  return {
    type: SET_YEAR,
    year: year,
  };
};

export const setThisDate = () => {
  return {
    type: SET_THIS_DATE,
    thisDate: new Date(),
  };
};
