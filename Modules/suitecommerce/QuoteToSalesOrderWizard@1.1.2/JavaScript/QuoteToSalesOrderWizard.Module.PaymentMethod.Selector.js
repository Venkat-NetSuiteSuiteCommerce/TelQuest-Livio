/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define(	'QuoteToSalesOrderWizard.Module.PaymentMethod.Selector'
,	[	'OrderWizard.Module.PaymentMethod.Selector'
	,	'underscore'
	,	'Utils'
	]
,	function (
		OrderWizardModulePaymentMethodSelector
	,	_
	)
{
	'use strict';

	//@class PaymentWizard.Module.PaymentMethod.Creditcard @extend OrderWizard.Module.PaymentMethod.Creditcard
	return OrderWizardModulePaymentMethodSelector.extend({

		className: 'QuoteToSalesOrderWizard.Module.PaymentMethod.Selector'

	,	render: function()
		{
			if (this.wizard.hidePayment())
			{
				this.$el.empty();
			}
			else
			{
				OrderWizardModulePaymentMethodSelector.prototype.render.apply(this, arguments);
			}

			if (this.selectedModule && !!~this.selectedModule.type.indexOf('external_checkout'))
			{
				this.trigger('change_label_continue', _('Continue to External Payment').translate());
			}
			else
			{
				this.trigger('change_label_continue', _('Submit').translate());
			}
		}
	});
});
