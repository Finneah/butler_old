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
        this.setState({categories: Categories.data()});
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
                        <Title>{strings('Categorie')}</Title>
                    </Body>
                    <Right></Right>
                </Header>
                <Tabs>
                    <Tab heading={strings('Outgoings')}>
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
                    <Tab heading={strings('Incomings')}>
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
                </Tabs>
            </Container>
        );
    }
}
export default CategoriesScreen;
