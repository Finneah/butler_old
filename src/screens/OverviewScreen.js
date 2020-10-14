import React, {Component} from 'react';
import {
    Body,
    Button,
    Card,
    CardItem,
    Container,
    Fab,
    Header,
    Icon,
    Left,
    Right,
    Text,
    Title
} from 'native-base';

import {
    ActivityIndicator,
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
import RealmDB from '../database/RealmDB';

let helper = new Helper();

class OverviewScreen extends Component {
    constructor() {
        super();
        this.state = {
            active: false,
            isLoading: true,
            entrys: [],
            sections: [],
            mainEntrys: [],
            entrysVasern: undefined,
            mainEntrysVasern: undefined,
            selected: false,
            selectedItem: undefined,
            intervals: undefined,
            categories: undefined,
            currentYear: new Date().getFullYear(),
            selectedYear: new Date().getFullYear()
        };
    }
    componentDidMount() {
        let realmDB = new RealmDB();
        console.log(realmDB);
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
        var {selectedYear, sections} = this.state;

        let entryQueryObj = new Queryable(Entrys.data());
        let mainEntryQueryObj = new Queryable(MainEntrys.data());
        let categorieQueryObj = new Queryable(Categories.data());
        let intervalQueryObj = new Queryable(Intervals.data());
        var mainEntrys = [];
        console.log('Entrys', Entrys.data());
        var entrys = entryQueryObj
            .filter({year: selectedYear.toString()})
            .data();
        // for (let i = 0; i < Entrys.data().length; i++) {
        //     const element = Entrys.data()[i];
        //     Entrys.remove({id: element.id}, true);
        // }
        // for (let i = 0; i < MainEntrys.data().length; i++) {
        //     const element = MainEntrys.data()[i];
        //     MainEntrys.remove({id: element.id}, true);
        // }
        console.log('entrys', entrys);
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
                var calc = {};
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
                                    calc.incoming
                                        ? calc.incoming +
                                          parseFloat(mainEntry.amount)
                                        : (calc.incoming = parseFloat(
                                              mainEntry.amount
                                          ));

                                    break;
                                case 'outgoing':
                                    calc.outgoing
                                        ? calc.outgoing +
                                          parseFloat(mainEntry.amount)
                                        : (calc.outgoing = parseFloat(
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
                        calc.remaining = calc.incoming - calc.outgoing;
                    }

                    if (sectionEntrys.length > 0) {
                        sections.push({
                            title: m[parseInt(date.getMonth())],
                            data: sectionEntrys,
                            calc: calc
                        });
                    }
                }
            });
        }

        /**
         * sections = [{title:2020,data[]}]sections
         */
        // if (entrys.lenght > 0) {
        //     for (let i = 1; i <= 12; i++) {
        //         var data = {
        //             tableTitle: ['Einnahmen', 'Ausgaben', 'Rest'],
        //             einnahmen: 2400,
        //             ausgaben: 2000,
        //             rest: 400,
        //             tableData: [[2400], [(2000 / 2400).toString()], ['40']],
        //             month: i.toString(),
        //             data: entryQueryObj.filter({year: selectedYear, month: i})
        //         };
        //         sections.push(data);
        //     }
        // }

        this.setState({
            isLoading: false,
            entrys: entrys,
            mainEntrys: mainEntrys,
            sections: sections
        });
        // console.log('_setState', sections);
    }

    _getMonthTitle(item) {
        var data = moment.months('de');
        return data[parseInt(item.month - 1)];
    }

    _getProgressForItem(item) {
        function getPercentageChange(incoming, outgoing) {
            return ((100 * outgoing) / incoming / 100).toFixed(2);
        }
        var progress = getPercentageChange(
            item.calc.incoming ? item.calc.incoming : 0,
            item.calc.outgoing ? item.calc.outgoing : 0
        );

        return parseFloat(progress);
    }

    render() {
        const {sections, selectedYear, currentYear} = this.state;

        return (
            <Container>
                <Header>
                    <Left>{/* <ButlerIcon size={45} /> */}</Left>
                    <Body>
                        <ButlerIcon size={50} />
                        {/* <Title>{strings('APP_TITLE')}</Title> */}
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
                {/* <Button
                    onPress={() => {
                        this._insertMainEntry();
                    }}
                >
                    <Text>{'Insert'}</Text>
                </Button> */}
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
                                    <Title style={styles.mainTitleText}>
                                        {item.title}
                                    </Title>
                                </CardItem>

                                <ProgressCircle
                                    style={{height: 120}}
                                    progress={this._getProgressForItem(item)}
                                    strokeWidth={10}
                                    progressColor={'#66806D'}
                                />

                                {/* <View style={{padding: 20}}>
                                    <Table borderStyle={{borderWidth: 0}}>
                                        <TableWrapper style={styles.wrapper}>
                                            <Col
                                                data={item.tableTitle}
                                                style={styles.titleCol}
                                                heightArr={[28, 28]}
                                                textStyle={styles.titleText}
                                            />
                                            <Rows
                                                data={item.tableData}
                                                flexArr={[1, 1]}
                                                style={styles.row}
                                                textStyle={styles.text}
                                            />
                                        </TableWrapper>
                                    </Table>
                                </View> */}
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
                {/* <Fab
                    position="bottomRight"
                    onPress={() => {
                        this.props.navigation.navigate('CreateEditEntry');
                    }}
                >
                    <Icon name="add" />
                </Fab> */}
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
