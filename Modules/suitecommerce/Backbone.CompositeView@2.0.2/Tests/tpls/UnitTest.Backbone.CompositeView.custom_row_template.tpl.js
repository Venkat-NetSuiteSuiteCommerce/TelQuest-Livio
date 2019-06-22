/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTest.Backbone.CompositeView.custom_row_template.tpl', function ()
{
	return function ()
	{
		return '<div data-id="customrow" class="row-fluid"> <div data-type="backbone.collection.view.cells" ></div> </div>';
	};
});