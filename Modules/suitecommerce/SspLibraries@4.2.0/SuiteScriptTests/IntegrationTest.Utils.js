/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('IntegrationTest.Utils',
	[
		'Application'
	,	'Utils'
	,	'SC.Model'
	,	'jQuery.Deferred'
	,	'preconditions'
	,	'underscore'
	]
	, function (
		Application
	,	Utils
	,	SCModel
	,	jQuery
	,	Preconditions
	,	_
	)
{
	'use strict';

	return describe('IntegrationTest.Utils', function ()
	{
		var reviews_record = [];

		beforeAll(function()
		{
			Preconditions.start(
				'create_and_login_customer'
			,	'get_reviews_from_inventory_item'
			,	function(err, customer, reviews)
			{
				_.each(reviews, function(review)
				{
					reviews_record.push(nlapiLoadRecord('customrecord_ns_pr_review', review.id));
				});
			});
		});

		beforeEach(function ()
		{
		});

		describe('deepCopy method', function()
		{
			it('should return null if its called for a function', function()
			{
				expect(Utils.deepCopy(function(){})).toBe(null);
			});

			it('should return the identity if its called for a basic type', function()
			{
				var number = 1;
				expect(Utils.deepCopy(number)).toEqual(number);

				var string = 'string';
				expect(Utils.deepCopy(string)).toEqual(string);

				var boolean = true;
				expect(Utils.deepCopy(boolean)).toEqual(boolean);

				expect(Utils.deepCopy(undefined)).toBeUndefined();
			});

			it('should return the identity if its called for an array of basic types', function()
			{
				var collection = [1, 'string', true, undefined];
				expect(Utils.deepCopy(collection)).toEqual(collection);
			});

			it('should ignore functions and private attributes', function()
			{
				var obj = {
					fn: function(){}
				,	_private_fn: function(){}
				,	_private: 'private'
				,	number: 1
				};
				expect(Utils.deepCopy(obj)).toEqual({number: 1});
			});

			it('should ignore records and return null instead', function()
			{
				if(reviews_record.length)
				{
					var obj = reviews_record[0];

					expect(Utils.deepCopy(obj)).toBeNull();
				}
			});

			it('should ignore records as properties of an object and return null instead', function()
			{
				if(reviews_record.length)
				{
					var obj = {
						fn: function(){}
					,	_private_fn: function(){}
					,	_private: 'private'
					,	record: reviews_record[0]
					,	number: 1
					};

					expect(Utils.deepCopy(obj)).toEqual({record: null, number: 1});
				}
			});

			xit('should ignore nlobj completely and return null', function()
			{
				expect(Utils.deepCopy(nlapiGetWebContainer().getShoppingSession().getCustomer())).toBeNull();
			});

			xit('should ignore nlobj as object properties', function()
			{
				var obj = {
					fn: function(){}
				,	_private_fn: function(){}
				,	_private: 'private'
				,	number: 1
				,	session: testContext.session
				};

				expect(Utils.deepCopy(obj)).toEqual({number: 1, session: null});
			});

			it('should return a copy of an object with nested objects with functions attributes, undefined attributes and basic type attributes', function()
			{
				var obj = {
						fn: function(){}
					,	_private_fn: function(){}
					,	_private: 'private'
					,	number: 1
					,	nested: {
							string: 'string'
						,	_private: true
						,	n: null
						,	collection: [
								{
									fn: function(){}
								,	_private_fn: function(){}
								,	number: 1
								,	obj: {
										bool: false
									}
								,	und: undefined
								}
							,	{
									collection: []
								,	_private: [
										{
											string: 'string'
										}
									,	{}
									]
								}
							]
						,	obj: {
								empty: {}
							,	fn: function(){}
							}
						}
					}

			   ,	expected_obj = {
						number: 1
					,	nested: {
							string: 'string'
						,	n: null
						,	collection: [
								{
									number: 1
								,	obj: {
										bool: false
									}
								,	und: undefined
								}
							,	{
									collection: []
								}
							]
						,	obj: {
								empty: {}
							}
						}
					};

				expect(Utils.deepCopy(obj)).toEqual(expected_obj);
			});

			it('should return a copy of attributes for a SCModel', function()
			{
				var obj = SCModel.extend(
				{
					number: 4
					,	string: 'string'
					,	bool: false
					,	un: undefined
					,	_private: 'private'
					,	obj_attr: {
							number: 4
						,	string: 'string'
						,	bool: false
						,	un: undefined
						,	_private: 'private'
						,	fn: function(){}
						}
				});

				var expected_obj = {
					name: 'SCModel'
				,	number: 4
				,	string: 'string'
				,	bool: false
				,	un: undefined
				,	obj_attr: {
						number: 4
					,	string: 'string'
					,	bool: false
					,	un: undefined
					}
				};

				expect(Utils.deepCopy(obj)).toEqual(expected_obj);
			});

			it('should return a copy of attributes for an array of models', function()
			{
				var obj1 = SCModel.extend(
				{
						number: 4
					,	string: 'string'
					,	bool: false
					,	un: undefined
					,	_private: 'private'
					,	obj: {
							number: 4
						,	string: 'string'
						,	bool: false
						,	un: undefined
						,	_private: 'private'
						,	fn: function(){}
						}
				});

				var obj2 = SCModel.extend(
				{
						number: 7
					,	string: 'string1'
					,	bool: false
					,	un: undefined
					,	_private: 'private'
					,	obj: {
							number: 4
						,	string: 'string1'
						,	bool: true
						,	un: undefined
						,	_private: 'private'
						,	fn: function(){}
						}
				});
				
				var list = [];
				list.push(obj1);
				list.push(obj2);

				var expected_obj = [
					{
						name: 'SCModel'
					,	number: 4
					,	string: 'string'
					,	bool: false
					,	un: undefined
					,	obj: {
							number: 4
						,	string: 'string'
						,	bool: false
						,	un: undefined
						}
					}
				,	{
						name: 'SCModel'
					,	number: 7
					,	string: 'string1'
					,	bool: false
					,	un: undefined
					,	obj: {
							number: 4
						,	string: 'string1'
						,	bool: true
						,	un: undefined
						}
					}
				];

				expect(Utils.deepCopy(list)).toEqual(expected_obj);
			});

			it('should return a copy of an object with nested models, list of models, functions attributes, undefined attributes and basic type attributes', function()
			{
				var obj1 = SCModel.extend({
						number: 4
					,	string: 'string'
					,	bool: false
					,	un: undefined
					,	_private: 'private'
					,	obj: {
							number: 4
						,	string: 'string'
						,	bool: false
						,	un: undefined
						,	_private: 'private'
						,	fn: function(){}
						}
				});

				var obj2 = SCModel.extend(
				{
						number: 7
					,	string: 'string1'
					,	bool: false
					,	un: undefined
					,	_private: 'private'
					,	obj: {
							number: 4
						,	string: 'string1'
						,	bool: true
						,	un: undefined
						,	_private: 'private'
						,	fn: function(){}
						}
				});

				var list = [];
				list.push(obj1);
				list.push(obj2);

				var obj = {
					fn: function(){}
				,	_private_fn: function(){}
				,	_private: 'private'
				,	number: 1
				,	nested: {
						string: 'string'
					,	_private: true
					,	n: null
					,	collection: [
							{
								fn: function(){}
							,	_private_fn: function(){}
							,	number: 1
							,	obj: {
									bool: false
								}
							,	und: undefined
							}
						,	{
								collection: []
							,	_private: [
									{
										string: 'string'
									}
								,	{}
								]
							}
						,	{
								col: list
							}
						]
					,	obj: {
							empty: {}
						,	fn: function(){}
						}
					}
				}

				,	expected_obj =  {
						number: 1
					,	nested: {
							string: 'string'
						,	n: null
						,	collection: [
								{
									number: 1
								,	obj: {
										bool: false
									}
								,	und: undefined
								}
							,	{
									collection: []
								}
							,	{
									col: [
										{
											name: 'SCModel'
										,	number: 4
										,	string: 'string'
										,	bool: false
										,	un: undefined
										,	obj: {
												number: 4
											,	string: 'string'
											,	bool: false
											,	un: undefined
											}
										}
									,	{
											name: 'SCModel'
										,	number: 7
										,	string: 'string1'
										,	bool: false
										,	un: undefined
										,	obj: {
												number: 4
											,	string: 'string1'
											,	bool: true
											,	un: undefined
											}
										}
									]
								}
							]
					,	obj: {
							empty: {}
						}
					}
				};

				expect(Utils.deepCopy(obj)).toEqual(expected_obj);
			});
		});
	});
});