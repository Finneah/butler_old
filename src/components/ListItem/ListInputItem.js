import {
    Body,
    ListItem,
    Right,
    Text,
    Switch,
    Left,
    Item,
    Input
} from 'native-base';
import React, {Component} from 'react';

/**
 * This is a description of the ListInputItem constructor function.
 * @class ListInputItem
 * @classdesc This is a description of the ListInputItem class.
 */
class ListInputItem extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        return (
            <ListItem>
                <Left>
                    <Text>{this.props.title}</Text>
                    {this.props.note ? (
                        <Text note>{this.props.note}</Text>
                    ) : null}
                </Left>
                <Body>
                    <Item>
                        <Input
                            onChangeText={this.props.onChangeText}
                            value={this.props.value}
                            returnKeyType={this.props.returnKeyType}
                            keyboardType={this.props.keyboardType}
                        />
                    </Item>

                    {this.props.error ? (
                        <Text note warning>
                            {this.props.errorMessage}
                        </Text>
                    ) : null}
                </Body>
            </ListItem>
        );
    }
}
export default ListInputItem;
