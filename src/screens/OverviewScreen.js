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
    Text,
    Title
} from 'native-base';
import React, {useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ImageBackground,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View
} from 'react-native';
import {ProgressCircle} from 'react-native-svg-charts';

import background from './../components/bg.png';
import ButlerIcon from '../components/Icons/ButlerIcon';
import {Entrys, MainEntrys} from '../database';
import {CategorieModel} from '../database/Models/CategorieModel';
import {EntryModel} from '../database/Models/EntryModel';
import {IntervalModel} from '../database/Models/IntervalModel';
import {MainEntryModel} from '../database/Models/MainEntryModel';
import Error_Handler from '../Error_Handler';
import Helper from '../Helper';
import {strings} from '../i18n';
import GlobalColors from '../style/GlobalColors';
import GlobalStyles from '../style/GlobalStyles';

let entryModel = new EntryModel();
let mainEntryModel = new MainEntryModel();
let categorieModel = new CategorieModel();
let intervalModel = new IntervalModel();
let helper = new Helper();
let error_handler = new Error_Handler();

const OverviewScreen = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [sections, setSections] = useState([]);
    const [currentYear] = useState(new Date().getFullYear());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [thisYearFlatListRef, setThisYearFlatListRef] = useState(undefined);
    const image = background;

    const styles = StyleSheet.create({
        image: {
            flex: 1,
            resizeMode: 'cover',
            justifyContent: 'center'
        }
    });

    React.useEffect(() => {
        MainEntrys.onLoaded(() => {
            console.info('MainEntrys loaded');
        });
        Entrys.onLoaded(() => {
            console.info('Entrys loaded');
            _setState();
        });

        Entrys.onChange(() => {
            console.info('Entrys changed');
            _setState();
        });
    }, []);

    React.useEffect(() => {
        _setState();
        console.info('here');
    }, [selectedYear]);

    function _setState() {
        try {
            var sections = [];

            var dateArray = helper._getDates(
                new Date('01/01/' + selectedYear),
                new Date('12/30/' + selectedYear),
                1
            );

            if (dateArray) {
                dateArray.forEach((date) => {
                    var m = moment.months('de');

                    var sectionEntrys = entryModel.filterEntryBy({
                        year: selectedYear.toString(),
                        month: (date.getMonth() + 1).toString()
                    });

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

            setIsLoading(false);
            setSections(sections);
        } catch (error) {
            error_handler._handleError('_setState', error);
        }
    }

    function _getProgressForItem(item) {
        function getPercentageChange(incoming, outgoing) {
            return ((100 * outgoing) / incoming / 100).toFixed(2);
        }
        var progress = getPercentageChange(
            item.calc.incoming ? item.calc.incoming : 0,
            item.calc.outgoing ? item.calc.outgoing : 0
        );

        return parseFloat(progress);
    }

    function _getInitialScrollIndex() {
        if (sections.length > 0) {
            if (selectedYear == currentYear) {
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

    function scrollToIndex() {
        if (sections.length > 0) {
            thisYearFlatListRef.scrollToIndex({
                animated: true,
                index: _getInitialScrollIndex()
            });
        }
    }

    function scrollToTop() {
        if (sections.length > 0) {
            thisYearFlatListRef.scrollToIndex({animated: true, index: 0});
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
                                setSelectedYear(currentYear);
                                scrollToIndex();
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
                            large
                            style={[
                                GlobalStyles.headerRightButton,
                                {position: 'relative', top: 10}
                            ]}
                            rounded
                            onPress={() => {
                                props.navigation.navigate('Entrys', {
                                    screen: 'CreateEditEntry',
                                    params: {}
                                });
                            }}
                        >
                            <Icon
                                style={GlobalStyles.headerRightButtonIcon}
                                light
                                name="add"
                            ></Icon>
                        </Button>
                    </Right>
                </Header>

                <SafeAreaView style={{flex: 1}}>
                    {isLoading ? <ActivityIndicator /> : null}

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
                                setSelectedYear(selectedYear - 1);
                                scrollToTop();
                            }}
                        >
                            <Icon name="arrow-back" />
                            <Text>{selectedYear - 1}</Text>
                        </Button>
                        <Button onPress={() => scrollToTop()}>
                            <Text>{selectedYear}</Text>
                        </Button>
                        <Button
                            iconRight
                            transparent
                            onPress={() => {
                                setSelectedYear(selectedYear + 1);
                                scrollToTop();
                            }}
                        >
                            <Text>{selectedYear + 1}</Text>
                            <Icon name="arrow-forward" />
                        </Button>
                    </View>

                    <FlatList
                        ref={(ref) => {
                            setThisYearFlatListRef(ref);
                        }}
                        initialScrollIndex={_getInitialScrollIndex()}
                        getItemLayout={(data, index) => ({
                            length: 460,
                            offset: 460 * index,
                            index
                        })}
                        data={sections}
                        initialNumToRender={
                            sections && sections[2] != undefined
                                ? 3
                                : sections.length
                        }
                        // listKey={this.props.thisDate.getFullYear().toString()}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={true}
                        renderItem={({item}) => (
                            <Card
                                noShadow
                                style={{
                                    backgroundColor: GlobalColors.mainColor,
                                    borderWidth: 0,
                                    borderColor: GlobalColors.light,
                                    padding: 15
                                }}
                            >
                                <CardItem first>
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
                                        marginBottom: 10,
                                        backgroundColor: GlobalColors.butler
                                    }}
                                    progress={_getProgressForItem(item)}
                                    strokeWidth={10}
                                    progressColor={GlobalColors.accentColor}
                                />

                                <ListItem
                                    style={[
                                        GlobalStyles.overviewListItem,
                                        {
                                            borderTopLeftRadius: 20,
                                            borderTopRightRadius: 20
                                        }
                                    ]}
                                >
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
                                <ListItem style={GlobalStyles.overviewListItem}>
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
                                <ListItem
                                    style={[
                                        GlobalStyles.overviewListItem,
                                        {
                                            borderBottomLeftRadius: 20,
                                            borderBottomRightRadius: 20
                                        }
                                    ]}
                                >
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
                                <CardItem last>
                                    <Body></Body>
                                    <Right>
                                        <Button
                                            secondary
                                            rounded
                                            iconRight
                                            onPress={() => {
                                                props.navigation.navigate(
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
                                            <Text>{strings('details')}</Text>
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
                                        <Text light>
                                            {strings('noEntrysYet')}
                                        </Text>
                                    </Body>
                                </CardItem>
                            </Card>
                        )}
                    />
                </SafeAreaView>
            </ImageBackground>
        </Container>
    );
};

export default OverviewScreen;
