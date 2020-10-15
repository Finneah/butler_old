import React, {Component} from 'react';
import {Vibration} from 'react-native';
import {strings} from './i18n';

import moment from 'moment';

export default class Helper extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    _getFormatedDate(date, withoutTime) {
        const regex = /^(\d{4}-\d{2}-\d{2})( )(\d{2}:\d{2}:\d{2})$/gm;
        if (regex.test(date) === true) {
            date = date.replace(' ', 'T');
        }
        var formatedDate = moment(date).format('DD.MM.YYYY');
        var formatedTime = moment(date).format('HH:mm:ss');
        formatedTime = formatedTime != '00:00:00' ? formatedTime : '';
        if (withoutTime) {
            return formatedDate;
        }
        return formatedDate + ' ' + formatedTime + ' ' + strings('CLOCK');
    }

    _getFormatedShortDate(date, withoutTime) {
        const regex = /^(\d{4}-\d{2}-\d{2})( )(\d{2}:\d{2}:\d{2})$/gm;
        if (regex.test(date) === true) {
            date = date.replace(' ', 'T');
        }
        var formatedDate = moment(date).format('DD.MM.YYYY');
        var formatedTime = moment(date).format('HH:mm');
        formatedTime = formatedTime != '00:00' ? formatedTime : '';
        if (withoutTime) {
            return formatedDate;
        }
        return formatedDate + ' ' + formatedTime;
    }

    _getPLZRegEx() {
        return /^([0]{1}[1-9]{1}|[1-9]{1}[0-9]{1})[0-9]{3}$/;
    }

    _getEmailRegEx() {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    }

    _checkValidFloatRegEx(string) {
        const regex = /(?:^\d{1,}$)|(?:^\d{1,}(\,|\.){0,1}\d{1,2}$)/gm;

        string = string == undefined ? '' : string;
        if (string == '') {
            return true;
        }
        if (regex.test(string) == true) {
            return true;
        }

        return false;
    }
    _checkValidIntegerRegEx(integer) {
        const regex = /(?:^\d{1,}$)/gm;

        integer = integer == undefined ? '' : integer;
        if (integer == '') {
            return true;
        }
        if (regex.test(integer) == true) {
            return true;
        }

        return false;
    }
    _checkValidIntegerMax99RegEx(integer) {
        const regex = /(?:^\d{1,2}$)/gm;

        integer = integer == undefined ? '' : integer;
        if (integer == '') {
            return true;
        }
        if (regex.test(integer) == true) {
            return true;
        }

        return false;
    }

    _expectToBeString(string) {
        if (typeof string == 'string') {
            return true;
        }
        return false;
    }

    _expectToBeInteger(integer) {
        if (typeof integer == 'number') {
            return true;
        }
        return false;
    }

    isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    }

    _capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    _vibrate = () => {
        Vibration.vibrate([500, 500], false);
    };

    _getDates(startDate, stopDate, interval) {
        Date.prototype.addMonths = function (months) {
            var date = new Date(this.valueOf());
            date.setMonth(date.getMonth() + months);
            return date;
        };
        function getDates(startDate, stopDate, interval) {
            var dateArray = new Array();
            var currentDate = startDate;
            if (interval == 0) {
                dateArray.push(startDate);
                return dateArray;
            }

            while (currentDate <= stopDate) {
                dateArray.push(new Date(currentDate));

                currentDate = currentDate.addMonths(interval);
            }
            return dateArray;
        }
        return getDates(startDate, stopDate, interval);
    }
}
