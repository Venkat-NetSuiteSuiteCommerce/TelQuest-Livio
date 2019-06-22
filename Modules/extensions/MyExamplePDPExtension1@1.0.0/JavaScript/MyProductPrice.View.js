define(
	[
		'Backbone'
	,	'my_extension_1_product_price.tpl'	
	]
,	function (
		Backbone
	,	my_extension_1_product_price_tpl
	)
{
	'use strict';
	
	return Backbone.View.extend({
		
		template: my_extension_1_product_price_tpl

	,	initialize: function (options)
		{
			this.pdp = options.pdp;
		}

	,	getContext: function ()
		{
			var item = this.pdp.getItemInfo().item;
			return {
				price: item.onlinecustomerprice_detail.onlinecustomerprice_formatted
			};
		}
	});
	
});