/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('Backbone.View.Plugin.PageGeneratorImages'
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

			// wrap all images with noscript tag in the page generator output so they are not automatically loaded by the browser and compete with our core resources.
			if (_.result(SC, 'isPageGenerator'))
			{
				BackboneView.postCompile.install({
					name: 'pageGeneratorWrapImagesNoscript'
				,	priority: 30
				,	execute: function (tmpl_str)
					{
						return tmpl_str.replace(/(<img\s+[^>]*>\s*<\/img>|<img\s+[^>]*\/>|(?:<img\s+[^>]*>)(?!\s*<\/img>))(?!\s*<\s*\/noscript\s*>)/gmi,'<noscript>$1</noscript>');
					}
				});
			}
		}
	};
});
