/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Overview.Home.View.js
// --------------------

define('Overview.Home.View'
,	[
		'SC.Configuration'
	,	'GlobalViews.Message.View'
	,	'Overview.Banner.View'
	,	'Overview.Profile.View'
	,	'Overview.Payment.View'
	,	'Overview.Shipping.View'
	,	'Backbone.CollectionView'
	,	'OrderHistory.List.Tracking.Number.View'
	,	'RecordViews.View'
	,	'Handlebars'

	,	'overview_home.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	,	'Utils'
	]
,	function(
		Configuration
	,	GlobalViewsMessageView
	,	OverviewBannerView
	,	OverviewProfileView
	,	OverviewPaymentView
	,	OverviewShippingView
	,	BackboneCollectionView
	,	OrderHistoryListTrackingNumberView
	,	RecordViewsView
	,	Handlebars

	,	overview_home_tpl

	,	Backbone
	,	BackboneCompositeView
	,	_
	)
{
	'use strict';

	// home page view
	return Backbone.View.extend({

		template: overview_home_tpl
	,	title: _('Welcome!').translate()
	,	attributes: {'class': 'ProfileHomeView'}
	,	events: {}

	,	initialize: function (options)
		{
			BackboneCompositeView.add(this);

			this.isSCISIntegrationEnabled = Configuration.get('siteSettings.isSCISIntegrationEnabled', false);
			this.model = options.model;
			this.application = options.application;

			this.customerSupportURL = Configuration.get('overview.customerSupportURL');

			this.model.on('change', this.showContent, this);

			this.addresses = this.model.get('addresses');

			this.creditcards = this.model.get('creditcards');

			this.addresses.on('reset destroy change add', this.showContent, this);

			this.creditcards.on('reset destroy change add', this.showContent, this);

			if (SC.SESSION.email_change_verification)
			{
				this.email_change_verification = SC.SESSION.email_change_verification;
				delete SC.SESSION.email_change_verification;
			}
		}

		//@method getContext @return Overview.Home.View.Context
	,	getContext: function ()
		{
			var isSCISIntegrationEnabled = Configuration.get('siteSettings.isSCISIntegrationEnabled', false);

			//@class Overview.Home.View.Context
			return {
				//@property {Boolean} collectionLengthGreaterThan0
				collectionLengthGreaterThan0: this.collection.length > 0
				//@property {Boolean} hasCustomerSupportURL
			,	hasCustomerSupportURL: !!this.customerSupportURL
				//@property {String} customerSupportURL
			,	customerSupportURL: this.customerSupportURL
				//@property {String} firstName
			,	firstName: this.model.get('firstname') ||  this.model.get('name') ||''
				//@property {Boolean} isSCISIntegrationEnabled
			,	isSCISIntegrationEnabled: this.isSCISIntegrationEnabled
				// @property {Boolean} purchasesPermissions
			,	purchasesPermissions: isSCISIntegrationEnabled ? 'transactions.tranFind.1,transactions.tranPurchases.1' : 'transactions.tranFind.1,transactions.tranSalesOrd.1'
			};
		}

	,	childViews: {
			'Overview.Banner': function()
			{
				return new OverviewBannerView();
			}

		,	'Overview.Profile': function()
			{
				return new OverviewProfileView({ model: this.model });
			}

		,	'Overview.Payment': function()
			{
				return new OverviewPaymentView({ model: this.defaultCreditCard });
			}

		,	'Overview.Shipping': function()
			{
				return new OverviewShippingView({ model: this.defaultShippingAddress });
			}

		,	'Overview.Messages': function ()
			{
				if (this.email_change_verification)
				{
					return new GlobalViewsMessageView({
							message: this.email_change_verification === 'true' ? _('Your email has been changed successfully to <strong>').translate() + this.model.get('email') + '</strong>' : this.email_change_verification
						,	type: this.email_change_verification === 'true' ? 'success' : 'error'
						,	closable: true
					});
				}
			}

		,	'Order.History.Results': function ()
			{
				var self = this
				,	records_collection = new Backbone.Collection(this.collection.map(function (order)
					{
						var dynamic_column;

						if (self.isSCISIntegrationEnabled)
						{
							dynamic_column = {
								label: _('Origin:').translate()
							,	type: 'origin'
							,	name: 'origin'
							,	value: _.findWhere(Configuration.get('transactionRecordOriginMapping'), { origin: order.get('origin') }).name
							};
						}
						else
						{
							dynamic_column = {
								label: _('Status:').translate()
							,	type: 'status'
							,	name: 'status'
							,	value: order.get('status').name
							};
						}

						var columns = [
							{
								label: _('Date:').translate()
							,	type: 'date'
							,	name: 'date'
							,	value: order.get('trandate')
							}
						,	{
								label: _('Amount:').translate()
							,	type: 'currency'
							,	name: 'amount'
							,	value: order.get('amount_formatted')
							}
						,	{
								type: 'tracking-number'
							,	name: 'trackingNumber'
							,	compositeKey: 'OrderHistoryListTrackingNumberView'
							,	composite: new OrderHistoryListTrackingNumberView({
									model: new Backbone.Model({
										trackingNumbers: order.get('trackingnumbers')
									})
								,	showContentOnEmpty: true
								,	contentClass: ''
								,	collapseElements: true
								})
							}
						];

						columns.splice(2, 0, dynamic_column);

						var model = new Backbone.Model({
							title: new Handlebars.SafeString(_('<span class="tranid">$(0)</span>').translate(order.get('tranid')))
						,	touchpoint: 'customercenter'
						,	detailsURL: '/purchases/view/' + order.get('recordtype')  + '/' + order.get('internalid')
						,	recordType: order.get('recordtype')
						,	id: order.get('internalid')
						,	internalid: order.get('internalid')
						,	trackingNumbers: order.get('trackingnumbers')
						,	columns: columns
						});

						return model;
					}));

				return new BackboneCollectionView({
					childView: RecordViewsView
				,	collection: records_collection
				,	viewsPerRow: 1
				});
			}
		}

	,	destroy: function ()
		{
			this.addresses.off(null, null, this);
			this.creditcards.off(null, null, this);

			this.offEventsOfDefaults();

			this._destroy();
		}

	,	offEventsOfDefaults: function ()
		{
			this.defaultCreditCard && this.defaultCreditCard.off(null, null, this);
			this.defaultShippingAddress && this.defaultShippingAddress.off(null, null, this);
		}

	,	getSelectedMenu: function ()
		{
			return 'home';
		}

	,	getBreadcrumbPages: function ()
		{
			return [];
		}

	,	showContent: function ()
		{
			// off events of defaults
			this.offEventsOfDefaults();

			// set the defaults
			this.defaultShippingAddress = this.addresses.findWhere({defaultshipping: 'T'});
			this.defaultCreditCard = this.creditcards.findWhere({ccdefault: 'T'});

			// on events of defaults
			this.defaultShippingAddress && this.defaultShippingAddress.on('change', this.showContent, this);
			this.defaultCreditCard && this.defaultCreditCard.on('change', this.showContent, this);

			this.title = this.model.get('firstname') ? _('Welcome $(0)!').translate(this.model.get('firstname')) : this.title;
			this.application.getLayout().showContent(this);
		}
	});
});
