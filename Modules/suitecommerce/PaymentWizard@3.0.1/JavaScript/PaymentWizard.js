/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define('PaymentWizard'
,	[	'PaymentWizard.Router'
	,	'Profile.Model'
	,	'LivePayment.Model'
	]
,	function (
		PaymentWizardRouter
	,	ProfileModel
	,	LivePaymentModel
	)
{
	'use strict';
	//@class PaymentWizard @extends ApplicationModule
	return	{
		mountToApp: function (application)
		{
			return new PaymentWizardRouter(application, {
				profile: ProfileModel.getInstance()
			,	model: LivePaymentModel.getInstance()
			,	steps: application.getConfig('paymentWizardSteps')
			});
		}
	};
});
