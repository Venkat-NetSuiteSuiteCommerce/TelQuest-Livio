/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SiteSettings
// Pre-processes the SiteSettings to be used on the site
define(
	'SiteSettings.Model'
,	[	'SC.Model'
	,	'SC.Models.Init'
	,	'underscore'
	,	'Utils'
	]
,	function (
		SCModel
	,	ModelsInit
	,	_
	,	Utils
	)
{
	'use strict';

	var settings_cache
	,	is_https_supported = Utils.isHttpsSupported();

	// @class SiteSettings Pre-processes the SiteSettings to be used on the site. For performance reasons it
	// adds a cache layer using netsuite's application cache. Cache use the siteid in the keyword to support multi sites.
	// Cache douration can be configured in cacheTtl property. Some properties like touchpoints, siteid, languages and currencies are never cached.
	// @extends SCModel
	return SCModel.extend({

		name: 'SiteSettings'

		// @method get the site settings. Notice that can be cached @returns { ShoppingSession.SiteSettings}
	,	get: function ()
		{
			var i
			,	countries
			,	shipToCountries
			,	settings;

			if (settings_cache)
			{
				settings = settings_cache;
			}
			else
			{
				settings = ModelsInit.session.getSiteSettings();

				if (settings.shipallcountries === 'F')
				{
					if (settings.shiptocountries)
					{
						shipToCountries = {};

						for (i = 0; i < settings.shiptocountries.length; i++)
						{
							shipToCountries[settings.shiptocountries[i]] = true;
						}
					}
				}

				// Get all available countries.
				var allCountries = ModelsInit.session.getCountries();

				if (shipToCountries)
				{
					// Remove countries that are not in the shipping countries
					countries = {};

					for (i = 0; i < allCountries.length; i++)
					{
						if (shipToCountries[allCountries[i].code])
						{
							countries[allCountries[i].code] = allCountries[i];
						}
					}
				}
				else
				{
					countries = {};

					for (i = 0; i < allCountries.length; i++)
					{
						countries[allCountries[i].code] = allCountries[i];
					}
				}

				// Get all the states for countries.
				var allStates = ModelsInit.session.getStates();

				if (allStates)
				{
					for (i = 0; i < allStates.length; i++)
					{
						if (countries[allStates[i].countrycode])
						{
							countries[allStates[i].countrycode].states = allStates[i].states;
						}
					}
				}

				// Adds extra information to the site settings
				settings.countries = countries;
				settings.phoneformat = ModelsInit.context.getPreference('phoneformat');
				settings.minpasswordlength = ModelsInit.context.getPreference('minpasswordlength');
				settings.campaignsubscriptions = ModelsInit.context.getFeature('CAMPAIGNSUBSCRIPTIONS');
				settings.analytics.confpagetrackinghtml = _.escape(settings.analytics.confpagetrackinghtml);
				settings.quantitypricing = ModelsInit.context.getFeature('QUANTITYPRICING');

				// Other settings that come in window object
				settings.groupseparator = window.groupseparator;
				settings.decimalseparator = window.decimalseparator;
				settings.negativeprefix = window.negativeprefix;
				settings.negativesuffix = window.negativesuffix;
				settings.dateformat = window.dateformat;
				settings.longdateformat = window.longdateformat;

				settings.isMultiShippingRoutesEnabled = this.isMultiShippingRoutesEnabled();

				settings.isPickupInStoreEnabled = this.isPickupInStoreEnabled();
				
				settings.isAutoapplyPromotionsEnabled = this.isAutoapplyPromotionsEnabled();

				settings.isSCISIntegrationEnabled = this.isSCISIntegrationEnabled();

				settings.checkoutSupported = Utils.isCheckoutDomain();
				settings.shoppingSupported = Utils.isShoppingDomain();
				settings.isHttpsSupported = is_https_supported;
				settings.isSingleDomain = settings.checkoutSupported && settings.shoppingSupported;

				// delete unused fields
				delete settings.entrypoints;

				settings_cache = settings;
			}

			settings.is_logged_in = ModelsInit.session.isLoggedIn2();
			settings.shopperCurrency = ModelsInit.session.getShopperCurrency();
			settings.touchpoints = this.getTouchPoints();
	
			return settings;
		}
		// @method isPickupInStoreEnabled. @returns {Boolean}
	,	isPickupInStoreEnabled: function ()
		{
			return SC.Configuration.isPickupInStoreEnabled && ModelsInit.context.getSetting('FEATURE', 'STOREPICKUP') === 'T';
		}
		// @method isSCISIntegrationEnabled. @returns {Boolean}
	,	isSCISIntegrationEnabled : function ()
		{
			return SC.Configuration.isSCISIntegrationEnabled && Utils.recordTypeHasField('salesorder','custbody_ns_pos_transaction_status');
		}
		// @method isMultiShippingRoutesEnabled. @returns {Boolean}
	,	isMultiShippingRoutesEnabled: function ()
		{
			return SC.Configuration.isMultiShippingEnabled && ModelsInit.context.getSetting('FEATURE', 'MULTISHIPTO') === 'T';
		}
		// @method isAutoapplyPromotionsEnabled. @returns {Boolean}
	,	isAutoapplyPromotionsEnabled: function ()
		{
			return ModelsInit.session.getSiteSettings(['autoapplypromotionsenabled']).autoapplypromotionsenabled==='T';
		}
		// @method getTouchPoints. @returns {Object}
	,	getTouchPoints: function ()
		{
			var settings = ModelsInit.session.getSiteSettings(['touchpoints', 'sitetype']);

			if (!is_https_supported && settings.sitetype === 'ADVANCED')
			{
				settings.touchpoints.storelocator = settings.touchpoints.login.replace('is=login', 'is=storelocator');
			}

			return settings.touchpoints;
		}
	});
});