define(
	[
		'Backbone'
	,	'my_extension_1_error.tpl'	
	]
,	function (
		Backbone
	,	my_extension_1_error_tpl
	)
{
	'use strict';
	
	return Backbone.View.extend({
		isErrorView: true
		
	,	template: my_extension_1_error_tpl

	,	initialize: function (options)
		{
			this.message = options.message;
		}

	,	getContext: function ()
		{
			return {
				message: this.message
			};
		}
	});
});