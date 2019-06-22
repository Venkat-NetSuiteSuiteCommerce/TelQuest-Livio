/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module TransactionHistory
define(
	'TransactionHistory.List.View'
,	[	'TrackingServices'
	,	'ListHeader.View'
	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'
	,	'RecordViews.View'
	,	'SC.Configuration'
	,	'GlobalViews.Pagination.View'

	,	'transaction_history_list.tpl'

	,	'Handlebars'
	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Profile.Model'
	]
,	function (
		TrackingServices
	,	ListHeaderView
	,	BackboneCollectionView
	,	BackboneCompositeView
	,	RecordViewsView
	,	Configuration
	,	GlobalViewsPaginationView

	,	transaction_history_tpl

	,	Handlebars
	,	Backbone
	,	_
	,	jQuery
	,	ProfileModel
	)

{
	'use strict';

	// @class TransactionHistory.List.View view list of transaction history @extend Backbone.View
	return Backbone.View.extend({

		template: transaction_history_tpl

	,	title: _('Transaction History').translate()

	,	page_header: _('Transaction History').translate()

	,	attributes: {
			'class': 'TransactionHistory'
		}

	,	initialize: function (options)
		{
			this.application = options.application;

			this.collection = options.collection;

			this.profileModel = ProfileModel.getInstance();

			this.listenCollection();

			var today = new Date()
			,	isoDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

			this.rangeFilterOptions = {
				fromMin: '1800-01-02'
			,	fromMax: isoDate
			,	toMin: '1800-01-02'
			,	toMax: isoDate
			};

			this.listHeader = new ListHeaderView({
				view: this
			,	application: this.application
			,	collection: this.collection
			,	filters: this.filterOptions
			,	sorts: this.sortOptions
			,	rangeFilter: 'date'
			,	rangeFilterLabel: _('From').translate()
			,	hidePagination: true
            ,   allowEmptyBoundaries: true
			});

			BackboneCompositeView.add(this);
		}

		// @method listenCollection
	,	listenCollection: function ()
		{
			this.setLoading(true);

			this.collection.on({
				request: jQuery.proxy(this, 'setLoading', true)
			,	reset: jQuery.proxy(this, 'setLoading', false)
			});
		}

		// @method setLoading @param {Boolean} bool
	,	setLoading: function (bool)
		{
			this.isLoading = bool;
		}

		//@method getSelectedMenu @return {String}
	,	getSelectedMenu: function ()
		{
			return 'transactionhistory';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return {
				text: this.title
			,	href: '/transactionhistory'
			};
		}

		// @property {Array} filterOptions Array of default filter options filters always apply on the original collection
	,	filterOptions: [
			{
				value: 'CustCred,CustPymt,CustDep,DepAppl,CustInvc,CashSale'
			,	name: _('Show all record types').translate()
			,	selected: true
			}
		,	{
				value: 'CustCred'
			,	name: _('Show Credit Memo').translate()
			,	permission: 'transactions.tranCustCred.1'
			}
		,	{
				value: 'CustPymt'
			,	name: _('Show Payment').translate()
			,	permission: 'transactions.tranCustPymt.1'
			}
		,	{
				value: 'CustDep'
			,	name: _('Show Deposit').translate()
			,	permission: 'transactions.tranCustDep.1'
			}
		,	{
				value: 'DepAppl'
			,	name: _('Show Deposit Application').translate()
			,	permission: 'transactions.tranDepAppl.1'
			}
		,	{
				value: 'CustInvc'
			,	name: _('Show Invoices').translate()
			,	permission: 'transactions.tranCustInvc.1'
			}
		,	{
				value: 'CashSale'
			,	name: _('Show Cash Receipts').translate()
			,	permission: 'transactions.tranCashSale.1'
			}
		]

		// @property {Array} sortOptions Array of default sort options sorts only apply on the current collection
		// which might be a filtered version of the original
	,	sortOptions: [
			{
				value: 'trandate,internalid'
			,	name: _('by Date').translate()
			,	selected: true
			}
		,	{
				value: 'tranid'
			,	name: _('by Number').translate()
			}
		,	{
				value: 'amount'
			,	name: _('by Amount').translate()
			}
		]

	,	childViews: {
			'ListHeader.View': function ()
			{
				return this.listHeader;
			}
		,	'Records.Collection': function ()
			{
				var records_collection = new Backbone.Collection(this.collection.map(function (transaction_history)
					{
						var model = new Backbone.Model({
							touchpoint: 'customercenter'
						,	title: new Handlebars.SafeString(_(transaction_history.getTypeLabel() + ' #<span class="tranid">$(0)</span>').translate(transaction_history.get('tranid')))
						,	detailsURL: transaction_history.getTypeUrl()

						,	id: transaction_history.id
						,	internalid: transaction_history.id

						,	columns: [
								{
									label: _('Date:').translate()
								,	type: 'date'
								,	name: 'date'
								,	value: transaction_history.get('trandate')
								}
							,	{
									label: _('Amount:').translate()
								,	type: 'currency'
								,	name: 'amount'
								,	value: transaction_history.get('amount_formatted')
								}
							,	{
									label: _('Status:').translate()
								,	type: 'status'
								,	name: 'status'
								,	value: transaction_history.get('status').name
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
		,	'GlobalViews.Pagination': function()
			{
				return new GlobalViewsPaginationView(_.extend({
					totalPages: Math.ceil(this.collection.totalRecordsFound / this.collection.recordsPerPage)
				}, Configuration.defaultPaginationSettings));
			}
		}

		//@method getContext @return {TransactionHistory.List.View.Context}
	,	getContext: function ()
		{
			//@class TransactionHistory.List.View.Context
			return {
				//@property {String} pageHeader
				pageHeader: this.page_header
				//@property {Boolean} showNoTermMessage
			,	hasTerms: !!this.profileModel.get('paymentterms')
				//@property {Boolean} isThereAnyResult
			,	isThereAnyResult: !!this.collection.length
				//@property {Boolean} isLoading
			,	isLoading: this.isLoading
				// @property {Boolean} showPagination
			,	showPagination: !!(this.collection.totalRecordsFound && this.collection.recordsPerPage)
				// @property {Boolean} showCurrentPage
			,	showCurrentPage: this.options.showCurrentPage
				//@property {Boolean} showBackToAccount
			,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
			};
		}
	});
});