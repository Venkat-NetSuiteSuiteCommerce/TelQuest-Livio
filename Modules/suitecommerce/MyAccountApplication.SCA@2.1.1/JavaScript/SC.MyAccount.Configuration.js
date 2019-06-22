/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Configuration.js
// ----------------
// All of the applications configurable defaults
// Each section is comented with a title, please continue reading
define(
	'SC.MyAccount.Configuration'
,	[
		'Backbone.View'
	,	'SC.Configuration'
	,	'underscore'
	,	'jQuery'
	,	'PaymentWizard.Module.Invoice'
	,	'PaymentWizard.Module.Summary'
	,	'PaymentWizard.Module.ShowInvoices'
	,	'PaymentWizard.Module.CreditTransaction'
	,	'PaymentWizard.Module.PaymentMethod.Creditcard'
	,	'PaymentWizard.Module.Addresses'
	,	'PaymentWizard.Module.Confirmation'
	,	'PaymentWizard.Module.ShowCreditTransaction'
	,	'PaymentWizard.Module.ShowPayments'
	,	'PaymentWizard.Module.ConfirmationSummary'
	,	'PaymentWizard.Module.PaymentMethod.Selector'

	,	'OrderWizard.Module.CartSummary'
	,	'OrderWizard.Module.CartItems'
	,	'OrderWizard.Module.ShowShipments'
	,	'OrderWizard.Module.ShowPayments'
	,	'OrderWizard.Module.TermsAndConditions'
	,	'OrderWizard.Module.SubmitButton'
	,	'OrderWizard.Module.PaymentMethod.Creditcard'
	,	'OrderWizard.Module.PaymentMethod.Invoice'
	,	'OrderWizard.Module.Address.Billing'
	,	'OrderWizard.Module.PaymentMethod.Selector'

	,	'QuoteToSalesOrderWizard.Module.QuoteDetails'
	,	'QuoteToSalesOrderWizard.Module.Confirmation'
	,	'QuoteToSalesOrderWizard.Module.PaymentMethod.Selector'
	,	'Header.View'
	,	'Utils'
	]

,	function (
		BackboneView
	,	BaseConfiguration
	,	_
	,	jQuery
	,	PaymentWizardModuleInvoice
	,	PaymentWizardModuleSummary
	,	PaymentWizardModuleShowInvoices
	,	PaymentWizardModuleCreditTransaction
	,	PaymentWizardModulePaymentMethodCreditcard
	,	PaymentWizardModuleAddresses
	,	PaymentWizardModuleConfirmation
	,	PaymentWizardModuleShowCreditTransaction
	,	PaymentWizardModuleShowPayments
	,	PaymentWizardModuleConfirmationSummary
	,	PaymentWizardModulePaymentMethodSelector

	,	OrderWizardModuleCartSummary
	,	OrderWizardModuleCartItems
	,	OrderWizardModuleShowShipments
	,	OrderWizardModuleShowPayments
	,	OrderWizardModuleTermsAndConditions
	,	OrderWizardModuleSubmitButton
	,	OrderWizardModulePaymentMethodCreditcard
	,	OrderWizardModulePaymentMethodInvoice
	,	OrderWizardModuleAddressBilling
	,	OrderWizardModulePaymentMethodSelector

	,	QuoteToSalesOrderWizardModuleQuoteDetails
	,	QuoteToSalesOrderWizardModuleConfirmation
	,	QuoteToSalesOrderWizardModulePaymentMethodSelector
	,	HeaderView
	,	Utils
	)
{
	'use strict';

	var Configuration = {

		// depending on the application we are configuring, used by the NavigationHelper.js
		currentTouchpoint: 'customercenter'

	,	modulesConfig: {
			'Cart':  {startRouter: false}
		,	'Address': {startRouter: SC.ENVIRONMENT.siteSettings.is_logged_in}
		,	'CreditCard': {startRouter: SC.ENVIRONMENT.siteSettings.is_logged_in}
		}

		// External Payment configuration.
		// You need to set the url (fragment) to redirect the customer after returns from external payment gateway.
	,	externalPayment: {
			SALESORDER: { // record type
				doneFragment: 'quotetosalesorder-confirmation'
			,	failFragment: 'quotetosalesorder-review'
			}
		,	CUSTOMERPAYMENT:
			{
				doneFragment: 'payment-confirmation'
			,	failFragment: 'review-payment'
			}
		}

	,	paymentWizardSteps: [
			{
				name: _('SELECT INVOICES TO PAY').translate()
			,	steps: [{
					url: 'make-a-payment'
				,	hideBackButton: true
				,	hideContinueButton: false
				,	modules: [
						PaymentWizardModuleInvoice
					,	[
							PaymentWizardModuleSummary
						,	{
								container: '#wizard-step-content-right'
							,	show_estimated_as_invoices_total: true
							}
						]
					]
				,	save: function ()
					{
						return jQuery.Deferred().resolve();
					}
				}]
			}
		,	{
				name: _('PAYMENT AND REVIEW').translate()
			,	steps: [
					{
						url: 'review-payment'
					,	hideBackButton: false
					,	hideContinueButton: false
					,	modules: [
							[
								PaymentWizardModuleCreditTransaction
							,	{
									transaction_type: 'deposit'
								}
							]
						,	[
								PaymentWizardModuleCreditTransaction
							,	{
									transaction_type: 'credit'
								}
							]
						,	[
								PaymentWizardModulePaymentMethodSelector
							,	{
									title: _('Payment Method').translate()
								,	record_type: 'customerpayment'
								,	modules: [
										{
											classModule: PaymentWizardModulePaymentMethodCreditcard
											,	name: _('Credit / Debit Card').translate()
											,	type: 'creditcard'
											,	options: {}
										}
									]
								}
							]
						,	[
								PaymentWizardModuleSummary
							,	{
									container: '#wizard-step-content-right'
								,	total_label: _('Payment Total').translate()
								,	submit: true
								}
							]
						,	[
								PaymentWizardModuleShowInvoices
							,	{
									container: '#wizard-step-content-right'
								}
							]
						]
					,	save: function ()
						{
							return this.wizard.model.save();
						}
					}
				,	{
						url: 'payment-confirmation'
					,	hideBackButton: true
					,	hideBreadcrumb: true
					,	hideContinueButton: true
					,	modules: [
							PaymentWizardModuleConfirmation
						,	PaymentWizardModuleShowInvoices
						,	[
								PaymentWizardModuleShowCreditTransaction
							,	{
									transaction_type: 'deposit'
								}
							]
						,	[
								PaymentWizardModuleShowCreditTransaction
							,	{
									transaction_type: 'credit'
								}
							]
						,	PaymentWizardModuleShowPayments
						,	[
								PaymentWizardModuleConfirmationSummary
							,	{
									container: '#wizard-step-content-right'
								,	submit: true
								}
							]
						]
					}
				]
			}
		]

	,	quotesToSalesOrderWizard: {
			steps: [
				{
					name: _('REVIEW YOUR ORDER').translate()
				,	steps: [
						{
							url: 'quotetosalesorder-review'
						,	name: _('Review Your Oder').translate()
						,	hideBackButton: true
						,	hideContinueButton: false
						,	continueButtonLabel: _('Place Order').translate()
						,	hideBreadcrumb: true
						,	showBottomMessage: true
						,	modules: [
								QuoteToSalesOrderWizardModuleQuoteDetails
							,	[
									OrderWizardModuleCartSummary
								,	{
										container: '#wizard-step-content-right'
									,	warningMessage: _('Total may include handling costs not displayed in the summary breakdown').translate()
									}
								]
							,	[
									OrderWizardModuleTermsAndConditions
								,	{
										container: '#wizard-step-content-right'
									,	showWrapper: true
									,	wrapperClass: 'order-wizard-termsandconditions-module-top-summary'
									}
								]
							,	[
									OrderWizardModuleTermsAndConditions
								,	{
										container: '#wizard-step-content-right'
									,	showWrapper: true
									,	wrapperClass: 'order-wizard-termsandconditions-module-bottom'
									}
								]
							,	[
									OrderWizardModuleSubmitButton
								,	{
										container: '#wizard-step-content-right'
									,	showWrapper: true
									,	wrapperClass: 'order-wizard-submitbutton-container'
									}
								]
							,	[
									QuoteToSalesOrderWizardModulePaymentMethodSelector
								,	{
										record_type: 'salesorder'
									,	modules: [
											{
												classModule: OrderWizardModulePaymentMethodCreditcard
											,	name: _('Credit / Debit Card').translate()
											,	type: 'creditcard'
											,	options: {}
											}
										,	{
												classModule: OrderWizardModulePaymentMethodInvoice
											,	name: _('Invoice').translate()
											,	type: 'invoice'
											,	options: {}
											}
										]
									}
								]
							,	[
									OrderWizardModuleAddressBilling
								,	{
										useModelAddresses: true
									,	title: _('Billing Address').translate()
									}
								]
							,	[
									OrderWizardModuleShowShipments
								,	{
										useModelAddresses: true
									,	hide_edit_cart_button: true
									}
								]
							,	[
									OrderWizardModuleTermsAndConditions
								,	{
										showWrapper: true
									,	wrapperClass: 'order-wizard-termsandconditions-module-default'
									}
								]
							]
						,	save: function ()
							{
								_.first(this.moduleInstances).trigger('change_label_continue', _('Processing...').translate());

								var self = this
								,	submit_opreation = this.wizard.model.submit();

								submit_opreation.always(function ()
								{
									_.first(self.moduleInstances).trigger('change_label_continue', _('Placed Order').translate());
								});

								return submit_opreation;
							}
						}
					]
				}
			,	{
					steps: [
						{
							url: 'quotetosalesorder-confirmation'
						,	hideContinueButton: true
						,	name: _('Thank you').translate()
						,	hideBackButton: true
						,	hideBreadcrumb: true
						,	headerView: HeaderView
						,	modules: [
								[	OrderWizardModuleCartSummary
								,	{
										container: '#wizard-step-content-right'
									,	warningMessage: _('Total may include handling costs not displayed in the summary breakdown').translate()
									}
								]
							,	QuoteToSalesOrderWizardModuleConfirmation
							,	QuoteToSalesOrderWizardModuleQuoteDetails
							,	[	OrderWizardModuleShowPayments
								,	{
										useModelAddresses: true
									}
								]
							,	[	OrderWizardModuleShowShipments
								,	{
										useModelAddresses: true
									,	hide_edit_cart_button: true
									,	hide_edit_address_button: true
									}
								]
							]
						}
					]
				}
			]
		}

	,	sca: {
			collapseElements : false
		}

	};

	// window.screen = false;
	// Calculates the width of the device, it will try to use the real screen size.
	var screen_width = Utils.getViewportWidth();

	// Phone Specific
	if (screen_width < 768)
	{
		Configuration.sca.collapseElements = true;
		BaseConfiguration.defaultPaginationSettings = BaseConfiguration.defaultPaginationSettingsPhone;
	}
	// Tablet Specific
	else if (screen_width >= 768 && screen_width <= 978)
	{
		Configuration.sca.collapseElements = true;
		BaseConfiguration.defaultPaginationSettings = BaseConfiguration.defaultPaginationSettingsTablet;
			}
	_.extend(BaseConfiguration, Configuration);
	return BaseConfiguration;
});
