/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module CustomContentType
define(
	'CustomContentType.Container.View'
,	[
		'custom_content_type_container.tpl'

	,	'Backbone'
	]
,	function (
		custom_content_type_container_tpl

	,	Backbone
	)
{
	'use strict';

	//@class CustomContentType.Container.View @extends Backbone.View
	//inherits the basic render and destroy methods from Backbone.View
	return Backbone.View.extend({

		template: custom_content_type_container_tpl

	,	childViews: {
			'CCT-View': function ()
			{
				return this.options.innerCustomContentType;
			}
		}

		// @method getContext
		// @return {CustomContentType.Container.View.Context}
	,	getContext: function getContext()
		{
			// @class CustomContentType.Container.View.Context
			return {
				//@property {String} instanceId
				instanceId: this.options.instanceId

				//@property {String} classes
			,	classes: this.options.classes
			};
			// @class CustomContentType.Container.View
		}
	});
});
