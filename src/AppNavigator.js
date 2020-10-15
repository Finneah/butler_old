import React, {Component} from 'react';

import OverviewScreen from './screens/OverviewScreen';
import CreateEditEntryScreen from './screens/CreateEditEntryScreen';
import {createStackNavigator} from '@react-navigation/stack';

import CategoriesScreen from './screens/CategoriesScreen';
import MonthDetailScreen from './screens/MonthDetailScreen';

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
function Details(params) {
    return (
        <Stack.Navigator headerMode="none">
            <Stack.Screen name="MonthDetail" component={MonthDetailScreen} />
        </Stack.Navigator>
    );
}
class AppNavigator extends Component {
    render() {
        return (
            <Stack.Navigator headerMode="none">
                <Stack.Screen name="Overview" component={OverviewScreen} />
                <Stack.Screen name="Entrys" component={Entrys} />
                <Stack.Screen name="Details" component={Details} />
            </Stack.Navigator>
        );
    }
}

export default AppNavigator;
