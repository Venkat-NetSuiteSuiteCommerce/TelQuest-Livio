/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReturnAuthorization
define('ReturnAuthorization.Detail.View'
,	[	'ReturnAuthorization.Cancel.View'
	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'
	,	'Transaction.Line.Views.Cell.Navigable.View'
	,	'RecordViews.View'
	,	'SC.Configuration'

	,	'return_authorization_detail.tpl'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		CancelView
	,	BackboneCollectionView
	,	BackboneCompositeView
	,	TransactionLineViewsCellNavigableView
	,	RecordViewsView
	,	Configuration

	,	return_authorization_detail_tpl

	,	Backbone
	,	_
	,	jQuery
	,	Utils
	)
{
	'use strict';

	//@class ReturnAuthorization.Detail.View @extend Backbone.View
	return Backbone.View.extend({

		template: return_authorization_detail_tpl

	,	title: _('Return Details').translate()

	,	events: {
			'click [data-action="cancel"]': 'cancel'
		}

	,	attributes: {
			'class': 'ReturnAuthorizationDetail'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			BackboneCompositeView.add(this);
		}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'returns';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return [
				{
					text: _('Returns').translate()
				,	href: '/returns'
				}
			,	{
					text: _('Return #$(0)').translate(this.model.get('tranid'))
				,	href: '/returns'
				}
			];
		}

	,	getRecordProperties: function()
		{
			var created_from = this.model.get('createdfrom')
			,	is_basic = this.application.getConfig('isBasic')
			,	properties = {
					record_url: ''
				,	record_label: _('Invoice').translate()
			};

			//site builder basic does not support invoice link
			if (!created_from || (is_basic && created_from.type === 'CustInvc'))
			{
				return properties;
			}

			switch(created_from.type)
			{
				case 'SalesOrd':
					properties.record_url = '/ordershistory/view/' + created_from.internalid;
					properties.record_label = _('Order').translate();
					break;

				case 'CashSale':
					properties.record_url = '/receiptshistory/view/' + created_from.internalid;
					properties.record_label = _('Receipt').translate();
					break;

				default: 
					properties.record_url = '/invoices/' + created_from.internalid;
					properties.record_label = _('Invoice').translate();
			}

			return properties;
		}

	,	cancel: function ()
		{
			new CancelView({
				application: this.application
			,	model: this.model
			}).showInModal('returns');

			this.model.once('sync', jQuery.proxy(this, 'redirect'));
		}

	,	redirect: function ()
		{
			Backbone.history.navigate('returns?cancel=' + this.model.get('internalid'), {trigger: true});
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

					,	detail2Title: _('Reason:').translate()
					,	detail2: 'reason'

					,	detail3Title: _('Amount:').translate()
					,	detail3: 'total_formatted'
					}
				});
			}
		,	'Invoices.Collection': function ()
			{
				var records_collection = this.model.get('applies').map(function (apply)
				{
					var is_invoice = apply.get('recordtype') === 'invoice'
					,	title;

					if (is_invoice)
					{
						title = _('Invoice #$(0)').translate(apply.get('tranid'));
					}
					else
					{
						title = apply.get('recordtype') + (apply.get('tranid') ? (' #' + apply.get('tranid') ) : '');
					}
										
					return {
							touchpoint: 'customercenter'
						,	title: title
						,	detailsURL: is_invoice ? '/invoices/' + apply.get('internalid') : ''
						,	tranid: apply.get('tranid')
						,	internalid: apply.get('internalid')
						,	columns: [
								{
									label: _('Transaction Date').translate()
								,	type: 'date'
								,	name: 'date'
								,	value: apply.get('applydate')
								}
							,	{
									label: _('Amount:').translate()
								,	type: 'currency'
								,	name: 'amount'
								,	value: apply.get('amount_formatted')
								}
							]
					};
				});

				return new BackboneCollectionView({
					childView: RecordViewsView
				,	collection: records_collection
				,	viewsPerRow: 1
				});
			}
		}

		//@method getDownloadPdfUrl @returns {String}
	,	getDownloadPdfUrl: function()
		{
			var pdfUrl = '';
			
			switch (this.model.get('recordtype')) 
			{
			    case 'creditmemo':
					pdfUrl = Utils.getDownloadPdfUrl({
						asset: 'credit-memo-details'
					,	id: this.model.get('internalid')
					});
					break;
			    case 'returnauthorization':
	        		pdfUrl = Utils.getDownloadPdfUrl({
						asset: 'return-details'
					,	id: this.model.get('internalid')
					});
					break;
			}

			return pdfUrl;
		}


		//@method getContext @return ReturnAuthorization.Detail.View.Context
	,	getContext: function ()
		{
			var lines_length = this. model.get('lines').length
			,	applies = this.model.get('applies')
			,	items_quantity = this.getItemsNumber();

			//@class ReturnAuthorization.Detail.View.Context
			return {
				//@property {ReturnAuthorization.Model} model
				model: this.model
				//@property {String} createdFromURL
			,	downloadPDFURL: this.getDownloadPdfUrl()
				//@property {Boolean} isCancelable
			,	isCancelable: !!this.model.get('isCancelable')
				//@property {Boolean} showCreatedFrom
			,	showCreatedFrom: !!(this.model.get('createdfrom') && this.model.get('createdfrom').internalid)
				//@property {Boolean} showCreatedFromLink
			,	showCreatedFromLink: !!this.model.get('createdfrom').tranid
				//@property {Boolean} isElementCollapsed
			,	isElementCollapsed: !!Configuration.get('sca.collapseElements')
				//@property {Number} linesLength
			,	linesLength: lines_length
				//@property {Boolean} showComment
			,	showComments: !!this.model.get('memo')
				//@property {Boolean} showOpenedAccordion
			,	showOpenedAccordion:  _.isTabletDevice() || _.isDesktopDevice()
				//@property {Boolean} initiallyCollapsed
			,	initiallyCollapsed: (_.isPhoneDevice()) ? '' : 'in'
				//@property {Boolean} initiallyCollapsedArrow
			,	initiallyCollapsedArrow: (_.isPhoneDevice()) ? 'collapsed' : ''
				//@property {Boolean} linesLengthGreaterThan1
			,	linesLengthGreaterThan1: lines_length > 1
				//@property {Number} itemsQuantityNumber
			,	itemsQuantityNumber: items_quantity
				//@property {Boolean} linesitemsNumberGreaterThan1
			,	linesitemsNumberGreaterThan1: items_quantity > 1
				//@property {Boolean} isCreditMemo
			,	showAppliesSection: this.model.get('recordtype') === 'creditmemo'
				//@property {Boolean} showDiscountTotal
			,	showDiscountTotal: !!this.model.get('summary').discounttotal
				//@property {Boolean} showHandlingTotal
			,	showHandlingTotal: !!this.model.get('summary').handlingcost
				//@property {Boolean} showShippingTotal
			,	showShippingTotal: !!this.model.get('summary').shippingcost
				//@property {Boolean} showInvoicesDetails
			,	showInvoicesDetails: !!(applies && applies.length)
			};
		}
	});
});