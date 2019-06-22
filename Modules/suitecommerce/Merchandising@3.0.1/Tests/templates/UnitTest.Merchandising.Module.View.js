/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTest.Merchandising.Module.View'
,	[	'Backbone'
	,	'UnitTest.Merchandising.Module.merchandising_module_template.tpl'
	]
,	function (
		Backbone
	,	merchandising_module_template_tpl
	)
{
	return Backbone.View.extend({
		template: merchandising_module_template_tpl
	});
});