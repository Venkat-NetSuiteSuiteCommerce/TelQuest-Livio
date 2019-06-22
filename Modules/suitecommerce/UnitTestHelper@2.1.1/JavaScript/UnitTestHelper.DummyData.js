/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTestHelper.DummyData', function()
{
	'use strict';

	return {LiveOrderModel: {
			withConfirmation:{
			   'summary': {
				  'total': 2461,
				  'taxtotal': 0,
				  'taxondiscount': 0,
				  'discountrate_formatted': '',
				  'subtotal_formatted': '$1,400.00',
				  'discounttotal': 0,
				  'tax2total_formatted': '$0.00',
				  'discountrate': '',
				  'shippingcost_formatted': '$921.00',
				  'taxonshipping': 0,
				  'discountedsubtotal_formatted': '$1,400.00',
				  'handlingcost': 140,
				  'tax2total': 0,
				  'giftcertapplied_formatted': '($0.00)',
				  'taxonshipping_formatted': '$0.00',
				  'shippingcost': 921,
				  'taxtotal_formatted': '$0.00',
				  'giftcertapplied': 0,
				  'discountedsubtotal': 1400,
				  'taxonhandling': 0,
				  'discounttotal_formatted': '($0.00)',
				  'handlingcost_formatted': '$140.00',
				  'subtotal': 1400,
				  'taxondiscount_formatted': '$0.00',
				  'estimatedshipping_formatted': '$921.00',
				  'total_formatted': '$2,461.00',
				  'taxonhandling_formatted': '$0.00',
				  'estimatedshipping': 921
			   },
			   'lines': [
				  {
					 'internalid': 'item30set2087',
					 'quantity': 1,
					 'rate': 1000,
					 'amount': 1000,
					 'tax_amount': 0,
					 'tax_rate': null,
					 'tax_code': null,
					 'discount': 0,
					 'total': 1000,
					 'item': {
						'ispurchasable': true,
						'itemtype': 'InvtPart',
						'outofstockmessage': '',
						'showoutofstockmessage': false,
						'isonline': true,
						'itemoptions_detail': {
						   'fields': [
							  {
								 'values': [
									{
									   'label': ''
									},
									{
									   'label': 'Argón',
									   'internalid': '11'
									}
								 ],
								 'label': 'Extra Option',
								 'internalid': 'custcol_item',
								 'type': 'select'
							  }
						   ]
						},
						'stockdescription': 'A lot of Plutonio',
						'isinactive': false,
						'isinstock': true,
						'itemid': 'Plutonio',
						'onlinecustomerprice': 1000,
						'isbackorderable': true,
						'minimumquantity': 1,
						'urlcomponent': 'plutonio',
						'storedisplayname2': 'Plutonio',
						'internalid': 30,
						'itemimages_detail': {},
						'displayname': 'Plutonio'
					 },
					 'itemtype': 'InvtPart',
					 'isshippable': true,
					 'options': null,
					 'shipaddress': null,
					 'rate_formatted': '$1,000.00',
					 'amount_formatted': '$1,000.00',
					 'tax_amount_formatted': '$0.00',
					 'discount_formatted': '$0.00',
					 'total_formatted': '$1,000.00'
				  },
				  {
					 'internalid': 'item28set2086',
					 'quantity': 2,
					 'rate': 200,
					 'amount': 400,
					 'tax_amount': 0,
					 'tax_rate': null,
					 'tax_code': null,
					 'discount': 0,
					 'total': 400,
					 'item': {
						'ispurchasable': true,
						'itemtype': 'InvtPart',
						'outofstockmessage': '',
						'showoutofstockmessage': false,
						'isonline': true,
						'itemoptions_detail': {
						   'fields': [
							  {
								 'values': [
									{
									   'label': ''
									},
									{
									   'label': 'Argón',
									   'internalid': '11'
									}
								 ],
								 'label': 'Extra Option',
								 'internalid': 'custcol_item',
								 'type': 'select'
							  }
						   ]
						},
						'stockdescription': 'Buy it all',
						'isinactive': false,
						'isinstock': true,
						'itemid': 'Uranio',
						'onlinecustomerprice': 200,
						'isbackorderable': true,
						'minimumquantity': 2,
						'urlcomponent': 'uranio',
						'storedisplayname2': 'Uranio',
						'internalid': 28,
						'itemimages_detail': {},
						'displayname': 'Uranio'
					 },
					 'itemtype': 'InvtPart',
					 'isshippable' : true,
					 'options': null,
					 'shipaddress': null,
					 'rate_formatted': '$200.00',
					 'amount_formatted': '$400.00',
					 'tax_amount_formatted': '$0.00',
					 'discount_formatted': '$0.00',
					 'total_formatted': '$400.00'
				  }
			   ],
			   'lines_sort': [
				  'item30set2087',
				  'item28set2086'
			   ],
			   'latest_addition': null,
			   'promocode': null,
			   'ismultishipto': false,
			   'shipmethods': [
				  {
					 'internalid': '2',
					 'name': 'Airborne - Canada',
					 'shipcarrier': 'nonups',
					 'rate': 145,
					 'rate_formatted': '$145.00'
				  },
				  {
					 'internalid': '3',
					 'name': 'FedEx - to World',
					 'shipcarrier': 'nonups',
					 'rate': 32.68,
					 'rate_formatted': '$32.68'
				  },
				  {
					 'internalid': '4',
					 'name': 'UPS - Not Uruguay',
					 'shipcarrier': 'nonups',
					 'rate': 0,
					 'rate_formatted': 'Free!'
				  },
				  {
					 'internalid': '6',
					 'name': 'Uruguay Only',
					 'shipcarrier': 'nonups',
					 'rate': 1,
					 'rate_formatted': '$1,061.00'
				  }
			   ],
			   'shipmethod': '6',
			   'paymentmethods': [],
			   'isPaypalComplete': false,
			   'agreetermcondition': false,
			   'addresses': [
				  {
					 'zip': '14618',
					 'phone': '(658) 900-7766',
					 'defaultshipping': 'F',
					 'state': 'VT',
					 'isresidential': 'F',
					 'isvalid': 'T',
					 'city': 'madison',
					 'country': 'US',
					 'addr1': '8908 costume st',
					 'addr2': '',
					 'addr3': '',
					 'defaultbilling': 'T',
					 'internalid': '1312',
					 'id': '1312',
					 'fullname': 'Main Billing',
					 'company': null
				  }
			   ],
			   'shipaddress': '-------null',
			   'billaddress': '1312',
			   'shipmentsorder': [],
			   'touchpoints': {
				  'register': '/c.3563497/checkout/login.ssp?n=4&sc=6&login=T&reset=T&newcust=T',
				  'home': 'http://dev11.oloraqa.com?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'logout': '/c.3563497/ShopFlow/logOut.ssp?n=4&sc=17&logoff=T&ckabandon=rBRmKXzgAfeIReQ4',
				  'viewcart': 'http://dev11.oloraqa.com/ShopFlow/goToCart.ssp?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'continueshopping': 'http://dev11.oloraqa.com/?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'serversync': 'http://dev11.oloraqa.com/app/site/backend/syncidentity.nl?c=3563497&n=4&ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&chrole=14',
				  'login': '/c.3563497/checkout/login.ssp?n=4&sc=6&login=T',
				  'welcome': 'http://dev11.oloraqa.com/s.nl?sc=15&ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'checkout': '/c.3563497/checkout/index-local.ssp?n=4&sc=17',
				  'customercenter': 'https://checkout.netsuite.com/c.3563497/MyAccount/index.ssp?n=4&sc=6'
			   },
			   'options': {
				  'custbody_quantity': '',
				  'custbody_andres': ''
			   },
				'confirmation': {'confirmationnumber':'2717-416', 'internalid':605, 'reasoncode':null, 'statuscode':'success'}
			}
		,	twoItems: {
			   'summary': {
				  'total': 2461,
				  'taxtotal': 0,
				  'taxondiscount': 0,
				  'discountrate_formatted': '',
				  'subtotal_formatted': '$1,400.00',
				  'discounttotal': 0,
				  'tax2total_formatted': '$0.00',
				  'discountrate': '',
				  'shippingcost_formatted': '$921.00',
				  'taxonshipping': 0,
				  'discountedsubtotal_formatted': '$1,400.00',
				  'handlingcost': 140,
				  'tax2total': 0,
				  'giftcertapplied_formatted': '($0.00)',
				  'taxonshipping_formatted': '$0.00',
				  'shippingcost': 921,
				  'taxtotal_formatted': '$0.00',
				  'giftcertapplied': 0,
				  'discountedsubtotal': 1400,
				  'taxonhandling': 0,
				  'discounttotal_formatted': '($0.00)',
				  'handlingcost_formatted': '$140.00',
				  'subtotal': 1400,
				  'taxondiscount_formatted': '$0.00',
				  'estimatedshipping_formatted': '$921.00',
				  'total_formatted': '$2,461.00',
				  'taxonhandling_formatted': '$0.00',
				  'estimatedshipping': 921
			   },
			   'lines': [
				  {
					 'internalid': 'item30set2087',
					 'quantity': 1,
					 'rate': 1000,
					 'amount': 1000,
					 'tax_amount': 0,
					 'tax_rate': null,
					 'tax_code': null,
					 'discount': 0,
					 'total': 1000,
					 'item': {
						'ispurchasable': true,
						'itemtype': 'InvtPart',
						'outofstockmessage': '',
						'showoutofstockmessage': false,
						'isonline': true,
						'itemoptions_detail': {
						   'fields': [
							  {
								 'values': [
									{
									   'label': ''
									},
									{
									   'label': 'Argón',
									   'internalid': '11'
									}
								 ],
								 'label': 'Extra Option',
								 'internalid': 'custcol_item',
								 'type': 'select'
							  }
						   ]
						},
						'stockdescription': 'A lot of Plutonio',
						'isinactive': false,
						'isinstock': true,
						'itemid': 'Plutonio',
						'onlinecustomerprice': 1000,
						'isbackorderable': true,
						'minimumquantity': 1,
						'urlcomponent': 'plutonio',
						'storedisplayname2': 'Plutonio',
						'internalid': 30,
						'itemimages_detail': {},
						'displayname': 'Plutonio'
					 },
					 'itemtype': 'InvtPart',
					 'isshippable': true,
					 'options': null,
					 'shipaddress': null,
					 'rate_formatted': '$1,000.00',
					 'amount_formatted': '$1,000.00',
					 'tax_amount_formatted': '$0.00',
					 'discount_formatted': '$0.00',
					 'total_formatted': '$1,000.00'
				  },
				  {
					 'internalid': 'item28set2086',
					 'quantity': 2,
					 'rate': 200,
					 'amount': 400,
					 'tax_amount': 0,
					 'tax_rate': null,
					 'tax_code': null,
					 'discount': 0,
					 'total': 400,
					 'item': {
						'ispurchasable': true,
						'itemtype': 'InvtPart',
						'outofstockmessage': '',
						'showoutofstockmessage': false,
						'isonline': true,
						'itemoptions_detail': {
						   'fields': [
							  {
								 'values': [
									{
									   'label': ''
									},
									{
									   'label': 'Argón',
									   'internalid': '11'
									}
								 ],
								 'label': 'Extra Option',
								 'internalid': 'custcol_item',
								 'type': 'select'
							  }
						   ]
						},
						'stockdescription': 'Buy it all',
						'isinactive': false,
						'isinstock': true,
						'itemid': 'Uranio',
						'onlinecustomerprice': 200,
						'isbackorderable': true,
						'minimumquantity': 2,
						'urlcomponent': 'uranio',
						'storedisplayname2': 'Uranio',
						'internalid': 28,
						'itemimages_detail': {},
						'displayname': 'Uranio'
					 },
					 'itemtype': 'InvtPart',
					 'isshippable' : true,
					 'options': null,
					 'shipaddress': null,
					 'rate_formatted': '$200.00',
					 'amount_formatted': '$400.00',
					 'tax_amount_formatted': '$0.00',
					 'discount_formatted': '$0.00',
					 'total_formatted': '$400.00'
				  }
			   ],
			   'lines_sort': [
				  'item30set2087',
				  'item28set2086'
			   ],
			   'latest_addition': null,
			   'promocode': null,
			   'ismultishipto': false,
			   'shipmethods': [
				  {
					 'internalid': '2',
					 'name': 'Airborne - Canada',
					 'shipcarrier': 'nonups',
					 'rate': 145,
					 'rate_formatted': '$145.00'
				  },
				  {
					 'internalid': '3',
					 'name': 'FedEx - to World',
					 'shipcarrier': 'nonups',
					 'rate': 32.68,
					 'rate_formatted': '$32.68'
				  },
				  {
					 'internalid': '4',
					 'name': 'UPS - Not Uruguay',
					 'shipcarrier': 'nonups',
					 'rate': 0,
					 'rate_formatted': 'Free!'
				  },
				  {
					 'internalid': '6',
					 'name': 'Uruguay Only',
					 'shipcarrier': 'nonups',
					 'rate': 1,
					 'rate_formatted': '$1,061.00'
				  }
			   ],
			   'shipmethod': '6',
			   'paymentmethods': [],
			   'isPaypalComplete': false,
			   'agreetermcondition': false,
			   'addresses': [
				  {
					 'zip': '14618',
					 'phone': '(658) 900-7766',
					 'defaultshipping': 'F',
					 'state': 'VT',
					 'isresidential': 'F',
					 'isvalid': 'T',
					 'city': 'madison',
					 'country': 'US',
					 'addr1': '8908 costume st',
					 'addr2': '',
					 'addr3': '',
					 'defaultbilling': 'T',
					 'internalid': '1312',
					 'id': '1312',
					 'fullname': 'Main Billing',
					 'company': null
				  }
			   ],
			   'shipaddress': '-------null',
			   'billaddress': '1312',
			   'shipmentsorder': [],
			   'touchpoints': {
				  'register': '/c.3563497/checkout/login.ssp?n=4&sc=6&login=T&reset=T&newcust=T',
				  'home': 'http://dev11.oloraqa.com?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'logout': '/c.3563497/ShopFlow/logOut.ssp?n=4&sc=17&logoff=T&ckabandon=rBRmKXzgAfeIReQ4',
				  'viewcart': 'http://dev11.oloraqa.com/ShopFlow/goToCart.ssp?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'continueshopping': 'http://dev11.oloraqa.com/?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'serversync': 'http://dev11.oloraqa.com/app/site/backend/syncidentity.nl?c=3563497&n=4&ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&chrole=14',
				  'login': '/c.3563497/checkout/login.ssp?n=4&sc=6&login=T',
				  'welcome': 'http://dev11.oloraqa.com/s.nl?sc=15&ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'checkout': '/c.3563497/checkout/index-local.ssp?n=4&sc=17',
				  'customercenter': 'https://checkout.netsuite.com/c.3563497/MyAccount/index.ssp?n=4&sc=6'
			   },
			   'options': {
				  'custbody_quantity': '',
				  'custbody_andres': ''
			   }
			}
		,	twoItemsWithOneShippable: {
			   'summary': {
				  'total': 2461,
				  'taxtotal': 0,
				  'taxondiscount': 0,
				  'discountrate_formatted': '',
				  'subtotal_formatted': '$1,400.00',
				  'discounttotal': 0,
				  'tax2total_formatted': '$0.00',
				  'discountrate': '',
				  'shippingcost_formatted': '$921.00',
				  'taxonshipping': 0,
				  'discountedsubtotal_formatted': '$1,400.00',
				  'handlingcost': 140,
				  'tax2total': 0,
				  'giftcertapplied_formatted': '($0.00)',
				  'taxonshipping_formatted': '$0.00',
				  'shippingcost': 921,
				  'taxtotal_formatted': '$0.00',
				  'giftcertapplied': 0,
				  'discountedsubtotal': 1400,
				  'taxonhandling': 0,
				  'discounttotal_formatted': '($0.00)',
				  'handlingcost_formatted': '$140.00',
				  'subtotal': 1400,
				  'taxondiscount_formatted': '$0.00',
				  'estimatedshipping_formatted': '$921.00',
				  'total_formatted': '$2,461.00',
				  'taxonhandling_formatted': '$0.00',
				  'estimatedshipping': 921
			   },
			   'lines': [
				  {
					 'internalid': 'item30set2087',
					 'quantity': 1,
					 'rate': 1000,
					 'amount': 1000,
					 'tax_amount': 0,
					 'tax_rate': null,
					 'tax_code': null,
					 'discount': 0,
					 'total': 1000,
					 'item': {
						'ispurchasable': true,
						'itemtype': 'InvtPart',
						'outofstockmessage': '',
						'showoutofstockmessage': false,
						'isonline': true,
						'itemoptions_detail': {
						   'fields': [
							  {
								 'values': [
									{
									   'label': ''
									},
									{
									   'label': 'Argón',
									   'internalid': '11'
									}
								 ],
								 'label': 'Extra Option',
								 'internalid': 'custcol_item',
								 'type': 'select'
							  }
						   ]
						},
						'stockdescription': 'A lot of Plutonio',
						'isinactive': false,
						'isinstock': true,
						'itemid': 'Plutonio',
						'onlinecustomerprice': 1000,
						'isbackorderable': true,
						'minimumquantity': 1,
						'urlcomponent': 'plutonio',
						'storedisplayname2': 'Plutonio',
						'internalid': 30,
						'itemimages_detail': {},
						'displayname': 'Plutonio'
					 },
					 'itemtype': 'InvtPart',
					 'isshippable': true,
					 'options': null,
					 'shipaddress': null,
					 'rate_formatted': '$1,000.00',
					 'amount_formatted': '$1,000.00',
					 'tax_amount_formatted': '$0.00',
					 'discount_formatted': '$0.00',
					 'total_formatted': '$1,000.00'
				  },
				  {
					 'internalid': 'item28set2086',
					 'quantity': 2,
					 'rate': 200,
					 'amount': 400,
					 'tax_amount': 0,
					 'tax_rate': null,
					 'tax_code': null,
					 'discount': 0,
					 'total': 400,
					 'item': {
						'ispurchasable': true,
						'itemtype': 'InvtPart',
						'outofstockmessage': '',
						'showoutofstockmessage': false,
						'isonline': true,
						'itemoptions_detail': {
						   'fields': [
							  {
								 'values': [
									{
									   'label': ''
									},
									{
									   'label': 'Argón',
									   'internalid': '11'
									}
								 ],
								 'label': 'Extra Option',
								 'internalid': 'custcol_item',
								 'type': 'select'
							  }
						   ]
						},
						'stockdescription': 'Buy it all',
						'isinactive': false,
						'isinstock': true,
						'itemid': 'Uranio',
						'onlinecustomerprice': 200,
						'isbackorderable': true,
						'minimumquantity': 2,
						'urlcomponent': 'uranio',
						'storedisplayname2': 'Uranio',
						'internalid': 28,
						'itemimages_detail': {},
						'displayname': 'Uranio'
					 },
					 'itemtype': 'InvtPart',
					 'isshippable' : false,
					 'options': null,
					 'shipaddress': null,
					 'rate_formatted': '$200.00',
					 'amount_formatted': '$400.00',
					 'tax_amount_formatted': '$0.00',
					 'discount_formatted': '$0.00',
					 'total_formatted': '$400.00'
				  }
			   ],
			   'lines_sort': [
				  'item30set2087',
				  'item28set2086'
			   ],
			   'latest_addition': null,
			   'promocode': null,
			   'ismultishipto': true,
			   'shipmethods': [
				  {
					 'internalid': '2',
					 'name': 'Airborne - Canada',
					 'shipcarrier': 'nonups',
					 'rate': 145,
					 'rate_formatted': '$145.00'
				  },
				  {
					 'internalid': '3',
					 'name': 'FedEx - to World',
					 'shipcarrier': 'nonups',
					 'rate': 32.68,
					 'rate_formatted': '$32.68'
				  },
				  {
					 'internalid': '4',
					 'name': 'UPS - Not Uruguay',
					 'shipcarrier': 'nonups',
					 'rate': 0,
					 'rate_formatted': 'Free!'
				  },
				  {
					 'internalid': '6',
					 'name': 'Uruguay Only',
					 'shipcarrier': 'nonups',
					 'rate': 1,
					 'rate_formatted': '$1,061.00'
				  }
			   ],
			   'shipmethod': '6',
			   'paymentmethods': [],
			   'isPaypalComplete': false,
			   'agreetermcondition': false,
			   'addresses': [
				  {
					 'zip': '14618',
					 'phone': '(658) 900-7766',
					 'defaultshipping': 'F',
					 'state': 'VT',
					 'isresidential': 'F',
					 'isvalid': 'T',
					 'city': 'madison',
					 'country': 'US',
					 'addr1': '8908 costume st',
					 'addr2': '',
					 'addr3': '',
					 'defaultbilling': 'T',
					 'internalid': '1312',
					 'id': '1312',
					 'fullname': 'Main Billing',
					 'company': null
				  }
			   ],
			   'shipaddress': '-------null',
			   'billaddress': '1312',
			   'shipmentsorder': [],
			   'touchpoints': {
				  'register': '/c.3563497/checkout/login.ssp?n=4&sc=6&login=T&reset=T&newcust=T',
				  'home': 'http://dev11.oloraqa.com?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'logout': '/c.3563497/ShopFlow/logOut.ssp?n=4&sc=17&logoff=T&ckabandon=rBRmKXzgAfeIReQ4',
				  'viewcart': 'http://dev11.oloraqa.com/ShopFlow/goToCart.ssp?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'continueshopping': 'http://dev11.oloraqa.com/?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'serversync': 'http://dev11.oloraqa.com/app/site/backend/syncidentity.nl?c=3563497&n=4&ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&chrole=14',
				  'login': '/c.3563497/checkout/login.ssp?n=4&sc=6&login=T',
				  'welcome': 'http://dev11.oloraqa.com/s.nl?sc=15&ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123007&cart=2663&gc=clear&chrole=14',
				  'checkout': '/c.3563497/checkout/index-local.ssp?n=4&sc=17',
				  'customercenter': 'https://checkout.netsuite.com/c.3563497/MyAccount/index.ssp?n=4&sc=6'
			   },
			   'options': {
				  'custbody_quantity': '',
				  'custbody_andres': ''
			   }
			}
		,	twoItemsWithMultiShipToShipmethods :
			{
				'summary': {
					'total': 1400,
					'taxtotal': 0,
					'taxondiscount': 0,
					'discountrate_formatted': '',
					'subtotal_formatted': '$1,400.00',
					'discounttotal': 0,
					'tax2total_formatted': '$0.00',
					'discountrate': '',
					'shippingcost_formatted': '$0.00',
					'taxonshipping': 0,
					'discountedsubtotal_formatted': '$1,400.00',
					'handlingcost': 0,
					'tax2total': 0,
					'giftcertapplied_formatted': '($0.00)',
					'taxonshipping_formatted': '$0.00',
					'shippingcost': 0,
					'taxtotal_formatted': '$0.00',
					'giftcertapplied': 0,
					'discountedsubtotal': 1400,
					'taxonhandling': 0,
					'discounttotal_formatted': '($0.00)',
					'handlingcost_formatted': '$0.00',
					'subtotal': 1400,
					'taxondiscount_formatted': '$0.00',
					'estimatedshipping_formatted': '$0.00',
					'total_formatted': '$1,400.00',
					'taxonhandling_formatted': '$0.00',
					'estimatedshipping': 0
				},
				'lines': [{
					'internalid': 'item30set2087',
					'quantity': 1,
					'rate': 1000,
					'amount': 1000,
					'tax_amount': 0,
					'tax_rate': null,
					'tax_code': null,
					'discount': 0,
					'total': 1000,
					'item': {
						'ispurchasable': true,
						'itemtype': 'InvtPart',
						'outofstockmessage': '',
						'showoutofstockmessage': false,
						'isonline': true,
						'itemoptions_detail': {
							'fields': [{
								'values': [{
									'label': ''
								},
								{
									'label': 'Argón',
									'internalid': '11'
								}],
								'label': 'Extra Option',
								'internalid': 'custcol_item',
								'type': 'select'
							}]
						},
						'stockdescription': 'A lot of Plutonio',
						'isinactive': false,
						'isinstock': true,
						'itemid': 'Plutonio',
						'onlinecustomerprice': 1000,
						'isbackorderable': true,
						'minimumquantity': 1,
						'urlcomponent': 'plutonio',
						'storedisplayname2': 'Plutonio',
						'internalid': 30,
						'itemimages_detail': {

						},
						'displayname': 'Plutonio'
					},
					'itemtype': 'InvtPart',
					'isshippable' : true,
					'options': null,
					'shipaddress': '1309',
					'shipmethod': '',
					'rate_formatted': '$1,000.00',
					'amount_formatted': '$1,000.00',
					'tax_amount_formatted': '$0.00',
					'discount_formatted': '$0.00',
					'total_formatted': '$1,000.00'
				},
				{
					'internalid': 'item28set2086',
					'quantity': 2,
					'rate': 200,
					'amount': 400,
					'tax_amount': 0,
					'tax_rate': null,
					'tax_code': null,
					'discount': 0,
					'total': 400,
					'item': {
						'ispurchasable': true,
						'itemtype': 'InvtPart',
						'outofstockmessage': '',
						'showoutofstockmessage': false,
						'isonline': true,
						'itemoptions_detail': {
							'fields': [{
								'values': [{
									'label': ''
								},
								{
									'label': 'Argón',
									'internalid': '11'
								}],
								'label': 'Extra Option',
								'internalid': 'custcol_item',
								'type': 'select'
							}]
						},
						'stockdescription': 'Buy it all',
						'isinactive': false,
						'isinstock': true,
						'itemid': 'Uranio',
						'onlinecustomerprice': 200,
						'isbackorderable': true,
						'minimumquantity': 2,
						'urlcomponent': 'uranio',
						'storedisplayname2': 'Uranio',
						'internalid': 28,
						'itemimages_detail': {

						},
						'displayname': 'Uranio'
					},
					'itemtype': 'InvtPart',
					'isshippable' : true,
					'options': null,
					'shipaddress': '1311',
					'shipmethod': '',
					'rate_formatted': '$200.00',
					'amount_formatted': '$400.00',
					'tax_amount_formatted': '$0.00',
					'discount_formatted': '$0.00',
					'total_formatted': '$400.00'
				}],
				'addresses': [{
					'zip': '98849',
					'phone': '(132) 337-1749',
					'defaultshipping': 'F',
					'state': 'AL',
					'isresidential': 'F',
					'isvalid': 'T',
					'city': 'Scurry',
					'country': 'US',
					'addr1': '1964 red saturn dr',
					'addr2': null,
					'addr3': null,
					'defaultbilling': 'F',
					'internalid': '1309',
					'id': 1309,
					'fullname': 'Main Shipping',
					'company': 'asdfasd',
					'check': true
				},
				{
					'zip': '21211',
					'phone': '(098) 924-2265',
					'defaultshipping': 'F',
					'state': 'Montevideo',
					'isresidential': 'T',
					'isvalid': 'T',
					'city': 'Montevideo',
					'country': 'UY',
					'addr1': 'Jackson 2523 Complejo America Torre D Sector 5 Apto 6',
					'addr2': 'deed',
					'addr3': null,
					'defaultbilling': 'F',
					'internalid': '1311',
					'id': 1311,
					'fullname': 'Residential Address',
					'company': 'adfas',
					'check': true
				},
				{
					'zip': '14618',
					'phone': '(658) 900-7766',
					'defaultshipping': 'F',
					'state': 'VT',
					'isresidential': 'F',
					'isvalid': 'T',
					'city': 'madison',
					'country': 'US',
					'addr1': '8908 costume st',
					'addr2': '',
					'addr3': '',
					'defaultbilling': 'T',
					'internalid': '1312',
					'id': 1312,
					'fullname': 'Main Billing',
					'company': null
				}],
				'lines_sort': ['item30set2087',
				'item28set2086'],
				'latest_addition': null,
				'promocode': null,
				'ismultishipto': true,
				'shipmethods': [],
				'shipmethod': null,
				'multishipmethods': {
					'1309': [{
						'shipcarrier': 'nonups',
						'rate': 32.68,
						'name': 'FedEx - to World',
						'internalid': 3,
						'rate_formatted': 32.68
					},
					{
						'shipcarrier': 'nonups',
						'rate': 0,
						'name': 'UPS - Not Uruguay',
						'internalid': 4,
						'rate_formatted': 0
					}],
					'1311': [{
						'shipcarrier': 'nonups',
						'rate': 32.68,
						'name': 'FedEx - to World',
						'internalid': 3,
						'rate_formatted': 32.68
					},
					{
						'shipcarrier': 'nonups',
						'rate': 961,
						'name': 'Uruguay Only',
						'internalid': 6,
						'rate_formatted': 961
					}]
				},
				'paymentmethods': [],
				'isPaypalComplete': false,
				'agreetermcondition': false,
				'billaddress': '1312',
				'shipmentsorder': [],
				'touchpoints': {
					'register': '/c.3563497/checkout/login.ssp?n=4&sc=6&login=T&reset=T&newcust=T',
					'home': 'http://dev11.oloraqa.com?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123035&cart=2663&gc=clear&chrole=14',
					'logout': '/c.3563497/ShopFlow/logOut.ssp?n=4&sc=17&logoff=T&ckabandon=rBRmKXzgAfeIReQ4',
					'viewcart': 'http://dev11.oloraqa.com/ShopFlow/goToCart.ssp?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123035&cart=2663&gc=clear&chrole=14',
					'continueshopping': 'http://dev11.oloraqa.com/?ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123035&cart=2663&gc=clear&chrole=14',
					'serversync': 'http://dev11.oloraqa.com/app/site/backend/syncidentity.nl?c=3563497&n=4&ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123035&chrole=14',
					'login': '/c.3563497/checkout/login.ssp?n=4&sc=6&login=T',
					'welcome': 'http://dev11.oloraqa.com/s.nl?sc=15&ck=rBRmKXzgAfeIReQ4&vid=rBRmKXzgASSJRXIe&cktime=123035&cart=2663&gc=clear&chrole=14',
					'checkout': '/c.3563497/checkout/index-local.ssp?n=4&sc=17',
					'customercenter': 'https://checkout.netsuite.com/c.3563497/MyAccount/index.ssp?n=4&sc=6'
				},
				'options': {
					'custbody_quantity': '',
					'custbody_andres': ''
				}
			}
		}
	};
});