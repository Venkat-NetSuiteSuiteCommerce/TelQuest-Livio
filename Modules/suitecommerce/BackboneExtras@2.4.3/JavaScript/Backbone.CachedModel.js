/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module BackboneExtras
It adds the Backbome.CachedModel class. 
@class Backbone.CachedModel 
It is a Backbone.Model that will return results from memory the second time you call fetch(). It's 
just an extension of the original Backbone.Model but it uses the Backbone.cachedSync.
@extends Backbone.Model
*/
define('Backbone.CachedModel'
,	[	'Backbone.CachedSync'
	,	'Backbone'
	]
,	function (
		BackboneCachedSync
	,	Backbone
	)
{
	'use strict';

	Backbone.CachedModel = Backbone.Model.extend({
		sync: BackboneCachedSync.cachedSync
	,	addToCache: BackboneCachedSync.addToCache
	,	isCached: BackboneCachedSync.isCached
	});

	return Backbone.CachedModel;
});
