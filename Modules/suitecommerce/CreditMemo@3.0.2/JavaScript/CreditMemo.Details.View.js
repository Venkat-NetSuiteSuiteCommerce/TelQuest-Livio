/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditMemo
define('CreditMemo.Details.View'
,	[	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Transaction.Line.Views.Cell.Navigable.View'
	,	'RecordViews.View'

	,	'credit_memo_details.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		BackboneCompositeView
	,	BackboneCollectionView
	,	TransactionLineViewsCellNavigableView
	,	RecordViewsView

	,	credit_memo_details_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Creditmemo.Details.View View for handling CreditMemos @extends Backbone.View
	return Backbone.View.extend({

		template: credit_memo_details_tpl

	,	title: _('Credit Memo Details').translate()

	,	page_header: _('Credit Memo Details').translate()

	,	attributes:
		{
			'class': 'CreditMemoDetails'
		}

	,	initialize : function ()
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
				,	href: 'transactionhistory'
				}
			,	{
					text: _('Credit Memo #$(0)').translate(this.model.get('tranid'))
				,	href: 'transactionhistory/creditmemo/' + this.model.get('internalid')
				}
			];
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

						,	detail1Title: _('Quantity:').translate()
						,	detail1: 'quantity'

						,	detail2Title: _('Unit price').translate()
						,	detail2: 'rate_formatted'

						,	detail3Title: _('Amount:').translate()
						,	detail3: 'total_formatted'
						}
				});
			}
		,	'Invoices.Collection': function ()
			{
				var records_collection = new Backbone.Collection(_.map(this.model.get('invoices'), function (invoice)
					{
						var model = new Backbone.Model({
							touchpoint: 'customercenter'
						,	title: invoice.refnum
						,	detailsURL: '/invoices/'+ invoice.internalid

						,	id: invoice.id
						,	internalid: invoice.id

						,	columns: [
								{
									label: _('Transaction Date').translate()
								,	type: 'date'
								,	name: 'date'
								,	value: invoice.applydate
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
				});
			}
		}

		//@method getContext @return CreditMemo.Details.View.Context
	,	getContext: function ()
		{
			var items_quantity = this.getItemsNumber();

			//@class CreditMemo.Details.View.Context
			return {
				//@property {String} tranId
				tranId: this.model.get('tranid')
				//@property {String} totalFormatted
			,	totalFormatted: this.model.get('summary').total_formatted
				//@property {String} tranDate
			,	tranDate: this.model.get('trandate')
				//@property {String} status
			,	status: this.model.get('status').internalid
				//@property {String} subTotalFormatted
			,	subTotalFormatted: this.model.get('summary').subtotal_formatted
				//@property {String} discountFormatted
			,	discountFormatted: this.model.get('summary').discounttotal_formatted
				//@property {String} taxTotalFormatted
			,	taxTotalFormatted: this.model.get('summary').taxtotal_formatted
				//@property {String} amountPaidFormatted
			,	amountPaidFormatted: this.model.get('amountpaid_formatted')
				//@property {String} amountRemainingFormatted
			,	amountRemainingFormatted: this.model.get('amountremaining_formatted')
				//@property {String} shippingCostFormatted
			,	shippingCostFormatted: this.model.get('summary').shippingcost_formatted
				//@property {String} downloadPDFURL
			,	downloadPDFURL: _.getDownloadPdfUrl({asset: 'credit-memo-details', id: this.model.get('internalid')})
				//@property {String} memo
			,	memo: this.model.get('memo')
				//@property {Boolean} showMemoDetails
			,	showMemoDetails: this.model.get('memo')
				//@property {Number} itemsQuantityNumber
			,	itemsQuantityNumber: items_quantity
				//@property {Boolean} linesitemsNumberGreaterThan1
			,	linesitemsNumberGreaterThan1: items_quantity > 1
				//@property {Boolean} showInvoicesDetails
			,	showInvoicesDetails: !!(this.model.get('invoices') && this.model.get('invoices').length)
			};
		}
	});
});