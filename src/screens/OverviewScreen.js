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
    Right,
    Text,
    Title
} from 'native-base';

import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    View
} from 'react-native';

import ButlerIcon from '../components/Icons/ButlerIcon';
import {ProgressCircle} from 'react-native-svg-charts';
import {Queryable} from 'vasern/vasern/src/core';
import * as moment from 'moment';
import {strings} from '../i18n';
import {Categories, Entrys, Intervals, MainEntrys} from '../database';
import Helper from '../Helper';
import {Table, TableWrapper, Col, Rows} from 'react-native-table-component';
import GlobalColors from '../style/GlobalColors';
let helper = new Helper();

class OverviewScreen extends Component {
    constructor() {
        super();
        this.state = {
            active: false,
            isLoading: true,
            sections: [],
            selected: false,
            selectedItem: undefined,
            intervals: undefined,
            categories: undefined,
            currentYear: new Date().getFullYear(),
            selectedYear: new Date().getFullYear()
        };
    }
    componentDidMount() {
        Entrys.onLoaded(() => {
            console.log('Entrys loaded');
            this._setState();
        });
        Entrys.onChange(() => {
            console.log('Entrys changed');
            this._setState();
        });
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedYear != this.state.selectedYear) {
            console.log('here');
        }
    }

    _setState() {
        var {selectedYear} = this.state;
        var sections = [];
        let entryQueryObj = new Queryable(Entrys.data());
        let mainEntryQueryObj = new Queryable(MainEntrys.data());
        let categorieQueryObj = new Queryable(Categories.data());
        let intervalQueryObj = new Queryable(Intervals.data());

        var dateArray = helper._getDates(
            new Date('01/01.' + selectedYear),
            new Date('12/30.' + selectedYear),
            1
        );

        if (dateArray) {
            dateArray.forEach((date) => {
                var m = moment.months('de');

                var sectionEntrys = entryQueryObj
                    .filter({
                        year: selectedYear.toString(),
                        month: (date.getMonth() + 1).toString()
                    })
                    .data();
                if (sectionEntrys) {
                    for (let i = 0; i < sectionEntrys.length; i++) {
                        const element = sectionEntrys[i];
                        var mainEntry = mainEntryQueryObj.get({
                            id: element.mainEntry_id
                        });
                        var categorie = categorieQueryObj.get({
                            id: mainEntry.categorie_id
                        });
                        var interval = intervalQueryObj.get({
                            id: mainEntry.interval_id
                        });
                        if (categorie) {
                            switch (categorie.typ) {
                                case 'incoming':
                                    sectionEntrys.incoming
                                        ? (sectionEntrys.incoming += parseFloat(
                                              mainEntry.amount
                                          ))
                                        : (sectionEntrys.incoming = parseFloat(
                                              mainEntry.amount
                                          ));

                                    break;
                                case 'outgoing':
                                    sectionEntrys.outgoing
                                        ? (sectionEntrys.outgoing += parseFloat(
                                              mainEntry.amount
                                          ))
                                        : (sectionEntrys.outgoing = parseFloat(
                                              mainEntry.amount
                                          ));

                                    break;

                                default:
                                    break;
                            }
                        }

                        element.mainEntry = mainEntry;
                        element.categorie = categorie;
                        element.interval = interval;
                        sectionEntrys.remaining =
                            sectionEntrys.incoming - sectionEntrys.outgoing;
                    }

                    if (sectionEntrys.length > 0) {
                        sections.push({
                            title: strings(m[parseInt(date.getMonth())]),
                            data: sectionEntrys,
                            calc: {
                                incoming: sectionEntrys.incoming,
                                outgoing: sectionEntrys.outgoing,
                                remaining: sectionEntrys.remaining
                            }
                        });
                    }
                }
            });
        }

        this.setState({
            isLoading: false,
            sections: sections
        });
    }

    _getProgressForItem(item) {
        function getPercentageChange(incoming, outgoing) {
            return ((100 * outgoing) / incoming / 100).toFixed(2);
        }
        var progress = getPercentageChange(
            item.calc.incoming ? item.calc.incoming : 0,
            item.calc.outgoing ? item.calc.outgoing : 0
        );
        console.log(progress);
        return parseFloat(progress);
    }

    render() {
        const {sections, selectedYear, currentYear} = this.state;
        const data = {
            tableTitle: [
                strings('Incomings'),
                strings('Outgoings'),
                strings('Remaining')
            ],
            tableData: [['200'], ['a'], ['1']]
        };
        return (
            <Container>
                <Header>
                    <Left></Left>
                    <Body>
                        <ButlerIcon size={50} />
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
                {this.state.isLoading ? <ActivityIndicator /> : null}

                {/* <View
                    style={{
                        flexDirection: 'row',

                        justifyContent: 'center',
                        paddingTop: 15
                    }}
                >
                    <Button
                        rounded
                        onPress={() => {
                            this.setState({selectedYear: currentYear});
                        }}
                    >
                        <Text>{'Heute '}</Text>
                    </Button>
                </View> */}

                <View
                    style={{
                        flexDirection: 'row',

                        justifyContent: 'space-between',
                        padding: 15
                    }}
                >
                    <Button
                        iconLeft
                        transparent
                        onPress={() => {
                            this.setState({selectedYear: selectedYear - 1});
                        }}
                    >
                        <Icon name="arrow-back" />
                        <Text>{this.state.selectedYear - 1}</Text>
                    </Button>
                    <Button
                        iconLeft

                        // onPress={() => {
                        //     this.setState({selectedYear: selectedYear - 1});
                        // }}
                    >
                        <Text>{this.state.selectedYear}</Text>
                    </Button>
                    <Button
                        iconRight
                        transparent
                        onPress={() => {
                            this.setState({selectedYear: selectedYear + 1});
                        }}
                    >
                        <Text>{this.state.selectedYear + 1}</Text>
                        <Icon name="arrow-forward" />
                    </Button>
                </View>

                <FlatList
                    ref={(ref) => {
                        this.thisYearFlatListRef = ref;
                    }}
                    // initialScrollIndex={
                    //     sections.length > 0 ? new Date().getMonth() + 1 : 1
                    // }
                    // // initialNumToRender={1}
                    // getItemLayout={(data, index) => ({
                    //     length: 500,
                    //     offset: 500 * index,
                    //     index
                    // })}
                    data={sections}
                    // listKey={this.props.thisDate.getFullYear().toString()}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={true}
                    renderItem={({item}) => (
                        <Pressable
                            onPress={() => {
                                console.log(item);
                            }}
                        >
                            <Card>
                                <CardItem header>
                                    <Body>
                                        <Title>{item.title}</Title>
                                    </Body>
                                </CardItem>
                                <ProgressCircle
                                    style={{height: 120}}
                                    progress={this._getProgressForItem(item)}
                                    strokeWidth={10}
                                    progressColor={GlobalColors.accentColor}
                                />

                                <Table borderStyle={{borderWidth: 0}}>
                                    <TableWrapper style={styles.wrapper}>
                                        <Col
                                            data={[
                                                strings('Incomings'),
                                                strings('Outgoings'),
                                                strings('Remaining')
                                            ]}
                                            style={styles.titleCol}
                                            heightArr={[20, 20]}
                                            textStyle={styles.titleText}
                                        />
                                        <Rows
                                            data={[
                                                [
                                                    item.calc.incoming.toString() +
                                                        ' ' +
                                                        strings('Currency')
                                                ],
                                                [
                                                    item.calc.outgoing.toString() +
                                                        ' ' +
                                                        strings('Currency')
                                                ],
                                                [
                                                    item.calc.remaining.toString() +
                                                        ' ' +
                                                        strings('Currency')
                                                ]
                                            ]}
                                            flexArr={[1, 1]}
                                            style={styles.row}
                                            textStyle={styles.text}
                                        />
                                    </TableWrapper>
                                </Table>
                                <CardItem footer>
                                    <Button
                                        transparent
                                        onPress={() => {
                                            console.log(item);
                                            // this.props.navigation.navigate(
                                            //     'Details',
                                            //     {
                                            //         month: item
                                            //     }
                                            // );
                                        }}
                                    >
                                        <Text>{'Details'}</Text>
                                    </Button>
                                </CardItem>
                            </Card>
                        </Pressable>
                    )}
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
            </Container>
        );
    }
}
export default OverviewScreen;
const styles = StyleSheet.create({
    mainTitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    mainTitleText: {
        textAlign: 'center'
    },
    container: {flex: 1, padding: 20, paddingTop: 30},
    dateTimeContainer: {
        zIndex: 1,
        height: 100,
        width: '100%'
    },
    wrapper: {flexDirection: 'row', margin: 10},
    titleCol: {flex: 1},
    titleText: {fontSize: 14, fontWeight: 'bold', textAlign: 'left'},
    row: {height: 20},
    text: {textAlign: 'center'}
});
