/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Header
define(
	'Header.Simplified.View'
,	[
		'Header.Logo.View'
	
	,	'header_simplified.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	]
,	function(
		HeaderLogoView
	
	,	header_simplified_tpl

	,	Backbone
	,	BackboneCompositeView
	)
{
	'use strict';

	// @class Header.Simplified.View @extends Backbone.View
	return Backbone.View.extend({
		//@property {Function} template
		template: header_simplified_tpl
		//@method initialize
	,	initialize: function()
		{
			BackboneCompositeView.add(this);
		}
		//@property {Object} childViews
	,	childViews: {

			'Header.Logo': function()
			{
				return new HeaderLogoView(this.options);
			}
		}

	});

});