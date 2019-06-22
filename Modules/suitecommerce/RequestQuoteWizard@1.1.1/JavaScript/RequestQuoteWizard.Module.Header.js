/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module RequestQuoteWizard
define('RequestQuoteWizard.Module.Header'
,	[
		'Wizard.Module'

	,	'requestquote_wizard_module_header.tpl'
	]
,	function (
		WizardModule

	,	requestquote_wizard_module_header_tpl
	)
{
	'use strict';

	//@class WizardModule.Module.Header @extend Wizard.Module
	return WizardModule.extend({

		// @property {Function} template
		template: requestquote_wizard_module_header_tpl

		//@method initialize Override default initialize to attach on model lines change event to re-render
		//@return {Void}
	,	initialize: function ()
		{
			WizardModule.prototype.initialize.apply(this, arguments);			
			this.wizard.model.get('lines').on('add remove change', this.render, this);
		}

		//@method getContext
		//@return {RequestQuoteWizard.Module.Header.Context}
	,	getContext: function ()
		{
			//@class RequestQuoteWizard.Module.Header.Context
			return {
				//property {RequestQuoteWizard.Module.Header} model
				model: this.wizard.model
				// @property {Boolean} hasItem
			,	hasItem: !!this.wizard.model.get('lines').length
				// @property {Number} productsLength
			,	productsLength: this.getItemsLength()
				// @property {Boolean} hasOneItem
			,	hasOneItem: this.getItemsLength() === 1
			};
			//@class RequestQuoteWizard.Module.Header
		}

		//@method getItemsLength Returns the number of items in the entire model, that is the sum of all lines quantities
		//@return {Number}
	,	getItemsLength: function ()
		{
			return this.wizard.model.get('lines').reduce(function (accum, line)
				{
					accum += line.get('quantity');
					return accum;
				}, 0);
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