/*
Typechecking matchers for Jasmine2.

	expect(foo).toBeA(Thing);    // Checks if foo is an instance of Thing. Alias: toBeAn(AwesomeThing)
	expect(foo).toBeANumber();
	expect(foo).toBeAnInteger();
	expect(foo).toBeAString();
	expect(foo).toBeABoolean();
	expect(foo).toBeAnArray();
	expect(foo).toBeAnObject();
	expect(foo).toBeNaN();
	expect(foo).toBeInfinity();

These matchers will test positive for primitive types and their object analogs. For example:

	expect(12).toBeANumber();                // => positive
	expect(new Number(12)).toBeANumber();    // => positive

*/

define('jasmine2-typechecking-matchers', ['underscore'], function(_)
{
	beforeEach(function()
	{
		var makeMatcher = function(predicate, failMessage)
		{
			return function(util, customEqualityTesters)
			{
				return {
					compare: function(actual, expected)
					{
						var result = {};
						result.pass = predicate(actual, expected);
						if (!result.pass)
						{
							result.message = failMessage(actual, expected);
						}
						return result;
					}
				};
			};
		};

		var toBeA = makeMatcher(
			function(actual, expected){return (actual instanceof expected); },
			function(actual, expected){return 'Expected ' + actual + ' to be of type ' + expected;}
		);

		var customMatchers = {
			toBeA: toBeA
		,	toBeAn: toBeA
		,	toBeANumber: makeMatcher(
				function(actual, expected){return _(actual).isNumber(); },
				function(actual, expected){return 'Expected ' + actual + ' to be a number'; }
			)
		,	toBeAnObject: makeMatcher(
				function(actual, expected){return _(actual).isObject(); },
				function(actual, expected){return 'Expected ' + actual + ' to be an object'; }
			)
		,	toBeAnInteger: makeMatcher(
				function(actual, expected){return ((typeof actual.valueOf() === 'number') && (Math.floor(actual.valueOf()) === actual.valueOf())); },
				function(actual, expected){return 'Expected ' + actual + ' to be an integer'; }
			)
		,	toBeAString: makeMatcher(
				function(actual, expected){return _(actual).isString(); },
				function(actual, expected){return 'Expected ' + actual + ' to be a string'; }
			)
		,	toBeABoolean: makeMatcher(
				function(actual, expected){return _(actual).isBoolean(); },
				function(actual, expected){return 'Expected ' + actual + ' to be a boolean'; }
			)
		,	toBeAnArray: makeMatcher(
				function(actual, expected){return _(actual).isArray(); },
				function(actual, expected){return 'Expected ' + actual + ' to be an array'; }
			)
		,	toBeNaN: makeMatcher(
				function(actual, expected){return _(actual).isNaN(); },
				function(actual, expected){return 'Expected ' + actual + ' to be NaN'; }
			)
		,	toBeInfinity: makeMatcher(
				function(actual, expected){return !_(actual).isFinite(); },
				function(actual, expected){return 'Expected ' + actual + ' to be infinite'; }
			)
		,	toContain: makeMatcher(
				function (actual, expected)
				{
					if (_(actual).isString())
					{
						return (actual||'').indexOf(expected) !== -1;
					}
					else if (_(actual).isArray())
					{
						return _.some(actual, function (item)
							{
								return _.isEqual(item, expected);
							});
					}
				}
			,	function (actual, expected) {return 'Expected element ' + actual + ' to contain ' + expected; }
			)
		};

		// console.log('matchers custom installed')
		jasmine.addMatchers(customMatchers);

	}); 

	window.whenTrue = function(predicate, handler)
	{
		var id = setInterval(function()
		{
			if (predicate())
			{
				clearInterval(id); 
				handler();
			}
		}, 10); 
	}; 
}); 
