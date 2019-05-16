/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define('PaymentWizard.CreditTransaction.Model'
,	[	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		_
	,	Backbone)
{
	'use strict';

	function validateAmountRemaining(value, name, form)
	{
		if (isNaN(parseFloat(value)))
		{
			return _('The amount to apply is not a valid number').translate();
		}

		if (value <= 0)
		{
			return _('The amount to apply has to be positive').translate();
		}

		if (value > form.remaining)
		{
			return _('The amount to apply cannot exceed the remaining amount').translate();
		}

		if (form.orderTotal < 0)
		{
			return _('The amount to apply cannot exceed the remaining payment total').translate();
		}
	}

	//@class PaymentWizard.CreditTransaction.Model @extend Backbone.Model
	return Backbone.Model.extend({

			validation: {
				amount: {
					fn: validateAmountRemaining
				}
			}

		,	initialize: function ()
			{
				if (!this.get('type'))
				{
					this.set('type', 'Deposit');
				}
			}
	});
});