/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define('PaymentWizard.Router'
,	[	'Wizard.Router'
	,	'PaymentWizard.View'
	,	'PaymentWizard.Step'
	]
,	function (
		WizardRouter
	,	PaymentWizardView
	,	PaymentWizardStep
	)
{
	'use strict';

	//@class PaymentWizard.Router @extend Backbone.Router
	return WizardRouter.extend({

		view: PaymentWizardView

	,	step: PaymentWizardStep
		//@method runStep
	,	runStep: function()
		{
			if (SC.ENVIRONMENT.permissions.transactions.tranCustPymt < 2)
			{
				this.application.getLayout().forbiddenError();
			}
			else
			{
				WizardRouter.prototype.runStep.apply(this, arguments);
			}
		}
		//@method hidePayment
	,	hidePayment: function ()
		{
			return (!this.model.get('payment') && !this.model.get('confirmation')) || (this.model.get('confirmation') && !this.model.get('confirmation').payment);
		}
	});
});
