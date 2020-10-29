import {
    Body,
    Button,
    Card,
    CardItem,
    Container,
    Content,
    Icon,
    Left,
    ListItem,
    Right,
    Segment,
    Text,
    Title
} from 'native-base';
import React, {Component} from 'react';
import {Alert, Dimensions, SafeAreaView, StyleSheet, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {strings} from '../i18n';
import GlobalColors from '../style/GlobalColors';
import Modal from 'react-native-modal-patch';
class ChooseUpdateModal extends Component {
    constructor() {
        super();
        this.state = {
            deleteIsActive: false,
            takeIsActive: true
        };
    }

    componentDidMount() {}

    _getItemTitle(item) {
        item.periodFrom = new Date(item.periodFrom);
        item.periodTill = new Date(item.periodTill);
        var fromMonth = item.periodFrom.getMonth() + 1;
        fromMonth < 10 ? (fromMonth = '0' + fromMonth) : null;
        var tillMonth = item.periodTill.getMonth() + 1;
        tillMonth < 10 ? (tillMonth = '0' + tillMonth) : null;
        var title =
            fromMonth +
            '.' +
            item.periodFrom.getFullYear() +
            ' - ' +
            tillMonth +
            '.' +
            item.periodTill.getFullYear();
        return title;
    }

    _getBackgroundColorForItem(item) {
        if (item.deletable) {
            if (item.deleteIsActive) {
                return GlobalColors.warning;
            }
            return GlobalColors.butler;
        }
        return GlobalColors.accentColor;
    }

    render() {
        const {showModalChooseUpdate, updateMainEntryArray} = this.props;

        return (
            <Modal
                animationType="slide"
                presentationStyle="formSheet" // <-- Swipe down/dismiss works now!
                visible={showModalChooseUpdate ? showModalChooseUpdate : false}
                onDismiss={() => this.props.toggleShowChooseUpdateModal(false)} // <-- This gets called all the time
            >
                <Container>
                    <SafeAreaView style={{flex: 1}}>
                        <FlatList
                            data={updateMainEntryArray}
                            ListHeaderComponent={() => (
                                <Card>
                                    <CardItem firstlast>
                                        <Text>
                                            {
                                                'Was soll mit den bisheringen Einträgen passieren? Ich kann sie löschen oder behalten.'
                                            }
                                        </Text>
                                    </CardItem>
                                </Card>
                            )}
                            renderItem={({item, index}) => (
                                <Card transparent>
                                    <CardItem
                                        header
                                        first
                                        style={{
                                            backgroundColor: this._getBackgroundColorForItem(
                                                item
                                            )
                                        }}
                                    >
                                        <Body>
                                            <Title
                                                light
                                                style={{
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {this._getItemTitle(item)}
                                            </Title>
                                        </Body>
                                    </CardItem>
                                    <ListItem>
                                        <Body>
                                            <Text>{item.description}</Text>
                                        </Body>
                                        <Right>
                                            <Text>
                                                {item.amount +
                                                    ' ' +
                                                    strings('Currency')}
                                            </Text>
                                        </Right>
                                    </ListItem>
                                    <ListItem>
                                        <Body>
                                            <Text>{strings('Categorie')}</Text>
                                        </Body>
                                        <Right>
                                            <Text>
                                                {strings(item.categorie.name)}
                                            </Text>
                                        </Right>
                                    </ListItem>
                                    <ListItem>
                                        <Body>
                                            <Text>{strings('Interval')}</Text>
                                        </Body>
                                        <Right>
                                            <Text>
                                                {strings(item.interval.name)}
                                            </Text>
                                        </Right>
                                    </ListItem>

                                    {item.deletable ? (
                                        <CardItem
                                            footer
                                            last
                                            style={{
                                                backgroundColor:
                                                    GlobalColors.lightGrey
                                            }}
                                        >
                                            <Left>
                                                <Button
                                                    primary
                                                    transparent
                                                    iconLeft
                                                    active={item.deleteIsActive}
                                                    onPress={() => {
                                                        item.deleteIsActive = true;
                                                        item.takeIsActive = false;
                                                        this.props.onSetData(
                                                            updateMainEntryArray
                                                        );
                                                    }}
                                                >
                                                    <Icon
                                                        warning
                                                        style={{
                                                            color:
                                                                GlobalColors.warning
                                                        }}
                                                        name={
                                                            item.deleteIsActive
                                                                ? 'radio-button-on'
                                                                : 'radio-button-off'
                                                        }
                                                    ></Icon>
                                                    <Text>
                                                        {strings('Delete')}
                                                    </Text>
                                                </Button>
                                            </Left>

                                            <Right>
                                                <Button
                                                    primary
                                                    transparent
                                                    active={item.takeIsActive}
                                                    iconRight
                                                    onPress={() => {
                                                        item.deleteIsActive = false;
                                                        item.takeIsActive = true;
                                                        this.props.onSetData(
                                                            updateMainEntryArray
                                                        );
                                                    }}
                                                >
                                                    <Text>
                                                        {strings('Keep')}
                                                    </Text>
                                                    <Icon
                                                        style={{
                                                            color:
                                                                GlobalColors.accentColor
                                                        }}
                                                        success
                                                        name={
                                                            item.takeIsActive
                                                                ? 'radio-button-on'
                                                                : 'radio-button-off'
                                                        }
                                                    ></Icon>
                                                </Button>
                                            </Right>
                                        </CardItem>
                                    ) : (
                                        <CardItem
                                            footer
                                            last
                                            style={{
                                                backgroundColor:
                                                    GlobalColors.lightGrey
                                            }}
                                        >
                                            <Body>
                                                <Text>
                                                    {
                                                        'Diesen Zeitraum werde ich eintragen'
                                                    }
                                                </Text>
                                            </Body>
                                        </CardItem>
                                    )}
                                </Card>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                        />

                        <Button
                            rounded
                            centered
                            secondary
                            onPress={() => {
                                this.props.onSaveHandler();
                            }}
                        >
                            <Text>{'Do it'}</Text>
                        </Button>
                    </SafeAreaView>
                </Container>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center'
    }
});

export default ChooseUpdateModal;
