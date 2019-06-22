/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTest.Backbone.CompositeView.cell_view_template.tpl'
,	['underscore']
,	function (_)
	{
		return _('<div>this apple color is <%= view.model.get("color")%> and sumping some options also: <%= view.someStrangeOption%></div>').template();
	}
);