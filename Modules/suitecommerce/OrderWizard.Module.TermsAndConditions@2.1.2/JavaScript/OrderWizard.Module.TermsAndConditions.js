/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @Module OrderWizard.Module.TermsAndConditions
define(
	'OrderWizard.Module.TermsAndConditions'
,	[
		'SC.Configuration'
	,	'Wizard.Module'

	,	'order_wizard_termsandconditions_module.tpl'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		Configuration
	,	WizardModule

	,	order_wizard_termsandconditions_module_tpl

	,	Backbone
	,	_
	, jQuery
	)
{
	'use strict';

	// @class OrderWizard.Module.TermsAndConditions @extends WizardModule
	return WizardModule.extend({

		template: order_wizard_termsandconditions_module_tpl

	,	events: {
			'click [data-toggle="show-terms"]': 'showTerms'
		,	'click input[name="termsandconditions"]': 'acceptTerms'
		}

	,	errors: ['ERR_CHK_ACCEPT_TERMS']

	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.step = options.step;
			this.model = options.wizard.model;
			this.options = _.extend({
				show_checkbox: true
			}, this.options || {});
		}

	,	render: function ()
		{
			// the module is rendered only if the site requires agreement to the terms and conditions
			if (Configuration.get('siteSettings.checkout.requiretermsandconditions') === 'T')
			{
				this._render();
				var is_ready = Configuration.get('siteSettings.checkout.requiretermsandconditions') !== 'T' || !this.options.show_checkbox || this.$('input[name=termsandconditions]').is(':checked');
				this.trigger('ready', is_ready);
			}
			else
			{
				this.trigger('ready', true);
			}
		}

	,	submit: function ()
		{
			var value = Configuration.get('siteSettings.checkout.requiretermsandconditions') !== 'T' || !this.options.show_checkbox || this.$('input[name=termsandconditions]').is(':checked');
			this.model.set('agreetermcondition', value);

			return this.isValid();
		}

	,	showTerms: function ()
		{
			var TermsView = Backbone.View.extend({
				title: _('Terms and Conditions').translate()
			,	render: function ()
				{
					this.$el.html(Configuration.get('siteSettings.checkout.termsandconditionshtml'));
					return this;
				}
			});

			this.wizard.application.getLayout().showInModal(new TermsView());
		}

	,	acceptTerms: function (data) {
			var isSelected = jQuery(data.target).prop('checked')
			,	boxes = jQuery('input[name=termsandconditions]');

			jQuery.each(boxes, function( index ) {
			  jQuery(boxes[index]).prop('checked', isSelected);
			});
		}

	,	isValid: function()
		{
			var promise = jQuery.Deferred()
			,	value = Configuration.get('siteSettings.checkout.requiretermsandconditions') !== 'T' || !this.options.show_checkbox || this.model.get('agreetermcondition');

			if (!value)
			{
				return promise.reject({
						errorCode: 'ERR_CHK_ACCEPT_TERMS'
					,	errorMessage: _('You must accept the Terms and Conditions').translate()
				});
			}
			else
			{
				return promise.resolve();
			}
		}

		// @method getContext @return OrderWizard.Module.TermsAndConditions.Context
	,	getContext: function()
		{
			// @class OrderWizard.Module.TermsAndConditions.Context
			return {
				// @property {Boolean} showCheckbox
				showCheckbox: this.options.show_checkbox
				// @property {Boolean} isAgreeTermCondition
			,	isAgreeTermCondition: this.wizard.model.get('agreetermcondition')
				//@property {Boolean} showWrapper
			,	showWrapper: !!this.options.showWrapper
				//@property {String} wrapperClass
			,	wrapperClass: this.options.wrapperClass
			};
		}
	});
});