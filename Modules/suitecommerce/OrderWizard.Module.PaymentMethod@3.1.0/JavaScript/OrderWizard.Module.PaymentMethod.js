/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// OrderWizard.Module.PaymentMethod.js
// --------------------------------
//
define('OrderWizard.Module.PaymentMethod'
,	[	'Wizard.Module'
	,	'jQuery'
	]
,	function (
		WizardModule
	,	jQuery
	)
{
	'use strict';

	return WizardModule.extend({

		submit: function ()
		{
			// Gets the payment method collection
			var payment_methods = this.model.get('paymentmethods');

			// Removes the primary if any
			payment_methods.remove(
				payment_methods.where({primary: true})
			);

			// Gets the payment method for this object
			var payment_method = this.paymentMethod;

			// Sets it as primary
			payment_method.set('primary', true);

			// Adds it to the collection
			payment_methods.add(payment_method);

			// We just return a resolved promise
			return jQuery.Deferred().resolve();
		}
	});
});