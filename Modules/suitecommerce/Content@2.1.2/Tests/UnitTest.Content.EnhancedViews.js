/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Content.EnhancedViews test
// --------------------
define(
	[
		'Content'
	,	'Content.DataModels'
	,	'Application'
	]
,	function (
		Content
	,	ContentDataModels
	)
{
	'use strict';

	var setFragment = function(fragment) 
	{
		Backbone.history.fragment = fragment;
	}; 

	// The Content 'directives' data. 
	var CONTENT_URLS = [
		{
			'id': '1'
		,	'pageid': '1'
		,	'query': '/foo/bar'
		,	'type': '2'
		}
	,	{
			'id': '2'
		,	'pageid': '2'
		,	'query': '/chapter/9'
		,	'type': '2'
		}		
	,	{
			'id': '3'
		,	'pageid': '4'
		,	'query': '/chapter/6'
		,	'type': '2'
		}

	//TODO: * doesn't work
	/*,	{
			'id': '3'
		,	'pageid': '3'
		,	'query': '*'
		,	'type': '2'
		}*/
	];

	//  The content pages data. 
	var CONTENT_PAGES = [
		{
			'pagecontent': [
				{
					'id': '1'
				,	'target': '#test1'
				,	'contenttype': 'html'
				,	'content': 'Chapter 1: Down the Rabbit-Hole...'
				}
			]
		,	'internalid': '1'
		,	'id': '1' //for the backbone model
		,	'tags': []
		,	'title': 'alice in wonderland title'
		,	'metadescription': 'alice in wonderland description'
		,	'metakeywords': 'alice, wonderland, carroll, chapter 1'
		,	'metaextra': '<meta name=\'author\' content=\'Caroll\'>'
		}

		// this page content is special because it contains a script in the content (should work)
	,	{
			'pagecontent': [
				{
					'id': '2'
				,	'target': '#test2'
				,	'contenttype': 'html'
				,	'content': '<h1 class="chapter-9" id="#chapter-9">Chapter 9: The Mock Turtle\'s Story...</h1>' + 
						'<script>window.alicestring="The Mock Turtle is very sad, even though he has no sorrow.";</script>'
				}
			]
		,	'internalid': '2'
		,	'id': '2' //for the backbone model
		,	'tags': []
		,	'title': 'alice in wonderland title - chapter 9'
		,	'metadescription': 'alice in wonderland description - chapter 9'
		,	'metakeywords': 'alice, wonderland, carroll - chapter 9'
		,	'metaextra': '<meta name=\'author\' content=\'Caroll\'>'
		}

		//this page targets url * TODO: * doesn't work
	/*,	{
			'pagecontent': [{
				'id': '3'
			,	'target': '#propaganda'
			,	'contenttype': 'html'
			,	'content': 'everywhere'
			}]
		,	'internalid': '3'
		,	'id': '3' //for the backbone model
		,	'tags': []
		,	'title': 'propaganda'
		,	'metadescription': 'propaganda'
		,	'metakeywords': 'propaganda'
		,	'metaextra': '<meta name=\'propaganda\' content=\'propaganda\'>'
		}*/

		//content in a modal it will match #testmodal1 when the view is showed in a modal. Notice that we prefixed with "in-modal"
	,	{
			'pagecontent': [
				{
					'id': '4'
				,	'target': '#in-modal-testmodal1'
				,	'contenttype': 'html'
				,	'content': 'Chapter 6: Pig and Pepper'
				}
			]
		,	'internalid': '4'
		,	'id': '4' //for the backbone model
		,	'tags': []
		,	'title': 'alice in wonderland title chapter 6'
		,	'metadescription': 'alice in wonderland description chapter 6'
		,	'metakeywords': 'alice, wonderland, carroll, chapter 6'
		,	'metaextra': '<meta name=\'author\' content=\'Caroll\'>'
		}
	];
	
	
	describe('Content Enhanced pages', function () 
	{		
		var application
		,	view = null; 
		
		it('init', function (done)
		{
			jQuery('body').append('<div id="main">hello</div>'); 

			application = SC.Application('Content.EnhancedViews');
			application.getLayout().template = _('<div id="content">layout</div>').template();
			jQuery(application.start([Content], function () 
			{ 
				application.getLayout().appendToDom();
				//mock pages and urls			
				var urlsCollection = ContentDataModels.Urls.Collection.getInstance();
				var pagesCollection = ContentDataModels.Pages.Collection.getInstance();

				urlsCollection.reset(CONTENT_URLS);
				pagesCollection.reset(CONTENT_PAGES);

				Backbone.History.started = true;

				done();
			}));
		});

		it('should enrich content only after showContent()', function ()
		{	
			setFragment('foo/bar'); 

			view = new Backbone.View({
				application: application
			,	id: 'contentView1'
			});
				;
			view.template = _(
				'<div>'+
					'<div id="test1">test1</div>'+
					'<div id="test2">test2</div>'+
					'<div id="propaganda" class="propaganda">original</div>'+
				'</div>'
				).template();
			view.render(); 

			//notice that view is rendered but until we call layout.showContent() or layout.updateUI the content will not be injected on it. 
			expect(view.$('#test1').text()).toBe('test1'); 
			expect(view.$('#test2').text()).toBe('test2'); 
		});

		// if a subscribe for afterAppendView the content should be already rendered: This is why Layout.showContent is wrap and not class-overriten
		it('let subscribe to renderEnhancedPageContent event', function (done) 
		{	
			var content_zone_after = null
			application.getLayout().once('renderEnhancedPageContent', function(view2, content_zone)
			{
				content_zone_after = content_zone; 
				expect(content_zone_after.target).toBe('#test1'); 
				expect(view.id).toBe(view2.id); 
				done()
			}); 

			application.getLayout().showContent(view);

		});

		it('more specific rule /foo/bar should win over less specific rule *', function ()
		{
			expect(view.$('#test1').text()).toBe('Chapter 1: Down the Rabbit-Hole...'); 
			expect(view.$('#test2').text()).toBe('test2');
		});

		it('should change the document\'s title if any', function ()
		{
			expect(document.title).toBe('alice in wonderland title');
		});

		it('should add a meta[name="description"] in head if any', function ()
		{
			expect(jQuery('head meta[name="description"]').size()).toBe(1);
			expect(jQuery('head meta[name="description"]').attr('content')).toBe('alice in wonderland description');
		});

		it('should add a meta[name="keywords"] in head if any', function ()
		{
			expect(jQuery('head meta[name="keywords"]').size()).toBe(1);
			expect(jQuery('head meta[name="keywords"]').attr('content')).toBe('alice, wonderland, carroll, chapter 1');
		});

		it('change the url and call layout.showContent() again should trigger the enhanced pages again', function ()
		{
			setFragment('chapter/9');
			application.getLayout().showContent(view);

			expect(document.title).toBe('alice in wonderland title - chapter 9');
			expect(view.$('#test2').html().indexOf('Chapter 9: The Mock Turtle\'s Story..') !== -1).toBe(true);
		});

		it('scripts including in the content should be executed', function ()
		{
			expect(window.alicestring).toBe('The Mock Turtle is very sad, even though he has no sorrow.');
		});

		describe('modals', function()
		{
			it('can render in modals prefixing class & ids with in-modal-', function(done)
			{

				setFragment('chapter/6');

				var view2 = new Backbone.View({
					application: application
				});
				view2.template = _(
					'<div>'+
						'<div id="testmodal1">original</div>'+
					'</div>'
					).template();
				view2.render(); 

				application.getLayout().on('renderEnhancedPageContent', function(targetView)
				{

					expect(targetView).toBe(view2)
					expect(view2.$('#testmodal1').size()).toBe(0);
					expect(view2.$('#in-modal-testmodal1').size()).toBe(1);
					expect(view2.$('#in-modal-testmodal1').text()).toBe('Chapter 6: Pig and Pepper');
					done()
					// if (targetView === view2)
					// {
					// 	done();
					// }					
				});
				application.getLayout().showInModal(view2); 

			}); 

		});

	});	

});