/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Header
define(
	'Header.Profile.View'
,	[
		'Profile.Model'
	,	'SC.Configuration'
	,	'Header.Menu.MyAccount.View'

	,	'header_profile.tpl'


	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	]
,	function(
		ProfileModel
	,	Configuration
	,	HeaderMenuMyAccountView

	,	header_profile_tpl

	,	Backbone
	,	BackboneCompositeView
	,	_
	)
{
	'use strict';

	// @class Header.Profile.View
	return Backbone.View.extend({

		template: header_profile_tpl

	,	initialize: function ()
		{
			var self = this;
			BackboneCompositeView.add(this);

			ProfileModel.getPromise().done(function()
			{
				self.render();
			});

			this.on('afterViewRender', function ()
			{
				_.ellipsis('.header-profile-loading-indicator');
			});
		}

	,	childViews: {
			'Header.Menu.MyAccount': function ()
			{
				return new HeaderMenuMyAccountView(this.options);
			}
		}

		// @method getContext @return {Header.Profile.View.Context}
	,	getContext: function()
		{
			var profile = ProfileModel.getInstance()
			,	is_loading = !_.getPathFromObject(Configuration, 'performance.waitForUserProfile', true) && ProfileModel.getPromise().state() !== 'resolved'
			,	is_loged_in = (profile.get('isLoggedIn') === 'T' || profile.get('isRecognized') === 'T') && profile.get('isGuest') === 'F';

			// @class Header.Profile.View.Context
			return {
				// @property {Boolean} showExtendedMenu
				showExtendedMenu: !is_loading && is_loged_in
				// @property {Boolean} showLoginMenu
			,	showLoginMenu: !is_loading && !is_loged_in
				// @property {Boolean} showLoadingMenu
			,	showLoadingMenu: is_loading
				// @property {Boolean} showMyAccountMenu
			,	showMyAccountMenu: !!this.options.showMyAccountMenu
				// @property {String} displayName
			,	displayName: profile.get('firstname') || profile.get('companyname')
				// @property {Boolean} showLogin
			,	showLogin: Configuration.getRegistrationType() !== 'disabled'
				// @property {Boolean} showRegister
			,	showRegister: Configuration.getRegistrationType() === 'optional' || Configuration.getRegistrationType() === 'required'
			};
		}
	});

});
