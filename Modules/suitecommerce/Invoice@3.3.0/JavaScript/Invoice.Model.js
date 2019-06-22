/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Invoice
define('Invoice.Model'
,	[
		'Transaction.Collection'
	,	'Transaction.Model'
	,	'underscore'
	,	'Utils'
	]
,	function (
		TransactionCollection
	,	TransactionModel
	,	_
	)
{
	'use strict';

	function validatePayment (value)
	{
		value = parseFloat((value+'').replace(',', '.'));

		if (isNaN(value))
		{
			return _('The amount to pay is not a valid number').translate();
		}
		if (value <= 0)
		{
			return _('The amount to apply has to be positive').translate();
		}
		/*jshint validthis:true */
		if (value > this.get('due'))
		{
			return _('The amount to pay cannot exceed the remaining').translate();
		}
	}
	//@class Invoice.Model @extends Backbone.Model
	return TransactionModel.extend({
		//@property {String} urlRoot
		urlRoot: 'services/Invoice.Service.ss'
		//@property {Object} validation
	,	validation : {
			amount: { fn: validatePayment }
		}
		//@property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
	,	cacheSupport: true
		//@method initialize
	,	initialize: function (attributes)
		{
			// call the initialize of the parent object, equivalent to super()
			TransactionModel.prototype.initialize.apply(this, arguments);

			this.on('change:adjustments', function (model, adjustments)
			{
				model.set('adjustments', new TransactionCollection(adjustments), {silent: true});
			});
			this.trigger('change:adjustments', this, attributes && attributes.adjustments || []);

		}
		//@method isPayFull
	,	isPayFull: function()
		{
			if (this.get('discountapplies'))
			{
				return this.get('amount') === this.get('duewithdiscount');
			}
			else
			{
				return this.get('amount') === this.get('due');
			}
		}
	});
});
