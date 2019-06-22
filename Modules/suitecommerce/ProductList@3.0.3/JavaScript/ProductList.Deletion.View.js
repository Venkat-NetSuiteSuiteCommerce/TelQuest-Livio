/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
// ProductList.Deletion.Views.js
// -----------------------
// View to handle Product Lists (lists and items) deletion
define('ProductList.Deletion.View'
,	[	'product_list_deletion.tpl'

	,	'underscore'
	,	'Backbone'
	,	'Backbone.View'
	,	'Backbone.View.render'
	,	'Utils'
	]
,	function (
		product_list_deletion_tpl

	,	_
	,	Backbone
	)
{
	'use strict';

	// @class ProductList.Deletion.View @extends Backbone.View
	return Backbone.View.extend({

		template: product_list_deletion_tpl

	,	title: _('Delete item').translate()

	,	attributes: {
			'class': 'view product-list-deletion-confirm'
		}

	,	page_header: _('Delete item').translate()

	,	events: {
			'click [data-action="delete"]' : 'confirmDelete'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.parentView = options.parentView;
			this.target = options.target;
			this.title = options.title;
			this.page_header = options.title;
			this.body = options.body;
			this.confirm_delete_method = options.confirm_delete_method;
			this.confirmLabel = options.confirmLabel || _('Yes, Remove It').translate();
		}

	,	render: function ()
		{
			Backbone.View.prototype.render.apply(this, arguments);
			var self = this;
			this.$containerModal.on('shown.bs.modal', function()
			{
				self.$('[data-action="delete"]').focus();
			});
		}

		// @method confirmDelete Invokes parent view delete confirm callback function
	,	confirmDelete : function ()
		{
			this.parentView[this.confirm_delete_method](this.target);
		}

		// @method getTitle Sets focus con cancel button and returns the title text
	,	getTitle: function ()
		{
			return _('Delete product list').translate();
		}

		// @method getContext @return {ProductList.Deletion.View.Context}
	,	getContext: function()
		{
			return {
				// @class ProductList.Deletion.View.Context
				// @property {String} body
				body: this.body
				// @property {Boolean} hasConfirmLabel
			,	hasConfirmLabel: !!this.confirmLabel
				// @property {String} confirmLabel
			,	confirmLabel: this.confirmLabel
				// @property {Boolean} hasCancelLabel
			,	hasCancelLabel: !!this.cancelLabel
				// @property {String} cancelLabel
			,	cancelLabel: this.cancelLabel
			};
		}
	});
});