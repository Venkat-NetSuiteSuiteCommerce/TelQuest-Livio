/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define(
	'GlobalViews.CurrencySelector.View'
,	[
		'SC.Configuration'
	,	'Utils'
	,	'Session'

	,	'global_views_currency_selector.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(
		Configuration
	,	Utils
	,	Session

	,	global_views_currency_selector_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class GlobalViews.CurrencySelector.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_views_currency_selector_tpl

	,	events: {
			'change select[data-toggle="currency-selector"]' : 'setCurrency'
		,	'click select[data-toggle="currency-selector"]' : 'currencySelectorClick'
		}

		// @method currencySelectorClick @param {HTMLEvent} e
	,	currencySelectorClick: function (e)
		{
			e.stopPropagation();
		}

		// @method setCurrency @param {HTMLEvent} e
	,	setCurrency: function (e)
		{
			var currency_code = this.$(e.target).val()
			,	selected_currency = _.find(SC.ENVIRONMENT.availableCurrencies, function (currency)
				{
					return currency.code === currency_code;
				});

			window.location.href = Utils.addParamsToUrl(Session.get('touchpoints.'+Configuration.get('currentTouchpoint')), {cur: selected_currency.code});
		}

		// @method getContext
		// @return {GlobalViews.CurrencySelector.View.Context}
	,	getContext: function()
		{
			var available_currencies = _.map(SC.ENVIRONMENT.availableCurrencies, function(currency)
			{
				// @class GlobalViews.CurrencySelector.View.Context.Currency
				return {
					// @property {String} code
					code: currency.code
					// @property {String} internalId
				,	internalId: currency.internalid
					// @property {String} isDefault
				,	isDefault: currency.isdefault
					// @property {String} symbol
				,	symbol: currency.symbol
					// @property {Boolean} symbolPlacement
				,	symbolPlacement: currency.symbolplacement
					// @property {String} displayName
				,	displayName: currency.title || currency.name
					// @property {Boolean} isSelected
				,	isSelected: SC.ENVIRONMENT.currentCurrency.code === currency.code
				};
			});

			// @class GlobalViews.CurrencySelector.View.Context
			return {
				// @property {Boolean} showCurrencySelector
				showCurrencySelector: !!(SC.ENVIRONMENT.availableCurrencies && SC.ENVIRONMENT.availableCurrencies.length > 1)
				// @property {Array<GlobalViews.CurrencySelector.View.Context.Currency>} availableCurrencies
			,	availableCurrencies: available_currencies || []
				// @property {String} currentCurrencyCode
			,	currentCurrencyCode: SC.ENVIRONMENT.currentCurrency.code
				// @property {String} currentCurrencySymbol
			,	currentCurrencySymbol: SC.getSessionInfo('currency').symbol
			};
		}
	});
});