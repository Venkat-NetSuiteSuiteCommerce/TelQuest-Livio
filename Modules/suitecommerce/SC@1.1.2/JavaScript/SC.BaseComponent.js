/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module SC
define('SC.BaseComponent'
,	[
		'underscore'
	,	'SC.CancelableEvents'
	,	'Utils'
	]
,	function (
		_
	,	SCCancelableEvents
	,	Utils
	)
{
	'use strict';

	//@class SC.BaseComponent
	var base_component = _.extend({

		//@method extend Extends the current component to generate a child one
		//@param {Object} child_component Any object with properties/methods that will be used to generate the SC.Component that will be returned
		//@return {SC.Component}
		extend: function extend (child_component)
		{
			if (!child_component || !child_component.componentName || !child_component.application)
			{
				return this._reportError('INVALID_PARAM', 'Invalid SC.Component. Property "componentName" and "application" are required.');
			}

			this.application = child_component.application;

			var new_component = _.extend({}, this, child_component);

			new_component.application.getLayout().cancelableOn('beforeAppendView', _.bind(new_component._onApplicationBeforeView, new_component));
			new_component.application.getLayout().on('afterAppendView', _.bind(new_component._onApplicationAfterAppendView, new_component));

			return new_component;
		}

		//@method _onApplicationBeforeView Internal method used to automatically notify when views of the current component are about to be shown (BEFORE append view)
		//@private
		//@param {Backbone.View} view The view that will be shown
		//@return {jQuery.Deferred|Void}
	,	_onApplicationBeforeView: function _onApplicationBeforeView (view)
		{
			if (this._isViewFromComponent(view, true))
			{
				try
				{
					var self = this;
					this.viewToBeRendered = view;
					//@event {Void} showContent Trigger after a PDP is rendered.
					//@public
					return this.cancelableTrigger('beforeShowContent', this._getViewIdentifier(view))
						.always(function(){
							self.viewToBeRendered = null;
						});
				}
				catch(e)
				{
					this.viewToBeRendered = null;
					throw e;
				}
			}
		}

		//@method _onApplicationAfterAppendView Internal method used to automatically notify when views of the current component where shown (AFTER append view)
		//@private
		//@param {Backbone.View} view The view that was shown
		//@return {Void}
	,	_onApplicationAfterAppendView: function _onApplicationAfterAppendView (view)
		{
			if (this._isViewFromComponent(view, true))
			{
				this.viewToBeRendered = null;
				//@event {Void} afterShowContent Trigger after a PDP is rendered.
				//@public
				this.cancelableTrigger('afterShowContent', this._getViewIdentifier(view));
			}
		}

		//@method _getViewIdentifier Given a view that belongs to the current component, returns the "type"/"kind" of view. This is used to determine what view among all the view of the current component is being shown
		//@param {Backbone.View} view
		//@return {String}
	,	_getViewIdentifier: function _getViewIdentifier ()
		{
			return 'CURRENT_VIEW';
		}

		//@method _reportError Internal method used to centrally handle error reporting
		//@private
		//@param {String} code Error code
		//@param {String} description Error description
		//@return {Error}
	,	_reportError: function _reportError (code, description)
		{
			var error = new Error(description);
			error.name = code;
			throw error;
		}

		//@method _isViewFromComponent Indicate if the passed-in the View is a View of the current component.
		//The aim of this method is to be overwritten
		//@private
		//@param {Backbone.View} view Any view of the system
		//@param {Boolean} is_instance Indicate if the passed in view is an instance or a constructor function.
		//@return {Boolean} True in case the passed in View is a view of the current Component, false otherwise
	,	_isViewFromComponent: function _isViewFromComponent ()
		{
			return false;
		}

		//@method setChildViewIndex Change the positon of a Child View inside a container
		//@public
		//@param {String} view_id The identifier of the view, of the current component, that will have the Child View to change the index
		//@param {String} placeholder_selector Identifier of the location where the view is located inside the specified View (view_id)
		//@param {String} view_name Identifier of an expecific view into the placeholder
		//@param {Number} index The new index to position the Child View
		//@return {null} null if everything works as expected. An exception will be thrown otherwise.
	,	setChildViewIndex: function setChildViewIndex(view_id, placeholder_selector, view_name, index)
		{
			var target_view = Utils.requireModules(view_id);
			this._setChildViewIndex(target_view, placeholder_selector, view_name, index);
		}

	,	_setChildViewIndex: function _setChildViewIndex(view, placeholder_selector, view_name, index)
		{
			if (view && _.isFunction(view.setChildViewIndex) && this._isViewFromComponent(view, false))
			{
				view.setChildViewIndex(placeholder_selector, view_name, index);

				return null;
			}
			return this._reportError('INVALID_PARAM', 'The specified view_id is not valid for the current component.');
		}

		//@method addChildViews Adds a child view/child views given by the child_views parameter into the specified view of the current component
		//@public
		//@param {String} view_id The identifier of the view, of the current component, that will be extended with an extra/s child view/s
		//@param {ChildViews} child_views Identifier of the location where the new view will be located inside the specified View (view_id)
		//@return {null} null if everything works as expected. An exception will be thrown otherwise.
	,	addChildViews: function addChildViews (view_id, child_views)
		{
			var target_view = Utils.requireModules(view_id);
			return this._addChildViews(target_view, child_views);
		}

	,	_addChildViews: function _addChildViews (view, child_views)
		{
			if (view && _.isFunction(view.addChildViews) && this._isViewFromComponent(view, false))
			{
				view.addChildViews(child_views);

				return null;
			}
			this._reportError('INVALID_PARAM', 'The specified view_id is not valid for the current component or the view_constructor is not a function.');
		}

		//@method removeChildView Removes a child view for a given view id
		//@public
		//@param {String} view_id The identifier of the view, of the current component, that will be extended with an extra child view
		//@param {String} placeholder_selector Identifier of the location where the new view will be located inside the specified View (view_id)
		//@param {string} view_name Identifier of an expecific view into the placeholder
		//@return {null} null if everything works as expected. An exception will be thrown otherwise.
	,	removeChildView: function removeChildView (view_id, placeholder_selector, view_name)
		{
			var target_view = Utils.requireModules(view_id);
			this._removeChildView(target_view, placeholder_selector, view_name);
		}

	/*
	,	removeChildViewInstance: function removeChildViewInstance (placeholder_selector, view_name)
		{
			var target_view = this.viewToBeRendered || this.application.getLayout().getCurrentView();
			this._removeChildView(target_view, placeholder_selector, view_name);
		}
	*/

	,	_removeChildView: function removeChildView (view, placeholder_selector, view_name)
		{
			if (view && _.isFunction(view.removeChildView) && this._isViewFromComponent(view, false))
			{
				view_name = view_name || placeholder_selector;
				view.removeChildView(placeholder_selector, view_name);

				return null;
			}
			return this._reportError('INVALID_PARAM', 'The specified view_id is not valid for the current component.');
		}

		//@method addToViewContextDefinition Adds an extra property to the UI context of a view id to extend the interaction with its template
		//@public
		//@param {String} view_id The identifier of the view, of the current component, that will have its context extended.
		//@param {String} property_name Name of the new property to be added
		//@param {String} type Name of the type of the result of the callback (function that generates the value of the new property)
		//@param {Function} callback Function in charge of generating the value for the new property.
		//@return {null} null if everything works as expected. An exception will be thrown otherwise.
	,	addToViewContextDefinition: function addToViewContextDefinition (view_id, property_name, type, callback)
		{
			var target_view = Utils.requireModules(view_id);

			if (target_view && _.isFunction(target_view.addExtraContextProperty) && _.isFunction(callback) && this._isViewFromComponent(target_view, false))
			{
				target_view.addExtraContextProperty(property_name, type, callback);
			}
			else
			{
				return this._reportError('INVALID_PARAM', 'The specified view_id ('+view_id+') is not valid for the current component or the callback is not a function.');
			}
		}

		//@method removeToViewContextDefinition Removes an extra property to the UI context of a view.
		//@public
		//@param {String} view_id The identifier of the view, of the current component, that will have its context extended.
		//@param {String} property_name Name of the new property to be added
		//@return {null} null if everything works as expected. An exception will be thrown otherwise.
	,	removeToViewContextDefinition: function removeToViewContextDefinition (view_id, property_name)
		{
			var target_view = Utils.requireModules(view_id);

			if (target_view && _.isFunction(target_view.removeExtraContextProperty) && this._isViewFromComponent(target_view, false))
			{
				target_view.removeExtraContextProperty(property_name);
			}
			else
			{
				return this._reportError('INVALID_PARAM', 'The specified view_id ('+view_id+') is not valid for the current component or operation.');
			}
		}

		//@method addToViewEventsDefinition Allows to add an extra event handler over a particular view for the given event selector
		//@public
		//@param {String} view_id The identifier of the view, of the current component, that will be extended with an extra event handler.
		//@param {String} event_selector
		//@param {Function} callback Event handler function called when the specified event occurs
		//@return {Void}
	,	addToViewEventsDefinition: function addToViewEventsDefinition (view_id, event_selector, callback)
		{
			var target_view = Utils.requireModules(view_id);

			if (!target_view || !_.isFunction(target_view.addExtraEventHandler) || !this._isViewFromComponent(target_view, false) || !_.isFunction(callback))
			{
				return this._reportError('INVALID_PARAM', 'The specified view_id ('+view_id+') is not valid for the current component or operation, or the callback parameter is not a function.');
			}
			else
			{
				target_view.addExtraEventHandler(event_selector, callback);
			}
		}

		//@method removeToViewEventsDefinition Allows to remove and an extra event handler added previously.
		//@public
		//@param {String} view_id The identifier of the view, of the current component.
		//@param {String} event_selector
		//@return {Void}
	,	removeToViewEventsDefinition: function removeToViewEventsDefinition (view_id, event_selector)
		{
			var target_view = Utils.requireModules(view_id);

			if (!target_view || !_.isFunction(target_view.addExtraEventHandler) || !this._isViewFromComponent(target_view, false))
			{
				return this._reportError('INVALID_PARAM', 'The specified view_id ('+view_id+') is not valid for the current component or operation, or the callback parameter is not a function.');
			}
			else
			{
				target_view.removeExtraEventHandler(event_selector);
			}
		}

	}, SCCancelableEvents);

	//Methods alias
	base_component.on = base_component.cancelableOn;
	base_component.off = base_component.cancelableOff;

	return base_component;
});

//@class SC.Component @extend SC.BaseComponent
//@property {String} componentName
//@property {ApplicationSkeleton} application
