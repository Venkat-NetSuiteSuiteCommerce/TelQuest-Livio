/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*global SC:true */
/*!
* Description: SuiteCommerce Reference ShopFlow
*
* @copyright (c) 2000-2013, NetSuite Inc.
* @version 1.0
*/

// @module ShoppingApplication

define(
	'SC.Shopping'
,	[
		'SC.Shopping.Configuration'

	,	'Application'

	,	'SC.Shopping.Layout'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	,	'Utils'

	,	'Backbone.Model'
	,	'Backbone.Sync'
	,	'Backbone.Validation.callbacks'
	,	'Backbone.Validation.patterns'
	,	'Backbone.View'
	,	'Backbone.View.render'
	,	'Backbone.View.saveForm'
	,	'Backbone.View.toggleReset'
	,	'Bootstrap.Rate'
	,	'Bootstrap.Slider'
	,	'jQuery.ajaxSetup'
	,	'jQuery.serializeObject'
	,	'jQuery.scPush'
	,	'String.format'
	]
,	function(
		Configuration

	,	Application

	,	ShoppingLayout

	,	Backbone
	,	jQuery
	,	_
	,	Utils
	)
{
	'use strict';

	// @class SCA.Shopping  Defines the singleton application instance named 'Shopping' which can be
	// obtained with SC.Application('Shopping') @extends ApplicationSkeleton
	var Shopping = Application('Shopping');

	Shopping.Layout = ShoppingLayout;

	// Get the layout from the application
	var Layout = Shopping.getLayout();

	// Applies Configuration
	Shopping.Configuration = _.extend(Shopping.Configuration, Configuration);

	// This will change the url when a "select" DOM element of the type "navigator" is changed
	_.extend(Layout, {
		changeUrl: function (e)
		{
			// Disable other navigation links before redirection
            this.$('select[data-type="navigator"], .pagination-links a').attr('disabled','disabled');

            // Get the value of the select and navigate to it
			// http://backbonejs.org/#Router-navigate
			Backbone.history.navigate(this.$(e.target).val(), {trigger: true});
		}
	});

	_.extend(Layout.events, {
		'change select[data-type="navigator"]': 'changeUrl'
	});


	// This is necessary for showing Cases menu option in header_profile_macro menu. Cases should only be available in My Account application.
	// By doing so, we are avoiding copying the entire module to ShopFlow but we preserve the same logic. We need to check if backend
	// configuration is present and if the feature is enabled, keeping the same behavior My Account currently has.
	_.extend(Shopping, {

		CaseModule: {

			// Is Case functionality available for this application?
			isEnabled: function ()
			{
				return !_.isUndefined(SC.ENVIRONMENT.CASES) && !_.isUndefined(SC.ENVIRONMENT.CASES.CONFIG) && SC.ENVIRONMENT.CASES.enabled;
			}
		}
	});

	// Setup global cache for this application
	jQuery.ajaxSetup({cache:true});

	jQuery.ajaxPrefilter(function (options)
	{
		if (options.url)
		{
			if (options.type === 'GET' && options.data)
			{
				var join_string = ~options.url.indexOf('?') ? '&' : '?';
				options.url = options.url + join_string + options.data;
				options.data = '';
			}

			options.url = Utils.reorderUrlParams(options.url);
		}

		if (options.pageGeneratorPreload && SC.ENVIRONMENT.jsEnvironment === 'server')
		{
			jQuery('<img />', { src: options.url, alt: '', style: 'display: none;' }).prependTo('body');
		}
	});

	return Shopping;
});
