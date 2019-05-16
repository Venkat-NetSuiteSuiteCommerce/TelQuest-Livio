/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Address
define('Address.Collection'
,	[	'Address.Model'
	,	'Backbone'
	]
,	function (
		Model
	,	Backbone
	)
{
	'use strict';

	//@class Address.Collection @extend Backbone.Collection
	return Backbone.Collection.extend(
	{
		//@property {Address.Model} model
		model: Model

		//@property {String} url
	,	url: 'services/Address.Service.ss'

		//@method comparator Defines a custom comparative method between address to sort the address taking into account if there are default shipping or default billing
		//@param {Address.Model} model
		//@return {Number}
	,	comparator: function (model)
		{
			return (model.get('defaultbilling') === 'T' || model.get('defaultshipping') === 'T') ? 0 : 1;
		}
	});
});

