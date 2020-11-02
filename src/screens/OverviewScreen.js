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
    Text,
    Title
} from 'native-base';

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View
} from 'react-native';

import ButlerIcon from '../components/Icons/ButlerIcon';
import {ProgressCircle} from 'react-native-svg-charts';

import * as moment from 'moment';
import {strings} from '../i18n';
import {Entrys, MainEntrys} from '../database';
import Helper from '../Helper';

import GlobalColors from '../style/GlobalColors';
import Error_Handler from '../Error_Handler';
import {EntryModel} from '../database/Models/EntryModel';
import {MainEntryModel} from '../database/Models/MainEntryModel';
import {CategorieModel} from '../database/Models/CategorieModel';
import {IntervalModel} from '../database/Models/IntervalModel';

let entryModel = new EntryModel();
let mainEntryModel = new MainEntryModel();
let categorieModel = new CategorieModel();
let intervalModel = new IntervalModel();
let helper = new Helper();
let error_handler = new Error_Handler();
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
        MainEntrys.onLoaded(() => {
            console.info('MainEntrys loaded');
        });
        Entrys.onLoaded(() => {
            console.info('Entrys loaded');
            this._setState();
        });

        Entrys.onChange(() => {
            console.info('Entrys changed');
            this._setState();
        });
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedYear != this.state.selectedYear) {
            this._setState();
            console.info('here');
        }
    }

    _setState() {
        try {
            var {selectedYear} = this.state;
            var sections = [];

            var dateArray = helper._getDates(
                new Date('01/01/' + selectedYear),
                new Date('12/30/' + selectedYear),
                1
            );

            if (dateArray) {
                dateArray.forEach((date) => {
                    var m = moment.months('de');

                    var sectionEntrys = entryModel.getEntrysForYearAndMonth(
                        selectedYear.toString(),
                        (date.getMonth() + 1).toString()
                    );

                    if (sectionEntrys) {
                        sectionEntrys.incoming = 0;
                        sectionEntrys.outgoing = 0;
                        sectionEntrys.remaining = 0;
                        for (let i = 0; i < sectionEntrys.length; i++) {
                            const element = sectionEntrys[i];

                            var mainEntry = mainEntryModel.getMainEntryById(
                                element.mainEntry_id
                            );
                            if (mainEntry) {
                                var categorie = categorieModel.getCategorieById(
                                    mainEntry.categorie_id
                                );

                                var interval = intervalModel.getIntervalById(
                                    mainEntry.interval_id
                                );

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
            error_handler._handleError('_setState', error);
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
                                Alert.alert(strings('DeleteAllData'), '', [
                                    {
                                        text: strings('Cancel'),
                                        onPress: () => {},
                                        style: 'cancel'
                                    },

                                    {
                                        text: strings('Delete'),
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

                <SafeAreaView style={{flex: 1}}>
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
                            length: 440,
                            offset: 440 * index,
                            index
                        })}
                        data={sections}
                        initialNumToRender={
                            this.state.sections &&
                            this.state.sections[2] != undefined
                                ? 3
                                : this.state.sections.length
                        }
                        // listKey={this.props.thisDate.getFullYear().toString()}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={true}
                        renderItem={({item}) => (
                            <Card overviewCard>
                                <CardItem header first>
                                    <Left></Left>
                                    <Body>
                                        <Title light>{item.title}</Title>
                                    </Body>
                                    <Right></Right>
                                </CardItem>
                                <ProgressCircle
                                    style={{
                                        height: 120,
                                        marginTop: 20,
                                        marginBottom: 10
                                    }}
                                    progress={this._getProgressForItem(item)}
                                    strokeWidth={10}
                                    progressColor={GlobalColors.accentColor}
                                />

                                <ListItem>
                                    <Body>
                                        <Text>{strings('Incomings')}</Text>
                                    </Body>
                                    <Right>
                                        <Text>
                                            {item.calc.incoming.toString() +
                                                ' ' +
                                                strings('Currency')}
                                        </Text>
                                    </Right>
                                </ListItem>
                                <ListItem>
                                    <Body>
                                        <Text>{strings('Outgoings')}</Text>
                                    </Body>
                                    <Right>
                                        <Text>
                                            {item.calc.outgoing.toString() +
                                                ' ' +
                                                strings('Currency')}
                                        </Text>
                                    </Right>
                                </ListItem>
                                <ListItem>
                                    <Body>
                                        <Text>{strings('Remaining')}</Text>
                                    </Body>
                                    <Right>
                                        <Text>
                                            {item.calc.remaining.toString() +
                                                ' ' +
                                                strings('Currency')}
                                        </Text>
                                    </Right>
                                </ListItem>
                                <CardItem footer last>
                                    <Left>
                                        <Button
                                            secondary
                                            transparent
                                            iconLeft
                                            onPress={() => {}}
                                        >
                                            <Icon name="chevron-down"></Icon>
                                            <Text>{strings('More')}</Text>
                                        </Button>
                                    </Left>
                                    <Body></Body>
                                    <Right>
                                        <Button
                                            primary
                                            transparent
                                            iconRight
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
                                            <Text>{'Edit'}</Text>
                                            <Icon name="chevron-forward"></Icon>
                                        </Button>
                                    </Right>
                                </CardItem>
                            </Card>
                        )}
                        ListEmptyComponent={() => (
                            <Card>
                                <CardItem firstlast>
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
