/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define('PaymentWizard.Module.Addresses'
,	[	'OrderWizard.Module.Address.Billing'
	,	'underscore'
	,	'jQuery'
	,	'Utils'

	]
,	function (
		OrderWizardModuleAddressBilling
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class PaymentWizard.Module.Addresses @extend OrderWizard.Module.Address.Billing
	return OrderWizardModuleAddressBilling.extend({

		itemsPerRow: _.isDesktopDevice() ? 3 : 2

	,	className: 'PaymentWizard.Module.Addresses'

	,	initialize: function (options)
		{
			OrderWizardModuleAddressBilling.prototype.initialize.apply(this, arguments);
			this.wizard.model.on('change:payment', jQuery.proxy(this, 'changeTotal'));
			this.itemsPerRow = _.result(options,'itemsPerRow') || this.itemsPerRow;
		}

	,	changeTotal: function ()
		{
			var was = this.model.previous('payment')
			,	was_confirmation = this.model.previous('confirmation')
			,	is = this.model.get('payment');

			// Changed from or to 0
			if (((was === 0 && is !== 0) || (was !== 0 && is === 0)) && !was_confirmation)
			{
				this.render();
			}
		}

   ,    getSelectedAddress: function ()
		{
			if (!this.addressId && !this.unset)
			{
				var default_address = this.addresses.findWhere({
					defaultbilling: 'T'
				});

				this.addressId = default_address && default_address.id;

				if (this.addressId)
				{
					this.model.set(this.manage, this.addressId);
				}
			}

			return this.addresses.get(this.addressId) || this.getEmptyAddress();
		}

	,   unsetAddress: function ()
		{
			this.unset = true;
			OrderWizardModuleAddressBilling.prototype.unsetAddress.apply(this, arguments);
		}

	,	isValid: function()
		{
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}
			else
			{
				return OrderWizardModuleAddressBilling.prototype.isValid.apply(this, arguments);
			}
		}

	,	isActive: function()
		{
			if (this.wizard.hidePayment())
			{
				return false;
			}

			return OrderWizardModuleAddressBilling.prototype.isActive.apply(this, arguments);
		}

	});
});