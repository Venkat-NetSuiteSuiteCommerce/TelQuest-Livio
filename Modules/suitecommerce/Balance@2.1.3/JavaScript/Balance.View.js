/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Balance
define('Balance.View'
,	[	'Profile.Model'
	,	'LivePayment.Model'
	,	'SC.Configuration'

	,	'balance.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		ProfileModel
	,	LivePaymentModel
	,	Configuration

	,	balance_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class Balance.View @extend Backbone.View
	return Backbone.View.extend({

		template: balance_tpl

	,	attributes: {
			'class': 'AccountBalance'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.model = ProfileModel.getInstance();
			this.livePaymentModel = LivePaymentModel.getInstance();
			this.title = _('Account Balance').translate();
		}

	,	getSelectedMenu: function ()
		{
			return 'balance';
		}

	,	getBreadcrumbPages: function ()
		{
			return {
				text: this.title
			,	href: '/balance'
			};
		}

		//@method getContext @return {Balance.View.Context}
	,	getContext: function ()
		{
			var live_payment = this.livePaymentModel
			,	percentage = Math.min(((this.model.get('balance') * 100) / this.model.get('creditlimit')), 100);

			//@class Balance.View.Context
			return {
				//@property {Profile.Model} model
				model: this.model
				//@property {Boolean} showCompany
			,	showCompany: !!this.model.get('companyname')
				//@property {String} company
			,	company: this.model.get('companyname')
				//@property {Number} percentage
			,	percentage: percentage
				//@property {Boolean} isPercentageGreaterThan8
			,	isPercentageGreaterThan8: percentage > 8
				//@property {Boolean} isPercentageLowertThan92
			,	isPercentageLowertThan92: percentage < 92
				//@property {String} balanceFormatted
			,	balanceFormatted: this.model.get('balance_formatted')
				//@property {String} balanceAvailableFormatted
			,	balanceAvailableFormatted: this.model.get('balance_available_formatted')
				//@property {String} creditLimitFormatted
			,	creditLimitFormatted: this.model.get('creditlimit_formatted')
				//@property {String} depositsRemainingFormatted
			, 	depositsRemainingFormatted: live_payment.get('depositsremaining_formatted') || 'N/A'
				//@property {String} creditMemosRemainingFormatted
			,	creditMemosRemainingFormatted: live_payment.get('creditmemosremaining_formatted') || 'N/A'
				//@property {String} paymentTermsName
			,	paymentTermsName: (this.model.get('paymentterms') && this.model.get('paymentterms').name) || 'N/A'
				//@property {String} shopperCurrencyCode
			,	shopperCurrencyCode: Configuration.get('siteSettings.shopperCurrency.code')
				//@property {Boolean} livePaymentHaveInvoices
			,	livePaymentHaveInvoices: !!live_payment.get('invoices').length
				//@property {Boolean} showBackToAccount
			,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
			};
		}
	});
});