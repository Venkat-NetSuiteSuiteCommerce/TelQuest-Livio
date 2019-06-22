/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
	@module CMSadapter
	@class CMSadapter.Plugin.PostRender

	Loads the cmsPostRender plugin responsible of re-rendering CCTs when views are being updated.
*/
define('CMSadapter.Plugin.PostRender'
,	[
		'underscore'
	]
,	function (
		_
	)
{
	'use strict';

	return function CMSadapterPluginPostRender (component)
	{
		return {
			name: 'cmsPostRender'
		,	priority: 10
		,	execute: function (tmpl_str, view)
			{
				var cct_generators = component.getViewCctsToRerender(view);

				_.each(cct_generators, function (cct_generator)
				{
					view.addChildViewInstances(cct_generator, true);
				});
			}
		};
	};
});
