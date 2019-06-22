/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module QuantityPricing
define('QuantityPricing.Utils'
,	[
		'underscore'
	]
,	function
	(
		_
	)
{
	'use strict';

	//@class QuantityPricing.Utils
	return {
		//@method rearrangeQuantitySchedule override first minimumquantity from 0 to 1, and sets the maximum to a lower value
		//@param {Item.Model} item
		//@param {Array<Item.Model>} children_selection Collection of child items that based on the current selection of the parent can be selected
		//return {Boolean|Array<QuantityPricing.PriceRange>}
		rearrangeQuantitySchedule: function rearrangeQuantitySchedule (item, children_selection)
		{

			var price_schedule_exists_in_matrix_child = _.find(children_selection, function (child_item)
				{
					return child_item.get('_priceDetails').priceschedule;
				})
			,	price_schedule_exists_in_matrix_parent = item && item.get('_priceDetails') && item.get('_priceDetails').priceschedule && item.get('_priceDetails').priceschedule.length;

			if (price_schedule_exists_in_matrix_parent || price_schedule_exists_in_matrix_child)
			{
				var parent_quantity_schedule = item.get('_priceDetails').priceschedule
				,	result_quantity_pricing = [];

				if (children_selection && children_selection.length === 1)
				{
					result_quantity_pricing = _.first(children_selection).get('_priceDetails').priceschedule;
				}
				else if (children_selection && children_selection.length > 1)
				{
					var children_quantity_pricing = _.map(children_selection, function (child)
						{
							return child.get('_priceDetails') && child.get('_priceDetails').priceschedule || [];
						})
					,	reference_quantity_pricing = _.first(children_quantity_pricing)
					,	self = this
					,	all_children_are_equal = _.every(children_quantity_pricing, function (child_quantity_pricing)
						{
							return self.areQuantityPricingEqual(reference_quantity_pricing, child_quantity_pricing);
						});

					result_quantity_pricing = all_children_are_equal ? self.computeRanges(children_quantity_pricing) : false;
				}
				else
				{
					result_quantity_pricing = parent_quantity_schedule;
				}

				if (result_quantity_pricing)
				{
					result_quantity_pricing = _.map(result_quantity_pricing, function (price_range)
					{
						return {
							maximumquantity: price_range.maximumquantity ? price_range.maximumquantity - 1 : price_range.maximumquantity
						,	minimumquantity: price_range.minimumquantity
						,	price: price_range.price
						,	price_formatted: price_range.price_formatted
						,	price_range: price_range.price_range
						,	is_range: !!price_range.is_range
						};
					});

					_.first(result_quantity_pricing).minimumquantity = _.first(result_quantity_pricing).minimumquantity || 1;
				}

				return result_quantity_pricing;
			}

			return false;
		}

		//@method computeRanges compute price if they are different and make a range
		//@param {Array<OnlineCustomerPriceDetail>} quantity_pricings
		//@return {Array<QuantityPricing.PriceRange>}
	,	computeRanges: function computeRanges (quantity_pricings)
		{
			var ranges = [];

			_.each(quantity_pricings, function (quantity_pricing)
			{
				ranges = ranges.concat(quantity_pricing);
			});

			var grouped_ranges = _.groupBy(ranges, function (range)
				{
					return range.minimumquantity;
				});

			var result = [];

			_.each(grouped_ranges, function (ranges)
			{
				var max = _.max(_.pluck(ranges, 'price'))
				,	min = _.min(_.pluck(ranges, 'price'))
				,	is_range = min !== max
					//@class QuantityPricing.PriceRange
				,	range = {
						//@property {Number} maximumquantity
						maximumquantity: _.first(ranges).maximumquantity
						//@property {Number} minimumquantity
					,	minimumquantity: _.first(ranges).minimumquantity
						//@property {Number} price
					,	price: is_range ? -1 : _.first(ranges).price
						//@property {String} price_formatted
					,	price_formatted: is_range ? '' : _.first(ranges).price_formatted
						//@property {Boolean} is_range
					,	is_range: is_range
						//@property {QuantityPricing.PriceRange.Range} price_range
						//@class QuantityPricing.PriceRange.Range
					,	price_range: is_range ? {
							//@property {Number} max
							max: max
							//@property {Number} min
						,	min: min
							//@property {String} max_formatted
						,	max_formatted: _.findWhere(ranges, {price: max }).price_formatted
							//@property {String} min_formatted
						,	min_formatted: _.findWhere(ranges, {price: min }).price_formatted
						} : null
					};

				result.push(range);
				//@class QuantityPricing.Utils
			});

			return result;
		}

		//@method areQuantityPricingEqual compare price between childs
		//@param {OnlineCustomerPriceDetail} quantity_pricing_original
		//@param {OnlineCustomerPriceDetail} quantity_pricing_to_compare
		//return {Boolean}
	,	areQuantityPricingEqual: function areQuantityPricingEqual (quantity_pricing_original, quantity_pricing_to_compare)
		{
			if (quantity_pricing_to_compare && quantity_pricing_original && quantity_pricing_original.length === quantity_pricing_to_compare.length)
			{
				var are_equal = true;

				for (var i = 0; i < quantity_pricing_original.length; i++)
				{
					if (quantity_pricing_original[i].maximumquantity !== quantity_pricing_to_compare[i].maximumquantity ||
						quantity_pricing_original[i].minimumquantity !== quantity_pricing_to_compare[i].minimumquantity)
					{
						are_equal = false;
					}
				}
				return are_equal;
			}
			return false;
		}
	};
});