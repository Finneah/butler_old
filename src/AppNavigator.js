import React, {Component} from 'react';

import OverviewScreen from './screens/OverviewScreen';
import CreateEditEntryScreen from './screens/CreateEditEntryScreen';
import {createStackNavigator} from '@react-navigation/stack';

import CategoriesScreen from './screens/CategoriesScreen';

const Stack = createStackNavigator();
function Entrys(params) {
    return (
        <Stack.Navigator headerMode="none">
            <Stack.Screen
                name="CreateEditEntry"
                component={CreateEditEntryScreen}
            />
            <Stack.Screen name="Categories" component={CategoriesScreen} />
        </Stack.Navigator>
    );
}
class AppNavigator extends Component {
    render() {
        return (
            <Stack.Navigator headerMode="none">
                <Stack.Screen name="Overview" component={OverviewScreen} />
                <Stack.Screen name="Entrys" component={Entrys} />
            </Stack.Navigator>
        );
    }
}

export default AppNavigator;
