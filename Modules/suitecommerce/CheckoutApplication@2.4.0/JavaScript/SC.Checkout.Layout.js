/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module CheckoutApplication
define(
	'SC.Checkout.Layout'
,	[
		'ApplicationSkeleton.Layout'

	,	'checkout_layout.tpl'

	,	'underscore'
	,	'Utils'
	]
,	function(
		ApplicationSkeletonLayout

	,	checkout_layout_tpl

	,	_
	)
{
	'use strict';

	//@class SCA.Checkout.Layout @extend ApplicationSkeletonLayout
	return ApplicationSkeletonLayout.extend({

		//@propery {Function} template
		template: checkout_layout_tpl

		//@propery {String} className 
	,	className: 'layout-container'
		//@property {Array} breadcrumbPrefix
	,	breadcrumbPrefix: [
				{
					href: '#'
				,	'data-touchpoint': 'home'
				,	'data-hashtag': '#'
				,	text: _('Home').translate()
				}
			,	{
					href: '#'
				,	'data-touchpoint': 'checkout'
				,	'data-hashtag': '#'
				,	text: _('Checkout').translate()
				}
		]

	});
});