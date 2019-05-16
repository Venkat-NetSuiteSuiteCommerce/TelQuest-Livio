/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Receipt
define(
	'Receipt.Details.View'
,	[	'OrderHistory.Details.View'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'GlobalViews.FormatPaymentMethod.View'
	,	'Address.Details.View'
	,	'Transaction.Line.Views.Cell.Actionable.View'
	,	'Receipt.Details.Item.Summary.View'
	,	'Receipt.Details.Item.Actions.View'
	,	'LiveOrder.Model'
	,	'GlobalViews.Message.View'

	,	'receipt_details.tpl'

	,	'jQuery'
	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		OrderHistoryDetailsView
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	GlobalViewsFormatPaymentMethodView
	,	AddressView
	,	TransactionLineViewsCellActionableView
	,	ReceiptDetailsItemSummaryView
	,	ReceiptDetailsItemActionsView
	,	LiveOrderModel
	,	GlobalViewsMessageView

	,	receipt_details_tpl

	,	jQuery
	,	Backbone
	,	_
	,	Utils
	)
{
	'use strict';

	//@class Receipt.Details.View Views for receipt's details #extend Backbone.View
	return OrderHistoryDetailsView.extend({

		template: receipt_details_tpl

	,	title: _('Receipt Details').translate()

	,	attributes: {'class': 'OrderDetailsView'}

	,	events:{
			'click [data-action="addToCart"]': 'addToCart'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			BackboneCompositeView.add(this);
		}

	,	addToCart: function(event)
		{
			var target = jQuery(event.currentTarget)
			,	selected_line = this.model.get('lines').get(target.data('line-id'))
			,	quantity = target.data('partial-quantity') || target.data('item-quantity')
			,	placeholder = target.closest('[data-type="order-item"]').find('[data-type="alert-placeholder"]');

			LiveOrderModel.getInstance().addLine(selected_line).done(function ()
			{
				var message = quantity > 1 ?
					_('$(0) Items successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>').translate(quantity) :
					_('Item successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>').translate();

				var alert = new GlobalViewsMessageView({
						message: message
					,	type: 'success'
					,	closable: true
				});

				alert.show(placeholder, 6000);
			});
		}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return this.options.referrer === 'transactionhistory' ? 'transactionhistory' : 'receiptshistory';
		}

		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{

			var created_from = this.model.get('createdfrom')
			,	breadcrumb_pages = [];

			if (this.options.referrer === 'transactionhistory')
			{
				breadcrumb_pages.push({
					text: _('Transaction History').translate()
				,	href: '/transactionhistory'
				});
			}
			else if (created_from && created_from.internalid)
			{
				breadcrumb_pages.push({
					text: _('Purchase History').translate()
				,	href: '/purchases'
				});

				breadcrumb_pages.push({
					text: _('Purchase #$(0)').translate(created_from.tranid)
				,	href: '/purchases/view/' + created_from.recordtype + '/' + created_from.internalid
				});
			}

			breadcrumb_pages.push({
				text: _('Receipt #$(0)').translate(this.model.get('tranid'))
			,	path: '/receiptshistory/view/' + this.model.get('internalid')
			});

			return breadcrumb_pages;
		}

	,	render: function ()
		{
			this.title = _('Receipt Details').translate();
			this.billaddress = this.model.get('addresses').get(this.model.get('billaddress'));
			this.paymentmethod = this.model.get('paymentmethods') && this.model.get('paymentmethods').findWhere({primary: true});

			Backbone.View.prototype.render.apply(this, arguments);
		}
	,	childViews: {
			'FormatPaymentMethod': function()
			{
				return new GlobalViewsFormatPaymentMethodView({model: this.paymentmethod});
			}
		,	'Address.View': function ()
			{
				return new AddressView({
					model: this.billaddress
				,	hideDefaults: true
				,	hideActions: true
				});
			}
		,	'Item.Details.Line': function ()
			{
				return new BackboneCollectionView({
					collection: this.model.get('lines')
				,	childView: TransactionLineViewsCellActionableView
				,	childViewOptions:
					{
						SummaryView: ReceiptDetailsItemSummaryView
					,	ActionsView: ReceiptDetailsItemActionsView
					,	application: this.application
					,	navigable: true
					}
				});
			}
		}

		//@method getItemsNumber
	,	getItemsNumber: function()
		{
			var items_quantity = 0;
			this.model.get('lines').each(function (models)
			{
				items_quantity += models.get('quantity');
			});

			return items_quantity;
		}

		//@method getContext @return Receipt.Details.View.Context
	,	getContext: function ()
		{
			var	lines = this.model.get('lines').models
			,	items_quantity = this.getItemsNumber();

			//@class Receipt.Details.View.Context
			return {
				//@property {Receipt.Model} model
				model: this.model
				//@property {Number} orderNumber
			,	orderNumber: this.model.get('tranid')
				//@property {String} date
			,	date: this.model.get('trandate')
				//@property {String} status
			,	status: this.model.get('status')? this.model.get('status').name : ''
				//@property {Boolean} showPaymentMethod
			,	showPaymentMethod: !!this.paymentmethod
				//@property {Boolean} showBillingAddress
			,	showBillingAddress: !!this.billaddress
				//@property {String} subTotalFormatted
			,	subTotalFormatted: this.model.get('summary').subtotal_formatted
				//@property {Boolean} showDiscountTotal
			,	showDiscountTotal: !!(parseFloat(this.model.get('summary').discounttotal))
				//@property {String} discountTotalFormatted
			,	discountTotalFormatted: this.model.get('summary').discounttotal_formatted
				//@property {Boolean} showShippingCost
			,	showShippingCost: !!(parseFloat(this.model.get('summary').shippingcost))
				//@property {String} shippingCostFormatted
			,	shippingCostFormatted: this.model.get('summary').shippingcost_formatted
				//@property {Boolean} showHandlingCost
			,	showHandlingCost: !!(parseFloat(this.model.get('summary').handlingcost))
				//@property {String} handlingCostFormatted
			,	handlingCostFormatted: this.model.get('summary').handlingcost_formatted
				//@property {Boolean} showPromocode
			,	showPromocode: !!this.model.get('promocode')
				//@property {String} promocode
			,	promocode: this.model.get('promocode') && this.model.get('promocode').code
				//@property {String} taxTotalFormatted
			,	taxTotalFormatted: this.model.get('summary').taxtotal_formatted
				//@property {String} totalFormatted
			,	totalFormatted: this.model.get('summary').total_formatted
				//@property {String} downloadPDFURL
			,	pdfUrl: Utils.getDownloadPdfUrl({
					asset: 'cash-sale-details'
				,	id: this.model.get('internalid')
				})
				//@property {Boolean} showLines
			,	showLines: !!(lines && lines.length)
				//@property {Boolean} isLinesLengthGreaterThan1
			,	isLinesLengthGreaterThan1: !!(lines && lines.length > 1)
				//@property {Number} itemsQuantityNumber
			,	itemsQuantityNumber: items_quantity
				//@property {Number} itemsQuantityLengthGreaterThan1
			,	itemsQuantityLengthGreaterThan1: items_quantity > 1
				//@property {Number} linesLength
			,	linesLength: lines ? lines.length : 0
				//@property {Boolean} showCollapsedItems
			,	showCollapsedItems: this.application.getConfig('sca.collapseElements')
				//@property {Boolean} haveCreatedFrom
			,	haveCreatedFrom: !!(this.model.get('createdfrom') && this.model.get('createdfrom').internalid)
				//@property {Boolean} showOpenedAccordion
			,	showOpenedAccordion:  _.isTabletDevice() || _.isDesktopDevice()
			};
		}
	});
});