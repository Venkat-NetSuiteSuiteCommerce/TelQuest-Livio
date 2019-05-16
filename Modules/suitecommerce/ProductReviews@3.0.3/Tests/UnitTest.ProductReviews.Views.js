/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*jshint laxcomma:true*/
define(
    [
        'ProductReviews'
    ,   'ProductReviews.Center.View'
    ,   'ProductReviews.Preview.View'
    ,   'ProductReviews.FormConfirmation.View'
    ,	'UnitTestHelper'
    ,	'SC.Configuration'
    ]
    , function (
    	ProductReviews
    ,   ProductReviewsCenterView
    ,	ProductReviewsPreviewView
    ,	ProductReviewsConfirmationView
    ,	UnitTestHelper
    ,	Configuration
    )
{
	'use strict';

	// return describe('Product Reviews Views', function ()
	// {
	// 	var helper = new UnitTestHelper({
	// 		applicationName: 'ProductReviewsViews'
	// 	,	startApplication: true
	// 	,	mountModules: [ProductReviews]
	// 	})
	// 	,	item = { get: function(){ return 1; } };

	//     describe('ProductReviews Center View', function ()
	//     {
	//     	describe('definition', function()
	//     	{
	// 	        it('#1 view should be defined', function()
	// 	        {
	// 	            expect(ProductReviewsCenterView).toBeDefined();
	// 	        });
	//     	});
	        
	//         describe('getRelPrev', function()
 //        	{
	// 	        it('should return null if first page', function()
	// 	        {
	// 	            var options = {
	// 	            	item: item
	// 	            ,	queryOptions: { page: 1 }
	// 	            ,	collection: {}
	// 	            ,	application: helper.application
	// 	        	}
	// 	            ,   view = new ProductReviewsCenterView(options);
		            
	// 	            var result = view.getRelPrev()
	// 	            ,   expected = null;
		            
	// 	            expect(result).toBe(expected);
	// 	        });
		        
	// 	        xit('should return baseUrl if second page', function()
	// 	        {
	// 	            var options = { 
	// 	            	item: item
	// 	            ,	queryOptions: { page: 2 }
	// 	            ,	collection: {}
	// 	            ,	application: helper.application
	// 	       		}
	// 	            ,   view = new  ProductReviewsCenterView(options);
		            
	// 	            var result = view.getRelPrev()
	// 	            ,   expected = 'product/1';
		            
	// 	            expect(result).toBe(expected);
	// 	        });
		        
	// 	        xit('should return baseUrl plus page params if third page or more', function ()
	// 	        {
	// 	            var	options = { item: item
	// 	            ,	queryOptions: { page: '5' }
	// 	            ,	collection: {}
	// 	            ,	application: helper.application
	// 	        	}
	// 	            ,   view = new ProductReviewsCenterView(options);
		            
	// 	            var result = view.getRelPrev()
	// 	            ,   expected = 'product/1?page=4';
		            
	// 	            expect(result).toBe(expected);
	// 	        });
 //        	});
	        
	//         describe('getRelNext', function()
	//         {
	// 	        it('should return null if its last page', function ()
	// 	        {
	// 				var options = { 
	// 					item: item
	// 				,	queryOptions: { page: 2 }
	// 				,	collection: { totalPages: 1}
	// 				,	application: helper.application
	// 				}
	// 	            ,   view = new ProductReviewsCenterView(options);
		            
	// 	            var result = view.getRelNext()
	// 	            ,   expected = null;
		            
	// 	            expect(result).toBe(expected);
	// 	        });
		        
	// 	        xit('should return baseUrl and page param', function ()
	// 	        {
	// 	            var options = { 
	// 	            	item: item
	// 	            ,	queryOptions: { page: 2 }
	// 	            ,	collection: { totalPages: 5}
	// 	            ,	application: helper.application
	// 	        	}
	// 	            ,   view = new ProductReviewsCenterView(options);
		            
	// 	            var result = view.getRelNext()
	// 	            ,   expected = 'product/1?page=3';
		            
	// 	            expect(result).toBe(expected);
	// 	        });
		        
	//         });

	// 		describe('getUrlForOption', function()
	// 		{
	// 	        it('default values from queryOptions', function ()
	// 	        {
	// 	            var options = { 
	// 	            	item: item
	// 	            ,	collection: { totalPages: 1}
	// 	            ,	application: helper.application
	// 	        	}
	// 	            ,   view = new ProductReviewsCenterView(options)
	// 	            ,	queryOptions = { sort: 'sort1', filter: 'filter1' };
		            
	// 	            var result = view.getUrlForOption(queryOptions)
	// 	            ,   expected = 'product/1?filter=filter1&sort=sort1';
		            
	// 	            expect(result).toBe(expected);
	// 	        });
				
	// 	        xit('appropiate param values', function ()
	// 	        {
	// 	            var options = { 
	// 	            	item: item
	// 	            ,	queryOptions: { sort: 'sort1', filter: 'filter1' }
	// 	            ,	collection: { totalPages: 1}
	// 	            ,	application: helper.application
	// 	        	}
	// 	            ,   view = new ProductReviewsCenterView(options)
	// 	            ,   option = { filter: 'filter2' };
		            
	// 	            var result = view.getUrlForOption(option)
	// 	            ,   expected = 'foo.bar?filter=filter2&sort=sort1';
		            
	// 	            expect(result).toBe(expected);
	// 	        });
	// 		});
	        
	//         describe('setupListHeader', function()
	//         {
	//             Configuration.productReviews = {
 //                    filterOptions: [
 //                        {id: 'filter1', name: 'filter1', params: { filterValue: 1}, isDefault: true}
 //                    ,   {id: 'filter2', name: 'filter2', params: { filterValue: 2}}
 //                    ,   {id: 'filter3', name: 'filter3', params: { filterValue: 3}}

 //                    ]
 //                ,	sortOptions: [
 //                        {id: 'sort1', name: 'sort1', params: {order: 'sort1'}, isDefault: true}
 //                    ,   {id: 'sort2', name: 'sort2', params: {order: 'sort2'},}
 //                    ,   {id: 'sort3', name: 'sort3', params: {order: 'sort3'}}

 //                    ]
 //                }

	// 	        xit('should define the listHeader var', function ()
	// 	        {
	// 	            // old test
	// 	            spyOn(ProductReviewsCenterView.prototype, 'setupListHeader').and.callThrough();
	// 	            var options = { item: item, collection: {}, application: helper.application}
	// 	            ,   view = new ProductReviewsCenterView(options);
		                       
	// 	            expect(view.setupListHeader).toHaveBeenCalled();
	// 	            expect(view.listHeader).toBeDefined();
	// 	        });
	//         });
	        
	//         describe('updateCannonicalLinks', function()
	//         {
	// 	        xit('should add canonical links to head element ', function ()
	// 	        {
	// 	            var options = { 
	// 	            	item: item
	// 	            ,	queryOptions: { page: 3 }
	// 	            ,	collection: { totalPages: 5}
	// 	            ,	application: helper.application
	// 	        	}
	// 	            ,   view = new ProductReviewsCenterView(options);
		            
	// 	            view.updateCannonicalLinks();

	// 	            var $rel_prev = jQuery('head').find('link[rel="prev"]')
	// 	            ,   $rel_next = jQuery('head').find('link[rel="next"]');
		            

	// 	            expect($rel_prev.attr('href')).toEqual('product/1?page=2');
	// 	            expect($rel_next.attr('href')).toEqual('product/1?page=4');
	// 	        });
	//         });
	        
	//         describe('TODO', function()
	//         {
	// 	        xit('#11 "handleMarkSuccess"', function(){});
	// 	        xit('#12 "handleMarkError"', function(){});
	// 	        xit('#13 "markReview"', function(){});
	// 	        xit('#14 "getBreadcrumb"', function(){});
	//         });
	        
	//     });
	    
	//     describe('Product Reviews ProductReviewsCenterView', function ()
	//     {
	//         xit('#1 view should be defined', function()
	//         {
	//             expect(ProductReviewsCenterView).toBeDefined();
	//         });
	        
	//         xit('#2 "rate" TODO', function() {});
	//         xit('#3 "sanitize" TODO', function() {});
	//         xit('#4 "preview" TODO', function() {});
	//         xit('#5 "getBreadcrumb" TODO', function() {});
	//         xit('#6 "updateMetaTags" TODO', function() {});
	//     });
	    
	//     describe('Product Reviews ProductReviewsPreviewView', function ()
	//     {
	//         it('#1 view should be defined', function()
	//         {
	//             expect(ProductReviewsPreviewView).toBeDefined();
	//         });
	        
	//         xit('#2 "edit" TODO', function (){});
	//         xit('#3 "save" TODO', function (){});
	//         xit('#4 "getBreadcrumb" TODO', function (){});
	//     });
	    
	//     describe('Product Reviews ProductReviewsConfirmationView', function ()
	//     {
	//         it('#1 view should be defined', function()
	//         {
	//             expect(ProductReviewsConfirmationView).toBeDefined();
	//         });
	        
	//         xit('#2 "getBreadcrumb" TODO', function (){});
	//     });
    // });
});