/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('Backbone.View.Plugin.Bootstrap'
,	[
		'Backbone.View.render'
	,	'underscore'
	]
,	function (
		BackboneView
	,	_
	)
{
	'use strict';

	return  {
		mountToApp: function ()
		{
			if (!_.result(SC, 'isPageGenerator'))
			{
				BackboneView.postRender.install({
					name: 'HTMLBootstrap'
				,	priority: 10
					//Fix all HTML bootstrap tooltips
				,	execute: function ($el, view)
					{
						view.$('[data-toggle="tooltip"]').tooltip({html: true});
						view.$('[data-toggle="dropdown"]').dropdown();
						//view.$('[data-toggle="collapse"]').collapse();
					}
				});
			}
		}
	};
});
