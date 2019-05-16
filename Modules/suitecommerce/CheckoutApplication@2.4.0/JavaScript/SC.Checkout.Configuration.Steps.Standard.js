/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CheckoutApplication
// @class SCA.Checkout.Configuration.Steps.OPC
// The configuration steps so the Checkout wizard shows the Standard Flow experience
define(
	'SC.Checkout.Configuration.Steps.Standard'
,	[
		'underscore'
	,	'Utils'
	,	'OrderWizard.Module.MultiShipTo.EnableLink'
	,	'OrderWizard.Module.CartSummary'
	,	'OrderWizard.Module.Address.Shipping'
	,	'OrderWizard.Module.PaymentMethod.GiftCertificates'
	,	'OrderWizard.Module.PaymentMethod.Selector'
	,	'OrderWizard.Module.PaymentMethod.PurchaseNumber'
	,	'OrderWizard.Module.Address.Billing'
	,	'OrderWizard.Module.RegisterEmail'
	,	'OrderWizard.Module.ShowPayments'
	,	'OrderWizard.Module.SubmitButton'
	,	'OrderWizard.Module.TermsAndConditions'
	,	'OrderWizard.Module.Confirmation'
	,	'OrderWizard.Module.RegisterGuest'
	,	'OrderWizard.Module.PromocodeForm'
	,	'OrderWizard.Module.PromocodeNotifications'

	,	'OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping'
	,	'OrderWizard.Module.MultiShipTo.Package.Creation'
	,	'OrderWizard.Module.MultiShipTo.Package.List'
	,	'OrderWizard.Module.NonShippableItems'
	,	'OrderWizard.Module.MultiShipTo.Shipmethod'
	,	'OrderWizard.Module.Shipmethod'
	,	'OrderWizard.Module.ShowShipments'
 	,	'OrderWizard.Module.CartItems'
	,	'OrderWizard.Module.CartItems.PickupInStore'
	,	'OrderWizard.Module.CartItems.Ship'
	,	'OrderWizard.Module.CartItems.PickupInStore.List'
	,	'Header.View'

	]
,	function (
		_
	,	Utils
	,	OrderWizardModuleMultiShipToEnableLink
	,	OrderWizardModuleCartSummary
	,	OrderWizardModuleAddressShipping
	,	OrderWizardModulePaymentMethodGiftCertificates
	,	OrderWizardModulePaymentMethodSelector
	,	OrderWizardModulePaymentMethodPurchaseNumber
	,	OrderWizardModuleAddressBilling
	,	OrderWizardModuleRegisterEmail
	,	OrderWizardModuleShowPayments
	,	OrderWizardModuleSubmitButton
	,	OrderWizardModuleTermsAndConditions
	,	OrderWizardModuleConfirmation
	,	OrderWizardModuleRegisterGuest
	,	OrderWizardModulePromocodeForm
	,	OrderWizardModulePromocodeNotification

	,	OrderWizardModuleMultiShipToSelectAddressesShipping
	,	OrderWizardModuleMultiShipToPackageCreation
	,	OrderWizardModuleMultiShipToPackageList
	,	OrderWizardModuleNonShippableItems
	,	OrderWizardModuleMultiShipToShipmethod
	,	OrderWizardModuleShipmethod
	,	OrderWizardModuleShowShipments
 	,	OrderWizardModuleCartItems
	,	OrderWizardModuleCartItemsPickupInStore
	,	OrderWizardModuleCartItemsShip
	,	OrderWizardModuleCartItemsPickupInStoreList
	,	HeaderView
	)
{
	'use strict';

	var mst_delivery_options = 	{
			is_read_only: false
		,	show_edit_address_url: false
		,	hide_accordion: true
		,	collapse_items: true
		}

	,	show_shipment_options = {
			edit_url: '/shipping/address'
		,	show_edit_address_url: true
		,	hide_title: true
		,	edit_shipment_url: 'shipping/addressPackages'
		,	edit_shipment_address_url: 'shipping/selectAddress'
		,	is_read_only: false
		,	show_combo: true
		,	show_edit_button: true
		,	hide_item_link: true
		}

	,	cart_summary_options = {
			exclude_on_skip_step: true
		,	allow_remove_promocode: true
		,	container: '#wizard-step-content-right'
			}

	,	cart_items_options_right = {
			container: '#wizard-step-content-right'
		,	hideHeaders: true
		,	showMobile: true
		,	exclude_on_skip_step: true
		,	showOpenedAccordion: _.isTabletDevice() || _.isDesktopDevice() || false
	}

	,	cart_items_non_shippable_options_right = _.extend(
			{
				title: _('Other Items').translate()
			,	show_mobile: true
			,	show_table_header: false
			,	show_edit_cart_button: true
			}

		,	cart_items_options_right
	);

	return [
			{
				name: _('Shipping Address').translate()
			,	steps: [
					{
						name: _('Choose Shipping Address').translate()
					,	url: 'shipping/address'
					,	isActive: function ()
						{
							return !this.wizard.isMultiShipTo();
						}
					,	modules: [
							[OrderWizardModulePromocodeNotification, {exclude_on_skip_step: true}]
						,	OrderWizardModuleMultiShipToEnableLink
						,	OrderWizardModuleAddressShipping
						,	[OrderWizardModuleShipmethod, mst_delivery_options]
						,	[OrderWizardModuleCartSummary, cart_summary_options]
						,	[OrderWizardModulePromocodeForm, cart_items_options_right]
						,	[
								OrderWizardModuleCartItemsShip
							,	_.extend(
									{
										show_opened_accordion: _.isDesktopDevice()
									,	show_edit_cart_button: true
									,	show_headers: false
									,	show_mobile: true
									}
								,	cart_items_options_right
								)
							]
						,	[
								OrderWizardModuleCartItemsPickupInStore
							,	_.extend(
									{
										show_opened_accordion: false
									,	show_edit_cart_button: true
									,	show_headers: false
									,	show_mobile: true
									}
								,	cart_items_options_right
								)
							]
						,	[OrderWizardModuleNonShippableItems, cart_items_non_shippable_options_right]
						]
					}
				,	{
						name: _('Enter Shipping Address').translate()
					,	url: 'shipping/selectAddress'
					,	isActive: function ()
						{
							return this.wizard.isMultiShipTo();
						}
					,	modules: [
							[OrderWizardModuleMultiShipToEnableLink, {exclude_on_skip_step: true}]
						,	[OrderWizardModuleMultiShipToSelectAddressesShipping, {edit_addresses_url: 'shipping/selectAddress' }]
						,	[OrderWizardModuleCartSummary, cart_summary_options]
						,	[OrderWizardModulePromocodeForm, cart_items_options_right]
						]
					}
				]
			}
		,	{
				name: _('Set shipments').translate()
			,	steps: [
					{
						name: _('Set shipments').translate()
					,	isActive: function ()
						{
							return this.wizard.isMultiShipTo();
						}
					,	url: 'shipping/addressPackages'
					,	modules: [
							[OrderWizardModuleMultiShipToEnableLink, {change_url: 'shipping/address'}]
						,	[OrderWizardModuleMultiShipToPackageCreation, {edit_addresses_url: 'shipping/selectAddress'}]
						,	OrderWizardModuleMultiShipToPackageList
						,	OrderWizardModuleNonShippableItems
						,	[OrderWizardModuleCartSummary, cart_summary_options]
						,	[OrderWizardModulePromocodeForm, cart_items_options_right]
						]
					}
				]
			}
		,	{
				name: _('Delivery Method').translate()
			,	steps: [
					{
						name: _('Choose delivery method').translate()
					,	url: 'shipping/packages'
					,	isActive: function ()
						{
							return this.wizard.isMultiShipTo();
						}
					,	modules: [
							[OrderWizardModuleMultiShipToShipmethod, mst_delivery_options]
						,	[OrderWizardModuleNonShippableItems, mst_delivery_options]
						,	[OrderWizardModuleCartSummary, cart_summary_options]
						,	[OrderWizardModulePromocodeForm, cart_items_options_right]
						]
					}
				]
			}
		,	{
				name: _('Payment').translate()
			,	steps: [
					{
						name: _('Choose Payment Method').translate()
					,	url: 'billing'
					,	bottomMessage: _('You will have an opportunity to review your order on the next step.').translate()
					,	modules: [
							[OrderWizardModulePromocodeNotification, {exclude_on_skip_step: true}]
						,	OrderWizardModulePaymentMethodGiftCertificates
						,	[OrderWizardModulePaymentMethodSelector, {record_type:'salesorder', prevent_default: true}]
						,	OrderWizardModulePaymentMethodPurchaseNumber
						,	[OrderWizardModuleAddressBilling
							,	{
									enable_same_as: function ()
									{
										return !this.wizard.isMultiShipTo() && this.wizard.model.shippingAddressIsRequired();
									}
								,	title: _('Enter Billing Address').translate()
								,	select_shipping_address_url: 'shipping/selectAddress'
								}
							]
						,	OrderWizardModuleRegisterEmail
						,	[OrderWizardModuleCartSummary, cart_summary_options]
						,	[OrderWizardModulePromocodeForm, cart_items_options_right]
						,	[
								OrderWizardModuleCartItemsPickupInStore
							,	_.extend(
									{
										show_opened_accordion: false
									,	show_edit_cart_button: true
									,	show_headers: false
									,	show_mobile: true
									}
								,	cart_items_options_right
								)
							]
						,	[
								OrderWizardModuleCartItemsShip
							,	_.extend(
									{
										show_opened_accordion: false
									,	show_edit_cart_button: true
									,	show_headers: false
									,	show_mobile: true
									}
								,	cart_items_options_right
								)
							]
						,	[OrderWizardModuleNonShippableItems, cart_items_non_shippable_options_right]
						]
					}
				]
			}
		,	{
				name: _('Review').translate()
			,	steps: [
					{
						name: _('Review Your Order').translate()
					,	url: 'review'
					,	continueButtonLabel: function () { return this.wizard && this.wizard.isExternalCheckout() ? _('Continue to External Payment').translate() : _('Place Order').translate(); }
					,	bottomMessage: function () { return this.wizard && this.wizard.isExternalCheckout() ? _('You will be redirected to a secure site to confirm your payment.').translate() : ''; }
					,	modules: [
							[	//Mobile Top
								OrderWizardModuleTermsAndConditions
							,	{
									className: 'order-wizard-termsandconditions-module-top'
								}
							]
						,	[	//Mobile Top
								OrderWizardModuleSubmitButton
							,	{
									className: 'order-wizard-submitbutton-module-top'
								}
							]
						,	[OrderWizardModulePromocodeNotification, {exclude_on_skip_step: true}]
						,	[
								OrderWizardModuleCartItemsPickupInStoreList
							,	{
									show_opened_accordion: _.isDesktopDevice()
								,	is_accordion_primary: true
								,	show_edit_cart_button: true
								,	show_headers: false
								,	show_mobile: true
								}
							]
						,	[
								OrderWizardModuleShowShipments
							,	_.extend(
									_.clone(show_shipment_options)
								,	{
										// edit_url: false
									}
								)
							]

						,	[OrderWizardModuleMultiShipToShipmethod, show_shipment_options]

						,	[
								OrderWizardModuleNonShippableItems
							,	{
									show_mobile: false
								,	show_table_header: true
								,	show_opened_accordion: _.isDesktopDevice()
								,	is_accordion_primary: true
								,	show_edit_cart_button: true
								}
							]

						,	[OrderWizardModuleShowPayments, {edit_url_billing: '/billing', edit_url_address: '/billing'}]
						,	[	//Desktop Bottom
								OrderWizardModuleTermsAndConditions
							,	{
									className: 'order-wizard-termsandconditions-module-default'
								}
							]
						,	[OrderWizardModuleCartSummary, cart_summary_options]
						,	[	//Desktop Right
								OrderWizardModuleTermsAndConditions
							,	{
									container: '#wizard-step-content-right'
								,	className: 'order-wizard-termsandconditions-module-top-summary'
								}
							]
						,	[	OrderWizardModuleSubmitButton
							,	{
									container: '#wizard-step-content-right'
								,	showWrapper: true
								,	wrapperClass: 'order-wizard-submitbutton-container'
								}
						]
						,	[OrderWizardModulePromocodeForm, cart_items_options_right]
						,	[
								//Mobile Right Bottom
								OrderWizardModuleTermsAndConditions
							,	{
									className: 'order-wizard-termsandconditions-module-bottom'
								,	container: '#wizard-step-content-right'
								}
							]
						]
					,	save: function()
						{

							if (SC.CONFIGURATION.isThreeDSecureEnabled)
							{

								var promise = this.wizard.model.submit();

			                    return this.wizard.start3DSecure(promise);
							}
							else
							{

								_.first(this.moduleInstances).trigger('change_label_continue', _('Processing...').translate());

								var self = this
								,	submit_operation = this.wizard.model.submit();

								submit_operation.always(function ()
								{
									_.first(self.moduleInstances).trigger('change_label_continue');
								});

								return submit_operation;
							}
						}
					}
				,	{
						url: 'confirmation'
					,	hideContinueButton: true
					,	hideBackButton: true
					,	hideBreadcrumb: true
					,	headerView: HeaderView
					,	modules: [
							[OrderWizardModuleConfirmation, {additional_confirmation_message: _('You will receive an email with this confirmation in a few minutes.').translate()}]
						,	[OrderWizardModuleRegisterGuest]
						,	[OrderWizardModuleCartSummary, _.extend({hideSummaryItems: true, show_promocode_form: false, allow_remove_promocode: false, isConfirmation: true}, cart_summary_options)]
						]
					}
				]
			}
	];
});