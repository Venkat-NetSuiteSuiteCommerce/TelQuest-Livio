define('FakeMatrix.Item.Model.Url', [
    'Item.Model',
    'underscore'
], function FakeMatrixItemModelUrl(
    ItemModel,
     _
) {
    'use strict';

    _.extend(ItemModel.prototype, {
        generateURL: function generateURL() {
            var ret;
            var parametersForUrl;
            if (this.get('_getParentUrl')) {
                parametersForUrl = this.get('_getChildSelectedOptions');
                ret = this.get('_getParentUrl');
                ret = _.addParamsToUrl(ret, parametersForUrl);
            } else {
                ret = this.get('_url');
            }
            return ret;
        }
    });
});

