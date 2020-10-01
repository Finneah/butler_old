import {SET_INTERVALS} from './_actionTypes';

export const setIntervals = intervals => {
  return {
    type: SET_INTERVALS,
    intervals: intervals,
  };
};
