/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ProductList.js
// --------------------
// Testing ProductList models
define(
	[
		'ProductList.Model'
	,	'ProductList.Collection'
	,	'ProductList.Item.Model'
	,	'ProductList.Item.Collection'
	,	'Item.Model'

	,	'jasmine2-typechecking-matchers'
	]
,	function (
		ProductListModel
	,	ProductListCollection
	,	ProductListItemModel
	,	ProductListItemCollection
	,	ItemModel
	)
{
	'use strict';

	// var MOKED_PRODUCTLIST1 = {'name':'Vacations2014','description':'A sample whishlist','items':[],'scope':{'id':'2','name':'private'},'type':{'id':'1','name':'default'}};
	
	// var MOCKED_PRODUCTLISTCOLLECTION1 = [{'internalid':'86','name':'vacation444','description':'sdfsd','owner':{'id':'13','name':'6 Sebastián Demetrio Gurin'},'scope':{'id':'2','name':'private'},'type':{'id':'1','name':'default'},'items':[]},{'internalid':'83','name':'Vacations2015','description':'A sample whishlist','owner':{'id':'13','name':'6 Sebastián Demetrio Gurin'},'scope':{'id':'2','name':'private'},'type':{'id':'1','name':'default'},'items':[{'internalid':'110','description':'','options':'','quantity':1,'created':'2/4/2014 8:30 am','item':{'vendorname':'','reordermultiple':null,'stockunit':null,'stditemvendorcost':null,'paymentmethod':null,'mpn':'','outofstocknobackordermessage':'<tr><td class="medtext">&nbsp;<b>(Out of Stock)</b></td></tr>','roundupascomponent':null,'nopricemessage2':'Call For Price','tracklandedcost':null,'internalid':54,'taxtype':null,'softdescriptor':null,'pricelevel5_formatted':'$1,659.99','pagetitle':'Apple MacBook Pro MD103LL/A 15.4-Inch','includechildren':false,'storedetaileddescription':'','isonline':true,'storedisplaynamehtml':'<a href="/s.nl/it.A/id.54/.f">Apple MacBook Pro MD103LL/A 15.4-Inch</a>','parent':null,'residual':'','autopreferredstocklevel':null,'defaultitemshipmethod':null,'onlinematrixmaximumprice':null,'custitem_ns_pr_item_attributes':'&nbsp;','defaultreturncost':null,'immediatedownload':null,'isstorespecial':'F','storedisplaythumbnailhtml':'','onlinematrixpricerange':null,'specialsdescription':null,'preferredlocation':null,'onspecial':null,'currency':'US Dollar','relateditemsdescription3':'Related Items','storedisplayimage':'','matchbilltoreceipt':null,'relateditemsdescription2':'','seasonaldemand':null,'amortizationperiod':'','showdefaultdonationamount':false,'usebins':null,'itemshipmethod':null,'enforceminqtyinternally':true,'pricelevel':null,'custreturnvarianceaccount':null,'isavailable':'T','usemarginalrates':false,'reorderpoint':null,'projectexpensetype':null,'upccode':'apple','deferralaccount':'','purchaseunit':null,'vsoedeferral':null,'featureddescription':'','salesdescription':'','vsoeprice':null,'averagecost':null,'locationid':null,'relateditemthumbnailhtml':'','saleunit':null,'description':null,'unitstype':null,'welcomedescription':'','pricelevel_formatted':null,'effectivebomcontrol':null,'dropshipexpenseaccount':null,'isspecialorderitem':false,'issueproduct':null,'shoppingdotcomcategory':'','vsoesopgroup':null,'cost':null,'defaultaddquantity':'1','billexchratevarianceacct':null,'storeurl':'http://dev1.oloraqa.com/s.nl/it.A/id.54/.f','lastpurchaseprice':null,'transferprice':null,'custitem_ns_pr_attributes_rating':'','weight':null,'unbuildvarianceaccount':null,'department':'','pricelevel1_formatted':'$1,659.99','amortizationtemplate':'','custitem2':'&nbsp;','custitem3':'&nbsp;','custitem1':'&nbsp;','shipindividually':false,'outofstockbehavior':'- Default -','storedisplayimagehtml':'','costestimatetype':null,'qtypricelevel5':null,'qtypricelevel3':null,'qtypricelevel4':null,'qtypricelevel1':null,'qtypricelevel2':null,'relateditemsdescription':'','pagetitle2':'Apple MacBook Pro MD103LL/A 15.4-Inch','storedisplaythumbnail':'','availabletopartners':false,'outofstockbehaviorcode':'DEFAULT','featureditemthumbnailhtml':'','shippackage':null,'onlinematrixpricerange_formatted':null,'pricelevel_1_formatted':null,'revrecschedule':null,'billingschedule':null,'billpricevarianceacct':null,'parentid':'','preferredstocklevel':null,'qtypricelevel-1':null,'defaultrevision':null,'autoreorderpoint':null,'city':null,'pricelevel4':1659.99,'handlingcost':null,'pricelevel3':1659.99,'cogsaccount':null,'pricelevel5':1659.99,'excludefromsitemap':false,'undepfunds':null,'taxagency':null,'isdonationitem':'F','pricelevel2':1659.99,'pricelevel1':1659.99,'custitem_ns_pr_count':null,'costestimate':null,'weightunit':'','isspecialworkorderitem':null,'isdropshipitem':false,'createddate':'1/31/2014 8:57 am','overallquantitypricingtype':null,'custitem_ns_pr_rating':null,'vsoepermitdiscount':null,'county':null,'billqtyvarianceacct':null,'purchasedescription':'','quantitypricingschedule':null,'metataghtml':'','maxdonationamount':null,'incomeaccount':'Fees','isfulfillable':true,'includestartendlines':null,'istaxable':null,'itemcarrier':null,'preferredstockleveldays':null,'storedescription2':'','storedisplayname2':'Apple MacBook Pro MD103LL/A 15.4-Inch','outofstockmessage2':' &nbsp;<b>(Out of Stock)</b>','shippingcost':null,'nopricemessage':'','countryofmanufacture':'','assetaccount':null,'printitems':null,'searchkeywords':'','storeitemtemplate':null,'customform':null,'vendor':null,'storedisplayname':'','pricelevel2_formatted':'$1,659.99','urlcomponent':'','account':null,'custitem_ns_pr_rating_by_rate':'','offersupport':null,'location':null,'stockdescription':'','safetystocklevel':null,'leadtime':null,'relateditemscategory':'','totalvalue':null,'canonicalurl':'http://dev1.oloraqa.com/s.nl/it.A/id.54/.f','isvsoebundle':null,'pricelevel4_formatted':'$1,659.99','outofstockmessage':'','storedescription':'','isinactive':false,'class':null,'createjob':null,'autoleadtime':null,'onlinematrixmaximumprice_formatted':null,'copydescription':false,'safetystockleveldays':null,'pricelevel3_formatted':'$1,659.99','manufacturer':'','dontshowprice':false,'pricinggroup':null,'matrixtype':'','qtypricelevel':null,'shopzillacategoryid':null,'expenseaccount':null,'ispretax':null,'daysbeforeexpiration':null,'demandmodifier':null,'isgcocompliant':'Yes','state':null,'itemid':'Apple MacBook Pro MD103LL/A 15.4-Inch','nextagcategory':'','usecomponentyield':null,'minimumquantity':null,'rate':null,'vendreturnvarianceaccount':null,'buildentireassembly':null,'taxaccount':null,'itemtype':'NonInvtPart','zip':null,'vsoedelivered':null,'stditemvendorcost_formatted':null,'costingmethod':null,'pricelevel_1':null,'externalid':'','taxschedule':'Tax schedule 1','numofalloweddownloads':null,'displayname':'Apple MacBook Pro MD103LL/A 15.4-Inch','liabilityaccount':null},'priority':{'id':'2','name':'medium'}},{'internalid':'113','description':'','options':'','quantity':1,'created':'2/5/2014 5:05 am','item':{'vendorname':'','reordermultiple':null,'stockunit':null,'stditemvendorcost':null,'paymentmethod':null,'mpn':'','outofstocknobackordermessage':'<tr><td class="medtext">&nbsp;<b>(Out of Stock)</b></td></tr>','roundupascomponent':null,'nopricemessage2':'Call For Price','tracklandedcost':null,'internalid':52,'taxtype':null,'softdescriptor':null,'pricelevel5_formatted':'$532.99','pagetitle':'Samsung Galaxy S4 i9505','includechildren':false,'storedetaileddescription':'','isonline':true,'storedisplaynamehtml':'<a href="/s.nl/it.A/id.52/.f">Samsung Galaxy S4 i9505</a>','parent':null,'residual':'','autopreferredstocklevel':null,'defaultitemshipmethod':null,'onlinematrixmaximumprice':null,'custitem_ns_pr_item_attributes':'&nbsp;','defaultreturncost':null,'immediatedownload':null,'isstorespecial':'F','storedisplaythumbnailhtml':'','onlinematrixpricerange':null,'specialsdescription':null,'preferredlocation':null,'onspecial':null,'currency':'US Dollar','relateditemsdescription3':'Related Items','storedisplayimage':'http://dev1.oloraqa.com/samsumg-gallaxy.jpg','matchbilltoreceipt':null,'relateditemsdescription2':'','seasonaldemand':null,'amortizationperiod':'','showdefaultdonationamount':false,'usebins':null,'itemshipmethod':null,'enforceminqtyinternally':true,'pricelevel':null,'custreturnvarianceaccount':null,'isavailable':'T','usemarginalrates':false,'reorderpoint':null,'projectexpensetype':null,'upccode':'samsumg-gallaxy','deferralaccount':'','purchaseunit':null,'vsoedeferral':null,'featureddescription':'','salesdescription':'Samsung Galaxy S4 i9505','vsoeprice':null,'averagecost':null,'locationid':null,'relateditemthumbnailhtml':'','saleunit':null,'description':null,'unitstype':null,'welcomedescription':'','pricelevel_formatted':null,'effectivebomcontrol':null,'dropshipexpenseaccount':null,'isspecialorderitem':false,'issueproduct':null,'shoppingdotcomcategory':'','vsoesopgroup':null,'cost':null,'defaultaddquantity':'1','billexchratevarianceacct':null,'storeurl':'http://dev1.oloraqa.com/s.nl/it.A/id.52/.f','lastpurchaseprice':null,'transferprice':null,'custitem_ns_pr_attributes_rating':'','weight':null,'unbuildvarianceaccount':null,'department':'','pricelevel1_formatted':'$532.99','amortizationtemplate':'','custitem2':'&nbsp;','custitem3':'&nbsp;','custitem1':'&nbsp;','shipindividually':false,'outofstockbehavior':'- Default -','storedisplayimagehtml':'<a href="/s.nl/it.A/id.52/.f"><img src="/samsumg-gallaxy.jpg?resizeid=-2&resizeh=240&resizew=240" border="0" alt="samsumg-gallaxy.jpeg" title="samsumg-gallaxy.jpeg"></a>','costestimatetype':null,'qtypricelevel5':null,'qtypricelevel3':null,'qtypricelevel4':null,'qtypricelevel1':null,'qtypricelevel2':null,'relateditemsdescription':'','pagetitle2':'Samsung Galaxy S4 i9505','storedisplaythumbnail':'','availabletopartners':false,'outofstockbehaviorcode':'DEFAULT','featureditemthumbnailhtml':'','shippackage':null,'onlinematrixpricerange_formatted':null,'pricelevel_1_formatted':null,'revrecschedule':null,'billingschedule':null,'billpricevarianceacct':null,'parentid':'','preferredstocklevel':null,'qtypricelevel-1':null,'defaultrevision':null,'autoreorderpoint':null,'city':null,'pricelevel4':532.99,'handlingcost':null,'pricelevel3':532.99,'cogsaccount':null,'pricelevel5':532.99,'excludefromsitemap':false,'undepfunds':null,'taxagency':null,'isdonationitem':'F','pricelevel2':532.99,'pricelevel1':532.99,'custitem_ns_pr_count':null,'costestimate':null,'weightunit':'','isspecialworkorderitem':null,'isdropshipitem':false,'createddate':'1/31/2014 6:18 am','overallquantitypricingtype':null,'custitem_ns_pr_rating':null,'vsoepermitdiscount':null,'county':null,'billqtyvarianceacct':null,'purchasedescription':'','quantitypricingschedule':null,'metataghtml':'','maxdonationamount':null,'incomeaccount':'Fees','isfulfillable':true,'includestartendlines':null,'istaxable':null,'itemcarrier':null,'preferredstockleveldays':null,'storedescription2':'Samsung Galaxy S4 i9505','storedisplayname2':'Samsung Galaxy S4 i9505','outofstockmessage2':' &nbsp;<b>(Out of Stock)</b>','shippingcost':null,'nopricemessage':'','countryofmanufacture':'','assetaccount':null,'printitems':null,'searchkeywords':'','storeitemtemplate':null,'customform':null,'vendor':null,'storedisplayname':'','pricelevel2_formatted':'$532.99','urlcomponent':'','account':null,'custitem_ns_pr_rating_by_rate':'','offersupport':null,'location':null,'stockdescription':'','safetystocklevel':null,'leadtime':null,'relateditemscategory':'','totalvalue':null,'canonicalurl':'http://dev1.oloraqa.com/s.nl/it.A/id.52/.f','isvsoebundle':null,'pricelevel4_formatted':'$532.99','outofstockmessage':'','storedescription':'','isinactive':false,'class':null,'createjob':null,'autoleadtime':null,'onlinematrixmaximumprice_formatted':null,'copydescription':false,'safetystockleveldays':null,'pricelevel3_formatted':'$532.99','manufacturer':'','dontshowprice':false,'pricinggroup':null,'matrixtype':'','qtypricelevel':null,'shopzillacategoryid':null,'expenseaccount':null,'ispretax':null,'daysbeforeexpiration':null,'demandmodifier':null,'isgcocompliant':'Yes','state':null,'itemid':'Samsung Galaxy S4 i9505','nextagcategory':'','usecomponentyield':null,'minimumquantity':null,'rate':null,'vendreturnvarianceaccount':null,'buildentireassembly':null,'taxaccount':null,'itemtype':'NonInvtPart','zip':null,'vsoedelivered':null,'stditemvendorcost_formatted':null,'costingmethod':null,'pricelevel_1':null,'externalid':'','taxschedule':'Tax schedule 1','numofalloweddownloads':null,'displayname':'Samsung Galaxy S4 i9505','liabilityaccount':null},'priority':{'id':'2','name':'medium'}}]}];

	// var MOKED_PRODUCTLISTITEM1 = {'internalid':'1','description':'','option':{},'quantity':1,'productList':{'id':'83'},'item':{'internalid':52},'priority':{'id':'2','name':'medium'},'itemDetails':{'internalid':52}};

	// var MOKED_PRODUCTLISTITEM2 = {'internalid':'2','description':'','option':{},'quantity':1,'productList':{'id':'83'},'item':{'internalid':53, 'minimumquantity':3},'priority':{'id':'2','name':'medium'},'itemDetails':{'internalid':53, 'minimumquantity':3}};

	// var MOKED_PRODUCTLISTITEM3 = {'internalid':'3','description':'','option':{},'quantity':1,'productList':{'id':'83'},'item':{'internalid':54, 'minimumquantity':1},'priority':{'id':'2','name':'medium'},'itemDetails':{'internalid':54, 'minimumquantity':1}};

	// describe('ProductList.Model', function () {

	// 	var model = null;

	// 	beforeEach(function () {
	// 		model = new ProductListModel(MOKED_PRODUCTLIST1);
	// 	});

	// 	it('initialize "items" attribute', function () {
	// 		expect(model.get('items')).toBeA(ProductListItemCollection);
	// 		expect(model.get('items').length).toBe(0);
	// 	});

	// 	it('new instances should have default values', function () {
	// 		var model2 = new ProductListModel();
	// 		expect(model2.get('items')).toBeA(ProductListItemCollection);
	// 		expect(model2.get('items').length).toBe(0);
	// 		expect(model2.get('scope').name).toBe('private');
	// 	});

	// 	it('"url" method returns a url pointing to the right service and pass the "customerid" parameter', function () {
	// 		expect(model.url).toBeA(Function);
	// 		expect(model.url()).toContain('services/ProductList.Service.ss'); 
	// 	});

	// 	it('"checked" method returns true only if the list contains given product', function () {
	// 		expect(model.checked(52, '')).toBe(false);
	// 		model.set('items', new ProductListItemCollection([MOKED_PRODUCTLISTITEM1]));
	// 		expect(model.checked(52, '')).toBe(true);
	// 		expect(model.checked(51, '')).toBe(false);
	// 	});

	// 	it('"getNotPurchasableItemsDueToMinimumQuantity" method returns the items which cannot be purchased due to minimum quantity', function () {
	// 		model.set('items', new ProductListItemCollection([MOKED_PRODUCTLISTITEM1, MOKED_PRODUCTLISTITEM2, MOKED_PRODUCTLISTITEM3]));
	// 		expect(model.getNotPurchasableItemsDueToMinimumQuantity().length > 0).toBe(true);
	// 	});

	// 	it('"getNotPurchasableItemsDueToMinimumQuantity" method does not return MOKED_PRODUCTLISTITEM1 and MOKED_PRODUCTLISTITEM3 product list items', function () {
	// 		model.set('items', new ProductListItemCollection([MOKED_PRODUCTLISTITEM1, MOKED_PRODUCTLISTITEM2, MOKED_PRODUCTLISTITEM3]));
			
	// 		var result_collection = model.getNotPurchasableItemsDueToMinimumQuantity();
					
	// 		expect(result_collection.length).toBe(1);
	// 		expect(result_collection[0].get('internalid')).toBe('2');
	// 	});
	// });


	// describe('ProductList.Collection', function () {

	// 	var collection = null;

	// 	beforeEach(function () {
	// 		collection = new ProductListCollection(MOCKED_PRODUCTLISTCOLLECTION1);
	// 	});

	// 	it('"url" attribute points to the right service and pass the "customerid" parameter', function () {
	// 		expect(collection.url).toContain('services/ProductList.Service.ss');
	// 	});

	// 	it('"filtered" returns a ProductList.Collection collection filtered by a filter function', function ()
	// 	{

	// 		var filter_function = function (model)
	// 		{
	// 			return model.get('internalid') !== '86' &&
	// 				!model.get('items').find(function (product_item)
	// 				{
	// 					return product_item.get('item').internalid === '54';
	// 				});
	// 		};

	// 		var result_collection = collection.filtered(filter_function);

	// 		expect(result_collection.size()).toBe(1);
	// 		expect(result_collection instanceof ProductListCollection).toBeTruthy();
	// 	});

	// });

	// describe('ProductList.Item.Model', function () {

	// 	var model = null;

	// 	beforeEach(function () {
	// 		model = new ProductListItemModel(MOKED_PRODUCTLISTITEM1);
	// 	});

	// 	it('initialization with defaults', function () {
	// 		var model2 = new ProductListItemModel({});

	// 		expect(model2.get('priority').name).toBe('medium');
	// 	});

	// 	it('initialization should populate the attribute "itemDetails"', function () {
	// 		expect(model.get('itemDetails')).toBeA(ItemModel);
	// 	});

	// 	it('url points to the right service', function () {
	// 		expect(model.url()).toContain('services/ProductList.Item.Service.ss');
	// 	});

	// 	it('Model complies with minimum quantity requirements. (minimumquantity not defined)', function () {
	// 		var model1 = new ProductListItemModel(MOKED_PRODUCTLISTITEM1);

	// 		expect(model1.fulfillsMinimumQuantityRequirement()).toBe(true);
	// 	});

	// 	it('Model does not comply with minimum quantity requirements. (minimumquantity > quantity)', function () {
	// 		var model2 = new ProductListItemModel(MOKED_PRODUCTLISTITEM2);

	// 		expect(model2.fulfillsMinimumQuantityRequirement()).toBe(false);
	// 	});

	// 	it('Model complies with minimum quantity requirements. (minimumquantity <= quantity)', function () {
	// 		var model3 = new ProductListItemModel(MOKED_PRODUCTLISTITEM3);
			
	// 		expect(model3.fulfillsMinimumQuantityRequirement()).toBe(true);
	// 	});

	// 	it('getItemForCart: valid ItemDetails.Model should be returned', function ()
	// 	{
	// 		var model4 = new ProductListItemModel();

	// 		var internalid = 10
	// 		,	quantity = 20
	// 		,	options_details = []
	// 		,	options = [];

	// 		var item_detail = model4.getItemForCart(internalid, quantity, options_details, options);

	// 		expect(item_detail).toBeDefined();
	// 		expect(item_detail instanceof ItemModel).toBeTruthy();
	// 		expect(item_detail.get('internalid')).toBe(10);
	// 		expect(item_detail.get('quantity')).toBe(20);
	// 		expect(item_detail.get('options').length).toBe(0);
	// 	});
	// });
});