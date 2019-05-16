/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReturnAuthorization
define('ReturnAuthorization.Confirmation.View'
,	[	'return_authorization_confirmation.tpl'

	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Transaction.Line.Views.Cell.Navigable.View'

	,	'SC.Configuration'
	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		return_authorization_confirmation_tpl

	,	BackboneCompositeView
	,	BackboneCollectionView
	,	TransactionLineViewsCellNavigableView

	,	Configuration
	,	Backbone
	,	_
	)
{
	'use strict';

	//@class ReturnAuthorization.Confirmation.View @extend Backone.View
	return Backbone.View.extend({

		template: return_authorization_confirmation_tpl

	,	title: _('Request Return').translate()

	,	page_header: _('Confirmation').translate()

	,	page_title: _('Request Return').translate()

	,	attributes: {
			'class': 'ReturnAuthorizationConfirmation'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			BackboneCompositeView.add(this);
		}

	,	childViews: {
			'Items.Collection': function ()
			{
				return new BackboneCollectionView({
					childView: TransactionLineViewsCellNavigableView
				,	collection: this.model.get('lines')
				,	viewsPerRow: 1
				,	childViewOptions: {
						detail1Title: _('Qty:').translate()
					,	detail1: 'quantity'

					,	detail2Title: _('Amount:').translate()
					,	detail2: 'amount_formatted'

					,	detail3: 'reason'
					}
				});
			}
		}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'returns';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return {
				text: this.title
			,	href: '/returns'
			};
		}

		//@meth getContext @return ReturnAuthorization.Confirmation.View.Context
	,	getContext: function ()
		{
			//@class ReturnAuthorization.Confirmation.View.Context
			return {
				//@property {ReturnAuthorization.Model} model
				model: this.model
				//@property {String} pageTitle
			,	pageTitle: this.page_title
				//@property {String} pageHeader
			,	pageHeader: this.page_header
				//@property {String} internalId
			,	internalId: this.model.get('internalid')
				//@property {String} modelTranId
			,	modelTranId: this.model.get('createdform') ? this.model.get('createdform').name : ''
				//@property {String} totalFormatted
			,	totalFormatted: this.model.get('summary').total_formatted
				//@property {Number} linesLength
			,	linesLength: this.model.get('lines').length
				//@property {Boolean} showComments
			,	showComments: !!this.model.get('memo')
				//@property {Boolean} isElementCollapsed
			,	isElementCollapsed: Configuration.get('sca.collapseElements')
			};
		}
	});
});