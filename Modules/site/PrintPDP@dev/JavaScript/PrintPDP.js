define('PrintPDP', [
    'ProductDetails.Full.View',
    'PrintPDP.View',
    'underscore'
], function PrintPDP(
    ProductDetailsFullView,
    PrintPDPView
) {
    'use strict';

    ProductDetailsFullView.prototype.childViews.PrintPage = function PrintPage() {
        return new PrintPDPView({});
    };
});
