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
    Header,
    Icon,
    Left,
    ListItem,
    Right,
    Text,
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
        console.log(data);
        var sections = [];
        var incomingData = {
            section: {title: strings('Incomings'), complete: 0},
            data: []
        };
        var outgoingData = {
            section: {title: strings('Outgoings'), complete: 0},
            data: []
        };

        var incomingData2 = {
            section: {title: strings('Incomings'), complete: 0},
            data: []
        };
        var outgoingData2 = {
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
        var d = [];
        var sortedByAmount = data.data;
        sortedByAmount.sort(function (a, b) {
            console.log(a, b);
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

        data.data = sortedByAmount;
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
                                <Body>
                                    <Text>{section.title}</Text>
                                </Body>

                                <Right>
                                    <Text
                                        style={{
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {section.complete +
                                            ' ' +
                                            strings('Currency')}
                                    </Text>
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
                                    marginRight: 10
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
                                            selectedYear: this.state.year
                                        }
                                    });
                                }}
                            >
                                <Left
                                    style={{
                                        marginLeft: 0,
                                        marginRight: 5,
                                        backgroundColor:
                                            item.mainEntry.fixedCosts ==
                                                'true' ||
                                            item.mainEntry.fixedCosts == true
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
                                                    'true' ||
                                                item.mainEntry.fixedCosts ==
                                                    true
                                                    ? GlobalColors.light
                                                    : undefined
                                        }}
                                        name={item.categorie.icon}
                                    ></Icon>
                                </Left>
                                <Body>
                                    <Text>{item.mainEntry.description}</Text>
                                </Body>
                                <Right>
                                    <Text style={{color: '#333'}}>
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
                    <Body>
                        <Text style={{fontWeight: 'bold'}}>
                            {strings('Remaining')}
                        </Text>
                    </Body>
                    <Right>
                        <Text style={{fontWeight: 'bold'}}>
                            {this._getRemainingText()}
                        </Text>
                    </Right>
                </ListItem>
            </Container>
        );
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
}
export default MonthDetailScreen;
const styles = StyleSheet.create({
    container: {flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff'},
    head: {height: 40, backgroundColor: '#f1f8ff'},
    text: {margin: 6},
    textLeft: {
        textAlign: 'left'
    },
    textRight: {
        textAlign: 'right'
    }
});
