/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Invoice
define('Invoice.Date.View'
,	[
		'invoice_date.tpl'

	,	'Backbone'
	]
, 	function (
		invoice_date_tpl

	,	Backbone
	)
{
	'use strict';
	//@class Invoice.Date.View @extends Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: invoice_date_tpl

		//@method getContext @returns {Invoice.Date.View.Context}
	,	getContext: function ()
		{
			//@class Invoice.Date.View.Context
			return {
					//@property {String} dueDate
					dueDate: this.model.get('dueDate') || ''
					//@property {Boolean} showOverdueFlag
				,	showOverdueFlag: !!this.model.get('isOverdue')
					//@property {Boolean} showPartiallyPaid
				,	showPartiallyPaid: !!this.model.get('isPartiallyPaid')
			};
		}

	});
});