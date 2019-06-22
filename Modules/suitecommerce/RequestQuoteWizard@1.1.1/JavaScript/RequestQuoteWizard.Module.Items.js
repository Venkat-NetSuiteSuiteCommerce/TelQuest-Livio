/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module RequestQuoteWizard
define('RequestQuoteWizard.Module.Items'
,	[
		'Wizard.Module'
	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'
	,	'Transaction.Line.Views.Cell.Actionable.Expanded.View'
	,	'RequestQuoteWizard.Module.Items.Line.Actions.View'
	,	'RequestQuoteWizard.Module.Items.Line.Quantity.View'

	,	'requestquote_wizard_module_items.tpl'
	]
,	function (
		WizardModule
	,	BackboneCollectionView
	,	BackboneCompositeView
	,	TransactionLineViewsCellActionableExpandedView
	,	RequestQuoteWizardModuleItemsLineActionsView
	,	RequestQuoteWizardModuleItemsLineQuantityView

	,	requestquote_wizard_module_items_tpl
	)
{
	'use strict';

	//@class RequestQuoteWizard.Module.Items @extend Wizard.Module
	return WizardModule.extend({

		// @property {Function} template
		template: requestquote_wizard_module_items_tpl

		//@method initialize
		//@return {Void}
	,	initialize: function ()
		{
			WizardModule.prototype.initialize.apply(this, arguments);
			BackboneCompositeView.add(this);

			this.wizard.model.get('lines').on('add remove change', this.render, this);
		}

		//@property {Object} childViews
	,	childViews: {
			'Items.Collection': function (options)
			{
				return new BackboneCollectionView({
						collection: this.model.get('lines')
					,	viewsPerRow: 1
					,	childView: TransactionLineViewsCellActionableExpandedView
					,	childViewOptions: {
							navigable: true
						,	application: this.wizard.application
						,	SummaryView: RequestQuoteWizardModuleItemsLineQuantityView
						,	ActionsView: RequestQuoteWizardModuleItemsLineActionsView
						,	showAlert: false
						,	generalClass: options.generalClass || 'requestquote-wizard-module-items-item'
						}
				});
			}
		}

		//@method getContext
		//@return {RequestQuoteWizard.Module.Items.Context}
	,	getContext: function ()
		{
			//@class RequestQuoteWizard.Module.Items.Context
			return {
				//@property {Boolean} showTitle
				showTitle: !!(!this.options.hide_title && this.getTitle())
				//@property {String} title
			,	title: this.getTitle()
				//@property {Boolean} showHeaders
			,	showHeaders: !this.options.hideHeaders
				//@property {Boolean} hasItems
			,	hasItems: !!this.wizard.model.get('lines').length
			};
			//@class RequestQuoteWizard.Model.Items
		}

		//@method destroy Override default implementation to detach form wizard's model events
		//@return {Void}
	,	destroy: function ()
		{
			this.wizard.model.get('lines').off('add remove', this.render);

			WizardModule.prototype.destroy.apply(this, arguments);
		}
	});
});