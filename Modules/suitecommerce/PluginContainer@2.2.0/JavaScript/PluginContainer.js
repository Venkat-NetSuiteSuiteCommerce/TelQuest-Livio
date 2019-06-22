/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PluginContainer Defines the architecture to extend module through plugins
define('PluginContainer'
,	[
		'underscore'
	]
,	function (
		_
	)
{
	'use strict';

	// @class PluginContainer The PluginContainer pattern is very similar to events listeners pattern but
	// designed to let listeners hook more appropiately into some processing. One or more Plugin objects
	// are installed into a PluginContainer and the owner of the container runs container.executeAll()
	// Registered plugins will be then executed by priority order and if any input is passed it will transformed
	var PluginContainer = function ()
	{
		this.initialize();
	};

	_(PluginContainer.prototype).extend(
	{
		// @method initialize
		initialize: function()
		{
			this.plugins = [];
		}

		// @method executeAll execute all registered plugins The first param is the
		// input and the rest of the params will be passed to Plugin's execute method.
		// @param {Any} input. Optional. The input that plugins will take and transform.
		// @return {Any} the output, if any
	,	executeAll: function ()
		{
			var args = Array.prototype.slice.call(arguments, 0);

			_(this.plugins).each(function (p)
			{
				args[0] = p.execute.apply(p, args) || args[0];
			});

			return args[0];
		}

		// @method executeAllWithContext execute all registered plugins The first param is the
		// context and the rest of the params will be passed to Plugin's execute method.
		// @param {Any} context. Optional. The context that plugins will take and transform.
		// @return {Any} the output, if any
	,	executeAllWithContext: function ()
		{
			var context = arguments[0]
			,	args = Array.prototype.slice.call(arguments, 1);

			_(this.plugins).each(function (p)
			{
				args[0] = p.execute.apply(context || p, args) || args[0];
			});

			return args[0];
		}

	,	_getPluginName: function (plugin)
		{
			return _(plugin).isString() ? plugin : plugin.name;
		}

		// @method install add a new plugin 
		// @param {Plugin} plugin
		// @return {Void}
	,	install: function (plugin)
		{
			this.plugins.push(plugin);
			this.plugins = _(this.plugins).sort(function (a,b)
			{
				return a.priority < b.priority ? 1 : -1;
			});
		}

		//@method uninstall Remove an installed plugin 
		// @param {Plugin|String} plugin
		// @return {Void}
	,   uninstall: function uninstall (plugin)
		{
			var name = this._getPluginName(plugin);
			this.plugins = _(this.plugins).reject(function(p)
			{
				return p.name===name;
			});
		}
	});

	return PluginContainer;
});

// @class Plugin installable in a PluginContainer. There is no concrete API, only an execute method and
// It's up to the users to define de Plugin semantics @property {String} name used to identify the plugins in the container
// @property {Number} priority lower numbers will execute before higher numbers
// @method {Function} execute @param {Any} input @return {Any} pugins have the possibility of
// @return {Any} will do some modifications to any passed object and will return these modifications - implementer freedom
