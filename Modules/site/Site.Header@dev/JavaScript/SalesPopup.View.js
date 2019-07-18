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

            title: _('Sales Rep Information').translate(),

            modalClass: 'sales-rep-modal',

			initialize: function (options) {

			},

			getContext: function getContext() {
				var profile = ProfileModel.getInstance();
				var salesrep = profile.get('salesrep');
				return {
					salesRep : salesrep
				};
			}
		});
	});


