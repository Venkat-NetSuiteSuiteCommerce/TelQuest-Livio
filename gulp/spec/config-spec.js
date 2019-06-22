var shell = require('shelljs')
,	package_manager = require('../package-manager')
,	exec = require('./exec')
,	ConfigTool = require('../config')
,	_ = require('underscore')
var data, tool;
describe('configuration tool', function()
{
	beforeAll(function()
	{
			tool = new ConfigTool();
	});
	describe('modification:', function()
	{
		beforeEach(function()
		{
    		data = MOCK1();
    		data[0].modifications = [];
  		});
		describe('add', function()
		{
			function addModification(target, action, value)
			{
				data[0].modifications.push(
			    {
			        "target": target,
			        "action": action,
			        "value": value
			    });
			}
			describe('to a string target a', function()
			{
				function generateConcatenatedResultTest(target, value)
				{
					it(target.desc,function()
					{
						addModification(target.q, 'add', value);
						var previewsValue = target.getValue(data);
						var errors = tool.modifications(data);
						failIfError(errors);
						expect(target.getValue(data)).toBe(previewsValue+value);
					});
				}
				describe('text', function()
				{
					generateConcatenatedResultTest(target().property.string()[0], '!!!!');
					generateConcatenatedResultTest(target().arrayElement.string()[0], '!!!!');
				});
				describe('number', function()
				{
					generateConcatenatedResultTest(target().property.string()[0], 5);
					generateConcatenatedResultTest(target().arrayElement.string()[0], 5);
				});
				it('object', function()
				{
					addModification(target().property.string()[0].q, 'add', {});
					addModification(target().arrayElement.string()[0].q, 'add', {id:'id'});
					var errors = tool.modifications(data);
					expect(errors).toContain('Only a string or a number value can be added to a target of string type {"target":"$[?(@property == \'group\' && @.id == \'productList\')].id","action":"add","value":{}}');
					expect(errors).toContain('Only a string or a number value can be added to a target of string type {"target":"$.properties.[\'productList.privacy\'].enum[0]","action":"add","value":{"id":"id"}}');
				});
				it('boolean(true or false)', function()
				{
					addModification(target().property.string()[0].q, 'add', true);
					addModification(target().arrayElement.string()[0].q, 'add', false);
					var errors = tool.modifications(data);
					expect(errors).toContain('Only a string or a number value can be added to a target of string type {"target":"$[?(@property == \'group\' && @.id == \'productList\')].id","action":"add","value":true}');
					expect(errors).toContain('Only a string or a number value can be added to a target of string type {"target":"$.properties.[\'productList.privacy\'].enum[0]","action":"add","value":false}');
				});
				it('array', function()
				{
					addModification(target().property.string()[0].q, 'add', []);
					addModification(target().arrayElement.string()[0].q, 'add', [false]);
					var errors = tool.modifications(data);
					expect(errors).toContain('Only a string or a number value can be added to a target of string type {"target":"$[?(@property == \'group\' && @.id == \'productList\')].id","action":"add","value":[]}');
					expect(errors).toContain('Only a string or a number value can be added to a target of string type {"target":"$.properties.[\'productList.privacy\'].enum[0]","action":"add","value":[false]}');
				});
				it('null', function()
				{
					addModification(target().property.string()[0].q, 'add', null);
					addModification(target().arrayElement.string()[0].q, 'add', null);
					var errors = tool.modifications(data);
					expect(errors).toContain('Only a string or a number value can be added to a target of string type {"target":"$[?(@property == \'group\' && @.id == \'productList\')].id","action":"add","value":null}');
					expect(errors).toContain('Only a string or a number value can be added to a target of string type {"target":"$.properties.[\'productList.privacy\'].enum[0]","action":"add","value":null}');
				});
			});
			describe('to a number target a', function()
			{
				testGenerator(target().property.number(), 'add', value().any(), true);
				testGenerator(target().arrayElement.number(), 'add',value().any(), true);
			});
			it('to a target of boolean type', function()
			{
				testGenerator(target().property.boolean(), 'add', value().any(), true);
				testGenerator(target().arrayElement.boolean(), 'add', value().any(), true);
			});
			it('to a target of null value', function()
			{
				testGenerator(target().property.null(), 'add', value().any(), true);
				testGenerator(target().arrayElement.null(), 'add', value().any(), true);
			});
			describe('to a target array a', function()
			{
				it('text (the array is a property)', function()
				{
				    addModification(target().property.array()[0].q, 'add', 'x');
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().property.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe('x');
				});
				it('text (the array is inside other array)', function()
				{
				    addModification(target().arrayElement.array()[0].q, 'add', 'x');
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().arrayElement.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe('x');
				});

				it('number (the array is a property)', function()
				{
				    addModification(target().property.array()[0].q, 'add', 4);
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().property.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe(4);
				});
				it('number (the array is inside other array)', function()
				{
				    addModification(target().arrayElement.array()[0].q, 'add', 4);
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().arrayElement.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe(4);
				});
				it('object (the array is a property)', function()
				{
					var obj = {};
				    addModification(target().property.array()[0].q, 'add', obj);
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().property.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe(obj);
				});
				it('object (the array is inside other array)', function()
				{
					var obj = {};
				    addModification(target().arrayElement.array()[0].q, 'add', obj);
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().arrayElement.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe(obj);
				});
				it('boolean (the array is a property)', function()
				{
				    addModification(target().property.array()[0].q, 'add', true);
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().property.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe(true);
				});
				it('boolean (the array is inside other array)', function()
				{
				    addModification(target().arrayElement.array()[0].q, 'add', true);
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().arrayElement.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe(true);
				});
				it('array (the array is a property)', function()
				{
					var array = [];
				    addModification(target().property.array()[0].q, 'add', array);
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().property.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe(array);
				});
				it('array (the array is inside other array)', function()
				{
					var array = [];
				    addModification(target().arrayElement.array()[0].q, 'add', array);
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().arrayElement.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe(array);
				});
				it('null (the array is a property)', function()
				{
				    addModification(target().property.array()[0].q, 'add', null);
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().property.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe(null);
				});
				it('null (the array is inside other array)', function()
				{
				    addModification(target().arrayElement.array()[0].q, 'add', null);
				    var errors = tool.modifications(data);
				    failIfError(errors);
				    var x = target().arrayElement.array()[0].getValue(data);
				    expect(x[x.length-1]).toBe(null);
				});
			});
			describe('to a target object a', function()
			{
				function addToATargetObject(insideArray, value)
				{
					addModification(
						(insideArray) ? target().arrayElement.object()[0].q : target().property.object()[0].q,
						'add',
						value);
				}
				it('text (the object is a property)', function()
				{
					addToATargetObject(false, 'x');
					var errors = tool.modifications(data);
					expect(errors).toContain('The value must be a JSON object{"target":"$[?(@property == \'group\' && @.id == \'productList\')]","action":"add","value":"x"}');
				});
				it('text (the object is inside a array)', function()
				{
					addToATargetObject(true, 'x');
					var errors = tool.modifications(data);
					expect(errors).toContain('The value must be a JSON object{"target":"$.properties.extraTranslations.default[1]","action":"add","value":"x"}');
				});
				it('number (the object is a property)', function()
				{
					addToATargetObject(false, 4);
					var errors = tool.modifications(data);
					expect(errors).toContain('The value must be a JSON object{"target":"$[?(@property == \'group\' && @.id == \'productList\')]","action":"add","value":4}');
				});
				it('number (the object is inside a array)', function()
				{
					addToATargetObject(true, 4);
					var errors = tool.modifications(data);
					expect(errors).toContain('The value must be a JSON object{"target":"$.properties.extraTranslations.default[1]","action":"add","value":4}');
				});
				it('object (the object is a property)', function()
				{
					var obj = {test : 'test'};
					addToATargetObject(false, obj);
					var errors = tool.modifications(data);
					failIfError(errors);
					expect(target().property.object()[0].getValue(data).test).toBe('test');
				});
				it('object (the object is inside a array)', function()
				{
					var obj = {test : 'test'};
					addToATargetObject(true, obj);
					var errors = tool.modifications(data);
					failIfError(errors);
					expect(target().arrayElement.object()[0].getValue(data).test).toBe('test');
				});
				it('boolean (the object is a property)', function()
				{
					addToATargetObject(false, true);
					var errors = tool.modifications(data);
					expect(errors).toContain('The value must be a JSON object{"target":"$[?(@property == \'group\' && @.id == \'productList\')]","action":"add","value":true}');
				});
				it('boolean (the object is inside a array)', function()
				{
					addToATargetObject(true, true);
					var errors = tool.modifications(data);
					expect(errors).toContain('The value must be a JSON object{"target":"$.properties.extraTranslations.default[1]","action":"add","value":true}');
				});
				it('array (the object is a property)', function()
				{
					addToATargetObject(false, []);
					var errors = tool.modifications(data);
					expect(errors).toContain('The value must be a JSON object{"target":"$[?(@property == \'group\' && @.id == \'productList\')]","action":"add","value":[]}');
				});
				it('array (the object is inside a array)', function()
				{
					addToATargetObject(true, []);
					var errors = tool.modifications(data);
					expect(errors).toContain('The value must be a JSON object{"target":"$.properties.extraTranslations.default[1]","action":"add","value":[]}');
				});
				it('null (the object is a property)', function()
				{
					addToATargetObject(false, null);
					var errors = tool.modifications(data);
					expect(errors).toContain('The value must be a JSON object{"target":"$[?(@property == \'group\' && @.id == \'productList\')]","action":"add","value":null}');
				});
				it('null (the object is inside a array)', function()
				{
					addToATargetObject(true, null);
					var errors = tool.modifications(data);
					expect(errors).toContain('The value must be a JSON object{"target":"$.properties.extraTranslations.default[1]","action":"add","value":null}');
				});
			});

		});
		describe('replace', function()
		{

			testGenerator(target().property.number(), 'replace', value().any(), false);
			testGenerator(target().arrayElement.number(), 'replace', value().any(), false);

			testGenerator(target().property.string(), 'replace', value().any(), false);
			testGenerator(target().arrayElement.string(), 'replace', value().any(), false);

			testGenerator(target().property.boolean(), 'replace', value().any(), false);
			testGenerator(target().arrayElement.boolean(), 'replace', value().any(), false);

			testGenerator(target().property.null(), 'replace', value().any(), false);
			testGenerator(target().arrayElement.null(), 'replace', value().any(), false);

			testGenerator(target().property.object(), 'replace', value().any(), true);
			testGenerator(target().arrayElement.object(), 'replace', value().any(), true);

			testGenerator(target().property.array(), 'replace', value().any(), true);
			testGenerator(target().arrayElement.array(), 'replace', value().any(), true);

		});
		describe('remove', function()
		{
			function generateNegativeRemoveTest(t)
			{
				it(t.desc, function()
				{
					data[0].modifications.push(
				    {
				        "target": t.q,
				        "action": 'remove',
				    });
				    var errors = tool.modifications(data);
				    if(errors.length == 0)
					{
						fail("shoud return error");
					}
				});
			}
			function generatePositiveRemoveTest(t)
			{
				it(t.desc, function()
				{
					data[0].modifications.push(
				    {
				        "target": t.q,
				        "action": 'remove',
				    });

				    var errors = tool.modifications(data);
			    	failIfError(errors);

			    	var unchangedData = MOCK1();
			    	expect(t.getParent(data)).not.toContain(t.getValue(unchangedData));
				});
			}
			describe('property of type', function()
			{
				_.each(target().property.any(), function(t)
				{
					generateNegativeRemoveTest(t);
				});
			});
			describe('element in array of type', function()
			{
				generatePositiveRemoveTest(target().arrayElement.number()[0]);
				generatePositiveRemoveTest(target().arrayElement.string()[0]);
				generatePositiveRemoveTest(target().arrayElement.boolean()[0]);
				generatePositiveRemoveTest(target().arrayElement.null()[0]);

				generateNegativeRemoveTest(target().arrayElement.object()[0]);
				generateNegativeRemoveTest(target().arrayElement.array()[0]);
			});
		});
	});
	it('validate references()', function()
	{
		data = MOCK_INVVALIDREFERENCES()
		var result = tool.validateReferences(data)
		expect(result.join(', ')).toBe('property: foo references non existent group g, invalid property id: invalid2 . can only contain letters and characters _.')
		expect(result.length).toBe(2);
	});

	it('validateJSONSchema()', function()
	{
		// TODO
	});

});
function value()
{
	return {
		any : function()
		{
			return _.union(this.boolean(), this.array(), this.object(), this.null(), this.string());
		}
		,
		boolean : function()
		{
			return [true, false];
		}
		,
		array : function()
		{
			return [[],[true]];
		}
		,
		object : function()
		{
			return [{}, {ej: 'ej'}];
		}
		,
		null : function()
		{
			return [null];
		}
		,
		string : function()
		{
			return ['string', '', "", "string"];
		}
		,
		number : function()
		{
			return [1, 0];
		}
	};
}
function target()
{
	return {
		property : {
			any : function()
			{
				return _.union(this.string(), this.number(), this.null(), this.object(), this.array(), this.boolean());
			}
			,
			string : function()
			{
				return [
				{
					q : "$[?(@property == 'group' && @.id == 'productList')].id"
					,
					getValue : function(data)
					{
						return data[1].group.id;
					}
					,
					desc : 'string (property)'
				}];
			}
			,
			number : function()
			{
				return [
				{
					q : "$.properties.extraTranslations.group"
					,
					getValue : function(data)
					{
						return data[2].properties.extraTranslations.group;
					}
					,
					desc : 'number (property)'
				}];
			}
			,
			null : function()
			{
				return [
				{
					q : "$.properties.extraTranslations.title"
					,
					getValue : function(data)
					{
						return data[2].properties.extraTranslations.title;
					}
					,
					desc : 'null (property)'
				}];
			}
			,
			object : function()
			{
				return [
				{
					q : "$[?(@property == 'group' && @.id == 'productList')]"
					,
					getValue : function(data)
					{
						return data[1].group;
					}
					,
					desc : 'object (property)'
				}];
			}
			,
			array : function()
			{
				return [
				{
					q : "$.properties.['productList.privacy'].enum"
					,
					getValue : function(data)
					{
						return data[1].properties['productList.privacy'].enum;
					}
					,
					desc : 'array (property)'
				}];
			}
			,
			boolean : function()
			{
				return [
				{
					q : "$.properties.extraTranslations.description"
					,
					getValue : function(data)
					{
						return data[2].properties.extraTranslations.description;
					}
					,
					desc : 'boolean (property)'
				}];
			}
		}
		,
		arrayElement : {
			any : function()
			{
				return _.union(this.string(), this.number(), this.null(), this.object(), this.array(), this.boolean());
			}
			,
			string : function()
			{
				return [
				{
					q : "$.properties.['productList.privacy'].enum[0]"
					,
					getValue : function(data)
					{
						return data[1].properties['productList.privacy'].enum[0];
					}
					,
					desc : 'string (arrayElement)'
					,
					getParent : function(data)
					{
						return data[1].properties['productList.privacy'].enum;
					}
				}];
			}
			,
			number : function()
			{
				return [
				{
					q : "$.properties.extraTranslations.default[0]"
					,
					getValue : function(data)
					{
						return data[2].properties.extraTranslations.default[0];
					}
					,
					desc : 'number (arrayElement)'
					,
					getParent : function(data)
					{
						return data[2].properties.extraTranslations.default;
					}
				}];
			}
			,
			null : function()
			{
				return [
				{
					q : "$.properties.extraTranslations.default[2]"
					,
					getValue : function(data)
					{
						return data[2].properties.extraTranslations.default[2];
					}
					,
					desc : 'null (arrayElement)'
					,
					getParent : function(data)
					{
						return data[2].properties.extraTranslations.default;
					}
				}];
			}
			,
			object : function()
			{
				return [
				{
					q : "$.properties.extraTranslations.default[1]"
					,
					getValue : function(data)
					{
						return data[2].properties.extraTranslations.default[1];
					}
					,
					desc : 'object (arrayElement)'
					,
					getParent : function(data)
					{
						return data[2].properties.extraTranslations.default;
					}
				}];
			}
			,
			array : function()
			{
				return [
				{
					q : "$.properties.extraTranslations.default[3]"
					,
					getValue : function(data)
					{
						return data[2].properties.extraTranslations.default[3];
					}
					,
					desc : 'array (arrayElement)'
					,
					getParent : function(data)
					{
						return data[2].properties.extraTranslations.default;
					}
				}];
			}
			,
			boolean : function()
			{
				return [
				{
					q : "$.properties.extraTranslations.default[4]"
					,
					getValue : function(data)
					{
						return data[2].properties.extraTranslations.default[4];
					}
					,
					desc : 'boolean (arrayElement)'
					,
					getParent : function(data)
					{
						return data[2].properties.extraTranslations.default;
					}
				}];
			}
		}
		,
		any : function()
		{
			return _.union(this.property.any(), this.arrayElement.any());
		}
	};
}

function testGenerator(target, action, value, expectError)
{
	_.each(target, function(t)
	{
		_.each(value, function(v)
		{
			it(v, function()
			{
				data[0].modifications.push(
			    {
			        "target": t.q,
			        "action": action,
			        "value": v
			    });
			    var errors = tool.modifications(data);
			    if(expectError)
			    {
			    	if(errors.length == 0)
					{
						fail("shoud return error");
					}
			    }
			    else
			    {
				    failIfError(errors);
				    expect(t.getValue(data)).toBe(v);
			    }
			});
		});
	});
}

function failIfError(errors)
{
	if(errors.length > 0)
	{
		fail("shoud not return any error");
	}
}

var MOCK1 = function()
{
return [
	{
		"type": "object"
		,"resource": {
			"template": {
				"item-options": ["item_views_option_custom1.tpl"]
			}
		}
	}
	,
	{
		"type": "object",
		"group": {
			"id": "productList",
			"title": "Product List",
			"description": "Product List configuration"
		},
		"properties": {
			"productList.privacy": {
				"group": "productList",
				"type": "string",
				"title": "Addition Enabled?",
				"description": "Can the user modify product lists?",
				"enum": ["public", "private"],
				"id": "productList.additionEnabled"
			}
		}
	}
	,
	{
	   "type":"object",
	   "properties":{
		  "extraTranslations":{
			 "group":4,
			 "type":"array",
			 "title":null,
			 "description":true,
			 "items":{
				"type":"object",
				"properties":{
				   "key":{
					  "type":"string",
					  "title":"key",
					  "description":"This is the translation key",
					  "mandatory":true
				   },
				   "en_US":{
					  "type":"string",
					  "title":"en_US"
				   },
				   "fr_FR":{
					  "type":"string",
					  "title":"fr_FR"
				   }
				}
			 },
			 "default":[
				4,
				{},
				null,
				[],
				true
			 ]
		  }
	   }
	}

	];
};
var MOCK_INVVALIDREFERENCES = function()
{
	return [
		{
			"type": "object"
		,	"group": {
				"id": "productList"
			,	"title": "Product List"
			,	"description": "Product List configuration"
			}
		,	"properties": {
				"foo": {
					"group": "g"
				,	"type": "boolean"
				,	"title": "Addition Enabled?"
				,	"description": "Can the user modify product lists? This is, add, edit and delete them."
				,	"default": true
				}
			,	"invalid2": {
					"group": "productList"
				,	"type": "boolean"
				,	"title": "Login Required?"
				,	"description": "Must the user be logged in for the product list experience to be enabled ?"
				,	"default": true
				}
			}
		}

	]
}