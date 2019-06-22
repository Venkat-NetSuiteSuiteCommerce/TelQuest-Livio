/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderHistory
define('OrderHistory.Packages.View'
,	[	
		'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Address.Details.View'
	,	'Transaction.Line.Views.Cell.Actionable.View'
	,	'OrderHistory.List.Tracking.Number.View'
	,	'Transaction.Line.Views.QuantityAmount.View'
	,	'OrderHistory.Item.Actions.View'
	,	'TrackingServices'
	,	'Location.VenueDetails.View'
	,	'SC.Configuration'
	,	'Profile.Model'
	,	'order_history_packages.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		BackboneCompositeView
	,	BackboneCollectionView
	,	AddressView
	,	TransactionLineViewsCellActionableView
	,	OrderHistoryListTrackingNumberView
	,	TransactionLineViewsQuantityAmountView
	,	OrderHistoryItemActionsView
	,	TrackingServices
	,	LocationVenueDetailsView
	,	Configuration
	,	ProfileModel
	,	order_history_packages_tpl

	,	Backbone
	,	_
	,	Utils
	)
{
	'use strict';

	//@class OrderHistory.Packages.View @extend Backbone.View
	return Backbone.View.extend({
		//@property {Function} template
		template: order_history_packages_tpl
		//@method initialize
	,	initialize: function ()
		{
			this.isInStore = false;

			if (this.model.get('packageGroup') === 'instore')
			{
				this.location = this.model.get('location');
				this.profile_model = ProfileModel.getInstance();
				
				try
				{
					var ReferenceMap = Utils.requireModules('ReferenceMap');
					this.reference_map = new ReferenceMap();
				}
				catch (e)
				{
					e;
				}
			
				this.isInStore = true;

				BackboneCompositeView.add(this);

				this.location.on('change', this.render, this);
			}
			else
			{
				this.address = this.model.get('shipaddress');
				BackboneCompositeView.add(this);
			}
		}
		//@property {Object} childViews
	,	childViews: {
			'Address.StoreLocationInfo': function ()
			{
				return new LocationVenueDetailsView({
					model: this.location
				,   application: this.options.application
				,   showAddress: true
				,   hideCutoffTime: true
				});
			}
		,	'Shipping.Address.View': function()
			{
				if (!this.isInStore)
				{
					return new AddressView({
						model: this.address
					,	hideDefaults: true
					,	hideActions: true
					});
				}
			}

		,	'TrackingNumbers': function()
			{
				return new OrderHistoryListTrackingNumberView({
					model: new Backbone.Model({trackingNumbers: this.model.get('trackingnumbers')})
				,	showTrackPackagesLabel: true
				});
			}

		,	'Items.Collection': function ()
			{
				return new BackboneCollectionView({
						collection: this.model.get('lines')
					,	childView: TransactionLineViewsCellActionableView
					,	viewsPerRow: 1
					,	childViewOptions: {
							navigable: true
						,	application: this.options.application
						,	SummaryView: TransactionLineViewsQuantityAmountView
						,	ActionsView: OrderHistoryItemActionsView
						,	showTaxDetails: Configuration.get('showTaxDetailsPerLine')
					}
				});
			}
		}

		//@method getContext @return OrderHistory.Packages.View.Context
	,	getContext: function ()
		{

			var	directions_url = '';

			if (this.reference_map && this.location && !this.location.isNew() && this.location.get('location'))
			{
				directions_url = this.reference_map.getDirectionsUrl(this.profile_model.get('storeLocator_last_search'), this.location.get('location'));
			}

			//@class OrderHistory.Packages.View.Context
			return {
					//@property {Model} model
					model: this.model
					//@property {Boolean} showOrderAddress
				,	showOrderAddress: !!( this.address && this.address.get('fullname'))
					//@property {String} orderAddress
				,	orderAddress: this.address ? this.address.get('fullname') : ''
					//@property {Boolean} showDeliveryMethod
				,	showDeliveryMethod: !!(this.model.get('shipmethod') && this.model.get('shipmethod').get('name'))
					//@property {String} deliveryMethodName
				,	deliveryMethodName: this.model.get('shipmethod') ? this.model.get('shipmethod').get('name') : ''
					//@property {Boolean} showDeliverySatatus
				,	showDeliveryStatus: !this.isInStore && !!(this.model.get('status') && this.model.get('status').internalid) && !this.model.get('date')
					//@property {Boolean} showPackageStatus
				,	showPackageStatus: !!(this.model.get('status') && this.model.get('status').name) && !this.model.get('date')
					//@property {String} packageStatus
				,	packageStatus: this.model.get('status') && this.model.get('status').name
					//@property {Boolean} showDate
				,	showDate: !!this.model.get('date')
					//@property {Boolean} showTrackingNumbers
				,	showTrackingNumbers: !!this.model.get('trackingnumbers')
					//@property {Boolean} isPackageInStore
				,	isPackageInStore: this.isInStore
					//@property {String} date
				,	date: this.model.get('date') ? this.model.get('date') : ''
					//@property {Number} linesItemsAmount
				,	linesItemsAmount: !!this.model.get('lines') && _.reduce(this.model.get('lines'), function(count, line){ return count + line.get('quantity'); }, 0)
					//@property {Boolean} showOrderLocation
				,	showOrderLocation: !!this.location && !!this.location.get('name')
					//@property {StoreLocator.Model} orderLocation
				,	orderLocation: this.location
					//@property {String} getDirectionsUrl
				,	getDirectionsUrl: directions_url
					//@property {String} showGetDirectionButton
				,	showGetDirectionButton: !!directions_url
					//@property {String} initiallyCollapsed
				,	initiallyCollapsed: (_.isPhoneDevice()) ? '' : 'in'
					//@property {String} initiallyCollapsedArrow
				,	initiallyCollapsedArrow: (_.isPhoneDevice()) ? 'collapsed' : ''
					//@property {String} targetId
				, 	targetId: this.model.get('internalid')
			};

		}
	});

});