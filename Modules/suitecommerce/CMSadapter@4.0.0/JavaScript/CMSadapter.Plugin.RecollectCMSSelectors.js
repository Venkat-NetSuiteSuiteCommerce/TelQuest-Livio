/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
	@module CMSadapter
	@class CMSadapter.Plugin.RecollectCMSSelectors

	Loads the recollectCMSSelectors plugin that iterates through all the tags that contains data-cms in the
	template string.
*/
define('CMSadapter.Plugin.RecollectCMSSelectors'
,	[
		'underscore'
	]
,	function (
		_
	)
{
	'use strict';

	return function CMSadapterPluginRecollectCMSSelectorsGenerator (component)
	{
		return {
			name: 'recollectCMSSelectors'
		,	priority: 10
		,	execute: function (tmpl_str, view)
			{
				var unregister = function()
				{
					component.unregisterViewForPlaceholders(view);
				};

				view.off('destroy', unregister)
					.on('destroy', unregister);

					var regex = /<[^\/>]*(data-cms-area)=\"([^"\s]+)\"[^\/>]*>/g
				,	match = regex.exec(tmpl_str)
				,	selectors_on_ui = []
				,	selector
				,	isEqual = function (obj)
					{
						return _.isEqual(obj, selector);
					};

				component.unregisterViewForPlaceholders(view);

				while( match !== null )
				{
					selector = {
						'data-cms-area': match[2]
					};

					if(!_.find(selectors_on_ui, isEqual))
					{
						selectors_on_ui.push(selector);
					}
					else
					{
						console.warn('Repeated selector ' + component.selectorToString(selector) + ' in template ' + view.template.Name);
					}

					match = regex.exec(tmpl_str);
				}

				if (selectors_on_ui.length > 0)
				{
					component.registerViewForPlaceholder(selectors_on_ui, view);
				}

				return tmpl_str;
			}
		};
	};
});
