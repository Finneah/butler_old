export class MainEntrySchema {
    name = 'MainEntrys';
    props = {
        amount: 'string',
        categorie: '#Categories',
        interval: '#Intervals',
        description: 'string',
        periodFrom: '?datetime',
        periodTill: '?datetime',
        fixedCosts: 'boolean'
    };
}
