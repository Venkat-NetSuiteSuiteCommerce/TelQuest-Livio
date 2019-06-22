/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// CompositeView.Performance 
// this is not an unit test but more a performance measurement of the composite view when stressed usage. 
// just modify variables MAX_LEVEL = 1, CHILD_COUNT = 1 and compare the time

define(
	[
		'Backbone'
	,	'underscore'
	,	'Backbone.CompositeView'
	,	'UnitTestHelper'
	,	'jasmine2-typechecking-matchers'
	]
,	function (
		Backbone
	,	_
	,	BackboneCompositeView
	,	UnitTestHelper
	)
{
	'use strict';

	var MAX_LEVEL = 1, CHILD_COUNT = 1;

	function buildTemplate(options)
	{
		var wordCount = options.wordCount, mustContain = options.mustContain;
		var s = '<div>hello world';
		_(mustContain).each(function(c)
		{
			s += '<BLOCKQUOTE>' + c + '<div>---- just a separator ---- </div></BLOCKQUOTE>'; 
		}); 
		s += '</div>';
		return _(s).template();
	}


	function buildView(level)
	{
		var view = new Backbone.View({});

		if(level < MAX_LEVEL)
		{		
			var childViewProperty = {}; 
			var templateMustContain = []; 
			for (var i = 0; i < CHILD_COUNT; i++) 
			{
				childViewProperty['ChildView'+i] = function()
				{
					return buildView(level+1); 
				}; 
				templateMustContain.push('<div data-view="'+'ChildView'+i+'"></div>');
			}
			view.childViews = childViewProperty; 

			view.template = buildTemplate({
				wordCount:100
			,	mustContain:templateMustContain
			}); 

			// BackboneCompositeView.add(view); 
			MyCompositeView.add(view); 
		}
		else
		{
			view.template = buildTemplate({wordCount:100,mustContain:[]}); 
		}
		return view;
	}


	describe('Backbone.CompositeView performance', function()
	{	
		it('prepare', function()
		{
			var view;
			for (var level = 1; level < MAX_LEVEL; level++) 
			{
				view = buildView(level);
				console.time('level='+level);
				view.render();
				console.timeEnd('level='+level);
				jQuery('body').append(view.$el); 
			}
		});
	});


	var regex = /<\w+[^>]*data-view="([^"]+)"[^>]*>\s*<\/\w+>/g

	var MyCompositeView = {
		add: function(view) 
		{
			view.compileTemplate = _.wrap(view.compileTemplate, function(fn)
			{
				var self = this;
				view.childViewInstances = view.childViewInstances || {};
				var s = fn.apply(this, Array.prototype.slice.call(arguments));
				return s.replace(regex, function(all, dataView)
				{
					if(!all)
					{
						return '';
					}
					var childGenerator = self.childViews[dataView];
					var child = childGenerator();
					self.childViewInstances[dataView] = child;
					return child.compileTemplate(); //recurse!
				}); 
			}); 
		}
	}; 

});