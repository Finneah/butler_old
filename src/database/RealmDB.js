import Realm from 'realm';

class RealmDB {
    constructor() {
        Realm.open({
            schema: [
                {
                    name: 'Entrys',
                    properties: {
                        month: 'int',
                        year: 'int',
                        mainEntry: 'MainEntrys'
                    }
                },
                {
                    name: 'MainEntrys',
                    properties: {
                        amount: 'float',
                        categorie: 'Categories',
                        interval: 'Intervals',
                        description: 'string',
                        periodFrom: 'date?',
                        periodTill: 'date?'
                    }
                },
                {
                    name: 'Categories',
                    properties: {
                        name: 'string',
                        icon: 'string',
                        typ: 'string'
                    }
                },
                {
                    name: 'Intervals',
                    properties: {
                        key: 'string',
                        name: 'string'
                    }
                }
            ]
        })
            .then((realm) => {
                console.log(realm);
            })
            .catch((error) => {
                console.log(error);
            });
    }
}

export default RealmDB;
