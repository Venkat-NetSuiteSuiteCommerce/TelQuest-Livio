/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTest.Backbone.CompositeView.face_view.tpl'
,	[	'UnitTest.Backbone.CompositeView.desktop_template.tpl'
	,	'UnitTest.Backbone.CompositeView.phone_template.tpl'
	,	'UnitTest.Backbone.CompositeView.tablet_template.tpl'
	]
,	function ()
	{
		return function ()
		{
			return	'<div><span data-view="Mouth" data-template="UnitTest.Backbone.CompositeView.desktop_template"'+
				' data-phone-template="UnitTest.Backbone.CompositeView.phone_template"'+
				' data-tablet-template="UnitTest.Backbone.CompositeView.tablet_template"></span></div>';
		};
	}
);