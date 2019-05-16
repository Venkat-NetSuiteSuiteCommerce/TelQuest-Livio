/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard
define('OrderWizard.Module.Address'
,	[	'Wizard.Module'
	,	'Address.Edit.View'
	,	'Address.Model'
	,	'Address.Details.View'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'SC.Configuration'
	,	'GlobalViews.Confirmation.View'

	,	'order_wizard_address_module.tpl'
	,	'order_wizard_address_row.tpl'
	,	'order_wizard_address_cell.tpl'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		WizardModule
	,	AddressEditView
	,	AddressModel
	,	AddressDetailsView
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	Configuration
	,	GlobalViewsConfirmationView

	,	order_wizard_address_module_tpl
	,	order_wizard_address_row_tpl
	,	order_wizard_address_cell_tpl


	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class OrderWizard.Module.Address @extend Wizard.Module
	return WizardModule.extend({

		template: order_wizard_address_module_tpl

	,	sameAsMessage: _('Same as Address').translate()

	,	selectAddressErrorMessage: {
			errorCode: 'ERR_CHK_SELECT_AN_ADDRESS'
		,	errorMessage: _('Please select an address').translate()
		}

	,	invalidAddressErrorMessage: {
			errorCode: 'ERR_CHK_INVALID_ADDRESS'
		,	errorMessage: _('The selected address is invalid').translate()
		}

	,	events: {
			'click [data-action="submit"]': 'submit'
		,	'click [data-action="select"]': 'selectAddress'
		,	'click [data-action="change-address"]': 'changeAddressHandler'
		,	'click [data-action="remove"]': 'validateAddressRemovalHandler'
		,	'click [data-action="edit-address"]': 'editAddress'
		,	'change [data-action="same-as"]': 'markSameAsHandler'
		,	'change form': 'changeForm'
		}

	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_INVALID_ADDRESS']

	,	initialize: function ()
		{
			WizardModule.prototype.initialize.apply(this, arguments);

			BackboneCompositeView.add(this);
		}

		//@method editAddress Intercept the edition of address. When the source of addresses is extracted from the current model
		//(which is the expected behavior form now on) that address collection can contains address that are temporal or just not in the addresses
		//profile collection. One example is when you pay a quote transforming it into a sales order, the original shipping/billing address
		//used to created to quote can have been removed from profile addresses and so are added as temporal address, that when edited are created
		//@param {jQuery.Event} e
		//@return {Void}
	,	editAddress: function (e)
		{
			var address_id_str = this.$(e.target).data('id')
			,	address_id = parseInt(address_id_str, 10);

			if (_.isNaN(address_id) || !_.isNumber(address_id))
			{
				e.stopPropagation();
				e.preventDefault();

				var collection = this.getAddressCollection()
				,	selected_address = collection.get(address_id_str)
				,	view;

				selected_address.unset('internalid', {silent: true});

				view = new AddressEditView({
					application: this.wizard.application
				,	collection: collection
				,	model: selected_address
				});

				var add_new_address_on_profile = function (model)
					{
						//Make sure that the new address now take part of the profile addresses
						//This is important if a temporal address is edited more than once
						this.wizard.options.profile.get('addresses').add(model);
					}
				,	reset_current_address =  function (model)
					{
						//After saving the temp address, we set it as the one selected
						this.setAddress(model.id);
					};

				view.model.once('change', add_new_address_on_profile, this);

				//If the address being edited is the selected one we must re-set once it is created
				if (this.wizard.model.get(this.manage) === address_id_str)
				{
					view.model.once('sync', reset_current_address, this);
				}

				view.once('modal-close', function ()
				{
					view.model.off('sync', reset_current_address);
					view.model.off('change', add_new_address_on_profile);
				}, this);

				this.wizard.application.getLayout().showInModal(view);
			}
		}

		//@method render
	,	render: function (not_trigger_ready)
		{
			//Is Active is overridden by child modules, like Shipping to hide this module in Multi Ship To
			if (!this.isActive())
			{
				return this.$el.empty();
			}

			this.addresses = this.getAddressCollection();
			this.isGuest = this.getIsCurrentUserGuest();
			this.isSameAsEnabled = _.isFunction(this.options.enable_same_as) ? this.options.enable_same_as() : this.options.enable_same_as;

			this.addressId = this.model.get(this.manage);

			this.evaluateDisablingSameAsCheckBox();

			// if the selected manage address is the fake one
			if (this.addressId && ~this.addressId.indexOf('null'))
			{
				// we silently remove it
				this.setAddress(null, {
					silent: true
				});
			}

			this.evaluateSameAs();
			this.address = this.getSelectedAddress();

			// Add event listeners to allow special flows
			this.eventHandlersOn();

			this.addressView = null;
			
			// Calls the render function
			this._render();

			var is_address_new = this.address.isNew();

			// The following is used to match the logic on file order_wizard_address_module.txt
			// when the conditions apply, only the address details are shown
			// that means there are no form or list views required
			if ((this.isSameAsEnabled && this.sameAs) || this.addressId && !is_address_new)
			{
				null;
			}
			else
			{
				// if the user is a guest, and its editing the already submitted address
				// we set that address as the current one so we don't create a new address
				// in the guest's address book.
				if (this.isGuest && !is_address_new)
				{
					this.setAddress(this.address.id, {
						silent: true
					});
				}
			}

			// the module is ready when a valid address is selected.
			if (!not_trigger_ready && this.address && this.addressId && this.address.get('isvalid') === 'T')
			{
				this.trigger('ready', true);
			}

		}

		// @method enableInterface
	,	enableInterface: function ()
		{
			this.$('[data-action="change-address"]').attr('disabled', false);

			this.evaluateDisablingSameAsCheckBox();

			if (!this.disableSameAsCheckBox)
			{
				this.$('[data-action="same-as"]').attr('disabled', false);
			}
		}

		// @method evaluateDisablingSameAsCheckBox Evaluates if the same as checkbox should be enabled or not. This values is saved in the instance variable disableSameAsCheckBox
		// it is possible to indicate that if the new value is enable to ren-render the view @param {Boolean} re_render_is_change
	,	evaluateDisablingSameAsCheckBox: function (re_render_is_change)
		{
			//The other manage address is not selected AND the other temp address is not created
			var old_value = this.disableSameAsCheckBox;
			this.disableSameAsCheckBox = (this.model.get(this.sameAsManage) === undefined || this.model.get(this.sameAsManage) === null || this.model.get(this.sameAsManage) === '-------null') && !this.model.get('temp' + this.sameAsManage);
			if (old_value !== this.disableSameAsCheckBox && re_render_is_change)
			{
				this.render();
			}
		}

		// @method disableInterface
	,	disableInterface: function ()
		{
			this.$('[data-action="change-address"], [data-action="same-as"]').attr('disabled', true);
		}

		// @method getChangeLinkText This function, which is called from the template, returns the label for the change link @return {String}
	,	getChangeLinkText: function ()
		{
			return this.getIsCurrentUserGuest() ? _('Edit Address').translate() : _('Change address').translate();
		}

		// @method getIsCurrentUserGuest Returns true if the current user is logged in as Guest @return {Boolean}
	,	getIsCurrentUserGuest: function ()
		{
			return this.wizard.options.profile.get('isGuest') === 'T';
		}

		// @method validateAddressRemovalHandler Handle address removal validating that the address selected is not being used by someone else @param {HTMLEvent}e
	,	validateAddressRemovalHandler: function (e) //address_module
		{
			var address_id = jQuery(e.target).data('id');
			this.validateAddressRemoval(address_id);
		}

		// @method validateAddressRemoval Handle address removal validating that the address selected is not being used by someone else @param {String} address_id
	,	validateAddressRemoval: function (address_id) //address_module
		{
			var deleteConfirmationView
			,	body = '';

			if (this.isAddressIdValidForRemoval(address_id))
			{
				body = _('Are you sure you want to remove this address?').translate();
			}
			else
			{
				var other_address_message = this.sameAsManage === 'billaddress' ? _('(billing address)').translate() :
										this.sameAsManage === 'shipaddress' ? _('(shipping address)').translate() : '';

				body = _('The selected address is in use. $(0) Are you sure you want to delete this address?').translate(other_address_message);
			}

			deleteConfirmationView = new GlobalViewsConfirmationView({
				callBack: this.removeAddress
			,	callBackParameters: {
					context: this
				,	addressId: address_id
				}
			,	title: _('Remove Address').translate()
			,	body: body
			,	autohide: true
			});

			this.wizard.application.getLayout().showInModal(deleteConfirmationView);
		}

	,	removeAddress: function (options)
		{
			options.context.addresses.get(options.addressId).destroy({ wait: true });
		}

		// @method isAddressIdValidForRemoval Validate that the address that want to be removed is not used by the related address (sameAsManage) @returns {Boolean}
	,	isAddressIdValidForRemoval: function (address_id)
		{
			var related_address_id = this.model.get(this.sameAsManage);
			return (+address_id !== +related_address_id);
		}

		// @method evaluateSameAs
	,	evaluateSameAs: function ()
		{
			var manage_address_id = this.addressId
			,	other_address = this.getTheOtherAddress()
			,	other_address_id = other_address && other_address.get('internalid') || null;

			if (manage_address_id && manage_address_id === other_address_id)
			{
				this.sameAs = true;
			}
			else if (!this.tempAddress && manage_address_id !== other_address_id)
			{
				this.sameAs = false;
			}
			else
			{
				// We need a default sameAs value so is no longer undefined
				// if the sameAs was checked, and we have an address id set or there is a temporary address
				this.sameAs = this.sameAs && (manage_address_id || this.tempAddress || (this.isGuest && this.addresses.length));
			}
			this.model.set('sameAs', this.sameAs);
		}

		// @method eventHandlersOn
	,	eventHandlersOn: function ()
		{
			var self = this
			,	other_address = this.sameAsManage;

			this.eventHandlersOff();

			this.addresses
				// Adds events to the collection
				.on('reset sync add remove change destroy', function ()
				{
					this.render(true);
				}, this)
				.on('destroy', function (deleted_address)
				{
					// if the destroyed address was used as the sameAs
					if (self.model.get(other_address) === deleted_address.id)
					{
						// we need to remove it, as it doesn't exists
						self.model.set(other_address, null);
					}
				}, this);

			// when the value for the other address changes
			this.model
				.on('change:' + other_address, function (model, value)
				{
					// If same as is enabled and its selected
					if (self.isSameAsEnabled && self.sameAs)
					{
						// we change this manage to the value
						self.setAddress(value);
						self.render();
					}
					else if (self.isSameAsEnabled)
					{
						//This evaluation must be done despite self.sameAs is set or not to re-evaluate if the check-box status remains equal or not.
						//Ex. If in OPC neither shipping address not billing address is selected, and after that I select one shipping address, then it's require
						// to re-evaluate the state of the sameAs check-box
						this.evaluateDisablingSameAsCheckBox(true);
					}

				}, this);

			if (this.isSameAsEnabled && this.sameAs)
			{
				this.model.on('change:temp' + other_address, function (model, temp_address)
				{
					self.tempAddress = temp_address;
					self.render();
				}, this);
			}
			else if (this.isSameAsEnabled)
			{
				this.model.once('change:temp' + other_address, function ()
					{
						//The following consideration take importance in OPC.
						//Changes in the temp (other) address will take into account only if there is no a real (other) address, otherwise this generate that
						//render gets executed more than once, because is this event always get triggered by the changeForm method.

						//Problem example: When the temp address change because of submitting the other address (particularly shipping address) this will cause
						//that the billing address get re-rendered, and if the billing is not completed all errors will disappear.
						if (!this.model.get(other_address))
						{
							this.render();
						}
					}, self);
			}

			_.isFunction(this.onEventHandlersOn) && this.onEventHandlersOn();
		}

		// @method eventHandlersOff
	,	eventHandlersOff: function ()
		{
			// Removes previously added events on the address collection
			this.addresses && this.addresses.off(null, null, this);
			this.model
				.off('change:' + this.sameAsManage, null, this)
				.off('change:temp' + this.sameAsManage, null, this);

			_.isFunction(this.onEventHandlersOff) && this.onEventHandlersOff();
		}

	,	past: function ()
		{
			this.eventHandlersOff();
		}

	,	future: function ()
		{
			this.eventHandlersOff();
		}

		// @method selectAddress Captures the click on the select button of the addresses list @param {HTMLEvent} e
	,	selectAddress: function (e)
		{
			jQuery('.wizard-content .alert-error').hide();

			// Grabs the address id and sets it to the model
			// on the position in which our sub class is managing (billaddress or shipaddress)
			this.setAddress(jQuery(e.target).data('id').toString());

			// re render so if there is changes to be shown they are represented in the view
			this.render();

			// As we already set the address, we let the step know that we are ready
			this.trigger('ready', true);
		}

		// @method setAddress @param {String} address_id @param {Object} options
	,	setAddress: function (address_id, options)
		{
			this.model.set(this.manage, address_id, options);
			this.addressId = address_id;

			return this;
		}

		// @method unsetAddress @param {Boolean} norender @param {Object} options
	,	unsetAddress: function (norender, options)
		{
			this.setAddress(null, options);
			this.tempAddress = null;

			if (!norender)
			{
				this.render();
			}
		}

		// @method changeAddressHandler @param {HTMLEvent} e
	,	changeAddressHandler: function (e)
		{
			e.preventDefault();
			e.stopPropagation();

			var $link = jQuery(e.currentTarget)
			,	is_disabled = $link.attr('disabled');

			this.changeAddress(is_disabled);
		}

		// @method changeAddress @parma {Boolean} is_disabled
	,	changeAddress: function (is_disabled)
		{
			if (is_disabled)
			{
				return;
			}

			if (this.options.edit_url)
			{
				this.unsetAddress(true);

				Backbone.history.navigate(this.options.edit_url + '?force=true', {
					trigger: true
				});
			}
			else
			{
				this.unsetAddress();
			}
		}

		// @method submit. Module.submit() The step will call this function when the user clicks next or all the modules are ready
		// Will take care of saving the address if its a new one. Other way it will just
		// return a resolved promise to comply with the API
	,	submit: function ()
		{
			//Is Active is overridden by child modules, like Shipping to hide this module in Multi Ship To
			if (!this.isActive())
			{
				return jQuery.Deferred().resolve();
			}
			var self = this;
			// its a new address
			if (this.addressView)
			{
				// The saveForm function expects the event to be in an element of the form or the form itself,
				// But in this case it may be in a button outside of the form (as the nav buttons live in the step)
				//  or triggered by a module ready event, so we need to create a fake event which the target is the form itself
				var fake_event = jQuery.Event('submit', {
						target: this.addressView.$('form').get(0)
					})
					// Calls the saveForm, this may kick the backbone.validation, and it may return false if there were errors,
					// other ways it will return an Ajax promise
				,	result = this.addressView.saveForm(fake_event);

				var save_result = jQuery.Deferred();

				// Went well, so there is a promise we can return, before returning we will set the address in the model
				// and add the model to the profile collection
				if (result && !result.frontEndValidationError)
				{
					result.done(function (model)
					{
						// Set Address id to the order model. This has to go before the following self.addresses.add() as it triggers the render
						self.setAddress(model.internalid);

						// we only want to trigger an event on add() when the user has some address and is not guest because if not,
						// in OPC case (two instances of this module in the same page), the triggered re-render erase the module errors.
						var add_options = (self.isGuest || self.addresses.length === 0) ? {silent: true} : null;
						self.addresses.add(model, add_options);

						self.model.set('temp' + self.manage, null);

						self.newAddressCreated && self.newAddressCreated(model.internalid, add_options);

						self.render();

						save_result.resolve();
					});
				}
				else
				{
					// There were errors so we return a rejected promise
					save_result.reject({
						errorCode: 'ERR_CHK_INCOMPLETE_ADDRESS'
					,	errorMessage: _('The address is incomplete').translate()
					});
				}

				return save_result;
			}
			else
			{
				return this.isValid();
			}
		}

		//@method getAddressCollection Return the address collection source
		//@return {Address.Collection}
	,	getAddressCollection: function ()
		{
			return this.options.useModelAddresses ? this.wizard.model.get('addresses') : this.wizard.options.profile.get('addresses');
		}

	,	isValid: function ()
		{
			//Is Active is override by child modules, like Shipping to hide this module in Multi Ship To
			if (!this.isActive() || this.tempAddress)
			{
				return jQuery.Deferred().resolve();
			}

			var addresses = this.getAddressCollection()
			,	selected_address = addresses && addresses.get(this.model.get(this.manage));

			if (selected_address)
			{
				if (selected_address.get('isvalid') === 'T')
				{
					return jQuery.Deferred().resolve();
				}

				return jQuery.Deferred().reject(this.invalidAddressErrorMessage);
			}

			return jQuery.Deferred().reject(this.selectAddressErrorMessage);
		}

	,	changeForm: function (e)
		{
			this.model.set('temp' +  this.manage, jQuery(e.target).closest('form').serializeObject());
		}

	,	markSameAsHandler: function (e)
		{
			var is_checked = jQuery(e.target).prop('checked');
			this.markSameAs(is_checked);
		}

		// @method markSameAs @param {Boolean} is_checked
	,	markSameAs : function (is_checked)
		{
			this.sameAs = is_checked;

			this.model.set('sameAs', is_checked);

			this.setAddress(is_checked ? this.model.get(this.sameAsManage) : null);

			this.tempAddress = is_checked ? this.model.get('temp' + this.sameAsManage) : null;

			this.render();
		}

		// @method getSelectedAddress @returns the selected address
	,	getSelectedAddress: function ()
		{
			if (!this.addressId)
			{
				if (this.sameAs && this.tempAddress)
				{
					return new AddressModel(this.tempAddress);
				}

				// if the user is guest it only has 1 address for this module so we return that address or a new one
				if (this.isGuest)
				{
					return this.getFixedAddress();
				}
			}

			return this.addresses.get(this.addressId) || this.getEmptyAddress();
		}

		// @method getEmptyAddress
		// If the same as check-box is not checked
		// we return a new model with any attributes that were already typed into the address form
		// that's what the temp + this.manage is, the temporary address for this manage.
	,	getEmptyAddress: function ()
		{
			return new AddressModel(this.isSameAsEnabled && this.sameAs ? null : this.model.get('temp' + this.manage));
		}

		// @method getTheOtherAddress returns the address in the addresses collection which id is current model's sameAsManage attribute
	,	getTheOtherAddress: function ()
		{
			return this.addresses.get(this.model.get(this.sameAsManage));
		}

		// @method getAddressesToShow returns the list of addresses available for this module, if the module has enable_same_as then it removes the sameAsManage address
	,	getAddressesToShow: function ()
		{
			if(this.isGuest && this.isSameAsEnabled)
			{
				var same_as_address_id = this.model.get(this.sameAsManage);

				return new Backbone.Collection(this.addresses.reject(function (address)
				{
					return address.id === same_as_address_id;
				}));
			}
			else
			{
				return new Backbone.Collection(this.addresses.models);
			}
		}

		// @method getFixedAddress return the fixed address for this module. This is used only when user = guest
		// returns the first address to show or an empty address
	,	getFixedAddress: function ()
		{
			var addresses = this.getAddressesToShow();
			return addresses.length ? addresses.at(0) : this.getEmptyAddress();
		}

		// @method manageError @param {Object} error
	,	manageError: function (error)
		{
			if (error && error.errorCode !== 'ERR_CHK_INCOMPLETE_ADDRESS')
			{
				WizardModule.prototype.manageError.apply(this, arguments);
			}
		}

		// @method getAddressListOptions Get the object containing the options to be passed to the Address.Details view when rendering the list of available addresses
		// @return {showSelect:Boolean,selectMessage:String,hideDefaults:Boolean}
	,	getAddressListOptions: function ()
		{
			return {
				showSelect: true
			,	selectMessage: this.selectMessage || ''
			,	hideDefaults: true
			};
		}

	,	prepopulateAddressModel: function ()
		{
			if (this.wizard.isAutoPopulateEnabled && this.wizard.isAutoPopulateEnabled())
			{
				this.address.set('fullname', this.wizard.options.profile.get('firstname') + ' ' + this.wizard.options.profile.get('lastname'));
			}

			return this.address;
		}

	,	childViews: {
			'Single.Address.Details': function ()
			{
				return new AddressDetailsView({
					model: this.address
				,	hideDefaults: true
				,	manage: this.manage
				,	showChangeButton: !this.isGuest
				,	hideRemoveButton: !!this.isGuest
				,	hideActions: !this.address.id
				,	showError:true
				});
			}
		,	'New.Address.Form': function ()
			{
				this.addressView = new AddressEditView({
					application: this.wizard.application
				,	collection: this.addresses
				,	model: this.prepopulateAddressModel()
				,	manage: this.manage
				,	hideFooter: true
				,	hideHeader: true
				});

				return this.addressView;
			}
		,	'Address.List': function ()
			{
				return new BackboneCollectionView({
					collection: this.getAddressesToShow()
				,	viewsPerRow: this.itemsPerRow || (_.isDesktopDevice() ? 2 : 1)
				,	rowTemplate: order_wizard_address_row_tpl
				,	cellTemplate: order_wizard_address_cell_tpl
				,	childView: AddressDetailsView
				,	childViewOptions: this.getAddressListOptions()
				});
			}
		}

		//@method getContext @return {OrderWizard.Module.Address.Context}
	,	getContext: function ()
		{
			//@class OrderWizard.Module.Address.Context
			return {
				//@property {Boolean} showTitle
				showTitle: !!(!this.options.hide_title && this.getTitle())
				//@property {String} title
			,	title: this.getTitle()
				//@property {Boolean} isSameAsEnabled
			,	isSameAsEnabled: !!this.isSameAsEnabled
				//@property {Boolean} isSameAsCheckBoxDisable
			,	isSameAsCheckBoxDisable: !!this.disableSameAsCheckBox
				//@property {Boolean} isSameAsSelected
			,	isSameAsSelected: !!this.sameAs
				//@property {String} sameAsMessage
			,	sameAsMessage: this.sameAsMessage
				//@property {Boolean} showSingleAddressDetails
			,	showSingleAddressDetails: !!((this.isSameAsEnabled && this.sameAs) || this.addressId && !this.address.isNew()) || !!(this.getAddressesToShow().length && this.isGuest)
				//@property {Boolean} showAddressList
			,	showAddressList: !!(this.getAddressesToShow().length && !this.isGuest)
				//@property {String} changeLinkText
			,	changeLinkText: this.getChangeLinkText()
				//@property {String} selectedAddressId
			,	selectedAddressId: (this.address && this.address.get('internalid')) || ''
				//@property {Boolean} showManageValue
			,	showManageValue: !!this.manage
				//@property {Boolean} manageValue
			,	manageValue: this.manage
				//@property {Boolean} showSaveButton
			,	showSaveButton: this.showSaveButton
			};
		}
	});
});
