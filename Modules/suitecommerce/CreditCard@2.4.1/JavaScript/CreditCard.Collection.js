/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditCard
define('CreditCard.Collection'
,	[	'CreditCard.Model'
	,	'Backbone'
	]
,	function (
		Model
	,	Backbone
	)
{
	'use strict';

	// @class CreditCard.Collection Credit cards collection @extends Backbone.Collection
	return Backbone.Collection.extend({

		model: Model

	,	url: 'services/CreditCard.Service.ss'

	,	comparator: function (model)
		{
			return model.get('ccdefault') !== 'T';// ? 0 : 1;
		}

	});
});
