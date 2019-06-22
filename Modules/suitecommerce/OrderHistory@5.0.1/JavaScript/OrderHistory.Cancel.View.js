/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReturnAuthorization
define(
	'OrderHistory.Cancel.View'
,	[	'order_history_cancel.tpl'

	,	'Backbone'
	]
,	function (
		order_history_cancel_tpl
	,	Backbone
	)
{
	'use strict';

	//@class ReturnAuthorization.Cancel.View @extend Backbone.Vie
	return Backbone.View.extend({

		template: order_history_cancel_tpl

	,	events: {
			'click [data-action="delete"]': 'confirm'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
		}

	,	confirm: function ()
		{
			this.model.set('status', 'cancelled', {silent: true});
			this.model.save();
		}

		//@method getContext @returns OrderHistory.Cancel.View.Context
	,	getContext: function()
		{
			//@class OrderHistory.Cancel.View.Context
			return {
				//@property {OrderHistory.Model} model
				model: this.model
			};
		}

	});
});