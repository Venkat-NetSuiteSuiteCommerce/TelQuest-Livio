/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ProductDetails
define(
	'ProductDetails.Full.View'
,	[
		'ProductDetails.Base.View'
	,	'SC.Configuration'

	,	'ItemRelations.Related.View'
	,	'ItemRelations.Correlated.View'

	,	'ProductDetails.Information.View'

	,	'SocialSharing.Flyout.View'

	,	'product_details_full.tpl'

	,	'underscore'

	]
,	function (
		ProductDetailsBaseView
	,	Configuration

	,	ItemRelationsRelatedView
	,	ItemRelationsCorrelatedView

	,	ProductDetailsInformationView

	,	SocialSharingFlyoutView

	,	product_details_full_tpl

	,	_
	)
{
	'use strict';

	//@class ProductDetails.Full.View Handles the PDP and quick view @extend Backbone.View
	return ProductDetailsBaseView.extend({

		//@property {Function} template
		template: product_details_full_tpl

		//@property {Object} attributes List of HTML attributes applied by Backbone into the $el
	,	attributes: {
			'id': 'ProductDetails.Full.View'
		,	'class': 'view product-detail'
		}


	,	bindings: _.extend({}, ProductDetailsBaseView.prototype.bindings, {})

		//@method initialize Override default method to update the url on changes in the current product
		//@param {ProductDetails.Full.View.Initialize.Options} options
		//@return {Void}
	,	initialize: function initialize ()
		{
			ProductDetailsBaseView.prototype.initialize.apply(this, arguments);

			this.model.on('change', this.updateURL, this);
		}

	,	childViews: _.extend({}, ProductDetailsBaseView.prototype.childViews, {
			'Correlated.Items': function ()
			{
				return new ItemRelationsCorrelatedView({
					itemsIds: this.model.get('item').get('internalid')
				,	application: this.application
				});

			}
		,	'Related.Items': function ()
			{
				return new ItemRelationsRelatedView({
					itemsIds: this.model.get('item').get('internalid')
				,	application: this.application
				});
			}
		,	'Product.Information': function ()
			{
				return new ProductDetailsInformationView({
					model: this.model
				});
			}
		,	'SocialSharing.Flyout': function ()
			{
				return new SocialSharingFlyoutView({});
			}
		})

		//@method destroy Override default method to detach from change event of the current product
		//@return {Void}
	,	destroy: function destroy ()
		{
			this.model.off('change');
			return this._destroy();
		}

		//@method showOptionsPusher Override parent method to allow hide/show the option's pusher on mobile depending on the configuration value: ItemOptions.maximumOptionValuesQuantityWithoutPusher
		//@return {Booelan}
	,	showOptionsPusher: function showOptionsPusher ()
		{
			var options_values_length = _.reduce(this.model.get('options').map(function (option)
												{
													if (_.isArray(option.get('values')))
													{
														var invalid_values = _.filter(option.get('values'), function (value)
															{
																return !value.internalid;
															});

														return option.get('values').length - invalid_values.length;
													}
													return 0;
												})
											,	function (memo, num)
												{
													return memo + num;
												}
											,	0);

			return options_values_length > Configuration.get('ItemOptions.maximumOptionValuesQuantityWithoutPusher',1);
		}

		//@method getContext
		//@return {ProductDetails.Full.View.Context}
	,	getContext: function getContext ()
		{
			//@class ProductDetails.Full.View.Context @extend ProductDetails.Base.View.Context
			return _.extend(ProductDetailsBaseView.prototype.getContext.apply(this, arguments), {

			});
			//@class ProductDetails.Full.View
		}
	});
});

//@class ProductDetails.Full.View.Initialize.Options @extend ProductDetails.Base.View.Initialize.Options
