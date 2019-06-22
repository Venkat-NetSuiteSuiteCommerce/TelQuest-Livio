/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define(
	'StoreLocator.Upgrade.View'
,	[
		'store_locator_upgrade.tpl'
	,	'Backbone'
	]
,	function
	(
		store_locator_upgrade
	,	Backbone
	)
{
	'use strict';

	return Backbone.View.extend({
		
		template: store_locator_upgrade

		//@method initialize
		//@param {Object} options
	,	initialize: function initialize (options)
		{
			this.application = options.application;
		}
	});
});