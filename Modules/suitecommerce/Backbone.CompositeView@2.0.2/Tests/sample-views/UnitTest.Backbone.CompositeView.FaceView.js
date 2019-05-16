/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTest.Backbone.CompositeView.FaceView'
,	[	'Backbone'
	,	'UnitTest.Backbone.CompositeView.MouthView'
	,	'Backbone.CompositeView'
	,	'UnitTest.Backbone.CompositeView.face_view.tpl'
	]
,	function (
		Backbone
	,	MouthView
	,	BackboneCompositeView
	,	face_view_tpl
	)
{
	return Backbone.View.extend({

			template: face_view_tpl

		,	initialize: function ()
			{
				BackboneCompositeView.add(this); //make it a composite view (a container)
			}

		,	childViews: {
				Mouth: function ()
				{
					return new MouthView();
				}
			}
		}
	);
});