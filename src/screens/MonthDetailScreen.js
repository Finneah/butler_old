import React, {Component} from 'react';
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
    Text
} from 'native-base';

import {Dimensions, SectionList} from 'react-native';

import {strings} from '../i18n';

import GlobalColors from '../style/GlobalColors';

import {ProgressChart} from 'react-native-chart-kit';
import {Categories, Entrys, Intervals, MainEntrys} from '../database';
import Queryable from 'vasern/vasern/src/core/vasern-queryable';
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
    componentDidMount() {
        this._setState();
        Entrys.onChange(() => {
            console.info('MonthDetailScreen Entrys changed');
            this._updateState();
        });
    }

    _setState() {
        var {params} = this.props.route;
        let entryQueryObj = new Queryable(Entrys.data());

        if (params && params.month) {
            this.setState({month: params.month});
            var sections = [];
            var incomingData = {
                section: {title: strings('Incomings'), complete: 0},
                data: []
            };
            var outgoingData = {
                section: {title: strings('Outgoings'), complete: 0},
                data: []
            };
            var data = entryQueryObj
                .filter({
                    month: params.month.monthIndex.toString(),
                    year: params.year.toString()
                })
                .data();
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                switch (element.categorie.typ) {
                    case 'incoming':
                        incomingData.data.push(element);
                        incomingData.section.complete += parseFloat(
                            element.mainEntry.amount
                        );

                        break;
                    case 'outgoing':
                        outgoingData.data.push(element);
                        outgoingData.section.complete += parseFloat(
                            element.mainEntry.amount
                        );
                        break;
                    default:
                        break;
                }
            }

            sections.push(incomingData);
            sections.push(outgoingData);
            this.setState({sections});
        }

        if (params && params.year) {
            this.setState({year: params.year});
        }
    }

    _updateState() {
        var {month, year} = this.state;
        let entryQueryObj = new Queryable(Entrys.data());

        var sections = [];
        var incomingData = {
            section: {title: strings('Incomings'), complete: 0},
            data: []
        };
        var outgoingData = {
            section: {title: strings('Outgoings'), complete: 0},
            data: []
        };
        var data = entryQueryObj
            .filter({
                month: month.monthIndex.toString(),
                year: year.toString()
            })
            .data();
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            switch (element.categorie.typ) {
                case 'incoming':
                    incomingData.data.push(element);
                    incomingData.section.complete += parseFloat(
                        element.mainEntry.amount
                    );

                    break;
                case 'outgoing':
                    outgoingData.data.push(element);
                    outgoingData.section.complete += parseFloat(
                        element.mainEntry.amount
                    );
                    break;
                default:
                    break;
            }
        }

        sections.push(incomingData);
        sections.push(outgoingData);
        this.setState({sections});
    }

    render() {
        const {sections} = this.state;

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
                                    params: {}
                                });
                            }}
                        >
                            <Icon name="add"></Icon>
                        </Button>
                    </Right>
                </Header>

                {/* <ProgressChartExample progressData={sections} /> */}

                <SectionList
                    renderSectionHeader={({section: {section}}) => (
                        <ListItem itemDivider>
                            <Body>
                                <Text>{section.title}</Text>
                            </Body>

                            <Right>
                                <Text style={{fontWeight: 'bold'}}>
                                    {section.complete +
                                        ' ' +
                                        strings('Currency')}
                                </Text>
                            </Right>
                        </ListItem>
                    )}
                    renderItem={({item}) => (
                        <ListItem
                            icon
                            onPress={() => {
                                item.mainEntry.interval = item.interval;
                                item.mainEntry.categorie = item.categorie;

                                this.props.navigation.navigate('Entrys', {
                                    screen: 'CreateEditEntry',
                                    params: {entry: item.mainEntry}
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
                                <Text>
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
                    ListFooterComponent={() => (
                        <ListItem itemDivider>
                            <Body>
                                <Text style={{fontWeight: 'bold'}}>
                                    {strings('Remaining')}
                                </Text>
                            </Body>
                            <Right>
                                <Text style={{fontWeight: 'bold'}}>
                                    {sections
                                        ? sections[0].section.complete -
                                          sections[1].section.complete +
                                          ' ' +
                                          strings('Currency')
                                        : ''}
                                </Text>
                            </Right>
                        </ListItem>
                    )}
                />
            </Container>
        );
    }
}
export default MonthDetailScreen;
