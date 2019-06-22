/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ExternalPayment.js
// -------------------
define('ExternalPayment'
,	[
		'ErrorManagement.InternalError.View'
	,	'underscore'
	,	'Utils'
	]
,	function (
		InternalErrorView
	,	_
	)
{
	'use strict';

	return {
		//@method mountToApp
		//@param {Object} application
		mountToApp: function (application)
		{
			if (SC.ENVIRONMENT.EXTERNALPAYMENT && SC.ENVIRONMENT.EXTERNALPAYMENT.parameters)
			{
				var params = SC.ENVIRONMENT.EXTERNALPAYMENT && SC.ENVIRONMENT.EXTERNALPAYMENT.parameters
				,	external_fragment;

				if (!params.errorCode)
				{
					switch (params.externalPayment)
					{
						case 'DONE':
							external_fragment = '#' + SC.CONFIGURATION.externalPayment[params.recordType.toUpperCase()].doneFragment;
						break;
						case 'FAIL':
							external_fragment = '#' + SC.CONFIGURATION.externalPayment[params.recordType.toUpperCase()].failFragment;
						break;
					}

					if (external_fragment)
					{
						delete params.errorCode;
						external_fragment = _.addParamsToUrl(external_fragment, params);
						window.location.hash = external_fragment;
					}
				}
				else if (params.errorCode)
				{
					var self = this;
					application.getLayout().once('afterAppendView', function () {
						var view = new InternalErrorView({
							application: application
						,	message: self.getErrorMessage(params.errorCode)
						,	pageHeader: _('External Payment Error').translate()
						,	title: _('External Payment Error').translate()
						});
						view.showContent();
					});
				}
			}
		}

		//@method getErrorMessage
		//@param {String} error_code
	,	getErrorMessage: function (error_code)
		{
			var message;
			switch (error_code)
			{
				case 'externalPaymentValidationStatusFail':
					message = _('Invalid payment event.').translate();
				break;
				case 'externalPaymentRequestInvalidParameters':
					message = _('Invalid parameters.').translate();
				break;
				case 'externalPaymentMissingImplementation':
					message = _('Invalid external payment method implementation.').translate();
				break;
				case 'externalPaymentRecordValidationStatusFail':
					message = _('Invalid record status.').translate();
				break;
				default:
					message = _('Invalid error code.');
			}
			return message;
		}
	};
});
