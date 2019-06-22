/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard.Module.CartItems
define(
	'OrderWizard.Module.CartItems'
,	[	'Wizard.Module'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Transaction.Line.Views.Cell.Navigable.View'

	,	'order_wizard_cartitems_module.tpl'

	,	'underscore'
	,	'Utils'
	]
,	function (
		WizardModule
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	TransactionLineViewsCellNavigableView

	,	order_wizard_cartitems_module_tpl

	,	_
	)
{
	'use strict';

	//@class OrderWizard.Module.CartItems @extends Wizard.Module
	return WizardModule.extend({

		//@property {Function} template
		template: order_wizard_cartitems_module_tpl

		//@method render
	,	render: function ()
		{
			this.application = this.wizard.application;
			this.profile = this.wizard.options.profile;
			this.options.application = this.wizard.application;

			if (this.isActive())
			{
				this._render();
			}
		}

	,	initialize: function ()
		{
			var self = this;

			WizardModule.prototype.initialize.apply(this, arguments);
			this.wizard.model.on('ismultishiptoUpdated', function ()
			{
				self.render();
			});

			this.wizard.model.on('promocodeUpdated', function ()
			{
				self.render();
			});

			BackboneCompositeView.add(this);
		}

		//@property {Object} childViews
	,	childViews: {
			'Items.Collection': function ()
			{
				return new BackboneCollectionView({
						collection: this.model.get('lines')
					,	childView: TransactionLineViewsCellNavigableView
					,	viewsPerRow: 1
					,	childViewOptions: {
							navigable: !this.options.hide_item_link

						,	detail1Title: _('Qty:').translate()
						,	detail1: 'quantity'

						,	detail2Title: _('Unit price:').translate()
						,	detail2: 'rate_formatted'

						,	detail3Title: _('Amount:').translate()
						,	detail3: 'amount_formatted'
						}
				});
			}
		}

		//@method getContext @returns {OrderWizard.Module.CartItems.Context}
	,	getContext: function ()
		{
			var lines = this.model.get('lines')
			,	item_count = _.countItems(lines);

			//@class OrderWizard.Module.CartItems.Context
			return {
					//@property {LiveOrder.Model} model
					model: this.model
					//@property {Boolean} itemCountGreaterThan1
				,	itemCountGreaterThan1: item_count > 1
					//@property {Number} itemCount
				,	itemCount: item_count
					//@property {Boolean} showOpenedAccordion
				,	showOpenedAccordion:  _.result(this.options || {}, 'showOpenedAccordion', false)
					//@property {Boolean} showEditCartButton
				,	showEditCartButton: !this.options.hide_edit_cart_button
					//@property {Boolean} showHeaders
				,	showHeaders: !this.options.hideHeaders
					//@property {Boolean} showMobile
				,	showMobile: this.options.showMobile
			};
		}
	});
});