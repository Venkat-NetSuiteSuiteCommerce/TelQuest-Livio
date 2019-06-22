/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductLine
define(
	'ProductLine.Common.Url'
,	[
		'underscore'
	,	'Utils'
	,	'PluginContainer'
	,	'SC.Configuration'
	]
,	function(
		_
	,	utils
	,	PluginContainer
	,	Configuration
	)
{
	'use strict';

	// @class ProductLine.Common.Url
	var ProductLineCommonUrl = {

		//@property {Array<String>} attributesReflectedInURL
		attributesReflectedInURL: ['options', 'quantity']

	,	preURLGenerated: new PluginContainer()

	,	preItemSetFromURL: new PluginContainer()

		//@method getQuery Generates a string query with all the parameters of the current line set
		//@param {Dictionary<String, String?>} parameters_to_override Object where each key indicate a parameter value to override or null if the parameter want to be removed
		//@return {String}
	,	getQuery: function getQuery (parameters_to_override)
		{
			var	query = ''
			,	line_model = this
			,	attributes_to_map_in_url = _.filter(_.keys(line_model.attributes), function (attribute)
				{
					return !!~_.indexOf(ProductLineCommonUrl.attributesReflectedInURL, attribute);
				})
			,	all_parameters = _.map(attributes_to_map_in_url, function (attribute)
				{
					//@class Product.Model.URLParameter
					return {
						//@param {String} param
						param: attribute
						//@param {String} value
					,	value: line_model.get(attribute)
					};
					//@class Product.Model
				});

			all_parameters = this.mapOptionsToURLParameters(all_parameters);

			all_parameters = ProductLineCommonUrl.preURLGenerated.executeAll(all_parameters, this) || all_parameters;

			_.each(parameters_to_override || {}, function (value, parameter)
			{
				var selected_parameter = _.findWhere(all_parameters, {param: parameter});

				if (selected_parameter)
				{
					if (_.isNull(value))
					{
						//Remove parameter
						all_parameters.splice(_.indexOf(all_parameters, selected_parameter), 1);
					}
					else
					{
						//Override value
						selected_parameter.value = value;
					}
				}
				else if (!_.isNull(value))
				{
					//New extra value
					all_parameters.push({
						param: parameter
					,	value: value
					});
				}
			});

			var	params_to_set = _.filter(all_parameters,  _.property('value'));

			query = _.reduce(params_to_set, function (memo_url, option)
					{
						return utils.setUrlParameter(memo_url, option.param, encodeURIComponent(option.value));
					}, query);

			return query;
		}

		//@method generateURL Generates a string URL to a PDP with all the parameters of the current line set
		//@param {Dictionary<String, String?>} parameters_to_override Object where each key indicate a parameter value to override or null if the parameter want to be removed
		//@return {String}
	,	generateURL: function generateURL (parameters_to_override)
		{
			return this.get('item').get('_url') + this.getQuery(parameters_to_override);
		}

		//@method mapOptionsToURLParameters This method make the invert behavior as the method mapURLParametersToOptions.
		//It is called when a URL for the current line is required and based on the current configuration and the options set it generate a list
		//of parameters values that will be reduced into the URL string by the method generateURL
		//@param {Array<Product.Model.URLParameter>} all_parameters
		//@return {Array<Product.Model.URLParameter>}
	,	mapOptionsToURLParameters: function mapOptionsToURLParameters (all_parameters)
		{
			var options_parameter = _.findWhere(all_parameters, {param:'options'});

			if (options_parameter)
			{
				all_parameters.splice(_.indexOf(all_parameters, options_parameter), 1);

				this.get('options').each(function (option)
				{
					if (option.get('value'))
					{
						all_parameters.push({
							param: option.get('urlParameterName')
						,	value: option.get('useLabelsOnUrl') ? option.get('value').label : option.get('value').internalid
						});
					}
				});
			}

			return all_parameters;
		}

		//@method getFullLink Generates a String ready to be used to a link for a PDP. In difference to the method generateURL, getFullLink
		//returns a string that contains the value of href, data-hashtag and data-touchpoint.
		//output example: href="/Californium-Mtr?internalid=910_1&amp;quantity=2" data-touchpoint="home" data-hashtag="#/Californium-Mtr?internalid=910_1&amp;quantity=2"
		//@param {Dictionary<String, String?>} parameters_to_override Object where each key indicate a parameter value to override or null if the parameter want to be removed
		//@return {Object}
	,	getFullLink: function getFullLink (parameters_to_override)
		{
			var url = this.generateURL(parameters_to_override)
			,	link_attributes = {
					href: url
				};

			if (SC.ENVIRONMENT.siteSettings.sitetype === 'ADVANCED')
			{
				_.extend(link_attributes, {
					data: {
						touchpoint: 'home'
					,	hashtag: Configuration.get('currentTouchpoint') !== 'home' ? encodeURIComponent(url) : url
					}
				});
			}

			return utils.objectToAtrributes(link_attributes);
		}

		// @method setOptionsFromURL Given a URL query string, it sets the options in the model
		// @param {ParameterOptions} options
		// @return {Void}
	,	setOptionsFromURL: function setOptionsFromURL (options)
		{
			var self = this;

			options = options || {};
			options = this.mapURLParametersToOptions(options);
			options.quantity && (options.quantity = parseInt(options.quantity, 10));

			options = ProductLineCommonUrl.preItemSetFromURL.executeAll(options, self) || options;

			_.each(options, function (value, name)
			{
				if (value && !!~_.indexOf(ProductLineCommonUrl.attributesReflectedInURL, name))
				{
					self.set(name, value);
				}
			});
		}

		//@method mapURLParametersToOptions Map parameters from URL to its real/internal value. This is needed as based on the configuration
		//it is possible to show in the URL the label of the options and the string of the selected value instead of the internal id.
		//Something like: /item-name?color=red or /item-name?custcol3=2 are both valid urls depending on the configuration
		// @param {ParameterOptions} url_parameters
		// @return {ParameterOptions}
	,	mapURLParametersToOptions: function mapURLParametersToOptions (url_parameters)
		{
			var self = this;

			this.get('options').each(function (option)
			{
				if (url_parameters[option.get('urlParameterName')])
				{
					var aux_param_value = url_parameters[option.get('urlParameterName')]
					,	selected_option_value;

					//Clean URL parameter based on URL option to change to option cartOptionId
					delete url_parameters[option.get('urlParameterName')];

					if (option.get('useLabelsOnUrl'))
					{
						selected_option_value = _.findWhere(option.get('values'), {label: aux_param_value});
						url_parameters[option.get('cartOptionId')] = selected_option_value ? selected_option_value.internalid : aux_param_value;
					}
					else
					{
						url_parameters[option.get('cartOptionId')] =  aux_param_value;
					}
					self.setOption(option.get('cartOptionId'), url_parameters[option.get('cartOptionId')]);
				}
			});

			return url_parameters;
		}

	};

	return ProductLineCommonUrl;
});
