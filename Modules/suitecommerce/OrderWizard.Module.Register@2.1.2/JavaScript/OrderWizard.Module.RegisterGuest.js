/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard
define(
	'OrderWizard.Module.RegisterGuest'
,	[
		'Wizard.Module'
	,	'Account.Register.Model'
	,	'Profile.Model'
	,	'LoginRegister.Register.View'
	,	'GlobalViews.Message.View'
	,	'SC.Configuration'
	,	'Tracker'

	,	'order_wizard_register_guest_module.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		WizardModule
	,	AccountRegisterModel
	,	ProfileModel
	,	LoginRegisterRegisterView
	,	GlobalViewsMessageView
	,	Configuration
	,	Tracker

	,	order_wizard_register_guest_module_tpl

	,	Backbone
	,	BackboneCompositeView
	,	_
	,	jQuery
	)
{
	'use strict';

	// @class OrderWizard.Module.RegisterGuest @extends WizardModule.extend
	return WizardModule.extend({

		//@property {Function} template
		template: order_wizard_register_guest_module_tpl

		//@property {String} className
	,	className: 'OrderWizard.Module.RegisterGuest'

		//@property {Object} events
	,	events: {
			'submit form': 'saveForm'
		,	'click [data-action="remove-button"]': 'removeButton'
		}

		//@method initialize Defines this module as a composite view
	,	initialize: function ()
		{
			WizardModule.prototype.initialize.apply(this, arguments);
			BackboneCompositeView.add(this);

			var self = this;
			this.model = new AccountRegisterModel();

			Backbone.Validation.bind(this);

			this.profileModel = this.profileModel || ProfileModel.getInstance();

			// when user is successfully registered we re-render the header
			this.profileModel.on('change', function (profileModel)
			{
				if (profileModel.get('isLoggedIn') === 'T')
				{
					self.wizard.application.getLayout().updateHeader();
				}
			});
		}

	,	destroy: function ()
		{
			WizardModule.prototype.destroy.apply(this, arguments);
			this.profileModel.off(null, null, this);
		}

		//@method removeButton Removed the remove button
	,	removeButton: function ()
		{
			this.$el.find('[data-action="remove-button"]').remove();
		}

		//@property {Array<String>} errors List of errors handle by this module
	,	errors: [
			'AN_ACCOUNT_WITH_THAT_NAME_AND_EMAIL_ADDRESS_ALREADY_EXISTS'
		,	'ERR_WS_CUSTOMER_REGISTRATION'
		,	'ERR_WS_INVALID_EMAIL'
		,	'USER_ERROR'
		]

		//@method showSuccess Method called when the save operation finish successfully to show a confirmation message
	,	showSuccess: function ()
		{
			var global_view_message = new GlobalViewsMessageView({
					message: _('Account successfully created').translate()
				,	type: 'success'
			});

			this.$('form').empty().html(global_view_message.render().$el.html());
		}

		//@method trackEvent Track the creation of a user account
		//@param {Function} callback
	,	trackEvent: function (callback)
		{
			Tracker.getInstance().trackEvent({
				category: 'create-account'
			,	action: 'click'
			,	value: 1
			,	callback: callback
			});
		}

		//@method saveForm Handle the submit event of the account form
		//@param {HTMLEvent} e
	,	saveForm: function (e)
		{
			e.preventDefault();

			this.clearError();

			var self = this
			,	$target = jQuery(e.target)
			,	user_data = $target.serializeObject();

			this.model.set(user_data, {silent: true});

			if (this.model.isValid(true))
			{
				this.profileModel = this.profileModel || ProfileModel.getInstance();
				this.$savingForm = $target.closest('form');

				var button = $target.find('button');

				button && button.prop('disabled', true);

				var promise = this.model.save(user_data);

				if (promise)
				{
					promise.done(function ()
					{
						self.trackEvent();
						self.profileModel.set(self.model.get('user'));
						self.showSuccess();
					})
					.fail(function (jqXhr)
					{
						button && button.prop('disabled', false);
						jqXhr.preventDefault = true;
						self.wizard.manageError(JSON.parse(jqXhr.responseText));
					});
				}
			}
		}

		//@method saveForm Override default implementation to handle the case when the error code indicate duplicated user email
	,	showError: function ()
		{
			if (this.error && this.error.errorCode === 'AN_ACCOUNT_WITH_THAT_NAME_AND_EMAIL_ADDRESS_ALREADY_EXISTS')
			{
				this.error.errorMessage = this.error.errorMessage.replace('href=\'{1}\'', 'href="#" data-touchpoint="login"');
			}

			WizardModule.prototype.showError.apply(this, arguments);
		}

		//@method isActive Override default implementation to be active when the user is guest and registration type is not disabled
		//@return {Boolean}
	,	isActive: function ()
		{
			return this.profileModel.get('isGuest') === 'T' && Configuration.getRegistrationType() !== 'disabled';
		}

		// @property {Object} childViews
	,	childViews:
		{
			'RegisterGuestForm': function ()
			{
				this.model.set({
					firstname: this.profileModel.get('firstname')
				,	lastname: this.profileModel.get('lastname')
				,	email: this.profileModel.get('email')
				,	password: ''
				,	password2: ''
				}, { silent: true });

				return new LoginRegisterRegisterView({ showFormFieldsOnly: true, model: this.model });
			}
		}
	});

});