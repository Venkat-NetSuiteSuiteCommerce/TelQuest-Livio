define('FakeMatrix', [
    'Configuration',
    'FakeMatrix.CustomList.Values',
    'FakeMatrix.StoreItem.Model',
    'FakeMatrix.ProductList.Item.Search',
    'FakeMatrix.LiveOrder.Model',
    'FakeMatrix.Quote.Model'
], function FakeMatrix(
    Configuration
) {
    Configuration.publish = Configuration.publish || [];
    Configuration.publish.push({
        key: 'FakeMatrixCustomLists',
        model: 'FakeMatrix.CustomList.Values',
        call: 'getCustomLists'
    });
});

