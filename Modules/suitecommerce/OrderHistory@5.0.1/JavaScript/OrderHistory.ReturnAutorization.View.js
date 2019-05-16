/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderHistory
define('OrderHistory.ReturnAutorization.View'
,	[	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Transaction.Line.Views.Cell.Navigable.View'

	,	'order_history_return_authorization.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		BackboneCompositeView
	,	BackboneCollectionView
	,	TransactionLineViewsCellNavigableView

	,	order_history_return_authorization_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class OrderHistory.ReturnAutorization.View @extend Backbone.View
	return Backbone.View.extend({
		//@property {Function} template
		template: order_history_return_authorization_tpl
		//@method initialize
	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}
		//@property {Object} childViews
	,	childViews: {
			'Items.Collection': function ()
			{
				return new BackboneCollectionView({
						collection: this.model.get('lines')
					,	childView: TransactionLineViewsCellNavigableView
					,	viewsPerRow: 1
					,	childViewOptions: {
							navigable: true

						,	detail1Title: _('Qty:').translate()
						,	detail1: 'quantity'

						,	detail3Title: _('Amount:').translate()
						,	detail3: 'total_formatted'
						}
				});
			}
		}

		//@method getContext @return OrderHistory.ReturnAutorization.View.Context
	,	getContext: function ()
		{
			//@class OrderHistory.ReturnAutorization.View.Context
			return {
					//@property {Model} model
					model: this.model
					//@property {Boolean} showLink
				,	showLink: !!this.model.get('tranid')
			};
		}
	});

});