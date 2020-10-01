import {createStore, combineReducers, compose} from 'redux';

import entrysReducer from './entrys_reducer';
import categoriesReducer from './categories_reducer';
import intervalsReducer from './intervals_reducer';
import userReducer from './user_reducer';
const rootReducer = combineReducers({
  entrys: entrysReducer,
  categories: categoriesReducer,
  intervals: intervalsReducer,
  user: userReducer,
});

let composeEnhancers = compose;

if (__DEV__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

const configureStore = () => {
  return createStore(rootReducer, composeEnhancers());
};

export default configureStore;
