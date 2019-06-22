/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ApplicationSkeleton
// Defines the top level components of an application like the name, layout, or the start function
define('ApplicationSkeleton'
,	[	'ApplicationSkeleton.Layout'
	,	'SC.ComponentContainer'
	,	'underscore'
	,	'Backbone'
	,	'Utils'
	,	'Console.Polyfill'
	,	'json2'
	]
,	function (
		Layout
	,	SCComponentContainer
	,	_
	,	Backbone
	,	Utils
	)
{
	'use strict';

	// @class ApplicationSkeleton Defines the top level components of an application like the name, layout, or the start function
	// @extends Backbone.Events
	// @constructor Enforces new object to be created even if you do ApplicationSkeleton() (without new) @param {String} name
	function ApplicationSkeleton (name)
	{
		if (!(this instanceof ApplicationSkeleton))
		{
			return new ApplicationSkeleton();
		}

		// @property {SCA.Configuration} Application Default settings
		this.Configuration = {};

		// @property {String} name the name of this application instance
		this.name = name;

		// @property {Array<Any>} _modulesMountToAppResult stores the results of each modules mountToApp method call
		// @private
		this._modulesMountToAppResult = [];
	}

	// @method resizeImage Wraps the Utils.resizeImage and passes in the settings it needs
	// @param {String} url
	// @param {String} size
	ApplicationSkeleton.prototype.resizeImage = function (url, size)
	{
		url = url || _.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', this.getConfig('imageNotAvailable'));
		var mapped_size = this.getConfig('imageSizeMapping.'+ size, size);
		return Utils.resizeImage(this.getConfig('siteSettings.imagesizes', []), url, mapped_size);
	};


	// @property {ApplicationSkeleton.Layout} Layout
	// This View will be created and added to the dom as soon as the app starts.
	// All module's views will get into the dom through this view by calling either showContent, showContent
	ApplicationSkeleton.prototype.Layout = Layout;

	// @method getLayout @returns {ApplicationSkeleton.Layout}
	ApplicationSkeleton.prototype.getLayout = function getLayout ()
	{
		this._layoutInstance = this._layoutInstance || new this.Layout(this);
		return this._layoutInstance;
	};


	// @method getConfig
	// @returns {Any} the configuration object of the aplication
	// if a path is applied, it returns that attribute of the config
	// if nothing is found, it returns the default value
	// @param {String} path
	// @param {String} default_value
	ApplicationSkeleton.prototype.getConfig = function getConfig (path, default_value)
	{
		return Utils.getPathFromObject(this.Configuration, path, default_value);
	};

	// @method start starts this application by mounting configured modules and triggering events 'afterModulesLoaded' and 'afterStart'
	// @param {Array<SubClassOf<ApplicationModule>>}
	// @param {Array<SubClassOf<ApplicationModule>>} modules
	// @param {Function} done_fn the handler to be called once the application finish starting
	ApplicationSkeleton.prototype.start = function start (modules, done_fn)
	{
		// @event beforeStart triggered before loading modules so users have a chance to include new modules at this point.
		this.trigger('beforeStart', self);

		var self = this;

		// @property {Array<SubClassOf<ApplicationModule>>} modules We set the modules to the application the keys are the modules_list (names)
		// and the values are the loaded modules returned in the arguments by require.js
		self.modules = modules;

		var mount_to_app_result = {};

		// we mount each module to our application
		_.each(self.modules, function (module)
		{
			if (module && _.isFunction(module.mountToApp))
			{
				mount_to_app_result = module.mountToApp(self);

				if (mount_to_app_result && mount_to_app_result.componentName)
				{
					self.registerComponent(mount_to_app_result);
				}
				else
				{
					self._modulesMountToAppResult.push(mount_to_app_result);
				}
			}
		});

		// This checks if you have registered modules
		if (!Backbone.history)
		{
			throw new Error('No Backbone.Router has been initialized (Hint: Are your modules properly set?).');
		}

		// @event afterModulesLoaded triggered after all modules have been loaded
		self.trigger('afterModulesLoaded', self);

		done_fn && _.isFunction(done_fn) && done_fn(self);

		// @event afterStart triggered after the application finish starting and after the start() callback is called.
		self.trigger('afterStart', self);
	};

	// We allow ApplicationSkeleton to listen and trigger custom events
	// http://backbonejs.org/#Events
	_.extend(ApplicationSkeleton.prototype, Backbone.Events, SCComponentContainer);

	return ApplicationSkeleton;
});

// @class ApplicationModule An Application is mainly composed by modules, and those can be mounted to an application
// instance by implementing a mountToApp it is the entry point of an application module. When the application start() it
// will mount all its configured modules using that method.
// @method mountToApp A module mounts itself in a given application instance, for example, initialize some Backbone.Routers
// @param {ApplicationSkeleton}

// @class Dictionary<Key, Value> This class is used when we define a key/value pair (hashtable),
// the latter being a function. For example: ChildViews