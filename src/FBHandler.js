import {Component} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
export default class FBHandler extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.COLLECTIONS = {
            BUTLER: {
                key: 'butlers',
                COLLECTIONS: {
                    entrys: {
                        key: 'entrys',
                        FIELDS: {
                            main_entry_id: 'main_entry_id',
                            month: 'month',
                            year: 'year'
                        }
                    },
                    main_entrys: {
                        key: 'main_entrys',
                        FIELDS: {
                            amount: 'amount',
                            category_id: 'category_id',
                            interval_id: 'interval_id',
                            name: 'name',
                            periodFrom: 'periodFrom',
                            periodTill: 'periodTill',
                            typ: 'typ'
                        }
                    }
                }
            },
            CATEGORIES: {
                key: 'categories',
                FIELDS: {name: 'name', typ: 'typ'}
            },
            INTERVALS: {key: 'intervals', FIELDS: {key: 'key', name: 'name'}}
        };
        this.firebaseConfig = {
            apiKey: 'AIzaSyCo-88b6nlcw0s3rO_2IMK58DCmyffyuIQ',
            authDomain: 'butler-85407.firebaseapp.com',
            databaseURL: 'https://butler-85407.firebaseio.com',
            projectId: 'butler-85407',
            appId: '1:658736662807:ios:01fed38f2fe3cbad3b8f52'
        };
        // Your secondary Firebase project credentials for Android...
        this.androidCredentials = {
            clientId: '',
            appId: '',
            apiKey: '',
            databaseURL: '',
            storageBucket: '',
            messagingSenderId: '',
            projectId: ''
        };

        // Your secondary Firebase project credentials for iOS...
        this.iosCredentials = {
            appId: '1:658736662807:ios:01fed38f2fe3cbad3b8f52',
            apiKey: 'AIzaSyCo-88b6nlcw0s3rO_2IMK58DCmyffyuIQ',
            databaseURL: 'https://butler-85407.firebaseio.com',
            projectId: 'butler-85407'
        };

        // Select the relevant credentials
        this.credentials = Platform.select({
            android: androidCredentials,
            ios: iosCredentials
        });

        this.config = {
            name: 'butler'
        };
    }

    _loginUser(e_mail, password, callback) {
        // Your secondary Firebase project credentials...

        firebase.initializeApp(this.credentials, this.config).then((res) => {
            console.log(res);
            // auth()
            //     .signInWithEmailAndPassword(e_mail, password)
            //     .then((res) => {
            //         // check DB

            //         callback(res.user);
            //         // get data from db
            //     })
            //     .catch(function (error) {
            //         // Handle Errors here.
            //         var errorCode = error.code;
            //         var errorMessage = error.message;
            //         console.warn(errorCode, errorMessage);
            //         if (errorCode === 'auth/email-already-in-use') {
            //             console.log('That email address is already in use!');
            //         } else if (errorCode === 'auth/invalid-email') {
            //             console.log('That email address is invalid!');
            //         } else {
            //             console.error(errorCode, errorMessage);
            //         }
            //         callback(false);
            //     });
        });
    }

    async _createButler(user) {
        var entrysRef = await firestore()
            .collection(this.COLLECTIONS.BUTLER.key)
            .doc(user.uid)
            .collection(this.COLLECTIONS.BUTLER.COLLECTIONS.entrys.key);
        var mainEntrysRef = await firestore()
            .collection(this.COLLECTIONS.BUTLER.key)
            .doc(user.uid)
            .collection(this.COLLECTIONS.BUTLER.COLLECTIONS.main_entrys.key);

        mainEntrysRef
            .doc()
            .set({})
            .then(function () {
                entrysRef.doc().set({});

                return user;
            })
            .catch(function (error) {
                console.error('Error adding document: ', error);
            });

        return user;
    }

    async _createUser(e_mail, password, callback) {
        auth()
            .createUserWithEmailAndPassword(e_mail, password)
            .then(async (res) => {
                console.log('createUserWithEmailAndPassword', res);
                // create DB with res.user.uid
                if (res.user.uid) {
                    var user = await this._createButler(res.user);
                    callback(user);
                } else {
                    console.warn('NO USER!!');
                    callback(user);
                }
            })
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.warn(errorCode, '_createUser ' + errorMessage);
            });
    }
}

// const mapStateToProps = state => {
//   return {user: state.user.user};
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     onSetUser: user => dispatch(setUser(user)),
//   };
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps,
// )(FBHandler);
