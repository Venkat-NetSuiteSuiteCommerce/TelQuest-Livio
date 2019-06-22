/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ShoppingApplication
define(
	'SC.Shopping.Layout'
,	[
		'ApplicationSkeleton.Layout'

	,	'shopping_layout.tpl'
	,	'underscore'
	,	'Utils'

	]
,	function(
		ApplicationSkeletonLayout

	,	shopping_layout_tpl
	,	_
	
	)
{
	'use strict';

	// @class SCA.Shopping.Layout @extends ApplicationSkeleton.Layout
	return ApplicationSkeletonLayout.extend({
		//@property {Function} template
		template: shopping_layout_tpl
		//@property {String} className
	,	className: 'layout-container'

		//@property {Array} breadcrumbPrefix
	,	breadcrumbPrefix: [
			{
				href: '/'
			,	'data-touchpoint': 'home'
			,	'data-hashtag': '#'
			,	text: _('Home').translate()
			}
		]

	});
});