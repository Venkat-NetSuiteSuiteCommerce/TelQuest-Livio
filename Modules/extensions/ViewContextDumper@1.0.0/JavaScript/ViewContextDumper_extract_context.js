/* 
This module will hook into the render of ALL views so it extract the following information: 

 * view class name
 * template name
 * template context object 
 * selectors referenced in the view 'events' and 'bindings'

Then, on after append view it will post collected information to a local server and clean up.


IMPORTANT: For view classes name extraction to work, require.js file needs to be modified as follows:

    execCb: function (name, callback, args, exports) {
        var result = callback.apply(exports, args);
        if(result)
        {
            result.amdModuleName = name;
            result.amdCallback = callback;
        }
        return result;
    },

TODO: 

 * this probably can be done nicer with a require.js plugin. 
 * Also it could be very helpful to distribute this information for debugging views

*/
define('ViewContextDumper'
,	[	
		'Backbone.CollectionView'
	,	'Backbone'
	,	'Utils'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		BackboneCollectionView
	,	Backbone
	,	Utils
	,	_
	,	jQuery
	)
{ 
	'use strict';

	var templates = {}
	var __view_internal_id_counter = 0

	function extractBackboneSelectors(view, what)
	{
		var result = []
		_.each(view[what], function(value, key)
		{
			var selector = key.replace(/^\s*\w+\s+/, '')
			result.push(selector)
		});
		return result
	}

	function findHandleForCurrentFragment()
	{
		// return
		var historyHandles = _.filter(Backbone.history.handlers, function(handle)
		{
			return handle.route.exec(Backbone.history.fragment)
		}) 
		var maxHandle, l = 0
		_.each(historyHandles, function(handle) 
		{
			if(handle.route.toString().length > l)
			{
				l = handle.route.toString().length 
				maxHandle = handle
			}
		})
		return maxHandle || {'route': 'INTERNALNOTFOUND'}
	}

	var currentRouterClass
	var backbone_router_route_original = Backbone.Router.prototype.execute
	Backbone.Router.prototype.execute = function()
	{
		currentRouterClass = this.constructor.amdModuleName
		var result = backbone_router_route_original.apply(this, arguments)
		return result
	}

	return {
		mountToApp: function(application)
		{
			SC.dontSetRequestHeaderTouchpoint = true
			
			Backbone.View.postRender.install({
				name: 'viewcontextdumper-install'
			,	execute: function($el, view)
				{
					templates[view.template.Name] = templates[view.template.Name] || []
					var context = view.getContext ? view.getContext() : {}

					// var contextMetadata = extractObjectTypes(context, true)
					var data = {
						template: view.template.Name
					// ,	viewName: view.constructor.amdModuleName
					,	context: context
					// ,	contextMetadata: contextMetadata
					// ,	renderedTemplate: view.$el.html()
					}
					templates[view.template.Name].push(data)
				}
			})

			// we post the data of this navigation on after append view
			application.getLayout().on('afterAppendView', function()
			{
				setTimeout(
				function()
				{
					var data = {
						fragment: Backbone.history.fragment || '/'
					,	routerRoute: findHandleForCurrentFragment() ? findHandleForCurrentFragment().route.toString() : 'INTERNALNOTFOUND'
					,	routerClass: currentRouterClass
					,	data: templates
					}
					var dataStr 

					try
					{
						dataStr = JSON.stringify(data, function(key, value)
						{
							if(value instanceof Backbone.View)
							{
								return undefined
							}
							return value
						})
					}
					catch(ex)
					{
						delete data.data
						data.error = ex+''
						dataStr = JSON.stringify(data)
						console.log(ex)
					}
					console.log(_.find(_.keys(templates), function(t){return t.indexOf('requestquote_wizard_module_items_line_actions')!=-1}))

					var domain = 'crawler.aog.uy'

					jQuery.post('http://'+domain+':8080/post',  dataStr).done(function()
					{	
						// console.log()
						templates = {}
					})

				}, 2500)
			})
		}
	}
});


// jQuery.post('http://localhost:8080/post', JSON.stringify({a:4, b: [1,2,3]})).done(function()
// {
// 	templates = {}
// })
					// console.log(templates)
					// console.log(_.keys(templates).length, _.keys(templates))
					// // isCyclic(templates)
					// _.each(templates, function(t, name)
					// {
					// 	try
					// 	{
					// 		JSON.stringify(t, function(key, value)
					// 		{
					// 			if(value instanceof Backbone.View)
					// 			{
					// 				return undefined
					// 			}
					// 			return value
					// 		})
					// 	}
					// 	catch(ex)
					// 	{
					// 		debugger;
					// 		console.log('ERRRR in ', name, t)
					// 	}
					// })

					// try
					// {

	// }
					// catch(ex)
					// {
					// 	debugger;
					// }




// var MAXLEVEL = 10
// PROP_NOT_VALID = '___prop_not_valid_9828211__'
// function myStringify(o, level)
// {
// 	var value
// 	level = level || 0
// 	if(level>MAXLEVEL)
// 	{
// 		return 'null'
// 	}
// 	var s, a = []
// 	if(_.isNumber(o))
// 	{
// 		return o+''
// 	}
// 	if(_.isString(o))
// 	{
// 		return '"'+o+'"'
// 	}
// 	else if(_.isBoolean(o))
// 	{
// 		return o ? 'true' : 'false'
// 	}
// 	else if(_.isArray(o))
// 	{
// 		for (var i = 0; i < o.length; i++) 
// 		{
// 			value = myStringify(o[i], level+1)
// 			if(value!=PROP_NOT_VALID)
// 			{
// 				a.push(value)
// 			}
// 		}
// 		return '[' + a.join(', ') + ']'
// 	}
// 	else if(_.isObject(o))
// 	{
// 		if(o instanceof Backbone.Model)
// 		{
// 			o = o.attributes
// 		}
// 		for(var i in o)
// 		{
// 			value = myStringify(o[i], level+1)
// 			if(value!=PROP_NOT_VALID)
// 			{
// 				a.push('"'+i+'": ' + value)
// 			}
// 		}
// 		return '{'+a.join(',')+'}'
// 	}
// 	else if(_.isUndefined(o))
// 	{
// 		return 'null'
// 	}
// 	else if(o===null)
// 	{
// 		return 'null'
// 	}
// 	else
// 	{
// 		return PROP_NOT_VALID
// 	}
// }

// object exploration and types
// function getJsType(o)
// {
// 	var result
// 	if(o && o.constructor && o.constructor.amdModuleName)
// 	{
// 		result = o.constructor.amdModuleName
// 	}
// 	else if(_.isString(o))
// 	{
// 		result = 'String'
// 	}
// 	else if(_.isNumber(o))
// 	{
// 		result = 'Number'
// 	}
// 	else if(_.isBoolean(o))
// 	{
// 		result = 'Boolean'
// 	}
// 	else if(_.isArray(o))
// 	{
// 		result = 'Array'
// 	}
// 	else if(_.isObject(o))
// 	{
// 		result = 'Object'
// 	}
// 	else
// 	{
// 		result = 'undefined'
// 	}
// 	return result
// }


// function extractObjectTypes(o, recurse)
// {
// 	var result = {}
// 	_.each(o, function(value, key)
// 	{
// 		var type = getJsType(value)
// 		result[key] = {
// 			name: key
// 		,	value: value
// 		,	type: type
// 		}
// 		// if(recurse && (type=='Object' || value && value.constructor && value.constructor.amdModuleName)) 
// 		// {
// 		// 	result[key].objectType = extractObjectTypes(value, true)
// 		// }
// 		// else if(recurse && (type=='Array' && recurse && value && value.length))
// 		// {
// 		// 	result[key].objectType = extractObjectTypes(value[0], true)
// 		// }
// 	})
// 	return result
// }

// function isCyclic (obj) 
// {
// 	var seenObjects = [];

// 	function detect (obj) {
// 	if (obj && typeof obj === 'object') {
// 	  if (seenObjects.indexOf(obj) !== -1) {
// 	    return true;
// 	  }
// 	  seenObjects.push(obj);
// 	  for (var key in obj) {
// 	    if (obj.hasOwnProperty(key) && detect(obj[key])) {
// 	      console.log(obj, 'cycle at ' + key);
// 	      return true;
// 	    }
// 	  }
// 	}
// 	return false;
// 	}

// 	return detect(obj);
// }
