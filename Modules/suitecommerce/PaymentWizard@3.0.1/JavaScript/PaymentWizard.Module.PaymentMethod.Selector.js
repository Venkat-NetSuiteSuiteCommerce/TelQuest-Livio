/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define('PaymentWizard.Module.PaymentMethod.Selector'
,	[	'OrderWizard.Module.PaymentMethod.Selector'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		OrderWizardModulePaymentMethodSelector
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class PaymentWizard.Module.PaymentMethod.Creditcard @extend OrderWizard.Module.PaymentMethod.Creditcard
	return OrderWizardModulePaymentMethodSelector.extend({

			className: 'PaymentWizard.Module.PaymentMethod.Selector'

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

		,	initialize: function ()
			{
				OrderWizardModulePaymentMethodSelector.prototype.initialize.apply(this, arguments);
				this.wizard.model.on('change:payment', jQuery.proxy(this, 'changeTotal'));

			}

		,	changeTotal: function ()
			{
				var was = this.model.previous('payment')
				,	was_confirmation = this.model.previous('confirmation')
				,	is_confirmation = this.model.get('confirmation')
				,	is = this.model.get('payment');

				// Changed from or to 0
				if (((was === 0 && is !== 0) || (was !== 0 && is === 0)) && !was_confirmation && !is_confirmation)
				{
					this.render();
				}
			}

			// @method submit If there's a payment, continue the payment method selection. Otherwise, resets the paymentmethods collection
			// @return {jQuery.Deferred}
		,	submit: function ()
			{
				if (this.model.get('payment') !== 0)
				{
					return OrderWizardModulePaymentMethodSelector.prototype.submit.apply(this, arguments);
				}
				else
				{
					this.model.get('paymentmethods').reset([]);
					return jQuery.Deferred().resolve();
				}
			}
	});
});
