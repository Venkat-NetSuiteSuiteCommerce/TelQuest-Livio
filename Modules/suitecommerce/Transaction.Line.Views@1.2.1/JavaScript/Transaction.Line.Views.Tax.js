/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Transaction.Line.Views.Tax
define(
	'Transaction.Line.Views.Tax'
,	[
		'transaction_line_views_tax.tpl'

	,	'Backbone'
	]
,	function(
		transaction_line_views_tax_tpl

	,	Backbone
	)
{
	'use strict';

	// @class Transaction.Line.Views.Tax @extends Backbone.View
	return Backbone.View.extend({

		template: transaction_line_views_tax_tpl

		//@method initialize
		//@param {Transaction.Line.Views.Tax.Options} options
		//@return {Void}
	,	initialize: function ()
		{
			this.model.on('change:quantity', function ()
			{
				this.render();
			}, this);
		}

		//@method getContext
		//@return {Transaction.Line.Views.Tax.Context}
	,	getContext: function ()
		{
			//@class Transaction.Line.Views.Tax.Context
			return {
				showTax: !!this.model.get('tax1_amount') || !!this.model.get('tax_amount')
			,	taxRate: this.model.get('tax_rate1') || this.model.get('tax_rate')
			,	taxAmount: this.model.get('tax1_amount_formatted') || this.model.get('tax_amount_formatted')
			};
			//@class Transaction.Line.Views.Tax.Context
		}
	});
});