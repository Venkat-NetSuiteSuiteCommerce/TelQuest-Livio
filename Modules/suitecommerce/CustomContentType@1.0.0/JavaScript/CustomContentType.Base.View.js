/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module CustomContentType
define(
	'CustomContentType.Base.View'
,	[
		'Backbone'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class CustomContentType.Base.View @extends Backbone.View
	//Base CCT class from where all the custom CCT extend from
	//inherits the basic render and destroy methods from Backbone.View
	var CustomContentTypeBaseView = Backbone.View.extend({

		// @property {Array<String>} contextDataRequest The list of contexts that the CCT is requesting
		contextDataRequest: []

	,	initialize: function initialize(options)
		{
			this._initialize(options);
		}

		// @method install called the first time a CCT is dragged from the admin panel to the application.
		// It indicates when does the CCT instance has finished making all the ajax call that are necessary.
		// Also it initializes the CCT settings.
		// If in a custom CCT is there any ajax calls or other logic, then the CCT has to override this method
		// and return a jQuery.deferred.
		// Any error that cause that the CustomContentType object could not be installed, means that the cct will be
		// removed from the DOM (call the destroy method -to be defined??- ) and it will return a deferred rejected.
		// @param {CustomContentType.Settings} settings the settings of the CCT
		// @return {jQuery.Deferred}
	,	install: function install(settings, context_data)
		{
			return this._install(settings, context_data);
		}

		// @method _instal
		// @param {CustomContentType.Settings} settings the new settings of the CCT
		// @return {Void}
	,	_install: function _install(settings, context_data)
		{
			this.settings = settings;
			this.contextData = context_data;

			return jQuery.Deferred().resolve();
		}

		// @method validateContextDataRequest Validate if the context that the CCT recieves is enough for the CCT to work
		// @param {Object} context_data An object with the contexts found
		// @return {Boolean}
	,	validateContextDataRequest: function(context_data)
		{
			return _.keys(context_data).length === this.contextDataRequest.length;
		}

		// @method getContextDataRequest Returns a copy of the 'contextDataRequest' property
		// @return {Array<String>}
	,	getContextDataRequest: function()
		{
			return this.contextDataRequest.slice();
		}

		// @method update used every time the user wants to edit a CCT.
		// To do this, the user will select one, interact with the CMS configuration side panel,
		// CMS will in turn trigger the adapter:cct:update event, and SCA code will call this method to finally
		// update the settings of the CCT.
		// Each specific CCT will have to override this method in order to update the settings,
		// trigger a re-render of the CCT View, and return a deferred resolved or rejected.
		// @param {CustomContentType.Settings} settings the new settings of the CCT
		// @return {jQuery.Deferred}
	,	update: function update(settings)
		{
			return this._update(settings);
		}

		// @method _update
		// @param {CustomContentType.Settings} settings the new settings of the CCT
		// @return {Void}
	,	_update: function _update(settings)
		{
			this.settings = settings;
			return jQuery.Deferred().resolve();
		}

	,	destroy: function destroy()
		{
			this._destroy();
			return jQuery.Deferred().resolve();
		}
		// @method getContext
		// @return {CustomContentType.Base.View.Context}
	,	getContext: function getContext()
		{
			// @class CustomContentType.Base.View.Context
			return {
				//@property {CustomContentType.Settings} settings
				settings: this.settings
			};
			// @class CustomContentType.Base.View
		}
	});

	CustomContentTypeBaseView.beforeInitialize.install({
		name: 'customContentTypeBaseViewInit'
	,	priority: 1
	,	execute: function ()
		{
			this.settings = {};
			this.instanceId = this.options.instanceId;
			this.id = this.options.id;
		}
	});

	return CustomContentTypeBaseView;

	//@class CustomContentType.Settings This class defines the available settings that a CustomContentType object support.
	//It is an obj of the form
	// {
	//		template: {String} name of the template/path to the module in the file cabinet?
	//		html: to be defined, in case of the four core CCT
	//		....
	// }
});
