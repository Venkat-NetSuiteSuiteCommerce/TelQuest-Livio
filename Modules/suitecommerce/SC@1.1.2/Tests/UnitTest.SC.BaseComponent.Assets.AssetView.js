/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define([
		'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.View.render'
	]
,	function (
		Backbone
	,	BackboneCompositeView
	)
{
	return Backbone.View.extend({
		template: function (ctx)
		{
			return '<div>Main view '+
						'<div data-view="injectable-placeholder"></div>' +
						'<button data-action="new-action">New Action</button>' +
						'<div data-type="container">'+ctx.extraProperty+'</div>'+
					'</div>';
		}

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

	,	getContext: function ()
		{
			return {
				someValue: "Yes"
			}
		}

	});
});