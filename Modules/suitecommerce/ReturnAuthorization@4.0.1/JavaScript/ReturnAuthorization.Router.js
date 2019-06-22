/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReturnAuthorization
define('ReturnAuthorization.Router'
,	[	'ReturnAuthorization.Model'
	,	'ReturnAuthorization.Collection'
	,	'ReturnAuthorization.Detail.View'
	,	'ReturnAuthorization.List.View'
	,	'ReturnAuthorization.Form.View'
	,	'ReturnAuthorization.Confirmation.View'
	,	'OrderHistory.Model'
	,	'AjaxRequestsKiller'

	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		ReturnAuthorizationModel
	,	ReturnAuthorizationCollection
	,	ReturnAuthorizationDetailView
	,	ReturnAuthorizationListView
	,	ReturnAuthorizationFormView
	,	ReturnAuthorizationConfirmationView
	,	OrderHistoryModel
	,	AjaxRequestsKiller
	,	_
	,	jQuery
	,	Backbone
	)
{
	'use strict';

	//@class ReturnAuthorization.Router @extend Backbone.Router
	return Backbone.Router.extend({

		routes: {
			'returns': 'list'
		,	'returns?:options': 'list'
		,	'returns/:recordtype/:id': 'details'
		,	'returns/:recordtype/:id?:options': 'details'
		,	'returns/new/:recordtype/:id': 'form'
		,	'returns/confirmation/:recordtype/:id': 'confirmation'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

	,	list: function (options)
		{
			var parameters = _.parseUrlOptions(options)

			,	collection = new ReturnAuthorizationCollection()

			,	view = new ReturnAuthorizationListView({
					application: this.application
				,	collection: collection
				,	page: parameters.page
				});

			if (parameters.cancel)
			{
				view.message = _('Good! Your request was successfully cancelled.').translate();
				Backbone.history.navigate(_.removeUrlParameter(Backbone.history.fragment, 'cancel'), {replace: true});
			}

			collection.on('reset', jQuery.proxy(view, 'showContent', 'returns'));

			view.showContent('returns');
		}

	,	details: function (recordtype, id)
		{
			var model = new ReturnAuthorizationModel()
			,	view = new ReturnAuthorizationDetailView({
					application: this.application
				,	model: model
				});

			model.fetch({
					data: {internalid: id, recordtype: recordtype }
				,	killerId: AjaxRequestsKiller.getKillerId()	
			}).then(jQuery.proxy(view, 'showContent', 'returns'));
		}

	,	form: function (recordtype, id)
		{
			var created_from = this.getCreatedFrom(recordtype, id)

			,	application = this.application

			,	model = new ReturnAuthorizationModel()

			,	view = new ReturnAuthorizationFormView({
					application: application
				,	model: model
				,	createdFromModel: created_from
				});

			created_from.fetch({
					killerId: AjaxRequestsKiller.getKillerId()
				,	data: {recordtype: recordtype}
			}).then(jQuery.proxy(view, 'showContent'));

			model.on('save', function ()
			{
				new ReturnAuthorizationConfirmationView({
					application: application
				,	model: model
				}).showContent('returns');

				Backbone.history.navigate('/returns/confirmation/' + model.get('recordtype') + '/' + model.get('internalid'), {trigger: false});
			});
		}

	,	confirmation: function (recordtype, id)
		{
			var model = new ReturnAuthorizationModel({
					internalid: id
				})

			,	view = new ReturnAuthorizationConfirmationView({
					application: this.application
				,	model: model
				});

			model.fetch({
				data: {internalid: id, recordtype: recordtype}
			,	killerId: AjaxRequestsKiller.getKillerId()
			}).then(jQuery.proxy(view, 'showContent', 'returns'));
		}

	,	getCreatedFrom: function (type, id)
		{
			return new OrderHistoryModel({
				internalid: id
			,	recordtype: type
			});
		}
	});
});