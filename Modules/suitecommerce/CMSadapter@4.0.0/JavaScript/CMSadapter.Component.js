/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CMSadapter
// @class CMSadapter.Component

define('CMSadapter.Component'
,	[
		'CustomContentType.Container.View'

	,	'Utils'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		CustomContentTypeContainerView

	,	Utils
	,	_
	,	jQuery
	)
{
	'use strict';

	var placeholder_views = {};

	var view_ccts_to_rerender = {};

	// @class CMSadapterComponent
	return {

		componentName: 'CMS'

		//@property {CMSadapter.Component.CustomContentTypeStore} _customContentTypes Custom content type store
		//@private
	,	_customContentTypes: {}

		//@property {CMSadapter.Component.CustomerContentTypeInstance.Store} _customContentTypesInstances Custom content type instances store
		//@private
	,	_customContentTypesInstances: {}

		//@method _createError Internal error to centralize the generation of errors
		//@param {String} error_code Code of the error (Capitalized word)
		//@param {String} error_message Details error message
		//@return {CMSadapter.Component.Error}
	,	_createError: function _createError (error_code, error_message)
		{
			//@class CMSadapter.Component.Error
			return {
				//@property {String} code
				title: error_code
				//@property {String} message
			,	message: error_message
			};
			//@class CMSadapterComponent
		}

		//@method _installContent Internal method to handle the installation of a CCT (call the install method)
		//@private
		//@param {CustomContentType.Base.View} cct A CCT instance
		//@param {Object} cct_settings Any object to be sent to the cct instance
		//@return {jQuery.Deferred}
	,	_installContent: function _installContent(cct, cct_settings, context_data)
		{
			var self = this;
			return jQuery.when(cct.install(cct_settings, context_data))
				.then(
					function ()
					{
						return jQuery.Deferred().resolve();
					}
				,	function (e)
					{
						var message = (e && _.isFunction(e.toString) && e.toString()) || _('Unknown error installing CCT. CCT Instance Id: $(0)').translate(cct.instanceId);
						return jQuery.Deferred().reject(self._createError('ERR_INSTALLING_CCT', message));
					});
		}


		//@method _updateSettings Internal method to handle the update of the CCT settings (call the update method)
		//@private
		//@param {CustomContentType.Base.View} cct A CCT instance
		//@param {Object} cct_settings Any object to be sent to the cct instance
		//@return {jQuery.Deferred}
	,	_updateSettings: function _updateSettings(cct, cct_settings)
		{
			var self = this;

			return jQuery.when(cct.update(cct_settings))
				.then(
					function ()
					{
						return jQuery.Deferred().resolve();
					}
				,	function (e)
					{
						var message = (e && _.isFunction(e.toString) && e.toString()) || _('Unknown error updating CCT. CCT Instance Id: $(0)').translate(cct.instanceId);
						return jQuery.Deferred().reject(self._createError('ERR_UPDATING_CCT', message));
					});
		}

		//@method _addViewCctsToRerender Internal method for associating views being rendered with their corresponding CCTs.
		//We use the template name as the dictionary key.
		//@private
		//@param {Backbone.View} a view instance
		//@param {Object} cctGenerator object with the necessary information for creating a CCT.
		//@return {Void}
	,	_addViewCctsToRerender: function _addViewCctsToRerender(view, cctGenerator)
		{
			if (view.template && view.template.Name)
			{
				if (_.isUndefined(view_ccts_to_rerender[view.template.Name]))
				{
					view_ccts_to_rerender[view.template.Name] = [];
				}

				view_ccts_to_rerender[view.template.Name].push(cctGenerator);
			}
		}

		// @method getPlaceholderViews returns an object with the association between selectors and their views.
		// @return {PlaceholderViews}
	,	placeholderViews: function placeholderViews()
		{
			return placeholder_views;
		}

		// @method clears the placeholder_views
		// @return {Void}
	,	resetPlaceholderViews: function resetPlaceholderViews()
		{
			placeholder_views = {};
		}

		//@method registerCustomContentType Register a new CCT for the running application
		//@public
		//@param {CustomContentType.Base.View} cct Custom Content Type View constructor
		//@return {Void}
	,	registerCustomContentType: function registerCustomContentType(cct)
		{
			this._customContentTypes[cct.id.toLowerCase()] = cct.view;
		}

		//@method addContents Add multiple CCTs.
		// If the CCT was already added, then it just will attach the previous CCT view instance again
		// (that means that new settings or render_settings will be ignored)
		// Otherwise it will create a new CCT and add it to the current view
		//@public
		//@param {Array<CustomContentType.Base.View>}  ccts
		//@return {jQuery.Deferred}
	,	addContents: function addContents(ccts)
		{
			var self = this
			,	old_instances = _.keys(this._customContentTypesInstances)
			,	async_operations = [];

			view_ccts_to_rerender = {};

			ccts = self._sortCCTs(ccts);

			//Clear all current ccts (detach from DOM) AND those that were taking or will take part of a repetitive context will be removed
			_.each(_.keys(this._customContentTypesInstances), function(old_instance_id)
			{
				var selector = self._customContentTypesInstances[old_instance_id].length && self._customContentTypesInstances[old_instance_id][0].selector
				,	views = selector && self.getPlaceholderViews(selector)
				,	old_instance = self._customContentTypesInstances[old_instance_id];

				if ((old_instance && old_instance.length > 1) || (views && views.length > 1))
				{
					self.removeContent(old_instance_id, true);
					old_instances.splice(_.indexOf(old_instances, old_instance_id), 1);
				}
				else
				{
					self.removeContent(old_instance_id, false);
				}
			});

			//Calculate what ccts needs to be preserved and what ccts are new
			_.each(ccts, function (cct)
			{
				if  (_.indexOf(old_instances, cct.instance_id) >= 0 )
				{
					//re add into the parent view
					_.each(self._customContentTypesInstances[cct.instance_id], function(cct_container)
					{
						var generator = {}
						,	container_name = cct_container.selector['data-cms-area'];

						generator[container_name] = {};
						generator[container_name][cct.instance_id] = {
							childViewIndex: 1000 + parseInt(cct.render_settings.position, 10)
						,	childViewConstructor: null
						,	childViewInstance: cct_container.container
						,	childViewSelector: cct_container.selector
						};

						var parent_view_instance = cct_container.parent;

						parent_view_instance.addChildViewInstances(generator, true);

						self._addViewCctsToRerender(parent_view_instance, generator);
					});

					old_instances.splice(_.indexOf(old_instances, cct.instance_id), 1);
				}
				else
				{
					//add new children view
					async_operations.push(self.addContent(
						cct.id
					,	cct.instance_id
					,	cct.selector
					,	cct.settings
					,	cct.render_settings)
					);
				}
			});

			//Remove old instances
			_.each(old_instances, function(old_instance_id)
			{
				async_operations.push(self.removeContent(old_instance_id, true));
			});

			return jQuery.when.apply(jQuery, async_operations);
		}

		//@method addContent Adds a new CCT into the specified placeholder
		//@public
		//@param {String} cct_id Id of the CCT constructor. This value must have been registered previously
		//@param {String} cct_instance_id. Unique identifier of the new CCT
		//@param {Selector} cct_selector Where the cct should be inserted
		//@param {Object} cct_settings Any setting that will be sent to the new cct instance
		//@param {CMSadapter.Component.addContent.RenderSettings} render_settings Setting on how the rendering should be done
		//@return {jQuery.Deferred}
	,	addContent: function addContent(cct_id, cct_instance_id, cct_selector, cct_settings, render_settings)
		{
			var self = this
			,	selector = this.getPlaceholder(cct_selector)
			,	container = selector ? this.getPlaceholderViews(self.selectorToString(selector)) : null
			,	async_operations = [];

			cct_id = cct_id.toLowerCase();

			if (!selector || !container.views || !container.views.length)
			{
				// return jQuery.Deferred().reject(self._createError('ERR_INVALID_SELECTOR',
				// 		_('Invalid selector. The current view does not contains the specified selector: $(0)').translate(self.selectorToString(cct_selector))));

				return jQuery.Deferred().resolve();
			}
			else if(!self._customContentTypes[cct_id])
			{
				// return jQuery.Deferred().reject(self._createError('ERR_INVALID_CCT',
				// 			_('Requested to render invalid CCT. CCT Id: $(0). CCT Instance Id: $(1). Placeholder: $(2)').translate(cct_id, cct_instance_id, self.selectorToString(cct_selector))));

				return jQuery.Deferred().resolve();
			}
			else if(self._customContentTypesInstances[cct_instance_id] && self._customContentTypesInstances[cct_instance_id].length)
			{
				return jQuery.Deferred().reject(self._createError('ERR_INVALID_INSTANCE_ID',
							_('There is already a CCT with the Instance Id $(0). Unable to add CCT: Id: $(1). CCT Instance Id: $(2). Placeholder: $(3)').translate(cct_instance_id, cct_id, cct_instance_id, self.selectorToString(cct_selector))));
			}
			else
			{
				if (!self._customContentTypesInstances[cct_instance_id])
				{
					self._customContentTypesInstances[cct_instance_id] = [];
				}

				_.each(container.views, function (parent_view_instance)
				{
					var cct_constructor = self._customContentTypes[cct_id]
					,	cct_instance =  new cct_constructor(
							{
								id: cct_id
							, 	instanceId: cct_instance_id
							}
						)
					,	cct_container_instance = new CustomContentTypeContainerView({
							innerCustomContentType: cct_instance
						,	instanceId: cct_instance_id
						,	classes: render_settings.classes
						});

					var contextData = parent_view_instance.getContextData(cct_instance.getContextDataRequest());

					if (cct_instance.validateContextDataRequest(contextData))
					{
						self._customContentTypesInstances[cct_instance_id].push(
						//@class CMSadapter.Component.CustomerContentTypeInstance.Container
						{
							//@property {CustomContentType.Base.View} cct Instance of the inner CCT
							cct: cct_instance
							//@property {Backbone.View} parent SCA View that will contain the new CCT
						,	parent: parent_view_instance
							//@property {CustomContentType.Container.View} cct_container_instance Instance of the View that contains/wrap the CCT instance
						,	container: cct_container_instance
							//@property {String} selector Where the new CCT will be injected
						,	selector: container.selector
							//@property {CMSadapter.Component.addContent.RenderSettings} render_settings Setting on how the rendering should be done
						,	render_settings: render_settings
						});
						// @class CMSadapterComponent

						async_operations.push(self._installContent(cct_instance, cct_settings, contextData));

						var generator = {}
						,	container_name = container.selector['data-cms-area'];

						cct_container_instance.isCCT = true;

						generator[container_name] = {};
						generator[container_name][cct_instance_id] = {
							childViewIndex: 1000 + parseInt(render_settings.position, 10)
						,	childViewConstructor: null
						,	childViewInstance: cct_container_instance
						,	childViewSelector: container.selector
						};

						parent_view_instance.addChildViewInstances(generator, true);

						self._addViewCctsToRerender(parent_view_instance, generator);
					}
					else
					{
						async_operations.push(jQuery.Deferred().reject(self._createError('ERR_CONTEXTNOTFOUND_CCT',
								_('Context for CCT not found. CCT Instance Id: $(0)').translate(cct_instance_id))));
					}
				});

				return jQuery.when.apply(jQuery, async_operations);
			}
		}

		//@method updateContent Updates a CCT settings and its render settings
		//@public
		//@param {String} cct_id Id of the CCT constructor. This value must have been registered previously
		//@param {String} cct_instance_id. Unique identifier of the new CCT
		//@param {Selector} cct_selector Where the cct should be inserted
		//@param {Object} cct_settings Any setting that will be sent to the new cct instance
		//@param {CMSadapter.Component.addContent.RenderSettings} render_settings Setting on how the rendering should be done
		//@return {jQuery.Deferred}
	,	updateContent: function updateContent(cct_instance_id, cct_selector, cct_settings, render_settings)
		{
			var self = this
			,	cct_views_container = self._customContentTypesInstances[cct_instance_id]
			,	selector = self.getPlaceholder(cct_selector)
			,	async_operations = [];

			if(cct_views_container)
			{
				var first_cct_container = cct_views_container[0];

				if(!_.isEqual(first_cct_container.selector, cct_selector))
				{
					if(!selector)
					{
						return jQuery.Deferred().reject(self._createError('ERR_INVALID_SELECTOR',
							_('Invalid selector. The current view does not contains the specified selector: $(0)').translate(self.selectorToString(cct_selector))));
					}
					else
					{
						var cct_id = first_cct_container.cct.id;
						self.removeContent(cct_instance_id, true);

						return self.addContent(
								cct_id
							,	cct_instance_id
							,	cct_selector
							,	cct_settings
							,	render_settings
							);
					}
				}
				else
				{
					_.each(cct_views_container, function (cct_container)
					{
						var cct_container_instance = cct_container.container
						,	parent_view_instance =  cct_container.parent;

						async_operations.push(self._updateSettings(cct_container.cct, cct_settings));

						if(!_.isEqual(first_cct_container.render_settings, render_settings))
						{
							var generator = {}
							,	container_name = cct_container.selector['data-cms-area'];

							generator[container_name] = {};
							generator[container_name][cct_instance_id] = {
								childViewIndex: 1000 + parseInt(render_settings.position, 10)
							,	childViewConstructor: null
							,	childViewInstance: cct_container_instance
							,	childViewSelector: cct_container.selector
							};

							parent_view_instance.updateChildViewInstances(generator, true);

							cct_container.render_settings = render_settings;
						}
						else
						{
							cct_container.cct.render();
						}
					});

					return jQuery.when.apply(jQuery, async_operations);
				}
			}

			return jQuery.Deferred().reject(self._createError('ERR_INVALID_INSTANCE_ID',
					_('Invalid content type instance id: $(0)').translate(cct_instance_id)));
		}

		//@method _sortCCTs Internal method to sort a list of cct to be rendered
		//@param {Array<CustomContentType.Base.View>} ccts List of ccts to be sorted
		//@private
		//@return {Array<CustomContentType.Base.View>}
	,	_sortCCTs: function _sortCCTs(ccts)
		{
			var self = this;

			// sort first by placeholder and then by position
			ccts.sort(function (cct_a, cct_b)
			{
				var cct_a_selector = self.getPlaceholder(cct_a.selector)
				,	cct_b_selector = self.getPlaceholder(cct_b.selector);

				var cct_a_key = cct_a_selector ? self.selectorToString(cct_a_selector) : ''
				,	cct_b_key = cct_b_selector ? self.selectorToString(cct_b_selector) : '';

				if (cct_a_key === cct_b_key)
				{
					return parseInt(cct_a.render_settings.position, 10) - parseInt(cct_b.render_settings.position, 10);
				}
				else
				{
					return cct_a_key < cct_b_key ? 1 : 0;
				}
			});

			return ccts;
		}

		//@method removeContent Removes a CCT from its location
		//@public
		//@param {String} cct_instance_id Unique CCT identifier
		//@param {Boolean} skip_destroy_call Indicate if should destroy the instance or not
		//@return {jQuery.Deferred}
	,	removeContent: function removeContent(cct_instance_id, destroy_call)
		{
			var cct_views_generator = this._customContentTypesInstances[cct_instance_id]
			,	async_operations = [];

			if (cct_views_generator)
			{
				_.each(cct_views_generator, function(cct_generator)
				{
					async_operations.push(cct_generator.parent.removeChildViewInstance(cct_generator.selector['data-cms-area'], cct_generator.cct.instanceId, destroy_call));
				});

				if(destroy_call)
				{
					delete this._customContentTypesInstances[cct_instance_id];
				}

				return jQuery.when.apply(jQuery, async_operations);
			}

			return jQuery.Deferred().reject(this._createError('ERR_INVALID_INSTANCE_ID', _('The specified instance id is not registered. Instance Id: $(0)').translate(cct_instance_id)));
		}

	,	getContentIds: function getContentIds()
		{
			return _.keys(this._customContentTypes);
		}

		// @method selectorToString returns the string key for a json selector
		// @param {Selector} placeholder
		// @return {String} the string key for a json selector
	,	selectorToString: function selectorToString(placeholder)
		{
			var str = '';

			_.each(placeholder, function (value, key)
			{
				str += '[' + key + '="' + value + '"]';
			});

			return str;
		}

		// @method getPlaceholder Determines if a selector already exist by comparing its JSON representation
		// @param {Selector} placeholder
		// @return {Selector} if it exist the same combination of selectors as a placeholder or undefined
	,	getPlaceholder: function getPlaceholder(placeholder)
		{
			var selector_data = _.find(placeholder_views, function(obj)
			{
				return _.isEqual(placeholder, obj.selector);
			});

			if (selector_data)
			{
				return selector_data.selector;
			}
			else
			{
				return selector_data;
			}
		}

		// @method registerViewForPlaceholder Receives all the placeholders that appear on a view and registers each one of them
		// @param {Array<Selector>} placeholders
		// @param {Backbone.View} view a backbone view
		// @return {Void}
	,	registerViewForPlaceholder: function registerViewForPlaceholder(placeholders, view)
		{
			var self = this;

			_.each(placeholders, function (selector)
			{
				var existent_selector = self.getPlaceholder(selector);

				if (existent_selector)
				{
					var key_existent = self.selectorToString(existent_selector);

					if (_.indexOf(placeholder_views[key_existent].views, view) < 0)
					{
						placeholder_views[key_existent].views.push(view);
					}
				}
				else
				{
					var key = self.selectorToString(selector);

					placeholder_views[key] = {
						selector: selector
					,	views: [view]
					};
				}
			});
		}

		// @method unregisterViewForPlaceholder removes a view from all the placeholders associations
		// @param {Backbone.View} a view
		// @return {Void}
	,	unregisterViewForPlaceholders: function unregisterViewForPlaceholders(view)
		{
			_.each(placeholder_views, function (placeholder, key, selector_views_context)
			{
				selector_views_context[key].views = _.without(placeholder.views, view);
 			});
		}

		// @method getPlaceholderViews Retrieves all the views where a placeholder appears
		// @param {string} The placeholder key
		// @return {PlaceholderViews} An object with the Selector obj and the array of views
	,	getPlaceholderViews: function getPlaceholderViews(placeholder)
		{
			return placeholder_views[placeholder] || null;
		}

		// @method getViewCctsToRerender Retrieves all the CCTs associated with a given view.
		// @param {Object} The view containing the CCTs.
		// @return {Array<Object>} An array containing CCTs related information and CCT-view instances to be re-rendered.
	,	getViewCctsToRerender: function getViewCctsToRerender(view)
		{
			if (view.template && view.template.Name)
			{
				var cct_generators = view_ccts_to_rerender[view.template.Name];

				return _.isUndefined(cct_generators) ? [] : cct_generators;
			}

			return [];
		}
	};
});

//@class Selector an obj with the form { data-cms-attr1: "placeholder1", data-cms-attr2: "placeholder2" }
//@class PlaceholderViews an obj with the form { "selector_key": selector: {Selector}, views: Array<Backbone.View>}

//@class CMSadapter.Component.CustomContentTypeStore
//A dictionary by custom content type id of all CCTs register for the running application
//@extend Dictionary<String, CustomContentType.Base.View>

//@class CMSadapter.Component.CustomerContentTypeInstance.Store
//A dictionary to store the generated CCT instances
//@extend Dictionary<String, CMSadapter.Component.CustomerContentTypeInstance.Container>

//@class CMSadapter.Component.addContent.RenderSettings
//@property {Number} position Indicate where the CCT should be inserted
