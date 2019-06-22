// @module Cart
define('MyModule.Details.View'
,	[	

		'mymodule_details.tpl'
	,	'Backbone.CompositeView'

	,	'jQuery'
	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		mymodule_details_tpl
	,	BackboneCompositeView

	,	jQuery
	,	Backbone
	,	_
	)
{
	'use strict';

	return Backbone.View.extend({

		template: mymodule_details_tpl

	,	title: _('Added to Cart').translate()

	,	attributes: {
			'id': 'mymodule-details'
		,	'class': 'mymodule-details'
		}
		// @property {Object} events
	,	events: {
			'click [data-trigger=go-to-cart]': 'dismisAndGoToCart'
		}

	,	initialize: function (options)
		{
			this.model = options.model;

			BackboneCompositeView.add(this);
		}

		// @property {Object} childViews
	// ,	childViews: {
	// 			'Item.Price': function ()
	// 			{
	// 				return new ItemViewsPriceView({model: this.line.get('item')});
	// 			}
	// 		,	'Item.SelectedOptions': function ()
	// 			{
	// 				return new BackboneCollectionView({
	// 					collection: new Backbone.Collection(this.line.get('item').getPosibleOptions())
	// 				,	childView: ItemViewsSelectedOptionView
	// 				,	viewsPerRow: 1
	// 				,	childViewOptions: {
	// 						cartLine: this.line
	// 					}
	// 				});
	// 			}
	// 	}
		// @method getContext @return {Cart.Confirmation.View.Context}
	,	getContext: function()
		{
			return {
				prop1: 2
			};
		}
		// @class Cart.Confirmation.View
	});

});
