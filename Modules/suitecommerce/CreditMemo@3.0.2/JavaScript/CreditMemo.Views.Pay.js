/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module CreditMemo
define('CreditMemo.Views.Pay'
,	[
		'Payment.Views.BaseWithCode'
	,	'credit_memo_pay.tpl'
	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		PaymentViewsBaseWithCode
	,	credit_memo_pay_tpl
	,	Backbone
	,	_
	)
{
	'use strict';

	// @class CreditMemo.Pay.View @extends Payment.Views.BaseWithCode
	return PaymentViewsBaseWithCode.extend({
		template: credit_memo_pay_tpl

	,	initialize: function (options)
		{
			PaymentViewsBaseWithCode.prototype.initialize.apply(this, arguments);

			this.application = options.application;
			this.model = options.model;

			var labelsAlter = {
				processing: _('Adding Credit Memo...').translate()
			};

			var eventsAlter = {
				'click [data-action="submit"]': 'submit'
			};

			_.extend(this.events, eventsAlter);
			_.extend(this.labels, labelsAlter);

			this.title = _('Payment - Credit Memo').translate();
		}


	,	render: function()
		{
			var res = Backbone.View.prototype.render.apply(this, arguments);
			return res;
		}

	});
});