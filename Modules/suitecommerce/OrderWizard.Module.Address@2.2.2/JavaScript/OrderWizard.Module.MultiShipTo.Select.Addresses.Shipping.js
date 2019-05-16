/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module OrderWizard
define(
	'OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping'
,	[	'OrderWizard.Module.Address'
	,	'Address.Collection'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'GlobalViews.Message.View'

	,	'order_wizard_msr_addresses_module.tpl'

	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		OrderWizardModuleAddress
	,	AddressCollection
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	GlobalViewsMessageView

	,	order_wizard_msr_addresses_module_tpl

	,	_
	,	jQuery
	)
{
	'use strict';

	// @class OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping @extend OrderWizard.Module.Address
	return OrderWizardModuleAddress.extend({

		//@property {Function} template
		template: order_wizard_msr_addresses_module_tpl

		//@property {String} manage Defines the address being edited by the current view
	,	manage: 'shipaddress'

		//@property {String} sameAsManage
	,	sameAsManage: 'billaddress'

		//@property {Boolean} isSameAsEnabled
	,	isSameAsEnabled: false

		//@property {Object<errorMessage:String,errorCode:String>} atLeastTwoValidAddressesErrorMessage
	,	atLeastTwoValidAddressesErrorMessage: {
			errorMessage: _('You need at least 2 valid shipping addresses').translate()
		,	errorCode: 'ERR_MST_MIN_ADDRESSES'
		}

		//@property {Array<String>} errors List of errors being handle by this module
	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_INVALID_ADDRESS', 'NOT_ERR_SAVE_ADDR', 'ERR_MST_MIN_ADDRESSES']

		//@property {Object<errorCode:String>} saveAddressFakeErrorMessage
	,	saveAddressFakeErrorMessage: {
			errorCode: 'NOT_ERR_SAVE_ADDR'
		}

		//@property {Object} newEvents List of event to add to the base class
	,	newEvents: {
			'click [data-action="add-edit-addreses-link"]' : 'showAllAddresses'
		}

		// @method initialize  We override this method in order to mark as checked each address that is already checked from back-end
	,	initialize: function ()
		{
			_.extend(this.events, this.newEvents);
			_.extend(this.childViews, this.extraChildViews);
			OrderWizardModuleAddress.prototype.initialize.apply(this, arguments);

			var self = this;
			this.wizard.is_editing_addresses = false;

			this.addresses = this.wizard.options.profile.get('addresses');

			//When by options is specified that when there are enough valid addresses only show a link, this flag control if render addresses or not
			self.hide_addresses = true;

			self.showSaveButton = self.options.showSaveButton;

			self.wizard.model.on('ismultishiptoUpdated', this.render, this);

			this.addresses.once('reset', function ()
			{
				self.hide_addresses = self.hasEnoughValidAddresses();
			});

			this.addresses.on('destroy remove', function (model)
			{
				_.each(self.wizard.model.get('lines').where({shipaddress: model.id}), function (line)
				{
					line.unset('shipaddress');
					line.unset('shipmethod');
				});
			});

			self.atLeastTwoValidAddressesErrorMessage.errorMessage = _('You need at least $(0) valid shipping addresses').translate(this.minValidAddressesQuantity);
			this.wizard.model.on('ismultishiptoUpdated', _.bind(this.render, this));
		}

		//As we always want to render the complete list of addresses we never set one address
	,	setAddress: jQuery.noop

		//@property {Number} minValidAddressesQuantity
	,	minValidAddressesQuantity: 1

		//@property {Number} minSkipAddressesQuantity
	,	minSkipAddressesQuantity: 2

		// @method getIsCurrentUserGuest In the case of Multi Ship To we need to return false to support adding multiple addresses with a inline form without generating duplicated values
		// IF guest user are not supported in Multi Ship To, this should be controlled in the OrderWizard.Module.MultiShipto.EnableLink.js
		//@return {Boolean}
	,	getIsCurrentUserGuest: function ()
		{
			return false;
		}

		// @method newAddressCreated When there is no address created at all, and a new one is made this method is called by super with the id if the new address created
	,	newAddressCreated: function (id, add_options)
		{
			this.trigger('change_enable_continue', true);
			if (!add_options || add_options.silent) //This occur on guest or when the first address is created (no previous address exists)
			{
				//This event is fire in order to update/notify the MST.Addresses.Packages Module to re-render itself
				// and Address.Billing to show the new addresses created
				this.wizard.model.trigger('address_added');
			}
		}

		// @method showAllAddresses In OPC expand all this module in case it's collapsed in one link
	,	showAllAddresses: function (e)
		{
			e.preventDefault();
			this.hide_addresses = false;
			this.render();
		}

		// @method isActive Indicate if the current module need to be shown or not.
		// @return {Boolean}
	,	isActive: function ()
		{
			if (~window.location.hash.indexOf(this.options.edit_addresses_url))
			{
				this.showModule = true;
			}

			return this.wizard.isMultiShipTo() && (this.showModule ||  this.wizard.model.shippingAddressIsRequired() && !this.hasEnoughtSkipAddresses());
		}

	,	render: function ()
		{
			if (this.isActive())
			{
				jQuery('.wizard-content .alert-error').hide();
				return OrderWizardModuleAddress.prototype.render.apply(this, arguments);
			}

			this.$el.empty();

			if (!this.isMultShipToAddressListMandatory)
			{
				this.trigger('change_visible_back', false);
			}
			if (this.wizard.is_editing_addresses)
			{
				this.wizard.is_editing_addresses = false;
			}
		}

		// @method submit Save the current model
		// @return {jQuery.Deferred}
	,	submit: function ()
		{
			jQuery('.wizard-content .alert-error').hide();

			this.$('.multishipto-save-address-btn').attr('disabled', true);

			var super_result = OrderWizardModuleAddress.prototype.submit.apply(this, arguments)
			,	self = this
			,	result = jQuery.Deferred();

			super_result.always(function ()
			{
				self.$('.multishipto-save-address-btn').attr('disabled', false);
			});

			if (this.addressView)
			{
				super_result.then(function ()
					{
						result.reject(self.saveAddressFakeErrorMessage);
					}, result.reject);

				return result;
			}

			return super_result;
		}

		// @method getValidAddreses Returns the list of valid addresses
		// @return {Address.Model}
	,	getValidAddreses: function ()
		{
			return this.addresses.where({isvalid: 'T'});
		}

		// @method hasEnoughtSkipAddresses Determines if the quantity of valid addresses is enough to skip this module, used by the proxy to not show this step
		// @return {Boolean}
	,	hasEnoughtSkipAddresses: function ()
		{
			return this.getValidAddreses().length >= this.minSkipAddressesQuantity;
		}

		// @method hasEnoughValidAddresses Determines if the quantity of valid addresses is enough to validate this module
	,	hasEnoughValidAddresses: function ()
		{
			return this.getValidAddreses().length >= this.minValidAddressesQuantity;
		}

		// @method isValid This module will be valid only if MSR is NOT enable OR at least one address is valid and selected
		// @return {jQuery.Deferred}
	,	isValid: function ()
		{
			if (!this.wizard.model.get('ismultishipto') || this.hasEnoughValidAddresses())
			{
				return jQuery.Deferred().resolve();
			}

			return jQuery.Deferred().reject(this.atLeastTwoValidAddressesErrorMessage);
		}

		// @method manageError Handle the fake error throw by the Save method
	,	manageError: function (error)
		{
			if (error && error.errorCode !== 'NOT_ERR_SAVE_ADDR')
			{
				OrderWizardModuleAddress.prototype.manageError.apply(this, arguments);
			}
		}

		// @method getAddressListOptions Get the object containing the options to be passed to the Address.Details view when rendering the list of available addresses
		// @return {showSelect:Boolean,showMultiSelect:Boolean,selectMessage:String,hideDefaults:Boolean,showError:Boolean}
	,	getAddressListOptions: function ()
		{
			return {
				showSelect: false
			,	showMultiSelect: false
			,	selectMessage: this.selectMessage || ''
			,	hideDefaults: true
			,	showError: true
			};
		}

		// @method getContext
		// @return {OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping.Context}
	,	getContext: function ()
		{
			var has_enough_valid_addresses = this.hasEnoughValidAddresses();

			// @class OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping
			return {
				// @property {Boolean} showTitle
				showTitle: !!(!this.options.hide_title && this.getTitle())
				// @property {Stirng} title
			,	title: this.getTitle()
				// @property {Boolean} showCollapsedView
			,	showCollapsedView: !!(this.options.hide_if_valid_addresses && has_enough_valid_addresses && this.hide_addresses)
				// @property {Boolean} isAddressListLengthGreaterThan0
			,	isAddressListLengthGreaterThan0: this.getAddressesToShow().length > 0
				// @property {Boolean} showManageValue
			,	showManageValue: !!this.manage
				// @property {String} manageValue
			,	manageValue: this.manage
				// @property {Boolean} hasEnoughValidAddresses
			,	hasEnoughValidAddresses: has_enough_valid_addresses
				// @property {Boolean} showSaveButton
			,	showSaveButton: this.showSaveButton
			};
			// @class OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping
		}
	});
});