/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReturnAuthorization
define('ReturnAuthorization.Form.Item.Summary.View'
,	[	'return_authorization_form_item_summary.tpl'

	,	'Backbone'
	]
,	function (
		return_authorization_form_item_summary_tpl

	,	Backbone
	)
{
	'use strict';

	//@class ReturnAuthorization.Form.Item.Summary.View @extend Backbone.View
	return Backbone.View.extend({

		template: return_authorization_form_item_summary_tpl

		//@method getContext @return ReturnAuthorization.Form.Item.Summary.View.Context
	,	getContext: function ()
		{
			//@class ReturnAuthorization.Form.Item.Summary.View.Context
			return {
				//@property {Model} line
				line: this.model
				//@property {Boolean} isLineActive
			,	isLineActive: this.model.get('checked')
				//@property {Number} selectedQuantity
			,	selectedQuantity: this.model.get('returnQty') || this.model.get('quantity')
				//@property {Number} selectedQuantity
			,	maxQuantity: this.model.get('quantity')
				//@property {Boolean} isQuantityGreaterThan1
			,	isQuantityGreaterThan1: this.model.get('quantity') > 1
			};
		}
	});

});
