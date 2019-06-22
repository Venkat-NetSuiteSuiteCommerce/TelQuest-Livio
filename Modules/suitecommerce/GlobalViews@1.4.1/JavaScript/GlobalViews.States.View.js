/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define(
	'GlobalViews.States.View'
,	[	'global_views_states.tpl'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	]
,	function(
		global_views_states_tpl

	,	Backbone
	,	jQuery
	,	_
	)
{
	'use strict';

	// @class GlobalViews.States.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_views_states_tpl

		// @method getContext @returns GlobalViews.States.View.Context
	,	getContext: function ()
		{
			var country = this.options.selectedCountry && this.options.countries[this.options.selectedCountry]
			,	states = country && country.states
			,	self = this;

			_.each(states, function (state)
			{
				state.isSelected = state.code === self.options.selectedState;
			});

			//@class GlobalViews.States.View.Context
			return {
				//@property {Boolean} isCountryAndStatePresent
				isCountryAndStatePresent: !!(country && states)
				//@property {String} manage
			,	manage: this.options.manage || ''
				//@property {Array<Object>} sates
			,	states: states
				//@property {String} selectedState
			,	selectedState: this.options.selectedState
				//@property {String} inputClass
			,	inputClass: this.options.cssclass || 'input-xlarge'
			};
		}
	});
});
