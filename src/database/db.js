import Vasern from 'vasern';

import {CategorieSchema} from './Schemas/CategorieSchema';
import {EntrySchema} from './Schemas/EntrySchema';
import {IntervalSchema} from './Schemas/IntervalSchema';
import {MainEntrySchema} from './Schemas/MainEntrySchema';

const vasern = new Vasern({
    schemas: [IntervalSchema, CategorieSchema, MainEntrySchema, EntrySchema],
    version: 1
});

export default vasern;
