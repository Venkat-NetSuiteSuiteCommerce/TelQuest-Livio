/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module DepositApplication
define('DepositApplication.Model'
,	[	'Invoice.Collection'
	,	'Transaction.Model'
	]
,	function (
		InvoiceCollection
	,	TransactionModel
	)
{
	'use strict';

	//@class DepositApplication.Model @extend Backbone.Model
	return TransactionModel.extend({

		urlRoot: 'services/DepositApplication.Service.ss'

		//@property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
	,	cacheSupport: true

	,	initialize: function (attributes)
		{
			// call the initialize of the parent object, equivalent to super()
			TransactionModel.prototype.initialize.apply(this, arguments);

			this.on('change:invoices', function (model, invoices)
			{
				model.set('invoices', new InvoiceCollection(invoices), { silent: true });
			});

			this.trigger('change:invoices', this, attributes && attributes.invoices || []);
		}
	});
});
