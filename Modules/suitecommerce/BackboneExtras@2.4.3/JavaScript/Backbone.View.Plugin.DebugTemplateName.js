/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('Backbone.View.Plugin.DebugTemplateName'
,	[
		'Backbone.View.render'
	,	'Utils'
	,	'underscore'
	]
,	function (
		BackboneView
	,	Utils
	,	_
	)
{
	'use strict';

	return  {
		mountToApp: function ()
		{
			if (!_.result(SC, 'isPageGenerator'))
			{
				BackboneView.postCompile.install({
					name: 'debugTemplateName'
				,	priority: 10
				,	execute: function (tmpl_str, view)
					{
						var template_name = view.template.Name
						,	prefix = Utils.isPageGenerator() ? '' : '\n\n<!-- TEMPLATE STARTS: '+ template_name +'-->\n'
						,	posfix = Utils.isPageGenerator() ? '' : '\n<!-- TEMPLATE ENDS: '+ template_name +' -->\n';

						tmpl_str = prefix + tmpl_str + posfix;

						return tmpl_str;
					}
				}); 
			}
		}
	};
});
