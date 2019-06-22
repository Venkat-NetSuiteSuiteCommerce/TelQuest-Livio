/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTest.Backbone.CompositeView.MouthView'
,	[	'Backbone'
	,	'UnitTest.Backbone.CompositeView.mouth_view_template.tpl'
	]
,	function (
		Backbone
	,	mouth_view_template_tpl
	)
{
	return Backbone.View.extend({
		template: mouth_view_template_tpl
	});
});