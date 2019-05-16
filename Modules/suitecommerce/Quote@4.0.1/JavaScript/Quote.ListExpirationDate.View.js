/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Quote
define(
	'Quote.ListExpirationDate.View'
,	[
		'quote_list_expiration_date.tpl'

	,	'Backbone'
	]
,	function (
		quote_list_expiration_date_tpl

	,	Backbone
	)
{
	'use strict';

	// @class Quote.ListExpirationDate.View @extends Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: quote_list_expiration_date_tpl

		// @method getContext
		// @return {Quote.ListExpirationDate.View.Context}
	,	getContext: function()
		{
			// @class Quote.ListExpirationDate.View.Context
			return {
				// @property {Quote.Model} collection 
				model: this.model
			};
			// @class Quote.ListExpirationDate.View
		}	
	});
});