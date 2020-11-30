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
    Tab,
    Tabs,
    Text,
    Title
} from 'native-base';

import {
    FlatList,
    ImageBackground,
    Pressable,
    SafeAreaView,
    StyleSheet
} from 'react-native';
import {strings} from '../i18n';
import {Categories} from '../database';
import background from './../components/bg.png';
import GlobalColors from '../style/GlobalColors';
import GlobalStyles from '../style/GlobalStyles';

class CategoriesScreen extends Component {
    constructor() {
        super();
        this.state = {
            disabled: false,
            categories: undefined,
            entry: {},
            options: []
        };
    }

    componentDidMount() {
        this.setState({categories: Categories.data()});
    }

    _getFilteredCategories(typ) {
        var {categories} = this.state;

        if (categories) {
            categories.sort((a, b) =>
                strings(a.name) > strings(b.name) ? 1 : -1
            );
            var data = categories.filter((a) => {
                if (a.typ == typ) {
                    return a;
                }
            });
        }

        return data ? data : [];
    }

    render() {
        const image = background;

        const styles = StyleSheet.create({
            image: {
                flex: 1,
                resizeMode: 'cover',
                justifyContent: 'center'
            }
        });
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
                                    this.props.navigation.goBack();
                                }}
                            >
                                <Icon name="chevron-back" />
                            </Button>
                        </Left>
                        <Body>
                            <Title light>{strings('Categorie')}</Title>
                        </Body>
                        <Right></Right>
                    </Header>
                    <SafeAreaView style={[GlobalStyles.safeAreView]}>
                        <Tabs
                            tabBarUnderlineStyle={{
                                backgroundColor: GlobalColors.accentColor
                            }}
                            tabBarTextStyle={{color: GlobalColors.accentColor}}
                            tabBarActiveTextColor={GlobalColors.accentColor}
                        >
                            <Tab heading={strings('Outgoings')}>
                                <FlatList
                                    data={this._getFilteredCategories(
                                        'outgoing'
                                    )}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    scrollEnabled={true}
                                    renderItem={({item}) => (
                                        <Pressable
                                            onPress={() => {
                                                this.props.navigation.navigate(
                                                    'CreateEditEntry',
                                                    {categorie: item}
                                                );
                                            }}
                                        >
                                            <Card>
                                                <CardItem transparent>
                                                    <Left>
                                                        <Icon
                                                            style={{
                                                                color:
                                                                    GlobalColors.light
                                                            }}
                                                            name={item.icon}
                                                        ></Icon>
                                                        <Body>
                                                            <Text
                                                                style={{
                                                                    color:
                                                                        GlobalColors.light
                                                                }}
                                                            >
                                                                {strings(
                                                                    item.name
                                                                )}
                                                            </Text>
                                                        </Body>
                                                    </Left>
                                                    <Right>
                                                        <Icon
                                                            style={{
                                                                color:
                                                                    GlobalColors.light
                                                            }}
                                                            name="chevron-forward"
                                                        />
                                                    </Right>
                                                </CardItem>
                                            </Card>
                                        </Pressable>
                                    )}
                                />
                            </Tab>
                            <Tab heading={strings('Incomings')}>
                                <FlatList
                                    data={this._getFilteredCategories(
                                        'incoming'
                                    )}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    scrollEnabled={true}
                                    renderItem={({item}) => (
                                        <Pressable
                                            onPress={() => {
                                                this.props.navigation.navigate(
                                                    'CreateEditEntry',
                                                    {categorie: item}
                                                );
                                            }}
                                        >
                                            <Card>
                                                <CardItem transparent>
                                                    <Left>
                                                        <Icon
                                                            style={{
                                                                color:
                                                                    GlobalColors.light
                                                            }}
                                                            name={item.icon}
                                                        ></Icon>
                                                        <Body>
                                                            <Text
                                                                style={{
                                                                    color:
                                                                        GlobalColors.light
                                                                }}
                                                            >
                                                                {strings(
                                                                    item.name
                                                                )}
                                                            </Text>
                                                        </Body>
                                                    </Left>
                                                    <Right>
                                                        <Icon
                                                            style={{
                                                                color:
                                                                    GlobalColors.light
                                                            }}
                                                            name="chevron-forward"
                                                        />
                                                    </Right>
                                                </CardItem>
                                            </Card>
                                        </Pressable>
                                    )}
                                />
                            </Tab>
                        </Tabs>
                    </SafeAreaView>
                </ImageBackground>
            </Container>
        );
    }
}
export default CategoriesScreen;
