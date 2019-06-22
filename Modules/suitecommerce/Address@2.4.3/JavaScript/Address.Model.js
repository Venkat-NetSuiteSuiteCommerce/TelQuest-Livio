/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Address
define('Address.Model'
,	[	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		_
	,	Backbone
	)
{
	'use strict';

	// @method isCompanyRequired
	// Check if company field is mandatory.
	function isCompanyRequired()
	{
		return	SC &&
				SC.ENVIRONMENT &&
				SC.ENVIRONMENT.siteSettings &&
				SC.ENVIRONMENT.siteSettings.registration &&
				SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T';
	}

	// @method isPhoneRequired
	// Check if phone field is mandatory.
	function isPhoneRequired()
	{
		return	SC &&
				SC.CONFIGURATION &&
				SC.CONFIGURATION.addresses &&
				SC.CONFIGURATION.addresses.isPhoneMandatory;
	}

	// @class Address.Model @extend Backbone.Model
	return Backbone.Model.extend(
	{
		// @property {String} urlRoot
		urlRoot: 'services/Address.Service.ss'

		//@property validation
		// Backbone.Validation attribute used for validating the form before submit.
	,	validation: {
			fullname: { required: true, msg: _('Full Name is required').translate() }
		,	addr1: { required: true, msg: _('Address is required').translate() }
		,	company: { required: isCompanyRequired(), msg: _('Company is required').translate() }
		,	country: { required: true, msg: _('Country is required').translate() }
		,	state: { fn: _.validateState }
		,	city: { required: true, msg: _('City is required').translate() }
		,	zip: { fn: _.validateZipCode }
		,	phone: { required: isPhoneRequired(), fn: _.validatePhone }
		}

		// @method getInvalidAttributes
		// Returns an array of localized attributes that are invalid for the current address.
	,	getInvalidAttributes: function ()
		{
			//As this model is not always used inside a model's view, we need to check that the validation is attached
			var attributes_to_validate = _.keys(this.validation)
			,	attribute_name
			,	invalid_attributes = [];

			this.get('isvalid') !== 'T' && this.isValid(true) && _.extend(this, Backbone.Validation.mixin);

			_.each(attributes_to_validate, function (attribute)
			{
				if (!this.isValid(attribute))
				{
					attribute_name = null;
					switch (attribute)
					{
						case 'fullname':
							attribute_name = _('Full Name').translate();
							break;
						case 'addr1':
							attribute_name = _('Address').translate();
							break;
						case 'city':
							attribute_name = _('City').translate();
							break;
						case 'zip':
							attribute_name = _('Zip Code').translate();
							break;
						case 'country':
							attribute_name = _('Country').translate();
							break;
						case 'phone':
							attribute_name = _('Phone Number').translate();
							break;
						case 'state':
							attribute_name = _('State').translate();
							break;
					}

					if (attribute_name)
					{
						invalid_attributes.push(attribute_name);
					}
				}
			},this);

			return invalid_attributes;
		}
	});
});