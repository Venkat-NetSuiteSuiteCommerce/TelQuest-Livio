/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Case.Router.js
// -----------------------
// Router for handling Cases
// @module Case
define(
	'Case.Router'
,	[
		'Case.Model'
	,	'Case.Collection'
	,	'Case.Fields.Model'
	,	'Case.Detail.View'
	,	'Case.Create.View'
	,	'Case.List.View'
	,	'AjaxRequestsKiller'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		CaseModel
	,	CaseCollection
	,	CaseFieldsModel
	,	CaseDetailView
	,	CaseCreateView
	,	CaseList
	,	AjaxRequestsKiller
	
	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	// @class Case.Router @extends Backbone.Router
	return Backbone.Router.extend({

		routes:
		{
			'cases': 'showCasesList'
		,	'cases?:options': 'showCasesList'
		,	'cases/:id': 'showCase'
		,	'newcase': 'createNewCase'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

		// Render a specific case
	,	showCase: function (id, options)
		{
			var case_fields = new CaseFieldsModel()
			,	model = new CaseModel({ internalid: id })
			,	view = new CaseDetailView({
					application: this.application
				,	params: _.parseUrlOptions(options)
				,	fields: case_fields
				,	model: model
			});

			jQuery.when(model.fetch({
				killerId: AjaxRequestsKiller.getKillerId()
			}), case_fields.fetch({
				killerId: AjaxRequestsKiller.getKillerId()
			})).then(jQuery.proxy(view, 'showContent'));
		}

		// Render the Case list landing page
	,	showCasesList: function (options)
		{
			var params_options = _.parseUrlOptions(options)
			,	case_fields = new CaseFieldsModel();

			jQuery.when(case_fields.fetch({
				killerId: AjaxRequestsKiller.getKillerId()
			})).then(jQuery.proxy(this, 'showCasesListHelper', case_fields, params_options));
		}

		// Helps to render the Case List landing page after case fields are retrieved
	,	showCasesListHelper: function (case_fields, params_options)
		{
			var	cases_collection = new CaseCollection()
			,	view = new CaseList({
					application: this.application
				,	collection: cases_collection
				,	options: params_options
				,	page: params_options && params_options.page
				,	fields: case_fields
				});

			if (this.application.getLayout().currentView)
			{
				var new_case_id = this.application.getLayout().currentView.newCaseId
				,	new_case_message = this.application.getLayout().currentView.newCaseMessage;

				if (!(_.isUndefined(new_case_message) && _.isUndefined(new_case_id)))
				{
					view.new_case_message = new_case_message;
					view.new_case_internalid = new_case_id;
					view.inform_new_case = true;

					delete this.application.getLayout().currentView.newCaseId;
					delete this.application.getLayout().currentView.newCaseMessage;
				}
			}

			view.collection.on('reset', view.render, view);
			view.showContent();
		}

		// Create new Case
	,	createNewCase: function (id, options)
		{
			var case_fields = new CaseFieldsModel()
			,	view = new CaseCreateView({
					application: this.application
				,	params: _.parseUrlOptions(options)
				,	fields: case_fields
				,	model: new CaseModel()
			});

			jQuery.when(case_fields.fetch({
				killerId: AjaxRequestsKiller.getKillerId()
			})).then(jQuery.proxy(view, 'showContent'));
		}
	});
});
