/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// CreditCard.Model.js
// ----------------
// This file define the functions to be used on Credit Card service
define('CreditCard.Model'
,	[
		'SC.Model'
	,	'SC.Models.Init'
	, 	'underscore'
	]
,	function (
		SCModel
	,	ModelsInit
	, 	_
)
{
	'use strict';
	return SCModel.extend({
		name: 'CreditCard'
		
	,	validation: {
			ccname: {required: true, msg: 'Name is required'}
		,	paymentmethod: {required: true, msg: 'Card Type is required'}
		,	ccnumber: {required: true, msg: 'Card Number is required'}
		,	expmonth: {required: true, msg: 'Expiration is required'}
		,	expyear: {required: true, msg: 'Expiration is required'}
		}
		
	,	get: function (id)
		{
			//Return a specific credit card
			return ModelsInit.customer.getCreditCard(id);
		}
		
	,	getDefault: function ()
		{
			//Return the credit card that the customer setted to default
			return _.find(ModelsInit.customer.getCreditCards(), function (credit_card)
			{
				return credit_card.ccdefault === 'T';
			});
		}
		
	,	list: function ()
		{
			//Return all the credit cards with paymentmethod
			return _.filter(ModelsInit.customer.getCreditCards(), function (credit_card)
			{
				return credit_card.paymentmethod;
			});
		}
		
	,	update: function (id, data)
		{
			//Update the credit card if the data is valid
			this.validate(data);
			data.internalid = id;

			return ModelsInit.customer.updateCreditCard(data);
		}
		
	,	create: function (data)
		{
			//Create a new credit card if the data is valid
			this.validate(data);

			return ModelsInit.customer.addCreditCard(data);
		}
		
	,	remove: function (id)
		{
			//Remove a specific credit card
			return ModelsInit.customer.removeCreditCard(id);
		}
	});	
});