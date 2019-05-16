/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module OrderWizard
define(
	'OrderWizard.Step'
,	[
		'Wizard.Step'
	,	'order_wizard_step.tpl'
	,	'underscore'
	,	'Profile.Model'
	,	'Header.Simplified.View'
	,	'Footer.Simplified.View'
	,	'GlobalViews.Message.View'
	]
,	function (
		WizardStep
	,	order_wizard_step_tpl
	,	_
	,	ProfileModel
	,	HeaderSimplifiedView
	,	FooterSimplifiedView
	,	GlobalViewsMessageView
	)
{
	'use strict';

	//@class OrderWizard.Step Step View, Renders all the components of the Step @extends Wizard.Step
	return WizardStep.extend({
		//@property {Function} headerView
		headerView: HeaderSimplifiedView
		//@property {Function} footerView
	,	footerView: FooterSimplifiedView
		//@property {Function} template
	,	template: order_wizard_step_tpl
		//@method stepAdvance
	,	stepAdvance: function ()
		{
			if (this.areAllModulesReady())
			{
				return this.isStepReady() || this.wizard.isPaypalComplete();
			}
			return false;
		}

		//@method initialize
	,	initialize: function ()
		{
			WizardStep.prototype.initialize.apply(this, arguments);
		}

		//@method render
	,	render: function ()
		{
			var layout = this.wizard.application.getLayout();

			this.profileModel = ProfileModel.getInstance();

			WizardStep.prototype.render.apply(this, arguments);

			if (this.wizard.isCurrentStepFirst() && // only in the first step
				this.profileModel.get('isLoggedIn') === 'F' && // only if the user doesn't already have a session
				this.wizard.application.getConfig('checkoutApp.skipLogin'))
			{
				var message = _('Checking out as a Guest. If you have an account, please <a href="login" data-toggle="show-in-modal" data-id="skip-login-modal">login</a> and enjoy a faster checkout experience.').translate()
				,	 global_view_message = new GlobalViewsMessageView({
						message: message
					,	type: 'info'
					,	closable: true
				});

				this.$('[data-action="skip-login-message"]').empty().append(global_view_message.render().$el.html());
			}

			// Also trigger the afterRender event so the site search module can load the typeahead.
			layout.trigger('afterRender');
		}
		//@method getContext @returns OrderWizard.Step.Context
	,	getContext: function ()
		{
			//@class OrderWizard.Step.Context
			return {
					//@property {Boolean} showTitle
					showTitle: !!this.getName()
					//@property {String} title
				,	title: this.getName()
					//@property {Boolean} showContinueButton
				,	showContinueButton: !this.hideContinueButton
					// @property {String} continueButtonLabel
				,	continueButtonLabel: this.getContinueButtonLabel() || ''
					//@property {Boolean} showSecondContinueButtonOnPhone
				,	showSecondContinueButtonOnPhone: !!this.hideSecondContinueButtonOnPhone
					//@property {Boolean} showBackButton
				,	showBackButton: !(this.hideBackButton || this.wizard.isCurrentStepFirst())
					//@property {Boolean} showBottomMessage
				,	showBottomMessage: !!this.bottomMessage
					//@property {String} bottomMessage
				,	bottomMessage: _.isFunction(this.bottomMessage) ? this.bottomMessage() : this.bottomMessage || ''
					//@property {String} bottomMessageClass
				,	bottomMessageClass: _.isFunction(this.bottomMessageClass) ? this.bottomMessageClass() : this.bottomMessageClass || ''
			};
		}

	});
});
