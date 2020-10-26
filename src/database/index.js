import VasernDB from './db';
import intervalJSON from './intervals.json';
import categoriesJSON from './categories.json';
import Error_Handler from '../Error_Handler';
import Queryable from 'vasern/vasern/src/core/vasern-queryable';
const {Entrys, MainEntrys, Categories, Intervals} = VasernDB;
let error_handler = new Error_Handler();

function _createIntervalsIfNotExist() {
    try {
        if (intervalJSON) {
            if (Intervals.data().length == 0) {
                Intervals.insert(intervalJSON, true);
                console.info('insert all');
            } else if (intervalJSON.length != Intervals.data().length) {
                console.info(
                    'else if',
                    intervalJSON.length,
                    Intervals.data().length
                );
            } else {
                console.info('_createIntervalsIfNotExist all in');
            }
        }
    } catch (error) {
        error_handler._handleError('_createIntervalsIfNotExist', error);
    }
}

function _createCategoriesIfNotExist() {
    try {
        if (categoriesJSON) {
            if (Categories.data().length == 0) {
                Categories.insert(categoriesJSON, true);
                console.info('insert all');
            } else if (categoriesJSON.length != Categories.data().length) {
                console.info(
                    'else if',
                    categoriesJSON.length,
                    Categories.data().length
                );

                _createMissingCategories();
            } else {
                console.info('_createCategoriesIfNotExist all in');
            }
        }
    } catch (error) {
        error_handler._handleError('_createCategoriesIfNotExist', error);
    }
}

function _createMissingCategories() {
    let categorieQueryObj = new Queryable(Categories.data());
    for (let i = 0; i < categoriesJSON.length; i++) {
        const element = categoriesJSON[i];
        var categorie = categorieQueryObj.get({name: element.name});
        if (!categorie) {
            Categories.insert(element, true);
        }
    }
}
/**
 * @deprecated Not in Use
 */
function _updateCategories() {
    Categories.update({name: 'Haushalt'}, {name: 'Household'}, true);
    Categories.update({name: 'Lebensmittel'}, {name: 'Food'}, true);
    Categories.update({name: 'Reisen'}, {name: 'Travels'}, true);
    Categories.update({name: 'Auto'}, {name: 'Car'}, true);
    Categories.update({name: 'Unterhaltung'}, {name: 'Entertainment'}, true);
    Categories.update({name: 'Bildung'}, {name: 'Education'}, true);
    Categories.update({name: 'Hobby'}, {name: 'Freetime'}, true);
    Categories.update({name: 'Tiere'}, {name: 'Pets'}, true);
    Categories.update({name: 'Geschenke'}, {name: 'Gifts'}, true);
    Categories.update({name: 'Arbeit'}, {name: 'Work'}, true);
    Categories.update({name: 'Familie'}, {name: 'Family_Friends'}, true);
    Categories.update({name: 'Gesundheit'}, {name: 'Healtcare'}, true);
    Categories.update({name: 'Spenden'}, {name: 'Donations'}, true);
    Categories.update({name: 'Sparen'}, {name: 'Saving'}, true);
    Categories.update({name: 'Rechnungen'}, {name: 'Bills'}, true);
    Categories.update({name: 'Versicherung'}, {name: 'Insurance'}, true);
    Categories.update({name: 'Sonstiges'}, {name: 'Others'}, true);
    Categories.update({name: 'Gehalt'}, {name: 'Salary'}, true);
}
/**
 * @deprecated Not in Use
 */
function _updateIntervals() {
    Intervals.update({name: 'einmalig'}, {name: 'Single'}, true);
    Intervals.update({name: 'monatlich'}, {name: 'Monthly'}, true);
    Intervals.update({name: 'alle 2 Monate'}, {name: 'Every2Months'}, true);
    Intervals.update({name: 'alle 3 Monate'}, {name: 'Every3Months'}, true);
    Intervals.update({name: 'alle 6 Monate'}, {name: 'Every6Months'}, true);
    Intervals.update({name: 'jährlich'}, {name: 'Yearly'}, true);
}
Intervals.onLoaded(() => {
    _createIntervalsIfNotExist();
});
Categories.onLoaded(() => {
    _createCategoriesIfNotExist();
});

export default VasernDB;
export {Entrys, MainEntrys, Categories, Intervals};
