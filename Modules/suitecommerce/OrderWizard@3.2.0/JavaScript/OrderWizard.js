/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizzard
define('OrderWizard'
,	[	'OrderWizard.Router'
	,	'LiveOrder.Model'
	,	'Profile.Model'
	]
,	function (
		OrderWizardRouter
	,	LiveOrderModel
	,	ProfileModel
	)
{
	'use strict';

	return {

		mountToApp: function (application)
		{
			return new OrderWizardRouter(application, {
				model: LiveOrderModel.getInstance()
			,	profile: ProfileModel.getInstance()
			,	steps: application.getConfig('checkoutSteps')
			});
		}
	};
});

