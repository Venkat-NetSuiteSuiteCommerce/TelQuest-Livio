/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Address
define(
	'Address.Edit.Fields.View'
,	[	'address_edit_fields.tpl'

	,	'GlobalViews.CountriesDropdown.View'
	,	'SC.Configuration'
	,	'Backbone.CompositeView'
	,	'GlobalViews.States.View'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		address_edit_fields_tpl

	,	CountriesDropdownView
	,	Configuration
	,	BackboneCompositeView
	,	GlobalViewsStatesView

	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class Address.Edit.View @extend Backbone.View
	return Backbone.View.extend({
		//@property {Function} template
		template: address_edit_fields_tpl

		//@property {Object} events
	,	events: {
			'change [data-action="selectcountry"]': 'updateStates'
		,	'change [data-action="selectstate"]': 'eraseZip'
		,	'change [data-action="inputstate"]': 'eraseZip'
		,	'blur [data-action="inputphone"]': 'formatPhone'
		}

		//@method initialize Defines this view as composite
		//@return {Void}
	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
			this.calculateState();
		}

		//@method calculateState Pre-calculate many state variables used in the get context. In this way this is state is calculated once
		//@return {Void}
	,	calculateState: function ()
		{
			this.site_settings = Configuration.get('siteSettings');
			this.manage = this.options.manage ? this.options.manage + '-' : '';
			this.countries = this.options.countries;
			this.quantity_countries = _.size(this.countries);
			this.selected_country = this.options.selectedCountry;
			this.zip_not_required = this.selected_country && this.site_settings.countries[this.selected_country] && this.site_settings.countries[this.selected_country].isziprequired === 'F';
		}

		//@method eraseZip Show and hide the zip field depending on the selected country
		//@return {Void}
	,	eraseZip: function ()
		{
			var selected_country = this.$('[name="country"]').val()
			,	countries = Configuration.get('siteSettings.countries', {})
			,	$zip_fieldset = this.$('[data-input="zip"]')
			,	$zip_input = this.$('input[name="zip"]', $zip_fieldset);

			$zip_input.val('');

			if (countries[selected_country] && countries[selected_country].isziprequired === 'F')
			{
				$zip_fieldset.hide();
			}
			else
			{
				$zip_fieldset.show();
			}
		}

		//@method formatPhone Will try to reformat a phone number for a given phone Format,
		// If no format is given, it will try to use the one in site settings.
		//@param {jQuery.Event} e
		//@return {Void}
	,	formatPhone: function (e)
		{
			var $target = jQuery(e.target);
			$target.val(_($target.val()).formatPhone());
		}

		//@method updateStates Initialize state of the  dropdowns
		//@param {jQuery.Event} e
		//@return {Void}
	,	updateStates: function (e)
		{
			var statesView = this.getChildViewInstance('StatesView');
			statesView.options.selectedCountry = this.$(e.currentTarget).val();
			statesView.render();
			this.eraseZip(e);
		}

		//@property {Object} childViews
	,	childViews: {
			'CountriesDropdown': function ()
			{
				return new CountriesDropdownView({
					countries: this.options.countries
				,	selectedCountry: this.selected_country
				,	manage: this.options.manage
				});
			}
		,	'StatesView': function ()
			{
				return new GlobalViewsStatesView({
					countries: this.options.countries
				,	selectedCountry: this.selected_country
				,	selectedState: this.model.get('state')
				,	manage: this.manage
				});
			}
		}

		//@method getContext @return Address.Edit.View.Context
	,	getContext: function ()
		{

			//@class Address.Edit.View.Context
			return {
				//@property {String} manage
				manage: this.manage
				//@property {String} fullName
			,	fullName: this.model.get('fullname')
				//@property {Boolean} showCompanyField
			,	showCompanyField: this.site_settings.registration.displaycompanyfield === 'T'
				//@property {Boolean} isCompanyFieldMandatory
			,	isCompanyFieldMandatory: this.site_settings.registration.companyfieldmandatory === 'T'
				//@property {Boolean} isPhoneFieldMandatory
			,	isPhoneFieldMandatory: Configuration.get('addresses') && Configuration.get('addresses').isPhoneMandatory
				//@property {String} company
			,	company: this.model.get('company')
				//@property {String} addressLine1
			,	addressLine1: this.model.get('addr1')
				//@property {String} addressLine2
			,	addressLine2: this.model.get('addr2')
				//@property {String} city
			,	city: this.model.get('city')
				//@property {Boolean} showCountriesField
			,	showCountriesField: this.quantity_countries > 1
				//@property {Boolean} isZipOptional
			,	isZipOptional: this.zip_not_required
				//@property {Boolean} zip
			,	zip: this.model.get('zip')
				//@property {String} phone
			,	phone: this.model.get('phone')
				//@property {Boolean} isAddressResidential
			,	isAddressResidential: this.model.get('isresidential') === 'T'
				//@property {Boolean} showDefaultControls
			,	showDefaultControls: !this.options.hideDefaults
				//@property {Boolean} isAddressDefaultBilling
			,	isAddressDefaultBilling: this.model.get('defaultbilling') === 'T'
				//@property {Boolean} isCurrentTouchPointCheckout
			,	isCurrentTouchPointCheckout: Configuration.get('currentTouchpoint') === 'checkout'
				//@property {Boolean} isAddressDefaultShipping
			,	isAddressDefaultShipping: this.model.get('defaultshipping') === 'T'
				//@property {Boolean} showAddressFormSecondAddress
			,	showAddressFormSecondAddress: Configuration.get('forms.address.showAddressLine2')
			};
		}
	});

});
