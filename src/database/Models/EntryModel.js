import Queryable from 'vasern/vasern/src/core/vasern-queryable';
import {Entrys} from '..';
import {EntrySchema} from '../Schemas/EntrySchema';
import {MainEntrySchema} from '../Schemas/MainEntrySchema';

export class EntryModel {
    get props() {
        var props = new EntrySchema().props;
        props.mainEntry = new MainEntrySchema().props;
        return props;
    }

    getEntrysForYearAndMonth = (year, month) => {
        let entryQueryObj = new Queryable(Entrys.data());
        return entryQueryObj
            .filter({
                year: year.toString(),
                month: month.toString()
            })
            .data();
    };
}
