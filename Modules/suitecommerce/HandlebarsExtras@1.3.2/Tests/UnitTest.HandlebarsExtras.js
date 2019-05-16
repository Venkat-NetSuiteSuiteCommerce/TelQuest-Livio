/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'UnitTestHelper'
	,	'UnitTestHelper.Preconditions'
	,	'Profile.Model'

	,	'handlebarsHelpersAllTest1.tpl'

	,	'Backbone'
	,	'underscore'
	,	'mock-ajax'
	]
,	function(
		UnitTestHelper
	,	Preconditions
	,	ProfileModel

	,	handlebarsHelpersAllTest1_tpl

	,	Backbone
	,	_
	)
	{

	var application


	// Handlebars helpers 
	// TODO: put the following in a separate .js file

	describe('dumper and handlebars helpers123', function()
	{
		beforeEach(function(done)
		{
			jasmine.Ajax.install()
			helper = new UnitTestHelper({
				applicationName: 'dumperandhdlbrshelpers123'
			,	loadTemplates: true
			,	mountModules: []
			,	startApplication: function(app)
				{
					jasmine.Ajax.install()
					application = app
					done()
				}
			})
		})

		afterEach(function()
		{
			jasmine.Ajax.uninstall()
		})

		it('should post information regarding handlebar helpers once application starts', function(done)
		{
			// for {{#each}} helper we will need to mock several kind of collections to also test the compiled extensino for backbone model & collections
			var tplContextEach3 = new Backbone.Collection()
			var arrayOfModels = [new Backbone.Model({a: 1}), new Backbone.Model({a: 2}), new Backbone.Model({a: 3})]
			tplContextEach3.reset(arrayOfModels)
			var tplContext = {
				each1: [1,2,3],
				each2: arrayOfModels,
				each3: tplContextEach3,
				objectToAttributesData1: {'href': 'foo'},
				breaklines1: 'one br\r\nanother one\nand other one \r so we ',
				ifEquals1: 1,
				ifEquals2: 2
			}
			var output = handlebarsHelpersAllTest1_tpl(tplContext)
			console.log(output)
			output = output.replace('href="foo"', 'href=\\"foo\\"') // need to do this for make it a valid json
			output = output.replace('href="foo"', 'href=\\"foo\\"') // need to do this for make it a valid json

			var data = JSON.parse(output)


			expect(data.translate).toBe('hello my precious')
			expect(data.formatCurrency && _.isString(data.formatCurrency)).toBe(true)
			expect(data.each1).toBe('1, first: true, last: false, index: 0 2, first: false, last: false, index: 1 3, first: false, last: true, index: 2 ')
			expect(data.each2).toBe('123')
			expect(data.each3).toBe('123')
			expect(data.highlightKeyword).toBe('hello <strong>world</strong>')
			expect(data.objectToAttributes1).toBe('  href=\"foo\" ')
			expect(data.objectToAtrributes1).toBe('  href=\"foo\" ')
			expect(data.ifEquals1).toBe('ifEquals1:siimprimo')

			expect(data.breaklines1).toBe('one br<br/>another one<br/>and other one <br/> so we ')
			//TODO: all the other helpers 
			done()
		})
	})

});