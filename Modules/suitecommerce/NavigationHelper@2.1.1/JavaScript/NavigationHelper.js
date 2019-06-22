/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module NavigationHelper
// NavigationHelper intersect all clicks on a elements and computes what to do, if navigate using backbone or navigate away
// support data-touchpoint for indicating a target touchpoint by name and data-keep-options for keeping current url options in the link.
define('NavigationHelper'
,	[	'Session'
	,	'PluginContainer'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		Session
	,	PluginContainer
	,	_
	,	jQuery
	,	Utils
	)
{
	'use strict';

	// @class NavigationHelper uses different PluginContainer, each for handling different types of user events globally.
	// itself is a Plugin container where specific tasks (like handling data-touchpoint links or open links in new modals are implemented by specific plugins)
	// Basically each registered plugin will have the opportunity of performing some operation over the link's href attribute
	// @extends ApplicationModule
	var NavigationHelper = {

		mountToApp: function (application)
		{
			// @module ApplicationSkeleton @class ApplicationSkeleton.Layout
			var Layout = application.getLayout();

			_.extend(Layout, {

				//@method isTargetBlank Indicate if the target link of the event e is blank or not. IMPORTANT: This functions does NOT take into a account the button press
				//@param {jQuery.Event} e jQuery event
				//@returns {Boolean} result
				isTargetBlank: function (e)
				{
					return e.ctrlKey || e.metaKey || jQuery(e.currentTarget).attr('target') === '_blank';
				}

				//@method getUrl Returns the target URL of the clicked object from the navigation context
				//@param {NavigationContext} context
				//@return {String}
			,	getUrl: function (context)
				{
					if (Utils.oldIE())
					{
						return  context.target_data.href;
					}

					return context.target_href;
				}

				//@method setUrl Set the URL to the jQuery element taking into account backward compatibility con old IE browsers
				//@param {jQuery} $element
				//@param {String} url
				//@return {Void}
			,	setUrl: function ($element, url)
				{
					$element.attr('href', url);

					if (Utils.oldIE())
					{
						$element.data('href', url);
					}
				}

				//@method generateNavigationContext Generate the navigation context object
				//@param {jQuery.Event} e jQuery event param
				//@return {NavigationContext}
			,	generateNavigationContext: function (e)
				{
					var $target = jQuery(e.currentTarget)
					,	touchpoints = Session.get('touchpoints')
					,	target_data = $target.data()
					,	target_touchpoint = (touchpoints ? touchpoints[target_data.touchpoint] : '') || ''
					,	hashtag = target_data.hashtag
					,	target_href = $target.attr('href')
					,	clean_hashtag = hashtag && hashtag.replace('#', '');

					//@class NavigationContext
					return  {
						//@property {Object} target_data An object where each property is one of the data attributes of the target element
						target_data: target_data
						//@property {String} target_href
					,	target_href: target_href
						//@property {String} target_touchpoint
					,	target_touchpoint: target_touchpoint
						//@property {String} original_touchpoint
					,	original_touchpoint: target_data.touchpoint
						//@property {String} hashtag
					,	hashtag: hashtag
						//@property {String} url
					,	url: ''
						//@property {String} clean_hashtag
					,	clean_hashtag: clean_hashtag
						//@property {jQuery} $target
					,	$target: $target
					};
					//@class NavigationHelper
				}

				/////////////////////////////////
				//		PLUGINS DEFINITION
				/////////////////////////////////

				// @property {PluginContainer} touchStart plugin container that handles the global touch start event
			,	touchStart: new PluginContainer()
				// @property {PluginContainer} touchMove plugin container that handles the global touch move event
			,	touchMove: new PluginContainer()
				// @property {PluginContainer} mouseDown plugin container that handles the global mouseDown event
			,	mouseDown: new PluginContainer()
				// @property {PluginContainer} click plugin container that handles the global click event
			,	click: new PluginContainer()
				// @property {PluginContainer} touchEnd plugin container that handles the global touchEnd event
			,	touchEnd: new PluginContainer()
				// @property {PluginContainer} mouseUp plugin container that handles the global mouseUp event
			,	mouseUp: new PluginContainer()

				// @method executeTouchStart execute all touchStart plugins
				//@param {jQuery.Event} e
			,	executeTouchStart: function (e)
				{
					this.touchStart.executeAll(e);
				}

				// @method executeTouchStart execute all touchMove plugins
				//@param {jQuery.Event} e
			,	executeTouchMove: function (e)
				{
					this.touchMove.executeAll(e);
				}

				// @method executeTouchStart execute all mouseUp plugins
				//@param {jQuery.Event} e
			,	executeMouseUp: function (e)
				{
					this.mouseUp.executeAll(e);
				}

				// @method executeTouchStart execute all touchEnd plugins
				//@param {jQuery.Event} e
			,	executeTouchEnd: function (e)
				{
					this.touchEnd.executeAll(e);
				}

				// @method executeTouchStart execute all mouseDown plugins
				//@param {jQuery.Event} e
			,	executeMouseDown: function (e)
				{
					this.mouseDown.executeAll(e);
				}

				// @method executeTouchStart execute all click plugins
				//@param {jQuery.Event} e
			,	executeClick: function (e)
				{
					this.click.executeAll(e);
				}
			});

			// Adds event listeners to the layout
			_.extend(Layout.events, {
				// touchpoints, this needs to be before the other click event, so they are computed early
				'touchstart a:not([data-navigation="ignore-click"])': 'executeTouchStart'
			,	'mousedown a:not([data-navigation="ignore-click"])': 'executeMouseDown'
			,	'click a:not([data-navigation="ignore-click"])': 'executeClick'
			,	'mouseup a:not([data-navigation="ignore-click"])': 'executeMouseUp'
			,	'touchend a:not([data-navigation="ignore-click"])': 'executeTouchEnd'
			,	'touchmove a:not([data-navigation="ignore-click"])': 'executeTouchMove'
			});


			//Default Navigation Plugins
			Layout.touchMove.install({
				name: 'detectTouchMovement'
			,	priority: 10
			,	execute: function (e)
				{
					if (jQuery(e.currentTarget).data('touchpoint'))
					{
						Layout.isTouchMoveEvent = true;
					}
					return e;
				}
			});
		}
	};

	return NavigationHelper;
});