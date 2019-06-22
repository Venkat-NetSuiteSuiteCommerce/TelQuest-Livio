/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Overview.Profile.View.js
// -----------------------

define('Overview.Profile.View'
,	[
		'SC.Configuration'

	,	'overview_profile.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function(
		Configuration

	,	overview_profile_tpl

	,	Backbone
	,	BackboneCompositeView
	,	_
	,	jQuery
	,	Utils
	)
{
	'use strict';

	// home page view
	return Backbone.View.extend({

		template: overview_profile_tpl

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

		//@method getContext @returns {Overview.Banner.View.Context}
	,	getContext: function()
		{
			var first_name = this.model.get('firstname') || ''
			,	middle_name = this.model.get('middlename') || ''
			,	last_name = this.model.get('lastname') || ''
			,	company_name = this.model.get('companyname');

			//@class Overview.Banner.View.Context
			return {
				//@property {String} name
				name: first_name + ' ' +  middle_name + ' ' + last_name
				//@property {Boolean} isCompany
			,	isCompany: !!company_name
				//@property {Boolean} isNameTitle
			,	isNameTitle: !company_name
				//@property {String} companyName
			,	companyName: company_name || ''
				//@property {String} email
			,	email: this.model.get('email')
				//@property {String} phone
			,	phone: Utils.formatPhone(this.model.get('phone') || '', Configuration.get('siteSettings.phoneformat'))
			};
		}
	});
});