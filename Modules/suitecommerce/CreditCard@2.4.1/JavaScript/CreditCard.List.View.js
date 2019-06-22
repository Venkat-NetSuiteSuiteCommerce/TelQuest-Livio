/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditCard
define('CreditCard.List.View'
,	[
		'creditcard_list.tpl'

	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'
	,	'CreditCard.View'
	,	'SC.Configuration'
	,	'GlobalViews.Confirmation.View'

	,	'Backbone'
	,	'underscore'
	,	'LiveOrder.Model'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		creditcard_list_tpl

	,	BackboneCollectionView
	,	BackboneCompositeView
	,	CreditCardView
	,	Configuration
	,	GlobalViewsConfirmationView

	,	Backbone
	,	_
	,	LiveOrderModel
	,	jQuery
	)
{
	'use strict';

	// @class CreditCard.List.View @extends Backbone.View
	return Backbone.View.extend({

		template: creditcard_list_tpl
	,	title: _('Credit Cards').translate()
	,	page_header: _('Credit Cards').translate()

	,	attributes: { 'class': 'CreditCardListView' }

	,	events: {
			'click [data-action="remove"]': 'removeCreditCard'
		}

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);

			var self = this;

			this.collection.on('reset sync add remove change', function ()
			{
				self.collection.sort();
			});
		}

	,	childViews: {
			'CreditCards.Collection': function ()
			{
				return new BackboneCollectionView({
					collection: this.collection
				,	childView: CreditCardView
				,	childViewOptions :{
						showActions: true
					,	showDefaults: Configuration.get('currentTouchpoint') === 'customercenter'
					}
				,	viewsPerRow: Configuration.get('itemsPerRow', 2)
				});
			}
		}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'creditcards';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return {
				text: _('Credit Cards').translate()
			,	href: '/creditcards'
			};
		}

		//@method removeCreditCard dispatch the remove event
	,	removeCreditCard: function (e)
		{
			e.preventDefault();

			var deleteConfirmationView = new GlobalViewsConfirmationView({
					callBack: this._removeCreditCardFromCollection
				,	callBackParameters: {
						context: this
					,	creditcardId: jQuery(e.target).data('id')
					}
				,	title: _('Remove Credit Card').translate()
				,	body: _('Are you sure you want to remove this Credit Card?').translate()
				,	autohide: true
				});

			return this.options.application.getLayout().showInModal(deleteConfirmationView);
		}

	,	_removeCreditCardFromCollection: function (options)
		{
			options.context.collection.get(options.creditcardId).destroy({ wait: true });
		}

		//@method getContext @return {CreditCard.List.View.Context}
	,	getContext: function ()
		{
			//@class CreditCard.List.View.Context
			return {
				//@property {String} pageHeader
				pageHeader: this.page_header
				//@property {Boolean} showBackToAccount
			,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
			};
		}
	});
});
