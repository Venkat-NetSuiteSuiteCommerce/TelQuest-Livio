/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module BackboneExtras 
// @class Backbone.CachedCollection 
// It's just an extension of the original Backbone.Collection but it uses the Backbone.cachedSync 
// @extends Backbone.Collection
define('Backbone.CachedCollection'
,	[	'Backbone.CachedSync'
	,	'Backbone'
	]
,	function (
		BackboneCachedSync
	,	Backbone
	)
{
	'use strict';

	Backbone.CachedCollection = Backbone.Collection.extend({
		sync: BackboneCachedSync.cachedSync
	,	addToCache: BackboneCachedSync.addToCache
	,	isCached: BackboneCachedSync.isCached
	});

	return Backbone.CachedCollection;

});
