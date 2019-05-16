/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module GoogleUniversalAnalytics
(function (win, name)
{
	'use strict';
	// [Google Universal Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/)
	// We customized the tracking default start script so it doesn't loads analytics.js
	// (Tracking Start)[https://developers.google.com/analytics/devguides/collection/analyticsjs/#quickstart]
	win.GoogleAnalyticsObject = name;
	win[name] = win[name] || function ()
	{
		(win[name].q = win[name].q || []).push(arguments);
	};
	win[name].l = 1 * new Date();

	//@class GoogleUniversalAnalytics @extends ApplicationModule
	// ------------------
	// Loads google analytics script and extends application with methods:
	// * trackPageview
	// * trackEvent
	// * trackTransaction
	// Also wraps layout's showInModal
	define('GoogleUniversalAnalytics'
	,	[	'Tracker'
		,	'underscore'
		,	'jQuery'
		,	'Backbone'
		,	'Utils'
		,	'SC.Configuration'
		]
	,	function (
			Tracker
		,	_
		,	jQuery
		,	Backbone
		,	Utils
		,	Configuration
		)
	{
		var GoogleUniversalAnalytics = {

			//@method doCallback Indicates if this module do a callback after some particular events
			//@return {Boolean}
			doCallback: function()
			{
				return !win[name].q;
			}

			//@method trackPageview
			//@param {String} url
			//@return {GoogleUniversalAnalytics}
		,	trackPageview: function (url)
			{
				if (_.isString(url))
				{
					// [Page Tracking](https://developers.google.com/analytics/devguides/collection/analyticsjs/pages#overriding)
					win[name]('send', 'pageview', url);
				}

				return this;
			}

			//@method trackEvent
			//@param {TrackEvent} event
			//@return {GoogleUniversalAnalytics}
		,	trackEvent: function (event)
			{
				if (event && event.category && event.action)
				{
					// [Event Tracking](https://developers.google.com/analytics/devguides/collection/analyticsjs/events#implementation)
					win[name]('send', 'event', event.category, event.action, event.label, parseFloat(event.value) || 0, {
						'hitCallback': event.callback
					,	'page': event.page || '/'+Backbone.history.fragment
					});
				}

				return this;
			}

			//@method addItem
			//@param {Object<String:id,String:name>} item
			//@return {GoogleUniversalAnalytics}
		,	addItem: function (item)
			{
				if (item && item.id && item.name)
				{
					// [Adding Items](https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#addItem)
					win[name]('ecommerce:addItem', item);
				}

				return this;
			}

			//@method addTrans
			//@param {Object} transaction
			//@return {GoogleUniversalAnalytics}
		,	addTrans: function (transaction)
			{
				if (transaction && transaction.id)
				{
					// [Adding a Transaction](https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#addTrans)
					win[name]('ecommerce:addTransaction', transaction);
				}

				return this;
			}

			//@method trackTrans
			//@return {GoogleUniversalAnalytics}
		,	trackTrans: function ()
			{
				// [Sending Data](https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#sendingData)
				win[name]('ecommerce:send');
				return this;
			}

			//@method trackTransaction
			// Based on the created SalesOrder we trigger each of the analytics
			// ecommerce methods passing the required information
			// [Ecommerce Tracking](https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce)
			//@param {Tracker.Transaction.Model} @extends Backbone.Model transaction
			//@return {GoogleUniversalAnalytics|Void}
		,	trackTransaction: function (transaction)
			{
				var transaction_id = transaction.get('confirmationNumber');

				GoogleUniversalAnalytics.addTrans({
					id: transaction_id
				,	revenue: transaction.get('subTotal')
				,	shipping: transaction.get('shippingCost') + transaction.get('handlingCost')
				,	tax: transaction.get('taxTotal')
				,	currency: SC.ENVIRONMENT.currentCurrency && SC.ENVIRONMENT.currentCurrency.code || ''

				,	page: '/' + Backbone.history.fragment
				});

				transaction.get('products').each(function (product)
				{
					GoogleUniversalAnalytics.addItem({
						id: transaction_id
					,	affiliation: Configuration.get('siteSettings.displayname')
					,	sku: product.get('sku')
					,	name: product.get('name')
					,	category: product.get('category') || ''
					,	price: product.get('rate')
					,	quantity: product.get('quantity')
					});
				});

				return GoogleUniversalAnalytics.trackTrans();
			}

			//@method setAccount
			//@param {SC.Configuration} config
			//@return {Void}
		,	setAccount: function (config)
			{
				if(!config)
				{
					return this;
				}

				var domainName = Utils.isCheckoutDomain() ? config.domainNameSecure : config.domainName;

				if (_.isString(config.propertyID) && _.isString(domainName))
				{
					this.propertyID = config.propertyID;
					this.domainName = domainName;

					// [Multiple Trackers on The Same Domain](https://developers.google.com/analytics/devguides/collection/analyticsjs/domains#multitrackers)
					// https://support.google.com/analytics/answer/1034342?hl=en
					win[name]('create', this.propertyID, {
						'cookieDomain': this.domainName
					,	'allowLinker': true
					});
				}

				return this;
			}

			//@method addCrossDomainParameters
			// [Decorating HTML Links](https://developers.google.com/analytics/devguides/collection/analyticsjs/cross-domain#decoratelinks)
			//@param {string} url
			//@return {String} url
		,	addCrossDomainParameters: function (url)
			{
				// We only need to add the parameters if the URL we are trying to go
				// is not a sub domain of the tracking domain
				if (_.isString(url) && !~url.indexOf(this.domainName))
				{
					win[name](function (tracker)
					{
						win.linker = win.linker || new win.gaplugins.Linker(tracker);

						var track_url = win.linker.decorate(url);

						// This validation is due to Tracking Blockers overriding the default analytics methods
						if (typeof track_url === 'string')
						{
							url = track_url;
						}
					});
				}

				return url;
			}

			//@method loadScript
			//@return {jQuery.Promise|Void}
		,	loadScript: function ()
			{
				return SC.ENVIRONMENT.jsEnvironment === 'browser' && jQuery.getScript('//www.google-analytics.com/analytics.js');
			}

			//@method mountToApp
			//@param {ApplicationSkeleton} application
			//@return {Void}
		,	mountToApp: function (application)
			{
				var tracking = application.getConfig('tracking.googleUniversalAnalytics');

				// if track page view needs to be tracked
				if (tracking && tracking.propertyID)
				{
					// we get the account and domain name from the configuration file
					GoogleUniversalAnalytics.setAccount(tracking);

					Tracker.getInstance().trackers.push(GoogleUniversalAnalytics);

					// the analytics script is only loaded if we are on a browser
					application.getLayout().once('afterAppendView', jQuery.proxy(GoogleUniversalAnalytics, 'loadScript'));

					// [Load the eCommerce Plugin](https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#loadit)
					win[name]('require', 'ecommerce', 'ecommerce.js');
				}
			}
		};

		return GoogleUniversalAnalytics;
	});
})(window, 'ga');
