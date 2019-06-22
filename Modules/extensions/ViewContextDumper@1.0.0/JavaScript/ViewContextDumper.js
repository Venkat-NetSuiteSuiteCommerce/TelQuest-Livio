/* 
This module will hook into the render of ALL views so it extract the following information: 

 * view class name
 * template name
 * template context object 
 * selectors referenced in the view 'events' and 'bindings'

Then, on after append view it will post collected information to a local server and clean up.


IMPORTANT: For view classes name extraction to work, require.js file needs to be modified as follows:

    execCb: function (name, callback, args, exports) {
        var result = callback.apply(exports, args)
        if(result)
        {
            result.amdModuleName = name
            result.amdCallback = callback
        }
        return result
    },

TODO: 

 * this probably can be done nicer with a require.js plugin. 
 * Also it could be very helpful to distribute this information for debugging views

*/
define('ViewContextDumper'
,	[	
		'Backbone.CollectionView'
	,	'Backbone'
	,	'ApplicationSkeleton.Layout'
	,	'Wizard.View'
	,	'Wizard.Step'
	,	'Wizard.Module'
	,	'OrderWizard.Module.Address'
	,	'ItemRelations.Related.View'
	,	'RecentlyViewedItems.View'
	,	'PaymentWizard.Module.PaymentMethod.Selector'
	,	'OrderWizard.Module.PaymentMethod.Selector'
	,	'allHandlebarsHelpers.tpl'
	,	'Utils'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		BackboneCollectionView
	,	Backbone
	,	ApplicationSkeletonLayout
	,	WizardView
	,	WizardStep
	,	WizardModule
	,	AddressModule
	,	ItemRelations
	,	RecentlyViewedItems
	,	PaymentWizardModulePaymentMethodSelector
	,	OrderWizardModulePaymentMethodSelector
	,	allHandlebarsHelpers_tpl
	,	Utils
	,	_
	,	jQuery
	)
{ 
	'use strict'

	
	function extractBackboneSelectors(view, what)
	{
		var result = []
		_.each(view[what], function(value, key)
		{			
			result.push(key)
		})
		return result
	}

	function extractViewContract(view, templatesCollection)
	{
		//get child views information
		var childViewsContract = {}
		_.each(view.childViewInstances, function(childView, key)
		{
			childViewsContract[key] = childViewsContract[key] || {}
			_.each(childView, function(vv, vkey)
			{
				if(vv.childViewInstance)
				{
					childViewsContract[key][vkey] = extractViewContract(vv.childViewInstance, templatesCollection)
				}
				else
				{
					childViewsContract[key][vkey] = null;
				}
			})	
		})	

		var viewContract = {
			template: view.template && view.template.Name || 'undefined'
		,	eventSelectors: extractBackboneSelectors(view, 'events')
		,	bindingSelectors: extractBackboneSelectors(view, 'bindings')
		,	context: view.backwardCompatibilityContext || {}
		,	viewName: view.constructor.amdModuleName
		,	childViewsContract: childViewsContract
		
		,	$selectors: _.unique(view.backwardCompatibility$selectors)
		,	viewAttributes: view.constructor.prototype.attributes || {}				
		}
		
		//Get information of a wizard		
		if (view instanceof WizardView)
		{
			viewContract.currentStep = extractViewContract(view.currentStep, templatesCollection)
		}
		
		if (view instanceof WizardStep)
		{
				viewContract.modules = []
				_.each(view.moduleInstances, function(moduleInstance)
				{
					if(moduleInstance.backwardCompatibilityContext)
					{
						viewContract.modules.push(extractViewContract(moduleInstance, templatesCollection))
					}
				})
		}
		//get cell information from a Collection view		
		if(view instanceof BackboneCollectionView)
		{	
			viewContract.childCell = []
			viewContract.rowTemplate = view.rowTemplate ? view.rowTemplate.Name : null
			viewContract.cellTemplate = view.cellTemplate ? view.cellTemplate.Name : null
			templatesCollection.push(viewContract.rowTemplate)
			templatesCollection.push(viewContract.cellTemplate)
			if(view.childCells && view.childCells.length > 0)
			{
				_.each(view.childCells, function(childCellInstance)
				{
					viewContract.childCell.push(extractViewContract(childCellInstance, templatesCollection))
				})
			}
		}

		if(view instanceof WizardModule)
		{	
				viewContract.modules = []
				_.each(view.modules, function(moduleInstance)
				{
					if(moduleInstance.backwardCompatibilityContext)
					{
						viewContract.modules.push(extractViewContract(moduleInstance.instance, templatesCollection))
					}
				})	
		}


		templatesCollection.push(viewContract.template)
		return viewContract
	}


	function dumpData(layout, inModal)
	{
		var templatesCollection = []

		var currentFragment = Backbone.history.fragment
		
		var handleForCurrentFragment = findHandleForCurrentFragment()
		var data = {
			fragment: currentFragment || '/'
		,	routerRoute: handleForCurrentFragment ? handleForCurrentFragment.route.toString() : ''
		,	routerClass: currentRouterClass
		,	application: _.keys(SC._applications)[0]		
		,	branch: getBranch()
		,	viewName: layout.constructor.amdModuleName
		,	layoutContract: extractViewContract(layout, templatesCollection)
		}
		
		//The value of the currentModalView and the value of the current view is the same if the view is going to appear 
		//in a modal view
		
		if(inModal)
		{			
			data.layoutContract.currentModalView = extractViewContract(layout.backwardCompatibilityCurrentModalView, templatesCollection)
		}
		else
		{
			data.layoutContract.currentViewContract = extractViewContract(layout.getCurrentView(), templatesCollection)
		}

		data.templatesCollection = _.uniq(templatesCollection)

		post('router', data)
	}

	// routes inspection

	function findHandleForCurrentFragment()
	{
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
		return maxHandle
	}
	var currentRouterClass
	var backbone_router_route_original = Backbone.Router.prototype.execute
	Backbone.Router.prototype.execute = function()
	{
		currentRouterClass = this.constructor.amdModuleName
		var result = backbone_router_route_original.apply(this, arguments)
		return result
	}






	function getBranch()
	{
		return typeof(INTRUMENT_BC_ARGUMENT)=='undefined' ? 'default' : INTRUMENT_BC_ARGUMENT
	}







	// serialization and http post

	function stringify(obj, replacer, spaces, cycleReplacer) 
	{
	  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
	}	
	function serializer(replacer, cycleReplacer) 
	{
		var stack = [], keys = []

		if (cycleReplacer == null) cycleReplacer = function(key, value) 
		{
			if (stack[0] === value) return "[Circular ~]"
			return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
		}

		return function(key, value) 
		{
			if (stack.length > 0) 
			{
				var thisPos = stack.indexOf(this)
				~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
				~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
				if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
			}
			else 
			{
				stack.push(value)
			}

			return replacer == null ? value : replacer.call(this, key, value)
		}
	}
	function post(action, dataString)
	{
		var branch = getBranch()
		var server = typeof(INTRUMENT_BC_SERVER)=='undefined' ? 'localhost:8080' : INTRUMENT_BC_SERVER
		jQuery.post('http://' + server + '/' + branch + '/' + action + '/' , stringify(dataString))
		.fail(function(error)
		{
			if (error.status == 400)
			{
				var errorWithMoreData = {"error": error.responseText, "fragment": dataString.fragment, "routerRoute": dataString.routerRoute,
					"routerClass":  dataString.routerClass,  "application": dataString.application,
					"branch": dataString.branch, "viewName": dataString.viewName
				}
				jQuery.post('http://' + server + '/' + branch + '/dumpererrors/' ,  stringify(errorWithMoreData)).fail(function(error){
					jQuery.post('http://' + server + '/' + branch + '/dumpererrors/' ,  error.responseText)

				})
			}
		})
	}








	function extractAndPostHandlebarsHelpersData()
	{
		// for {{#each}} helper we will need to mock several kind of collections to also test the compiled extensino for backbone model & collections
		var tplContextEach3 = new Backbone.Collection()
		var arrayOfModels = [new Backbone.Model({a: 1}), new Backbone.Model({a: 2}), new Backbone.Model({a: 3})]
		tplContextEach3.reset(arrayOfModels)
		var tplContext = {
			each1: [1,2,3],
			each2: arrayOfModels,
			each3: tplContextEach3,
			objectToAttributesData1: {a: 1, b: 'hello world'}
		}
		var output = allHandlebarsHelpers_tpl(tplContext)

		console.log('output', output)
		
		post('handlebarsHelpers', output)
	}








	return {
		mountToApp: function(application)
		{
			SC.dontSetRequestHeaderTouchpoint = true // IMPORTANT: We need to prevent the application to set the custom http response header
			//extractAndPostHandlebarsHelpersData()
			
			Backbone.View.prototype.getTemplateContext = _.wrap(Backbone.View.prototype.getTemplateContext, function(fn)
			{				
				var args = Array.prototype.slice.call(arguments, 1)

				var context = fn.apply(this, args)

				this.backwardCompatibilityContext = context
				//get jquery selectors
				//TODO check this implemetation, probably not all the selectors are recoverd using this method
				//some of them are used only with user interaction.
				var this_$_original = this.$
				this.$ = function(selector)
				{
					if(selector && _.isString(selector))
					{
						this.backwardCompatibility$selectors = this.backwardCompatibility$selectors || []
						this.backwardCompatibility$selectors.push(selector)
					}
					return this_$_original.apply(this, arguments)
				}

				/*
				var this_$el_find_original = this.$el.find
				this.$el.find = function()
				{
					return this_$el_find_original.apply(this, arguments)
				}
				*/

				return context
			})
						
			ApplicationSkeletonLayout.prototype._showContent = _.wrap(ApplicationSkeletonLayout.prototype._showContent, function(fn, view)
			{
				var args = Array.prototype.slice.call(arguments, 1)				
				var promise = fn.apply(this, args)
				var self = this
				//this is required to avoid to send duplicate data
				if(!view.inModal)
				{					
					promise.done(function()
					{
						dumpData(self)
					})	
				}			
				return promise

			});

			//this is necessary to get access to the modal view instance
			application.getLayout()._renderModalView = _.wrap(application.getLayout()._renderModalView, function(fn)
			{

				var args = Array.prototype.slice.call(arguments, 1)
				//store the ModalView in the layout instance
				this.backwardCompatibilityCurrentModalView = args[1]

				fn.apply(this, args)
			})

			application.getLayout().showInModal = _.wrap(application.getLayout().showInModal, function(fn)
			{
				var args = Array.prototype.slice.call(arguments, 1)				
				var promise = fn.apply(this, args)	
				
				var self = this
				promise.done(function()
					{dumpData(self, true)})				
				
				return promise
			})


			ItemRelations.prototype.loadRelatedItem = _.wrap(ItemRelations.prototype.loadRelatedItem, function(fn)
			{
				var args = Array.prototype.slice.call(arguments, 1)				
				var promise = fn.apply(this, args)	
				var self = this
				dumpData(this.options.application.getLayout())				
			})

			AddressModule.prototype.changeAddress = _.wrap(AddressModule.prototype.changeAddress, function(fn, view)
			{
				var args = Array.prototype.slice.call(arguments, 1)				
				var promise = fn.apply(this, args)
				var self = this
				dumpData(this.wizard.application.getLayout())	
			})

			RecentlyViewedItems.prototype.loadRecentlyViewedItem = _.wrap(RecentlyViewedItems.prototype.loadRecentlyViewedItem, function(fn, view)
			{
				var args = Array.prototype.slice.call(arguments, 1)				
				var promise = fn.apply(this, args)
				var self = this
				dumpData(this.options.application.getLayout())	
			})

			OrderWizardModulePaymentMethodSelector.prototype.render = _.wrap(OrderWizardModulePaymentMethodSelector.prototype.render, function(fn, view){
				var args = Array.prototype.slice.call(arguments, 1);				
				var promise = fn.apply(this, args);
				var self = this;
				dumpData(this.options.wizard.application.getLayout());	
			});

			PaymentWizardModulePaymentMethodSelector.prototype.render = _.wrap(PaymentWizardModulePaymentMethodSelector.prototype.render, function(fn, view){
				var args = Array.prototype.slice.call(arguments, 1);				
				var promise = fn.apply(this, args);
				var self = this;
				dumpData(this.options.wizard.application.getLayout());	
			});

		}
	}

})