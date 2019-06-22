/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module MenuTree
define('MenuTree.View'
,	[
		'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'MenuTree.Node.View'
	,	'Singleton'

	,	'menu_tree.tpl'
	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	]
,	function(

		BackboneCompositeView
	,	BackboneCollectionView
	,	MenuTreeNodeView
	,	Singleton

	,	menu_tree_tpl
	
	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';
	// @class MenuTree.View Implements the tree menu items that is present in MyAccount. It's a Singleton. @extends Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: menu_tree_tpl
		
		/*@property {Array<MenuItem>} menuItems

		My Account has support for a gloabally accesible Menu. See *MenuItem methods.
		Modules are able to publish their own menu entries without the need to update a central list
		The format of a menu item is the following. Note that all property values support a function
		that accepts this application and returns the native value (useful for dynamic values):
		
			id: 'mymodule1'
			
			name: _('My Module 1').translate() // the label for this module.
			
			url: 'mymodule1' // if not null the item will be represented with an anchor that will navigate
					to this url. If falsy there will be no navigation for this item (useful for multi-level menues).
			
			index: 9 // index number in the menu from top to bottom, lower values are on top.
			
			children: // [{name: 'Child1', url: '/child1'}, ...] an array of children menu items. Notice that,
					for children declarations, all these properties are taken in account recursively, including
					'index' and more (sub)'childrens'. By default, this is presented in a tree-view.

		while this.menuItems are the original user values (that can contain functions yet to evaluate)
		this.fixedMenuItems = this.getFixedMenuItems() is a clone of the entire tree but with the fixed
		values and sorted, this is, with functions already evaluated so safe to use in the UI.

		Notice that this calculation is made in render() so dynamic re-calcalculations are supported. See this.updateMenuItemsUI()

		@class MenuItem menu item definitions for myaccount nav bar. Al properties can be a function that accepts the current application instance for supporting dynamic values.
		@property {String|Function} id the id for this menu item
		@property {String|Function} name the id for this menu item the label for this module.
		@property {String|Function} url if not null the item will be represented with an anchor that will navigate to this url. ç
		If falsy there will be no navigation for this item (useful for multi-level menus).
		@property {Number|Function} index the id for this menu item
		@property {Array<MenuItem>} children an array of children menu items. Notice that, for children declarations, all these properties are taken in account recursively, including
		'index' and more (sub)'childrens'. By default, this is presented in a tree-view.
		*/
	,	menuItems: []

	,	events: {
			'click [data-action="expander"]': 'menuClick'
		}

		// @method initialize
	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

	,	render: function()
		{
			this.fixedMenuItems = this.getFixedMenuItems();
			Backbone.View.prototype.render.apply(this, arguments);
		}

		// @method menuClick Note: cant use bootstrap collapse due to the divs introduced by collection view. @param {HTMLEvent} e
	,	menuClick: function (e, synthetic)
		{
			var target = jQuery(e.currentTarget)
			,	this_expander = target.next('[data-type="menu-tree-node-expander"]')
			, 	this_expander_is_opened = this_expander.hasClass('in')
			
			,	this_expandable = target.closest('[data-type="menu-tree-node-expandable"]')
			,	all_expandables = this.$('[data-type="menu-tree-node-expandable"]');

			all_expandables.removeClass('open');
			this_expandable.addClass('open');
			
			//if inside a closed expander: close others open this one
			var expanding_expander = this.$(target.data('target'));
			if (!this_expander_is_opened)
			{
				var open_expanders = this.$('[data-type="menu-tree-node-expander"].in');
				
				jQuery.fn.collapse.call(open_expanders, 'hide');
				jQuery.fn.collapse.call(expanding_expander, 'show');
			}
			
			if (synthetic === undefined && this_expander_is_opened)
			{
				jQuery.fn.collapse.call(expanding_expander, 'hide');
				this_expandable.removeClass('open');
			}
		}
		
		// @method updateSidebar @param {String} label
	,	updateSidebar: function (label)
		{
			this.currentLabel = label || this.currentLabel;

			var target = this.$('[data-id="' + this.currentLabel + '"]')
			,	target_expandable = target.closest('[data-type="menu-tree-node-expandable"]')
			, 	anchors = this.$('[data-id]');

			//remove active for all anchors and add for this one
			anchors.removeClass('active');
			target.addClass('active');

			//triggers click for the correct expander
			target_expandable.find('[data-action="expander"]:first').trigger('click', { synthetic: true });

			//edge case for home, should close other expanders
			if (label === 'home')
			{
				var all_expandables = this.$('[data-type="menu-tree-node-expandable"]')
				,	open_expanders = this.$('[data-type="menu-tree-node-expander"].in');

				all_expandables.removeClass('open');
				jQuery.fn.collapse.call(open_expanders, 'hide');
			}
		}

		// @method getFixedMenuItems @return {Array<Object>}
	,	getFixedMenuItems: function ()
		{
			var self = this
			,	fixed = null
			,	parent = null
			,	parsed_menu_items = []
			,	menu_items_with_parent = [];

			_.each(this.menuItems, function (item)
			{
				// we are ignoring no-value menu item definitions
				fixed = item && self.fixMenuItems(item);

				if (fixed)
				{
					parsed_menu_items.push(fixed);

					if (fixed.parent)
					{
						menu_items_with_parent.push(fixed);
					}
				}
			});

			// Add outsider children to parent menu items.
			_.each(menu_items_with_parent, function (menu_item)
			{
				parent = _.findWhere(parsed_menu_items, {
					id: menu_item.parent
				});

				if (parent)
				{
					if (!_.findWhere(parent.children, {id: menu_item.id}))
					{
						parent.children.push(menu_item);

						parent.children = self.sortMenuItems(parent.children);
					}

					parsed_menu_items = _.without(parsed_menu_items, menu_item);
				}
			});

			return this.sortMenuItems(parsed_menu_items);
		}


		// @method sortMenuItems sorts menu items by index and then by name @return {Array<MenuItem>}
	,	sortMenuItems: function (menu_items)
		{
			return menu_items.sort(function (item1, item2)
			{
				if (item1.index !== item2.index)
				{
					return item1.index - item2.index;
				}
				else
				{
					return item1.name > item2.name ? 1 : -1;
				}
			});
		}

		// @method addMenuItem Appends an menu item to the collection @param {Array<MenuItem>} items
	,	addMenuItem: function (items)
		{
			var self = this;

			items = _.isArray(items) ? items : [items];

			_.each(items, function (item)
			{
				self.menuItems.push(item);
			});
		}

		// method fixMenuItems recursive! @param {MenuItem} item_
	,	fixMenuItems: function (item_)
		{
			var self = this
			,	item = self.fixMenuItem(item_);

			if (item && _.isArray(item.children))
			{
				item.children = _.map(item.children, function (children_item)
				{
					return self.fixMenuItems(children_item);
				});
			}

			return item;
		}

		// @method menuItemValue every menu item config property is evaluated using this function. @param {Function|String} value
	,	menuItemValue: function (value)
		{
			return _.isFunction(value) ? value.apply(this, [this.application]) : value;
		}

		// @method fixMenuItem normalizes the passed menuitem object setting its properties to its native types. @param {MenuItem} item_
	,	fixMenuItem: function (item_)
		{
			var item = null;

			item_ = this.menuItemValue(item_);

			if (!item_)
			{
				return undefined;
			}

			item = _.clone(item_);

			item.parent = this.menuItemValue(item.parent);
			item.name = this.menuItemValue(item.name);
			item.index = this.menuItemValue(item.index);
			item.url =  this.menuItemValue(item.url) ?  ('/' + this.menuItemValue(item.url)) : '';
			item.id = this.menuItemValue(item.id);
			item.children = this.menuItemValue(item.children) || [];
			item.showChildren = !!item.children.length;

			if (item.showChildren)
			{
				item.children = this.sortMenuItems(item.children);
			}

			return item;
		}

		// @method removeMenuItem Removes the item from the menu @param {String} id
	,	removeMenuItem: function (id)
		{
			this.menuItems = _.reject(this.menuItems, function (item)
			{
				return item.id === id;
			});
		}

		// @method updateMenuItemsUI re-render the menu items menu - useful for dynamic menu items that need to re-render when something changes. Each module is responsible of calling this method when appropiate.
	,	updateMenuItemsUI: function ()
		{
			this.render();
			this.updateSidebar();
		}

		// @method replaceMenuItem Given a filter, replaces an existing menu item with a new one @param {Function} filter @param {MenuItem} new_menu_item
	,	replaceMenuItem: function(filter, new_menu_item)
		{
			for (var i = 0; i < this.menuItems.length; i++)
			{
				if (filter(this.fixMenuItem(this.menuItems[i])))
				{
					this.menuItems[i] = new_menu_item;
				}
			}
		}

		// @method getContext @returns MenuTree.View.Context
	,	getContext: function()
		{
			// @class MenuTree.View.Context
			return {
				// @propery {Array} menuItems
				menuItems: this.fixedMenuItems
			};
			// @class MenuTree.View
		}


	,	childViews: {
			'MenuItems.Collection': function ()
			{
				return new BackboneCollectionView(
				{		
						collection: this.fixedMenuItems
					,	childView: MenuTreeNodeView
					,	viewsPerRow: 1
					,	childViewOptions: {
							level: 1
						}
				});
			}
		}

	}, Singleton);
});