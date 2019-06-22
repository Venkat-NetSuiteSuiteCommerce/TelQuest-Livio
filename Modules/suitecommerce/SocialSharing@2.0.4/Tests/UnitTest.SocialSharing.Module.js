/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*jshint laxcomma:true*/
define(
	[
		'SocialSharing'
	,	'SocialSharing.Plugins.AddThis'
	,	'SC.Configuration'
	,	'Application'
	,	'jasmine2-typechecking-matchers'
	,	'jQuery'
	]
,	function (
		SocialSharing
	,	SocialSharingPluginsAddThis
	,	Configuration
	)
{
	'use strict';

	// return describe('SocialSharing Module', function ()
	// {
	// 	var application = SC.Application('SocialSharingTest')
	// 	,	Layout = application.getLayout(); 

	// 	beforeEach(function (done)
	// 	{
	// 		_(Configuration).extend({ 
	// 			// modules: [ 'SocialSharing' ]
	// 			facebook: {
	// 				enable: true
	// 			}

	// 		,	hover_pin_it_button: {
	// 				enable_pin_it_hover: true
	// 			}

	// 		,	linkTagGooglePlusAuthorship: {
	// 				'author': function () {return 'https://plus.google.com/+YourAuthorName';}
	// 			,	'publisher': function () {return 'https://plus.google.com/+YourPublisherName';}
	// 			}

	// 		,	metaTagMappingOg: {
	// 				'og:title': function () {return 'seo_title';}
	// 			,	'og:url': function () {return 'seo_url';}
	// 			,	'og:description': function () {return 'seo_description';}
	// 			}

	// 		,	metaTagMappingTwitterProductCard: {
	// 				'twitter:card': function () {return 'seo_product';}
	// 			}

	// 		,	metaTagMappingTwitterGalleryCard: {
	// 				'twitter:card': function () {return 'seo_gallery';}
	// 			}

	// 		,	addThis: {
	// 				enable: true
	// 			,	servicesToShow: {
	// 					facebook: 'Facebook'
	// 				,	twitter: 'Twitter'
	// 				}
	// 			}
	// 		});

	// 		application.start([SocialSharing, SocialSharingPluginsAddThis], function () 
	// 		{ 
	// 			application.getLayout().template = function(){return '<div id="content"></div>'; };
	// 			application.getLayout().appendToDom();
	// 			done();
	// 		});
	// 	});

	// 	it('refreshAddThisElements: Fills the share in add this place holder', function () 
	// 	{
	// 		var view = new Backbone.View({
	// 			application: application
	// 		});

	// 		// SC.templates.layout_tmpl = '<div id="content"></div>';
	// 		// SC.templates.socialSharing1_tmpl = '<div data-toggle="share-in-add-this"></div>'; 
	// 		view.template = function(){return '<div data-toggle="share-in-add-this"></div>'; };
	// 		view.showContent();

	// 		jQuery('body').append(view.$el); 

	// 		window.addthis = {
	// 			toolbox: jQuery.noop
	// 		};

	// 		Layout.refreshAddThisElements();

	// 		expect(Layout.$('[data-toggle="share-in-add-this"]').html()).not.toBe('');
	// 	});
		
	// 	it('linkTagGooglePlusAuthorship: Adds Google Plus authorship link tags to the header', function ()
	// 	{
	// 		Layout.setMetaTags();

	// 		var $author = jQuery('link[rel="author"]')
	// 		,	$publisher = jQuery('link[rel="publisher"]');

	// 		expect($author.attr('href')).toBe('https://plus.google.com/+YourAuthorName');
	// 		expect($publisher.attr('href')).toBe('https://plus.google.com/+YourPublisherName');
	// 	});
	// });
});
