/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductDetailToQuote
define('Location'
,	[
		'Location.Collection'
	,	'Location.Model'
	,	'Transaction.Model'
	,	'underscore'
	,	'jQuery'
	,	'jquery.cookie'
	,	'Location.ProductLine'
	]
,	function (
		LocationCollection
	,	LocationModel
	,	TransactionModel
	,	_
	,	jQuery
	)
{
	'use strict';

	var locations_cache = {};

	function fetchLocations (location_ids)
	{
		location_ids = _.isArray(location_ids) ? location_ids : [location_ids];

		var	location_id_to_fetch = _.filter(location_ids, function (internalid)
		{
			return !locations_cache[internalid] ? internalid : false;
		})
		,	promise = jQuery.Deferred();

		location_ids = _.unique(_.compact(location_ids));

		if (location_id_to_fetch.length)
		{
			if (location_id_to_fetch.length === 1)
			{
				promise = new LocationModel({internalid: location_id_to_fetch[0]}).fetch().done(function (location)
				{
					locations_cache[location.internalid] = location;
				});
			}
			else
			{
				promise = new LocationCollection().fetch({
					data: {
						internalid: location_id_to_fetch.join(',')
					}
				}).done(function (locations)
				{
					_.each(locations, function (location)
					{
						locations_cache[location.internalid] = location;
					});
				});
			}
		}
		else
		{
			promise.resolve();
		}

		return promise;
	}

	//@class ProductDetailToQuote @extend ApplicationModule
	return  {
		
		//@method get
		//@param {String} location_id
		//@return {Object}
		get: function (location_id)
		{
			return locations_cache[location_id] || {};
		}
		//@method fetchLocations
		//@param {Array || String} location_ids
		//@return {jQuery.Deferred}
	,	fetchLocations: fetchLocations
		//@method mountToApp
		//@param {ApplicationSkeleton} application
		//@return {Void}
	,	mountToApp: function mountToApp ()
		{
			var	original_transaction_model_fn = TransactionModel.prototype.initialize;

			TransactionModel.prototype.initialize = function initialize ()
			{
				original_transaction_model_fn.apply(this, arguments);

				this.on('change:lines', function (model)
				{
					var	default_location_id = jQuery.cookie('myStore')
					,	lines = model.get('lines')
					,	is_cart = this.get('internalid') === 'cart'
					,	location_ids = lines.map(function (line)
					{
						return line.get('location') && line.get('location').get('internalid');
					});

					if (!location_ids.length)
					{
						return;
					}

					if (is_cart && default_location_id)
					{
						location_ids.push(default_location_id);
					}

					fetchLocations(location_ids).done(function ()
					{
						lines.each(function (line)
						{
							var internalid = line.get('location') && line.get('location').get('internalid') || (is_cart ? default_location_id : null);

							if (internalid)
							{
								line.get('location').set(locations_cache[internalid]);
							}
						});
					});
				});
			};
		}
	};
});
