import {Body, Button, Card, CardItem, Left, Spinner} from 'native-base';
import React, {Component} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {strings} from '../../i18n';
import GlobalColors from '../../style/GlobalColors';

/**
 * This is a description of the LoadingSpinner constructor function.
 * @class LoadingSpinner
 * @classdesc This is a description of the LoadingSpinner class.
 */
class LoadingSpinner extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        const {showLoadingSpinner, size} = this.props;
        if (showLoadingSpinner === true) {
            return (
                <Card>
                    <CardItem>
                        <Left>
                            <Spinner />
                            <Body>
                                <Text style={styles.loadingText}>
                                    {strings('PLEASE_WAIT')}
                                </Text>
                            </Body>
                        </Left>
                    </CardItem>
                </Card>
            );
        } else {
            return null;
        }
    }
}
const styles = StyleSheet.create({
    loadingspinner: {
        padding: 0,
        flexDirection: 'column',
        alignItems: 'center'
    },
    loadingText: {
        fontWeight: 'bold',
        fontStyle: 'italic',
        textAlign: 'center'
    }
});
export default LoadingSpinner;
