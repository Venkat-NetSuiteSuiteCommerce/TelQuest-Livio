/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/


// Case.List.View.js
// -----------------------
// Views for viewing Cases list.
// @module Case
define(
	'Case.List.View'
,	[
		'ListHeader.View'
	,	'SC.Configuration'
	,	'GlobalViews.Pagination.View'
	,	'GlobalViews.ShowingCurrent.View'
	,	'RecordViews.View'

	,	'case_list.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		ListHeaderView
	,	Configuration
	,	GlobalViewsPaginationView
	,	GlobalViewsShowingCurrentView
	,	RecordViewsView

	,	case_list_tpl

	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	_
	,	jQuery
	)
{
	'use strict';

	// @class Case.List.View @extends Backbone.View
	return Backbone.View.extend({

		template: case_list_tpl

	,	title: _('Support Cases').translate()

	,	page_header: _('Support Cases').translate()

	,	attributes: {
			'class': 'caseManagement'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.fields = options.fields;
			this.listenCollection();
			this.setupListHeader();

			this.options.showCurrentPage = true;

			BackboneCompositeView.add(this);
		}

	,	setupListHeader: function()
		{
			this.listHeader = new ListHeaderView({
				view: this
			,	application: this.application
			,	collection: this.collection
			,	filters: this.initializeFilterOptions()
			,	sorts: this.sortOptions
			,	hidePagination: true
			});
		}

	,	listenCollection: function ()
		{
			this.setLoading(true);

			this.collection.on({
				request: jQuery.proxy(this, 'setLoading', true)
			,	reset: jQuery.proxy(this, 'setLoading', false)
			});
		}

	,	setLoading: function (is_loading)
		{
			this.isLoading = is_loading;
		}

		// Array of default filter options
		// filters always apply on the original collection
	,	initializeFilterOptions: function()
		{
			var filter_options = [
				{
					value: 'all'
				,	name: _('Show All Statuses').translate()
				,	selected: true
				,	filter: function ()
					{
						return this.original.models;
					}
				}]
			,	statuses = this.fields ? this.fields.get('statuses') : [];

			_.each(statuses, function (status) {
				var filter_option = {
					value: status.id
				,	name: status.text
				,	filter: function ()
					{
						return this.original.filter(function (some_case)
						{
							return some_case.get('status').id === status.id;
						});
					}
				};

				filter_options.push(filter_option);
			});

			return filter_options;
		}

		// Array of default sort options
		// sorts only apply on the current collection
		// which might be a filtered version of the original
	,	sortOptions: [
			{
				value: 'caseNumber'
			,	name: _('by Case number').translate()
			,	selected: true
			}
		,	{
				value: 'createdDate'
			,	name: _('by Creation date').translate()
			}
		,	{
				value: 'lastMessageDate'
			,	name: _('by Last Message date').translate()
			}
		]

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'cases_all';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return {
				text: this.title
			,	href: '/cases'
			};
		}

	,	render: function()
		{
			Backbone.View.prototype.render.apply(this, arguments);

			if (!_.isUndefined(this.inform_new_case))
			{
				this.informNewCaseCreation();

				if (!this.isLoading)
				{
					delete this.inform_new_case;
				}
			}
		}

	,	informNewCaseCreation: function()
		{
			this.highlightNewCase(this.new_case_internalid);
			this.showConfirmationMessage(this.new_case_message);
		}

		// Temporarily highlights the case record just added
	,	highlightNewCase: function (internalid)
		{
			var $list_dom = jQuery(this.el).find('a[data-id='+ internalid +']');

			if ($list_dom && $list_dom.length === 1)
			{
				$list_dom.addClass('case-list-new-case-highlight');

				setTimeout( function ()
				{
					$list_dom.removeClass('case-list-new-case-highlight');
				}, 3000);
			}
		}

	,	childViews: {
			'Case.List.Items': function ()
			{
				var records_collection = new Backbone.Collection(this.collection.map(function (current_case)
				{
					return new Backbone.Model({
						touchpoint: 'customercenter'

					,	title: _('Case #$(0)').translate(current_case.get('caseNumber'))
					,	detailsURL: '#/cases/' + current_case.get('internalid')
					,	internalid: current_case.get('internalid')

					,	columns: [
							{
								label: _('Subject:').translate()
							,	type: 'subject'
							,	name: 'subject'
							,	value: current_case.get('title')
							}
						,	{
								label: _('Creation Date:').translate()
							,	type: 'creation-date'
							,	name: 'creation-date'
							,	value: current_case.get('createdDate').split(' ')[0]
							}
						,	{
								label: _('Last Message:').translate()
							,	type: 'date'
							,	name: 'last-message'
							,	value: current_case.get('lastMessageDate').split(' ')[0]
							}
						,	{
								label: _('Status:').translate()
							,	type: 'status'
							,	name: 'status'
							,	value: _.isObject(current_case.get('status')) ? current_case.get('status').name : current_case.get('status').name
							}
						]
					});
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
		,	'GlobalViews.ShowCurrentPage': function()
			{
				return new GlobalViewsShowingCurrentView({
					items_per_page: this.collection.recordsPerPage
		 		,	total_items: this.collection.totalRecordsFound
				,	total_pages: Math.ceil(this.collection.totalRecordsFound / this.collection.recordsPerPage)
				});
			}
		,	'List.Header': function ()
			{
				return this.listHeader;
			}
		}

		// @method getContext @return Case.List.View.Context
	,	getContext: function()
		{
			// @class Case.List.View.Context
			return {
				// @property {String} pageHeader
				pageHeader: this.page_header
				// @property {Bboolean} hasCases
			,	hasCases: this.collection.length
				// @property {Boolean} isLoading
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
