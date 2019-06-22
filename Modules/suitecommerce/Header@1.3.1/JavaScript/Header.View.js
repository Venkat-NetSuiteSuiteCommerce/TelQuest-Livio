/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Header
define(
	'Header.View'
,	[
		'SC.Configuration'
	,	'Profile.Model'
	,	'Header.Logo.View'
	,	'Header.MiniCart.View'
	,	'Header.MiniCartSummary.View'
	,	'Header.Profile.View'
	,	'Header.Menu.View'
	,	'GlobalViews.HostSelector.View'
	,	'GlobalViews.CurrencySelector.View'
	,	'SiteSearch.View'

	,	'header.tpl'

	,	'jQuery'
	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	,	'Utils'
	]
,	function(
		Configuration
	,	ProfileModel
	,	HeaderLogoView
	,	HeaderMiniCartView
	,	HeaderMiniCartSummaryView
	,	HeaderProfileView
	,	HeaderMenuView
	,	GlobalViewsHostSelectorView
	,	GlobalViewsCurrencySelectorView
	,	SiteSearchView

	,	header_tpl

	,	jQuery
	,	Backbone
	,	BackboneCompositeView
	,	_
	,	Utils
	)
{
	'use strict';

	// @class Header.View @extends Backbone.View
	return Backbone.View.extend({

		template: header_tpl

	,	events: {
			'click [data-action="show-sitesearch"]': 'showSiteSearch'
		,	'click [data-action="header-sidebar-show"]' : 'showSidebar'
		,	'click [data-action="header-sidebar-hide"]': 'hideSidebar'
		,	'click [data-type="header-sidebar-menu"]': 'hideSidebar'
		}

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);

			Backbone.history.on('all', this.verifyShowSiteSearch, this);
		}

		// @method verifyShowSiteSearch expand the site search only if hash===home and (phone or tablet)
	,	verifyShowSiteSearch: function ()
		{
			var hash = Backbone.history.getFragment() || '';
			hash = hash.indexOf('?') === -1 ? hash : hash.substring(0, hash.indexOf('?'));
			var is_home = hash === '' || hash === '/';

			if (Utils.getDeviceType() !== 'desktop' && is_home)
			{
				this.showSiteSearch(null, true);
			}
			else
			{
				// This hide sitesearch when navigate
				this.hideSiteSearch();
			}
		}

		// @method showSiteSearch
	,	showSiteSearch: function (ev)
		{
			ev && ev.preventDefault();

			// This add a class 'active' to change button color
			this.$('[data-action="show-sitesearch"]').toggleClass('active');
			var self = this;

			this.$('[data-type="SiteSearch"]').stop(true, false).slideToggle(function ()
			{
				// Set focus and cleans previous search
				self.getChildViewInstance('SiteSearch').showSiteSearch();
			});
		}

		//@method hideSiteSearch Auto-hide the site search form
		//@return {Void}
	,	hideSiteSearch: function ()
		{
			// This hide Sitesearch div
			this.$('[data-type="SiteSearch"]').slideUp();
		}

		// @method showMiniCart
		//@return {Void}
	,	showMiniCart: function ()
		{
			this.$('[data-type="mini-cart"]').parent().addClass('open');
		}

		// @method showSidebar
		//@return {Void}
	,	showSidebar: function ()
		{
			jQuery('#main').addClass('header-sidebar-opened');
		}

		// @method hideSidebar
		//@return {Void}
	,	hideSidebar: function(e)
		{
			if (e.target.tagName === 'A')
			{
				if(this.activeLink)
				{
					this.activeLink.removeClass('active');
				}
				this.activeLink = jQuery(e.target);
				this.activeLink.addClass('active');
			}
			jQuery('#main').removeClass('header-sidebar-opened');
		}

	,	childViews: {
			'Header.MiniCart': function()
			{
				return new HeaderMiniCartView();
			}
		,	'Header.MiniCartSummary': function()
			{
				return new HeaderMiniCartSummaryView();
			}
		,	'Header.Profile': function()
			{
				var header_profile_view_options = _.extend({
					showMyAccountMenu: true
				,	application: this.options.application
				}, this.options.headerProfileViewOptions || {});

				return new HeaderProfileView(header_profile_view_options);
			}
		,	'Header.Logo': function()
			{
				return new HeaderLogoView(this.options);
			}
		,	'Header.Menu': function()
			{
				var header_view_options = _.extend(
					{
					application: this.options.application
					}
					, this.options.headerProfileViewOptions || {});

				return new HeaderMenuView(header_view_options);
			}
		,	'Global.HostSelector': function()
			{
				return new GlobalViewsHostSelectorView();
			}
		,	'Global.CurrencySelector': function()
			{
				return new GlobalViewsCurrencySelectorView();
			}
		,	'SiteSearch': function()
			{
				return new SiteSearchView();
			}
		}

		// @method getContext
		// @return {Header.View.Context}
	,	getContext: function getContext()
		{
			var environment = SC.ENVIRONMENT
			,	show_languages = environment.availableHosts && environment.availableHosts.length > 1
			,	show_currencies = environment.availableCurrencies && environment.availableCurrencies.length > 1 && !Configuration.get('header.notShowCurrencySelector');

			// @class Header.View.Context
			return {
				// @property {Profile.Model} profileModel
				profileModel: ProfileModel.getInstance()
				// @property {Boolean} showLanguages
			,	showLanguages: show_languages
				// @property {Boolean} showCurrencies
			,	showCurrencies: show_currencies
				// @property {Boolean} showLanguagesOrCurrencies
			,	showLanguagesOrCurrencies: show_languages || show_currencies
				// @property {Boolean} showLanguagesAndCurrencies
			,	showLanguagesAndCurrencies: show_languages && show_currencies
				// @property {Boolean} isHomeTouchpoint
			,	isHomeTouchpoint: Configuration.currentTouchpoint === 'home'
				// @property {String} cartTouchPoint
			,	cartTouchPoint: Configuration.get('modulesConfig.Cart.startRouter', false) ? Configuration.currentTouchpoint : 'viewcart'
			};
			// @class Header.View
		}

		//@method destroy Override default destroy method to clean navigation event handlers
		//@return {Void}
	,	destroy: function ()
		{
			Backbone.View.prototype.destroy.apply(this, arguments);

			Backbone.history.off('all', this.verifyShowSiteSearch);
		}
	});

});
