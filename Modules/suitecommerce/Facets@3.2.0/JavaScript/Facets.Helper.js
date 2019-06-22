/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
// @class Facets.Helper
// Helps you with the creation of translators
define('Facets.Helper'
,	[
		'Facets.Translator'
	]
,	function (
		Translator
	)
{
	'use strict';

	return {
		settings_stack: []

		// @method parseUrl Returns a Facet.Translator for the passed url and configuration @static
	,	parseUrl: function (fullurl, configuration, isCategoryPage)
		{
			return new Translator(fullurl, null, configuration, isCategoryPage);
		}

		// @method setCurrent @param {Object} settings @static
	,	setCurrent: function (settings)
		{
			this.settings_stack.push(settings);
		}

		// @method getCurrent @returns {Object} @static
	,	getCurrent: function ()
		{
			return this.settings_stack[this.settings_stack.length - 1];
		}

		// @method getPrevious @returns {Object} @static
	,	getPrevious: function ()
		{
			return this.settings_stack[this.settings_stack.length - 2];
		}
	};
});
