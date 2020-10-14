import React, {Component} from 'react';
import {Button, Text} from 'native-base';
import {Platform} from 'react-native';

class SecondaryButton extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        const {text, isVisible, transparent, onPress} = this.props;

        if (isVisible !== false) {
            return (
                <Button
                    secondary
                    onPress={onPress}
                    transparent={Platform.OS == 'ios' ? true : false}
                    {...this.props}
                >
                    <Text>{text}</Text>
                </Button>
            );
        }
        return null;
    }
}

export default SecondaryButton;
