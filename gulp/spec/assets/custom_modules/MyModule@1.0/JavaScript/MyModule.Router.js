// @module MyModule
define('MyModule.Router'
,	[	
		'jQuery'
	,	'Backbone'
	,	'MyModule.Collection'
	,	'MyModule.Details.View'
	]
,	function (
		jQuery
	,	Backbone
	,	MyModuleCollection
	,	MyModuleDetailsView
	)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'MyModule': 'showMyModule'
		,	'MyModule?*options': 'showMyModule'
		}

	,	mark: 'this is a marking from MyModule@1.0 router that should be generated as js dependency'

	,	initialize: function (application, isSaveForLater)
		{
			this.application = application;
		}

		// @method showMyModule handles the /MyModule path by showing the MyModule view.
	,	showMyModule: function ()
		{
			var collection = new MyModuleCollection(); 
			collection.fetch().done(function()
			{
				var view = new MyModuleDetailsView({collection: collection});
				view.showContent();
			})
		}
	});
});
