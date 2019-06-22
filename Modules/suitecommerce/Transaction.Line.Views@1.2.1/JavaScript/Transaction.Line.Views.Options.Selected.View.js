/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Transaction.Line.Views
define('Transaction.Line.Views.Options.Selected.View'
,	[
		'Transaction.Line.Views.Option.View'

	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'	

	,	'transaction_line_views_options_selected.tpl'

	,	'Backbone'
	]
,	function (
		TransactionLineViewsOptionView

	,	BackboneCompositeView
	,	BackboneCollectionView	

	,	transaction_line_views_options_selected_tpl

	,	Backbone
	)
{
	'use strict';

	//@class ItemOptions.Options.View.initialize
	//@property {Transaction.Line.Model} model

	//@class ItemOptions.Options.View
	return Backbone.View.extend({

		//@property {Function} template
			template: transaction_line_views_options_selected_tpl

		//@method initialize Override default method to made current view composite
		//@param {ItemOptions.Options.View.initialize} options
		//@return {Void}
	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

		//@property {ChildViews} childViews
	,	childViews: {
			'Options.Collection': function ()
			{
				return new BackboneCollectionView({
					collection: this.model.getVisibleOptions()
				,	childView: TransactionLineViewsOptionView
				,	viewsPerRow: 1
				,	childViewOptions: {
						line: this.model
					,	templateName: 'selected'
					}
				});
			}
		}

		//@method getContext
		//@return {ItemOptions.Options.View.Context}
	,	getContext: function ()
		{
			//@class ItemOptions.Options.View.Context
			return {
				model: this.model
			};
			//@class ItemOptions.Options.View
		}

	});
});