/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'ItemRelations.Related.Collection'
	,	'ItemRelations.Correlated.Collection'
	]
,	function (
		RelatedCollection	
	,	CorrelatedCollection	
	)
{
	'use strict';

	describe('ItemRelations Related Items Collection', function ()
	{
		it('parse: function should be defined', function ()
		{
			var related_items = new RelatedCollection({itemsIds: []});

			expect(related_items.parse).toBeDefined();
			expect(related_items.parse instanceof Function).toBeTruthy();
		});

		it('parse: related items should be parsed correctly', function ()
		{
			var related_items = new RelatedCollection({itemsIds: []});

			var fake_response = { items: [{internalid: 'item', relateditems_detail: [{internalid: 'related1'},{internalid: 'related2'}]}]};

			var related_items_parse_result = related_items.parse(fake_response);

			expect(related_items_parse_result instanceof Array).toBeTruthy();
			expect(related_items_parse_result.length).toEqual(2);
		});

		it('parse: no related items should return empty collection', function ()
		{
			var related_items = new RelatedCollection({itemsIds: []});

			var fake_response = { items: [{internalid: 'item', relateditems_detail: []}]};

			var related_items_parse_result = related_items.parse(fake_response);

			expect(related_items_parse_result instanceof Array).toBeTruthy();
			expect(related_items_parse_result.length).toEqual(0);
		});

		it('fetchItems: related items collection fetch should be invoked with the correct parameters', function ()
		{
			// arrange
			var related_items = new RelatedCollection({itemsIds: [1,2,3]});
			spyOn(related_items, 'fetch').and.callFake(function() {
				return jQuery.Deferred();
			});

			var expected_parameters = { data : { id : '1,2,3' } };

			// act
			related_items.fetchItems();

			// assert
			expect(related_items.fetch).toHaveBeenCalled();
			expect(related_items.fetch).toHaveBeenCalledWith(expected_parameters);
		});

		it('fetchItems: fetch ids should be in ASC order for better cache collision', function ()
		{
			// arrange
			var related_items = new RelatedCollection({itemsIds: [3,1,2]});
			spyOn(related_items, 'fetch').and.callFake(function() {
				return jQuery.Deferred();
			});

			var expected_parameters = { data : { id : '1,2,3' } };

			// act
			related_items.fetchItems();

			// assert
			expect(related_items.fetch).toHaveBeenCalled();
			expect(related_items.fetch).toHaveBeenCalledWith(expected_parameters);
		});
	});

	describe('ItemRelations Correlated Items Collection', function ()
	{
		it('parse: function should be defined', function ()
		{
			var correlated_items = new CorrelatedCollection({itemsIds: []});

			expect(correlated_items.parse).toBeDefined();
			expect(correlated_items.parse instanceof Function).toBeTruthy();
		});

		it('parse: correlated items should be parsed correctly', function ()
		{
			var correlated_items = new CorrelatedCollection({itemsIds: []});

			var fake_response = { items: [{internalid: 'item', correlateditems_detail: [{internalid: 'correlated1'},{internalid: 'correlated2'}]}]};

			var correlated_items_parse_result = correlated_items.parse(fake_response);

			expect(correlated_items_parse_result instanceof Array).toBeTruthy();
			expect(correlated_items_parse_result.length).toEqual(2);
		});

		it('parse: no correlated items should return emtpy collection', function ()
		{
			var correlated_items = new CorrelatedCollection({itemsIds: []});

			var fake_response = { items: [{internalid: 'item', correlateditems_detail: []}]};

			var correlated_items_parse_result = correlated_items.parse(fake_response);

			expect(correlated_items_parse_result instanceof Array).toBeTruthy();
			expect(correlated_items_parse_result.length).toEqual(0);
		});

		it('fetchItems: correlated items collection fetch should be invoked with the correct parameters', function ()
		{
			// arrange
			var correlated_items = new CorrelatedCollection({itemsIds: [1,2,3]});
			spyOn(correlated_items, 'fetch').and.callFake(function() {
				return jQuery.Deferred();
			});

			var expected_parameters = { data : { id : '1,2,3' } };

			// act
			correlated_items.fetchItems();

			// assert
			expect(correlated_items.fetch).toHaveBeenCalled();
			expect(correlated_items.fetch).toHaveBeenCalledWith(expected_parameters);
		});

		it('fetchItems: fetch ids should be in ASC order for better cache collision', function ()
		{
			// arrange
			var correlated_items = new CorrelatedCollection({itemsIds: [3,1,2]});
			spyOn(correlated_items, 'fetch').and.callFake(function() {
				return jQuery.Deferred();
			});

			var expected_parameters = { data : { id : '1,2,3' } };

			// act
			correlated_items.fetchItems();

			// assert
			expect(correlated_items.fetch).toHaveBeenCalled();
			expect(correlated_items.fetch).toHaveBeenCalledWith(expected_parameters);
		});
	});
});