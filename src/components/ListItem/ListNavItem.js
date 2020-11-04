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

/**
 * This is a description of the ListNavItem constructor function.
 * @class ListNavItem
 * @classdesc This is a description of the ListNavItem class.
 */
class ListNavItem extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        return (
            <ListItem icon onPress={this.props.onPress}>
                <Body>
                    <Text>{this.props.title}</Text>
                </Body>

                <Right>
                    {this.props.rightText ? (
                        <Text note>{this.props.rightText}</Text>
                    ) : null}
                    <Icon name="chevron-forward" />
                </Right>
            </ListItem>
        );
    }
}
export default ListNavItem;
