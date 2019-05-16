/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Address
define(
	'Address.Edit.View'
,	[	'address_edit.tpl'

	,	'Address.Edit.Fields.View'
	,	'Backbone.FormView'

	,	'SC.Configuration'
	,	'Backbone.CompositeView'
	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		address_edit_tpl

	,	AddressEditFieldView
	,	BackboneFormView

	,	Configuration
	,	BackboneCompositeView
	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class Address.Edit.View @extend Backbone.View
	return Backbone.View.extend({

		template: address_edit_tpl

	,	attributes: {'class': 'AddressListView'}

	,	events: {
			'submit form': 'saveForm'
		}

	,	bindings: {
			'[name="fullname"]': 'fullname'
		,	'[name="company"]': 'company'
		,	'[name="addr1"]': 'addr1'
		,	'[name="city"]': 'city'
		,	'[name="country"]': 'country'
		,	'[name="zip"]': 'zip'
		,	'[name="phone"]': 'phone'
		}

	,	initialize: function (options)
		{
			this.manage = options.manage;
			this.application = options.application;
			var addNewAddresLabel = _('Add New Address').translate();
			var	editAddressLabel = _('Edit Address').translate();
			this.title = this.model.isNew() ? addNewAddresLabel : editAddressLabel;
			this.page_header = this.title;	
			this.countries = Configuration.get('siteSettings.countries');
			this.selectedCountry = this.model.get('country') || Configuration.get('siteSettings.defaultshipcountry');

			if (!this.selectedCountry && _.size(this.countries) === 1)
			{
				this.selectedCountry = _.first(_.keys(this.countries));
			}			

			if (!!this.selectedCountry)
			{
				this.model.set('country', this.selectedCountry);
			}

			BackboneCompositeView.add(this);
			BackboneFormView.add(this);
		}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'addressbook';
		}

		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return [
				{
					text: _('Address Book').translate()
				,	href: '/addressbook'
				}
			,	{
					text: this.title
				,	href: '/addressbook/new'
				}
			];
		}

	,	render: function ()
		{
			Backbone.View.prototype.render.apply(this, arguments);

			this.$('[rel="tooltip"]').tooltip({
				placement: 'right'
			}).on('hide', function (e)
			{
				e.preventDefault();
				jQuery(e.target).next('.tooltip').hide();
			});
		}

	,	childViews: {
			'Address.Edit.Fields': function ()
			{
				return new AddressEditFieldView({
					model: this.model
				,	countries: this.countries
				,	selectedCountry: this.selectedCountry
				,	hideDefaults: Configuration.get('currentTouchpoint') !== 'customercenter'
				,	application: this.options.application
				});
			}
		}

		//@method getContext @return Address.Edit.View.Context
	,	getContext: function ()
		{
			//@class Address.Edit.View.Context
			return {
				//@property {Address.Model} model
				model: this.model
				//@property {Boolean} isAddressNew
			,	isAddressNew: this.model.isNew()
				//@property {Boolean} isCollectionEmpty
			,	isCollectionEmpty: !this.collection.length
				//@property {Boolean} isInModal
			,	isInModal: this.inModal
				//@property {Boolean} isInModalOrHideHeader
			,	isInModalOrHideHeader: this.inModal || !!this.options.hideHeader
				//@property {Boolean} showFooter
			,	showFooter: !this.options.hideFooter
				//@property {Boolean} isInModalOrCollectionNotEmpty
			,	isInModalOrCollectionNotEmpty: this.inModal || this.collection.length
			};
		}
	});

});