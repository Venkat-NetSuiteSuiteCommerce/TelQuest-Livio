/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*!
* Description: SuiteCommerce Reference Checkout
*
* @copyright (c) 2000-2013, NetSuite Inc.
* @version 1.0
*/

// Application.js
// --------------
// Extends the application with Checkout specific core methods
define(
	'SC.Checkout'
,   [
		'SC.Checkout.Configuration'

	,   'Application'

	,   'SC.Checkout.Layout'

	,   'Session'

	,   'Backbone'
	,   'jQuery'
	,   'Utils'
	,   'underscore'

	,   'Backbone.Model'
	,   'Backbone.Sync'
	,   'Backbone.Validation.callbacks'
	,   'Backbone.Validation.patterns'
	,   'Backbone.View'
	,   'Backbone.View.render'
	,   'Backbone.View.saveForm'
	,   'Backbone.View.toggleReset'
	,   'Bootstrap.Slider'
	,   'jQuery.ajaxSetup'
	,   'jQuery.serializeObject'
	,   'String.format'
	]
,   function(
		Configuration

	,   Application

	,   CheckoutLayout
	,   Session

	,   Backbone
	,   jQuery
	,   Utils
	,   _
	)
{
	'use strict';

	var Checkout = SC.Application('Checkout');

	Checkout.Configuration = _.extend(Checkout.Configuration, Configuration);

	Checkout.Layout = CheckoutLayout;

	// This makes that Promo codes and GC travel to different servers (secure and unsecure)
	Checkout.on('afterStart', function()
	{
		// Fix sitebuilder links, Examines the event target to check if its a touchpoint
		// and replaces it with the new version ot the touchpoint
		function fixCrossDomainNavigation(e)
		{
			var $element = jQuery(e.target);
			if (!$element.closest('#main').length)
			{
				var href = e.target.href
				,   touchpoints = Session.get('touchpoints')
				//get the value of the "is" url parameter
				,   href_parameter_value_is = Utils.getParameterByName(href, 'is');

				_.each(touchpoints, function(touchpoint)
				{
					var touchpoint_parameter_value_is = Utils.getParameterByName(touchpoint, 'is');
					// If the href of the link is equal to the current touchpoint then update the link with the
					// parameters of the touchpoint. To check if are equals is been used the url without
					// parameters and the parameter "is"
					if (~touchpoint.indexOf(href.split('?')[0]))
					{
						// If the "is" parameter exist in the link, then must exist in the
						// touchpoint and his values need to be equals.
						if(!(href_parameter_value_is &&
							(!touchpoint_parameter_value_is ||
								touchpoint_parameter_value_is !== href_parameter_value_is))
							)
						{
							e.target.href = touchpoint;
						}
					}
				});
			}
		}
		// As this fixCrossDomainNavigation only alters the href of the a we can append it
		// to the mouse down event, and not to the click thing will make us work a lot more :)
		jQuery(document.body).on('mousedown', 'a', fixCrossDomainNavigation);
		jQuery(document.body).on('touchstart', 'a', fixCrossDomainNavigation);
	});

	// Setup global cache for this application
	jQuery.ajaxSetup({cache:false});

	return Checkout;
});
