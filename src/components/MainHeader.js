import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import GlobalColors from '../style/GlobalColors';
export class MainHeader extends Component {
    constructor(props) {
        this.props = props;
    }

    render() {
        return (
            <SafeAreaView style={styles.header}>
                <Button
                    style={styles.leftButton}
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
                                        Entrys.data().forEach(function (item) {
                                            db.remove(item);
                                        });
                                    });

                                    MainEntrys.perform(function (db) {
                                        MainEntrys.data().forEach(function (
                                            item
                                        ) {
                                            db.remove(item);
                                        });
                                    });
                                }
                            }
                        ]);
                    }}
                >
                    <ButlerIcon size={50} />
                </Pressable>
                <Button
                    large
                    style={{
                        backgroundColor: GlobalColors.accentColor,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        top: 25,
                        right: 10
                    }}
                    rounded
                >
                    <Icon
                        style={{
                            color: GlobalColors.lightGrey,
                            fontSize: 40
                        }}
                        name="add"
                        onPress={() => {
                            this.props.navigation.navigate('Entrys', {
                                screen: 'CreateEditEntry',
                                params: {}
                            });
                        }}
                    ></Icon>
                </Button>
            </SafeAreaView>
        );
    }
}
