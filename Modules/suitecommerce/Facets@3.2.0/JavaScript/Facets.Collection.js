/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define('Facets.Collection', 
	[
		'Backbone.CachedCollection'
	,	'Facets.Model'
	,	'Profile.Model'
	]
,	function (
		BackboneCachedCollection
	,	FacetsModel
	,	ProfileModel
	)
{
	'use strict';
	// @class Facets.Collection @extends {Backbone.CachedCollection}
	return  BackboneCachedCollection.extend({
		
		url: ProfileModel.getInstance().getSearchApiUrl()
	
	,	model: FacetsModel
		
	,	parse: function (response)
		{
			return [response];
		}
		
	});
});
