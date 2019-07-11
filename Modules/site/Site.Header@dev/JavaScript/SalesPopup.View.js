/*
	© 2016 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module SalesPopup
define(
	'SalesPopup.View'
	,	[
		'Profile.Model'
		,	'Backbone'
		,  'sales_popup.tpl'
		,	'underscore'
		,	'jQuery'

	]
	,	function (
		ProfileModel
		, Backbone
		,   sales_popup_tpl
		,	_
		,	jQuery

	)
	{
		'use strict';

		return Backbone.View.extend({

			//@property {Function} template
			template: sales_popup_tpl,

            modalClass: 'sales-rep-modal'

			,	initialize: function (options)
			{

			}
			,	getContext: function getContext()
			{
				var profile = ProfileModel.getInstance()
					,   salesrep = profile.get('salesrep');
				return {
					salesRep : salesrep
				};
			}
		});
	});


