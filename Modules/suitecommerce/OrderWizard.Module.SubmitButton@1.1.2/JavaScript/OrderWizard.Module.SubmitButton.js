/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @Module OrderWizard.Module.SubmitButton
define(
	'OrderWizard.Module.SubmitButton'
,	[
		'Wizard.Module'
	,	'order_wizard_submitbutton_module.tpl'
	,	'underscore'
	,	'Utils'

	]
,	function (

		WizardModule
	,	order_wizard_submitbutton_module_tpl
	,	_

	)
{
	'use strict';

	// @class OrderWizard.Module.SubmitButton @extends WizardModule
	return WizardModule.extend({

		template: order_wizard_submitbutton_module_tpl

	,	render: function ()
		{
			this._render();
			this.trigger('ready', true);
		}

		// @method getContinueButtonLabel @returns {String}
	,	getContinueButtonLabel: function ()
		{
			var current_step = this.wizard.getCurrentStep()
			,	label = _('Place Order').translate();
			
			if (current_step)
			{
				label = current_step.getContinueButtonLabel();
			}
			
			return label;
		}


		// @method getContext @return OrderWizard.Module.SubmitButton.Context
	,	getContext: function()
		{
			// @class OrderWizard.Module.SubmitButton.Context
			return {
				//@property {Boolean} showWrapper
				showWrapper: !!this.options.showWrapper
				//@property {String} wrapperClass
			,	wrapperClass: this.options.wrapperClass
				//@property {String} continueButtonLabel
			,	continueButtonLabel: this.getContinueButtonLabel() || ''
			};
		}
	});
});