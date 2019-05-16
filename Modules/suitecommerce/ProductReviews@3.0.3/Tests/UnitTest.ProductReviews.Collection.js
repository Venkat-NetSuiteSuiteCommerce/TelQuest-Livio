/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*jshint laxcomma:true*/
define(
    [
        'ProductReviews.Collection'
    ,   'SC.Configuration'
    ]
    , function (
        ProductReviewsCollection
    ,   Configuration
    )
{
    'use strict';

    // Configuration.productReviews = {
    //     filterOptions: [
    //         {id: 'filter1', name: 'filter1', params: { filterValue: 1}, isDefault: true}
    //     ,   {id: 'filter2', name: 'filter2', params: { filterValue: 2}}
    //     ,   {id: 'filter3', name: 'filter3', params: { filterValue: 3}}

    //     ]
    // ,   sortOptions: [
    //         {id: 'sort1', name: 'sort1', params: {order: 'sort1'}, isDefault: true}
    //     ,   {id: 'sort2', name: 'sort2', params: {order: 'sort2'},}
    //     ,   {id: 'sort3', name: 'sort3', params: {order: 'sort3'}}

    //     ]
    // };

    // return xdescribe('Product Reviews collection', function ()
    // {
    //     describe('structure definition', function()
    //     {
    //         it('methods should defined', function()
    //         {
    //             expect(ProductReviewsCollection.prototype.parse).toBeDefined();
    //             expect(ProductReviewsCollection.prototype.parseOptions).toBeDefined();
    //             expect(ProductReviewsCollection.prototype.update).toBeDefined();
    //         });
    //     });

    //     describe('getReviewParams', function()
    //     {

    //         it('should be defined in the collection', function (){
    //             expect(ProductReviewsCollection.prototype.getReviewParams).toBeDefined();
    //         });
            
    //         it('should return no params values if no parameters', function (){
    //             var getReviewsParams = ProductReviewsCollection.prototype.getReviewParams;
    //             var result = getReviewsParams();

    //             expect(result).toEqual({page: 1});
                
    //         });
            
    //         it('should dismiss wrong options values', function (){
    //             var getReviewsParams = ProductReviewsCollection.prototype.getReviewParams;
                
    //             var options = {foo: 'bar', filter: 'filter1', sort: 'sort1'};
    //             var result = getReviewsParams(options);
                
    //             expect(result.order).toEqual('sort1');
    //             expect(result.page).toEqual(1);
    //             expect(result.foo).toBeUndefined();
    //         });
            
    //         it('should return the specified options values', function (){
    //             var getReviewsParams = ProductReviewsCollection.prototype.getReviewParams;
                
    //             var options = {filter: 'filter3', sort: 'sort2', page: 5};
    //             var result = getReviewsParams(options);
                
    //             expect(result.filterValue).toBe(3);
    //             expect(result.order).toBe('sort2');
    //             expect(result.page).toBe(5);
    //         }); 
            
    //         it('should include the current page', function (){
    //             var getReviewsParams = ProductReviewsCollection.prototype.getReviewParams;
                
    //             var options = {filter: 'filter3', sort: 'sort2', page: 5};
    //             var result = getReviewsParams(options);

    //             expect(result.page).toBe(5);
    //         });
        
    //         it('should return default values if no id match', function (){
    //             var getReviewsParams = ProductReviewsCollection.prototype.getReviewParams;
                
    //             var options = {foo: 'filter3', bar: 'sort2', tar: 5};
    //             var result = getReviewsParams(options);

    //             expect(result.filterValue).toBe(1);
    //             expect(result.order).toBe('sort1');
    //             expect(result.page).toBe(1);
    //         });
    //     });
        
    //     describe('update', function()
    //     {
    //         it('should fetch the collection', function()
    //         {
    //             // plan
    //             var collection = new ProductReviewsCollection();
                
    //             spyOn(collection, 'fetch');
    //             spyOn(collection, 'parseOptions');
                
    //             // do
    //             collection.update({});
                
    //             // assert
    //             expect(collection.fetch).toHaveBeenCalled();
    //         });
            
    //         it('should fetch the collection with the correct parameters', function()
    //         {  
    //             // plan
    //             var collection = new ProductReviewsCollection()
    //             ,   options = {filter: {id: 'filter3'}, sort: { id: 'sort2'}, page: 5}
    //             ,   expected = { data: { filterValue: 3, order: 'sort2', page: 5}, reset: true, killerId: undefined };
                
    //             spyOn(collection, 'fetch');
                
    //             // do
    //             collection.update(options);
                
    //             // assert
    //             expect(collection.fetch).toHaveBeenCalledWith(expected);
    //         });
    //     });
    // });
});