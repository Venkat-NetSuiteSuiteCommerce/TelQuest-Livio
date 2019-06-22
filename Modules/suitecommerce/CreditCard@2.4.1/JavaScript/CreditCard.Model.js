/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditCard
// Model for handling credit cards (CRUD)
define('CreditCard.Model'
,	[	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function(
		Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	//@method validate that the expiration date is bigger than today
	function validateExpirationDate (value, name, data)
	{
		var current = new Date()
		,	selected_date = new Date(data.expyear, data.expmonth - 1).getTime();

		if (!value || _.isNaN(selected_date) || new Date(current.getFullYear(), current.getMonth()).getTime() > selected_date)
		{
			return _('Please select a date in the future').translate();
		}
	}

	// @class CreditCard.Model responsible of implement the REST model of a credit card and of validating 
	// the credit card properties @extends Backbone.Model
	return Backbone.Model.extend({

		//@property {String} urlRoot
		urlRoot: 'services/CreditCard.Service.ss'

		//@property validation. Backbone.Validation attribute used for validating the form before submit.
	,	validation: {
			ccname: { fn: function (cc_name)
				{	
					
					if (!cc_name || !jQuery.trim(cc_name))
					{
						return _('Name is required').translate();
					}
					else if (cc_name.length > 26)
					{
						return _('Name too long').translate();
					}
				}
			}
		,	ccnumber: {	fn: function (cc_number, attr, form)
				{
					
					// credit card number validation
					// It validates that the number pass the Luhn test and also that it has the right starting digits that identify the card issuer
					if (!cc_number)
					{
						return _('Card Number is required').translate();
					}

					if (_.isUndefined(form.internalid))
					{
						cc_number = cc_number.replace(/\s/g, '');

						//check Luhn Algorithm
						var card_number_is_valid = _(cc_number.split('').reverse()).reduce(function (a, n, index)
							{
								return a + _((+n * [1, 2][index % 2]).toString().split('')).reduce(function (b, o)
									{ return b + (+o); }, 0);
							}, 0) % 10 === 0;

						if (!card_number_is_valid)
						{
							// we throw an error if the number fails the regex or the Luhn algorithm
							return _('Credit Card Number is invalid').translate();
						}
					}
				}
			}
		,	paymentmethod: { fn: function (paymentmethod, attr, form)
				{
					if (_.isUndefined(form.internalid) && paymentmethod === '0')
					{
						return _('Please Select a Credit Card Type').translate();
					}
				}
			}
		,	expyear: { fn: validateExpirationDate }
		,	expmonth: { fn: validateExpirationDate }
		,	ccsecuritycode: { fn: function (cc_security_code)
				{	
					
					if  (SC.ENVIRONMENT.siteSettings.checkout.requireccsecuritycode === 'T' && (this.hasSecurityCode || this.get('hasSecurityCode')))
					{
						var errorMessage = _.validateSecurityCode(cc_security_code);
						if (errorMessage)
						{
							return errorMessage;
						}
					}
				}
			}
		}

		//@method initialize
	,	initialize: function (attributes, options)
		{	
			this.options = options;
		}

	});
});
