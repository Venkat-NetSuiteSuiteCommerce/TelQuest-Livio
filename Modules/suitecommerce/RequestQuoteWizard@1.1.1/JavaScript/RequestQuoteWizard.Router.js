/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module RequestQuoteWizard
define('RequestQuoteWizard.Router'
,	[
		'Wizard.Router'
	,	'RequestQuoteWizard.View'
	,	'RequestQuoteWizard.Step'
	,	'RequestQuoteWizard.Permission.Error.View'

	,	'AjaxRequestsKiller'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		WizardRouter
	,	RequestQuoteWizardView
	,	RequestQuoteWizardStep
	,	RequestQuoteWizardPermissionErrorView

	,	AjaxRequestsKiller

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class RequestQuoteWizard.Router @extends Wizard.Router
	return WizardRouter.extend({
		//@property {RequestQuoteWizardStep.Step} step
		step: RequestQuoteWizardStep

		//@property {RequestQuoteWizardStep.View} view
	,	view: RequestQuoteWizardView

		//@method runStep override default runstep method to validate that a quote id has been specified in the URL and the corresponding quote is already loaded
		//@param {String} str_options Current Options in the url
		//@return {Void}
	,	runStep: function (str_options)
		{
			// Computes the position of the user in the flow
			var position = this.getStepPosition(Backbone.history.fragment) //this.getStepPosition(url)
			,	content = ''
			,	page_header = ''
			,	layout = this.application.getLayout()
			,	options = _.parseUrlOptions(str_options)
			,	self = this
			,	quoteid = str_options && ~str_options.indexOf('quoteid=');

			if (SC.ENVIRONMENT.permissions.transactions.tranEstimate < 2)
			{
				var error_view = new RequestQuoteWizardPermissionErrorView({
					application: this.application
				});

				error_view.showContent();
			}
			else if (quoteid)
			{
				//wizard just finished and user refreshed the page
				page_header = _('Your Quote Request has been Placed').translate();
				content += _('You can review your quote request at <a href="/quotes/$(0)">Your Account</a> ')
					.translate(options.quoteid) +
					_('or continue Shopping on our <a data-touchpoint="home" data-hashtag="#/" href="/">Home Page</a>.').translate();

				layout.internalError && layout.internalError(content, page_header, _('My Account').translate());
			}
			else if (position.fromBegining === 0)
			{
				self.model.clear();
				//this is done because many OrderWizard Modules dont check if the summary is set
				self.model.set('summary', {}, {silent: true});
				self.model.set('internalid', 'null');

				self.model.fetch(
					{
						killerId: AjaxRequestsKiller.getKillerId()
					})
					.then(function ()
					{
						self.model.trigger('init');
						WizardRouter.prototype.runStep.apply(self);
					});
			}
			else
			{
				WizardRouter.prototype.runStep.apply(self, arguments);
			}
		}

	});
});