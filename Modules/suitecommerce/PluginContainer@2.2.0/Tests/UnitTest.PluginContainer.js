/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//! © 2015 NetSuite Inc.
define(['PluginContainer'], function(PluginContainer)
{
	'use strict';
	
	describe("Plugin Container", function()
	{
		var plugins;
		//two plugin that perform some modification in a string.
		var plugin1 = {
			name: 'p1'
		,   priority: 1
		,   execute: function(input)
			{
				return input.replace(/blabla/ig, 'loremipsum');
			}
		};
		var plugin2 = {
			name: 'p2'
		,   priority: 2
		,   execute: function(input)
			{
				return 'avacadabra' + input + 'flumflumblablasrpic';
			}
		};
		var str = 'hello world blabla world';
		var output;

		it("registration of prioritized plugins", function()
		{
			plugins = new PluginContainer();
			plugins.initialize();
			str = 'hello world blabla world';
			output = plugins.executeAll(str);
			expect(output).toBe(str);
			plugins.install(plugin1);
			output = plugins.executeAll(str);
			expect(output).toBe('hello world loremipsum world');
		});

		it("plugin uninstall", function()
		{
			plugins.uninstall(plugin1);
			output = plugins.executeAll(str);
			expect(output).toBe(str);
		});

		it("plugin are executed according priority", function()
		{
			plugins.install(plugin2);
			plugins.install(plugin1);
			output = plugins.executeAll(str);
			expect(output).toBe('avacadabrahello world loremipsum worldflumflumloremipsumsrpic');
			//delete all
			plugins.uninstall(plugin1);
			plugins.uninstall(plugin2);
			output = plugins.executeAll(str);
			expect(output).toBe(str);
			//install them again but in different order and it should output the same thing.
			plugins.install(plugin1);
			plugins.install(plugin2);
			output = plugins.executeAll(str);
			expect(output).toBe('avacadabrahello world loremipsum worldflumflumloremipsumsrpic');
		});
	});

}); 
