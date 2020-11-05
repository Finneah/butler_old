export class MainEntrySchema {
    name = 'MainEntrys';
    props = {
        fixedCosts: 'string',
        description: 'string',
        amount: 'string',
        categorie: '#Categories',
        interval: '#Intervals',
        periodFrom: '?datetime',
        periodTill: '?datetime',
        badge: '?string'
    };
}
