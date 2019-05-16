/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Product
define('Product.Option.Model'
,	[
		'ProductLine.Option.Model'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		ProductLineOptionModel

	,	Backbone
	,	_
	,	Utils
	)
{

	'use strict';

	//@class Product.Option.Model @extend ProductLine.Option.Model
	return ProductLineOptionModel.extend({

		//@method initialize Override default method to convert the current model "validate-able"
		//@return {Void}
		initialize: function initialize ()
		{
			ProductLineOptionModel.prototype.initialize.apply(this, arguments);

			// Extend the model with Backbone.Validation.mixin to validate it without a View
			_.extend(this, Backbone.Validation.mixin);
		}

		//@property {Object} validation
	,	validation:
		{
			'value.internalid':
			{
				fn: function optionValueValidator ()
				{
					var value = this.get('value') && this.get('value').internalid;

					if (this.get('isMandatory') && (!value))
					{
						return _('Please specify a value for this option').translate();
					}
					else if (value)
					{
						var max_length = 160;

						if (this.get('type') === 'text' || this.get('type') === 'textarea' )
						{
							if (this.get('isMandatory') && (!Utils.trim(value) || value.length > max_length))
							{
								return _('Please enter a valid input for this string').translate();
							}
							else if (value.length > max_length)
							{
								return _('Please enter a string shorter (maximum length: $(0))').translate(max_length);
							}
						}
						else if (this.get('type') === 'email' && !Backbone.Validation.patterns.email.test(value) )
						{
							return _('Please enter a valid email').translate();
						}
						else if (this.get('type') === 'integer' && !Backbone.Validation.patterns.netsuiteInteger.test(value)) 
						{
							return _('Please enter a valid integer number').translate();
						}
						else if (this.get('type') === 'float' && !Backbone.Validation.patterns.netsuiteFloat.test(value)) 
						{
							return _('Please enter a valid decimal number').translate();
						}
						else if (this.get('type') === 'currency' && !Backbone.Validation.patterns.netsuiteFloat.test(value)) 
						{
							return _('Please enter a valid currency number').translate();
						}
						else if (this.get('type') === 'phone' && !Backbone.Validation.patterns.netsuitePhone.test(value)) 
						{
							return _('Please enter a valid phone').translate();
						}
						else if (this.get('type') === 'percent' && !Backbone.Validation.patterns.netsuitePercent.test(value)) 
						{
							return _('Please enter a valid percent').translate();
						}
						else if (this.get('type') === 'url' && !Backbone.Validation.patterns.netsuiteUrl.test(value)) 
						{
							return _('Please enter a valid url').translate();
						}
						else if (this.get('type') === 'select' && !_.findWhere(this.get('values'), {internalid: value}))
						{
							return _('Please select a valid value for this option').translate();
						}
					}
				}
			}
		}
	});
});
