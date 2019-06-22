/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Location
define('Location.ProductLine'
,	[
		'Product.Model'
	,	'Transaction.Line.Model'
	,	'ProductLine.Common'
	,	'Location.Model'
	,	'underscore'
	,	'Backbone'
	]
,	function (
		ProductModel
	,	TransactionLineModel
	,	ProductLineCommon
	,	LocationModel
	,	_
	,	Backbone
	)
{
	'use strict';

	var initialize_location = function (attributes)
	{
		this.on('change:location', function (model, location)
		{
			var value;

			if (location instanceof LocationModel || location instanceof Backbone.Model)
			{
				value = location.clone();
			}
			else if (_.isObject(location))
			{
				value = new LocationModel(location);
			}
			else
			{
				value = new LocationModel({internalid: location});
			}

			model.set('location', value, {silent: true});
		});

		this.trigger('change:location', this, attributes && attributes.location || {});
	};

	var original_product_model_initialize_fn = ProductModel.prototype.initialize;

	ProductModel.prototype.initialize = function initialize ()
	{
		original_product_model_initialize_fn.apply(this, arguments);

		initialize_location.apply(this, arguments);
	};

	var original_transaction_line_model_initialize_fn = TransactionLineModel.prototype.initialize;

	TransactionLineModel.prototype.initialize = function initialize ()
	{
		original_transaction_line_model_initialize_fn.apply(this, arguments);

		initialize_location.apply(this, arguments);
	};

	var original_to_json_product_line_common_fn = ProductLineCommon.toJSON;

	ProductLineCommon.toJSON = function toJSON ()
	{
		var result = original_to_json_product_line_common_fn.apply(this, arguments);
	
		//@class Transaction.Line.Model.JSON
		//@property {Object} location
		result.location = this.attributes.location && this.attributes.location.attributes && this.attributes.location.attributes.internalid || '';
		//@property {Object} fulfillmentChoice
		result.fulfillmentChoice = this.attributes.fulfillmentChoice || 'ship';

		return result; 
	};

});
