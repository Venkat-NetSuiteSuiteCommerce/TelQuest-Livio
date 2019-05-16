/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module SC
define('SC.ComponentContainer'
,	[
		'underscore'
	]
,	function (
		_
	)
{
	'use strict';

	// @method sealComponent helper method to avoid that customers overwrite the component
	// properties
	// @param {SC.Component} component component to be sealed
	// @param {String} component_name the component name
	// @private
	function sealComponent(component, component_name)
	{
		_.each(component, function(value, prop)
	    {
	        Object.defineProperty(component, prop, {
	            get: function()
            	{
            		return value;
            	}
	        ,   set: function()
	        	{
	        		throw new Error('You cannot override property ' + prop + ' of component '+ component_name);
	        	}
	        });
	    });

	    return component;
	}

	// @class SC.ComponentContainer
	return {

		// @property {Object} _components All the SC.Components loaded into the current application
		// @private
		_components: {}

		// @method registerComponent Allows to register a new component into the running application
		// it also seals the component, so as to not add new properties or messing up with the available
		// components APIs.
		// @param {SC.Component} component Component to be registered
		// @public
		// @return {Void}
	,	registerComponent: function registerComponent(component)
		{
			if (component && component.componentName)
			{

				this._components[component.componentName] = sealComponent(component, component.componentName);
				return;
			}

			throw {
				status: SC.ERROR_IDENTIFIERS.invalidParameter.status
			,	code: SC.ERROR_IDENTIFIERS.invalidParameter.code
			,	message: 'Invalid component parameter, make sure you specify a componentName property and getProxy method'
			};
		}

		// @method getComponent Returns the requested component based on its name if it exists
		// @public
		// @param {String} component_name
		// @return {SC.Component|null}
	,	getComponent: function getComponent(component_name)
		{
			return this._components[component_name] || null;
		}
	};

});

// @class SC.ComponentContainer contains all the component instances available in the application
// @property {Object} _components