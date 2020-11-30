import {Body, ListItem, Right, Text, Switch} from 'native-base';
import React, {Component} from 'react';
import GlobalColors from '../../style/GlobalColors';

/**
 * This is a description of the ListSwitchItem constructor function.
 * @class ListSwitchItem
 * @classdesc This is a description of the ListSwitchItem class.
 */
class ListSwitchItem extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        return (
            <ListItem>
                <Body>
                    <Text>{this.props.title}</Text>
                </Body>
                <Right>
                    <Switch
                        thumbColor={GlobalColors.butler}
                        ios_backgroundColor={GlobalColors.butlerLight}
                        trackColor={{
                            false: GlobalColors.accentColor,
                            true: GlobalColors.accentColor
                        }}
                        value={this.props.value}
                        onValueChange={this.props.onValueChange}
                    />
                </Right>
            </ListItem>
        );
    }
}
export default ListSwitchItem;
