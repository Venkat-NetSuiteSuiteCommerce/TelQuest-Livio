/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTest.CreditMemo.TestCasesData', function(){

	'use strict';

	return 	{
			view:
			{
					'with item, invoice, remaining amount and without memo': {'internalid':'401','tranid':'1','subtotal':300,'subtotal_formatted':'$300.00','discount':0,'discount_formatted':'$0.00','taxtotal':0,'taxtotal_formatted':'$0.00','shippingcost':32.68,'shippingcost_formatted':'$32.68','total':332.68,'total_formatted':'$332.68','amountpaid':1,'amountpaid_formatted':'$1.00','amountremaining':331.68,'amountremaining_formatted':'$331.68','trandate':'3/14/2014','status':'Open','memo':null,'invoices':[{'line':1,'internalid':'361','type':'Invoice','total':555,'total_formatted':'$555.00','apply':true,'applydate':'12/5/2013','currency':'US Dollar','amount':1,'amount_formatted':'$1.00','due':1,'due_formatted':'$1.00','refnum':'1'}],'items':[{'internalid':'13','id':'13','type':'InvtPart','quantity':'20','unitprice':15,'unitprice_formatted':'$15.00','total':300,'total_formatted':'$300.00','displayname':'','storedisplayname':'','itemid':'Ununoctio'}]}
				,	'with items, without invoices and memo': {'internalid':'695','tranid':'5','subtotal':42280,'subtotal_formatted':'$42,280.00','discount':0,'discount_formatted':'$0.00','taxtotal':0,'taxtotal_formatted':'$0.00','shippingcost':0,'shippingcost_formatted':'$0.00','total':42280,'total_formatted':'$42,280.00','amountpaid':0,'amountpaid_formatted':'$0.00','amountremaining':42280,'amountremaining_formatted':'$42,280.00','trandate':'7/24/2014','status':'Open','memo':null,'invoices':[],'items':[{'internalid':'11','id':'11','type':'InvtPart','quantity':'1000000','unitprice':0,'unitprice_formatted':'$0.00','total':0,'total_formatted':'$0.00','displayname':'','storedisplayname':'','itemid':'Argón'},{'internalid':'5','id':'5','type':'InvtPart','quantity':'1','unitprice':565,'unitprice_formatted':'$565.00','total':565,'total_formatted':'$565.00','displayname':'Lupa','storedisplayname':'','itemid':'Lupa'},{'internalid':29,'id':'29','type':'InvtPart','quantity':'1','unitprice':600,'unitprice_formatted':'$600.00','total':600,'total_formatted':'$600.00','ispurchasable':true,'showoutofstockmessage':false,'stockdescription':'','itemid':'Berilio','pricelevel1_formatted':'$600.00','onlinecustomerprice':600,'minimumquantity':null,'storedisplayname2':'Berilio','itemimages_detail':{},'pricelevel1':600,'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$600.00','onlinecustomerprice':600},'itemtype':'InvtPart','outofstockmessage':'No More Berilio!','isonline':true,'itemoptions_detail':{'fields':[{'values':[{'label':''},{'label':'Argón','internalid':'11'}],'label':'Extra Option','internalid':'custcol_item','type':'select'}]},'isinactive':false,'isinstock':true,'isbackorderable':true,'urlcomponent':'Berilio','displayname':'Berilio'},{'internalid':'14','id':'14','type':'InvtPart','quantity':'2741','unitprice':15,'unitprice_formatted':'$15.00','total':41115,'total_formatted':'$41,115.00','displayname':'','storedisplayname':'','itemid':'Fúor'}]}
				,	'with items and memo, without invoices': {'internalid':'454','tranid':'2','subtotal':1000,'subtotal_formatted':'$1,000.00','discount':0,'discount_formatted':'$0.00','taxtotal':0,'taxtotal_formatted':'$0.00','shippingcost':32.68,'shippingcost_formatted':'$32.68','total':1032.68,'total_formatted':'$1,032.68','amountpaid':0,'amountpaid_formatted':'$0.00','amountremaining':1032.68,'amountremaining_formatted':'$1,032.68','trandate':'5/6/2014','status':'Open','memo':'The One','invoices':[],'items':[{'internalid':'28','id':'28','type':'InvtPart','quantity':'2','unitprice':200,'unitprice_formatted':'$200.00','total':400,'total_formatted':'$400.00','displayname':'Uranio','storedisplayname':'Uranio','itemid':'Uranio'},{'internalid':29,'id':'29','type':'InvtPart','quantity':'1','unitprice':600,'unitprice_formatted':'$600.00','total':600,'total_formatted':'$600.00','ispurchasable':true,'showoutofstockmessage':false,'stockdescription':'','itemid':'Berilio','pricelevel1_formatted':'$600.00','onlinecustomerprice':600,'minimumquantity':null,'storedisplayname2':'Berilio','itemimages_detail':{},'pricelevel1':600,'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$600.00','onlinecustomerprice':600},'itemtype':'InvtPart','outofstockmessage':'No More Berilio!','isonline':true,'itemoptions_detail':{'fields':[{'values':[{'label':''},{'label':'Argón','internalid':'11'}],'label':'Extra Option','internalid':'custcol_item','type':'select'}]},'isinactive':false,'isinstock':true,'isbackorderable':true,'urlcomponent':'Berilio','displayname':'Berilio'}]}
			}
		,	model:
			{
					'model empty':{
						data: { }
					,	result: {
							invalidFields: []
						}
					}
				,	'amount without incorrect format': {
						data: { amount: '$100',	remaining: 200, orderTotal: 300 }
					,	result: {
							invalidFields: []
						}
					}
				,	'amount with correct format': {
						data: { amount: 100, remaining: 200, orderTotal: 300 }
					,	result: {
							validFields: ['amount']
						}
					}
				,	'total = amount < remaining': {
						data: { amount: 200, remaining: 300, orderTotal: 200 }
					,	result: {
							validFields: ['amount']
						}
					}
				,	'total > amount < remaining': {
						data: { amount: 100, remaining: 100, orderTotal: 300 }
					,	result: {
							validFields: ['amount']
						}
					}
				,	'total = amount = remaining': {
						data: { amount: 300, remaining: 300, orderTotal: 300 }
					,	result: {
							validFields: ['amount']
						}
					}
				,	'total > amount = remaining': {
						data: { amount: 100, remaining: 100, orderTotal: 300 }
					,	result: {
							validFields: ['amount']
						}
					}
			}
		,	environment: {siteSettings: {siteid: 1}}
		};

});

