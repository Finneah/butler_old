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
    Toast
} from 'native-base';
import React, {useState} from 'react';
import {Alert, FlatList, ImageBackground, StyleSheet} from 'react-native';
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
import GlobalStyles from '../style/GlobalStyles';
import background from './../components/bg.png';

let entryModel = new EntryModel();
let mainEntryModel = new MainEntryModel();
let helper = new Helper();
let error_handler = new Error_Handler();
const CreateEditEntryScreen = (props) => {
    const [isTest] = useState(false);
    const [showTillDatePicker, setShowTillDatePicker] = useState(false);
    const [showModalChooseUpdate, setShowModalChooseUpdate] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [intervals, setIntervals] = useState(undefined);
    const [entry, setEntry] = useState({});
    const [options, setOptions] = useState([]);
    const [updateMainEntryArray, setUpdateMainEntryArray] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(undefined);
    const [selectedYear, setSelectedYear] = useState(undefined);
    const [isLastMonth, setIsLastMonth] = useState(undefined);

    const image = background;

    const styles = StyleSheet.create({
        image: {
            flex: 1,
            resizeMode: 'cover',
            justifyContent: 'center'
        }
    });

    React.useEffect(() => {
        try {
            console.log('useEffect 1');
            var {params} = props.route;

            if (params && params.entry) {
                setEntry(params.entry);

                if (params.entry.periodTill) {
                    setShowTillDatePicker(true);
                }
                _checkEntry();
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

                    setSelectedMonth(params.selectedMonth);
                    setSelectedYear(params.selectedYear);
                }
                setEntry(entry);
            }

            var options = mainEntryModel.viewElements;

            setOptions(options);
            setIntervals(Intervals.data());
            setIsLastMonth(
                params && params.isLastMonth != undefined
                    ? params.isLastMonth
                    : false
            );
        } catch (error) {
            error_handler._handleError('componentDidMount', error);
        }
    }, []);

    React.useEffect(() => {
        console.log('useEffect 2');
        if (props.route.params && props.route.params.categorie != undefined) {
            _checkEntry();
            console.log('test', props.route.params.categorie);

            setEntry((prevState) => ({
                entry: {
                    ...prevState.entry,
                    categorie: props.route.params.categorie
                }
            }));
        }
    }, [props.route.params.categorie]);

    React.useEffect(() => {
        console.log('useEffect 3');
        if (entry.periodFrom == undefined) {
            setEntry((prevState) => ({
                entry: {
                    ...prevState.entry,
                    periodFrom: new Date()
                }
            }));
        }
        _checkEntry();
    }, [entry.periodFrom]);

    function _check_Description() {
        try {
            return (
                !helper.isEmpty(entry) ||
                (entry.description != undefined && entry.description.length > 3)
            );
        } catch (error) {
            error_handler._handleError('_check_Description', error);
        }
    }

    function _check_Amount() {
        try {
            return (
                helper.isEmpty(entry) ||
                entry.amount == '' ||
                entry.amount == undefined ||
                !helper._checkValidFloatRegEx(entry.amount)
            );
        } catch (error) {
            error_handler._handleError('_check_Amount', error);
        }
    }

    function _checkEntry() {
        try {
            _check_Amount();
            _check_Description();

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
                setDisabled(false);
            } else {
                setDisabled(true);
            }
        } catch (error) {
            error_handler._handleError('_checkEntry', error);
        }
    }

    function _checkPeriods(updatedFrom, updatedTill, oldFrom, oldTill) {
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

    async function _insertOrUpdateEntry() {
        try {
            if (entry.id) {
                await _updateMainEntrysAndEntrys();
            } else {
                await _insertMainEntry(undefined, true);
            }
        } catch (error) {
            error_handler._handleError('_insertOrUpdateEntry', error);
        }
    }

    async function _insertTestEntrys() {
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

                    await _insertMainEntry(testEntry, false);
                });
            }
        } catch (error) {
            error_handler._handleError('_insertOrUpdateEntry', error);
        }
    }

    async function _updateAllEntrys(mainEntry, id) {
        try {
            if (!isTest) {
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

                await _deleteEntrys(newMainEntry.id);
                await _createEntrys(newMainEntry, newMainEntry.interval);
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
                await _createEntrys(mainEntry, mainEntry.interval);
            }
        } catch (error) {
            error_handler._handleError('_updateAllEntrys', error);
        }
    }

    async function _updateMainEntrysAndEntrys() {
        try {
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
            } = await _checkPeriods(
                updatedMainEntry.periodFrom,
                updatedMainEntry.periodTill,
                oldMainEntry.periodFrom,
                oldMainEntry.periodTill
            );
            if (_entryHasChanged(oldMainEntry, updatedMainEntry)) {
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
                    var {selectedMonth} = props.route.params;

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
                                await _updateAllEntrys(
                                    updatedMainEntry,
                                    oldMainEntry.id
                                );
                                props.navigation.goBack();
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

                                await _createUpdateEntryArray(
                                    updatedMainEntry,
                                    oldMainEntry
                                );
                            }
                        }
                    ]);
                } else {
                    await _createUpdateEntryArray(
                        updatedMainEntry,
                        oldMainEntry
                    );
                }
            } else {
                // props.navigation.goBack();
                Toast.show({
                    text: strings('nothingChanged'),
                    buttonText: strings('ok')
                });
            }
        } catch (error) {
            error_handler._handleError('_updateMainEntrysAndEntrys', error);
        }
    }

    function _entryHasChanged(oldMainEntry, updatedMainEntry) {
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

    function _createUpdateEntryArray(updatedMainEntry, oldMainEntry) {
        try {
            var {updatedFrom, updatedTill, oldFrom, oldTill} = _checkPeriods(
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

                setUpdateMainEntryArray(updateMainEntryArray);
                setShowModalChooseUpdate(true);
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

                setUpdateMainEntryArray(updateMainEntryArray);
                setShowModalChooseUpdate(true);
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

                setUpdateMainEntryArray(updateMainEntryArray);
                setShowModalChooseUpdate(true);
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

                setUpdateMainEntryArray(updateMainEntryArray);
                setShowModalChooseUpdate(true);
            } else {
                console.warn('_createUpdateEntryArray', 'OOPS');
                console.info(updatedMainEntry, oldMainEntry);
            }
        } catch (error) {
            error_handler._handleError('_createUpdateEntryArray', error);
        }
    }

    async function _insertAndUpdateSubmittedEntrys() {
        try {
            for (let i = 0; i < updateMainEntryArray.length; i++) {
                const newMainEntry = updateMainEntryArray[i];
                if (newMainEntry.id) {
                    // update
                    await _updateAllEntrys(newMainEntry, newMainEntry.id);
                } else {
                    if (newMainEntry.takeIsActive) {
                        // erstellen
                        await _insertMainEntry(newMainEntry);
                    }
                }
            }

            setShowModalChooseUpdate(false);
        } catch (error) {
            error_handler._handleError(
                '_insertAndUpdateSubmittedEntrys',
                error
            );
        }
    }

    async function _insertMainEntry(newEntry, goBack) {
        try {
            if (!newEntry) {
                newEntry = entry;
            }

            if (newEntry.periodFrom) {
                if (typeof newEntry.periodFrom == 'string') {
                    newEntry.periodFrom = new Date(newEntry.periodFrom);
                    newEntry.periodFrom = new Date(
                        newEntry.periodFrom.toDateString()
                    );
                } else {
                    newEntry.periodFrom = new Date(
                        newEntry.periodFrom.toDateString()
                    );
                }
            }

            if (newEntry.periodTill) {
                if (typeof newEntry.periodTill == 'string') {
                    newEntry.periodTill = new Date(newEntry.periodTill);
                    newEntry.periodTill = new Date(
                        newEntry.periodTill.toDateString()
                    );
                } else {
                    newEntry.periodTill = new Date(
                        newEntry.periodTill.toDateString()
                    );
                }
            }
            var periodTill = new Date(
                new Date(newEntry.periodFrom).setFullYear(
                    newEntry.periodFrom.getFullYear() + 10
                )
            );

            var mainEntry = {
                amount: newEntry.amount,
                categorie: newEntry.categorie,
                interval: newEntry.interval,
                description: newEntry.description,
                fixedCosts:
                    newEntry.fixedCosts == 'true' || newEntry.fixedCosts == true
                        ? 'true'
                        : 'false',
                periodFrom: entry.periodFrom,
                periodTill: entry.periodTill ? newEntry.periodTill : periodTill,
                badge: newEntry.badge ? newEntry.badge : ''
            };

            var createdMainEntry = mainEntry;

            if (!isTest) {
                console.info(' create MainEntry', mainEntry);
                createdMainEntry = await MainEntrys.insert(mainEntry)[0];
            } else {
                console.info('isTest create MainEntry', mainEntry);
                // console.info('TEST JSON');
                // console.info(JSON.stringify(mainEntry));
                // console.info('TEST JSON END');
            }
            await _createEntrys(createdMainEntry, mainEntry.interval, goBack);
        } catch (error) {
            error_handler._handleError('_insertMainEntry', error);
        }
    }

    async function _deleteMainEntryAndEntrys() {
        try {
            var id = entry.id;
            await _deleteEntrys(id);

            await MainEntrys.remove({id: entry.id}, true);
            props.navigation.goBack();
        } catch (error) {
            error_handler._handleError('_deleteMainEntryAndEntrys', error);
        }
    }

    async function _deleteEntrys(id) {
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

    function _deleteEntry() {
        try {
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
            props.navigation.goBack();
        } catch (error) {
            error_handler._handleError('_deleteEntry', error);
        }
    }

    async function _createEntrys(mainEntry, interval, goBack) {
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

            if (!isTest) {
                console.info('create Entrys', entrys);
                await Entrys.insert(entrys, true);
                if (goBack) {
                    props.navigation.goBack();
                }
            } else {
                console.info('isTest create Entrys', entrys);
            }
        } catch (error) {
            error_handler._handleError('_createEntrys', error);
        }
    }

    function _renderItem(item) {
        try {
            switch (item.type) {
                case 'switch':
                    return _renderListSwitchItem(item);
                case 'input':
                    return _renderListInputItem(item);
                case 'nav':
                    return _renderListNavItem(item);
                case 'actionSheet':
                    return _renderListActionSheetItem(item);

                case 'datepicker':
                    return _renderListDatePickerItem(item);
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
                                        setEntry((prevState) => ({
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
                                        setEntry((prevState) => ({
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
                                        setEntry((prevState) => ({
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
                                        setEntry((prevState) => ({
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
                                        setEntry((prevState) => ({
                                            entry: {
                                                ...prevState.entry,
                                                badge: 'listBadgeGreen'
                                            }
                                        }));
                                    }}
                                >
                                    <Icon
                                        onPress={() => {
                                            setEntry((prevState) => ({
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

    function _renderListInputItem(item) {
        var onChangeText = () => {};
        var error = false;
        var value = '';
        var errorMessage = strings('MissingInformaton');
        var note = undefined;
        try {
            if (item.title == strings('description')) {
                onChangeText = (text) => {
                    setEntry((prevState) => ({
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
                    setEntry((prevState) => ({
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
                    onChangeText={onChangeText}
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

    function _renderListSwitchItem(item) {
        var onValueChange = () => {};
        var value = '';
        var title = '';
        try {
            if (item.title == strings('fixedCosts')) {
                onValueChange = (val) => {
                    setEntry((prevState) => ({
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
                    onValueChange={onValueChange}
                />
            );
        } catch (error) {
            error_handler._handleError('_renderListSwitchItem', error);
        }
    }

    function _renderListNavItem(item) {
        var nav = undefined;
        var onPressNav = () => {};
        var rightText = false;

        try {
            if (item.title == strings('categorie')) {
                nav = 'Categories';

                onPressNav = () => {
                    props.navigation.navigate(nav, {
                        params: {entry: entry}
                    });
                };

                rightText = entry.entry.categorie
                    ? strings(entry.entry.categorie.name)
                    : undefined;
                console.log('test', entry.entry, entry.entry.categorie);
            }

            return (
                <ListNavItem
                    title={item.title}
                    onPress={onPressNav}
                    rightText={rightText}
                />
            );
        } catch (error) {
            error_handler._handleError('_renderListNavItem', error);
        }
    }

    function _renderListActionSheetItem(item) {
        var title = '';
        var BUTTONS = [];
        var onPress = () => {};
        var rightText = false;
        try {
            if (item.title == strings('interval')) {
                if (intervals) {
                    intervals.forEach((interval) => {
                        BUTTONS.push(strings(interval.name));
                    });
                }

                title = item.title;
                onPress = (buttonIndex) => {
                    setEntry((prevState) => ({
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
                    onPress={onPress}
                    rightText={rightText}
                />
            );
        } catch (error) {
            error_handler._handleError('_renderListActionSheetItem', error);
        }
    }

    function _renderListDatePickerItem(item) {
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
                                : selectedMonth && selectedYear
                                ? new Date(
                                      selectedMonth + '.01.' + selectedYear
                                  )
                                : new Date()
                        }
                        mode={'date'}
                        display="default"
                        onChange={(event, date) => {
                            setEntry((prevState) => {
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
                            {showTillDatePicker ? (
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
                                        setEntry((prevState) => ({
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
                                value={showTillDatePicker}
                                onValueChange={(val) => {
                                    if (val) {
                                        setShowTillDatePicker(
                                            !showTillDatePicker
                                        );
                                        setEntry((prevState) => ({
                                            entry: {
                                                ...prevState.entry,
                                                periodTill: new Date()
                                            }
                                        }));
                                    } else {
                                        setShowTillDatePicker(
                                            !showTillDatePicker
                                        );
                                    }
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

    return (
        <Container>
            <ImageBackground source={image} style={styles.image}>
                <Header
                    transparent
                    style={{marginBottom: 10, paddingBottom: 10}}
                >
                    <Left>
                        <Button
                            style={[
                                GlobalStyles.headerLeftButton,
                                {position: 'relative', left: 5}
                            ]}
                            primary
                            transparent
                            onPress={() => {
                                props.navigation.goBack();
                            }}
                        >
                            <Icon name="chevron-back" />
                        </Button>
                    </Left>
                    <Body>
                        <Title light>
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
                                _insertTestEntrys();
                            }}
                        >
                            <Icon name="bug" />
                        </Button>
                        <Button
                            disabled={disabled}
                            large
                            style={[
                                GlobalStyles.headerRightButton,
                                {
                                    position: 'relative',
                                    top: 10,
                                    opacity: disabled ? 1 : 1
                                }
                            ]}
                            rounded
                            onPress={() => {
                                _insertOrUpdateEntry();
                            }}
                        >
                            <Icon
                                style={[
                                    GlobalStyles.headerRightButtonIcon,
                                    {
                                        opacity: disabled ? 0.5 : 1
                                    }
                                ]}
                                name="save"
                            />
                        </Button>
                    </Right>
                </Header>
                <ChooseUpdateModal
                    showModalChooseUpdate={showModalChooseUpdate}
                    updateMainEntryArray={updateMainEntryArray}
                    onSetData={(data) => {
                        setUpdateMainEntryArray(data);
                    }}
                    toggleShowChooseUpdateModal={(visible) => {
                        setShowModalChooseUpdate(
                            visible != undefined
                                ? visible
                                : !showModalChooseUpdate
                        );
                    }}
                    onSaveHandler={() => {
                        _insertAndUpdateSubmittedEntrys();
                        props.navigation.goBack();
                    }}
                />

                <FlatList
                    data={options}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={true}
                    renderItem={({item}) => _renderItem(item)}
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
                    {entry && entry.id ? (
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
                                                _deleteEntry();
                                            },

                                            style: 'default'
                                        },
                                        {
                                            text: strings('DeleteSerie'),
                                            style: 'destructive',
                                            onPress: () =>
                                                _deleteMainEntryAndEntrys()
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
            </ImageBackground>
        </Container>
    );
};

export default CreateEditEntryScreen;
