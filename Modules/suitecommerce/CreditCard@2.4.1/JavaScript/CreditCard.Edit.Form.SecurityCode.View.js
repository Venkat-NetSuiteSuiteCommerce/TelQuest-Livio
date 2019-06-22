/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditCard
define('CreditCard.Edit.Form.SecurityCode.View'
,	[
		'creditcard_edit_form_securitycode.tpl'
	,	'CreditCard.Edit.Form.SecurityCode.Tooltip.View'
	,	'SC.Configuration'

	,	'Backbone'
	]
,	function (
		creditcard_edit_form_securitycode_tpl
	,	CreditCardEditFormSecurityCodeTooltipView
	,	Configuration

	,	Backbone
	)
{
	'use strict';

	// @class CreditCard.Edit.Form.SecurityCode.View Credit cards list @extends Backbone.View
	return Backbone.View.extend({

		template: creditcard_edit_form_securitycode_tpl

	,	 render: function ()
		{
			this._render();

			var ccv_tooltip_view = new CreditCardEditFormSecurityCodeTooltipView();

			ccv_tooltip_view.render();

			var placeholder = this.$el.find('[data-toggle="popover"]');
			placeholder.attr('data-content', ccv_tooltip_view.$el.html());
		}

		//@method getContext @return CreditCard.Edit.Form.SecurityCode.View.Context
	,	getContext: function ()
		{
			//@class CreditCard.Edit.Form.SecurityCode.View.Context
			return {
				//@property {Boolean} showCreditCardHelp
				showCreditCardHelp: this.options.showCreditCardHelp
				//@property {String} creditCardHelpTitle
			,	creditCardHelpTitle: this.options.creditCardHelpTitle
				//@property {Boolean} showError
			,	showError: !!this.options.error
				//@property {String} errorMessage
			,	errorMessage: this.options.error ? this.options.error.errorMessage : ''
				//@property {Number} value
			,	value: this.options.value
			};
		}
	});
});
