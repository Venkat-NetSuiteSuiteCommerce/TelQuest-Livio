/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module RecordViews
define(
	'RecordViews.Selectable.View'
,	[	'Backbone.CompositeView'
	,	'RecordViews.View'

	,	'recordviews_selectable.tpl'
	]
,	function (
		BackboneCompositeView
	,	RecordViewsView

	,	recordviews_selectable_tpl
	)
{
	'use strict';

	//@class RecordViews.Selectable.View @extend RecordViews.View
	return RecordViewsView.extend({

		//@property {Function} template
		template: recordviews_selectable_tpl

	,	events: {
			'click [data-action="go-to-record"]': 'stopPropagationOnNavigation'
		}

		//@method stopPropagationOnNavigation Auxiliary method to stop the propagation of the click over the navigation link
		//@param {jQuery.Event} e
		//@return {Void}
	,	stopPropagationOnNavigation: function stopPropagationOnNavigation (e)
		{
			e.stopPropagation();
		}

		//@method initialize
		//@param {RecordViews.Selectable.View.Initialize} options
		//@return {Void}

		//@method getContext
		//@return {RecordViews.Selectable.View.Context}
	,	getContext: function ()
		{
			//@class RecordViews.Selectable.View.Context
			return {
				//@property {Backbone.Model} model
				model: this.model
				//@property {String} id
			,	id: this.model.id
				//@property {Boolean} isChecked
			,	isChecked: !!this.model.get('check')
				//@property {Boolean} isActive
			,	isActive: !!this.model.get('active')
				//@property {String} actionType
			,	actionType: this.model.get('actionType') || ''
				//@property {Boolean} isNavigable
			,	isNavigable: !!(this.options.navigable || this.model.get('navigable'))
				//@property {String} url
			,	url: this.options.referrer ? this.model.get('url') + '/' + this.options.referrer : this.model.get('url')
				//@property {String} title
			,	title: this.model.get('title')
				//@property {Array<RecordViews.View.Column>} columns
			,	columns: this.normalizeColumns()
			};
		}
	});
});

//@class RecordViews.Selectable.View.Initialize
//@property {RecordViews.Selectable.View.Initialize.Model} model
//@property {Boolean} navigable This value will takes precedence over the value of the model

//@class RecordViews.Selectable.View.Initialize.Model @extends Backbone.Model
//@property {String} id
//@property {Boolean} check
//@property {Boolean} active
//@property {String?} actionType Default value is ''
//@property {String} title
//@property {String} url
//@property {Boolean} navigable
//@property {Array<RecordViews.View.Column>} columns