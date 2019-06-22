define('Site.OrderHistory.Model', [
    'OrderHistory.Model',
    'underscore',
    'Transaction.Model',
    'Transaction.Model.Extensions'
], function SiteOrderHistoryModel(
    OrderHistoryModel,
    _
) {
    'use strict';

    OrderHistoryModel._addTransactionColumnFieldsToOptions = function _addTransactionColumnFieldsToOptions(line) {
        var self = this;
        var lineFieldsId = self.record.getAllLineItemFields('item');
        _.each(lineFieldsId, function eachLine(field) {
            var lineId;
            var fieldValue;
            var fieldInf;
            if (field.indexOf('custcol') === 0) {
                lineId = line.index;
                fieldValue = self.record.getLineItemValue('item', field, lineId);
                if (fieldValue !== null) {
                    fieldInf = self.record.getLineItemField('item', field, lineId);
                    if (fieldInf) {
                        line.options.push(
                            self.transactionModelGetLineOptionBuilder(
                                field,
                                fieldInf.label,
                                self.transactionModelGetLineOptionValueBuilder(undefined, fieldValue),
                                fieldInf.mandatory
                            )
                        );
                    } else {
                        nlapiLogExecution('DEBUG', 'Info of transaction column field cannot be obtained', field);
                    }
                }
            }
        });
    };
});
