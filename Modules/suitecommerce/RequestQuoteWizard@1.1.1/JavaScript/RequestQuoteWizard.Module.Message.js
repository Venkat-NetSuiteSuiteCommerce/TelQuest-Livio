/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module RequestQuoteWizard
define('RequestQuoteWizard.Module.Message'
,	[
		'SC.Configuration'
	,	'Wizard.Module'

	,	'requestquote_wizard_module_message.tpl'

	,	'underscore'
	,	'Utils'
	]
,	function (
		Configuration
	,	WizardModule

	,	requestquote_wizard_module_message_tpl

	,	_
	)
{
	'use strict';

	//@class WizardModule.Module.Message @extend Wizard.Message
	return WizardModule.extend({

		// @property {Function} template
		template: requestquote_wizard_module_message_tpl

		//@method getContext
		//@return {RequestQuoteWizard.Module.Message.Context}
	,	getContext: function ()
		{
			//@class RequestQuoteWizard.Module.Message.Context
			return {
				// @property {String} pageHeader
				pageHeader: _('Request a Quote').translate()
				// @property {String} message
			,	message: this.options.message || this.wizard.getCurrentStep().bottomMessage
			};
			//@class RequestQuoteWizard.Module.Message
		}
	});
});