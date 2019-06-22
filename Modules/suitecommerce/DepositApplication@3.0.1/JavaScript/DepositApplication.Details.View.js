/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module DepositApplication
define('DepositApplication.Details.View'
,	[	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'RecordViews.View'
	,	'SC.Configuration'

	,	'deposit_application_details.tpl'

	,	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		BackboneCompositeView
	,	BackboneCollectionView
	,	RecordViewsView
	,	Configuration

	,	deposit_application_details_tpl

	,	_
	,	Backbone
	)
{
	'use strict';

	//@class DepositApplication.Details.View @extend Backbone.View
	return Backbone.View.extend({

		template: deposit_application_details_tpl

	,	title: _('Deposit Application Details').translate()

	,	page_header: _('Deposit Application Details').translate()

	,	attributes:
		{
			'class': 'DepositApplicationDetails'
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
					text: _('Deposit Application #$(0)').translate(this.model.get('tranid'))
				,	path: 'transactionhistory/depositapplication/' + this.model.get('internalid')
				}
			];
		}

	,	childViews: {
			'Invoices.Collection': function ()
			{
				var records_collection = new Backbone.Collection(this.model.get('invoices').map(function (invoice)
				{
					var model = new Backbone.Model({
						touchpoint: 'customercenter'

					,	title: _('Invoice #$(0)').translate(invoice.get('refnum'))
					,	detailsURL: '/invoices/'+ invoice.get('internalid')

					,	id: invoice.get('internalid')
					,	internalid: invoice.get('internalid')

					,	columns: [
							{
								label: _('Transaction Date:').translate()
							,	type: 'date'
							,	name: 'date'
							,	value: invoice.get('applydate')
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
		}

		//@method getContet @return DepositApplication.Details.View.Context
	,	getContext: function ()
		{
			//@class DepositApplication.Details.View.Context
			return {
				//@property {String} tranId
				tranId: this.model.get('tranid')
				//@property {String} totalFormatted
			,	totalFormatted: this.model.get('summary').total_formatted
				//@property {String} tranDate
			,	tranDate: this.model.get('trandate')
				//@property {Boolean} areElementsCollapsed
			,	areElementsCollapsed: Configuration.get('sca.collapseElements', false)
				//@property {String} depositInternalId
			,	depositInternalId: this.model.get('deposit').internalid
				//@property {String} depositName
			,	depositName: this.model.get('deposit').name
				//@property {String} depositDate
			,	depositDate: this.model.get('depositdate')
				//@property {Boolean} showInvoices
			,	showInvoices: !!(this.model.get('invoices') && this.model.get('invoices').length)
				//@property {Boolean} showMemo
			,	showMemo: !!this.model.get('memo')
				//@property {String} memo
			,	memo: this.model.get('memo')
				//@property {Boolean} showOpenedAccordion
			,	showOpenedAccordion:  _.isTabletDevice() || _.isDesktopDevice()
			};
			//@class DepositApplication.Details.View
		}
	});
});
