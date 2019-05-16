/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Case.Fields.Model.js 
// -----------------------
// Model for handling Support Cases Fields
// @module Case
define(
	'Case.Fields.Model'
,	[
		'Backbone'
	,	'underscore'
	,	'Utils'
	]
	,	function (
			Backbone
		,	_
	)
{
	'use strict';

	// @class Case.Fields.Model @extends Backbone.Model
	return Backbone.Model.extend({
		
		//@property {String} urlRoot
		urlRoot: _.getAbsoluteUrl('services/Case.Fields.Service.ss')
	});
});