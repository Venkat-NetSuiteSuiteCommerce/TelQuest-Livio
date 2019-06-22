/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTest.Backbone.CompositeView.CellView'
,	[	'Backbone'
	,	'UnitTest.Backbone.CompositeView.cell_view_template.tpl'
	]
,	function (
		Backbone
	,	cell_view_template_tpl
	)
	{
		return Backbone.View.extend({
					template: cell_view_template_tpl
				,	initialize: function (options)
					{
						this.someStrangeOption = options.someStrangeOption;
					}
				})
	}
);