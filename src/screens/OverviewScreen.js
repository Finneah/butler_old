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
    Title,
    Toast
} from 'native-base';

import {
    ActivityIndicator,
    Alert,
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
import Error_Handler from '../Error_Handler';
let helper = new Helper();
let error_helper = new Error_Handler();
class OverviewScreen extends Component {
    constructor() {
        super();
        this.state = {
            active: false,
            isLoading: true,
            intervalsLoaded: false,
            categoriesLoaded: false,
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
            console.info('Entrys loaded');

            Toast.show({
                text: 'Entrys loaded ' + Entrys.data().length.toString(),
                buttonText: strings('Ok')
            });
            this._setState();
        });

        Entrys.onChange(() => {
            console.info('Entrys changed');
            Toast.show({
                text: 'Entrys changed ' + Entrys.data().length.toString(),
                buttonText: strings('Ok')
            });

            this._setState();
        });
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedYear != this.state.selectedYear) {
            this._setState();
            console.info('here');
        }
        // if (prevState.sections != this.state.sections) {
        //     if (this.state.selectedYear == this.state.currentYear) {
        //         this.scrollToIndex();
        //     }
        // }
    }

    _setState() {
        try {
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
            Toast.show({
                text: 'dateArray ' + dateArray.length.toString(),
                buttonText: strings('Ok')
            });
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
                            if (mainEntry) {
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
                                monthIndex: parseInt(date.getMonth() + 1),
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
        } catch (error) {
            error_helper._handleError('_setState', error);
        }
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

    _getInitialScrollIndex() {
        const {sections} = this.state;
        if (sections.length > 0) {
            if (this.state.selectedYear == this.state.currentYear) {
                var m = moment.months('de');
                var index = 1;
                sections.filter((a, i) => {
                    if (a.title == strings(m[new Date().getMonth()])) {
                        index = i;
                    }
                });

                return index;
            }
        }

        return 0;
    }

    scrollToIndex = () => {
        const {sections} = this.state;

        if (sections.length > 0) {
            this.thisYearFlatListRef.scrollToIndex({
                animated: true,
                index: this._getInitialScrollIndex()
            });
        }
    };

    scrollToTop() {
        const {sections} = this.state;

        if (sections.length > 0) {
            this.thisYearFlatListRef.scrollToIndex({animated: true, index: 0});
        }
    }

    render() {
        const {sections, selectedYear} = this.state;

        return (
            <Container>
                <Header>
                    <Left>
                        <Button
                            primary
                            transparent
                            onPress={() => {
                                this.setState({
                                    selectedYear: this.state.currentYear
                                });
                                this.scrollToIndex();
                            }}
                        >
                            <Text>{strings('Today')}</Text>
                        </Button>
                    </Left>
                    <Body>
                        <Pressable
                            onLongPress={() => {
                                Alert.alert('Alle Daten löschen?', '', [
                                    {
                                        text: strings('Cancel'),
                                        onPress: () => {},
                                        style: 'cancel'
                                    },

                                    {
                                        text: 'Löschen',
                                        style: 'destructive',
                                        onPress: () => {
                                            Entrys.perform(function (db) {
                                                Entrys.data().forEach(function (
                                                    item
                                                ) {
                                                    db.remove(item);
                                                });
                                            });

                                            MainEntrys.perform(function (db) {
                                                MainEntrys.data().forEach(
                                                    function (item) {
                                                        db.remove(item);
                                                    }
                                                );
                                            });
                                        }
                                    }
                                ]);
                            }}
                        >
                            <ButlerIcon size={50} />
                        </Pressable>
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
                    <Button onPress={() => this.scrollToTop()}>
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
                    initialScrollIndex={this._getInitialScrollIndex()}
                    getItemLayout={(data, index) => ({
                        length: 360,
                        offset: 360 * index,
                        index
                    })}
                    data={sections}
                    // listKey={this.props.thisDate.getFullYear().toString()}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={true}
                    renderItem={({item}) => (
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
                                                item.calc.incoming
                                                    ? item.calc.incoming.toString() +
                                                      ' ' +
                                                      strings('Currency')
                                                    : ''
                                            ],
                                            [
                                                item.calc.outgoing
                                                    ? item.calc.outgoing.toString() +
                                                      ' ' +
                                                      strings('Currency')
                                                    : ''
                                            ],
                                            [
                                                item.calc.remaining
                                                    ? item.calc.remaining.toString() +
                                                      ' ' +
                                                      strings('Currency')
                                                    : ''
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
                                        this.props.navigation.navigate(
                                            'Details',
                                            {
                                                screen: 'MonthDetail',
                                                params: {
                                                    month: item,
                                                    year: selectedYear
                                                }
                                            }
                                        );
                                    }}
                                >
                                    <Text>{strings('Details')}</Text>
                                </Button>
                            </CardItem>
                        </Card>
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
