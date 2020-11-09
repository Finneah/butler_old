import DateTimePicker from '@react-native-community/datetimepicker';
import * as moment from 'moment';
import {
    Body,
    Button,
    Card,
    CardItem,
    Container,
    Header,
    Icon,
    Left,
    ListItem,
    Right,
    Switch,
    Text,
    Title,
    Toast,
    View
} from 'native-base';
import React, {Component} from 'react';
import {Alert, FlatList} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import _ from 'lodash';
import ChooseUpdateModal from '../components/ChooseUpdateModal';
import ListActionSheetItem from '../components/ListItem/ListActionSheetItem';
import ListDateTimePickerItem from '../components/ListItem/ListDateTimePickerItem';
import ListInputItem from '../components/ListItem/ListInputItem';
import ListNavItem from '../components/ListItem/ListNavItem';
import ListSwitchItem from '../components/ListItem/ListSwitchItem';
import {Intervals, Entrys, MainEntrys} from '../database';
import mainEntryJSON from './../database/mainEntrys.json';
import {CategorieModel} from '../database/Models/CategorieModel';
import {EntryModel} from '../database/Models/EntryModel';
import {IntervalModel} from '../database/Models/IntervalModel';
import {MainEntryModel} from '../database/Models/MainEntryModel';
import Error_Handler from '../Error_Handler';
import Helper from '../Helper';
import {strings} from '../i18n';
import GlobalColors from '../style/GlobalColors';

let entryModel = new EntryModel();
let mainEntryModel = new MainEntryModel();
let helper = new Helper();
let error_handler = new Error_Handler();
class CreateEditEntryScreen extends Component {
    constructor() {
        super();
        this.state = {
            isTest: false,
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
            selectedMonth: undefined,
            selectedYear: undefined
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

            if (helper.isEmpty(params.entry)) {
                var from = new Date();
                from.setMonth(0);
                from.setDate('01');
                var entry = {
                    periodFrom: from
                };
                if (params.selectedMonth && params.selectedYear) {
                    entry = {
                        periodFrom: new Date(
                            params.selectedMonth + '.01.' + params.selectedYear
                        )
                    };

                    this.setState({
                        selectedMonth: params.selectedMonth,
                        selectedYear: params.selectedYear
                    });
                }
                this.setState({
                    entry: entry
                });
            }

            var options = mainEntryModel.viewElements;

            this.setState({
                options,
                intervals: Intervals.data(),
                isLastMonth:
                    params && params.isLastMonth != undefined
                        ? params.isLastMonth
                        : false
            });
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

    _checkPeriods(updatedFrom, updatedTill, oldFrom, oldTill) {
        /**
         * @todo convert periods
         */

        try {
            if (typeof updatedTill == 'string' && updatedTill != '') {
                updatedTill = new Date(updatedTill).getTime();
            } else if (typeof updatedTill == 'object') {
                updatedTill = updatedTill.getTime();
            }

            if (typeof oldFrom == 'string' && oldFrom != '') {
                oldFrom = new Date(oldFrom).getTime();
            } else if (typeof oldFrom == 'object') {
                oldFrom = new Date(oldFrom).getTime();
            }
            if (typeof oldTill == 'string' && oldTill != '') {
                oldTill = new Date(oldTill).getTime();
            } else if (typeof oldTill == 'object') {
                oldTill = new Date(oldTill).getTime();
            }

            if (typeof updatedFrom == 'string' && updatedFrom != '') {
                updatedFrom = new Date(updatedFrom).getTime();
            } else if (typeof updatedFrom == 'object') {
                updatedFrom = updatedFrom.getTime();
            }

            return {updatedFrom, updatedTill, oldFrom, oldTill};
        } catch (error) {
            error_handler._handleError('_checkPeriods', error);
        }
    }

    async _insertOrUpdateEntry() {
        try {
            var {entry} = this.state;

            if (entry.id) {
                await this._updateMainEntrysAndEntrys();
            } else {
                await this._insertMainEntry(undefined, true);
            }
        } catch (error) {
            error_handler._handleError('_insertOrUpdateEntry', error);
        }
    }

    async _insertTestEntrys() {
        try {
            let testEntrys = mainEntryJSON;
            var categorieModel = new CategorieModel();
            var intervalModel = new IntervalModel();
            if (testEntrys) {
                testEntrys.forEach(async (testEntry) => {
                    var categorie = categorieModel.getCategorieByNameAndTyp(
                        testEntry.categorie.name,
                        testEntry.categorie.typ
                    );
                    var interval = intervalModel.getIntervalByKey(
                        testEntry.interval.key
                    );

                    testEntry.categorie = categorie;
                    testEntry.interval = interval;

                    await this._insertMainEntry(testEntry, false);
                });
            }
        } catch (error) {
            error_handler._handleError('_insertOrUpdateEntry', error);
        }
    }

    async _updateAllEntrys(mainEntry, id) {
        try {
            if (!this.state.isTest) {
                var newMainEntry = await MainEntrys.update(
                    {id: id},
                    {
                        amount: mainEntry.amount,
                        categorie: mainEntry.categorie,
                        description: mainEntry.description,
                        interval: mainEntry.interval,
                        fixedCosts:
                            mainEntry.fixedCosts == 'true' ||
                            mainEntry.fixedCosts == true
                                ? 'true'
                                : 'false',
                        periodFrom: mainEntry.periodFrom,
                        periodTill: mainEntry.periodTill,
                        badge: mainEntry.badge ? mainEntry.badge : ''
                    },
                    true
                );
                console.info('updated MainEntry', newMainEntry);

                await this._deleteEntrys(newMainEntry.id);
                await this._createEntrys(newMainEntry, newMainEntry.interval);
            } else {
                console.info(' isTest updated MainEntry', {
                    amount: mainEntry.amount,
                    categorie: mainEntry.categorie,
                    description: mainEntry.description,
                    interval: mainEntry.interval,
                    fixedCosts:
                        mainEntry.fixedCosts == 'true' ||
                        mainEntry.fixedCosts == true
                            ? 'true'
                            : 'false',
                    periodFrom: mainEntry.periodFrom,
                    periodTill: mainEntry.periodTill,
                    badge: mainEntry.badge ? mainEntry.badge : ''
                });
                await this._createEntrys(mainEntry, mainEntry.interval);
            }
        } catch (error) {
            error_handler._handleError('_updateAllEntrys', error);
        }
    }

    async _updateMainEntrysAndEntrys() {
        try {
            var {entry} = this.state;

            var oldMainEntry = mainEntryModel.getMainEntryById(entry.id);
            var updatedMainEntry = {
                ...entry
            };
            updatedMainEntry.periodTill =
                updatedMainEntry.periodTill == undefined
                    ? ''
                    : updatedMainEntry.periodTill;
            oldMainEntry.periodTill =
                oldMainEntry.periodTill == undefined
                    ? ''
                    : oldMainEntry.periodTill;

            var {
                updatedFrom,
                updatedTill,
                oldFrom,
                oldTill
            } = await this._checkPeriods(
                updatedMainEntry.periodFrom,
                updatedMainEntry.periodTill,
                oldMainEntry.periodFrom,
                oldMainEntry.periodTill
            );
            if (this._entryHasChanged(oldMainEntry, updatedMainEntry)) {
                var expression = updatedFrom < oldFrom && updatedTill > oldTill;

                var expression1 =
                    updatedFrom < oldFrom && updatedTill == oldTill;

                var expression2 =
                    updatedFrom == oldFrom && updatedTill == oldTill;

                var expression3 =
                    updatedFrom == oldFrom && updatedTill > oldTill;

                if (expression || expression1 || expression2 || expression3) {
                    // change all
                    /**
                     * @todo Alert
                     *
                     */
                    var {selectedMonth} = this.props.route.params;

                    var m = moment.months('de');

                    Alert.alert(strings('AskUpdateSerie'), '', [
                        {
                            text: strings('Cancel'),
                            onPress: () => {},
                            style: 'cancel'
                        },
                        {
                            text: strings('allEntrys'),
                            onPress: async () => {
                                await this._updateAllEntrys(
                                    updatedMainEntry,
                                    oldMainEntry.id
                                );
                                this.props.navigation.goBack();
                            },

                            style: 'destructive'
                        },
                        {
                            text: strings('thisMonth', {
                                MONTH: m[selectedMonth - 1]
                            }),
                            style: 'default',
                            onPress: async () => {
                                updatedMainEntry.periodFrom = new Date(
                                    new Date(
                                        new Date().setMonth(selectedMonth - 1)
                                    ).toDateString()
                                );
                                updatedMainEntry.periodTill = new Date(
                                    new Date(
                                        new Date().setMonth(selectedMonth - 1)
                                    ).toDateString()
                                );

                                await this._createUpdateEntryArray(
                                    updatedMainEntry,
                                    oldMainEntry
                                );
                            }
                        }
                    ]);
                } else {
                    await this._createUpdateEntryArray(
                        updatedMainEntry,
                        oldMainEntry
                    );
                }
            } else {
                // this.props.navigation.goBack();
                Toast.show({
                    text: strings('nothingChanged'),
                    buttonText: strings('ok')
                });
            }
        } catch (error) {
            error_handler._handleError('_updateMainEntrysAndEntrys', error);
        }
    }

    _entryHasChanged(oldMainEntry, updatedMainEntry) {
        try {
            var oldE = {
                ...oldMainEntry
            };
            oldE.id = undefined;
            var newE = {...updatedMainEntry};
            newE.id = undefined;

            return !_.isEqual(oldE, newE);
        } catch (error) {
            error_handler._handleError('_entryHasChanged', error);
        }
    }

    _createUpdateEntryArray(updatedMainEntry, oldMainEntry) {
        try {
            var {
                updatedFrom,
                updatedTill,
                oldFrom,
                oldTill
            } = this._checkPeriods(
                updatedMainEntry.periodFrom,
                updatedMainEntry.periodTill,
                oldMainEntry.periodFrom,
                oldMainEntry.periodTill
            );

            if (updatedFrom > oldFrom && updatedTill < oldTill) {
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
            } else if (updatedFrom < oldFrom && updatedTill < oldTill) {
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
            } else if (updatedFrom > oldFrom && updatedTill == oldTill) {
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
            } else if (updatedFrom == oldFrom && updatedTill < oldTill) {
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
                console.warn('_createUpdateEntryArray', 'OOPS');
                console.info(updatedMainEntry, oldMainEntry);
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

            if (entry.periodFrom) {
                if (typeof entry.periodFrom == 'string') {
                    entry.periodFrom = new Date(entry.periodFrom);
                    entry.periodFrom = new Date(
                        entry.periodFrom.toDateString()
                    );
                } else {
                    entry.periodFrom = new Date(
                        entry.periodFrom.toDateString()
                    );
                }
            }

            if (entry.periodTill) {
                if (typeof entry.periodTill == 'string') {
                    entry.periodTill = new Date(entry.periodTill);
                    entry.periodTill = new Date(
                        entry.periodTill.toDateString()
                    );
                } else {
                    entry.periodTill = new Date(
                        entry.periodTill.toDateString()
                    );
                }
            }
            var periodTill = new Date(
                new Date(entry.periodFrom).setFullYear(
                    entry.periodFrom.getFullYear() + 10
                )
            );

            var mainEntry = {
                amount: entry.amount,
                categorie: entry.categorie,
                interval: entry.interval,
                description: entry.description,
                fixedCosts:
                    entry.fixedCosts == 'true' || entry.fixedCosts == true
                        ? 'true'
                        : 'false',
                periodFrom: entry.periodFrom,
                periodTill: entry.periodTill ? entry.periodTill : periodTill,
                badge: entry.badge ? entry.badge : ''
            };

            var createdMainEntry = mainEntry;

            if (!this.state.isTest) {
                console.info(' create MainEntry', mainEntry);
                createdMainEntry = await MainEntrys.insert(mainEntry)[0];
            } else {
                console.info('isTest create MainEntry', mainEntry);
                // console.info('TEST JSON');
                // console.info(JSON.stringify(mainEntry));
                // console.info('TEST JSON END');
            }
            await this._createEntrys(
                createdMainEntry,
                mainEntry.interval,
                goBack
            );
        } catch (error) {
            error_handler._handleError('_insertMainEntry', error);
        }
    }

    async _deleteMainEntryAndEntrys() {
        try {
            var id = this.state.entry.id;
            await this._deleteEntrys(id);

            await MainEntrys.remove({id: this.state.entry.id}, true);
            this.props.navigation.goBack();
        } catch (error) {
            error_handler._handleError('_deleteMainEntryAndEntrys', error);
        }
    }

    async _deleteEntrys(id) {
        try {
            await Entrys.perform(function (db) {
                var filteredEntrys = entryModel.filterEntryBy({
                    mainEntry_id: id
                });
                if (filteredEntrys) {
                    filteredEntrys.forEach(function (item) {
                        db.remove(item, true);
                    });
                }
            });
        } catch (error) {
            error_handler._handleError('_deleteEntrys', error);
        }
    }

    _deleteEntry() {
        try {
            var {entry, selectedMonth, selectedYear} = this.state;

            var entryToDelete = entryModel.filterEntryBy({
                mainEntry_id: entry.id,
                month: selectedMonth.toString(),
                year: selectedYear.toString()
            });

            if (entryToDelete) {
                Entrys.remove(
                    {
                        mainEntry_id: entry.id,
                        month: selectedMonth.toString(),
                        year: selectedYear.toString()
                    },
                    true
                );
            }
            this.props.navigation.goBack();
        } catch (error) {
            error_handler._handleError('_deleteEntry', error);
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
                    : new Date(
                          newDate.setMonth(
                              newDate.getMonth() + interval.key == 12 ? 12 : 11
                          )
                      );

            var entrys = getDates(
                periodFrom,
                periodTill,
                parseInt(interval.key)
            );

            if (!this.state.isTest) {
                console.info('create Entrys', entrys);
                await Entrys.insert(entrys, true);
                if (goBack) {
                    this.props.navigation.goBack();
                }
            } else {
                console.info('isTest create Entrys', entrys);
            }
        } catch (error) {
            error_handler._handleError('_createEntrys', error);
        }
    }

    _renderItem(item) {
        try {
            const {entry} = this.state;

            switch (item.type) {
                case 'switch':
                    return this._renderListSwitchItem(item, entry);
                case 'input':
                    return this._renderListInputItem(item, entry);
                case 'nav':
                    return this._renderListNavItem(item, entry);
                case 'actionSheet':
                    return this._renderListActionSheetItem(item, entry);

                case 'datepicker':
                    return this._renderListDatePickerItem(item, entry);
                case 'icons':
                    return (
                        <ListItem icon>
                            <Left>
                                <Text>{item.title}</Text>
                            </Left>
                            <Body
                                style={{
                                    justifyContent: 'space-evenly',
                                    alignContent: 'flex-end',
                                    flexDirection: 'row'
                                }}
                            >
                                <Button
                                    style={{
                                        backgroundColor:
                                            GlobalColors.listBadgeBlue,
                                        borderRadius: 15
                                    }}
                                    onPress={() => {
                                        this.setState((prevState) => ({
                                            entry: {
                                                ...prevState.entry,
                                                badge: 'listBadgeBlue'
                                            }
                                        }));
                                    }}
                                >
                                    {entry.badge == 'listBadgeBlue' ? (
                                        <Icon primary name="checkmark"></Icon>
                                    ) : (
                                        <Icon primary name="add"></Icon>
                                    )}
                                </Button>
                                <Button
                                    style={{
                                        backgroundColor:
                                            GlobalColors.listBadgeRed,

                                        borderRadius: 15
                                    }}
                                    onPress={() => {
                                        this.setState((prevState) => ({
                                            entry: {
                                                ...prevState.entry,
                                                badge: 'listBadgeRed'
                                            }
                                        }));
                                    }}
                                >
                                    {entry.badge == 'listBadgeRed' ? (
                                        <Icon primary name="checkmark"></Icon>
                                    ) : (
                                        <Icon primary name="add"></Icon>
                                    )}
                                </Button>
                                <Button
                                    style={{
                                        backgroundColor:
                                            GlobalColors.listBadgeYellow,

                                        borderRadius: 15
                                    }}
                                    onPress={() => {
                                        this.setState((prevState) => ({
                                            entry: {
                                                ...prevState.entry,
                                                badge: 'listBadgeYellow'
                                            }
                                        }));
                                    }}
                                >
                                    {entry.badge == 'listBadgeYellow' ? (
                                        <Icon primary name="checkmark"></Icon>
                                    ) : (
                                        <Icon primary name="add"></Icon>
                                    )}
                                </Button>
                                <Button
                                    style={{
                                        backgroundColor:
                                            GlobalColors.listBadgeGreen,

                                        borderRadius: 15
                                    }}
                                    onPress={() => {
                                        this.setState((prevState) => ({
                                            entry: {
                                                ...prevState.entry,
                                                badge: 'listBadgeGreen'
                                            }
                                        }));
                                    }}
                                >
                                    {entry.badge == 'listBadgeGreen' ? (
                                        <Icon primary name="checkmark"></Icon>
                                    ) : (
                                        <Icon primary name="add"></Icon>
                                    )}
                                </Button>
                            </Body>
                            <Right>
                                <Button
                                    transparent
                                    style={{
                                        borderRadius: 15
                                    }}
                                    onPress={() => {
                                        this.setState((prevState) => ({
                                            entry: {
                                                ...prevState.entry,
                                                badge: 'listBadgeGreen'
                                            }
                                        }));
                                    }}
                                >
                                    <Icon
                                        onPress={() => {
                                            this.setState((prevState) => ({
                                                entry: {
                                                    ...prevState.entry,
                                                    badge: undefined
                                                }
                                            }));
                                        }}
                                        style={{color: GlobalColors.warning}}
                                        warning
                                        name="trash"
                                    ></Icon>
                                </Button>
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

    _renderListInputItem(item, entry) {
        var onChangeText = () => {};
        var error = false;
        var value = '';
        var errorMessage = strings('MissingInformaton');
        var note = undefined;
        try {
            if (item.title == strings('description')) {
                onChangeText = (text) => {
                    this.setState((prevState) => ({
                        entry: {
                            ...prevState.entry,
                            description: text
                        }
                    }));
                };
                error =
                    !entry.description || entry.description.length < 3
                        ? true
                        : false;
                value = entry.description;
            } else {
                onChangeText = (text) => {
                    this.setState((prevState) => ({
                        entry: {
                            ...prevState.entry,
                            amount: text
                        }
                    }));
                };

                error =
                    !entry.amount || entry.amount == ''
                        ? true
                        : !helper._checkValidFloatRegEx(entry.amount)
                        ? true
                        : false;
                value = entry.amount;
                errorMessage =
                    !entry.amount || entry.amount == ''
                        ? strings('MissingInformaton')
                        : !helper._checkValidFloatRegEx(entry.amount)
                        ? strings('InvalidAmount')
                        : null;
                note = ' (' + strings('currency') + ')';
            }
            return (
                <ListInputItem
                    title={item.title}
                    note={note}
                    onChangeText={onChangeText.bind(this)}
                    value={value}
                    returnKeyType={item.returnKeyType}
                    keyboardType={item.keyboardType}
                    error={error}
                    errorMessage={errorMessage}
                />
            );
        } catch (error) {
            error_handler._handleError('_renderListInputItem', error);
        }
    }

    _renderListSwitchItem(item, entry) {
        var onValueChange = (val) => {};
        var value = '';
        var title = '';
        try {
            if (item.title == strings('fixedCosts')) {
                onValueChange = (val) => {
                    this.setState((prevState) => ({
                        entry: {
                            ...prevState.entry,
                            fixedCosts: val
                        }
                    }));
                };
                value =
                    entry.fixedCosts == 'true' || entry.fixedCosts == true
                        ? true
                        : false;
                title = strings('fixedCosts');
            }
            return (
                <ListSwitchItem
                    title={title}
                    value={value}
                    onValueChange={onValueChange.bind(this)}
                />
            );
        } catch (error) {
            error_handler._handleError('_renderListSwitchItem', error);
        }
    }

    _renderListNavItem(item, entry) {
        var nav = undefined;
        var onPress = () => {};
        var rightText = false;
        try {
            if (item.title == strings('categorie')) {
                nav = 'Categories';
                onPress = () => {
                    this.props.navigation.navigate(nav, {
                        params: {entry: entry}
                    });
                };
                rightText = entry.categorie
                    ? strings(entry.categorie.name)
                    : undefined;
            }
            return (
                <ListNavItem
                    title={item.title}
                    onPress={onPress.bind(this)}
                    rightText={rightText}
                />
            );
        } catch (error) {
            error_handler._handleError('_renderListNavItem', error);
        }
    }

    _renderListActionSheetItem(item, entry) {
        var title = '';
        var BUTTONS = [];
        var onPress = (buttonIndex) => {};
        var rightText = false;
        try {
            if (item.title == strings('interval')) {
                var intervals = this.state.intervals;
                if (intervals) {
                    intervals.forEach((interval) => {
                        BUTTONS.push(strings(interval.name));
                    });
                }

                title = item.title;
                onPress = (buttonIndex) => {
                    this.setState((prevState) => ({
                        entry: {
                            ...prevState.entry,
                            interval: intervals[buttonIndex]
                        }
                    }));
                };
                rightText = entry.interval
                    ? strings(entry.interval.name)
                    : undefined;
            }
            BUTTONS.push(strings('Cancel'));

            return (
                <ListActionSheetItem
                    title={title}
                    BUTTONS={BUTTONS}
                    actionSheetTitle={strings('ChooseInterval')}
                    onPress={onPress.bind(this)}
                    rightText={rightText}
                />
            );
        } catch (error) {
            error_handler._handleError('_renderListActionSheetItem', error);
        }
    }

    _renderListDatePickerItem(item, entry) {
        try {
            if (item.title == strings('periodFrom')) {
                return (
                    <ListDateTimePickerItem
                        title={item.title}
                        style={{
                            width: 120
                        }}
                        value={
                            entry.periodFrom
                                ? new Date(entry.periodFrom)
                                : this.state.selectedMonth &&
                                  this.state.selectedYear
                                ? new Date(
                                      this.state.selectedMonth +
                                          '.01.' +
                                          this.state.selectedYear
                                  )
                                : new Date()
                        }
                        mode={'date'}
                        display="default"
                        onChange={(event, date) => {
                            this.setState((prevState) => {
                                let entry = Object.assign({}, prevState.entry);
                                entry.periodFrom = date;
                                return {entry};
                            });
                        }}
                    />
                );
            } else {
                return (
                    <ListItem>
                        <Left>
                            <Text>{item.title}</Text>
                        </Left>
                        <Body>
                            {this.state.showTillDatePicker ? (
                                <DateTimePicker
                                    style={{width: 120}}
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
                                onValueChange={(val) => {
                                    val
                                        ? this.setState((prevState) => ({
                                              showTillDatePicker: !this.state
                                                  .showTillDatePicker,
                                              entry: {
                                                  ...prevState.entry,
                                                  periodTill: new Date()
                                              }
                                          }))
                                        : this.setState({
                                              showTillDatePicker: !this.state
                                                  .showTillDatePicker
                                          });
                                }}
                            />
                        </Right>
                    </ListItem>
                );
            }
        } catch (error) {
            error_handler._handleError('_renderListDatePickerItem', error);
        }
    }

    render() {
        const {options, entry, isLastMonth} = this.state;
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
                            transparent
                            onPress={() => {
                                this._insertTestEntrys();
                            }}
                        >
                            <Icon name="bug" />
                        </Button>
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
                    ListHeaderComponent={() => (
                        <>
                            {isLastMonth ? (
                                <Card>
                                    <CardItem firstlast>
                                        <Body>
                                            <Text note warning>
                                                {
                                                    'Dies ist der letze Monat des Eintrages, möchten Sie verlängern?'
                                                }
                                            </Text>
                                        </Body>
                                    </CardItem>
                                </Card>
                            ) : null}
                        </>
                    )}
                    // ListFooterComponent={() => (
                    //     <>
                    //         <Title>Vorschau</Title>
                    //         <ListItem
                    //             style={{
                    //                 marginLeft: 0,
                    //                 backgroundColor: entry.badge
                    //                     ? GlobalColors[entry.badge]
                    //                     : undefined,
                    //                 borderTopRightRadius: 15,
                    //                 borderBottomRightRadius: 15,
                    //                 marginRight: 10
                    //             }}
                    //             icon
                    //         >
                    //             <Left
                    //                 style={{
                    //                     marginLeft: 0,
                    //                     marginRight: 5,
                    //                     backgroundColor:
                    //                         entry.fixedCosts == 'true' ||
                    //                         entry.fixedCosts == true
                    //                             ? GlobalColors.mainColor
                    //                             : undefined,
                    //                     borderTopRightRadius: 15,
                    //                     borderBottomRightRadius: 15
                    //                 }}
                    //             >
                    //                 <Icon
                    //                     style={{
                    //                         color:
                    //                             entry.fixedCosts ==
                    //                                 'true' ||
                    //                             entry.fixedCosts == true
                    //                                 ? GlobalColors.light
                    //                                 : undefined
                    //                     }}
                    //                     light
                    //                     name={
                    //                         entry.categorie
                    //                             ? entry.categorie.icon
                    //                             : 'car'
                    //                     }
                    //                 ></Icon>
                    //             </Left>
                    //             <Body>
                    //                 <Text>
                    //                     {entry.description
                    //                         ? entry.description
                    //                         : 'Name'}
                    //                 </Text>
                    //             </Body>
                    //             <Right>
                    //                 <Text style={{color: '#333'}}>
                    //                     {entry.amount
                    //                         ? entry.amount +
                    //                           ' ' +
                    //                           strings('Currency')
                    //                         : 50 + strings('Currency')}
                    //                 </Text>
                    //             </Right>
                    //         </ListItem>
                    //     </>
                    // )}
                />
                <SafeAreaView style={{flex: 1}}>
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
                                            onPress: () => {},
                                            style: 'cancel'
                                        },
                                        {
                                            text: strings('DeleteEntry'),
                                            onPress: () => {
                                                this._deleteEntry();
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
                </SafeAreaView>
            </Container>
        );
    }
}
export default CreateEditEntryScreen;
