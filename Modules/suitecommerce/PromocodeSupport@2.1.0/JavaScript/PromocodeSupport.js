/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PromoCodeSupport
// rewrite touchpoints when set promocode.
define('PromocodeSupport'
,	[	'UrlHelper'
	,	'LiveOrder.Model'

	,	'Backbone'
	]
,	function (
		UrlHelper
	,	LiveOrderModel

	,	Backbone
	)
{
	'use strict';

	return {
		mountToApp: function ()
		{
			// Method defined in file UrlHelper.js
			UrlHelper.addTokenListener('promocode', function (value)
			{
				// Because this is passed from the URL and there might be spaces and special chars,
				// we need to fix this so it does not invalidate our promocode
				value = unescape(value.replace(/[+]/g, ' '));

				var liveorder = LiveOrderModel.getInstance()
				,	promocodes = liveorder.get('promocodes') || []
				,	new_promocodes = promocodes.concat({ code: value })
				,	url;

				// We get the instance of the ShoppingCart and apply the promocode
				liveorder
					.save({promocodes: new_promocodes})
					.always(function savePromocodeEnded ()
						{
							liveorder.trigger('promocodeUpdated', 'applied');
						});

				url = Backbone.history.fragment
							.replace('&promocode='+value, '')
							.replace('?promocode='+value, '');

				Backbone.history.navigate(url, {trigger: false, replace: true});

				return false;
			});
		}
	};

});
