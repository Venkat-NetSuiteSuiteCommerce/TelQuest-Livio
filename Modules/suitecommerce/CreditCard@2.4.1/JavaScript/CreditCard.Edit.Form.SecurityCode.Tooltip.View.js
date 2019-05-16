/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditCard
define('CreditCard.Edit.Form.SecurityCode.Tooltip.View'
,	[	'creditcard_edit_form_securitycode_tooltip.tpl'

	,	'SC.Configuration'
	,	'Profile.Model'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		creditcard_edit_form_securitycode_tootltip

	,	Configuration
	,	ProfileModel

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class CreditCard.Edit.Form.SecurityCode.Tooltip.View @extends Backbone.View
	return Backbone.View.extend({

		template: creditcard_edit_form_securitycode_tootltip

		//@method getAvailableCreditcards
	,	getAvailableCreditcards: function ()
		{
			// Creditcards
			var creditcards = []
			,	user_creditcards = ProfileModel.getInstance().get('creditcards');

			user_creditcards.each(function(user_cc)
			{
				creditcards.push(user_cc.get('paymentmethod').name);
			});

			if (!creditcards.length)
			{
				var available_creditcards = _.where(Configuration.get('siteSettings.paymentmethods'), {creditcard: 'T', ispaypal: 'F'});

				_.each(available_creditcards, function(index, el)
				{
					creditcards.push(available_creditcards[el].name);
				});
			}

			return _.unique(creditcards);
		}

		//@method getContext @return CreditCard.Edit.Form.SecurityCode.Tooltip.View.Context
	,	getContext: function ()
		{
			var available_credit_cards = this.getAvailableCreditcards();

			//@class CreditCard.Edit.Form.SecurityCode.Tooltip.View.Context
			return {
				//@property {Boolean} isCreditCards
				isCreditCards: available_credit_cards.length > 0
				//@property {Array<String>} availableCreditcards
			,	availableCreditcards: available_credit_cards
				//@property {String} imageCvvAmericanCard
			,	imageCvvAmericanCardURL: _.getAbsoluteUrlOfNonManagedResources(Configuration.get('creditCard.imageCvvAmericanCard'))
				//@property {String} imageCvvAllCards
			,	imageCvvAllCardsURL: _.getAbsoluteUrlOfNonManagedResources(Configuration.get('creditCard.imageCvvAllCards'))
				//@property {Boolean} isVisaMasterOrDiscoverAvailable
			,	isVisaMasterOrDiscoverAvailable: _.indexOf(available_credit_cards, 'VISA') !== -1 || _.indexOf(available_credit_cards, 'Master Card') !== -1 || _.indexOf(available_credit_cards, 'Discover') !== -1
				//@property {Boolean} isAmexAvailable
			,	isAmexAvailable:  _.indexOf(available_credit_cards, 'American Express') !== -1
			};
		}
	});
});
