define('AddonItems.OrderHistory.Hooks', [
    'Application',
    'underscore'
], function AddonItemsOrderHistoryHooks(
    Application
) {
    'use strict';

    Application.on('before:OrderHistory.getLines', function BeforeOrderHistorySetLines() {
        // I needed the input, in order to format the output. That's why on the before i save the placed order reference
        Application.once('after:OrderHistory.getLines', function AfterOrderHistorySetLines(model) {
            model.rearrangeLinesForAddonItems();
        });
    });
});

