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

import {ProgressChart} from 'react-native-chart-kit';
import {Entrys} from '../database';
import Queryable from 'vasern/vasern/src/core/vasern-queryable';

import Error_Handler from '../Error_Handler';

import GlobalColors from '../style/GlobalColors';

let error_handler = new Error_Handler();
class ProgressChartExample extends React.PureComponent {
    render() {
        const data = {
            labels: ['Swim', 'Bike', 'Run'], // optional
            data: [0.4, 0.6, 0.8]
        };
        const chartConfig = {
            backgroundGradientFrom: '#f8f8f8',
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: '#333',
            backgroundGradientToOpacity: 0.5,
            color: (opacity = 1) =>
                `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                    Math.random() * 255
                )}, ${Math.floor(Math.random() * 255)}, ${opacity})`,
            strokeWidth: 2, // optional, default 3
            barPercentage: 0.5,
            useShadowColorFromDataset: false // optional
        };
        return (
            <ProgressChart
                data={data}
                width={Dimensions.get('screen').width}
                height={220}
                strokeWidth={16}
                radius={32}
                chartConfig={chartConfig}
                hideLegend={false}
            />
        );
    }
}

class MonthDetailScreen extends Component {
    constructor() {
        super();
        this.state = {
            month: undefined,
            year: undefined
        };
    }
    // static navigationOptions = ({navigation}) => {
    //     console.log('navigationOptions');
    //     const {params = {}} = navigation.state;
    //     return {
    //         header: ({navigation}) => {
    //             return (
    //                 <Header>
    //                     <Left>
    //                         <Button
    //                             primary
    //                             transparent
    //                             onPress={() => {
    //                                 navigation.goBack();
    //                             }}
    //                         >
    //                             <Icon name="chevron-back" />
    //                         </Button>
    //                     </Left>
    //                     <Body>
    //                         <Text>
    //                             {this.state.month
    //                                 ? this.state.month.title +
    //                                   ' ' +
    //                                   this.state.year
    //                                 : strings('Month')}
    //                         </Text>
    //                     </Body>
    //                     <Right>
    //                         <Button
    //                             primary
    //                             transparent
    //                             onPress={() => {
    //                                 try {
    //                                     params.handlePress(params);
    //                                 } catch (error) {}
    //                             }}
    //                         >
    //                             <Icon name="add"></Icon>
    //                         </Button>
    //                     </Right>
    //                 </Header>
    //             );
    //         }
    //     };
    // };

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
            let entryQueryObj = new Queryable(Entrys.data());

            if (params && params.month) {
                this.setState({month: params.month});
                var data = entryQueryObj
                    .filter({
                        month: params.month.monthIndex.toString(),
                        year: params.year.toString()
                    })
                    .data();
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
        let entryQueryObj = new Queryable(Entrys.data());
        var data = entryQueryObj
            .filter({
                month: month.monthIndex.toString(),
                year: year.toString()
            })
            .data();
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

        // sortedByAmount.forEach((element) => {
        //     element.mainEntry.fixedCosts == true ||
        //     element.mainEntry.fixedCosts == 'true'
        //         ? d.push(element)
        //         : d.unshift(element);
        // });

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

                {/* <ProgressChartExample progressData={sections} /> */}

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
                                    backgroundColor:
                                        !item.mainEntry.fixedCosts &&
                                        item.interval.key != '0'
                                            ? GlobalColors.accentColorLight
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
                                            selectedYear: this.state.year
                                        }
                                    });
                                }}
                            >
                                <Left>
                                    <Icon name={item.categorie.icon}></Icon>
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
