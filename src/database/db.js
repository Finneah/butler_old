import Vasern from 'vasern';
import {CategorieSchema} from './Schemas/CategorieSchema';
import {EntrySchema} from './Schemas/EntrySchema';
import {IntervalSchema} from './Schemas/IntervalSchema';
import {MainEntrySchema} from './Schemas/MainEntrySchema';

const vasern = new Vasern({
    schemas: [EntrySchema, MainEntrySchema, CategorieSchema, IntervalSchema],
    version: 1
});
console.log(vasern);
export default vasern;
