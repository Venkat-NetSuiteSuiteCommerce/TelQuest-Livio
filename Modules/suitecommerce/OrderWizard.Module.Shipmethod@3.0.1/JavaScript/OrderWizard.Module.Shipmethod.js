/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard.Module.Shipmethod
define(
	'OrderWizard.Module.Shipmethod'
,	[	'Wizard.Module'
	,	'Profile.Model'
	,	'GlobalViews.Message.View'

	,	'order_wizard_shipmethod_module.tpl'

	,	'underscore'
	,	'jQuery'
	]
,	function (
		WizardModule
	,	ProfileModel
	,	GlobalViewsMessageView

	,	order_wizard_shipmethod_module_tpl

	,	_
	,	jQuery
	)
{
	'use strict';
	//@class OrderWizard.Module.Shipmethod @extends Wizard.Module
	return WizardModule.extend({

		//@property {Function} template
		template: order_wizard_shipmethod_module_tpl
		//@property {Object} events
	,	events: {
			'change [data-action="select-delivery-option"]': 'changeDeliveryOptions'
		,	'click [data-action="select-delivery-option-radio"]': 'changeDeliveryOptions'
		}
		//@property {Array} errors
	,	errors: ['ERR_CHK_SELECT_SHIPPING_METHOD','ERR_WS_INVALID_SHIPPING_METHOD']
		//@method initialize
	,	initialize: function ()
		{
			this.waitShipmethod = SC.ENVIRONMENT.CART ? !SC.ENVIRONMENT.CART.shipmethod : !(this.model && this.model.get('shipmethod'));

			this.profileModel = ProfileModel.getInstance();

			this.addresses = this.profileModel.get('addresses');

			WizardModule.prototype.initialize.apply(this, arguments);
			// So we allways have a the reload promise
			this.reloadMethodsPromise = jQuery.Deferred().resolve();
			this.wizard.model.on('ismultishiptoUpdated', _.bind(this.render, this));
		}

	,	isActive: function ()
		{
			var is_shipping_required = this.wizard.model.shippingAddressIsRequired();
			if (!is_shipping_required)
			{
				this.wizard.model.unset('shipmethod');
			}
			return is_shipping_required && !this.wizard.model.get('ismultishipto');
		}

		//@method present
	,	present: function ()
		{
			this.currentAddress = this.previousAddress = this.model.get('shipaddress');
			this.eventHandlersOn();
		}
		//@method future
	,	future: function()
		{
			this.currentAddress = this.previousAddress = this.model.get('shipaddress');
			this.eventHandlersOn();
		}
		//@method past
	,	past: function()
		{
			this.waitShipmethod = !this.model.get('shipmethod');
			this.currentAddress = this.previousAddress = this.model.get('shipaddress');
			this.eventHandlersOn();
		}
		//@method eventHandlersOn
	,	eventHandlersOn: function ()
		{
			// Removes any leftover observer
			this.eventHandlersOff();
			// Adds the observer for this step
			this.model.on('change:shipaddress', this.shipAddressChange, this);

			this.model.on('change:shipmethods', function ()
			{
				_.defer(_.bind(this.render, this));
			}, this);

			var selected_address = this.addresses.get(this.currentAddress);

			if (selected_address)
			{
				selected_address.on('sync', jQuery.proxy(this, 'reloadMethods'), this);
			}
		}
		//@method eventHandlersOff
	,	eventHandlersOff: function ()
		{
			// removes observers
			this.model.off('change:shipmethods', null, this);
			this.model.off('change:shipaddress', this.shipAddressChange, this);

			var current_address = this.addresses.get(this.currentAddress)
			,	previous_address = this.addresses.get(this.previousAddress);

			if (current_address)
			{
				current_address.off('change:country change:zip', null, this);
				current_address.off('sync');
			}

			if (previous_address && previous_address !== current_address)
			{
				previous_address.off('change:country change:zip', null, this);
			}
		}
		//@method render
	,	render: function ()
		{
			if (this.state === 'present')
			{
				if (this.model.get('shipmethod') && !this.waitShipmethod)
				{
					this.trigger('ready', true);
				}
				this._render();
			}
		}
		//@method shipAddressChange
	,	shipAddressChange: function (model, value)
		{
			this.currentAddress = value;

			var order_address = this.model.get('addresses')
			,	previous_address = this.previousAddress && (order_address.get(this.previousAddress) || this.addresses.get(this.previousAddress))
			,	current_address = this.currentAddress && order_address.get(this.currentAddress) || this.addresses.get(this.currentAddress)
			,	changed_zip = previous_address && current_address && previous_address.get('zip') !== current_address.get('zip')
			,	changed_state = previous_address && current_address && previous_address.get('state') !== current_address.get('state')
			,	changed_country = previous_address && current_address && previous_address.get('country') !== current_address.get('country');

			// if previous address is equal to current address we compare the previous values on the model.
			if (previous_address && current_address && previous_address === current_address)
			{
				changed_zip = current_address.previous('zip') !== current_address.get('zip');
				changed_country = current_address.previous('country') !== current_address.get('country');
				changed_state = current_address.previous('state') !== current_address.get('state');
			}

			// reload ship methods only if there is no previous address or when change the country or zipcode
			if ((!previous_address && current_address) || changed_zip || changed_country || changed_state)
			{
				// if its selected a valid address, reload Methods
				if (this.model.get('isEstimating') || this.addresses.get(this.model.get('shipaddress')))
				{
					this.reloadMethods();
				}
			}
			else
			{
				this.render();
			}

			if (value)
			{
				this.previousAddress = value;
			}

			// if we select a new address, bind the sync method for possible address edits
			if (this.currentAddress)
			{
				var selected_address = this.addresses.get(this.currentAddress);
				if(selected_address)
				{
					selected_address.on('sync', jQuery.proxy(this, 'reloadMethods'), this);
				}

				// if there was a different previous address, remove the sync handler
				if(this.previousAddress && this.previousAddress !== this.currentAddress)
				{
					var previous_selected_address = this.addresses.get(this.previousAddress);
					if(previous_selected_address)
					{
						previous_selected_address.off('sync');
					}
				}
			}
		}

		//@method reloadMethods
	,	reloadMethods: function reloadMethods ()
		{
			if (this.model.get('confirmation').internalid ||  this.model.get('confirmation').id )
			{
				return;
			}
			// to reload the shipping methods we just save the order
			var self = this
			,	$container = this.$el;

			$container.addClass('loading');

			// Abort the previous ajax call
			this.reloadMethodsPromise.abort && this.reloadMethodsPromise.abort();
			this.reloadingMethods = true;
			this.render();
			this.reloadMethodsPromise = this.model
				.save(null, {
					parse: false
				,	success: function (model, attributes)
					{
						model.set({
								shipmethods: attributes.shipmethods
							,	shipmethod: attributes.shipmethod
							,	summary: attributes.summary
						});
					}
				})
				.always(function (xhr)
				{
					// .always() method is excecuted even if the ajax call was aborted
					if (xhr.statusText !== 'abort')
					{
						$container.removeClass('loading');
						self.render();
						self.step.enableNavButtons();
						self.reloadingMethods = false;
					}
				});

			if (this.reloadMethodsPromise.state() === 'pending')
			{
				self.step.disableNavButtons();
			}
		}

		//@method submit
	,	submit: function submit ()
		{
			return this.isValid();
		}

		//@method isValid
	,	isValid: function isValid ()
		{
			var model = this.model
			,	valid_promise = jQuery.Deferred();

			this.reloadMethodsPromise.always(function ()
			{
				if (model.get('shipmethod') && model.get('shipmethods').get(model.get('shipmethod')))
				{
					valid_promise.resolve();
				}
				else
				{
					valid_promise.reject({
						errorCode: 'ERR_CHK_SELECT_SHIPPING_METHOD'
					,	errorMessage: _('Please select a delivery method').translate()
					});
				}
			});

			return valid_promise;
		}

		//@method changeDeliveryOptions
	,	changeDeliveryOptions: function changeDeliveryOptions (e)
		{
			var self = this
			,	target = jQuery(e.currentTarget)
			,	targetValue = target.val() || target.attr('data-value');

			this.waitShipmethod = true;
			this.model.set('shipmethod', targetValue);
			this.step.disableNavButtons();
			this.model.save().always(function()
			{
				self.clearError();
				self.step.enableNavButtons();
			});
		}

		//@method showError render the error message
	,	showError: function showError ()
		{

			var global_view_message = new GlobalViewsMessageView({
					message: this.error.errorMessage
				,	type: 'error'
				,	closable: true
			});

			// Note: in special situations (like in payment-selector), there are modules inside modules, so we have several place holders, so we only want to show the error in the first place holder.
			this.$('[data-type="alert-placeholder-module"]:first').html(
				global_view_message.render().$el.html()
			);

			this.error = null;

		}

		//@method getContext
		//@returns {OrderWizard.Module.Shipmethod.Context}
	,	getContext: function getContext ()
		{

			var self = this
			,	show_enter_shipping_address_first = !this.model.get('isEstimating') && !this.profileModel.get('addresses').get(this.model.get('shipaddress'))
			,	shipping_methods = this.model.get('shipmethods').map(function (shipmethod)
				{
					return {
							name: shipmethod.get('name')
						,	rate_formatted: shipmethod.get('rate_formatted')
						,	internalid: shipmethod.get('internalid')
						,	isActive: shipmethod.get('internalid') === self.model.get('shipmethod')
					};
				});

			//@class OrderWizard.Module.Shipmethod.Context
			return {
					//@property {LiveOrder.Model} model
					model: this.model
					//@property {Boolean} showEnterShippingAddressFirst
				,	showEnterShippingAddressFirst: show_enter_shipping_address_first
					//@property {Boolean} showLoadingMethods
				,	showLoadingMethods: this.reloadingMethods
					//@property {Boolean} hasShippingMethods
				,	hasShippingMethods: !!shipping_methods.length
					//@property {Boolean} display select instead of radio buttons
				,	showSelectForShippingMethod: shipping_methods.length > 5
					//@property {Array} shippingMethods
				,	shippingMethods: shipping_methods
					//@property {Boolean} showTitle
				,	showTitle: !this.options.hide_title
					//@property {Straing} title
				,	title: this.options.title || _('Delivery Method').translate()
			};
			//@class OrderWizard.Module.Shipmethod
		}
	});
});
