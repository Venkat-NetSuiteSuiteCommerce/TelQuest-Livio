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
	,	'UnitTest.Backbone.CompositeView.Preconditions'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'UnitTest.Backbone.CompositeView.FaceView'
	,	'UnitTest.Backbone.CompositeView.CellContainerView'
	,	'Utils'
	,	'UnitTest.Backbone.CompositeView.cell_container_view_customrow_template.tpl'
	,	'UnitTest.Backbone.CompositeView.cell_container_view_customchild_template.tpl'
	,	'jasmine2-typechecking-matchers'
	]
,	function (
		Backbone
	,	_
	,	Preconditions
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	Face
	,	CellContainerView
	,	Utils
	,	cellContainerViewCustomRow
	,	cellContainerViewCustomChild
	)
{
	'use strict';

	describe('Backbone.CompositeView', function()
	{
		it('should support rendering children views using html placeholders and sub views constructors', function()
		{
			var parentView = new Backbone.View();

			// BackboneCompositeView.add(parentView); //make it a composite view (a container)

			parentView.template = _('<div>hello from parent, now mychild <span data-view="child_1"></span></div>').template();

			//setup the children constructors by name
			parentView.addChildViews({child_1: function()
			{
				var view = new Backbone.View();
				view.template = _('<div>this is a child view child_1</div>').template();
				return view;
			}});

			parentView.render();

			expect(parentView.$el.html()).toContain('this is a child view child_1');
		});

		describe('Nested views', function ()
		{
			var face1 = null
			,	leftEyeView = null
			,	rightEyeView = null
			,	mouthView = null
			,	tooth1View = null;

			beforeEach(function ()
			{
				var Face = Backbone.View.extend({

					template: _(
						'<div>I am a face with: '+
						'<span data-view="leftEye"></span> '+
						'<span data-view="rightEye"></span> '+
						'and a <span data-view="mouth"></span></div>'
					).template()

				,	initialize: function()
					{
						BackboneCompositeView.add(this); //make it a composite view (a container)
						this.renderLeftEye = false;
					}

				,	childViews: {
						leftEye: function()
						{
							if(this.renderLeftEye)
							{
								leftEyeView = new Backbone.View();
								leftEyeView.template = _('<div>this is an eye that goes in the left</div>').template();
								return leftEyeView;
							}
						}
					,	rightEye: function()
						{
							rightEyeView = new Backbone.View();
							rightEyeView.template = _('<div>this is an eye that goes in the right</div>').template();
							return rightEyeView;
						}
					,	mouth: function()
						{
							mouthView = new Backbone.View();
							mouthView.template = _('<div>Im a mouth and Im also a composite because I have a'+
								'<span data-view="tooth_1"></span></div>').template();
							BackboneCompositeView.add(mouthView);
							mouthView.addChildViews({tooth_1: function()
							{
								tooth1View = new Backbone.View();
								tooth1View.template = _('<div>Im a tooth, nothing special Im not a container</div>').template();
								return tooth1View;
							}});
							return mouthView;
						}
					}
				});

				face1 = new Face();

				face1.render();
			});

			it('should render properly a container inside a containers', function()
			{
				expect(face1.$el.html()).toContain('I am a face with:');
				expect(face1.$el.html()).toContain('this is an eye that goes in the right');
				expect(face1.$el.html()).not.toContain('this is an eye that goes in the left');
				expect(face1.$el.html()).toContain('Im a mouth and Im also a composite because I have a');
				expect(face1.$el.html()).toContain('Im a tooth, nothing special Im not a container');
				
			});

			it('should call recursively destroy to reach all its children', function()
			{
				spyOn(rightEyeView, 'destroy').and.callThrough();
				spyOn(mouthView, 'destroy').and.callThrough();
				spyOn(tooth1View, 'destroy').and.callThrough();

				face1.destroy();

				expect(rightEyeView.destroy).toHaveBeenCalled();
				expect(mouthView.destroy).toHaveBeenCalled();
				expect(tooth1View.destroy).toHaveBeenCalled();
			});

			it('renderChild() should render the child', function()
			{
				face1.renderLeftEye = true;
				face1.renderChild('leftEye');
				expect(face1.$el.html()).toContain('this is an eye that goes in the left');
				face1.renderLeftEye = false;
				face1.renderChild('leftEye');
				expect(face1.$el.html()).not.toContain('this is an eye that goes in the left');
			});

			it('renderChild() should render the child using a placeholder div', function()
			{
				face1.renderLeftEye = true;
				face1.renderChild(face1.$('[data-view="leftEye"]'));
				expect(face1.$el.html()).toContain('this is an eye that goes in the left');
			});

			it('renderChild() should _destroy the previous view', function()
			{
				face1.renderLeftEye = true;
				face1.renderChild('leftEye');
				
				var previousLeftEye = leftEyeView;
				spyOn(previousLeftEye, '_destroy').and.callThrough();
				face1.renderLeftEye = false;
				face1.renderChild('leftEye');
				expect(previousLeftEye._destroy).toHaveBeenCalled();
			});
		});

		describe('Particular size target: data-template, data-phone-template, data-tablet-template', function ()
		{
			it('should support override template in desktop', function ()
			{
				Utils.getViewportWidth = function()
				{
					return 1400;
				};
				var face1 = new Face();
				face1.render();

				expect(face1.$el.html().indexOf('desktop custom template!!') > 0).toBe(true);
			});

			it('should support override template in mobile with data-phone-template', function ()
			{
				Utils.getViewportWidth = function()
				{
					return 400;
				};
				var face1 = new Face();
				face1.render();

				expect(face1.$el.html().indexOf('phone custom template!!') > 0).toBe(true);
			});

			it('should support override template on tablet with data-tablet-template', function ()
			{
				Utils.getViewportWidth = function()
				{
					return 800;
				};
				var face1 = new Face();
				face1.render();

				expect(face1.$el.html().indexOf('tablet custom template!!') > 0).toBe(true);
			});

			it('should support override cell template on collection views with data-cell-template', function ()
			{
				Utils.getViewportWidth = function()
				{
					return 800;
				};
				var face1 = new Face();

				face1.render();

				expect(face1.$el.html().indexOf('tablet custom template!!') > 0).toBe(true);
			});
		});

		describe('Backbone Collection View, particular template part: data-cell-template, data-row-template, data-child-template', function ()
		{
			define('row_template.tpl', [], function ()
			{
				return function ()
				{
					return '<p data-id="customrow" class="row-fluid">  <div data-type="backbone.collection.view.cells"></div> </p>';
				};
			});

			xit('should support override cell template on collection views with data-cell-template', function()
			{
				Utils.getViewportWidth = function()
				{
					return 1400;
				};

				var face1 = new CellContainerView();

				face1.render();

				expect(face1.$el.html().indexOf('data-id="customrow"') > 0).toBe(false);
				expect(face1.$el.html().indexOf('data-id="customcell"') > 0).toBe(true);
			});

			xit('should support override row template on collection views with data-row-template', function()
			{
				Utils.getViewportWidth = function()
				{
					return 1400;
				};

				CellContainerView.prototype.template = cellContainerViewCustomRow;
				var face1 = new CellContainerView();

				face1.render();

				expect(face1.$el.html().indexOf('data-id="customrow"') > 0).toBe(true);
				expect(face1.$el.html().indexOf('data-id="customcell"') > 0).toBe(false);
			});

			xit('should support child row template on collection views with data-child-template', function()
			{
				Utils.getViewportWidth = function()
				{
					return 1400;
				};

				CellContainerView.prototype.template = cellContainerViewCustomChild;
				var face1 = new CellContainerView();

				face1.render();

				expect(face1.$el.html().indexOf('data-id="customchild"') > 0).toBe(true);
				expect(face1.$el.html().indexOf('data-id="customrow"') > 0).toBe(false);
				expect(face1.$el.html().indexOf('data-id="customcell"') > 0).toBe(false);
			});
		});
	});
});