/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Testing ProductList models
define(
	[
		'ProductList.Details.View'
	,	'ProductList.Control.View'
	,	'ProductList.Collection'
	,	'ProductList.Model'
	,	'Item.Model'
	,	'ProductList'

	,	'underscore'
	,	'jQuery'
	]
,	function (
		ProductListDetailsView
	,	ProductListControlView
	,	ProductListCollection
	,	ProductListModel
	,	ItemModel
	,	ProductList

	,	_
	,	jQuery
	)
{
	'use strict';
	// SC.ENVIRONMENT.siteSettings = {siteid: 1};

	// describe('ProductList.Details.View', function ()
	// {
	// 	var view
	// 	,	application
	// 	,	PRODUCT_LISTS_MOCK = [{'internalid':'131','name':'Empty List','description':'','owner':{'id':'13','name':'6 Sebastián Demetrio Gurin'},'scope':{'id':'2','name':'private'},'type':{'id':'1','name':'default'},'created':'2/10/2014 9:50 am','lastmodified':'2/10/2014 9:50 am','items':[]},{'internalid':'155','name':'Two Items List','description':'','owner':{'id':'13','name':'6 Sebastián Demetrio Gurin'},'scope':{'id':'2','name':'private'},'type':{'id':'1','name':'default'},'created':'2/11/2014 12:20 pm','lastmodified':'2/11/2014 12:20 pm','items':[{'internalid':'228','description':'','options':{},'quantity':1,'created':'2/12/2014 12:02 pm','lastmodified':'2/12/2014 12:02 pm','item':{'ispurchasable':true,'featureddescription':'','showoutofstockmessage':false,'correlateditems_detail':null,'location':null,'metataghtml':'','stockdescription':'','itemid':'Bici-R','onlinecustomerprice':null,'relateditemdescription2':null,'outofstockbehavior':null,'storedisplayname2':'','internalid':46,'itemimages_detail':{},'isdonationitem':false,'pricelevel_formatted':null,'pagetitle':'','onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'','onlinecustomerprice':''},'itemtype':'InvtPart','storedetaileddescription':'','outofstockmessage':'','searchkeywords':'','storeitemtemplate':null,'pricelevel':null,'isonline':true,'itemoptions_detail':{'parentid':44,'matrixtype':'child'},'storedescription':'','isinactive':false,'quantityavailable':0,'relateditems_detail':null,'matrixchilditems_detail':null,'pagetitle2':'','urlcomponent':'','displayname':'Bici','matrix_parent':{'ispurchasable':true,'featureddescription':'','showoutofstockmessage':false,'correlateditems_detail':[{'internalid':26}],'location':null,'metataghtml':'','stockdescription':'','itemid':'Bici','onlinecustomerprice':null,'relateditemdescription2':null,'outofstockbehavior':'- Default -','storedisplayname2':'Bici','internalid':44,'itemimages_detail':{},'isdonationitem':false,'pricelevel_formatted':null,'pagetitle':'','onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'','onlinecustomerprice':''},'itemtype':'InvtPart','storedetaileddescription':'','outofstockmessage':'','searchkeywords':'','storeitemtemplate':null,'pricelevel':null,'isonline':true,'itemoptions_detail':{'matrixtype':'parent','fields':[{'values':[{'label':'- Select -'},{'label':'Azul','internalid':'1'},{'label':'Rojo','internalid':'2'},{'label':'Verde','internalid':'3'}],'ismatrixdimension':true,'ismandatory':true,'label':'Color','internalid':'custcol3','type':'select','sourcefrom':'custitem3'}]},'storedescription':'','isinactive':false,'quantityavailable':0,'relateditems_detail':[],'matrixchilditems_detail':[{'ispurchasable':true,'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'','onlinecustomerprice':''},'isbackorderable':true,'outofstockmessage':'','showoutofstockmessage':false,'custitem3':'Rojo','stockdescription':'','internalid':46,'quantityavailable':0,'isinstock':false},{'ispurchasable':true,'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'','onlinecustomerprice':''},'isbackorderable':true,'outofstockmessage':'','showoutofstockmessage':false,'custitem3':'Verde','stockdescription':'','internalid':47,'quantityavailable':0,'isinstock':false},{'ispurchasable':true,'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'','onlinecustomerprice':''},'isbackorderable':true,'outofstockmessage':'','showoutofstockmessage':false,'custitem3':'Azul','stockdescription':'','internalid':45,'quantityavailable':0,'isinstock':false}],'pagetitle2':'Bici','urlcomponent':'Bici','displayname':'Bici'}},'priority':{'id':'2','name':'medium'}},{'internalid':'235','description':'','options':{'custcol4':'teste','custcol5':'testgw'},'quantity':1,'created':'2/13/2014 4:11 am','lastmodified':'2/13/2014 4:11 am','item':{'ispurchasable':true,'featureddescription':'<font face=\'Tahoma, Geneva, sans-serif\'><span style=\'font-size: 11px;\'>Stuhrling Original Mens 564.02</span></font><div style=\'font-family: Tahoma, Geneva, sans-serif; font-size: 8pt;\'></div>','showoutofstockmessage':false,'correlateditems_detail':[],'location':null,'metataghtml':'','stockdescription':'','itemid':'Stuhrling Original Mens 564.02','onlinecustomerprice':222,'relateditemdescription2':null,'outofstockbehavior':'- Default -','storedisplayname2':'Stuhrling Original Mens 564.02','internalid':49,'itemimages_detail':{'media_1':{'url':'https://checkout.netsuite.com/c.3690872/site/imgs/Stuhrling123_media_1.jpg','altimagetext':''},'media_2':{'url':'https://checkout.netsuite.com/c.3690872/site/imgs/Stuhrling123_media_2.jpg','altimagetext':''}},'isdonationitem':false,'pricelevel_formatted':null,'pagetitle':'Stuhrling Original Mens 564.02','onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$222.00','onlinecustomerprice':222},'itemtype':'InvtPart','storedetaileddescription':'<font face=\'Tahoma, Geneva, sans-serif\'><span style=\'font-size: 11px;\'>Stuhrling Original Mens 564.02</span></font><div style=\'font-family: Tahoma, Geneva, sans-serif; font-size: 8pt;\'></div>','storeitemtemplate':'Basic : Clean Lines PRODUCTS (item list)','outofstockmessage':'','searchkeywords':'','isonline':true,'pricelevel':null,'itemoptions_detail':{'fields':[{'label':'Engraved Name','internalid':'custcol4','type':'text'},{'label':'Gift Wrapped','internalid':'custcol5','type':'text'}]},'storedescription':'<font face=\'Tahoma, Geneva, sans-serif\'><span style=\'font-size: 11px;\'>Stuhrling Original Mens 564.02</span></font><div style=\'font-family: Tahoma, Geneva, sans-serif; font-size: 8pt;\'></div>','isinactive':false,'quantityavailable':0,'relateditems_detail':[],'matrixchilditems_detail':null,'pagetitle2':'Stuhrling Original Mens 564.02','urlcomponent':'','displayname':'Stuhrling Original Mens 564.02'},'priority':{'id':'2','name':'medium'}}]},{'internalid':'222','name':'List with move not available','description':'','owner':{'id':'13','name':'6 Sebastián Demetrio Gurin'},'scope':{'id':'2','name':'private'},'type':{'id':'1','name':'default'},'created':'2/10/2014 9:50 am','lastmodified':'2/10/2014 9:50 am','items':[{'internalid':'236','description':'','options':{'custcol4':'teste','custcol5':'testgw'},'quantity':1,'created':'2/13/2014 4:11 am','lastmodified':'2/13/2014 4:11 am','item':{'ispurchasable':true,'featureddescription':'<font face=\'Tahoma, Geneva, sans-serif\'><span style=\'font-size: 11px;\'>Stuhrling Original Mens 564.02</span></font><div style=\'font-family: Tahoma, Geneva, sans-serif; font-size: 8pt;\'></div>','showoutofstockmessage':false,'correlateditems_detail':[],'location':null,'metataghtml':'','stockdescription':'','itemid':'Stuhrling Original Mens 564.02','onlinecustomerprice':222,'relateditemdescription2':null,'outofstockbehavior':'- Default -','storedisplayname2':'Stuhrling Original Mens 564.02','internalid':49,'itemimages_detail':{'media_1':{'url':'https://checkout.netsuite.com/c.3690872/site/imgs/Stuhrling123_media_1.jpg','altimagetext':''},'media_2':{'url':'https://checkout.netsuite.com/c.3690872/site/imgs/Stuhrling123_media_2.jpg','altimagetext':''}},'isdonationitem':false,'pricelevel_formatted':null,'pagetitle':'Stuhrling Original Mens 564.02','onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$222.00','onlinecustomerprice':222},'itemtype':'InvtPart','storedetaileddescription':'<font face=\'Tahoma, Geneva, sans-serif\'><span style=\'font-size: 11px;\'>Stuhrling Original Mens 564.02</span></font><div style=\'font-family: Tahoma, Geneva, sans-serif; font-size: 8pt;\'></div>','storeitemtemplate':'Basic : Clean Lines PRODUCTS (item list)','outofstockmessage':'','searchkeywords':'','isonline':true,'pricelevel':null,'itemoptions_detail':{'fields':[{'label':'Engraved Name','internalid':'custcol4','type':'text'},{'label':'Gift Wrapped','internalid':'custcol5','type':'text'}]},'storedescription':'<font face=\'Tahoma, Geneva, sans-serif\'><span style=\'font-size: 11px;\'>Stuhrling Original Mens 564.02</span></font><div style=\'font-family: Tahoma, Geneva, sans-serif; font-size: 8pt;\'></div>','isinactive':false,'quantityavailable':0,'relateditems_detail':[],'matrixchilditems_detail':null,'pagetitle2':'Stuhrling Original Mens 564.02','urlcomponent':'','displayname':'Stuhrling Original Mens 564.02'},'priority':{'id':'2','name':'medium'}}]}]
	// 	,	FILLED_LIST_INTERNALID = '155';

	// 	beforeEach(function (done)
	// 	{
	// 		var mocked_data = new ProductListCollection(PRODUCT_LISTS_MOCK);

	// 		// Here is the appliaction we will be using for this tests
	// 		application = SC.Application('ProductListDetailsView');

	// 		// This is the configuration needed by the modules in order to run
	// 		application.Configuration = {
	// 			product_lists: {
	// 				itemsDisplayOptions: []
	// 			}
	// 		};

	// 		// Starts the application and wait until it is started
	// 		jQuery(application.start([ProductList, ItemsKeyMapping], function ()
	// 		{
	// 			application.ProductListModule.Utils.getProductLists = function ()
	// 			{
	// 				return mocked_data;
	// 			};
	// 			view = new ProductListDetailsView({
	// 				application: application
	// 			,	params: ''
	// 			,	model: new ProductListModel()
	// 			});
	// 			application.getLayout().appendToDom();
	// 			done();
	// 		}));
	// 	});

	// 	it('deleteListItem: delete an item from a list', function ()
	// 	{
	// 		var pls = application.ProductListModule.Utils.getProductLists()
	// 		,	product_list = pls.findWhere({internalid: FILLED_LIST_INTERNALID})
	// 		,	expected_length = product_list.get('items').length - 1
	// 		,	product_list_item = product_list.get('items').findWhere({internalid: '228'})
	// 		,	myview = new ProductListDetailsView({
	// 				application: application
	// 			,	params: ''
	// 			,	model: product_list
	// 			,	collection: pls
	// 		});

	// 		spyOn(product_list_item, 'destroy');
	// 		myview.deleteListItem(product_list_item);

	// 		expect(product_list.get('items').length).toBe(expected_length);
	// 		expect(product_list_item.destroy).toHaveBeenCalled();
	// 	});		

	// 	it('addItemToCart: add an productListItem to the cart should invoke cart addItem', function ()
	// 	{
	// 		spyOn(view.cart, 'addItem');

	// 		view.addItemToCart({});

	// 		expect(view.cart.addItem).toHaveBeenCalled();
	// 	});

	// 	it('getMoveLists: returns the available lists for move', function ()
	// 	{
	// 		var current_list = application.ProductListModule.Utils.getProductLists().at(1)
	// 		,	list_item = current_list.get('items').at(1); // item internalid: 49

	// 		var move_lists = view.getMoveLists(application.ProductListModule.Utils.getProductLists(), current_list, list_item);

	// 		expect(move_lists instanceof ProductListCollection).toBeTruthy();
	// 		expect(move_lists.size()).toEqual(1);
	// 		// ensure resulting lists do not have the moving item
	// 		expect(move_lists.filter(function(list){ return list.get('items').find(function(item){return item.get('item').internalid+'' === list_item.get('item').internalid+'';}) !== undefined;}).length).toEqual(0);
	// 	});
	// });

	// describe('ProductList.Control.Views', function ()
	// {
	// 	var PRODUCT_LISTS_MOCK = [{'internalid':'131','name':'Empty List','description':'','owner':{'id':'13','name':'6 Sebastián Demetrio Gurin'},'scope':{'id':'2','name':'private'},'type':{'id':'1','name':'default'},'created':'2/10/2014 9:50 am','lastmodified':'2/10/2014 9:50 am','items':[]},{'internalid':'155','name':'Two Items List','description':'','owner':{'id':'13','name':'6 Sebastián Demetrio Gurin'},'scope':{'id':'2','name':'private'},'type':{'id':'1','name':'default'},'created':'2/11/2014 12:20 pm','lastmodified':'2/11/2014 12:20 pm','items':[{'internalid':'235','description':'','options':{'custcol4':{'value':'teste','displayvalue':'teste'},'custcol5':{'value':'testgw','displayvalue':'testgw'}},'quantity':1,'created':'2/13/2014 4:11 am','lastmodified':'2/13/2014 4:11 am','item':{'ispurchasable':true,'displayname':'Stuhrling Original Mens 564.02','internalid':'50'},'priority':{'id':'2','name':'medium'}}]}]
	// 	,	ITEM_DETAILS_MOCK = {'ispurchasable':true,'featureddescription':'','showoutofstockmessage':false,'correlateditems_detail':[],'metataghtml':'','stockdescription':'','itemid':'Bertech Anti-Static Metal Adjustable','onlinecustomerprice':222.0,'outofstockbehavior':'- Default -','storedisplayname2':'Bertech Anti-Static Metal Adjustable','internalid':50,'itemimages_detail':{},'isdonationitem':false,'pagetitle':'','onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$222.00','onlinecustomerprice':222.0},'itemtype':'NonInvtPart','storedetaileddescription':'','outofstockmessage':'','searchkeywords':'','isonline':true,'itemoptions_detail':{'fields':[{'internalid':'custcol4','label':'teste','type':'text','ismandatory':'true'},{'internalid':'custcol5','label':'testgw','type':'text','ismandatory':'true'}]},'storedescription':'','isinactive':false,'relateditems_detail':[],'pagetitle2':'Bertech Anti-Static Metal Adjustable','urlcomponent':'','displayname':'Bertech222'}
	// 	,	application = null
	// 	,	control = null
	// 	,	move_control = null
	// 	,	details_view = null
	// 	,	from_list = null
	// 	,	to_list = null;

	// 	it('Initial application setup', function (done)
	// 	{
	// 		application = SC.Application('Test1');
	// 		application.Configuration =  {
	// 			product_lists: {
	// 				itemsDisplayOptions: []
	// 			}
	// 		};

	// 		jQuery(application.start([ProductList, ItemsKeyMapping], function () {
	// 			application.ProductListModule.Utils.getProductLists = function()
	// 			{
	// 				return new ProductListCollection(PRODUCT_LISTS_MOCK);
	// 			};
	// 			application.getCart = function ()
	// 			{
	// 				return {};
	// 			};

	// 			done();
	// 		}));
	// 	});

	// 	it('should show correct amount of lists', function()
	// 	{
	// 		var product_list_collection = new ProductListCollection(PRODUCT_LISTS_MOCK);
	// 		var item_details_model = new ItemDetailsModel(ITEM_DETAILS_MOCK);

	// 		item_details_model.keyMapping = application.Configuration.itemKeyMapping;
	// 		item_details_model.setOptionsArray([{id: 'custcol4', value: 'teste'}, {id: 'custcol5', value: 'testgw'}], true);

	// 		control = new ProductListControlView({
	// 			collection: product_list_collection
	// 		,	product: item_details_model
	// 		,	application: application
	// 		});

	// 		control.render();

	// 		expect(control.$('input.product-list-control-item-checkbox').size()).toBe(2);
	// 		expect(control.$('label.product-list-control-item-label:first').text().trim()).toBe('Two Items List');
	// 		expect(control.$('input.product-list-control-item-checkbox:checked').size()).toBe(1);
	// 		expect(control.$('input.product-list-control-item-checkbox:last:checked').size()).toBe(0);
	// 	});

	// 	xit('the control should POST or DELETE when checkboxes are clicked', function()
	// 	{
	// 		var ajax_args = null;

	// 		spyOn(jQuery, 'ajax').and.callFake(function(){
	// 			ajax_args = arguments[0];
	// 		});

	// 		control.$('input.product-list-control-item-checkbox:first').click();
	// 		expect(ajax_args.type).toBe('POST');
	// 		expect(ajax_args.url.indexOf('services/ProductList.Item.Service.ss') !== -1).toBeTruthy();

	// 		control.$('input.product-list-control-item-checkbox:first').click();
	// 		expect(ajax_args.type).toBe('DELETE');
	// 		expect(ajax_args.url.indexOf('services/ProductList.Item.Service.ss') !== -1).toBeTruthy();
	// 	});

	// 	it('the control should return the correct "move" mode', function ()
	// 	{
	// 		var product_list_collection = new ProductListCollection(PRODUCT_LISTS_MOCK);
	// 		var item_details_model = new ItemDetailsModel(ITEM_DETAILS_MOCK);


	// 		item_details_model.keyMapping = application.Configuration.itemKeyMapping;

	// 		control = new ProductListControlView({
	// 			collection: product_list_collection
	// 		,	product: item_details_model
	// 		,	application: application
	// 		});

	// 		// normal control (shopping) should have undefined mode
	// 		expect(control.mode).toBeUndefined();

	// 		// set up move control
	// 		from_list = product_list_collection.at(1); // one item - product_list_item_internalid: 245, item_internalid: 50
	// 		to_list = product_list_collection.at(0); // empty list
	// 		details_view = new ProductListDetailsView({
	// 			application: application
	// 		,	model: from_list
	// 		});

	// 		move_control = new ProductListControlView({
	// 			collection: product_list_collection
	// 		,	product: item_details_model
	// 		,	application: application
	// 		,	moveOptions:
	// 			{
	// 				parentView: details_view
	// 			,	productListItem: from_list.get('items').at(0)
	// 			}
	// 		});

	// 		expect(move_control.mode).toEqual('move');
	// 	});

	// 	it('an item should be moved correctly', function()
	// 	{
	// 		//,	doMoveProduct: function (destination)
	// 		var from_count = from_list.get('items').size()
	// 		,	to_count = to_list.get('items').size()
	// 		,	from_count_expected = from_count - 1
	// 		,	to_count_expected = to_count + 1;

	// 		var original_item = move_control.moveOptions.productListItem
	// 		,	original_item_clone = original_item.clone();

	// 		move_control.doMoveProduct(from_list, to_list, original_item, original_item_clone);

	// 		expect(from_list.get('items').size()).toEqual(from_count_expected);
	// 		expect(from_list.get('items').find(function(item){ return item.get('item').internalid === original_item.get('item').internalid+'';})).toBeUndefined();
	// 		expect(to_list.get('items').size()).toEqual(to_count_expected);
	// 		expect(to_list.get('items').find(function(item){ return item.get('item').internalid === original_item.get('item').internalid+'';})).toEqual(original_item_clone);

	// 	});

	// 	xit('the move control should PUT when li labels are clicked', function ()
	// 	{
	// 		move_control.render();
	// 		// uncomment to append control
	// 		// move_control.$el.appendTo(jQuery('body'));
	// 		// move_control.$('.dropdown-menu').show();
	// 		var ajax_args = null;
	// 		spyOn(jQuery, 'ajax').andCallFake(function(){
	// 			ajax_args = arguments[0];
	// 		});

	// 		move_control.$('.ul-product-lists>li:first label').click();

	// 		expect(ajax_args.type).toBe('PUT');
	// 		expect(ajax_args.url.indexOf('services/ProductList.Item.Service.ss') !== -1).toBeTruthy();
	// 	});
	// });
});