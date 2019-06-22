/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Address
define(
	'Address.Details.View'
,	[	'address_details.tpl'

	,	'SC.Configuration'
	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		address_tpl

	,	Configuration
	,	Backbone
	,	_
	)
{
	'use strict';

	//@class Address.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: address_tpl

		//@property {Object} attributes
	,	attributes: {'class': 'AddressDetailsView'}

		//@method initialize Attach to any change on the model and make a render on this changes
		//@return {Void}
	,	initialize: function ()
		{
			this.model.on('sync', _.bind(this.render, this));
		}

	,	destroy: function destroy ()
		{
			this.model.off('sync');
			return this._destroy();
		}

		//@method getContext @return Address.View.Context
	,	getContext: function ()
		{
			var label = this.model.get('label')
			,	company = (Configuration.get('siteSettings.registration.displaycompanyfield') === 'T') ? this.model.get('company') : null
			,	fullname = this.model.get('fullname')

			,	countries = Configuration.get('siteSettings.countries', [])
			,	country_object = countries[this.model.get('country')]
			,	country = (country_object) ? country_object.name : this.model.get('country')
			,	state_object = (country_object && country_object.states) ? _.findWhere(countries[this.model.get('country')].states, {code: this.model.get('state')}): null
			,	state = (state_object) ? state_object.name : this.model.get('state')
			,	invalidAttributes = this.model.getInvalidAttributes() || [];

			//@class Address.View.Context
			return {
				//@property {Address.Model} model
				model: this.model
				//@property {String} internalid
			,	internalid: this.model.get('internalid')
				//@property {Boolean} isManageOptionsSpecified
			,	isManageOptionsSpecified: !!this.options.manage
				//@property {String} manageOption
			,	manageOption: this.options.manage
				//@property {Boolean} showMultiSelect
			,	showMultiSelect: this.options.showMultiSelect
				//@property {Boolean} isAddressCheck
			,	isAddressCheck: !!this.model.get('check')
				//@property {String} title
			,	title: label || company || fullname
				//@property {Boolean} showCompanyAndFullName
			,	showCompanyAndFullName: !!(label && company)
				//@property {String} company
			,	company: company
				//@property {String} fullname
			,	fullname: fullname
				//@property {Boolean} showFullNameOnly
			,	showFullNameOnly: !!(label ? !company : company)
				//@property {String} addressLine1
			,	addressLine1: this.model.get('addr1')
				//@property {Boolean} showAddressLine1
			,	showAddressLine1: !!this.model.get('addr2')
				//@property {String} addressLine2
			,	addressLine2: this.model.get('addr2')
				//@property {String} city
			,	city: this.model.get('city')
				//@property {Boolean} showState
			,	showState: !!this.model.get('state')
				//@property {String} state
			,	state: state
				//@property {String} zip
			,	zip: this.model.get('zip')
				//@property {String} country
			,	country: country
				//@property {String} phone
			,	phone: this.model.get('phone')
				//@property {Boolean} showDefaultLabels
			,	showDefaultLabels: !this.options.hideDefaults
				//@property {Boolean} isDefaultShippingAddress
			,	isDefaultShippingAddress: this.model.get('defaultshipping') === 'T'
				//@property {Boolean} isDefaultBillingAddress
			,	isDefaultBillingAddress: this.model.get('defaultbilling') === 'T'
				//@property {Boolean} showSelectionButton
			,	showSelectionButton: !!this.options.showSelect
				//@property {Boolean} isASelectMessageSpecified
			,	isASelectMessageSpecified: !!this.options.selectMessage
				//@property {String} selectMessage
			,	selectMessage: this.options.selectMessage
				//@property {Boolean} showActionButtons
			,	showActionButtons: !this.options.hideActions
				//@property {Boolean} showChangeButton
			,	showChangeButton: !!this.options.showChangeButton
				//@property {Boolean} showRemoveButton
			,	showRemoveButton: !this.options.hideRemoveButton
				//@property {Boolean} showError
			,	showError: this.options.showError && this.model.get('isvalid') && this.model.get('isvalid') !== 'T' && invalidAttributes.length
				//@property {Array<Object>} invalidAttributes
			,	invalidAttributes: invalidAttributes
				//@property {Boolean} isInvalidAddressToRemove
			,	isInvalidAddressToRemove: !!(this.options.disableRemoveButton && this.options.disableRemoveButton(this.model.get('internalid')))
			};
		}
	});
});
