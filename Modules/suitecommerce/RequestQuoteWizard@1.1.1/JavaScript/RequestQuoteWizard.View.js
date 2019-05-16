/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module RequestQuoteWizard
define(
	'RequestQuoteWizard.View'
,	[
		'Wizard.View'
	,	'Wizard.StepNavigation.View'

	,	'requestquote_wizard_layout.tpl'

	,	'underscore'
	,	'Utils'
	]
,	function (
		WizardView
	,	WizardStepNavigationView

	,	requestquote_wizard_layout_tpl

	,	_
	)
{
	'use strict';

	// @class RequestQuoteWizard.View @extends Wizard.View
	return WizardView.extend({

		//@property {Function} template
		template: requestquote_wizard_layout_tpl

		//@property {String} page_header
	,	page_header: _('Request a Quote').translate()

		//@property {String} bodyClass This property indicate the class used on the body to remove the My Account side menu
	,	bodyClass: 'force-hide-side-nav'

		// @method getBreadcrumbPages
		// @return {BreadcrumbPage}
	,	getBreadcrumbPages: function ()
		{
			return {href: '/request-a-quote', text: _('Request a Quote').translate()};
		}

		//@property {ChildViews} childViews
	,	childViews: {
	    	'Wizard.StepNavigation': function()
	    	{
	    		return new WizardStepNavigationView({wizard: this.wizard});
	    	}
	    }

		// @method getContext
		// @return {RequestQuoteWizard.View.Context}
	,	getContext: function ()
		{
			// @class RequestQuoteWizard.View.Context
			return {
				// @property {String} pageHeader
				pageHeader: this.page_header
			};
			// @class RequestQuoteWizard.View
		}
   });
});