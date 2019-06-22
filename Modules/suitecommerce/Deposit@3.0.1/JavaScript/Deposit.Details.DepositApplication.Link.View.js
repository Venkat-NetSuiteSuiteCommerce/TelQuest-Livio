/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Deposit
define('Deposit.Details.DepositApplication.Link.View'
,	[	'deposit_details_deposit_application_link.tpl'

	,	'Backbone'
	]
,	function (
		deposit_details_deposit_application_link_tpl
	,	Backbone
	)
{
	'use strict';

	//@class Deposit.Details.DepositApplication.Link.View @extend Backbone.View
	return Backbone.View.extend({

		template: deposit_details_deposit_application_link_tpl

	,	events: {
			'click [data-action="go-to-deposit-application"]': 'goToDepositApplication'
		}

	,	goToDepositApplication: function (e)
		{
			e.stopPropagation();
		}
		//@method getContext @return Deposit.Details.DepositApplication.Link.View.Context
	,	getContext: function ()
		{
			//@class Deposit.Details.DepositApplication.Link.View.Context
			return {
				//@property {String} depositApplicationId
				depositApplicationId: this.model.get('depositId')
				//@property {String} depositApplicationTitle
			,	depositApplicationDate: this.model.get('depositDate')
			};
		}
	});

});