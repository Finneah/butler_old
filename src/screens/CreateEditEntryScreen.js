import React, {Component} from 'react';
import {
    ActionSheet,
    Body,
    Button,
    Card,
    CardItem,
    Container,
    Content,
    Fab,
    Header,
    Icon,
    Input,
    Item,
    Label,
    Left,
    ListItem,
    Right,
    Switch,
    Text,
    Title
} from 'native-base';

import {
    ActivityIndicator,
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import ButlerIcon from '../components/Icons/ButlerIcon';
import {ProgressCircle} from 'react-native-svg-charts';
import {Queryable} from 'vasern/vasern/src/core';
import * as moment from 'moment';
import {strings} from '../i18n';
import Helper from '../Helper';
import DateTimePicker from '@react-native-community/datetimepicker';
import GlobalColors from '../style/GlobalColors';
import {Intervals, Entrys, MainEntrys} from '../database';
import intervalJSON from '../database/intervals.json';
const intervalQueryObj = new Queryable(Intervals.data());
let helper = new Helper();

class CreateEditEntryScreen extends Component {
    constructor() {
        super();
        this.state = {
            showTillDatePicker: false,
            disabled: false,
            descriptionIsValid: false,
            amountIsValid: false,
            intervals: undefined,
            categories: undefined,
            entry: {},
            options: []
        };
    }

    componentDidMount() {
        try {
            Intervals.onLoaded(() => {
                this._createIntervalsIfNotExist();
                this.setState({intervals: Intervals.data()});
            });

            Intervals.onChange(() => {
                this.setState({intervals: Intervals.data()});
            });

            var {params} = this.props.route;

            if (params && params.entry) {
                this.setState({entry: params.entry});
                this._checkEntry();
            }

            var options = [
                {
                    title: strings('DESCRIPTION'),
                    input: true,
                    returnKeyType: 'next'
                },
                {
                    title: strings('AMOUNT_TITLE'),
                    input: true,
                    keyboardType:
                        Platform.OS == 'ios' ? 'decimal-pad' : 'decimal-pad',
                    returnKeyType: 'done'
                },
                {
                    title: strings('CATEGORIE'),
                    nav: 'Categories'
                },
                {title: strings('INTERVAL')},
                {title: strings('FROM')},
                {title: strings('TILL')}
            ];

            this.setState({options});
        } catch (error) {
            console.warn('componentDidMount', error);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        try {
            if (prevProps.route.params != this.props.route.params) {
                if (
                    this.props.route.params &&
                    this.props.route.params.categorie
                ) {
                    this._checkEntry();

                    if (
                        this.state.entry.categorie !=
                        this.props.route.params.categorie
                    ) {
                        this.setState((prevState) => ({
                            entry: {
                                ...prevState.entry,
                                categorie: this.props.route.params.categorie
                            }
                        }));
                    }
                }
            }
            if (prevState.entry != this.state.entry) {
                if (!this.state.entry.periodFrom) {
                    this.setState((prevState) => ({
                        entry: {
                            ...prevState.entry,
                            periodFrom: new Date()
                        }
                    }));
                }
                this._checkEntry();
            }
        } catch (error) {
            console.warn('componentDidUpdate', error);
        }
    }

    _createIntervalsIfNotExist() {
        try {
            if (intervalJSON) {
                if (Intervals.data().length == 0) {
                    Intervals.insert(intervalJSON, true);
                    console.log('insert all');
                } else if (intervalJSON.length != Intervals.data().length) {
                    console.log(
                        'else if',
                        intervalJSON.length,
                        Interval.data().length
                    );
                } else {
                    console.log('all in');
                }
            }
        } catch (error) {
            console.warn('_createIntervalsIfNotExist', error);
        }
    }

    _check_Description() {
        try {
            var valid =
                !helper.isEmpty(this.state.entry) ||
                (this.state.entry.description != undefined &&
                    this.state.entry.description.length > 3);

            this.setState({
                descriptionIsValid: valid
            });
        } catch (error) {
            console.warn('_check_Description', error);
        }
    }

    _check_Amount() {
        try {
            this.setState({
                amountIsValid:
                    helper.isEmpty(this.state.entry) ||
                    this.state.entry.amount == '' ||
                    this.state.entry.amount == undefined ||
                    !helper._checkValidFloatRegEx(this.state.entry.amount)
            });
        } catch (error) {
            console.warn('_check_Amount', error);
        }
    }

    _createNewEntry() {
        this._insertMainEntry();
    }

    _insertMainEntry() {
        try {
            var {entry} = this.state;
            var mainEntry = {
                amount: entry.amount,
                categorie: entry.categorie,
                interval: entry.interval,
                description: entry.description,
                periodFrom: entry.periodFrom,
                periodTill: entry.periodTill ? entry.periodTill : ''
            };

            var createdMainEntry = MainEntrys.insert(mainEntry)[0];

            this._createEntrys(createdMainEntry, mainEntry.interval);
        } catch (error) {
            console.warn('_insertMainEntry', error);
        }
    }

    _createEntrys(mainEntry, interval) {
        Date.prototype.addMonths = function (months) {
            var date = new Date(this.valueOf());
            date.setMonth(date.getMonth() + months);
            return date;
        };

        function getDates(startDate, stopDate, interval) {
            var dateArray = new Array();
            var currentDate = startDate;
            if (interval == 0) {
                const newEntry = {
                    month: parseInt(startDate.getMonth() + 1),
                    year: parseInt(startDate.getFullYear()),
                    mainEntry: mainEntry
                };
                dateArray.push(newEntry);

                return dateArray;
            }

            while (currentDate <= stopDate) {
                const newEntry = {
                    month: new Date(currentDate).getMonth() + 1,
                    year: new Date(currentDate).getFullYear(),
                    mainEntry: mainEntry
                };
                dateArray.push(newEntry);

                currentDate = currentDate.addMonths(interval);
            }
            return dateArray;
        }

        try {
            var newDate = new Date(mainEntry.periodFrom);
            var periodFrom = new Date(mainEntry.periodFrom);
            var periodTill =
                mainEntry.periodTill && mainEntry.periodTill != ''
                    ? new Date(mainEntry.periodTill)
                    : new Date(newDate.setMonth(newDate.getMonth() + 11));

            var entrys = getDates(
                periodFrom,
                periodTill,
                parseInt(interval.key)
            );
            console.log('_createEntrys', entrys);
            Entrys.insert(entrys, true);
            this.props.navigation.goBack();
        } catch (error) {
            console.warn('_createEntrys', error);
        }
    }

    _checkEntry() {
        var {entry} = this.state;
        try {
            this._check_Amount();
            this._check_Description();
            if (
                entry &&
                entry.description &&
                entry.description.length >= 3 &&
                entry.amount &&
                entry.amount != '' &&
                helper._checkValidFloatRegEx(entry.amount) &&
                entry.categorie &&
                entry.interval &&
                entry.periodFrom
            ) {
                this.setState({disabled: false});
            } else {
                this.setState({disabled: true});
            }
        } catch (error) {
            console.warn('_checkEntry', error);
        }
    }

    _renderItem(item) {
        try {
            const {entry, options} = this.state;

            switch (item.title) {
                case strings('DESCRIPTION'):
                    return (
                        <ListItem>
                            <Left>
                                <Text>{item.title}</Text>
                            </Left>
                            <Body>
                                <Item>
                                    <Input
                                        onChangeText={(text) => {
                                            this.setState((prevState) => ({
                                                entry: {
                                                    ...prevState.entry,
                                                    description: text
                                                }
                                            }));
                                        }}
                                        value={entry.description}
                                        returnKeyType={item.returnKeyType}
                                        keyboardType={item.keyboardType}
                                    />
                                </Item>

                                {!entry.description ||
                                entry.description.length < 3 ? (
                                    <Text note warning>
                                        {strings('MISSING_INFORMATION')}
                                    </Text>
                                ) : null}
                            </Body>
                        </ListItem>
                    );
                case strings('AMOUNT_TITLE'):
                    return (
                        <ListItem>
                            <Left>
                                <Text>{item.title}</Text>
                            </Left>
                            <Body>
                                <Item>
                                    <Input
                                        onChangeText={(text) => {
                                            this.setState((prevState) => ({
                                                entry: {
                                                    ...prevState.entry,
                                                    amount: text
                                                }
                                            }));
                                        }}
                                        value={entry.amount}
                                        returnKeyType={item.returnKeyType}
                                        keyboardType={item.keyboardType}
                                    />
                                </Item>
                                {!entry.amount || entry.amount == '' ? (
                                    <Text note warning>
                                        {strings('MISSING_INFORMATION')}
                                    </Text>
                                ) : !helper._checkValidFloatRegEx(
                                      entry.amount
                                  ) ? (
                                    <Text note warning>
                                        {strings('INVALID_AMOUNT')}
                                    </Text>
                                ) : null}
                            </Body>
                        </ListItem>
                    );
                case strings('CATEGORIE'):
                    return (
                        <ListItem
                            icon
                            onPress={() => {
                                this.props.navigation.navigate('Categories', {
                                    entry: entry
                                });
                            }}
                        >
                            <Body>
                                <Text>{item.title}</Text>
                            </Body>

                            <Right>
                                {entry.categorie ? (
                                    <Text note>{entry.categorie.name}</Text>
                                ) : null}
                                <Icon name="chevron-forward" />
                            </Right>
                        </ListItem>
                    );
                case strings('INTERVAL'):
                    var BUTTONS = [];

                    var intervals = this.state.intervals;
                    intervals.forEach((interval) => {
                        BUTTONS.push(interval.name);
                    });
                    BUTTONS.push('Cancel');

                    return (
                        <ListItem
                            icon
                            onPress={() => {
                                ActionSheet.show(
                                    {
                                        options: BUTTONS,

                                        cancelButtonIndex: BUTTONS.length - 1,
                                        title: 'Choose Interval'
                                    },
                                    (buttonIndex) => {
                                        if (buttonIndex != BUTTONS.length - 1) {
                                            this.setState((prevState) => ({
                                                entry: {
                                                    ...prevState.entry,
                                                    interval:
                                                        intervals[buttonIndex]
                                                }
                                            }));
                                        }
                                    }
                                );
                            }}
                        >
                            <Body>
                                <Text>{item.title}</Text>
                            </Body>

                            <Right>
                                {entry.interval ? (
                                    <Text note>{entry.interval.name}</Text>
                                ) : null}
                                <Icon name="chevron-forward" />
                            </Right>
                        </ListItem>
                    );
                case strings('FROM'):
                    return (
                        <ListItem>
                            <Left>
                                <Text>{item.title}</Text>
                            </Left>
                            <Body>
                                <DateTimePicker
                                    style={{
                                        width: 110
                                    }}
                                    testID="dateTimePicker"
                                    locale={'de-DE'}
                                    value={
                                        entry.periodFrom
                                            ? entry.periodFrom
                                            : new Date()
                                    }
                                    mode={'date'}
                                    is24Hour={true}
                                    display="default"
                                    onChange={(event, date) => {
                                        this.setState((prevState) => {
                                            let entry = Object.assign(
                                                {},
                                                prevState.entry
                                            );
                                            entry.periodFrom = date;
                                            return {entry};
                                        });
                                    }}
                                />
                            </Body>
                            <Right>
                                <Icon name="chevron-forward" />
                            </Right>
                        </ListItem>
                    );
                case strings('TILL'):
                    return (
                        <ListItem
                            onPress={() => {
                                this.setState({
                                    showTillDatePicker: !this.state
                                        .showTillDatePicker
                                });
                            }}
                        >
                            <Left>
                                <Text>{item.title}</Text>
                            </Left>
                            <Body>
                                {this.state.showTillDatePicker ? (
                                    <DateTimePicker
                                        style={{width: 110}}
                                        testID="dateTimePicker"
                                        locale={'de-DE'}
                                        value={
                                            entry.periodTill
                                                ? entry.periodTill
                                                : new Date()
                                        }
                                        mode={'date'}
                                        is24Hour={true}
                                        display="default"
                                        onChange={(event, date) => {
                                            this.setState(
                                                (prevState, props) => ({
                                                    entry: {
                                                        ...prevState.entry,
                                                        periodTill: date
                                                    }
                                                })
                                            );
                                        }}
                                    />
                                ) : null}
                            </Body>
                            <Right>
                                <Switch
                                    value={this.state.showTillDatePicker}
                                    onValueChange={() => {
                                        this.setState({
                                            showTillDatePicker: !this.state
                                                .showTillDatePicker
                                        });
                                    }}
                                />
                            </Right>
                        </ListItem>
                    );
                default:
                    return null;
            }
        } catch (error) {
            console.warn('_renderItem', error);
            return null;
        }
    }

    render() {
        const {options, entry, descriptionIsValid} = this.state;

        return (
            <Container>
                <Header>
                    <Left>
                        <Button
                            primary
                            transparent
                            onPress={() => {
                                this.props.navigation.goBack();
                            }}
                        >
                            <Icon name="chevron-back" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>{strings('CREATE_ENTRY')}</Title>
                    </Body>
                    <Right>
                        <Button
                            secondary
                            disabled={this.state.disabled}
                            transparent
                            onPress={() => {
                                this._createNewEntry();
                            }}
                        >
                            <Icon name="save" />
                        </Button>
                    </Right>
                </Header>

                <FlatList
                    data={options}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={true}
                    renderItem={({item}) => this._renderItem(item)}
                />
            </Container>
        );
    }
}
export default CreateEditEntryScreen;
const styles = StyleSheet.create({
    mainTitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    mainTitleText: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    container: {flex: 1, padding: 20, paddingTop: 30},
    dateTimeContainer: {
        zIndex: 1,
        height: 100,
        width: '100%'
    },
    wrapper: {flexDirection: 'row', margin: 10},
    titleCol: {flex: 1},
    titleText: {fontSize: 18, fontWeight: 'bold'},
    row: {height: 28},
    text: {textAlign: 'center'}
});
