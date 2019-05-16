define('AddonItems.LiveOrder.Hooks', [
    'Application'
], function AddonItemsLiveOrderHooks(
    Application

) {
    'use strict';

    Application.on('before:LiveOrder.addLines',
        function beforeLiveOrderAddLinesAddonItems(Model, lines) {
            Model.addAddonItems(lines);
        });

    Application.on('before:LiveOrder.removeLine',
        function beforeLiveOrderRemoveLine(Model, currentLine) {
            Model.removeAddonItem(currentLine);
        });

    Application.on('after:LiveOrder.getLines', function afterGetLines(Model, lines) {
        Model.reformatLines(lines);
    });
});
