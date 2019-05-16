/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// define(
// 	[
// 		'Backbone'
// 	,	'underscore'
// 	,	'UnitTest.Backbone.CompositeView.Preconditions'
// 	,	'Backbone.CompositeView'
// 	,	'Backbone.CompositeView.Fade'
// 	,	'jasmine2-typechecking-matchers'
// 	]
// ,	function (
// 		Backbone
// 	,	_
// 	,	Preconditions
// 	,	BackboneCompositeView
// 	,	BackboneCompositeViewFade
// 	)
// {
// 	'use strict';

// 	describe('Backbone.CompositeView.Fade', function()
// 	{
// 		beforeEach(function ()
// 		{
// 			var Face = Backbone.View.extend({

// 				template: _(
// 					'<div>I am a face with: '+
// 					'<div data-view="leftEye"></div> '+
// 					'<div data-view="rightEye"></div> '
// 				).template()

// 			,	initialize: function()
// 				{
// 					BackboneCompositeView.add(this); 
// 					BackboneCompositeViewFade.add(this); 
// 					this.renderLeftEye = true;
// 					this.renderRightEye = false;
// 				}

// 			,	childViews: {
// 					leftEye: function()
// 					{
// 						if(this.renderLeftEye)
// 						{
// 							var view = new Backbone.View();
// 							view.template = _('<div>A left Eye</div>').template();
// 							return view;
// 						}
// 					}
// 				,	rightEye: function()
// 					{
// 						if(this.renderRightEye)
// 						{
// 							var view = new Backbone.View();
// 							view.template = _('<div>And a right eye</div>').template();
// 							return view;
// 						}
// 					}
// 				}
// 			});

// 			this.face = new Face();
// 			this.face.render();
// 		});

// 		it('should show only the left eye initially', function()
// 		{
// 			expect(this.face.$el.html()).toContain('A left Eye');
// 			expect(this.face.$el.html()).not.toContain('And a right eye');
// 		});

// 		it('should emit fade.show event', function(done)
// 		{
// 			this.face.renderRightEye = true;
// 			this.face.fadeViews('leftEye', 'rightEye');

// 			this.face.once('fade.show', function()
// 			{
// 				done();
// 			});	
// 		});

// 		it('should emit fade.shown event', function(done)
// 		{
// 			this.face.renderRightEye = true;
// 			this.face.fadeViews('leftEye', 'rightEye');

// 			this.face.once('fade.shown', function()
// 			{
// 				done();
// 			});	
// 		});

// 		it('fadeView should fade both views', function(done)
// 		{
// 			var faceEl = this.face.$el;

// 			this.face.renderRightEye = true;
// 			this.face.fadeViews('leftEye', 'rightEye');

// 			expect(faceEl.html()).toContain('And a right eye');

			
// 			var rightEyePlaceholder = this.face.$('[data-view="rightEye"]');

// 			expect(rightEyePlaceholder.length).toBe(1);
// 			expect(rightEyePlaceholder.is('.hidden')).toBe(true);

// 			this.face.once('fade.shown', function()
// 			{
// 				expect(faceEl.html()).not.toContain('A left Eye');
// 				expect(faceEl.html()).toContain('And a right eye');
// 				expect(rightEyePlaceholder.is('.hidden')).toBe(false);
// 				done();
// 			});
// 		});

// 		it('fadeView should _destroy the first view', function(done)
// 		{
// 			var leftEye = this.face.childViewInstances.leftEye;
// 			spyOn(leftEye, '_destroy').and.callThrough();

// 			this.face.renderRightEye = true;
// 			this.face.fadeViews('leftEye', 'rightEye');

// 			this.face.once('fade.show', function()
// 			{
// 				expect(leftEye._destroy).toHaveBeenCalled();
// 				done();
// 			});		
// 		});

// 		afterEach(function()
// 		{
// 	    	this.face.off();
// 		});
// 	});
// });