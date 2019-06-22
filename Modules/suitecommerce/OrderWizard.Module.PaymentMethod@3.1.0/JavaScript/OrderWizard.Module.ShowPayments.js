/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard.Module.PaymentMethod
define(
	'OrderWizard.Module.ShowPayments'
,	[	'Wizard.Module'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Address.Details.View'
	,	'GlobalViews.FormatPaymentMethod.View'

	,	'order_wizard_showpayments_module.tpl'

	,	'underscore'
	]
,	function (
		WizardModule
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	AddressDetailsView
	,	GlobalViewsFormatPaymentMethodView

	,	order_wizard_showpayments_module_tpl

	,	_
	)
{
	'use strict';
	//@class OrderWizard.Module.ShowPayments @extends Wizard.Module
	return WizardModule.extend(
	{
		//@property {Function} template
		template: order_wizard_showpayments_module_tpl
		//@property {String} className
	,	className: 'OrderWizard.Module.ShowPayments'
		//@method initialize
	,	initialize: function()
		{
			WizardModule.prototype.initialize.apply(this, arguments);
			this.application = this.wizard.application;

			this.profile = this.wizard.options.profile;
			this.addressSource =this.options.useModelAddresses ? this.model.get('addresses') : this.profile.get('addresses');
			BackboneCompositeView.add(this);
		}
		//@method getPaymentmethods
	,	getPaymentmethods: function ()
		{
			return _.reject(this.model.get('paymentmethods').models, function (paymentmethod)
			{
				return paymentmethod.get('type') === 'giftcertificate';
			});
		}
		//@method getGiftCertificates
	,	getGiftCertificates: function ()
		{
			return this.model.get('paymentmethods').where({type: 'giftcertificate'});
		}
		//@method past
	,	past: function ()
		{
			this.model.off('change', this.totalChange, this);
			this.addressSource.off('change', this.render, this);
		}
		//@method present
	,	present: function ()
		{
			this.model.off('change', this.totalChange, this);
			this.addressSource.off('change', this.render, this);

			this.model.on('change', this.totalChange, this);
			this.addressSource.on('change', this.render, this);
		}
		//@method future
	,	future: function ()
		{
			this.model.off('change', this.totalChange, this);
			this.addressSource.off('change', this.render, this);
		}
		//@method totalChange
	,	totalChange: function ()
		{
			var was = this.model.previous('summary').total
			,	was_confirmation = this.model.previous('confirmation')
			,	is = this.model.get('summary') && this.model.get('summary').total;

			// Changed from or to 0
			if (((was === 0 && is !== 0) || (was !== 0 && is === 0)) && !was_confirmation)
			{
				this.render();
			}
		}
		//@property {Object} childViews
	,	childViews: {
			'Billing.Address': function ()
				{
					return new AddressDetailsView({
							model: this.addressSource.get(this.model.get('billaddress'))
						,	hideActions: true
						,	hideDefaults: true
						,	manage: 'billaddress'
					});
				}
			,	'GiftCertificates.Collection': function ()
				{
					return new BackboneCollectionView({
							collection: this.getGiftCertificates()
						,	viewsPerRow: 1
						,	childView: GlobalViewsFormatPaymentMethodView
					});
				}
			,	'PaymentMethods.Collection': function ()
				{
					return new BackboneCollectionView({
							collection: this.getPaymentmethods()
						,	viewsPerRow: 1
						,	childView: GlobalViewsFormatPaymentMethodView
					});
				}
		}
		//@method showPayments Indicate if in the rendering process payment method must be shown or not
		//@return {Boolean}
	,	showPayments: function()
		{
			if (this.options.hidePayment)
			{
				return false;
			}
			return !!(this.getGiftCertificates().length || this.getPaymentmethods().length || !this.wizard.hidePayment());
		}
		//@method getContext
		//@returns {OrderWizard.Module.ShowPayments.Context}
	,	getContext: function ()
		{
			var billing_address = this.addressSource.get(this.model.get('billaddress'))
			,	giftcertificates = this.getGiftCertificates()
			,	edit_url_billing = _.isFunction(this.options.edit_url_billing) ? this.options.edit_url_billing.apply(this) : this.options.edit_url_billing;

			//@class OrderWizard.Module.ShowPayments.Context
			return {
					//@property {Boolean} showBilling
					showBilling: !this.options.hideBilling
					//@property {Boolean} showBillingAddress
				,	showBillingAddress: !!billing_address
					//@property {Boolean} showEditBillingButton
				,	showEditBillingButton: !!(billing_address  && edit_url_billing)
					//@property {String} editBillingUrl
				,	editBillingUrl: edit_url_billing
					//@property {Boolean} showPayments
				,	showPayments: this.showPayments()
					//@property {Boolean} showGuestEmail
				,	showGuestEmail: this.profile.get('isGuest') === 'T'
					//@property {String} guestEmail
				,	guestEmail: this.profile.get('email')
					//@property {Boolean} showGiftcertificates
				,	showGiftcertificates: !!giftcertificates.length
			};
		}
	});
});