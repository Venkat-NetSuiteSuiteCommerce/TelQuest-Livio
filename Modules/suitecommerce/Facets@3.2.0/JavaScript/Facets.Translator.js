/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
// @class Facets.Translator
// Holds the mapping of a url compoment with an api call,
// is able to translate and to return different configurations of himself with diferent options
define('Facets.Translator'
,	[	'underscore'
	,	'jQuery'
	,	'SC.Configuration'
	,	'Utils'
	,	'UrlHelper'
	]
,	function (
		_
	,	jQuery
	,	Configuration
	)
{
	'use strict';

	// This is just for internal use only, DO NOT EDIT IT HERE!!
	// the same options should be somewhere in the configuration file
	var default_config = {
		fallbackUrl: 'search'
	,	defaultShow: null
	,	defaultOrder: null
	,	defaultDisplay: null
	,	facets: []
	,	facetDelimiters: {
			betweenFacetNameAndValue: '/'
		,	betweenDifferentFacets: '/'
		,	betweenDifferentFacetsValues: ','
		,	betweenRangeFacetsValues: 'to'
		,	betweenFacetsAndOptions: '?'
		,	betweenOptionNameAndValue: '='
		,	betweenDifferentOptions: '&'
		}
	};

	//@constructor @param {Array}facets @param {Object} options @param {Object} configuration
	function FacetsTranslator (facets, options, configuration, category)
	{
		// Enforces new
		if (!(this instanceof FacetsTranslator))
		{
			return new FacetsTranslator(facets, options, configuration, category);
		}

		// Facets go Here
		this.facets = [];

		// Other options like page, view, etc. goes here
		this.options = {};

		// This is an object that must contain a fallbackUrl and a lists of facet configurations
		this.configuration = configuration || default_config;

		// Get the facets that are in the sitesettings but not in the config.
		// These facets will get a default config (max, behavior, etc.) - Facets.Translator
		// Include facet aliases to be conisdered as a possible route
		var facets_data = Configuration.get('siteSettings.facetfield')
		,	facets_to_include = [];

		_.each(facets_data, function(facet)
		{
			if (facet.facetfieldid !== 'commercecategory')
			{
				facets_to_include.push(facet.facetfieldid);

				// If the facet has an urlcomponent defined, then add it to the possible values list.
				facet.urlcomponent && facets_to_include.push(facet.urlcomponent);

				// Finally, include URL Component Aliases...
				_.each(facet.urlcomponentaliases, function(facet_alias)
				{
					facets_to_include.push(facet_alias.urlcomponent);
				});
			}
		});

		facets_to_include = _.union(facets_to_include, _.pluck(Configuration.get('facets'), 'id'));
		facets_to_include = _.uniq(facets_to_include);

		this.facetsToInclude = facets_to_include;

		this.isCategoryPage = !!category;

		if (_.isBoolean(category) && category)
		{
			var index = facets.length
			,	facetsToInclude = this.facetsToInclude.slice(0);

			facetsToInclude.push(this.configuration.facetDelimiters.betweenFacetsAndOptions);

			_.each(facetsToInclude, function(facetname)
			{
				var i = facets.indexOf(facetname);

				if (i !== -1 && i < index)
				{
					index = i;
				}
			});

			var categoryUrl = facets.substring(0, index);

			facets = facets.substring(index);

			if (categoryUrl[0] !== '/')
			{
				categoryUrl = '/' + categoryUrl;
			}

			if (categoryUrl[categoryUrl.length - 1] === '/')
			{
				categoryUrl = categoryUrl.substring(0, categoryUrl.length - 1);
			}

			this.categoryUrl = categoryUrl;
		}
		else if (_.isString(category))
		{
			this.categoryUrl = category;
		}

		// We cast on top of the passed in parameters.
		if (facets && options)
		{
			this.facets = facets;
			this.options = options;
		}
		else if (_.isString(facets))
		{
			// It's a url
			this.parseUrl(facets);
		}
		else if (facets)
		{
			// It's an API option object
			this.parseOptions(facets);
		}
	}

	_.extend(FacetsTranslator.prototype, {

		//@property {Object}defaultFacetConfig
		defaultFacetConfig: {
			behavior: 'single'
		,	max: 5
		}

		// @method getFacetsToInclude
	,	getFacetsToInclude: function getFacetsToInclude ()
		{
			return this.facetsToInclude;
		}

		// @method parseUrl Url strings get translated into the differnts part of the object, facets and options
		// @param {String} url
	,	parseUrl: function parseUrl (url)
		{
			// We remove a posible 1st / (slash)
			url = (url[0] === '/') ? url.substr(1) : url;

			// given an url with options we split them into 2 strings (options and facets)
			var facets_n_options = url.split(this.configuration.facetDelimiters.betweenFacetsAndOptions)
			,	facets = (facets_n_options[0] && facets_n_options[0] !== this.configuration.fallbackUrl) ? facets_n_options[0] : ''
			,	options = facets_n_options[1] || '';

			// We treat category as the 1st unnamed facet filter, so if you are using categories
			// we will try to take that out by comparing the url with the category tree
			if (this.isCategoryPage)
			{
				facets = facets.replace(this.categoryUrl, '');

				// We remove a posible 1st / (slash) (again, it me be re added by taking the category out)
				facets = (facets[0] === '/') ? facets.substr(1) : facets;
			}

			// The facet part of the url gets splitted and computed by pairs
			var facet_tokens = facets.split(new RegExp('[\\'+ this.configuration.facetDelimiters.betweenDifferentFacets +'\\'+ this.configuration.facetDelimiters.betweenFacetNameAndValue +']+', 'ig'));

			while (facet_tokens.length > 0)
			{
				var facet_name = facet_tokens.shift()
				,	facet_value = facet_tokens.shift();

				if (!this.facetIsParameter(facet_name))
				{
					this.parseUrlFacet(facet_name, facet_value);
				}
			}

			// The same for the options part of the url
			var options_tokens = options.split(new RegExp('[\\'+ this.configuration.facetDelimiters.betweenOptionNameAndValue +'\\'+ this.configuration.facetDelimiters.betweenDifferentOptions +']+', 'ig'))
			,	tmp_options = {};

			while (options_tokens.length > 0)
			{
				var option_name = options_tokens.shift()
				,	option_value = options_tokens.shift()
				,	option_is_facet = _.contains(this.facetsToInclude, option_name);

				if (option_is_facet && this.facetIsParameter(option_name))
				{
					this.parseUrlFacet(option_name, option_value);
				}

				tmp_options[option_name] = option_value;
			}

			this.parseUrlOptions(tmp_options);
		}


		// @method facetIsParameter
		// Given a facet name, returns true if the facet needs to be interpreted as an url parameter, false otherwise.
		// @param {String} facet_name
	,	facetIsParameter: function facetIsParameter (facet_name)
		{
			var facet_config = this.getFacetConfig(facet_name);

			return _.isUndefined(facet_config.isParameter) ? this.configuration.facetsAsUrlParameters : facet_config.isParameter;
		}

		/*
		@method sanitizeValue
		Translates values that came from the url into JS data types that this objects know of
		Examples for different types:

		range/10to100 gets translated to {from: '10', to: '100'}
		range/100 gets translated to {from: '0', to: '100'}
		multi/1,2,3 gets translated to ['1', '2', '3']
		*/
	,	sanitizeValue: function sanitizeValue (value, behavior)
		{
			var parsed_value;

			switch (behavior)
			{
				case 'range':
					// we return an object like {from: string, to: string }
					if (_.isString(value))
					{
						if (value.indexOf(this.configuration.facetDelimiters.betweenRangeFacetsValues) !== -1)
						{
							var tokens = value.split(this.configuration.facetDelimiters.betweenRangeFacetsValues);
							parsed_value = {from: tokens[0], to: tokens[1]};
						}
						else
						{
							parsed_value = {from: '0', to: value};
						}
					}
					else
					{
						parsed_value = value;
					}

					break;
				case 'multi':
					// we always return an array for a multi value
					if (value.indexOf(this.configuration.facetDelimiters.betweenDifferentFacetsValues) !== -1)
					{
						parsed_value = value.split(this.configuration.facetDelimiters.betweenDifferentFacetsValues);
					}
					else
					{
						parsed_value = [value];
					}

					break;
				default:
					parsed_value = value;
			}

			return parsed_value;
		}

		// @method getUrlFacetValue
		// Returns the value of an active facet by the facet URL component
		// @param {String} facet_url
	,	getUrlFacetValue: function getUrlFacetValue (facet_url)
		{
			return (_.find(this.facets, function (facet)
			{
				return facet.url === facet_url;
			}) || {}).value;
		}

		// @method getFacetValue:
		// Returns the value of an active facet by the facet id
		// @param {String} facet_id
	,	getFacetValue: function getFacetValue (facet_id)
		{
			return (_.find(this.facets, function (facet)
			{
				return facet.id === facet_id;
			}) || {}).value;
		}

		// @method getAllFacets
		// @returns {Array} a copy of the internal array of facets containing values and configuration
	,	getAllFacets: function getAllFacets ()
		{
			return this.facets.slice(0);
		}

		// @param getOptionValue
		// Returns the value of an active options or it's default value
	,	getOptionValue: function getOptionValue (option_id)
		{
			return this.options[option_id] || null;
		}

		// @param parseUrlFacet
		// for a given name value, it gets the config, sanitize the value and stores it all in the internal facets array
		// @param {String} @param {String} value
	,	parseUrlFacet: function parseUrlFacet (name, value)
		{
			// Gets the config for the current facet
			var config = this.getFacetConfig(name, 'id');

			if (config.id === 'commercecategoryname' || config.id === 'category' || !name)
			{
				return;
			}

			this.facets.push({
				config: config
			,	id: config.id
			,	url: config.id
			,	value: this.sanitizeValue(value, config.behavior)
			,	isParameter: config.isParameter
			});
		}

		// @method parseFacet:
		// Same as parseUrlFacet but from id
		// @param facet_id @param value
	,	parseFacet: function parseFacet (facet_id, value)
		{
			// Gets the config for the current facet
			var config = this.getFacetConfig(facet_id, 'id');

			this.facets.push({
				config: config
			,	id: config.id
			,	url: config.id
			,	value: this.sanitizeValue(value, config.behavior)
			,	isParameter: config.isParameter
			});
		}

		// @method parseUrlOptions:
		// Sets options from the options argument or sets default values
		// @param {Object} options
	,	parseUrlOptions: function parseUrlOptions (options)
		{
			this.options.show = options.show || this.configuration.defaultShow;
			this.options.order = options.order || this.configuration.defaultOrder;
			this.options.page = parseInt(options.page, 10) || 1;
			this.options.display = options.display || this.configuration.defaultDisplay;
			this.options.keywords = options.keywords ? decodeURIComponent(options.keywords) : this.configuration.defaultKeywords;
		}

		// facet@method getFacetConfig
		// Gets the configuration for a given facet by id,
		// @param {String}name @param {String}by
	,	getFacetConfig: function getFacetConfig (name)
		{
			var result =  _.find(this.configuration.facets, function (facet)
			{
				return facet.id === name;
			});

			result =  result || _.find(this.configuration.facets, function (facet)
			{
				return facet.url === name;
			});

			return result || _.extend({ id: name, name: name, url: name, isParameter: undefined }, this.defaultFacetConfig);
		}

			// @method getUrl
		// Gets the url for current state of the object
	,	getUrl: function getUrl ()
		{
			var url = this.categoryUrl || ''
			,	self = this;

			// Prepares seo limits
			var facets_seo_limits = {};

			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				facets_seo_limits = {
					numberOfFacetsGroups: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.numberOfFacetsGroups || false
				,	numberOfFacetsValues: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.numberOfFacetsValues || false
				,	options: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.options || false
				};
			}

			// If there are too many facets selected
			if (facets_seo_limits.numberOfFacetsGroups && this.facets.length > facets_seo_limits.numberOfFacetsGroups)
			{
				return '#';
			}

			// Encodes the other Facets
			var sorted_facets = _.sortBy(this.facets, 'url')
			,	facets_as_options = [];

			for (var i = 0; i < sorted_facets.length; i++)
			{
				var facet = sorted_facets[i];

				// Category should be already added
				if ((facet.id === 'commercecategoryname') || (facet.id === 'category'))
				{
					break;
				}

				var name = facet.url || facet.id
				,	value = '';

				switch (facet.config.behavior)
				{
					case 'range':
						facet.value = (typeof facet.value === 'object') ? facet.value : {from: 0, to: facet.value};
						value = facet.value.from + self.configuration.facetDelimiters.betweenRangeFacetsValues + facet.value.to;
						break;
					case 'multi':
						value = facet.value.sort().join(self.configuration.facetDelimiters.betweenDifferentFacetsValues);

						if (facets_seo_limits.numberOfFacetsValues && facet.value.length > facets_seo_limits.numberOfFacetsValues)
						{
							return '#';
						}

						break;
					default:
						value = facet.value;
				}

				if (self.facetIsParameter(name))
				{
					facets_as_options.push({ facetName: name, facetValue: value });
				}
				else
				{
					// Do not add a facet separator at the begining of an url
					if (url !== '')
					{
						url += self.configuration.facetDelimiters.betweenDifferentFacets;
					}

					url += name + self.configuration.facetDelimiters.betweenFacetNameAndValue + value;
				}
			}

			url = (url !== '') ? url : '/' + this.configuration.fallbackUrl;

			// Encodes the Options
			var tmp_options = {}
			,	separator = this.configuration.facetDelimiters.betweenOptionNameAndValue;

			if (this.options.order && this.options.order !== this.configuration.defaultOrder)
			{
				tmp_options.order = 'order' + separator + this.options.order;
			}

			if (this.options.page && parseInt(this.options.page, 10) !== 1)
			{
				tmp_options.page = 'page' + separator + encodeURIComponent(this.options.page);
			}

			if (this.options.show && parseInt(this.options.show, 10) !== this.configuration.defaultShow)
			{
				tmp_options.show = 'show' + separator + encodeURIComponent(this.options.show);
			}

			if (this.options.display && this.options.display !== this.configuration.defaultDisplay)
			{
				tmp_options.display = 'display' + separator + encodeURIComponent(this.options.display);
			}

			if (this.options.keywords && this.options.keywords !== this.configuration.defaultKeywords)
			{
				tmp_options.keywords = 'keywords' + separator + encodeURIComponent(this.options.keywords);
			}

			for (i = 0; i < facets_as_options.length; i ++)
			{
				var facet_option_obj = facets_as_options[i];
				
				tmp_options[facet_option_obj.facetName] = facet_option_obj.facetName + separator + facet_option_obj.facetValue;
			}

			var tmp_options_keys = _.keys(tmp_options)
			,	tmp_options_vals = _.values(tmp_options);

			// If there are options that should not be indexed also return #
			if (facets_seo_limits.options && _.difference(tmp_options_keys, facets_seo_limits.options).length)
			{
				return '#';
			}

			url += (tmp_options_vals.length) ? this.configuration.facetDelimiters.betweenFacetsAndOptions + tmp_options_vals.join(this.configuration.facetDelimiters.betweenDifferentOptions) : '';

			return _(url).fixUrl();
		}

		// @method getCategoryUrl Returns the current category url
	,	getCategoryUrl: function getCategoryUrl ()
		{
			return this.categoryUrl;
		}

		// @method getApiParams
		// Gets the api parameters representing the current status of the object
	,	getApiParams: function getApiParams ()
		{
			var params = {};

			_.each(this.facets, function (facet)
			{
				switch (facet.config.behavior)
				{
				case 'range':
					var value = (typeof facet.value === 'object') ? facet.value : {from: 0, to: facet.value};
					params[facet.id + '.from'] = value.from;
					params[facet.id + '.to'] = value.to;
					break;
				case 'multi':
					params[facet.id] = facet.value.sort().join(',') ; // this coma is part of the api call so it should not be removed
					break;
				default:
					params[facet.id] =  facet.value;
				}
			});

			params.sort = this.options.order;
			params.limit = this.options.show;
			params.offset = (this.options.show * this.options.page) - this.options.show;

			params.q = this.options.keywords;

			if (this.isCategoryPage)
			{
				params.commercecategoryurl = this.categoryUrl;
				params.sort = params.sort.replace('relevance', 'commercecategory');
			}

			return params;
		}

		// @method cloneForFacetId
		// retruns a deep copy of this object with a new value for one facet,
		// if in a name value that is the same as what's in, it will take it out
	,	cloneForFacetId: function cloneForFacetId (facet_id, facet_value)
		{
			// Using jQuery here because it offers deep cloning
			var facets	= _.toArray(jQuery.extend(true, {}, this.facets))
			,	options	= jQuery.extend(true, {}, this.options)
			,	current_facet = _.find(facets, function (facet)
				{
					return facet.id === facet_id;
				});

			if (current_facet)
			{
				if (current_facet.config.behavior === 'multi')
				{
					if (_.indexOf(current_facet.value, facet_value) === -1)
					{
						current_facet.value.push(facet_value);
					}
					else
					{
						current_facet.value = _.without(current_facet.value, facet_value);
					}

					if (current_facet.value.length === 0)
					{
						facets = _.without(facets, current_facet);
					}
				}
				else
				{
					if (!_.isEqual(current_facet.value, facet_value))
					{
						current_facet.value = facet_value;
					}
					else
					{
						facets = _.without(facets, current_facet);
					}
				}
			}

			options.page = 1;

			var translator = new FacetsTranslator(facets, options, this.configuration, this.categoryUrl);

			if (!current_facet)
			{
				translator.parseFacet(facet_id, facet_value);
			}

			return translator;
		}

		// @method cloneWithoutFacetId
		// retruns a deep copy of this object without a facet,
	,	cloneWithoutFacetId: function cloneWithoutFacetId (facet_id)
		{
			var facets = _.toArray(jQuery.extend(true, {}, this.facets))
			,	options = jQuery.extend(true, {}, this.options);

			facets = _.without(facets, _.find(facets, function (facet)
			{
				return facet.id === facet_id;
			}));

			return new FacetsTranslator(facets, options, this.configuration, this.categoryUrl);
		}

		// @method cloneWithoutFacets
		// Clones the translator removeing all the facets, leaving only options
	,	cloneWithoutFacets: function cloneWithoutFacets ()
		{
			// Creates a new translator with the same params as this;
			var translator = new FacetsTranslator(this.facets, this.options, this.configuration, this.categoryUrl);

			_.each(translator.getAllFacets(), function (facet)
			{
				// Categories are not facets, so lets not remove those
				if ((facet.id !== 'commercecategoryname') && (facet.id !== 'category'))
				{
					translator = translator.cloneWithoutFacetId(facet.id);
				}
			});

			return translator;
		}

		//@method cloneForOption
	,	cloneForOption: function cloneForOption (option_id, option_value)
		{
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets))
			,	options = jQuery.extend(true, {}, this.options);

			options[option_id] = option_value;
			return new FacetsTranslator(facets, options, this.configuration, this.categoryUrl);
		}

		// @method cloneForOptions
		// same as cloneForFacetId but for options instead of facets
	,	cloneForOptions: function cloneForOptions (object)
		{
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets))
			,	options = jQuery.extend(true, {}, this.options, object);

			return new FacetsTranslator(facets, options, this.configuration, this.categoryUrl);
		}

		// @method cloneWithoutOption
		// same as cloneWithoutFacetId but for options instead of facets
	,	cloneWithoutOption: function cloneWithoutOption (option_id)
		{
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets))
			,	options = jQuery.extend(true, {}, this.options);

			delete options[option_id];

			return new FacetsTranslator(facets, options, this.configuration, this.categoryUrl);
		}

		// @method resetAll
		// Returns a blank instance of itself
	,	resetAll: function resetAll ()
		{
			return new FacetsTranslator([], {}, this.configuration, false);
		}

		// @method setLabelsFromFacets
		// This let the translator known about labels the api proportions
		// Tho this make the translator a bit less API agnostic
		// this step is totaly optional and it should work regardless of this step
	,	setLabelsFromFacets: function setLabelsFromFacets (facets_labels)
		{
			this.facetsLabels = facets_labels;
		}

		// @method getLabelForValue
		// If facets labels have been setted it will try to look for the label for the
		// [id, value] combination and return it's label, otherways it will return the value
	,	getLabelForValue: function getLabelForValue (id, value)
		{
			var facet = _.filter(this.facetsLabels || [], function (facet_label)
				{
					return facet_label.id === id || facet_label.url === id;
				});

			if (facet.length)
			{
				var label = _.where(facet[0].values || [], {name: value});

				// if the value could not be found by name, look for url
				if (!label.length)
				{
					label = _.where(facet[0].values || [], {url: value});
				}

				if (label.length && label[0].label)
				{
					return label[0].label;
				}
			}

			return value;
		}
	});

	return FacetsTranslator;
});
