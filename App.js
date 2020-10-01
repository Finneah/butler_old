import React, {Component} from 'react';
import {Container, Content, StyleProvider, Text} from 'native-base';

import getTheme from './native-base-theme/components';
import platform from './native-base-theme/variables/platform';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {Provider} from 'react-redux';

import configureStore from './src/store/_configureStore';

import {Root} from 'native-base';
import {YellowBox} from 'react-native';
import AuthScreen from './src/AuthScreen/AuthScreen';
// const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

class App extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <StyleProvider style={getTheme(platform)}>
        <Root>
          <Provider store={configureStore()}>
            <AuthScreen />
          </Provider>
        </Root>
      </StyleProvider>
    );
  }
}
export default App;
