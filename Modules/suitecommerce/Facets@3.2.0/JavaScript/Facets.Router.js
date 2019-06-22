/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define('Facets.Router'
,	[
		'Facets.Browse.View'
	,	'Facets.Helper'
	,	'Facets.Model'
	,	'Categories'
	,	'Categories.Model'
	,	'AjaxRequestsKiller'
	,	'Profile.Model'

	,	'underscore'
	,	'Backbone'
	,	'jQuery'
	,	'SC.Configuration'
	]
,	function (
		BrowseView
	,	Helper
	,	Model
	,	Categories
	,	CategoriesModel
	,	AjaxRequestsKiller
	,	ProfileModel

	,	_
	,	Backbone
	,	jQuery
	,	Configuration
	)
{
	'use strict';


	// @class Facets.Router Mixes the Translator, Model and View @extends Backbone.Router
	return Backbone.Router.extend({

		initialize: function (application)
		{
			this.application = application;
			this.translatorConfig = application.translatorConfig;
		}

	,	addUrl: function (urls, functionToCall)
		{
			if (urls.length)
			{
				urls = _.map(urls, function (url)
				{
					return url.replace(/^\//, '');
				});
				var rootRegex = '^\\b(' + urls.join('|') + ')\\b$'
				,	regex = '^\\b(' + urls.join('|') + ')\\b[\\'+Configuration.get('facetDelimiters.betweenFacetNameAndValue')+'\\?].*$';

				this.route(new RegExp(rootRegex), functionToCall);
				this.route(new RegExp(regex), functionToCall);
			}
		}

		//@method getFacetsAliasesMapping @param {Array<Object>} corrections
	,	getFacetsAliasesMapping: function (corrections)
		{
			var facets_aliases_mapping = {};

			_.each(corrections, function (correction)
			{
				facets_aliases_mapping[correction.usedAlias] = {
					url: correction.url
				,	type: correction.type ? correction.type : ''
				};
			});

			return facets_aliases_mapping;
		}

	,	unaliasUrlHelper: function (facet_tokens, facets_aliases_mapping, separator_between_facets, separator_between_facet_name_and_value)
		{
			var translated_facets = '';

			while (facet_tokens.length > 0)
			{
				var facet_name = facet_tokens.shift()
				,	facet_value = facet_tokens.shift();

				if (_.isUndefined(facet_name) || _.isUndefined(facet_value))
				{
					continue;
				}

				var facet_name_correction = facets_aliases_mapping[facet_name]
				,	facet_value_correction =  facets_aliases_mapping[facet_value]

					// Just double check if unalias is correct... not undefined and unalias type matches with the url component being analyzed!
				,	facet_name_correction_url = facet_name_correction && facet_name_correction.type.toUpperCase() === 'FACET' ? facet_name_correction.url : null
				,	facet_value_correction_url = facet_value_correction && facet_value_correction.type.toUpperCase() === 'FACET_VALUE' ? facet_value_correction.url : null;

				if (facet_name_correction_url && facet_value_correction_url)
				{
					translated_facets += facet_name_correction_url + separator_between_facet_name_and_value + facet_value_correction_url;
				}
				else if (facet_name_correction_url && !facet_value_correction_url)
				{
					translated_facets += facet_name_correction_url + separator_between_facet_name_and_value + facet_value;
				}
				else if (!facet_name_correction_url && facet_value_correction_url)
				{
					translated_facets += facet_name + separator_between_facet_name_and_value + facet_value_correction_url;
				}
				else
				{
					translated_facets += facet_name + separator_between_facet_name_and_value + facet_value;
				}

				if (facet_tokens.length > 0)
				{
					translated_facets += separator_between_facets;
				}
			}

			return translated_facets;
		}

		//@method unaliasUrl @param {String} aliased_url @param {Array<Object>} corrections
	,	unaliasUrl: function (aliased_url, corrections)
		{
			if (aliased_url.indexOf('http://') === 0 || aliased_url.indexOf('https://') === 0)
			{
				throw new Error('URL must be relative');
			}

			aliased_url = (aliased_url[0] === '/') ? aliased_url.substr(1) : aliased_url;

			var facet_delimiters = this.translatorConfig.facetDelimiters
			,	facets_n_options = aliased_url.split(facet_delimiters.betweenFacetsAndOptions)
			,	facets = (facets_n_options[0] && facets_n_options[0] !== this.translatorConfig.fallbackUrl) ? facets_n_options[0] : ''
			,	options = facets_n_options[1] || ''
			,	facet_tokens = facets.split(new RegExp('[\\' + facet_delimiters.betweenDifferentFacets + '\\' + facet_delimiters.betweenFacetNameAndValue + ']+', 'ig'))
			,	facets_aliases_mapping = this.getFacetsAliasesMapping(corrections)
			,	unaliased_url = this.unaliasUrlHelper(facet_tokens, facets_aliases_mapping, facet_delimiters.betweenDifferentFacets, facet_delimiters.betweenFacetNameAndValue);

			if (options)
			{
				var option_tokens = [];

				options.replace(new RegExp('([^' + facet_delimiters.betweenFacetsAndOptions + facet_delimiters.betweenOptionNameAndValue + facet_delimiters.betweenDifferentOptions + ']+)(' + facet_delimiters.betweenOptionNameAndValue + '([^' + facet_delimiters.betweenDifferentOptions + ']*))?', 'ig'), function($0, $1, $2, $3) {
					option_tokens.push($1);
					option_tokens.push($3);
				});

				var unaliased_options = this.unaliasUrlHelper(option_tokens, facets_aliases_mapping, facet_delimiters.betweenDifferentOptions, facet_delimiters.betweenOptionNameAndValue);

				unaliased_url = (unaliased_url !== '') ? unaliased_url : this.translatorConfig.fallbackUrl;
				unaliased_url += facet_delimiters.betweenFacetsAndOptions + unaliased_options;
			}

			return unaliased_url;
		}

	,	showPage: function (isCategoryPage)
		{
			var self = this
			,	facetModel = new Model()
			,	fullurl = Backbone.history.fragment
			,	models = [facetModel]
			,	translator = Helper.parseUrl(fullurl, this.translatorConfig, isCategoryPage);

			facetModel.options = {
				data: translator.getApiParams()
			,	killerId: AjaxRequestsKiller.getKillerId()
			,	pageGeneratorPreload: true
			};

			//if prices aren't to be shown we take out price related facet
			//and clean up the url
			if (ProfileModel.getInstance().hidePrices())
			{
				translator = translator.cloneWithoutFacetId('onlinecustomerprice');
				Backbone.history.navigate(translator.getUrl());
			}

			if (isCategoryPage)
			{
				var categoryModel = new CategoriesModel();

				categoryModel.options = {
					data: { 'fullurl': translator.getCategoryUrl() }
				,	killerId: AjaxRequestsKiller.getKillerId()
				};

				facetModel.set('category', categoryModel);
				models.push(categoryModel);
			}

			jQuery.when.apply(null, _.invoke(models, 'fetch', {}))
				.then(function (facetResponse)
				{
					facetResponse = isCategoryPage ? facetResponse[0] : facetResponse;

					if (facetResponse.corrections && facetResponse.corrections.length > 0)
					{
						var unaliased_url = self.unaliasUrl(fullurl, facetResponse.corrections);

						if (SC.ENVIRONMENT.jsEnvironment === 'server')
						{
							nsglobal.statusCode = 301;
							nsglobal.location = '/' + unaliased_url;
						}
						else
						{
							Backbone.history.navigate('#' + unaliased_url, {trigger: true});
						}
					}
					else
					{
						var view = new BrowseView({
							translator: translator
						,	translatorConfig: self.translatorConfig
						,	application: self.application
						,	model: facetModel
						});

						translator.setLabelsFromFacets(facetModel.get('facets') || []);
						view.showContent();
					}
				});
		}

		// @method categoryLoading This handles all the routes of the category list
	,	categoryLoading: function ()
		{
			this.showPage(true);
		}

		// @method facetLoading This handles all the routes of the item list
	,	facetLoading: function ()
		{
			this.showPage();
		}
	});
});