/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define('PaymentWizard.Module.ShowPayments'
,	[	'OrderWizard.Module.ShowPayments'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		OrderWizardModuleShowPayments
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class PaymentWizard.Module.ShowPayments @extend OrderWizard.Module.ShowPayments
	return OrderWizardModuleShowPayments.extend({

		className: 'PaymentWizard.Module.ShowPayments'

	,	render: function()
		{
			this.options.hideBilling = true;

			if (this.wizard.hidePayment())
			{
				this.$el.empty();
			}
			else
			{
				OrderWizardModuleShowPayments.prototype.render.apply(this, arguments);
			}
		}

		//@method getPaymentmethods
	,	getPaymentmethods: function ()
		{
			return _.reject(this.model.get('confirmation').paymentmethods || this.model.get('paymentmethods').models, function (paymentmethod)
			{
				return paymentmethod.type === 'giftcertificate';
			});
		}

	,	totalChange: jQuery.noop
	});
});