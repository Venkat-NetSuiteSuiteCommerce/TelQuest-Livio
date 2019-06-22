/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Merchandising
define('Merchandising.Item.Collection'
,	[	'Item.Collection'
	,	'Session'
	,	'underscore'
	,	'Profile.Model'
	,	'Utils'
	]
,	function (
		ItemCollection
	,	Session
	,	_
	,	ProfileModel
	)
{
	'use strict';

	// @class Merchandising.ItemCollection Item collection used for the merchandising zone
	// we declare a new version of the ItemCollection
	// to make sure the urlRoot doesn't get overridden
	// @extends Item.Collection
	return ItemCollection.extend({

		url: function ()
		{
			var profile = ProfileModel.getInstance();
			return _.addParamsToUrl(
				profile.getSearchApiUrl()
			,	_.extend(
					{}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			,	profile.isAvoidingDoubleRedirect()
			);
		}
	});
});