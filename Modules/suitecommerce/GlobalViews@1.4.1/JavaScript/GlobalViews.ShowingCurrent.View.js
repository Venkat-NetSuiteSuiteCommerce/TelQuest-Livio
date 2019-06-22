/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define('GlobalViews.ShowingCurrent.View'
,	[
		'global_views_showing_current.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(
		global_views_showing_current_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class GlobalViews.ShowingCurrent.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_views_showing_current_tpl

	,	_getCurrentPage: function ()
		{
			var url_options = _.parseUrlOptions(Backbone.history.fragment);

			return this._getPageFromUrl(url_options.page);
		}

		// @method getPageFromUrl @param {String} url_value @returns {Number}
	,	_getPageFromUrl: function (url_value)
		{
			var page_number = parseInt(url_value, 10);

			return !isNaN(page_number) && page_number > 0 ? page_number : 1;
		}

		// @method getContext @return GlobalViews.ShowingCurrent.View.Content
	,	getContext: function ()
		{
			this.options.current_page = this._getCurrentPage();
			
			var lastItem = this.options.current_page * this.options.items_per_page;

			//@class GlobalViews.ShowingCurrent.View.Content
			return {
				//@property {String} orderText
				orderText: this.options.order_id ? ' ' + _('for <a href="/ordershistory/view/$(0)">  Order Number: #$(1)</a>').translate(this.options.order_id, this.options.order_number) : ''
				//@property {String} extraClass
			,	extraClass: this.options.extraClass
				//@property {Number} firstItem
			,	firstItem: ((this.options.current_page - 1) * this.options.items_per_page) + 1
				//@property {Number} lastItem
			,	lastItem: lastItem > this.options.total_items ? this.options.total_items : lastItem
				//@property {Number} totalItems
			,	totalItems: this.options.total_items
			};
		}
	});
});