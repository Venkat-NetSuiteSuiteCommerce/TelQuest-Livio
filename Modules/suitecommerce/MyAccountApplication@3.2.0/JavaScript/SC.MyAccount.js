/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*!
* Description: SuiteCommerce Reference My Account
*
* @copyright (c) 2000-2013, NetSuite Inc.
* @version 1.0
*/

// Application.js
// --------------
// Extends the application with My Account specific core methods
define(
	'SC.MyAccount'
,	[
		'SC.MyAccount.Configuration'
	,	'SC.MyAccount.Layout'

	,	'Application'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	,	'Backbone.View'
	,	'MenuTree.View'

	,	'Backbone.Model'
	,	'Backbone.Sync'
	,	'Backbone.Validation.callbacks'
	,	'Backbone.Validation.patterns'
	,	'Backbone.View.render'
	,	'Backbone.View.saveForm'
	,	'Backbone.View.toggleReset'
	,	'Bootstrap.Slider'
	,	'jQuery.ajaxSetup'
	,	'jQuery.serializeObject'
	,	'String.format'
	]
,	function (
		Configuration
	,	MyAccountLayout

	,	Application

	,	Backbone
	,	jQuery
	,	_
	,	BackboneView
	,	MenuTreeView
	)
{
	'use strict';

	var MyAccount = Application('MyAccount');

	// Applies Configuration
	MyAccount.Configuration = _.extend(MyAccount.Configuration, Configuration);

	MyAccount.Layout = MyAccountLayout;

	// Once Modules are loaded this checks if they are exporting a menu entry and if so
	// this adds it to the array of menu entries
	MyAccount.on('afterModulesLoaded', function ()
	{
		var menu_tree = MenuTreeView.getInstance();
		menu_tree.application = MyAccount;
		_.each(MyAccount.modules, function (module)
		{
			if (module)
			{
				if (module.MenuItems)
				{
					menu_tree.addMenuItem(module.MenuItems);
				}
			}
		});
	});


	// Setup global cache for this application
	jQuery.ajaxSetup({cache:false});

	return MyAccount;
});
