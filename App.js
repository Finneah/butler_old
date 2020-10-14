import React, {Component} from 'react';
import {StyleProvider} from 'native-base';

import getTheme from './native-base-theme/components';
import platform from './native-base-theme/variables/platform';
import {Root} from 'native-base';

import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/AppNavigator';

class App extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <StyleProvider style={getTheme(platform)}>
                <Root>
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                </Root>
            </StyleProvider>
        );
    }
}
export default App;
