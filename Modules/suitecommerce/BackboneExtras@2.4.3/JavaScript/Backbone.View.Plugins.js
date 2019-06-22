/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module BackboneExtras
#Backbone.View.Plugins
Define the default plugins to execute by Backbone.View.render method. These plugins hook into the Backobne.view
render() life cycle and modify the view's output somehow, for example removing marked nodes that current user
has not permission to see, installing bootstrap widgets after a view is rendered, etc.
*/
define('Backbone.View.Plugins'
,	[
		'Backbone.View.Plugin.ApplyPermissions'
	,	'Backbone.View.Plugin.Bootstrap'
	,	'Backbone.View.Plugin.DatePicker'
	,	'Backbone.View.Plugin.DebugTemplateName'
	,	'Backbone.View.Plugin.OldIEFix'
	,	'Backbone.View.Plugin.PageGeneratorImages'
	]
,	function ()
{
	'use strict';

	var plugins = arguments;

	return  {
		mountToApp: function ()
		{
			console.warn('DEPRECATED: Backbone.View.Plugin is deprecated. Include dependencies using ' +
					' require("Backbone.Plugin.{Your neeeded plugin}") instead');

			for(var i = 0; i < plugins.length; ++i)
			{
				plugins[i].mountToApp.apply(this, arguments);
			}
		}
	};
});
