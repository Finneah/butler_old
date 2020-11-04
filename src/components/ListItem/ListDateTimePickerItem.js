import {
    Body,
    ListItem,
    Right,
    Text,
    Switch,
    Left,
    Item,
    Input,
    Icon
} from 'native-base';
import React, {Component} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
/**
 * This is a description of the ListDateTimePickerItem constructor function.
 * @class ListDateTimePickerItem
 * @classdesc This is a description of the ListDateTimePickerItem class.
 */
class ListDateTimePickerItem extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        return (
            <ListItem>
                <Left>
                    <Text>{this.props.title}</Text>
                </Left>
                <Body>
                    <DateTimePicker
                        style={this.props.style}
                        locale={'de-DE'}
                        value={this.props.value}
                        mode={this.props.mode}
                        is24Hour={true}
                        display={this.props.display}
                        onChange={this.props.onChange}
                    />
                </Body>
                <Right>
                    <Icon name="chevron-forward" />
                </Right>
            </ListItem>
        );
    }
}
export default ListDateTimePickerItem;
