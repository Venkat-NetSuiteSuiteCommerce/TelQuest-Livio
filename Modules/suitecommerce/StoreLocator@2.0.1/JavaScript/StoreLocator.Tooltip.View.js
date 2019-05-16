/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator.Tooltip.View'
,	[
		'ReferenceMap'

	,	'store_locator_tooltip.tpl'

	,	'underscore'
	,	'Backbone.CollectionView'
	,	'Backbone'
	]
,   function (
		ReferenceMap

	,	store_locator_tooltip_tpl

	,	_
	,	BackboneCollectionView
	,	Backbone
	)
{
	'use strict';

	return Backbone.View.extend({
	
		template: store_locator_tooltip_tpl

		//@method initialize
		//@param {Object} options
	,	initialize: function initialize (options)
		{
			this.application = options.application;
			this.index = options.index;
		}

		//@method getContext
		//@return StoreLocator.Tooltip.View.Context
	,	getContext: function getContext ()
		{

			return {

				model: this.model

			,	storeName: this.model.get('name')

			,   showStoreDistance: !!this.model.get('distance')

			,   distanceUnit: this.model.get('distanceunit')

			,   storeDistance: this.model.get('distance')

			,   showStoreAddress: !!this.model.get('address1')

			,   storeAddress: this.model.get('address1')

			,   storeId: this.model.get('internalid')

			,   index: this.index
			};
		}
	});
});

