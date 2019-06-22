define('PrintPDP.View', [
    'print_pdp.tpl',
    'underscore',
    'Backbone'
], function PrintPDPView(
    printPDPTpl,
    _,
    Backbone
) {
    'use strict';

    return Backbone.View.extend({
        template: printPDPTpl,
        events: {
            'click [data-toggle="print-page"]': 'printPage'
        },
        printPage: function clearCart() {
            window.print();
        }
    });
});
