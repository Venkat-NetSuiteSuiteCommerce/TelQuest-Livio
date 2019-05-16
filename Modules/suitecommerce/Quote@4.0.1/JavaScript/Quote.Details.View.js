/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Quote
define(
	'Quote.Details.View'
,	[
		'SC.Configuration'
	,	'Transaction.Line.Views.Cell.Navigable.View'
	,	'Address.Details.View'

	,	'quote_details.tpl'

	,	'Backbone'
	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'
	,	'underscore'

	,	'Utils'
	,	'UrlHelper'
	]
,	function (
		Configuration
	,	TransactionLineViewsCellNavigableView
	,	AddressDetailsView

	,	quote_details_tpl

	,	Backbone
	,	BackboneCollectionView
	,	BackboneCompositeView
	,	_
	)
{
	'use strict';

	// @class Quote.Details.View @extends Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: quote_details_tpl

		//@property {String} title
	,	title: _('Quote Details').translate()

		//@property {class: String} attributes
	,	attributes: { 'class': 'QuoteDetails' }

		//@method initialize
		//@param {application: ApplicationSkeleton} options
		//@return {Void}
	,	initialize: function (options)
		{
			this.application = options.application;

			//@property {Quote.Details.View.ErrorMessages} statusTranslationKeys
			this.statusTranslationKeys = {
				'INVALIDPERMISSION': _('Not allowed').translate()
			,	'INVALIDENTITYSTATUS': _('Sales representative approval').translate()
			,	'MISSINGSHIPMETHOD': _('Shipping information').translate()
			,	'MISSINGSHIPADDRESS': _('Shipping information').translate()
			,	'GIFTCERTIFICATENOTALLOWED': _('Gift Certificate not allowed').translate()
			,	'MISSINGSALESREP': _('Sales Representative assigned').translate()
			};

			BackboneCompositeView.add(this);
		}

		//@method getSelectedMenu
		//@return {String}
	,	getSelectedMenu: function ()
		{
			return 'quotes';
		}

		//@method getBreadcrumbPages
		//@return {Array<BreadcrumbPage>} Override breadcrumbs titles
	,	getBreadcrumbPages: function ()
		{
			return [
				{
					text: _('Quotes').translate()
				,	href: '/quotes'
				}
			,	{
					text: _('Quote #$(0)').translate(this.model.get('tranid') || '')
				,	href: '/quotes'
				}
			];
		}

		//@method showContent Override default showContent in order to obtain in one single execution data from the model
		//@return {jQuery.Promise<Quote.Details.View>}
	,	showContent: function ()
		{
			var self = this;
			this.billaddress = this.model.get('addresses').get(this.model.get('billaddress'));
			this.shipaddress = this.model.get('addresses').get(this.model.get('shipaddress'));

			var first_step = _.first(_.flatten(_.pluck(Configuration.get('quotesToSalesOrderWizard.steps', []), 'steps')));
			this.reviewQuoteURL = (first_step && first_step.url) || '';
			this.reviewQuoteURL = _.setUrlParameter(this.reviewQuoteURL, 'quoteid', this.model.id);

			this.model.get('purchasablestatus').validationErrors = _.reject(this.model.get('purchasablestatus').validationErrors, function (error_code)
			{
				if (error_code === 'GIFTCERTIFICATENOTALLOWED')
				{
					self.showGiftCertificateMessage = true;
					return true;
				}
				return false;
			});

			return Backbone.View.prototype.showContent.apply(this, arguments);
		}

		// @property {ChildViews} childViews
	,	childViews: {
			'Items.Collection': function ()
			{
				return new BackboneCollectionView({
					collection: this.model.get('lines')
				,	childView: TransactionLineViewsCellNavigableView
				,	viewsPerRow: 1
				,	childViewOptions: {
						navigable: true

					,	detail1Title: _('Qty:').translate()
					,	detail1: 'quantity'

					,	detail2Title: _('List price:').translate()
					,	detail2: 'rate_formatted'

					,	detail3Title: _('Amount:').translate()
					,	detail3: 'total_formatted'
					}
				});
			}
		,	'Billing.Address': function ()
			{
				return new AddressDetailsView({
					model: this.billaddress
				,	hideDefaults: true
				,	hideActions: true
				});
			}
		}

		//@method _generateErrorMessages is an internal method used to get error message from the error code
		//@return {Array<String>}
	,	_generateErrorMessages: function ()
		{
			var self = this;
			var results = _.map(this.model.get('purchasablestatus').validationErrors, function (error_key)
			{
				return self.statusTranslationKeys[error_key] || _('Unknown error').translate();
			});

			// If there two or more messages equal, this make a unique message
			return _.uniq(results);
		}

		// @method getContext
		// @return {Quote.Details.View.Context}
	,	getContext: function()
		{
			var lineItemsLength = _.reduce(this.model.get('lines').pluck('quantity'), function (accum, quantity) { return accum + quantity;}, 0);

			// @class Quote.Details.View.Context
			return {
				// @property {String} tranid
				tranid: this.model.get('tranid') || ''
				// @property {Quote.Model} model
			,	model: this.model
				// @property {Number} lineItemsLength
			,	lineItemsLength: lineItemsLength
				// @property {String} entityStatusName
			,	entityStatusName: (this.model.get('entitystatus') && this.model.get('entitystatus').name) || ''
				// @property {String} pdfUrl
			,	pdfUrl: _.getDownloadPdfUrl({asset: 'quote-details', 'id': this.model.get('internalid')})
				// @property {String} reviewQuoteURL
			,	reviewQuoteURL: this.reviewQuoteURL
				// @property {Boolean} showPromocode
			,	showPromocode: !!this.model.get('promocode')
				// @property {Boolean} showPromocode
			,	showDiscount: !!this.model.get('discount')
				// @property {Boolean} showBillingAddress
			,	showBillingAddress: !!this.billaddress
				// @property {Boolean} showMessage
			,	showMessage: !!this.model.get('message')
				// @property {String} message
			,	message: this.model.get('message')
				// @property {Boolean} showMemo
			,	showMemo: !!this.model.get('memo')
				// @property {String} memo
			,	memo: this.model.get('memo')
				// @property {Boolean} collapseElements
			,	collapseElements: Configuration.get('sca.collapseElements')
				// @property {Transaction.Model.Get.Summary} summary
			,	summary: this.model.get('summary')
				// @property {String} duedate
			,	duedate: this.model.get('duedate') || ''
				// @property {Boolean} hasDuedate
			,	hasDuedate: !!this.model.get('duedate')
				// @property {Boolean} showSalesRepInformation
			,	hasSalesrep: !!(this.model.get('salesrep') && this.model.get('salesrep').fullname)
				// @property {Boolean} showSalesRepInformation Name
			,	salesrepName: this.model.get('salesrep') && this.model.get('salesrep').fullname
				// @property {Boolean} showSalesRepInformation Phone
			,	salesrepPhone: (this.model.get('salesrep') && this.model.get('salesrep').phone) || Configuration.get('quote.defaultPhone')
				// @property {Boolean} showSalesRepInformation Email
			,	salesrepEmail: (this.model.get('salesrep') && this.model.get('salesrep').email) || Configuration.get('quote.defaultEmail')
				// @property {String} disclaimerSummaryº configurable HTML string
			,	disclaimerSummary: _(Configuration.get('quote.disclaimerSummary', '')).translate()
				// @property {String} disclaimer configurable HTML string
			,	disclaimer: _(Configuration.get('quote.disclaimer', '')).translate()
				// @property {Array<String>} purchaseValidationErrors
			,	purchaseValidationErrors: this._generateErrorMessages()
				// @property {Boolean} isOpen
			,	isOpen: this.model.get('isOpen') && !Configuration.get('isBasic')
				//@property {Boolean} showOpenedAccordion
			,	showOpenedAccordion:  _.isTabletDevice() || _.isDesktopDevice()
				//@property {Boolean} hasPermission
			,	hasPermission: this.model.get('allowToPurchase')
				//@property {Boolean} showHandlingCost
			,	showHandlingCost: !!this.model.get('summary').handlingcost
				//@property {Boolean} showGiftCertificateMessage
			,	showGiftCertificateMessage: this.showGiftCertificateMessage
				//@property {Boolean} hasPermissionAndHasErrors
			,	hasPermissionAndHasErrors: this.model.get('allowToPurchase') && this._generateErrorMessages().length
				//@property {Boolean} showQuoteStatus
			,	showQuoteStatus: !!(this.model.get('entitystatus') && this.model.get('entitystatus').name)
			};

			// @class Quote.Details.View
		}
	});
});

//@class Quote.Details.View.ErrorMessages
//In this object each key is the error code and each value is the transalte message
//This object is used as a dictionary for error that came form the backend