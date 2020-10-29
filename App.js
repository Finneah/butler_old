import React, {Component} from 'react';
import {StyleProvider} from 'native-base';

import getTheme from './native-base-theme/components';
import platform from './native-base-theme/variables/platform';
import {Root} from 'native-base';

import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/AppNavigator';
import {ActivityIndicator} from 'react-native';
import {Categories, Intervals} from './src/database';
import {SafeAreaProvider} from 'react-native-safe-area-context';
class App extends Component {
    constructor() {
        super();
        this.state = {intervalsLoaded: false, categoriesLoaded: false};
    }
    componentDidMount() {
        Intervals.onLoaded(() => {
            console.log('Intervals loaded');
            this.setState({intervalsLoaded: true});
        });
        Categories.onLoaded(() => {
            console.log('Categories loaded');
            this.setState({categoriesLoaded: true});
        });
    }
    render() {
        return (
            <StyleProvider style={getTheme(platform)}>
                <SafeAreaProvider>
                    <Root>
                        {this.state.intervalsLoaded &&
                        this.state.categoriesLoaded ? (
                            <NavigationContainer>
                                <AppNavigator />
                            </NavigationContainer>
                        ) : (
                            <ActivityIndicator />
                        )}
                    </Root>
                </SafeAreaProvider>
            </StyleProvider>
        );
    }
}
export default App;
