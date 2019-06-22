/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module QuoteToSalesOrderWizard
define('QuoteToSalesOrderWizard.Module.QuoteDetails'
,	[
		'Backbone.CompositeView'
	,	'Wizard.Module'

	,	'quote_to_salesorder_wizard_module_quotedetails.tpl'
	]
,	function (
		BackboneCompositeView
	,	WizardModule

	,	quote_to_salesorder_wizard_module_quotedetails_tpl
	)
{
	'use strict';

	//@class QuoteToSalesOrderWizard.Module.QuoteDetails @extend Wizard.Module
	return WizardModule.extend({

		// @property {Function} template
		template: quote_to_salesorder_wizard_module_quotedetails_tpl

		//@method getContext
		//@return {QuoteToSalesOrderWizard.Module.QuoteDetails.Context}
	,	getContext: function ()
		{
			//@class QuoteToSalesOrderWizard.Module.QuoteDetails.Context
			return {
				//property {QuoteToSalesOrder.Model} model
				model: this.model
				//@property {String} quoteId
			,	quoteId: this.model.get('recordtype') === 'salesorder' && this.model.get('internalid') !== 'tempid'? this.model.get('createdfrom').internalid : this.model.get('quoteid')
				//@property {String} quoteTranId
			,	quoteTranId: this.model.get('quoteDetails').tranid ? this.model.get('quoteDetails').tranid : this.model.get('createdfrom').tranid
			};
		}
	});
});