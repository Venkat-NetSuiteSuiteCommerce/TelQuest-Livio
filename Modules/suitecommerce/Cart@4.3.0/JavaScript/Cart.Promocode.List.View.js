/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Cart
define('Cart.Promocode.List.View'
,	[
		'Cart.Promocode.List.Item.View'

	,	'cart_promocode_list.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'underscore'
	]
,	function (
		CartPromocodeListItemView

	,	cart_promocode_list_tpl

	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	_
	)
{
	'use strict';

	//@class Cart.Promocode.List.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template:cart_promocode_list_tpl

	,	events: {
			'click [data-action="remove-promocode"]': 'removePromocode'
		}

		//@method initialize
		//@param {Cart.Promocode.List.View.Initialize.Options} options
		//@return {Void}
	,	initialize: function initialize ()
		{
			BackboneCompositeView.add(this);
		}

		//@method setOptions Allow changing the internal model and options.
		//This is necessary as in some cases (Order wizard) the model from which the list of promocodes is read changes in
		//the middle of the process. (In OrderWizard the read model is the instance of the LiveOrder.Model until the order is places
		//and by some hacks another model is read)
		//@param {Any} options
		//@return {Void}
	,	setOptions: function setOptions (options)
		{
			this.options = options;
			this.model = options.model || this.model;
		}

		// @method removePromocode Handles the remove promocode button
		// @param {DOMEvent}
		// @return {Void}
	,	removePromocode: function removePromocode (e)
		{
			e.preventDefault();

			var self = this
			,	promocodes = this.model.get('promocodes') || []
			,	promo_code_internalid = (this.$(e.currentTarget).data('id') || '').toString();

			this.trigger('removing_promocode');

			promocodes = _.reject(promocodes, function (promocode)
				{
					return promocode.internalid === promo_code_internalid;
				});

			this.model
				.save({'promocodes': promocodes})
				.always(function promocodeSaveFinished ()
				{
					//@event {Void} remove_promocode_finished
					self.trigger('remove_promocode_finished');
					self.model.trigger('promocodeUpdated', 'removed');
				});
		}

	,	childViews: {
			'PromocodeList': function ()
			{
				return new BackboneCollectionView({
					collection: _.filter(this.model.get('promocodes') || [], function (promocode) { return promocode.internalid; })
				,	viewsPerRow: 1
				,	childView: CartPromocodeListItemView
				,	childViewOptions: {
						isReadOnly: this.options.isReadOnly
					,	source: 'summary'
					}
				});
			}
		}

		//@method getContext
		//@return {Cart.Promocode.List.View.context}
	,	getContext: function getContext ()
		{
			//@class Cart.Promocode.List.View.context
			return {};
			//@class Cart.Promocode.List.View
		}
	});
});

//@class Cart.Promocode.List.View.Initialize.Options
//@property {LiveOrder.Model} model
//@property {Boolean} isReadOnly
