/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module RequestQuoteWizard
define('RequestQuoteWizard.Configuration'
,	[
		'OrderWizard.Module.CartItems'
	,	'OrderWizard.Module.ShowShipments'

	,	'RequestQuoteWizard.Module.Header'
	,	'RequestQuoteWizard.Module.Message'
	,	'RequestQuoteWizard.Module.QuickAdd'
	,	'RequestQuoteWizard.Module.Comments'
	,	'RequestQuoteWizard.Module.Items'
	,	'OrderWizard.Module.Address.Shipping'
	,	'OrderWizard.Module.Title'
	,	'RequestQuoteWizard.Module.Confirmation'

	,	'SC.Configuration'

	,	'underscore'
	,	'Utils'

	]
,	function (
		OrderWizardModuleCartItems
	,	OrderWizardModuleShowShipments

	,	RequestQuoteWizardModuleHeader
	,	RequestQuoteWizardModuleMessage
	,	RequestQuoteWizardModuleQuickAdd
	,	RequestQuoteWizardModuleComments
	,	RequestQuoteWizardModuleItems
	,	OrderWizardModuleAddressShipping
	,	OrderWizardModuleTitle
	,	RequestQuoteWizardModuleConfirmation

	,	Configuration

	,	_
	)
{
	'use strict';

	//@class RequestQuoteWizard.Configuration Defines the configuration for the Request Quote Wizard module
	return {
		steps: [
			{
				name: ''
			,	steps: [
					{
						url: 'request-a-quote'
					,	name: _('Request a Quote').translate()
					,	hideBackButton: true
					,	hideContinueButton: false
					,	bottomMessage: Configuration.get('quote.requestAQuoteWizardBottomMessage')
					,	continueButtonLabel: _('Submit Quote Request').translate()
					,	modules: [
							RequestQuoteWizardModuleHeader
						,	RequestQuoteWizardModuleMessage
						,	[	OrderWizardModuleTitle
							,	{
									title: _('Add Items').translate()
								}
							]
						,	RequestQuoteWizardModuleQuickAdd
						,	RequestQuoteWizardModuleItems
						,	[	OrderWizardModuleTitle
							,	{
									title: _('Choose a Shipping Address').translate()
								}
							]
						,	OrderWizardModuleAddressShipping
						,	[
								OrderWizardModuleTitle
							,	{
									title: _('Comments').translate()
								}
							]
						,	RequestQuoteWizardModuleComments
						]
					,	save: function ()
						{
							_.first(this.moduleInstances).trigger('change_label_continue', _('Processing...').translate());

							var self = this
							,	submit_opreation = this.wizard.model.submit();

							submit_opreation.always(function ()
							{
								_.first(self.moduleInstances).trigger('change_label_continue', _('Submit Quote Request').translate());
							});

							return submit_opreation;
						}
					}
				,	{
						url: 'request-a-quote-confirmation'
					,	name: _('Request a Quote').translate()
					,	hideBackButton: true
					,	hideContinueButton: true
					,	confirmationMessage: _('A sales representative will contact you in <strong>XX business days</strong>.').translate()
					,	modules: [
							RequestQuoteWizardModuleConfirmation
						,	[	OrderWizardModuleShowShipments
							,	{
									hide_edit_cart_button: true
								,	hide_edit_address_button: true
								,	hideShippingMethod: true
								}
							]
						,	[	RequestQuoteWizardModuleComments
							,	{
									is_read_only: true
								,	title: _('Comments').translate()
								,	hide_title: false
								}
							]
						]
					}
				]
			}
		]
	};
});