/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Overview.Router.js
// -----------------------
// Router for handling Overview view/update
define('Overview.Router'
,	[
		'SC.Configuration'
	,	'Overview.Home.View'

	,	'OrderHistory.Collection'
	,	'Profile.Model'

	,	'Backbone'
	]
,	function (
		Configuration
	,	OverviewHomeView

	,	OrderHistoryCollection
	,	ProfileModel

	,	Backbone
	)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'': 'home'
		,	'overview': 'home'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

		// load the home page
	,	home: function ()
		{
			var	orderCollection = new OrderHistoryCollection()
			,	view = new OverviewHomeView({
					application: this.application
				,	model: ProfileModel.getInstance()
				,	collection: orderCollection
				});

			// get latest orders
			orderCollection
				.fetch({
					data: { page: 1, order: 1, sort: 'trandate,internalid', results_per_page: Configuration.get('overview.homeRecentOrdersQuantity', 3)}
				,	error: function (model, jqXhr)
					{
						// this will stop the ErrorManagment module to process this error
						// as we are taking care of it
						jqXhr.preventDefault = true;
					}
				})
				.always(function ()
				{
					view.showContent();
				});

		}
	});
});
