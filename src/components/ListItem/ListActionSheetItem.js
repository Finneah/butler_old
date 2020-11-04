import {Body, ListItem, Right, Text, Icon, ActionSheet} from 'native-base';
import React, {Component} from 'react';

/**
 * This is a description of the ListActionSheetItem constructor function.
 * @class ListActionSheetItem
 * @classdesc This is a description of the ListActionSheetItem class.
 */
class ListActionSheetItem extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        return (
            <ListItem
                icon
                onPress={() => {
                    ActionSheet.show(
                        {
                            options: this.props.BUTTONS,

                            cancelButtonIndex: this.props.BUTTONS.length - 1,
                            title: this.props.acionSheetTitle
                        },
                        (buttonIndex) => {
                            if (buttonIndex != this.props.BUTTONS.length - 1) {
                                this.props.onPress(buttonIndex);
                            }
                        }
                    );
                }}
            >
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
export default ListActionSheetItem;
