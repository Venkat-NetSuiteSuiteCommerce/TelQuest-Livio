/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderHistory
define('OrderHistory.Summary.View'
,	[
		'SC.Configuration'
	,	'ReturnAuthorization.GetReturnableLines'
	,	'OrderHistory.Cancel.View'
	,	'Cart.Promocode.List.View'

	,	'order_history_summary.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	,	'Utils'
	]
,	function (
		Configuration
	,	ReturnAuthorizationGetReturnableLines
	,	CancelView
	,	CartPromocodeListView

	,	order_history_summary_tpl

	,	Backbone
	,	BackboneCompositeView
	,	_
	,	Utils
	)
{
	'use strict';

	//@class OrderHistory.Summary.View @extend Backbone.View
	return Backbone.View.extend({
		//@property {Function} template
		template: order_history_summary_tpl

	,	events: {
			'click [data-action="cancel"]': 'cancel'
		}

	,	initialize: function (options)
		{
			this.any_line_purchasable = this.isAnyLinePurchasable();
			this.all_gift_certificates = this.isAllGiftCertificates();
			this.show_request_return_button = options.show_request_return_button;
			this.pdfUrl = options.pdfUrl;
			this.isBasic = options.is_basic;
			this.application = options.application;

			BackboneCompositeView.add(this);
		}

		//@method cancel
	,	cancel: function ()
		{
			new CancelView({
				application: this.application
			,	model: this.model
			}).showInModal('order');
		}

		//@method isAnyLinePurchasable
	,	isAnyLinePurchasable: function()
		{
			if (!this.any_line_purchasable)
			{
				this.any_line_purchasable = this.model.get('lines').any(function (line)
				{
					return line.get('item').get('_isPurchasable');
				});
			}

			return this.any_line_purchasable;
		}

		//@method getPaidByTerms
	,	getPaidByTerms: function()
		{
			var terms_id = 0;
			this.model.get('paymentmethods').each(function (model)
			{
				terms_id = model.get('paymentterms') && model.get('paymentterms').internalid;
			});

			return terms_id;
		}

		//@method getDownloadPdfUrl @returns {String}
	,	getDownloadPdfUrl: function()
		{
			var pdfUrl = '';
			switch (this.model.get('recordtype'))
			{
			    case 'cashsale':
					pdfUrl = Utils.getDownloadPdfUrl({
						asset: 'cash-sale-details'
					,	id: this.model.get('internalid')
					});
					break;
			    case 'salesorder':
	        		pdfUrl = Utils.getDownloadPdfUrl({
						asset: 'order-details'
					,	id: this.model.get('internalid')
					});
					break;
			    case 'invoice':
					pdfUrl = Utils.getDownloadPdfUrl({
						asset: 'invoice-details'
					,	id: this.model.get('internalid')
					});
				break;
			}

			return pdfUrl;
		}

		//@method isReturnable indicates if the order accepts returns or not
	,	isReturnable: function ()
		{
			if (_.isUndefined(this.isReturnable))
			{
				var not_consider_fulfillments = this.model.get('recordtype') !== 'salesorder'
				,	returnable_calculator = new ReturnAuthorizationGetReturnableLines(this.model, {notConsiderFulfillments: not_consider_fulfillments});

				this.isReturnable = !!(this.model.get('isReturnable') && returnable_calculator.calculateLines().validLines.length);
			}

			return this.isReturnable;
		}

		//@method isAllGiftCertificates
	,	isAllGiftCertificates: function()
		{
			if (!this.all_gift_certificates)
			{
				this.all_gift_certificates = this.model.get('lines').all(function (line)
				{
					return line.get('item').get('itemtype') === 'GiftCert';
				});
			}

			return this.all_gift_certificates;
		}

	,	childViews: {
			'CartPromocodeListView': function ()
			{
				return new CartPromocodeListView({
					model: this.model
				,	isReadOnly: true
				});
			}
		}

		//@method getContext @return OrderHistory.Summary.View.Context
	,	getContext: function ()
		{
			var invoice_model = this.model.get('receipts').findWhere({recordtype: 'invoice'})
			,	have_terms = this.getPaidByTerms();

			//@class OrderHistory.Summary.View.Context
			return {
				//@property {OrderHistory.Model} model
				model: this.model
				//@property {Boolean} showReorderAllItemsButton
			,	showReorderAllItemsButton: this.any_line_purchasable && !this.all_gift_certificates
				//@property {Array} showSummaryDiscount
			,	showSummaryDiscount: !!this.model.get('summary').discounttotal
				//@property {Boolean} showSummaryShippingCost
			,	showSummaryShippingCost: !!this.model.get('summary').shippingcost
				//@property {Boolean} showSummaryPickupCost
			,	showSummaryPickupCost: !!this.model.get('lines').where({linegroup: 'instore'}).length
				//@property {Boolean} showSummaryHandlingCost
			,	showSummaryHandlingCost: !!this.model.get('summary').handlingcost
				//@property {Boolean} showSummaryGiftCertificateTotal
			,	showSummaryGiftCertificateTotal: !!this.model.get('summary').giftcertapplied
				//@property {Boolean} showSummaryPromocode
			,	showSummaryPromocode: !!(this.model.get('promocodes') && this.model.get('promocodes').length)
				//@property {Boolean} showViewInvoiceButton
			,	showViewInvoiceButton: !!invoice_model && !this.isBasic && !!have_terms
				//@property {Object} invoiceModel
			,	invoiceModel: invoice_model
				//@property {String} pdfUrl
			,	pdfUrl: this.getDownloadPdfUrl()
				//@property {Boolean} showRequestReturnButton
			,	showRequestReturnButton: this.isReturnable()
				//@property {Boolean} showCancelButton
			,	showCancelButton: this.model.get('isCancelable')
				// @property {String} taxLabel
			,	taxLabel: !!Configuration.get('summaryTaxLabel') ? Configuration.get('summaryTaxLabel') : 'Tax'

			};
		}
	});

});