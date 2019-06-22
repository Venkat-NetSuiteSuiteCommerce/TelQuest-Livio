/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CMSadapter
define(
	'CMSadapter.Page.Collection'
,	[
		'CMSadapter.Page.Model'

	,	'Backbone'
	]
,	function (
		CMSadapterPageModel

	,	Backbone
	)
{
	'use strict';

	// @class CMSadapter.Page.Collection @extends Backbone.Collection
	return Backbone.Collection.extend ({

		model: CMSadapterPageModel

	});
});
