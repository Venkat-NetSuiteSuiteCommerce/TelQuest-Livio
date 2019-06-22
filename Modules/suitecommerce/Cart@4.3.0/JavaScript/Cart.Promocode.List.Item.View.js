/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Cart
define('Cart.Promocode.List.Item.View'
,	[
		'cart_promocode_list_item.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		cart_promocode_list_item_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class Cart.Promocode.List.Item.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: cart_promocode_list_item_tpl
		
		//@method getContext
		//@return {Cart.Promocode.List.Item.View.Context}
	,	getContext: function getContext ()
		{
			var code = this.model.get('code')
			,	internalid = this.model.get('internalid')
			,	hide_autoapply_promo = (!_.isUndefined(this.model.get('isautoapplied'))) ? this.model.get('applicabilityreason') === 'DISCARDED_BEST_OFFER' || (this.model.get('isautoapplied') && this.model.get('applicabilitystatus') === 'NOT_APPLIED') : false;


			if(this.options.source === 'item_summary')
			{
				code = this.model.get('promotion_couponcode');
				internalid = this.model.get('promotion_id');
			}

			//@class Cart.Promocode.List.Item.View.Context
			return {
				//@property {Boolean} showPromo
				showPromo: !!code && !hide_autoapply_promo
				//@property {String} code
			,	code: code
				//@property {String} internalid
			,	internalid: internalid
				//@property {Boolean} isEditable
			,	isEditable: !this.options.isReadOnly && !this.model.get('isautoapplied')
				//@property {Boolean} showDiscountRate
			,	showDiscountRate: !!this.model.get('discountrate_formatted')
				//@property {String} discountRate
			,	discountRate: this.model.get('discountrate_formatted')
				//@property {Boolean} showWarning
			,	showWarning: this.model.get('isvalid') === false && this.model.get('errormsg')
				//@property {String} errorMessage
			,	errorMessage: this.model.get('errormsg')
			};
			//@class Cart.Promocode.List.Item.View
		}
	});
});

//@class Cart.Promocode.List.Item.View.Initialize.Options
//@property {Backbone.Model<{code:String,internalid:String}>} model
//@property {Boolean?} isReadOnly
