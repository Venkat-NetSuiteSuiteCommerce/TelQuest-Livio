define('FakeMatrix.Quote.Model', [
    'Quote.Model',
    'underscore'
], function FakeMatrixQuoteModel(
    QuoteModel,
    _
) {
    // This was done to be able to place quotes before we confirm if the mandatory fields should be populated from the web or worklfow.
    _.extend(QuoteModel, {
        submit: function submit() {
            var newRecordId;
            var result;
            if (!this.record) {
                throw SC.ERROR_IDENTIFIERS.loadBeforeSubmit;
            }

            this.preSubmitRecord();

            newRecordId = nlapiSubmitRecord(this.record, false, true);
                // @class Transaction.Model.Confirmation
            result = {
                // @property {String} internalid
                internalid: newRecordId
            };

            return this.postSubmitRecord(result);
            // @class Transaction.Model
        }
    });
});
