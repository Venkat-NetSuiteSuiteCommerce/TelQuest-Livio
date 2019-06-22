/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'Merchandising.Zone'
	,	'Merchandising.Item.Collection'
	,	'Merchandising.Rule'
	]
,	function (
		MerchandisingZone
	,	MerchandisingItemCollection
	,	MerchandisingRule
	)
{
	'use strict';

	MerchandisingRule.Collection.getInstance().reset([{
		'internalid': 'nike'
	,	'title': 'Nike Items'
	,	'description': 'Choose the best Nike products.'
	,	'show': 4
	,	'fieldset': 'search'
	,	'filter': [{
			'field_id': 'brand'
		,	'field_value': [
				'Nike'
			]
		}]
	,	'within': false
	,	'sort': []
	,	'exclude': []
	}
,	{
		'internalid': 'shoes'
	,	'title': 'Shoes'
	,	'description': 'Choose the best Shoes.'
	,	'show': 10
	,	'template': 'custom'
	,	'fieldset': 'details'
	,	'filter': [
			{
				'field_id': 'brand'
			,	'field_value': [
					'$current'
				,	'Nike'
				,	'Addidas'
				]
			}
		,	{
				'field_id': 'type'
			,	'field_value': [
					'shoe'
				]
			}
		]
	,	'within': false
	,	'sort': [{
			field_id: 'price'
		,	dir: 'asc'
		}]
	,	'exclude': ['$cart']
	}]);

	return describe('Merchandising.Zone', function ()
	{
		describe('The constructor', function ()
		{
			beforeEach(function ()
			{
				spyOn(MerchandisingZone.prototype, 'initialize');
			});

			it('initializes a new MerchandisingZone', function ()
			{
				new MerchandisingZone(document.createElement('div'), {
					application: SC.Application('Test')
				,	id: 'nike'
				});

				expect(MerchandisingZone.prototype.initialize).toHaveBeenCalled();
			});

			describe('only if there is', function ()
			{
				it('an element', function ()
				{
					var app = SC.Application('Test');

					new MerchandisingZone({
						application: app
					,	id: 'nike'
					});

					new MerchandisingZone(undefined, {
						application: app
					,	id: 'nike'
					});

					new MerchandisingZone([], {
						application: app
					,	id: 'nike'
					});

					new MerchandisingZone('#iDontExist', {
						application: app
					,	id: 'nike'
					});

					expect(MerchandisingZone.prototype.initialize).not.toHaveBeenCalled();
				});

				it('an application', function ()
				{
					var div = document.createElement('div');

					new MerchandisingZone(div, {
						id: 'nike'
					});

					new MerchandisingZone(div, {
						id: 'nike'
					,	application: undefined
					});

					new MerchandisingZone(div, {
						id: 'nike'
					,	application: []
					});

					new MerchandisingZone(div, {
						id: 'nike'
					,	application: 'asd'
					});

					expect(MerchandisingZone.prototype.initialize).not.toHaveBeenCalled();
				});

				it('and a matching rule', function ()
				{
					var div = document.createElement('div')
					,	app = SC.Application('Test');

					new MerchandisingZone(div, {
						application: app
					});

					new MerchandisingZone(div, {
						application: app
					,	id: undefined
					});

					new MerchandisingZone(div, {
						application: app
					,	id: []
					});

					new MerchandisingZone(div, {
						application: app
					,	id: 'test'
					});

					expect(MerchandisingZone.prototype.initialize).not.toHaveBeenCalled();
				});
			});
		});

		describe('On initialize, we call', function ()
		{
			var merch_zone = null;

			beforeEach(function ()
			{
				spyOn(MerchandisingItemCollection.prototype, 'fetch');

				merch_zone = new MerchandisingZone(document.createElement('div'), {
					application: SC.Application('Test')
				,	id: 'nike'
				});
			});

			it('addLoadingClass: adds clases the element', function ()
			{
				spyOn(merch_zone, 'addLoadingClass');

				merch_zone.initialize();

				expect(merch_zone.addLoadingClass).toHaveBeenCalled();
			});

			it('addListeners: event handlers for the items', function ()
			{
				spyOn(merch_zone, 'addListeners');

				merch_zone.initialize();

				expect(merch_zone.addListeners).toHaveBeenCalled();
			});

			it('getApiParams: parses the rules for the request', function ()
			{
				spyOn(merch_zone, 'getApiParams');

				merch_zone.initialize();

				expect(merch_zone.getApiParams).toHaveBeenCalled();
			});

			it('items.fetch: makes the request for the items', function ()
			{
				merch_zone.initialize();

				expect(MerchandisingItemCollection.prototype.fetch).toHaveBeenCalledWith({
					cache: true
				,	data: {
						limit: 4
					,	fieldset: 'search'
					,	brand: 'Nike'
					}
				});
			});
		});

		describe('addListeners', function ()
		{
			var merch_zone = null;

			beforeEach(function ()
			{
				spyOn(MerchandisingItemCollection.prototype, 'fetch');

				merch_zone = new MerchandisingZone(document.createElement('div'), {
					application: SC.Application('Test')
				,	id: 'nike'
				});
			});

			it('on sync, excludeItems', function ()
			{
				spyOn(merch_zone, 'excludeItems');

				merch_zone.addListeners();

				merch_zone.items.trigger('sync');

				expect(merch_zone.excludeItems).toHaveBeenCalled();
			});

			it('on excluded, appendItems', function ()
			{
				spyOn(merch_zone, 'appendItems');

				merch_zone.addListeners();

				merch_zone.items.trigger('excluded');

				expect(merch_zone.appendItems).toHaveBeenCalled();
			});

			it('on appended, removeLoadingClass', function ()
			{
				spyOn(merch_zone, 'removeLoadingClass');

				merch_zone.addListeners();

				merch_zone.items.trigger('appended');

				expect(merch_zone.removeLoadingClass).toHaveBeenCalled();
			});

			it('on error, handleRequestError', function ()
			{
				spyOn(merch_zone, 'handleRequestError');

				merch_zone.addListeners();

				merch_zone.items.trigger('error', 'Hi! This is the "handleRequestError" unit test, don\'t worry about it :)');

				expect(merch_zone.handleRequestError).toHaveBeenCalled();
			});
		});

		describe('getApiParams', function ()
		{
			beforeEach(function ()
			{
				spyOn(MerchandisingItemCollection.prototype, 'fetch');
			});

			it('returns', function ()
			{
				var app = SC.Application('Test')


				,	nike_merch_zone = new MerchandisingZone(document.createElement('div'), {
						application: app
					,	id: 'nike'
					})

				,	shoes_merch_zone = new MerchandisingZone(document.createElement('div'), {
						application: app
					,	id: 'shoes'
					});

				expect(nike_merch_zone.getApiParams()).toEqual({
					limit: 4
				,	fieldset: 'search'
				,	brand: 'Nike'
				});

				expect(shoes_merch_zone.getApiParams()).toEqual({
					limit: 10
				,	fieldset: 'details'
				,	brand: 'Nike,Addidas'
				,	type: 'shoe'
				,	sort: 'price:asc'
				});
			});
		});

		describe('parseApiFilterOptions', function ()
		{

		});

		describe('parseApiSortingOptions', function ()
		{

		});

		describe('getLimit', function ()
		{

		});

		describe('excludeItems', function ()
		{

		});

		describe('applyFilterToItems', function ()
		{

		});

		describe('appendItems', function ()
		{

		});

		describe('addLoadingClass', function ()
		{

		});

		describe('removeLoadingClass', function ()
		{

		});

		describe('handleRequestError', function ()
		{

		});
	});
});