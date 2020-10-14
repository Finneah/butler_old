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

import {FlatList, Pressable} from 'react-native';

import {Queryable} from 'vasern/vasern/src/core';

import {strings} from '../i18n';

import {Categories} from '../database';
import categoriesJSON from '../database/categories.json';
const queryObj = new Queryable(Categories.data());
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
        Categories.onLoaded(() => {
            console.log('onLoaded', Categories.data());
            this._createCategoriesIfNotExist();
        });
        Categories.onChange(() => {
            console.log('onChange', Categories.data());
            this.setState({categories: Categories.data()});
        });
    }

    _createCategoriesIfNotExist() {
        // if (categoriesJSON) {
        //     categoriesJSON.forEach((element) => {
        //         var categorie = queryObj.get({name: element.name});
        //         Categories.remove({name: element.name});
        //         if (!categorie) {
        //             console.log(categorie, element);
        //             // Categories.insert(element, true);
        //         }
        //     });
        // }

        if (categoriesJSON) {
            if (Categories.data().length == 0) {
                Categories.insert(categoriesJSON, true);
                console.log('insert all');
            } else if (categoriesJSON.length != Categories.data().length) {
                console.log(
                    'else if',
                    categoriesJSON.length,
                    Categories.data().length
                );
            } else {
                console.log('all in');
                this.setState({categories: Categories.data()});
            }
        }
    }

    _getFilteredCategories(typ) {
        var {categories} = this.state;

        if (categories) {
            var data = categories.filter((a) => {
                if (a.typ == typ) {
                    return a;
                }
            });
        }

        return data ? data : [];
    }

    render() {
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
                        <Title>{strings('CATEGORIES')}</Title>
                    </Body>
                    <Right></Right>
                </Header>
                <Tabs>
                    <Tab heading={strings('INCOMINGS')}>
                        <FlatList
                            data={this._getFilteredCategories('incoming')}
                            keyExtractor={(item, index) => index.toString()}
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
                                                <Icon name={item.icon}></Icon>
                                                <Body>
                                                    <Text>{item.name}</Text>
                                                </Body>
                                            </Left>
                                            <Right>
                                                <Icon name="chevron-forward" />
                                            </Right>
                                        </CardItem>
                                    </Card>
                                </Pressable>
                            )}
                        />
                    </Tab>
                    <Tab heading={strings('OUTGOINGS')}>
                        <FlatList
                            data={this._getFilteredCategories('outgoing')}
                            keyExtractor={(item, index) => index.toString()}
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
                                                <Icon name={item.icon}></Icon>
                                                <Body>
                                                    <Text>{item.name}</Text>
                                                </Body>
                                            </Left>
                                            <Right>
                                                <Icon name="chevron-forward" />
                                            </Right>
                                        </CardItem>
                                    </Card>
                                </Pressable>
                            )}
                        />
                    </Tab>
                </Tabs>
            </Container>
        );
    }
}
export default CategoriesScreen;
