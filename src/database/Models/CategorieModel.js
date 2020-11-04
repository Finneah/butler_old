import Queryable from 'vasern/vasern/src/core/vasern-queryable';
import {Categories} from '..';

import {CategorieSchema} from '../Schemas/CategorieSchema';

export class CategorieModel {
    get props() {
        var props = new CategorieSchema().props;
        return props;
    }

    getCategorieById = (id) => {
        let categorieQueryObj = new Queryable(Categories.data());
        return categorieQueryObj.get({
            id: id
        });
    };

    getCategorieByName = (name) => {
        let categorieQueryObj = new Queryable(Categories.data());
        return categorieQueryObj.get({
            name: name
        });
    };
    getCategorieByNameAndTyp = (name, typ) => {
        let categorieQueryObj = new Queryable(Categories.data());
        return categorieQueryObj.get({
            name: name,
            typ: typ
        });
    };
}
