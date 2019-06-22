/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'Backbone'
	,	'underscore'
	,	'UnitTestHelper.Preconditions'
	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'
	,	'backbone_collection_view_row.tpl'
	,	'jasmine2-typechecking-matchers'
	]
,	function (
		Backbone
	,	_
	,	Preconditions
	,	BackboneCollectionView
	,	BackboneCompositeView
	,	backbone_collection_view_row_tpl
	)
{
	'use strict';

	var clickedFromChildren = 0
	,	clickedFromParent = 0; 


	var Apple = Backbone.Model.extend({})
	,	AppleList = Backbone.Collection.extend({
			model: Apple
		})
	,	AppleView = Backbone.View.extend({
			template: _('<div class="apple-view">this apple color is <%= view.model.get("color")%>'+
				'<button data-action="clicked">delete</button>'+' and sumping some options also: <%= view.someStrangeOption%></div>').template()
		,	initialize: function (options)
			{
				this.someStrangeOption = options.someStrangeOption;
			}
		,	events: {
				'click [data-action="clicked"]': 'clicked'
			}
		,	clicked: function()
			{
				clickedFromChildren++;
			}
		,	getContext: function()
			{
				return {view: this}
			}
		});

	function makeCollection (N)
	{
		var c = new AppleList();
		for (var i = 0; i < N; i++)
		{
			var a = new Apple();
			a.set('id', i);
			a.set('color', 'color('+i+','+(i*i/3)+')');
			c.add(a);
		}
		return c;
	}

	describe('Backbone.CollectionView', function()
	{
		
		it('should render a Backbone colleciton of child view', function()
		{
			Preconditions.setDefaultEnvironment();	
			
			var collectionView = new BackboneCollectionView({
				childView: AppleView
			,	childViewOptions: {
					someStrangeOption : 'dark side of the moon'
				}
			,	collection: makeCollection(5)
			});

			collectionView.render();

			expect(collectionView.$el.html().split('this apple color is ').length).toBe(5 + 1);
			expect(collectionView.$el.html().split('dark side of the moon').length).toBe(5 + 1);
		});

		it('should render a simple array of child view', function()
		{
			var collectionView = new BackboneCollectionView({
				childView: AppleView
			,	childViewOptions: {
					someStrangeOption : 'dark side of the moon'
				}
			,	collection: makeCollection(5).models
			});

			collectionView.render();

			var html = collectionView.$el.html();

			expect(html && html.split('this apple color is ').length).toBe(5 + 1);
			expect(html && html.split('dark side of the moon').length).toBe(5 + 1);
		});

		it('should render as many row as child per determines', function()
		{
			var collectionView = new BackboneCollectionView({
				childView: AppleView
			,	viewsPerRow: 2
			,	rowTemplate: backbone_collection_view_row_tpl
			,	childViewOptions: {
					someStrangeOption : 'dark side of the moon'
				}
			,	collection: makeCollection(10)
			});

			collectionView.render();

			expect(collectionView.$('.backbone-collection-view-row').length).toBe(10/2);
		});

		it('compose <ul><li> with collection and composite view', function()
		{
			clickedFromChildren = 0; 
			clickedFromParent = 0; 

			var MyBigView = Backbone.View.extend({
				initialize: function()
				{
					BackboneCompositeView.add(this);
				}
			,	template: _('<span>This is my view that contains a unordered list '+
					'<ul data-view="MyCollectionView"></ul><div data-view="SimpleComposite1"></div></span>').template()
			,	childViews: {
					'MyCollectionView': function()
					{
						var collectionView = new BackboneCollectionView({
							childView: AppleView
						,	viewsPerRow: 1
						,	childViewOptions: {
								someStrangeOption : 'dark side of the moon'
							,	className: 'pepepe'
							}
						,	cellTemplate: _('<div data-type="backbone.collection.view.cell"></div>').template()
						,	rowTemplate: _('<li><div data-type="backbone.collection.view.cells" ></div></li>').template()
						,	collection: makeCollection(10)
						});

						return collectionView;
					}
				,	'SimpleComposite1': function()
					{
						var View = Backbone.View.extend({
							template: _('<div class="inner1">balblabla</div>').template()
						}); 
						return new View();
					}
				}
			,	events: {
					'click [data-action="clicked"]': 'clicked'
				}
			,	clicked: function()
				{
					clickedFromParent++;
				}
			});

			var bigview = new MyBigView();
			bigview.render();

			expect(bigview.$('li').length).toBe(10);

			expect(bigview.$('ul>li').size()).toBe(10);

			expect(bigview.$('span>[data-view="MyCollectionView"]').size()).toBe(1);

			//make sure we don't loose the event listeners

			expect(clickedFromParent).toBe(0); 
			expect(clickedFromChildren).toBe(0); 

			bigview.$('[data-action="clicked"]').first().click(); 

			expect(clickedFromParent).toBe(1); 
			expect(clickedFromChildren).toBe(1); 
			
		});

	});
});

