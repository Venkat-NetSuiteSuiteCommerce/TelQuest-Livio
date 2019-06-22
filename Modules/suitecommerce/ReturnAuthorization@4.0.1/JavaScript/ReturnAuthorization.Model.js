/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReturnAuthorization
define('ReturnAuthorization.Model'
,	[
		'Transaction.Collection'
	,	'Transaction.Model'
	]
,	function (
		TransactionCollection
	,	TransactionModel
	)
{
	'use strict';

	//@class ReturnAuthorization.Model @extend Backbone.Model
	return TransactionModel.extend({

		//@property {String} urlRoot
		urlRoot: 'services/ReturnAuthorization.Service.ss'

		//@property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
	,	cacheSupport: true
		//@method initialize
		//@param {Object} attributes
	,	initialize: function (attributes)
		{
			// call the initialize of the parent object, equivalent to super()
			TransactionModel.prototype.initialize.apply(this, arguments);

			this.on('change:applies', function (model, applies)
			{
				model.set('applies', new TransactionCollection(applies), {silent: true});
			});

			this.trigger('change:applies', this, attributes && attributes.lines || []);
		}
	});
});