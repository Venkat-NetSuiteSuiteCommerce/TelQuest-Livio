//@module Address
define('MyModule.Collection'
,	[	'MyModule.Model'
	,	'Backbone'
	]
,	function (
		Model
	,	Backbone
	)
{
	'use strict';

	//@class MyModule.Collection @extend Backbone.Collection
	return Backbone.Collection.extend(
	{
		//@property {MyModule.Model} model
		model: Model

		//@property {String} url
	,	url: 'services/MyModule.Service.ss'

		//@method comparator Defines a custom comparative method between MyModule to sort the MyModule taking into account if there are default shipping or default billing
		//@param {MyModule.Model} model
		//@return {Number}
	,	comparator: function (model)
		{
			return (model.get('defaultbilling') === 'T' || model.get('defaultshipping') === 'T') ? 0 : 1;
		}
	});
});

