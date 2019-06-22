/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module CustomerPayment
define(
	'CustomerPayment.Details.View'
,	[	'SC.Configuration'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'RecordViews.View'
	,	'GlobalViews.FormatPaymentMethod.View'

	,	'customer_payment_details.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		Configuration
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	RecordViewsView
	,	GlobalViewsFormatPaymentMethodView

	,	customer_payment_details_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class CustomerPayment.Details.View @extend Backbone.View
	return Backbone.View.extend({

		template: customer_payment_details_tpl

	,	title: _('Payment Details').translate()

	,	page_header: _('Payment Details').translate()

	,	attributes:
		{
			'class': 'PaymentDetails'
		}

	,   initialize: function (options)
		{
			this.application = options.application;

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
					text: _('Payment #$(0)').translate(this.model.get('tranid'))
				,	href: '/transactionhistory/customerpayment/' + this.model.get('internalid')
				}
			];
		}

	,	render: function()
		{
			
			this.payment_method = this.model.get('paymentmethods') && this.model.get('paymentmethods').findWhere({primary: true});

			Backbone.View.prototype.render.apply(this, arguments);
		}

	,	childViews: {
			'Invoices.Collection': function ()
			{
				var records_collection = new Backbone.Collection(_.map(this.model.get('invoices'), function (invoice)
					{
						var model = new Backbone.Model({
							touchpoint: 'customercenter'
						,	title: invoice.refnum ? _('Invoice #$(0)').translate(invoice.refnum) : _('Journal').translate()
						,	detailsURL: invoice.refnum ? '/invoices/'+ invoice.internalid : ''

						,	isNavigable: !!invoice.refnum

						,	id: invoice.id
						,	internalid: invoice.id

						,	columns: [
								{
									label: _('Date:').translate()
								,	type: 'date'
								,	name: 'date'
								,	value: invoice.applydate
								}
							,	{
									label: _('Disc:').translate()
								,	type: 'discount'
								,	name: 'discount'
								,	value: invoice.disc_formatted
								}
							,	{
									label: _('Amount:').translate()
								,	type: 'currency'
								,	name: 'amount'
								,	value: invoice.amount_formatted
								}
							]
						});

						return model;
					}));

				return new BackboneCollectionView({
					childView: RecordViewsView
				,	collection: records_collection
				,	viewsPerRow: 1
				,	childViewOptions: {
						layoutColumns: 4
					}
				});
			}
		,	'PaymentMethod': function ()
			{
				return new GlobalViewsFormatPaymentMethodView({model: this.payment_method});
			}
		}

		//@method getContext @return CustomerPayment.Details.View.Context
	,	getContext: function ()
		{
			//@class CustomerPayment.Details.View.Context
			return {
				//@property {String} tranId
				tranId: this.model.get('tranid')
				//@property {String} paymentFormatted
			,	paymentFormatted: this.model.get('payment_formatted')
				//@property {String} tranDate
			,	tranDate: this.model.get('trandate')
				//@property {String} status
			,	status: this.model.get('status').internalid
				//@property {String} memo
			,	memo: this.model.get('memo')
				//@property {Boolean} collapseElements
			,	collapseElements: Configuration.get('sca.collapseElements')
				//@property {Boolean} showInvoices
			,	showInvoices: !!(this.model.get('invoices') && this.model.get('invoices').length)
				//@property {Boolean} showPaymentMethod
			,	showPaymentMethod: !!(this.payment_method && this.payment_method.get('type'))
				//@property {Boolean} showMemo
			,	showMemo: !!this.model.get('memo')
				//@property {String} downloadPDFURL
			,	downloadPDFURL: _.getDownloadPdfUrl({asset: 'customer-payment-details', id: this.model.get('internalid')})
				//@property {Boolean} showOpenedAccordion
			,	showOpenedAccordion:  _.isTabletDevice() || _.isDesktopDevice()
				//@property {Boolean} showPaymentEventFail
			,	showPaymentEventFail: this.model.get('paymenteventholdreason') === 'FORWARD_REQUESTED'
				//@property {String} redirectUrl
			,	redirectUrl: this.model.get('redirecturl')
			};
		}
	});
});
