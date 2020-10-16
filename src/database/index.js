import VasernDB from './db';
import intervalJSON from './intervals.json';
import categoriesJSON from './categories.json';
import Error_Handler from '../Error_Handler';
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
                console.info('all in');
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
            } else {
                console.info('all in');
            }
        }
    } catch (error) {
        error_handler._handleError('_createCategoriesIfNotExist', error);
    }
}
Intervals.onLoaded(() => {
    _createIntervalsIfNotExist();
});
Categories.onLoaded(() => {
    _createCategoriesIfNotExist();
});

export default VasernDB;
export {Entrys, MainEntrys, Categories, Intervals};
