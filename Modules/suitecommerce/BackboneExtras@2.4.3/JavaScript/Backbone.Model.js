/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module Backbone
@class Backbone.Model
Extends native Backbone.Model to make internalid the idAttribute
*/
define('Backbone.Model'
,	[	'Backbone'
	,	'underscore'
	,	'SC.CancelableEvents'
	]
,	function (
		Backbone
	,	_
	,	SCCancelableEvents
	)
{
	'use strict';

	_.extend(Backbone.Model.prototype
	,	{

			// @method url SCA Overrides @?method Backbone.Model.url to add model's 'internalid' as parameter @return {String}
			url: function ()
			{
				var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url');

				if (this.isNew())
				{
					return base;
				}
				var sep = base.indexOf('?') === -1 ? '?' : '&';
				return base + sep + 'internalid='+ encodeURIComponent(this.id);
			}

			// @method url SCA Overrides @?property Backbone.Model.idAttribute to add model's 'internalid' as parameter @return {String}
		,	idAttribute: 'internalid'

		}
	,	SCCancelableEvents
	);

	return Backbone.Model;
});