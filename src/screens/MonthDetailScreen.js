import React, {Component} from 'react';
import {
    Body,
    Button,
    Card,
    CardItem,
    Col,
    Container,
    Content,
    Footer,
    FooterTab,
    Header,
    Icon,
    Left,
    ListItem,
    Right,
    Text,
    Title,
    View
} from 'native-base';

import {Dimensions, SectionList, SafeAreaView, StyleSheet} from 'react-native';

import {strings} from '../i18n';

import {ProgressChart, PieChart} from 'react-native-chart-kit';
import {Entrys} from '../database';

import Error_Handler from '../Error_Handler';

import GlobalColors from '../style/GlobalColors';
import {EntryModel} from '../database/Models/EntryModel';

let entryModel = new EntryModel();
let error_handler = new Error_Handler();

class MonthDetailScreen extends Component {
    constructor() {
        super();
        this.state = {
            month: undefined,
            year: undefined
        };
    }

    componentDidMount() {
        this._setState();
        Entrys.onChange(() => {
            console.info('MonthDetailScreen Entrys changed');
            this._updateState();
        });
        this.props.navigation.addListener('willFocus', () => {
            this.props.navigation.setParams({
                handlePress: this._handlePress.bind(this)
            });
        });
    }

    _handlePress = async () => {
        try {
            this.props.navigation.navigate('Entrys', {
                screen: 'CreateEditEntry',
                params: {
                    selectedMonth: this.state.month.monthIndex,
                    selectedYear: this.state.year
                }
            });
        } catch (error) {
            error_handler._handleError('_handlePress', error);
        }
    };

    _setState() {
        try {
            var {params} = this.props.route;

            if (params && params.month) {
                this.setState({month: params.month});

                var data = entryModel.filterEntryBy({
                    month: params.month.monthIndex.toString(),
                    year: params.year.toString()
                });

                this._addDataToIncomingAndOutgoingData(data);
            }

            if (params && params.year) {
                this.setState({year: params.year});
            }
        } catch (error) {
            error_handler._handleError('_setState', error);
        }
    }

    _updateState() {
        var {month, year} = this.state;

        var data = entryModel.filterEntryBy({
            month: month.monthIndex.toString(),
            year: year.toString()
        });

        this._addDataToIncomingAndOutgoingData(data);
    }

    _addDataToIncomingAndOutgoingData(data) {
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
        this._sortData(outgoingData);
        this._sortData(incomingData);

        sections.push(incomingData);
        sections.push(outgoingData);

        this.setState({sections});
    }

    _sortData(data) {
        var sortedByAmount = data.data;
        sortedByAmount.sort(function (a, b) {
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
        this._testOtherSort(data);
        // data.data = sortedByAmount;
    }

    _testOtherSort(data) {
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
            element.isLastMonth = this._getIsLastMonth(element);
            d.push(element);
        });

        redData.forEach((element) => {
            element.isLastMonth = this._getIsLastMonth(element);
            d.push(element);
        });

        yellowData.forEach((element) => {
            element.isLastMonth = this._getIsLastMonth(element);
            d.push(element);
        });

        greenData.forEach((element) => {
            element.isLastMonth = this._getIsLastMonth(element);
            d.push(element);
        });

        noBadgeData.forEach((element) => {
            element.isLastMonth = this._getIsLastMonth(element);
            d.push(element);
        });

        data.data = d;
    }

    _getIsLastMonth(element) {
        const {year, month} = this.props.route.params;

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
    _getRemainingText() {
        const {sections} = this.state;
        if (sections) {
            var remaining =
                sections[0].section.complete - sections[1].section.complete;

            remaining = remaining.toString().replace('.', ',');

            return remaining + ' ' + strings('Currency');
        }
        return '';
    }

    render() {
        const {sections} = this.state;
        console.log(sections);

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
                        <Text>
                            {this.state.month
                                ? this.state.month.title + ' ' + this.state.year
                                : strings('Month')}
                        </Text>
                    </Body>
                    <Right>
                        <Button
                            primary
                            transparent
                            onPress={() => {
                                this.props.navigation.navigate('Entrys', {
                                    screen: 'CreateEditEntry',
                                    params: {
                                        selectedMonth: this.state.month
                                            .monthIndex,
                                        selectedYear: this.state.year
                                    }
                                });
                            }}
                        >
                            <Icon name="add"></Icon>
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
                                style={{
                                    marginLeft: 0,
                                    backgroundColor: item.mainEntry.badge
                                        ? GlobalColors[item.mainEntry.badge]
                                        : undefined,
                                    borderTopRightRadius: 15,

                                    borderBottomRightRadius: 15,
                                    marginRight: 10,
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

                                    this.props.navigation.navigate('Entrys', {
                                        screen: 'CreateEditEntry',
                                        params: {
                                            entry: item.mainEntry,
                                            selectedMonth: this.state.month
                                                .monthIndex,
                                            selectedYear: this.state.year,
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
                                                : undefined,
                                        borderTopRightRadius: 15,
                                        borderBottomRightRadius: 15
                                    }}
                                >
                                    <Icon
                                        style={{
                                            color:
                                                item.mainEntry.fixedCosts ==
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
                                                ? {color: GlobalColors.warning}
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
                                                ? {color: GlobalColors.warning}
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
                        <Title>{this._getRemainingText()}</Title>
                    </Right>
                </ListItem>
            </Container>
        );
    }
}
export default MonthDetailScreen;
