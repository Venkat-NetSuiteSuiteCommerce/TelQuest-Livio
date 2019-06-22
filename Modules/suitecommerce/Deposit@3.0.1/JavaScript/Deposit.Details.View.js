/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Deposit
define('Deposit.Details.View'
,	[	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'SC.Configuration'
	,	'GlobalViews.FormatPaymentMethod.View'
	,	'RecordViews.View'
	,	'Deposit.Details.DepositApplication.Link.View'

	,	'deposit_details.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		BackboneCompositeView
	,	BackboneCollectionView
	,	Configuration
	,	GlobalViewsFormatPaymentMethodView
	,	RecordViewsView
	,	DepositDetailsDepositApplicationLinkView

	,	deposit_details_tpl
	,	Backbone
	,	_
	)
{
	'use strict';

	//@class Deposit.Details.View @extend Backbone.View
	return Backbone.View.extend({

		template: deposit_details_tpl

	,	title: _('Deposit Details').translate()

	,	page_header: _('Deposit Details').translate()

	,	attributes:
		{
			'class': 'DepositDetails'
		}

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'transactionhistory';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return [
				{
					text: _('Transaction History').translate()
				,	href: '/transactionhistory'
				}
			,	{
					text: _('Deposit #$(0)').translate(this.model.get('tranid'))
				,	path: 'transactionhistory/customerdeposit/' + this.model.get('internalid')
				}
			];
		}

	,	render: function()
		{
			this.payment_method = this.model.get('paymentmethods') && this.model.get('paymentmethods').findWhere({primary: true});

			Backbone.View.prototype.render.apply(this, arguments);
		}

	,	childViews: {
			'Invoices.Collection' : function ()
			{
				var records_collection = new Backbone.Collection(this.model.get('invoices').map(function (invoice)
					{
						var model = new Backbone.Model({
							touchpoint: 'customercenter'

						,	title: _('Invoice #$(0)').translate(invoice.get('refnum'))
						,	detailsURL: '/invoices/'+ invoice.get('invoice_id')

						,	id: invoice.get('invoice_id') + '_' + invoice.get('line')
						,	internalid: invoice.get('invoice_id') + '_' + invoice.get('line')

						,	columns: [
								{
									label: _('Invoice Date').translate()
								,	type: 'date'
								,	name: 'invoice-date'
								,	value: invoice.get('invoicedate')
								}
							,	{
									label: _('Date Applied').translate()
								,	type: 'date'
								,	name: 'applied-date'
								,	compositeKey: 'DepositDetailsDepositApplicationLinkView'
								,	composite: new DepositDetailsDepositApplicationLinkView({
										model: new Backbone.Model({
											depositId: invoice.get('deposit_id')
										,	depositDate: invoice.get('depositdate')
										})
									})
								}
							,	{
									label: _('Amount:').translate()
								,	type: 'currency'
								,	name: 'amount'
								,	value: invoice.get('amount_formatted')
								}
							]
						});

						return model;
					}));

				return new BackboneCollectionView({
					childView: RecordViewsView
				,	collection: records_collection
				,	viewsPerRow: 1
				});
			}
		,	'PaymentMethod': function ()
			{
				return new GlobalViewsFormatPaymentMethodView({model: this.payment_method});
			}
		}

		//@method getContext @return Deposit.Details.View.Context
	,	getContext: function ()
		{
			//@class Deposit.Details.View.Context
			return {
				//@property {String} tranId
				tranId: this.model.get('tranid')
				//@property {String} paymentFormatted
			,	paymentFormatted: this.model.get('payment_formatted')
				//@property {String} paidFormatted
			,	paidFormatted: this.model.get('paid_formatted')
				//@property {String} remainingFormatted
			,	remainingFormatted: this.model.get('remaining_formatted')
				//@property {String} tranDate
			,	tranDate: this.model.get('trandate')
				//@property {String} status
			,	status: this.model.get('status').internalid
				//@property {Boolean} areElementsCollapsed
			,	areElementsCollapsed: Configuration.get('collapse_elements')
				//@property {String} downloadPDFURL
			,	downloadPDFURL: _.getDownloadPdfUrl({asset: 'deposit-details', id: this.model.get('internalid')})
				//@property {Boolean} showInvoices
			,	showInvoices: !!(this.model.get('invoices') && this.model.get('invoices').length)
				//@property {Boolean} showPaymentMethod
			,	showPaymentMethod: !!(this.payment_method && this.payment_method.get('type'))
				//@property {Boolean} showMemo
			,	showMemo: !!this.model.get('memo')
				//@property {String} memo
			,	memo: this.model.get('memo')
				//@property {Boolean} showOpenedAccordion
			,	showOpenedAccordion:  _.isTabletDevice() || _.isDesktopDevice()
			};
		}
	});
});