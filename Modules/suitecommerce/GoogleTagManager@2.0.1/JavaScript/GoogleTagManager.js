/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module GoogleTagManager

//@class GoogleTagManager @extends ApplicationModule Loads Google Tag Manager scripts
define('GoogleTagManager'
,	[	'Tracker'
	,	'GoogleTagManager.NavigationHelper.Plugins.Standard'
	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'SC.Configuration'
]
,	function (
		Tracker
	,	GoogleTagManagerNavigationHelper
	,	_
	,	jQuery
	,	Backbone
	,	Configuration
	)
{
	'use strict';

	var win = window
	,	GoogleTagManager = {

		//@method doCallback Indicates if this module do a callback after some particular events
		//@return {Boolean}
		//ie: when you do a log-in, we need to track that event before we navigate to the new page, otherwise the track of the event could be aborted
		//We have a special case in which this doesn't work, for exampmle, if a browser extension blocks the Analytics tracking but not GTM, the log-in callback is never excecuted
		doCallback: function()
		{
			return !!win.google_tag_manager;
		}

		//@method trackPageview
		//@param {String} url
		//@return {GoogleTagManager}
	,	trackPageview: function (url)
		{
			if (_.isString(url))
			{
				var eventName = 'pageView'
				,	eventData = {
						'event': eventName
            		,	'data': {
							'page': url
						}
					};

				//Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
				Tracker.trigger(eventName, eventData, url);
				this.pushData(eventData);
			}

			return this;
		}

		//@method trackEvent Track this actions: guest-checkout, sign-in, create-account, Reorder, add-to-cart, place-order
		//@param {TrackEvent} event
		//@return {GoogleTagManager}
	,	trackEvent: function (event)
		{
			if (event && event.category && event.action)
			{
				var eventName = 'action'
				,	eventData = {
						'event': eventName
					,	'data': {
							'category': event.category
						,	'action': event.action
						,	'label': event.label
						,	'value': parseFloat(event.value) || 0
						,	'page': event.page || '/' + Backbone.history.fragment
						}
					,	'eventCallback': event.callback
					};

				//Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
				Tracker.trigger(eventName, eventData, event);
				this.pushData(eventData);
			}

			return this;
		}

		//@method trackGenericEvent
		//@return {GoogleTagManager}
	,	trackGenericEvent: function ()
		{
			var eventName = 'genericEvent'
			,	eventData = {
				'event': eventName
			,	'data': {}
			};

			//Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
			Tracker.trigger(eventName, eventData, arguments);
			this.pushData(eventData);

			return this;
		}

		//@method trackAddToCart
		//@param {Transaction.Line.Model} line
		//@return {GoogleTagManager}
	,	trackAddToCart: function (line)
		{
			if (line)
			{
				var eventName = 'addToCart'
				,	eventData = {
					'event': eventName
				,	'data': {}
				};

				//Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
				Tracker.trigger(eventName, eventData, line);
				this.pushData(eventData);
			}

			return this;
		}

		//@method trackTransaction
		// https://support.google.com/tagmanager/answer/6106097?hl=en
		//@param {Tracker.Transaction.Model} @extends Backbone.Model transaction
		//@class Tracker.Transaction.Model
			//@property {String} confirmationNumber
			//@property {Number} subTotal
			//@property {Number} total
			//@property {Number} taxTotal
			//@property {Number} shippingCost
			//@property {Number} handlingCost
			//@property {Array<{Tracker.Transaction.Items.Model}>} products
			//@class Tracker.Transaction.Line.Model
				//@property {String} sku
				//@property {String} name
				//@property {String} category
				//@property {Number} rate
				//@property {Number} quantity
				//@property {String} variant
			//@class Tracker.Transaction.Model
		//@class GoogleTagManager
		//@return {GoogleTagManager}
	,	trackTransaction: function (transaction)
		{
			var eventName = 'transaction'
				,	eventData = {
						'event': eventName
					,	'data': {
						'transactionId': transaction.get('confirmationNumber')
						,	'transactionAffiliation': Configuration.get('siteSettings.displayname')
					,	'transactionSubTotal': transaction.get('subTotal')
					,	'transactionTotal': transaction.get('total')
					,	'transactionTax': transaction.get('taxTotal')
					,	'transactionShipping': transaction.get('shippingCost') + transaction.get('handlingCost')
						,	'transactionCurrency': SC.ENVIRONMENT.currentCurrency && SC.ENVIRONMENT.currentCurrency.code || 'USD'
						,	'transactionProducts': []
						}
					};

			transaction.get('products').each(function (product)
				{
					eventData.data.transactionProducts.push({
					'sku': product.get('sku')
				,	'name': product.get('name')
				,	'category': product.get('category') || ''
				,	'price': product.get('rate')
				,	'quantity': product.get('quantity')
				,	'variant': product.get('options')
					});
				});

				//Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
			Tracker.trigger(eventName, eventData, transaction);
				this.pushData(eventData);

			return this;
		}

		//@method trackProductList
		//@param {Backbone.Collection} items
		//@param {String} listName
		//@return {GoogleTagManager}
	,	trackProductList: function (items, listName)
		{
			var self = this
			,	eventName = 'productList'
			,	eventData = {
					'event': eventName
				,	'data': {
						'currencyCode': SC.ENVIRONMENT.currentCurrency && SC.ENVIRONMENT.currentCurrency.code || 'USD'
					,	'items': []
					,	'page': this.getCategory()
					,	'list': listName
					}
				};

			_.each(items.models, function (item, index)
			{
				//We set this properties in the item so we can print them on the html, to later be read them by the trackProductClick event
				item.set('track_productlist_position', index + 1);
				item.set('track_productlist_category', self.getCategory());
				item.set('track_productlist_list', listName);

				eventData.data.items.push({
					'name': item.get('_name')
				,	'sku': item.get('_sku', true)
				,	'price': (item.get('_price') && item.get('_price').toFixed(2)) || 0.00
				,	'list': item.get('track_productlist_list')
				,	'position': item.get('track_productlist_position')
				,	'category': item.get('track_productlist_category')
				});
			});

			//Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
			Tracker.trigger(eventName, eventData, items);
			this.pushData(eventData);

			return this;
		}

		//@method trackProductClick
		//@param {Object} item
		//@return {GoogleTagManager}
	,	trackProductClick: function (item)
		{
			var eventName = 'productClick'
			,	eventData = {
				'event': eventName
			,	'data': {
					'category': item.get('category')
				,	'position': item.get('position')
				,	'list': item.get('list')
				,	'sku': item.get('sku', true)
				,	'name': item.get('name')
				,	'page': this.getCategory()
				,	'label': item.get('name')
				}
			};

			//We set this item in this Tracker to later be read it by the trackProductView event
			this.item = item;
			//Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
			Tracker.trigger(eventName, eventData, item);
			this.pushData(eventData);

			return this;
		}

		//@method trackProductView
		//@param {Product.Model} product
		//@return {GoogleTagManager}
	,	trackProductView: function (product)
		{
			var item = product.getItem();

			if (this.item && this.item.get('itemId') === item.get('_id'))
			{
				item.set('category', this.item.get('category'), { silent: true });
				item.set('list', this.item.get('list'), { silent: true });
			}

			var eventName = 'productView'
			,	selected_options = product.get('options').filter(function (option)
				{
					return option.get('value') && option.get('value').label;
				})
			,	price = product.getPrice()
			,	eventData = {
				'event': eventName
			,	'data': {
					'sku': product.getSku()
				,	'name': item.get('_name')
				,	'variant': _.map(selected_options, function (option)
						{
							return option.get('value').label;
						}).join(', ')
				,	'price': ((price.price) ? price.price : 0).toFixed(2)
				,	'category': item.get('category') || '' // as we do not support categories this is just the url
				,	'list': item.get('list') || ''
				,	'page': this.getCategory()
				}
			};

			this.item = null;

			//Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
			Tracker.trigger(eventName, eventData, item);
			this.pushData(eventData);

			return this;
		}

		//@method pushData Clean all the values of the dataLayer before we send the new ones
		//@param {Object} data
	,	pushData: function(data)
		{
			//We need to push this dummy empty object to 'clean' the dataLayer, because all the data pushed is appended in another object that is sent to gtm
			// http://www.simoahava.com/gtm-tips/remember-to-flush-unused-data-layer-variables/
			win[this.configuration.dataLayerName].push({
				'event': undefined
			,	'data': undefined
			,	'eventCallback': undefined
			});

			win[this.configuration.dataLayerName].push(data);
		}

		//@method getCategory
		//@return {String}
	,	getCategory: function()
		{
			var options = _.parseUrlOptions(Backbone.history.fragment)
			,	page = options.page || '';

			return '/' + Backbone.history.fragment.split('?')[0] + (page ? '?page=' + page : '');
		}

		//@method loadScript
		//@return {jQuery.Promise|Void}
	,	loadScript: function ()
		{
			return !SC.isPageGenerator() && jQuery.getScript('//www.googletagmanager.com/gtm.js?id=' + this.configuration.id + '&l=' + this.configuration.dataLayerName);
		}

		//@method mountToApp
		//@param {ApplicationSkeleton} application
		//@return {Void}
	,	mountToApp: function (application)
		{
			this.configuration = Configuration.get('tracking.googleTagManager');

			if (this.configuration && this.configuration.id)
			{
				var layout = application.getLayout();

				//Install Standard Navigation Plugins
				layout.mouseDown.install({
					name: 'googleTagManagerStandardNavigation'
				,	priority: 20
				,	execute: function (e)
					{
						return GoogleTagManagerNavigationHelper.mouseDownNavigation(layout, e);
					}
				});

				this.configuration.dataLayerName = this.configuration.dataLayerName || 'dataLayer';

				// (Tracking Start)[https://developers.google.com/tag-manager/quickstart]
				win[this.configuration.dataLayerName] = win[this.configuration.dataLayerName] || [];
				win[this.configuration.dataLayerName].push({
					'gtm.start': new Date().getTime()
				,	'event': 'gtm.js'
				});

				Tracker.getInstance().trackers.push(GoogleTagManager);

				// the analytics script is only loaded if we are on a browser
				application.getLayout().once('afterAppendView', jQuery.proxy(GoogleTagManager, 'loadScript'));
			}
		}
	};

	return GoogleTagManager;
});
