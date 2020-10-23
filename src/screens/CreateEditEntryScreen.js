import React, {Component} from 'react';
import {
    ActionSheet,
    Body,
    Button,
    Container,
    Header,
    Icon,
    Input,
    Item,
    Left,
    ListItem,
    Right,
    Switch,
    Text,
    Title,
    Toast
} from 'native-base';

import {Alert, FlatList, Platform} from 'react-native';

import {strings} from '../i18n';
import Helper from '../Helper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Intervals, Entrys, MainEntrys} from '../database';
import Queryable from 'vasern/vasern/src/core/vasern-queryable';
import Error_Handler from '../Error_Handler';
import ChooseUpdateModal from '../components/ChooseUpdateModal';
let helper = new Helper();
let error_handler = new Error_Handler();
class CreateEditEntryScreen extends Component {
    constructor() {
        super();
        this.state = {
            showTillDatePicker: false,
            showModalChooseUpdate: false,
            disabled: false,
            descriptionIsValid: false,
            amountIsValid: false,
            intervals: undefined,
            categories: undefined,
            entry: {},
            options: [],
            updateMainEntryArray: [],
            isTest: false
        };
    }

    componentDidMount() {
        try {
            var {params} = this.props.route;

            if (params && params.entry) {
                this.setState({entry: params.entry});
                if (params.entry.periodTill) {
                    this.setState({showTillDatePicker: true});
                }
                this._checkEntry();
            }

            var options = [
                {
                    title: strings('Description'),
                    input: true,
                    returnKeyType: 'next'
                },
                {
                    title: strings('AmountTitle'),
                    input: true,
                    keyboardType:
                        Platform.OS == 'ios' ? 'decimal-pad' : 'decimal-pad',
                    returnKeyType: 'done'
                },
                {
                    title: strings('Categorie'),
                    nav: 'Categories'
                },
                {title: strings('Interval')},
                {title: strings('From')},
                {title: strings('Till')}
            ];

            this.setState({options, intervals: Intervals.data()});
        } catch (error) {
            error_handler._handleError('componentDidMount', error);
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
            error_handler._handleError('componentDidUpdate', error);
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
            error_handler._handleError('_check_Description', error);
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
            error_handler._handleError('_check_Amount', error);
        }
    }

    async _insertOrUpdateEntry() {
        try {
            var {entry} = this.state;

            if (entry.id) {
                await this._updateMainEntrysAndEntrys();
            } else {
                await this._insertMainEntry((goBack = true));
            }
        } catch (error) {
            error_handler._handleError('_insertOrUpdateEntry', error);
        }
    }

    async _updateAllEntrys(mainEntry, id) {
        try {
            if (!this.state.isTest) {
                var newMainEntry = MainEntrys.update(
                    {id: id},
                    {
                        amount: mainEntry.amount,
                        categorie: mainEntry.categorie,
                        description: mainEntry.description,
                        interval: mainEntry.interval,
                        periodFrom: mainEntry.periodFrom,
                        periodTill: mainEntry.periodTill
                    },
                    true
                );

                await this._deleteEntrys(newMainEntry.id);

                await this._createEntrys(newMainEntry, newMainEntry.interval);
            }
        } catch (error) {
            error_handler._handleError('_updateAllEntrys', error);
        }
    }

    async _updateMainEntrysAndEntrys() {
        try {
            var {entry} = this.state;
            let mainEntryQueryObj = new Queryable(MainEntrys.data());
            var oldMainEntry = mainEntryQueryObj.get({id: entry.id});
            var updatedMainEntry = {
                amount: entry.amount,
                categorie: entry.categorie,
                interval: entry.interval,
                description: entry.description,
                periodFrom: entry.periodFrom,
                periodTill: entry.periodTill ? entry.periodTill : ''
            };

            if (typeof oldMainEntry.periodFrom == 'string') {
                oldMainEntry.periodFrom = new Date(oldMainEntry.periodFrom);
            }
            if (typeof oldMainEntry.periodTill == 'string') {
                oldMainEntry.periodTill = new Date(oldMainEntry.periodTill);
            }
            var expression =
                updatedMainEntry.periodFrom < oldMainEntry.periodFrom &&
                updatedMainEntry.periodTill > oldMainEntry.periodTill;
            var expression1 =
                updatedMainEntry.periodFrom < oldMainEntry.periodFrom &&
                updatedMainEntry.periodTill == oldMainEntry.periodTill;

            var expression2 =
                updatedMainEntry.periodFrom == oldMainEntry.periodFrom &&
                updatedMainEntry.periodTill == oldMainEntry.periodTill;
            var expression3 =
                updatedMainEntry.periodFrom == oldMainEntry.periodFrom &&
                updatedMainEntry.periodTill > oldMainEntry.periodTill;

            if (expression || expression1 || expression2 || expression3) {
                // change all

                this._updateAllEntrys(updatedMainEntry, oldMainEntry.id);
                this.props.navigation.goBack();
            } else {
                this._createUpdateEntryArray(updatedMainEntry, oldMainEntry);
            }
        } catch (error) {
            error_handler._handleError('_updateMainEntrysAndEntrys', error);
        }
    }

    _createUpdateEntryArray(updatedMainEntry, oldMainEntry) {
        try {
            if (
                updatedMainEntry.periodFrom > oldMainEntry.periodFrom &&
                updatedMainEntry.periodTill < oldMainEntry.periodTill
            ) {
                var updateMainEntryArray = [];

                updateMainEntryArray.push({
                    ...oldMainEntry,
                    id: undefined,
                    periodFrom: oldMainEntry.periodFrom,
                    periodTill: new Date(
                        new Date(updatedMainEntry.periodFrom).setMonth(
                            updatedMainEntry.periodFrom.getMonth() - 1
                        )
                    ),
                    deletable: true,
                    deleteIsActive: false,
                    takeIsActive: true
                });

                updateMainEntryArray.push({
                    ...updatedMainEntry,
                    id: oldMainEntry.id,
                    periodTill: new Date(
                        new Date(updatedMainEntry.periodTill).setMonth(
                            updatedMainEntry.periodTill.getMonth()
                        )
                    ),
                    deletable: false
                });

                updateMainEntryArray.push({
                    ...oldMainEntry,
                    id: undefined,
                    periodFrom: new Date(
                        new Date(updatedMainEntry.periodTill).setMonth(
                            updatedMainEntry.periodTill.getMonth() + 1
                        )
                    ),
                    periodTill: oldMainEntry.periodTill,
                    deletable: true,
                    deleteIsActive: false,
                    takeIsActive: true,
                    delete: false
                });
                this.setState({
                    updateMainEntryArray: updateMainEntryArray,
                    showModalChooseUpdate: true
                });
            } else if (
                updatedMainEntry.periodFrom < oldMainEntry.periodFrom &&
                updatedMainEntry.periodTill < oldMainEntry.periodTill
            ) {
                var updateMainEntryArray = [];

                updateMainEntryArray.push({
                    ...updatedMainEntry,
                    id: oldMainEntry.id,
                    deletable: false
                });

                updateMainEntryArray.push({
                    ...oldMainEntry,
                    id: undefined,
                    periodFrom: new Date(
                        new Date(updatedMainEntry.periodTill).setMonth(
                            updatedMainEntry.periodTill.getMonth() + 1
                        )
                    ),
                    periodTill: oldMainEntry.periodTill,
                    deletable: true,

                    deleteIsActive: false,
                    takeIsActive: true
                });
                this.setState({
                    updateMainEntryArray: updateMainEntryArray,
                    showModalChooseUpdate: true
                });
            } else if (
                updatedMainEntry.periodFrom > oldMainEntry.periodFrom &&
                updatedMainEntry.periodTill == oldMainEntry.periodTill
            ) {
                var updateMainEntryArray = [];

                updateMainEntryArray.push({
                    ...oldMainEntry,
                    id: undefined,
                    periodFrom: oldMainEntry.periodFrom,
                    periodTill: new Date(
                        new Date(updatedMainEntry.periodFrom).setMonth(
                            updatedMainEntry.periodFrom.getMonth() - 1
                        )
                    ),
                    deletable: true,

                    deleteIsActive: false,
                    takeIsActive: true
                });

                updateMainEntryArray.push({
                    ...updatedMainEntry,
                    id: oldMainEntry.id,
                    deletable: false
                });

                this.setState({
                    updateMainEntryArray: updateMainEntryArray,
                    showModalChooseUpdate: true
                });
            } else if (
                updatedMainEntry.periodFrom == oldMainEntry.periodFrom &&
                updatedMainEntry.periodTill < oldMainEntry.periodTill
            ) {
                var updateMainEntryArray = [];
                updateMainEntryArray.push({
                    ...updatedMainEntry,
                    id: oldMainEntry.id,
                    deletable: false
                });

                updateMainEntryArray.push({
                    ...oldMainEntry,
                    id: undefined,
                    periodFrom: new Date(
                        new Date(updatedMainEntry.periodTill).setMonth(
                            new Date(updatedMainEntry.periodTill).getMonth() + 1
                        )
                    ),
                    periodTill: oldMainEntry.periodTill,
                    deletable: true,

                    deleteIsActive: false,
                    takeIsActive: true
                });

                this.setState({
                    updateMainEntryArray: updateMainEntryArray,
                    showModalChooseUpdate: true
                });
            } else {
                console.log('_createUpdateEntryArray', 'oops');
                console.log(updatedMainEntry, oldMainEntry);
            }
        } catch (error) {
            error_handler._handleError('_createUpdateEntryArray', error);
        }
    }

    async _insertAndUpdateSubmittedEntrys() {
        try {
            const {updateMainEntryArray} = this.state;

            for (let i = 0; i < updateMainEntryArray.length; i++) {
                const newMainEntry = updateMainEntryArray[i];
                if (newMainEntry.id) {
                    // update
                    await this._updateAllEntrys(newMainEntry, newMainEntry.id);
                } else {
                    if (newMainEntry.takeIsActive) {
                        // erstellen
                        await this._insertMainEntry(newMainEntry);
                    }
                }
            }

            this.setState({
                showModalChooseUpdate: false
            });
        } catch (error) {
            error_handler._handleError(
                '_insertAndUpdateSubmittedEntrys',
                error
            );
        }
    }

    async _insertMainEntry(entry, goBack) {
        try {
            if (!entry) {
                entry = this.state.entry;
            }
            if (entry.periodFrom && typeof entry.periodFrom == 'string') {
                entry.periodFrom = new Date(entry.periodFrom);
            }
            if (entry.periodTill && typeof entry.periodTill == 'string') {
                entry.periodTill = new Date(entry.periodTill);
            }
            entry.periodFrom = new Date(entry.periodFrom.toDateString());
            entry.periodTill = new Date(entry.periodTill.toDateString());

            var mainEntry = {
                amount: entry.amount,
                categorie: entry.categorie,
                interval: entry.interval,
                description: entry.description,
                periodFrom: entry.periodFrom,
                periodTill: entry.periodTill ? entry.periodTill : ''
            };

            var createdMainEntry = mainEntry;
            if (!this.state.isTest) {
                createdMainEntry = await MainEntrys.insert(mainEntry)[0];
                await this._createEntrys(
                    createdMainEntry,
                    mainEntry.interval,
                    goBack
                );
            }
        } catch (error) {
            error_handler._handleError('_insertMainEntry', error);
        }
    }

    async _deleteMainEntryAndEntrys() {
        try {
            var id = this.state.entry.id;
            this._deleteEntrys(id);

            MainEntrys.remove({id: this.state.entry.id}, true);
            this.props.navigation.goBack();
        } catch (error) {
            error_handler._handleError('_deleteMainEntryAndEntrys', error);
        }
    }

    _deleteEntrys(id) {
        try {
            let entryQueryObj = new Queryable(Entrys.data());
            Entrys.perform(function (db) {
                entryQueryObj
                    .filter({mainEntry_id: id})
                    .data()
                    .forEach(function (item) {
                        db.remove(item, true);
                    });
            });
        } catch (error) {
            error_handler._handleError('_deleteEntrys', error);
        }
    }

    async _createEntrys(mainEntry, interval, goBack) {
        function addMonths(oldDate, months) {
            try {
                var date = new Date(oldDate);

                date.setMonth(date.getMonth() + months);
                return date;
            } catch (error) {
                error_handler._handleError('addMonths', error);
            }
        }
        function getDates(startDate, stopDate, interval) {
            try {
                var dateArray = [];
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

                    currentDate = addMonths(currentDate, interval);
                }
                return dateArray;
            } catch (error) {
                error_handler._handleError('getDates', error);
            }
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

            if (!this.state.isTest) {
                await Entrys.insert(entrys, true);
                if (goBack) {
                    this.props.navigation.goBack();
                }
            }
        } catch (error) {
            error_handler._handleError('_createEntrys', error);
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
            error_handler._handleError('_checkEntry', error);
        }
    }

    _renderItem(item) {
        try {
            const {entry} = this.state;

            switch (item.title) {
                case strings('Description'):
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
                                        {strings('MissingInformaton')}
                                    </Text>
                                ) : null}
                            </Body>
                        </ListItem>
                    );
                case strings('AmountTitle'):
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
                                        {strings('MissingInformaton')}
                                    </Text>
                                ) : !helper._checkValidFloatRegEx(
                                      entry.amount
                                  ) ? (
                                    <Text note warning>
                                        {strings('InvalidAmount')}
                                    </Text>
                                ) : null}
                            </Body>
                        </ListItem>
                    );
                case strings('Categorie'):
                    return (
                        <ListItem
                            icon
                            onPress={() => {
                                this.props.navigation.navigate('Categories', {
                                    params: {entry: entry}
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
                case strings('Interval'):
                    var BUTTONS = [];

                    var intervals = this.state.intervals;
                    intervals.forEach((interval) => {
                        BUTTONS.push(interval.name);
                    });
                    BUTTONS.push(strings('Cancel'));

                    return (
                        <ListItem
                            icon
                            onPress={() => {
                                ActionSheet.show(
                                    {
                                        options: BUTTONS,

                                        cancelButtonIndex: BUTTONS.length - 1,
                                        title: strings('ChooseInterval')
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
                case strings('From'):
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
                                            ? new Date(entry.periodFrom)
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
                case strings('Till'):
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
                                                ? new Date(entry.periodTill)
                                                : new Date()
                                        }
                                        mode={'date'}
                                        is24Hour={true}
                                        display="default"
                                        onChange={(event, date) => {
                                            this.setState((prevState) => ({
                                                entry: {
                                                    ...prevState.entry,
                                                    periodTill: date
                                                }
                                            }));
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
            error_handler._handleError('_renderItem', error);
            return null;
        }
    }

    render() {
        const {options, entry} = this.state;
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
                        <Title>
                            {entry && entry.id
                                ? strings('EditEntry')
                                : strings('CreateEntry')}
                        </Title>
                    </Body>
                    <Right>
                        <Button
                            secondary
                            disabled={this.state.disabled}
                            transparent
                            onPress={() => {
                                this._insertOrUpdateEntry();
                            }}
                        >
                            <Icon name="save" />
                        </Button>
                    </Right>
                </Header>
                <ChooseUpdateModal
                    showModalChooseUpdate={this.state.showModalChooseUpdate}
                    updateMainEntryArray={this.state.updateMainEntryArray}
                    onSetData={(data) => {
                        this.setState({updateMainEntryArray: data});
                    }}
                    toggleShowChooseUpdateModal={(visible) => {
                        this.setState({
                            showModalChooseUpdate:
                                visible != undefined
                                    ? visible
                                    : !this.state.showModalChooseUpdate
                        });
                    }}
                    onSaveHandler={() => {
                        this._insertAndUpdateSubmittedEntrys();
                        this.props.navigation.goBack();
                    }}
                />
                <FlatList
                    data={options}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={true}
                    renderItem={({item}) => this._renderItem(item)}
                />
                {this.state.entry && this.state.entry.id ? (
                    <Button
                        style={{marginVertical: 20}}
                        warning
                        iconLeft
                        transparent
                        centered
                        onPress={() => {
                            Alert.alert(
                                strings('AskDeleteSerie'),
                                strings('DeleteEntryOrSerie'),
                                [
                                    {
                                        text: strings('Cancel'),
                                        onPress: () =>
                                            console.log('Cancel Pressed'),
                                        style: 'cancel'
                                    },
                                    {
                                        text: strings('DeleteEntry'),
                                        onPress: () => {
                                            Toast.show({
                                                text: strings('IcantDoThatYet'),
                                                buttonText: strings('Ok')
                                            });
                                        },

                                        style: 'default'
                                    },
                                    {
                                        text: strings('DeleteSerie'),
                                        style: 'destructive',
                                        onPress: () =>
                                            this._deleteMainEntryAndEntrys()
                                    }
                                ]
                            );
                        }}
                    >
                        <Icon name="trash"></Icon>
                        <Text>{strings('Delete')}</Text>
                    </Button>
                ) : null}
            </Container>
        );
    }
}
export default CreateEditEntryScreen;
