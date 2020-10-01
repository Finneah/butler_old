import firestore from '@react-native-firebase/firestore';
import {
    Container,
    Header,
    Title,
    Body,
    Content,
    Form,
    Item,
    Label,
    Input,
    Toast,
    Thumbnail
} from 'native-base';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {JSHash, CONSTANTS} from 'react-native-hash';
import {connect} from 'react-redux';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import ButlerIcon from '../components/Icons/ButlerIcon';
import FBHandler from '../FBHandler';
import {toggleIsLoggedIn, setUser} from '../store/user_actions';
import {strings} from '../i18n';
import GlobalStyles from '../style/GlobalStyles';
import LoadingSpinner from '../components/ActivityIndicator/LoadingSpinner';

let fbHandler = new FBHandler();
class AuthScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: false,
            error_email: false,
            error_password: false,
            error_comparePassword: false,
            e_mail: 'jennifer.schnaible86@gmail.com',
            password: '123456',
            comparePassword: '123456',
            user: undefined,
            viewLogin: true,
            showLoadingSpinner: false
        };
        this.props = props;
    }

    /**
     * @description if LoginView: show to RegisterView
     * if RegisterView: checkValues and callback auth register
     */
    _registerButtonHandler() {
        try {
            if (this.state.isLogin) {
                // go to registerView
                this.setState({isLogin: false});
            } else {
                if (this._checkValues()) {
                    //Register

                    JSHash(this.state.password, CONSTANTS.HashAlgorithms.sha256)
                        .then((hash) => {
                            this._fbCreateUserWithButlerDB(
                                this.state.e_mail,
                                hash
                            );
                        })
                        .catch((e) => console.error(e));
                }
            }
        } catch (error) {
            console.warn('ERROR', '_registerButtonHandler ' + error);
        }
    }

    /**
     * @description if LoginView: checkValues and callback auth login
     * if RegsiterView: show LoginView
     */
    _loginButtonHandler() {
        try {
            if (!this.state.isLogin) {
                // go to registerView
                this.setState({isLogin: true});
            } else {
                if (this._checkValues()) {
                    //Register

                    JSHash(this.state.password, CONSTANTS.HashAlgorithms.sha256)
                        .then((hash) => {
                            this._fBLogin(this.state.e_mail, hash);
                        })
                        .catch((e) => console.warn(e));
                }
            }
        } catch (error) {
            console.warn('ERROR', '_loginButtonHandler ' + error);
        }
    }

    /**
     * @todo Add Function to HelperClass
     * @description return regEx for E-mail
     * @returns regEx
     */
    _getEmailRegEx() {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    }

    /**
     * @todo Add Function to HelperClass
     * @description return regEx for Rassword
     * @returns regEx
     */
    _getPasswordRegEx() {
        return /^(?=.*[$&+,:;=?@#|'<>.-^*()%!])(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9$&+,:;=?@#|'<>.-^*()%!]{8,})$/;
    }

    /**
     * @todo Add Alert instead of Toast
     * @description check E-Mail, Password and ComparePassword
     * show Error Toast
     * @returns isValid
     */
    _checkValues() {
        try {
            var {e_mail, password, comparePassword, isLogin} = this.state;
            this.setState({
                error_email: false,
                error_password: false,
                error_comparePassword: false
            });
            const regEmail = this._getEmailRegEx();
            const regPassword = this._getPasswordRegEx();

            var error_email = e_mail && regEmail.test(e_mail) ? false : true;

            var error_password = isLogin
                ? false
                : password && regPassword.test(password)
                ? false
                : true;

            var error_comparePassword =
                comparePassword && comparePassword === password ? false : true;

            var isError =
                error_email || error_password || isLogin
                    ? false
                    : error_comparePassword;

            this.setState({
                error_email: error_email,
                error_password: error_password,
                error_comparePassword: isLogin ? false : error_comparePassword
            });

            var text = 'Fehler!';

            if (!isLogin) {
                // RegisterView
                if (error_email) {
                    text +=
                        '\nDie E-Mail Adresse entspricht nicht den vorgaben';
                }
                if (error_password) {
                    text +=
                        '\nPasswortregeln:' +
                        '\nMindestens 8 Buchstaben' +
                        '\nMindestens 1 Zahl' +
                        "\nMindestens 1 Sonderzeichen ($&+,:;=?@#|'<>.-^*()%!)" +
                        '\nMindestens 1 Großbuchstaben (a-z)' +
                        '\nMindestens 1 Kleinbuchstaben (A-Z)';
                } else if (error_comparePassword) {
                    text += '\nDie Passwörter stimmen nicht überein';
                }
            } else {
                // LoginView
                if (error_email || error_password) {
                    text = 'E-Mail oder Passwort ist falsch';
                }
            }
            if (isError) {
                Toast.show({
                    text: text,
                    buttonText: 'Okay',
                    duration: 5000,
                    type: 'danger'
                });
                return false;
            }
            return true;
        } catch (error) {
            console.warn('ERROR', '_checkValues ' + error);
        }
    }
    /**
     * create user
     * create butler
     * @param {string} e_mail
     * @param {string} password
     */
    _fbCreateUserWithButlerDB(e_mail, password) {
        this.setState({showLoadingSpinner: true});
        fbHandler._createUser(e_mail, password, (user) => {
            if (user && user.email) {
                this.setState({showLoadingSpinner: false});
                this.props.onSetIsLoggedIn(true);
                this.props.onSetUser(user);
            }
        });
    }

    _fBLogin(e_mail, password) {
        this.setState({showLoadingSpinner: true});
        fbHandler._loginUser(e_mail, password, async (user) => {
            if (user == false) {
                this.setState({showLoadingSpinner: false});
            } else if (user && user.email) {
                await firestore()
                    .collection(fbHandler.COLLECTIONS.BUTLER.key)
                    .doc(user.uid)
                    .get()
                    .then(async (documentSnapshot) => {
                        console.log('Doc exists: ', documentSnapshot.exists);

                        if (documentSnapshot.exists) {
                            console.log('Doc data: ', documentSnapshot.data());
                            this.setState({showLoadingSpinner: false});
                            this.props.onSetIsLoggedIn(true);
                            this.props.onSetUser(user);
                        } else {
                            console.log(documentSnapshot);
                            await fbHandler._createButler(user);
                            this._fBLogin(e_mail, password);
                        }
                    });
            }
        });
    }
    /**
     * @description if LoginView: show PasswordItem
     * if RegisterView: show PasswordItem and ComparePasswordItem
     * @param {object} params params for PasswortItems
     * @returns PassworItem forLoginView or passwordItems for registerView
     */
    _renderPasswordItems(params) {
        if (params.isLogin) {
            return (
                <Item floatingLabel>
                    <Label>{strings('PASSWORD')}</Label>
                    <Input
                        value={params.password}
                        onChangeText={(text) =>
                            params.onSetPassword({password: text})
                        }
                        secureTextEntry={true}
                    />
                </Item>
            );
        } else {
            return (
                <>
                    <Item
                        floatingLabel
                        success={!params.error_password}
                        error={params.error_password}
                    >
                        <Label>{strings('PASSWORD')}</Label>
                        <Input
                            value={params.password}
                            onChangeText={(text) =>
                                params.onSetPassword({password: text})
                            }
                            secureTextEntry={true}
                        />
                    </Item>
                    <Item
                        floatingLabel
                        success={!params.error_comparePassword}
                        error={params.error_comparePassword}
                    >
                        <Label>{strings('REPEAT_PASSWORD')}</Label>
                        <Input
                            value={params.comparePassword}
                            onChangeText={(text) =>
                                params.onSetPassword({comparePassword: text})
                            }
                            secureTextEntry={true}
                        />
                    </Item>
                </>
            );
        }
    }

    render() {
        const {showLoadingSpinner} = this.state;
        return (
            <Container>
                <Header>
                    <Body>
                        <Title>{strings('APP_TITLE')}</Title>
                    </Body>
                </Header>

                <Content
                    padder
                    style={[styles.innerContainer]}
                    contentContainerStyle={{flex: 1}}
                >
                    <LoadingSpinner showLoadingSpinner={showLoadingSpinner} />
                    <View
                        style={{
                            flex: 2,
                            maxHeight: GlobalStyles.height * 0.3
                        }}
                    >
                        <ButlerIcon />
                    </View>

                    {showLoadingSpinner ? null : (
                        <>
                            <Form style={styles.formStyle}>
                                <Item
                                    floatingLabel
                                    success={!this.state.error_email}
                                    error={this.state.error_email}
                                >
                                    <Label>E-Mail</Label>
                                    <Input
                                        keyboardType="email-address"
                                        value={this.state.e_mail}
                                        onChangeText={(text) =>
                                            this.setState({
                                                e_mail: text
                                            })
                                        }
                                    />
                                </Item>
                                <this._renderPasswordItems
                                    password={this.state.password}
                                    comparePassword={this.state.comparePassword}
                                    onSetPassword={(oPassword) => {
                                        this.setState(oPassword);
                                    }}
                                    onSetcomparePassword={(oPassword) => {
                                        this.setState(oPassword);
                                    }}
                                    isLogin={this.state.isLogin}
                                    error_password={this.state.error_password}
                                    error_comparePassword={
                                        this.state.error_comparePassword
                                    }
                                />
                            </Form>
                            <View
                                style={[
                                    {paddingTop: 10, flex: 1},
                                    GlobalStyles.rowSpaceAround
                                ]}
                            >
                                <PrimaryButton
                                    text={strings('LOGIN')}
                                    transparent={!this.state.isLogin}
                                    onPress={() =>
                                        this._loginButtonHandler(
                                            this.props.onPressLogin
                                        )
                                    }
                                />
                                <PrimaryButton
                                    text={strings('REGISTER')}
                                    onPress={() =>
                                        this._registerButtonHandler(
                                            this.props.onPressRegister
                                        )
                                    }
                                    transparent={this.state.isLogin}
                                />
                            </View>
                        </>
                    )}
                </Content>
            </Container>
        );
    }
}
const styles = StyleSheet.create({
    innerContainer: {
        flex: 1
    },

    formStyle: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    }
});
const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        user: state.user.user
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        onSetIsLoggedIn: (isLoggedIn) => dispatch(toggleIsLoggedIn(isLoggedIn)),
        onSetUser: (user) => dispatch(setUser(user))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthScreen);
