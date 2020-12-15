import React, {useState} from 'react';
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
    Text,
    Title
} from 'native-base';

import {
    SectionList,
    SafeAreaView,
    StyleSheet,
    ImageBackground
} from 'react-native';
import background from './../components/bg.png';
import {strings} from '../i18n';

import {Entrys} from '../database';

import Error_Handler from '../Error_Handler';

import GlobalColors from '../style/GlobalColors';
import {EntryModel} from '../database/Models/EntryModel';
import GlobalStyles from '../style/GlobalStyles';

let entryModel = new EntryModel();
let error_handler = new Error_Handler();

const MonthDetailScreen = (props) => {
    const [month, setMonth] = useState(undefined);
    const [year, setYear] = useState(undefined);
    const [sections, setSections] = useState(undefined);
    const image = background;

    const styles = StyleSheet.create({
        image: {
            flex: 1,
            resizeMode: 'cover',
            justifyContent: 'center'
        }
    });

    React.useEffect(() => {
        _setState();
        Entrys.onChange(() => {
            console.info('MonthDetailScreen Entrys changed');
            _updateState();
        });
        props.navigation.addListener('willFocus', () => {
            props.navigation.setParams({
                handlePress: _handlePress.bind(this)
            });
        });
    }, []);

    function _setState() {
        try {
            var {params} = props.route;

            if (params && params.month) {
                setMonth(params.month);
                var data = entryModel.filterEntryBy({
                    month: params.month.monthIndex.toString(),
                    year: params.year.toString()
                });

                _addDataToIncomingAndOutgoingData(data);
            }

            if (params && params.year) {
                setYear(params.year);
            }
        } catch (error) {
            error_handler._handleError('_setState', error);
        }
    }

    function _updateState() {
        var data = entryModel.filterEntryBy({
            month: month.monthIndex.toString(),
            year: year.toString()
        });

        _addDataToIncomingAndOutgoingData(data);
    }

    function _handlePress() {
        try {
            props.navigation.navigate('Entrys', {
                screen: 'CreateEditEntry',
                params: {
                    selectedMonth: month.monthIndex,
                    selectedYear: year
                }
            });
        } catch (error) {
            error_handler._handleError('_handlePress', error);
        }
    }

    function _addDataToIncomingAndOutgoingData(data) {
        var sections = [];
        var incomingData = {
            section: {title: strings('Incomings'), complete: 0},
            data: []
        };
        var outgoingData = {
            section: {title: strings('Outgoings'), complete: 0},
            data: []
        };

        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            switch (element.categorie.typ) {
                case 'incoming':
                    incomingData.data.push(element);
                    var amount = element.mainEntry.amount;
                    amount.replace(',', '.');
                    incomingData.section.complete += parseFloat(amount);

                    break;
                case 'outgoing':
                    outgoingData.data.push(element);
                    var amount = element.mainEntry.amount;
                    amount = amount.replace(',', '.');
                    outgoingData.section.complete += parseFloat(amount);
                    break;
                default:
                    break;
            }
        }
        /**
         * Flatlist 1 = incomings
         * List fixed, List notfixed
         * Flatlist 2 = outgoings
         * List fixed, List notfixed
         */
        _sortData(outgoingData);
        _sortData(incomingData);

        sections.push(incomingData);
        sections.push(outgoingData);

        setSections(sections);
    }

    function _sortData(data) {
        var d = [];
        var blueData = [];
        var greenData = [];
        var yellowData = [];
        var redData = [];
        var noBadgeData = [];

        for (let i = 0; i < data.data.length; i++) {
            const element = data.data[i];
            switch (element.mainEntry.badge) {
                case 'listBadgeBlue':
                    blueData.push(element);
                    break;
                case 'listBadgeRed':
                    redData.push(element);
                    break;
                case 'listBadgeYellow':
                    yellowData.push(element);
                    break;
                case 'listBadgeGreen':
                    greenData.push(element);
                    break;
                default:
                    noBadgeData.push(element);
                    break;
            }
        }

        blueData.sort(function (a, b) {
            if (
                parseFloat(a.mainEntry.amount) > parseFloat(b.mainEntry.amount)
            ) {
                return -1;
            } else if (
                parseFloat(a.mainEntry.amount) < parseFloat(b.mainEntry.amount)
            ) {
                return 1;
            }
        });
        redData.sort(function (a, b) {
            if (
                parseFloat(a.mainEntry.amount) > parseFloat(b.mainEntry.amount)
            ) {
                return -1;
            } else if (
                parseFloat(a.mainEntry.amount) < parseFloat(b.mainEntry.amount)
            ) {
                return 1;
            }
        });
        greenData.sort(function (a, b) {
            if (
                parseFloat(a.mainEntry.amount) > parseFloat(b.mainEntry.amount)
            ) {
                return -1;
            } else if (
                parseFloat(a.mainEntry.amount) < parseFloat(b.mainEntry.amount)
            ) {
                return 1;
            }
        });
        yellowData.sort(function (a, b) {
            if (
                parseFloat(a.mainEntry.amount) > parseFloat(b.mainEntry.amount)
            ) {
                return -1;
            } else if (
                parseFloat(a.mainEntry.amount) < parseFloat(b.mainEntry.amount)
            ) {
                return 1;
            }
        });

        noBadgeData.sort(function (a, b) {
            if (
                parseFloat(a.mainEntry.amount) > parseFloat(b.mainEntry.amount)
            ) {
                return -1;
            } else if (
                parseFloat(a.mainEntry.amount) < parseFloat(b.mainEntry.amount)
            ) {
                return 1;
            }
        });

        blueData.forEach((element) => {
            element.isLastMonth = _getIsLastMonth(element);
            d.push(element);
        });

        redData.forEach((element) => {
            element.isLastMonth = _getIsLastMonth(element);
            d.push(element);
        });

        yellowData.forEach((element) => {
            element.isLastMonth = _getIsLastMonth(element);
            d.push(element);
        });

        greenData.forEach((element) => {
            element.isLastMonth = _getIsLastMonth(element);
            d.push(element);
        });

        noBadgeData.forEach((element) => {
            element.isLastMonth = _getIsLastMonth(element);
            d.push(element);
        });

        data.data = d;
    }

    function _getIsLastMonth(element) {
        const {year, month} = props.route.params;

        if (year && month) {
            if (
                new Date(element.mainEntry.periodTill).getMonth() + 1 ==
                    month.monthIndex &&
                new Date(element.mainEntry.periodTill).getFullYear() == year &&
                element.interval.key != '0'
            ) {
                return true;
            }
            return false;
        }
        return false;
    }

    function _getRemainingText() {
        if (sections) {
            var remaining =
                sections[0].section.complete - sections[1].section.complete;

            remaining = remaining.toString().replace('.', ',');

            return remaining + ' ' + strings('Currency');
        }
        return '';
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
                            {month
                                ? month.title + ' ' + year
                                : strings('Month')}
                        </Title>
                    </Body>
                    <Right>
                        <Button
                            large
                            style={[
                                GlobalStyles.headerRightButton,
                                {position: 'relative', top: 10}
                            ]}
                            rounded
                            onPress={() => {
                                props.navigation.navigate('Entrys', {
                                    screen: 'CreateEditEntry',
                                    params: {
                                        selectedMonth: month.monthIndex,
                                        selectedYear: year
                                    }
                                });
                            }}
                        >
                            <Icon
                                style={GlobalStyles.headerRightButtonIcon}
                                name="add"
                            ></Icon>
                        </Button>
                    </Right>
                </Header>

                <SafeAreaView style={{flex: 1}}>
                    <SectionList
                        renderSectionHeader={({section: {section}}) => (
                            <ListItem itemDivider>
                                <Left>
                                    <Title>{section.title}</Title>
                                </Left>

                                <Right>
                                    <Title>
                                        {section.complete +
                                            ' ' +
                                            strings('Currency')}
                                    </Title>
                                </Right>
                            </ListItem>
                        )}
                        renderItem={({item}) => (
                            <ListItem
                                noBorder
                                style={{
                                    marginLeft: 0,

                                    borderTopRightRadius: 15,
                                    borderBottomRightRadius: 15,
                                    marginRight: 10,
                                    marginVertical: 2,
                                    borderBottomWidth: item.isLastMonth ? 2 : 0,
                                    borderTopWidth: item.isLastMonth ? 2 : 0,
                                    borderRightWidth: item.isLastMonth ? 2 : 0,
                                    borderColor: item.isLastMonth
                                        ? GlobalColors.warning
                                        : undefined
                                }}
                                icon
                                onPress={() => {
                                    item.mainEntry.interval = item.interval;
                                    item.mainEntry.categorie = item.categorie;

                                    props.navigation.navigate('Entrys', {
                                        screen: 'CreateEditEntry',
                                        params: {
                                            entry: item.mainEntry,
                                            selectedMonth: month.monthIndex,
                                            selectedYear: year,
                                            isLastMonth: item.isLastMonth
                                        }
                                    });
                                }}
                            >
                                <Left
                                    style={{
                                        marginLeft: 0,
                                        marginRight: 5,
                                        backgroundColor:
                                            item.mainEntry.fixedCosts == 'true'
                                                ? GlobalColors.mainColor
                                                : GlobalColors.lightGrey,
                                        borderTopRightRadius: 15,
                                        borderBottomRightRadius: 15
                                    }}
                                >
                                    <Icon
                                        style={{
                                            color: item.mainEntry.badge
                                                ? GlobalColors[
                                                      item.mainEntry.badge
                                                  ]
                                                : item.mainEntry.fixedCosts ==
                                                  'true'
                                                ? GlobalColors.light
                                                : undefined
                                        }}
                                        name={item.categorie.icon}
                                    ></Icon>
                                </Left>
                                <Body>
                                    <Text
                                        style={
                                            item.isLastMonth
                                                ? {
                                                      color:
                                                          GlobalColors.warning
                                                  }
                                                : undefined
                                        }
                                    >
                                        {item.mainEntry.description}
                                    </Text>
                                </Body>
                                <Right>
                                    <Text
                                        style={
                                            item.isLastMonth
                                                ? {
                                                      color:
                                                          GlobalColors.warning
                                                  }
                                                : {
                                                      color:
                                                          GlobalColors.mainColor
                                                  }
                                        }
                                    >
                                        {item.mainEntry.amount +
                                            ' ' +
                                            strings('Currency')}
                                    </Text>
                                </Right>
                            </ListItem>
                        )}
                        sections={sections}
                        keyExtractor={(item, index) => item + index}
                        ListEmptyComponent={() => (
                            <Card>
                                <CardItem>
                                    <Body>
                                        <Text>
                                            {
                                                'Es sind noch keine Einträge vorhanden'
                                            }
                                        </Text>
                                    </Body>
                                </CardItem>
                            </Card>
                        )}
                    />
                </SafeAreaView>

                <ListItem itemDivider>
                    <Left>
                        <Title>{strings('Remaining')}</Title>
                    </Left>
                    <Right>
                        <Title>{_getRemainingText()}</Title>
                    </Right>
                </ListItem>
            </ImageBackground>
        </Container>
    );
};

export default MonthDetailScreen;
