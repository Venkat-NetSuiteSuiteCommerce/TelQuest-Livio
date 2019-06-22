/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module RecordViews
define(
	'RecordViews.Actionable.View'
,	[	'Backbone.CompositeView'
	,	'RecordViews.View'

	,	'recordviews_actionable.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		BackboneCompositeView
	,	RecordViewsView

	,	recordviews_actionable_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class RecordViews.Actionable.View @extend RecordViews.View
	return RecordViewsView.extend({

		//@property {Function} template
		template: recordviews_actionable_tpl

		//@method initialize
		//@param {RecordViews.Actionable.View.Initialize} options
		//@return {Void}
	,	initialize: function ()
		{
			RecordViewsView.prototype.initialize.apply(this, arguments);
		}

		//@property {Object} childViews Override the base property by adding a default Action.View composite View
	,	childViews: {
			'Action.View': function ()
			{
				var action_options = _.extend({
						model: this.model
					}, this.options.actionOptions || {})
				,	view = this.options.actionView;

				return new view(action_options);
			}
		}

		//@method getContext @return {RecordViews.Actionable.View.Context}
	,	getContext: function ()
		{
			//@class RecordViews.Actionable.View.Context			
			return {				
				//@property {RecordViews.Actionable.View.Initialize.Model} model
				model: this.model
				//@property {String} id
			,	id: this.model.id
				//@property {String} touchpoint
			,	touchpoint: this.model.get('touchpoint') || 'customercenter'
				//@property {Boolean} isNavigable
			,	isNavigable: _.isBoolean(this.model.get('isNavigable')) ? this.model.get('isNavigable') : true
				//@property {String} detailsURL
			,	detailsURL: this.model.get('detailsURL')
				//@property {String} title
			,	title: this.model.get('title')

				//@property {String} actionTitle
			,	actionTitle: this.model.get('actionTitle')

				//@property {Array<RecordViews.View.Column>} columns
			,	columns: this.normalizeColumns()

			,	recordType: this.model.get('recordType')

			};
		}
	});

});


//@class RecordViews.Actionable.View.Initialize
//@property {RecordViews.Actionable.View.Initialize.Model} model


//@class RecordViews.Actionable.View.Initialize.Model @extends Backbone.Model
//@property {String} id
//@property {String?} touchpoint The default value is 'customercenter'
//@property {Boolean?} isNavigable The default value is true
//@property {String} detailsURL
//@property {String} actionTitle
//@property {String} title
//@property {Array<RecordViews.View.Column>} columns
