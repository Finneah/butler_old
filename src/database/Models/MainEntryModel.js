import Queryable from 'vasern/vasern/src/core/vasern-queryable';
import {MainEntrys} from '..';

import {MainEntrySchema} from '../Schemas/MainEntrySchema';

export class MainEntryModel {
    get props() {
        var props = new MainEntrySchema().props;
        return props;
    }

    getMainEntryById = (id) => {
        let mainEntryQueryObj = new Queryable(MainEntrys.data());
        return mainEntryQueryObj.get({
            id: id
        });
    };
}
