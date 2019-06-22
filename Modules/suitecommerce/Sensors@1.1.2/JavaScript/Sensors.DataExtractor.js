/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Sensors
define('Sensors.DataExtractor'
,	[
		'Profile.Model'

	,	'Session'

    ,   'Backbone'
	,	'jQuery'
	,	'underscore'
	,	'Utils'
	]
,	function (
		ProfileModel

	,	Session

    ,   Backbone
	,	jQuery
	,	_
	,	Utils
	)
{
	'use strict';
	// @class DataExtractorDefaults This object represent the default named extractors that provides
	// the default information like site, cart, bundle, etc.
	return {

		// @property {Object} site information about the site @public
		site:
		{
			// @class DataExtractor these objects are responsible of returning a subset of the information to 
			// be send to the sensors. For example the default 'bundle' DataExtractor property is responsible of 
			// publishing information about the bundle like version and name. 

			// @property {Boolean} once if true it will be published only on the first application startup rendering but not on indirect navigation (navigation inside the SPA)
			once: false

			// @method extract must return a promise that resolves into an object with name:values . This object
			// is what then is mized into the published results. 
			// @public @param application @return {jQuery.Deferred}
		,	extract: function (application)
			{
				var site_data = {
					sitePage: ''
				,	siteUrl: ''
                ,   siteFragment: ''
				}
				,	layout = application.getLayout()
				,	site_data_promise = jQuery.Deferred()
				,	view_id = layout.getCurrentView() && layout.getCurrentView().getPageDescription();

				if(view_id)
				{
					site_data.sitePage = view_id;
				}

				site_data.siteUrl = window.location.href;
                site_data.siteFragment = Backbone.history.fragment;

				return site_data_promise.resolve(site_data);
			}
		}

		// @class DataExtractorDefaults 
		// @property {DataExtractor} cart
	,	cart:
		{
			once: false
		,	extract: function (application)
			{
				var cart_data = {
						cartLines: ''
					}
				,	cart_data_promise = jQuery.Deferred();

				application.getCart()
					.done(function (cart)
					{
						cart_data.cartLines = cart.get('lines').length + '';
						cart_data_promise.resolve(cart_data);
					})
					.fail(function ()
					{
						cart_data_promise.resolve(cart_data);
					});

				return cart_data_promise;
			}
		}

		// @property {DataExtractor} bundle
	,	bundle:
		{
			once: true
		,	extract: function ()
			{
				var bundle_data_promise = jQuery.Deferred()
				,	bundle_metadata = {}
				,	release_metadata = SC.ENVIRONMENT.RELEASE_METADATA || {};

				bundle_metadata.bundleId = release_metadata.bundle_id || '';
				bundle_metadata.bundleName = release_metadata.name || '';
				bundle_metadata.bundleVersion = release_metadata.version || '';
				bundle_metadata.buildNo = release_metadata.buildno || '';
				bundle_metadata.dateLabel = release_metadata.datelabel || '';
				bundle_metadata.baseLabel = release_metadata.baselabel || '';

				return bundle_data_promise.resolve(bundle_metadata);
			}
		}

		// @property {DataExtractor} customer
	,	customer:
		{
			once: false
		,	extract: function ()
			{
				var profile_model = ProfileModel.getInstance()
				,	isGuest = profile_model.get('isGuest') === 'T'
                ,	isLoggedIn = !isGuest && profile_model.get('isLoggedIn') === 'T'
                ,	isRecognized = !isGuest && profile_model.get('isRecognized') === 'T'
				,	isReturning = !isGuest && isLoggedIn
				,	isNew = !isGuest && !isRecognized && !isLoggedIn
				,	customer_data = {};

				customer_data.customerSessionStatus = isNew ? 'New' : isReturning ? 'Returning' : isGuest ? 'Guest' : isRecognized ? 'Recognized' : '';
                
                var regex = new RegExp('[; ]NLVisitorId=([^\\s;]*)');
                var sMatch = (' ' + document.cookie).match(regex);
                customer_data.visitorId = sMatch ? unescape(sMatch[1]) : '';
                
				return jQuery.Deferred().resolve(customer_data);
			}
		}
		
		// @property {DataExtractor} shopper
	,	shopper:
		{
			once: false
		,	extract: function ()
			{
				var shopper_data = { shopperInternalId: '', currencyCode: ''}
				,	profile_instance = ProfileModel.getInstance();

				var shopper_id = profile_instance.get('internalid');
				if (shopper_id && shopper_id !== '0')
				{
					shopper_data.shopperInternalId = shopper_id;
				}

				shopper_data.currencyCode = Session.get('currency.code') || '';

				return jQuery.Deferred().resolve(shopper_data);
			}
		}

		// @property {DataExtractor} device
	,	device:
		{
			once: false
		,	extract: function ()
			{
				return jQuery.Deferred().resolve({ device: Utils.getDeviceType()});
			}
		}

		// @property {DataExtractor} error_status
	,	error_status:
		{
			once: false
		,	extract: function (application)
			{
				var current_view = application.getLayout().getCurrentView()
				,	errorData = current_view.isErrorView && (current_view.getPageDescription() || 'error'); 

				return jQuery.Deferred().resolve({ errorStatus: errorData});
			}
		}
	};
});
