import Queryable from 'vasern/vasern/src/core/vasern-queryable';
import {Intervals} from '..';
import {IntervalSchema} from '../Schemas/IntervalSchema';

export class IntervalModel {
    get props() {
        var props = new IntervalSchema().props;
        return props;
    }

    getIntervalById = (id) => {
        let intervalQueryObj = new Queryable(Intervals.data());
        return intervalQueryObj.get({
            id: id
        });
    };

    getIntervalByKey = (key) => {
        let intervalQueryObj = new Queryable(Intervals.data());
        return intervalQueryObj.get({
            key: key
        });
    };
}
