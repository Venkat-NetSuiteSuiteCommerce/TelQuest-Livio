/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTest.Backbone.CompositeView.cell_container_view_customchild_template.tpl'
,	[	'underscore'
	,	'UnitTest.Backbone.CompositeView.custom_cell_template.tpl'
	,	'UnitTest.Backbone.CompositeView.custom_row_template.tpl'
	,	'UnitTest.Backbone.CompositeView.custom_child_template.tpl'
	]
,	function (_)
	{
		return _('<div><span data-view="CollectionContainer" data-child-template="UnitTest.Backbone.CompositeView.custom_child_template"</span></div>').template();
	}
);