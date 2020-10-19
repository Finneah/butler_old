import {Component} from 'react';
import {Alert} from 'react-native';
import {strings} from './i18n';

export default class Error_Handler extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    // LOGFILE = RNFetchBlob.fs.dirs.DocumentDir + '/' + 'toolbox_errorlog.txt';

    _handleError(pos, err) {
        console.warn(err);
        Alert.alert(
            'SORRY',
            'SOMETHING_GONE_WRONG' +
                '\n' +
                pos +
                '\n' +
                (err.message ? err.message : err),
            [
                {
                    text: strings('Ok'),
                    onPress: () => {}
                }
            ]
        );
    }
    // _handleDefaultError(pos, err, withAlert = true) {
    //     console.info('_handleDefaultError', pos, err);
    //     RNFetchBlob.fs
    //         .appendFile(
    //             this.LOGFILE,
    //             pos +
    //                 ':\n' +
    //                 helper._getFormatedDate(Date.now()) +
    //                 '\n' +
    //                 (err.message ? err.message : strings('DEFAULT_ERROR')) +
    //                 '\nDevice Info: ' +
    //                 Platform.OS +
    //                 ' ' +
    //                 Platform.Version +
    //                 '\nApp Version: ' +
    //                 version +
    //                 ' (' +
    //                 build +
    //                 ')' +
    //                 '\n\n'
    //         )
    //         .then(() => {
    //             if (withAlert) {
    //                 Alert.alert(
    //                     strings('SORRY'),
    //                     strings('SOMETHING_GONE_WRONG') +
    //                         '\n' +
    //                         (err.message ? err.message : err),
    //                     [
    //                         {
    //                             text: strings('OK'),
    //                             onPress: () => {}
    //                         }
    //                     ]
    //                 );
    //             }
    //         });
    // }

    // _handleDBError(pos, err, withAlert = true) {
    //     console.info('_handleDBError', pos, err);
    //     RNFetchBlob.fs
    //         .appendFile(
    //             this.LOGFILE,
    //             pos +
    //                 ':\n' +
    //                 helper._getFormatedDate(Date.now()) +
    //                 '\n' +
    //                 (err.message ? err.message : err) +
    //                 '\nDevice Info: ' +
    //                 Platform.OS +
    //                 ' ' +
    //                 Platform.Version +
    //                 '\nApp Version: ' +
    //                 version +
    //                 ' (' +
    //                 build +
    //                 ')' +
    //                 '\n\n'
    //         )
    //         .then(() => {
    //             if (withAlert) {
    //                 Alert.alert(
    //                     this._getDBErrorString(pos),
    //                     strings('DEFAULT_ERROR'),
    //                     [
    //                         {
    //                             text: strings('OK'),
    //                             onPress: () => {}
    //                         }
    //                     ]
    //                 );
    //             }
    //         });
    // }

    // _secretLogging(pos, value) {
    //     console.info(pos, value);
    //     RNFetchBlob.fs.appendFile(
    //         this.LOGFILE,
    //         'SECRET ' +
    //             pos +
    //             ':\n' +
    //             helper._getFormatedDate(Date.now()) +
    //             '\n' +
    //             value +
    //             '\nDevice Info: ' +
    //             Platform.OS +
    //             ' ' +
    //             Platform.Version +
    //             '\nApp Version: ' +
    //             version +
    //             ' (' +
    //             build +
    //             ')' +
    //             '\n\n'
    //     );
    // }

    // _shareLogfile() {
    //     RNFetchBlob.fs.exists(this.LOGFILE).then((exist) => {
    //         if (exist) {
    //             Share.open({
    //                 title: strings('SHARE_WITH'),
    //                 url: 'file://' + this.LOGFILE,
    //                 subject:
    //                     strings('SHARE_LOGFILE_SUBJECT_TEXT') +
    //                     ' ' +
    //                     helper._getFormatedDate(Date.now())
    //             })
    //                 .then(() => {})
    //                 .catch((err) => {
    //                     console.info('_shareSheet', err);
    //                 });
    //         } else {
    //             Alert.alert(
    //                 strings('SHARE_LOGFILE_SUBJECT_TEXT'),
    //                 strings('NO_LOGFILE_EXIST'),
    //                 [
    //                     {
    //                         text: strings('OK'),
    //                         onPress: () => {}
    //                     }
    //                 ]
    //             );
    //         }
    //     });
    // }

    // _getDBErrorString(pos) {
    //     var pos = pos.replace('DBConnection ', '');
    //     switch (pos) {
    //         case '_prepareDB create':
    //         case '_prepareDB insert':
    //         case '_prepareDB':
    //         case '_alterTableSignatures':
    //         case '_alterTableMeasurements':
    //         case '_alterTableMeasurementSeries':
    //             return strings('DB_ERROR_PREPARE');

    //         default:
    //             return strings('SOMETHING_GONE_WRONG');
    //     }
    // }
}
