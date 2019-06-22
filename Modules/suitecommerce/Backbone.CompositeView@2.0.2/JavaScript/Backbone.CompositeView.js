/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module Backbone.CompositeView @class Backbone.CompositeView
#Description

The module Backbone.CompositeView adds support for Backbone Views composition.

#Define a Composite View

Since Elbrus, all Backbone.View are CompositeView by default so there is no need to required
'Backbone.CompositeView' and call the 'CompositeView.add(this)' method.
To make it backwards compatible, we made the 'CompositeView.add()' method a 'noop' method, so
you will get no errors if you call it from your code

Before Elbrus:

```js
	var CompositeView = require('Backbone.CompositeView');
	var MyView = new backbone.View.extend({
		initialize: function()
		{
			CompositeView.add(this);
			//now this view is a composite view!
		}
	});
```

After Elbrus:

```js
	var MyView = new backbone.View.extend({
		initialize: function()
		{
			//every view now is a composite view!
		}
	});
```

#Composition by View definition

Another change since Elbrus is that a data-view is now a container for multiple children views.

The parent view needs to declare a place holder element in its template to render the children
in it.

```html
	<div data-view="Buttons"></div>
```

The parent view must also declare how its sub views will be created. For doing so it declares the
'childViews' property which is an object with properties that are the name of the children views.
The value of those properties are objects that define 2 properties, 'childViewIndex' and 'childViewConstructor'

```js
	childViews: {
		'Buttons': {
			'Whishlist': {
				'childViewIndex': 10
			,	'childViewConstructor': function() {
					return new WhishlistView();
				}
			}
			'SaveForLater': {
				'childViewIndex': 20
			,	'childViewConstructor': SomeView
			}
		}
	}
```

'childViewIndex': is the order in which the children will be rendered in that container.
'childViewConstructor': can be either functions or Backbone.View subclasses. Each defined function
must return an instance of a Backbone.View.

To make it backward compatible, we will still supporting the old format:

```js
	childViews: {
		'Promocode': function()
		{
			return new PromocodeView({model: this.model.get('promocode')});
		}
	,	'SomeWidget': SomeWidget
	}
```

In this case, the container and the view name will have the same, and in the 'childViews' property,
you can combine the old and the new format.


The function callback takes as an arguments the data attributes of the element placeholder. For example if a placeholder
element contains a data attribute named color

```html
	<div data-view="Rectangles.View" data-color="#FF0000"></div>
```

The function callback will have an key named color using that value.

```js
	childViews: {
		'Rectangles.View':
		{
			'RectangleRed':
			{
				childViewIndex: 10
			,	childViewConstructor: function(options)
				{
					return new RectangleView({ color: options.color });
				}
			}
		}
	}
```

In the case of Backbone.View subclasses in the childViews properties the options are passed to the initialize function.
So the previous example could be written as

```js
	childViews: {
		'Rectangles.View':
		{
			'RectangleRed':
			{
				childViewIndex: 10
			,	childViewConstructor: RectangleView
			}
		}
	}
```

##Summary

So in summary, the parent view has all the responsibility of declaring the location of the child
views in the markup and to instantiate its child views by name. Also has the responsibility of
destroying its children and this is done automatically.

Children constructor functions and children instances are available in the parent view.
There is children to parent references in the 'parentView' property and also a boolean 'hasParent'.

#Composition by Extension

Any view declared as Composite View can be extended with new child views externally by passing certain properties when initializing it.
This is extremely useful when developing components.

In this case, as in Composition by View definition, the template must indicate the location where the child view will be located by
adding a data-view attribute.

```html
	<div data-view="ExternalChildViews"></div>
```

When initializing a component view that is composite you can pass in its options a property called 'childViews' that resemble the
'childViews'.
Example:

```js

//...

var component = new MyComponent({
	childViews: {
		ExternalChildViews: function (component_model)
		{
			SomeView:
			{
				childViewIndex: 10
			,	childViewConstructor: function ()
			{
				return new RectangleView();
			}
		}
	}
})

```

*/

define(
	'Backbone.CompositeView'
,	[
		'Backbone.View'
	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	,	'Utils'
	,	'PluginContainer'
	]
,	function(
		BackboneView
	,	Backbone
	,	jQuery
	,	_
	,	Utils
	,	PluginContainer
	)
{
	'use strict';

	var compositeView = {

		// @method destroyCompositeView Destroy all the child view instances
		destroyCompositeView: function destroyCompositeView()
		{
			var self = this;

			_(this.childViewInstances).each(function (container, container_name)
			{
				_.each(container, function(generator, view_name)
				{
					self.removeChildViewInstance(container_name, view_name);
				});
			});
		}

		// @method renderChild Creates and render a childView
		// @param {DOM|String}elementOrViewName The DOM element or the name of the childView
		// @return {Backbone.View}
	,	renderChild: function renderChild(elementOrViewName)
		{
			//console.warn('DEPRECATED: "Backbone.View.renderChild(params)" is deprecated. Use "Backbone.CompositeView.renderChildViewContainer(params)" instead');

			if (typeof elementOrViewName !== 'string')
			{
				elementOrViewName = jQuery(elementOrViewName).data('view');
			}

			if (elementOrViewName)
			{
				this.renderChildViewContainer(elementOrViewName, true);
			}

			return this.getChildViewInstance(elementOrViewName);
		}

		// @method renderCompositeView Creates and renders the childViews
	,	renderCompositeView: function renderCompositeView()
		{
			// @event beforeCompositeViewRender triggered just before a view's children finish rendering in the DOM
			this.trigger('beforeCompositeViewRender', this);

			this._createChildViewInstances();
			this._renderChildViewInstances();

			Backbone.View.afterCompositeViewRender.executeAll(this);

			// @event afterCompositeViewRender triggered when a view's children finish rendering in the DOM
			this.trigger('afterCompositeViewRender', this);
		}

		// @method _renderChildViewInstances Render the all the childViews
		// @private
	,	_renderChildViewInstances: function _renderChildViewInstances()
		{
			var self = this;

			_.each(this.childViewInstances, function(child_views, container_name)
			{
				self.renderChildViewContainer(container_name);
			});
		}

		// @method _renderChildViewInstance Render a childView
		// @param {Backbone.View} child_view_instance The instance of the childview
		// @param {String} placeholder Where to insert the childView
		// @param {Number} number_views The number of views of the container of the childView
		// @private
	,	_renderChildViewInstance: function _renderChildViewInstance(child_view_instance, placeholder, number_views)
		{
			if (child_view_instance)
			{
				this._setCustomTemplate(child_view_instance);

				if (number_views === 1 && !child_view_instance.isCCT)
				{
					this._finishRender(child_view_instance, this.$el.find(placeholder));
				}
				else
				{
					child_view_instance.render();
					this.$(placeholder).append(child_view_instance.$el);
				}
			}
		}

		// @method renderChildViewContainer Renders the childViews of a container
		// @param {String} container_name The name of the container
		// @param {Boolean} create_child Indicate if the childView instnace is created
	,	renderChildViewContainer: function renderChildViewContainer(container_name, create_child)
		{
			var self = this
			,	generators = _.values(this.childViewInstances[container_name]);

			generators.sort(function(a, b)
			{
				return a.childViewIndex - b.childViewIndex;
			});

			_.each(generators, function(generator)
			{

				if (create_child)
				{
					self.createChildViewInstance(generator);
				}

				var placeholder = self._getPlaceholder(generator.childViewSelector);

				self._renderChildViewInstance(generator.childViewInstance, placeholder, generators.length);
			});
		}

		// @method_getPlaceholder
		// @param {Object} selector
		// @return {String}
		// @private
	,	_getPlaceholder: function _getPlaceholder(selector)
		{
			var placeholder = '';

			_.each(selector, function (value, key)
			{
				placeholder += '[' + key + '="' + value + '"]';
			});

			return placeholder;
		}

		// @method _createChildViewInstances Create instances of all childViews
		// @private
	,	_createChildViewInstances: function _createChildViewInstances()
		{
			var self = this;

			_.each(this.childViewInstances, function(child_views)
			{
				_.each(child_views, function(generator)
				{
					var placeholder = self._getPlaceholder(generator.childViewSelector)
					,	$element = self.$(placeholder);

					if ($element.length)
					{
						if (generator.childViewConstructor)
						{
							self.createChildViewInstance(generator, $element.data());
						}
					}
				});
			});
		}

		// @method createChildViewInstance Create a instance of a childView
		// @param {Object} generator The generator of the childView
		// @param {Object} element_data Data of the DOM to initialize the instance
		// @return {Backbone.View} return the instance of the childView
	,	createChildViewInstance: function createChildViewInstance(generator, element_data)
		{
			element_data = element_data || {};

			var options = _.extend({}, element_data, this.options);

			if (generator.childViewInstance)
			{
				generator.childViewInstance._destroy(true);
			}

			if(generator.childViewConstructor.extend === Backbone.View.extend)
			{
				// special case of 'Some.View': SomeView
				generator.childViewInstance = new generator.childViewConstructor(options);
			}
			else
			{
				// common case 'Some.View': function() { ... }
				generator.childViewInstance = generator.childViewConstructor.call(this, options);

				if (_.isFunction(generator.childViewInstance))
				{
					generator.childViewInstance = generator.childViewInstance();
				}
			}

			if(generator.childViewInstance)
			{
				generator.childViewInstance.parentView = generator.childViewInstance.parentView || this;
				generator.childViewInstance.hasParent = true;
				generator.childViewInstance.placeholderData = element_data || {};
				generator.childViewInstance._originalTemplate = generator.childViewInstance.template;

				this._setCustomTemplate(generator.childViewInstance);
			}

			return generator.childViewInstance;
		}

		// @method addChildViewInstances Add childViews to this View
		// @param {Object} child_views The view to be added
		// @param {Boolean} render Indicates if the childViews needs to be rendered
	,	addChildViewInstances: function addChildViewInstances (child_views, render)
		{
			var self = this;

			_.each(child_views, function(child_view, child_view_container)
			{
				if (!self.childViewInstances[child_view_container])
				{
					self.childViewInstances[child_view_container] = {};
				}

				if (_.isFunction(child_view))
				{
					//console.warn('This --- will be deprecated, please use the follow format ---');
					self.childViewInstances[child_view_container][child_view_container] = {
						childViewIndex: 10
					,	childViewConstructor: child_view
					,	childViewInstance: null // initialize??
					,	childViewSelector: { 'data-view': child_view_container }
				};
				}
				else
				{
					_.each(child_view, function(child_view_generator, child_view_name)
					{
						self.childViewInstances[child_view_container][child_view_name] = {
							childViewIndex: child_view_generator.childViewIndex || 10
						,	childViewConstructor: child_view_generator.childViewConstructor
						,	childViewInstance: child_view_generator.childViewInstance
						,	childViewSelector: child_view_generator.childViewSelector || { 'data-view': child_view_container }
						};

						if (child_view_generator.childViewInstance)
						{
							var placeholder = self._getPlaceholder(child_view_generator.childViewSelector);

							child_view_generator.childViewInstance.parentView = child_view_generator.childViewInstance.parentView || self;
							child_view_generator.childViewInstance.hasParent = true;
							child_view_generator.childViewInstance.placeholderData = self.$(placeholder).data() || {};
							child_view_generator.childViewInstance._originalTemplate = child_view_generator.childViewInstance.template;
							self._setCustomTemplate(child_view_generator.childViewInstance);
						}
					});
				}

				if (render)
				{
					self.renderChildViewContainer(child_view_container);
				}
			});
		}

		// @method getChildViewInstance Get a particular childView
		// @param {String} container_name The name of the container_name
		// @param {String} child_view_name The name of the view
		// @return {Backbone.View}
	,	getChildViewInstance: function getChildViewInstance(container_name, child_view_name)
		{
			child_view_name = child_view_name || container_name;

			return this.childViewInstances[container_name] &&
				this.childViewInstances[container_name][child_view_name] &&
				this.childViewInstances[container_name][child_view_name].childViewInstance;
		}

		// @method getChildViewInstances Returns an Array of all the childViews instances
		// @param {String|null} container_name The name of the container (Optional)
		// @return {Array<Backbone.View>}
	,	getChildViewInstances: function getChildViewInstances(container_name)
		{
			var all_child_views = [];

			if (container_name)
			{
				_.each(this.childViewInstances[container_name], function(child_view_generator)
				{
					if (child_view_generator.childViewInstance)
					{
						all_child_views.push(child_view_generator.childViewInstance);
					}
				});
			}
			else
			{
				_.each(this.childViewInstances, function(child_views)
				{
					_.each(child_views, function(child_view_generator)
					{
						if (child_view_generator.childViewInstance)
						{
							all_child_views.push(child_view_generator.childViewInstance);
						}
					});
				});
			}

			return all_child_views;
		}

		//@method updateChildViewInstances updates the render settings or the selector
		//@param {String} selector Where the child view will be inserted
		//@param {Backbone.View} child_instance Child View to be added
		//@param {Backbone.CompositeView.AddChildView.Settings} render_settings Indicate how the insertion must be done. Information like where the child view will be placed
		//@return {Void}
	,	updateChildViewInstances: function updateChildViewInstances(child_views, render)
		{

			var self = this
			,	promises = [];

			_.each(child_views, function(child_view, container_name)
			{
				_.each(child_view, function(generator, child_view_name)
				{
					promises.push(self.removeChildViewInstance(container_name, child_view_name));
				});
			});

			return jQuery.when(promises)
				.then(function()
					{
						self.addChildViewInstances(child_views, render);
					});
		}

		//@method removeChildViewInstance Removes a child view instance from the current view. Optionally destroy the child view
		//@param {Backbone.View} child_instance Instance to be removed
		//@param {Boolean} destroy Indicate if the child view will be also destroyed.
		//@return {jQuery.Deferred|undefined}
	,	removeChildViewInstance: function removeChildViewInstance(container_name, child_view_name, destroy)
		{
			if (this.childViewInstances[container_name] && this.childViewInstances[container_name][child_view_name])
			{
				var child_view_instance = this.childViewInstances[container_name][child_view_name].childViewInstance;

				destroy && delete this.childViewInstances[container_name][child_view_name];

				if (child_view_instance)
				{
					child_view_instance.$el.detach();
					return child_view_instance.destroy();
				}
			}
		}

	,	_getCustomTemplatePrefix: function _getCustomTemplatePrefix()
		{
			return [
					'cell-'
				,	'row-'
				,	'child-'
				,	''
			];
		}

		// @method _setCustomTemplate Select the best templated based on the current view port with and set it to the child view
		// @param {Backbone.View} child_view Instance of the child view to be inserted
	,	_setCustomTemplate: function _setCustomTemplate(child_view)
		{
			var template_prefix = this._getCustomTemplatePrefix();

			_.each(template_prefix, function (prefix)
			{
				var template_name = child_view.placeholderData[prefix + 'template'];

				// if (template_name)
				// {
					var definitive_template_name = Utils.selectByViewportWidth({
						phone: child_view.placeholderData[prefix + 'phoneTemplate'] //remember that data-phone-template get's converted in phoneTemplate when we use jQuery.data()
					,	tablet: child_view.placeholderData[prefix + 'tabletTemplate']
					,	desktop: template_name
					}, template_name);

					if (definitive_template_name)
					{
						// IMPORTANT: we are require()ing the template dynamically! In order to this to work, the template should
						// be ALREADY loaded and this is automatically handled at build time by gulp template
						child_view[prefix ? prefix + 'Template' : 'template'] = Utils.requireModules(definitive_template_name + '.tpl');
					}
					else
					{
						child_view[prefix ? prefix + 'Template' : 'template'] = child_view._originalTemplate;
					}
				// }
			});
		}

		// @method _finishRender Render the child view and insert its result into the placeholder
		// @param {Backbone.View} child_view Instance of the view to be inserted
		// @param {jQuery} $placeholder Element container of the child. This is the div that contains the tag data-view="..."
	,	_finishRender: function _finishRender(child_view, $placeholder)
		{
			//HEADS UP! we use the placeholder as the children view's container element ($el)
			child_view.$el = $placeholder;

			// keep the placeholder classes
			var placeholder_class = $placeholder.attr('class');
			child_view.className = (child_view.className||'') + ' ' + (placeholder_class||'');

			child_view.render();
		}

	,	setChildViewIndex: function setChildViewIndex (container_name, view_name, index, render)
		{
			if (this.childViewsInstances[container_name] && this.childViewsInstances[container_name][view_name])
			{
				this.childViewsInstances[container_name][view_name].childViewIndex = index;

				if (render)
				{
					this.render();
				}
			}
		}

	,	contextData: {}

		// ie: contexts = ['item', 'order']
	,	getContextData: function(contexts)
		{
			var contextData = {}
			,	i = contexts.length;

			while (i--)
			{
				if (this.contextData[contexts[i]])
				{
					contextData[contexts[i]] = _.bind(this.contextData[contexts[i]], this);
					contexts.splice(i, 1);
				}
			}

			if (contexts.length && this.parentView)
			{
				return _.extend(this.parentView.getContextData(contexts), contextData);
			}

			return contextData;
		}
	};

	_.extend(Backbone.View.prototype, compositeView);

	// @module Backbone @class Backbone.View
	// @property {PluginContainer} afterCompositeViewRender Plugins registered here will be called when
	// a composite view finish rendering it self and all its children.
	Backbone.View.afterCompositeViewRender = new PluginContainer();

	// @method addExtraChildrenViews Allows adding extra child view to any view.
	// This property will be read by the class Backbone.CompositeView when initializing a view
	// @param {ExtraChildView} option_views
	// @return {Void}
	// @static
	Backbone.View.addExtraChildrenViews = function addExtraChildrenViews (option_views)
	{
		console.warn('DEPRECATED: "Backbone.View.addExtraChildrenViews(params)" is deprecated. Use "Backbone.CompositeView.addChildViews(params)" instead');

		this.addChildViews(option_views);
	};

	/*
		childViews = {
			'Other.View': {
				'Id1': {
					'childViewIndex': 10
				,	'childViewConstructor': function() {}
				}
				'Id2': {
					'childViewIndex': 20
				,	'childViewConstructor': function() {}
				}
			}
		}
	*/

	// @method setChildViewIndex Allows to change the position of a Child View in a container
	// @param {String} container_name The name of the container
	// @param {String} view_name The name of the Child View
	// @param {Number} index The new index to position the Child View in the container
	// @return {Void}
	// @static
	Backbone.View.setChildViewIndex = function setChildViewIndex (container_name, view_name, index)
	{
		if (this.childViews[container_name])
		{
			if (_.isFunction(this.childViews[container_name]))
			{
				this._normalizeChildView(container_name);
			}

			if (this.childViews[container_name][view_name])
			{
				this.childViews[container_name][view_name].childViewIndex = index;
			}
		}
	};

	// @method _normalizeChildView Change the format of the childView into the new format
	// @param {String} container_name The name of the container
	// @return {Void}
	// @static
	// @private
	Backbone.View._normalizeChildView = function _normalizeChildView(container_name)
	{
		var childViewConstructor = this.childViews[container_name];

		this.childViews[container_name] = {};

		this.childViews[container_name][container_name] = {
			childViewIndex: 10
		,	childViewConstructor: childViewConstructor
		};
	};

	// @method addChildViews adds children views to the current view
	// @param {ChildViews} child_views
	// @return {Void}
	// @static
	Backbone.View.addChildViews = function addChildViews (child_views)
	{

		var self = this;

		this.childViews = _.extend({}, this.prototype.childViews, this.childViews);

		_.each(child_views, function(child_view, child_view_container)
		{
			if (self.childViews[child_view_container])
			{
				if (_.isFunction(self.childViews[child_view_container]))
				{
					self._normalizeChildView(child_view_container);
				}
			}
			else
			{
				self.childViews[child_view_container] = {};
			}

			if (_.isFunction(child_view))
			{
				self.childViews[child_view_container][child_view_container] = {
					childViewIndex: 10
				,	childViewConstructor: child_view
				};
			}
			else
			{
				_.each(child_view, function(child_view_generator, child_view_name)
				{
					self.childViews[child_view_container][child_view_name] = child_view_generator;
				});
			}
		});
	};

	// @method removeChildView removes a particular childView
	// @param {String} container_name
	// @param {String} child_view_name
	// @return {Void}
	// @static
	Backbone.View.removeChildView = function removeChildView (container_name, child_view_name)
	{
		if (_.isFunction(this.childViews[container_name]))
		{
			delete this.childViews[container_name];
		}
		else if (this.childViews[container_name] && this.childViews[container_name][child_view_name])
		{
			delete this.childViews[container_name][child_view_name];
		}
	};

	Backbone.View.beforeInitialize.install({
		name: 'compositeView'
	,	priority: 1
	,	execute: function ()
		{
			var childViews = _.extend({}, this.childViews, this.constructor.childViews);

			this.childViewInstances =  {};

			this.addChildViewInstances(childViews);

			if (this.options)
			{
				if (this.options.extraChildViews)
				{
					console.warn('DEPRECATED: "options.extraChildViews" is deprecated. Use "options.childViews" instead');
					//Add extra child views from view's initialization options

					this.addChildViewInstances(this.options.extraChildViews);
				}

				if (this.options.childViews)
				{
					//Add extra child views from view's initialization options
					this.addChildViewInstances(this.options.childViews);
				}
			}
		}
	});

	return {
		add: jQuery.noop // Just for backwards compatibility
	};

});

//@class ChildViews This class defines the type used on each childView property on composite views
//Each property on this object will be related with a child view and the its value must a function that when evaluated returns the instance
//of a Backbone View, or the constructor of a Backbone.View
//Example
//
//,	childView: {
//		'PromoCodeContainer':
//		{
//			'PromoCodeForm':
//			{
//				childViewIndex: 10
//			,	childViewConstructor: function ()
//				{
//					return new PromocodeFormView({});
//				}
//			}
//		}
//	}
//

//@class addChildViews This class define the type used to add external children views into a view by specifying them on the view options when
//creating a new composite view (this is a common scenario when creating components), and by specifying external child views statically using
//the addChildViews method present in all Backbone Views when the Backbone.CompositeView module is loaded
//Example
//
//	SomeView.addChildViews({
//		'ChildViewContainer':
//		{
//			'ChildViewName': function ()
//			{
//				return new ExtraChildView({model: some_view_model});
//			};
//		}
//	});
//
