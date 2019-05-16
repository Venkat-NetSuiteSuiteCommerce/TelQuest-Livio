/* eslint-disable */
// Pacejet.js
// -------
// Implements carrier and rates apis

// export cached results
var Pacejet = Pacejet || {};

Application.defineModel('Pacejet', {

	// Pacejet Configuration
	pacejetConfiguration: {
		demo: {
			Location: 'DemoAPI'
			, LicenseID: '955726f5-207e-562f-c19e-85d9093dc6cf'
			, LicenseKey: '77eac2da-9a75-f63d-c07a-b312c3b8645e'
			, Origin: {
			    "CompanyName": "ShipItFaster.com",
			    "Address1": "709 E. 44th",
			    "City": "Lubbock",
			    "StateOrProvinceCode": "TX",
			    "PostalCode": "79404",
			    "CountryCode": "US",
			    "ContactName": "Steve Sellers",
			    "Email": "steve.sellers@shipitfaster.com",
			    "Phone": "877-722-3538"
			}
			, "ShipmentDetail": {
				"WeightUOM": "LB"
			}
		},
	
		production: {
			Location: 'Talas'
			, LicenseID: '3e27ce3e-8bba-fb17-f705-60c6a8969eda'
			, LicenseKey: 'a3f5c22d-338c-4943-e5fa-9c6114f2a59a'
			, Origin: {
				"CompanyName": "Talas",
				"Address1": "330 Morgan Ave",
				"City": "Brooklyn",
				"StateOrProvinceCode": "NY",
				"PostalCode": "11211",
				"CountryCode": "US",
				"ContactName": "Aaron Salik",
				"Email": "aaron@talisonline.com",
				"Phone": "212-219-0770"
			}
			, "ShipmentDetail": {
				"WeightUOM": "LB"
			}
		}
	}

// Pacejet integration

//TODO: move as much of this as possible to the Pacejet.js module since we have to integrate this into both the shopping and checkout versions of Model.js.

//TODO: filter the shipping methods unconditionally.  handle the case where we have filtered out the selected method, set to first available method and save the fact that we set it.

//TODO: determine if we can call PaceJet
// 0. if there is at least one line item
// 1. if we are logged in and there is a shipping address in the order and there is a selected shipping address.
// 2. if there is an address passed into the data, then we can look up and select the lowest cost shipping method

//TODO: after getting the look up, if we set the default shipping method then select the lowest rate.

,	updateOrder: function (results, order, data) 
	{
		try {
			nlapiLogExecution('debug', 'updateOrder', 'start');
			//nlapiLogExecution('debug', 'results', JSON.stringify(_.omit(results, ['lines']),null,2));
			//nlapiLogExecution('debug', 'order', order);
			//nlapiLogExecution('debug', 'data', JSON.stringify(data,null,2));
			//nlapiLogExecution('debug', 'results.keys', JSON.stringify(_.keys(results),null,2));
			//nlapiLogExecution('debug', 'results.shipmethods', JSON.stringify(results.shipmethods,null,2));
			//nlapiLogExecution('debug', 'results.shipmethod', JSON.stringify(results.shipmethod,null,2));
			//nlapiLogExecution('debug', 'results.addresses', JSON.stringify(results.addresses,null,2));
			//nlapiLogExecution('debug', 'results.address', JSON.stringify(results.address,null,2));
			//nlapiLogExecution('debug', 'results.summary (before)', JSON.stringify(results.summary,null,2));
			
			this._updateShippingRates(results, order, data);

			//nlapiLogExecution('debug', 'updateOrder: results.summary (after)', JSON.stringify(results.summary,null,2));
			nlapiLogExecution('debug', 'updateOrder: results.shipmethods', JSON.stringify(results.shipmethods,null,2));
		}
		catch (e) {
			nlapiLogExecution('debug', 'updateOrder: exception', e);
		}
		
		return results;
	}

,	_getRates: function (shipaddress, order)
	{
		var ratingResultsList = [];
		var request = {};
		
		try {
			//nlapiLogExecution('debug', '_getRates', 'start');

			var pacejetConfig = this.pacejetConfiguration.production;
			
			_.extend(request, shipaddress, this._packageDetailsList(order), pacejetConfig);
			nlapiLogExecution('audit', 'rates request', JSON.stringify(request,null,2));
			
			// add request caching here
			var cache = {};
			try { cache = JSON.parse(nlapiGetContext().getSessionObject('pjrcache')); } catch (ignore) {}
			//nlapiLogExecution('audit', '_getRates: get cache', JSON.stringify(cache,null,2));
			if ( cache && cache.h && cache.h == this._hashCode(JSON.stringify(request)) ) {
				//nlapiLogExecution('debug', '_getRates returning cached result', cache.r);
				return cache.r;
			}

			var pacejetUrl = 'https://api.pacejet.cc/Rates';
			//nlapiLogExecution('debug', 'pacejetUrl', JSON.stringify(pacejetUrl,null,2));

			var pacejetHeaders = {};
			pacejetHeaders.PacejetLocation = pacejetConfig.Location;
			pacejetHeaders.PacejetLicenseKey = pacejetConfig.LicenseKey;
			pacejetHeaders['Content-Type'] = 'application/json';
			//nlapiLogExecution('debug', 'pacejetHeaders', JSON.stringify(pacejetHeaders,null,2));

			//TODO: add retry if the error return happens quickly
			var maxTries = 3;
			var countTries = 0;
			var pacejetResponse = null;
			
			while (countTries < maxTries) {
				try {
					var ts = new Date().getTime();
					pacejetResponse = nlapiRequestURL(pacejetUrl, JSON.stringify(request), pacejetHeaders);
					//nlapiLogExecution('debug', 'Pacejet.Rates: elapsed time in ms', new Date().getTime() - ts);
					//nlapiLogExecution('debug', 'pacejetResponse', pacejetResponse);
					
					var code = parseInt(pacejetResponse.getCode(),10) || 500;
					nlapiLogExecution('debug', 'code', code);
					
					if (code >= 200 && code <= 299) {
						nlapiLogExecution('debug', 'Breaking on success response', '');
						break;
					}
					else {
						throw nlapiCreateError("PaceJet return error " + code, '', true);
					}
					
				}
				catch (e) {
					nlapiLogExecution('debug', 'PaceJet exception', e);
					if (e instanceof nlobjError) {
						switch (e.getCode()) {
							case 'SSS_REQUEST_TIME_EXCEEDED':
							case 'SSS_CONNECTION_TIME_OUT':
							case 'SSS_CONNECTION_CLOSED':
								++countTries;
								continue;
								break;
						}
					}
					else {
						break;				
					}
				}	
			}
			
			var rates = JSON.parse( pacejetResponse.getBody() );
			//nlapiLogExecution('debug', 'rates', JSON.stringify(rates,null,2));
			
			ratingResultsList = rates.ratingResultsList;
			
			// filter out any rates that returned zero.  
			//nlapiLogExecution('debug', 'ratingResultsList.length (before)', JSON.stringify(ratingResultsList.length,null,2));
			ratingResultsList = _.filter(ratingResultsList, function (rate) {
				return !!rate.consignorFreight;
			});
			//nlapiLogExecution('debug', 'ratingResultsList.length (after)', JSON.stringify(ratingResultsList.length,null,2));
			
			// set rates cache here
			var newCache = {
				h: this._hashCode(JSON.stringify(request))
				, r: ratingResultsList
			};
			nlapiGetContext().setSessionObject('pjrcache', JSON.stringify(newCache));
			//nlapiLogExecution('audit', '_getRates: set cache', JSON.stringify(newCache,null,2));
		}
		catch (e) {
			nlapiLogExecution('debug', 'Pacejet.js:_getRates: exception', e);
			var body = 'Pacejet.js\nunexpected error: ' + e.toString() + '\nrequest = ' + JSON.stringify(request,null,2);
			if ( e instanceof nlobjError ) {
				  body = 'Pacejet.js\nsystem error: \ncode = ' + e.getCode() + '\ndetails = ' + e.getDetails() + '\nrequest = ' + JSON.stringify(request,null,2);
			}
			nlapiSendEmail(-5, 'aaron@talasonline.com', 'PaceJet /rates error', body, null, null, null, null, true);
		}
		
		//nlapiLogExecution('debug', '_getRates returning uncached result', ratingResultsList);
		return ratingResultsList;
	}

,	_getCarriers: function ()
	{
		var ret = { empty: true };
		
		try
		{
			//nlapiLogExecution('debug', '_getCarriers', 'start');
			//nlapiLogExecution('debug', 'this.pacejetConfiguration', JSON.stringify(this.pacejetConfiguration,null,2));

			if (Pacejet && Pacejet.carriers) {
				//nlapiLogExecution('debug', '_getCarriers', 'using cached carriers');
				ret = Pacejet.carriers;
			}
			else {
				var pacejetConfig = this.pacejetConfiguration.production;
				
				var pacejetUrl = 'https://api.pacejet.cc/CarrierClassOfServices';
				//nlapiLogExecution('debug', 'pacejetUrl', JSON.stringify(pacejetUrl,null,2));
		
				var pacejetHeaders = {};
				pacejetHeaders.PacejetLocation = pacejetConfig.Location;
				pacejetHeaders.PacejetLicenseKey = pacejetConfig.LicenseKey;
				pacejetHeaders['Content-Type'] = 'application/json';
				//nlapiLogExecution('debug', 'pacejetHeaders', JSON.stringify(pacejetHeaders,null,2));
		
				var ts = new Date().getTime();
				var pacejetResponse = nlapiRequestURL(pacejetUrl, null, pacejetHeaders);
				nlapiLogExecution('debug', 'Pacejet.CarrierClassOfServices: elapsed time in ms', new Date().getTime() - ts);
				//nlapiLogExecution('debug', 'pacejetResponse', pacejetResponse);
				
				ret = JSON.parse(pacejetResponse.getBody());
				//nlapiLogExecution('debug', 'ret', ret);
			}
		}
		catch (e)
		{
			nlapiLogExecution('debug', '_getCarriers: exception', e);
		}
		
		//nlapiLogExecution('debug', '_getCarriers returning', ret);
		return ret;
	}

,	_updateShippingRates: function (results, order, data) 
	{
		//nlapiLogExecution('debug', '_updateShippingRates', 'start');
		//nlapiLogExecution('debug', 'results', results);
		//nlapiLogExecution('debug', 'order', order);
		//nlapiLogExecution('debug', 'data', data);
		//nlapiLogExecution('debug', '_updateShippingRates: data', JSON.stringify(data,null,2));

		try {
			var request = {};
			
			// this is the update case where a new shipmethod has been selected, it gets passed in the data object.
			results.shipmethod = (results && results.shipmethod) || (data && data.shipmethod) || null;

			var address = data && _.find(data.addresses, function (address) {
				return address.internalid === data.shipaddress;
			}); 
			
			var shipaddress = this._shippingAddress(order, address);
			
			// look up rates and update both shipmethods and summary
			if (shipaddress) {
				//nlapiLogExecution('debug', '_updateShippingRates', 'have address, call pacejet');

				var ratingResultsList = this._getRates(shipaddress, order);

				if (!ratingResultsList || !ratingResultsList.length) {
					//nlapiLogExecution('debug', '_updateShippingRates', 'no ratings, removing all shipmethods');
					results.shipmethods = [];
					results.shipmethod = null;
					return;
				}
				
				//  if there are shipmethods
				if (results.shipmethods && results.shipmethods.length) {
					//nlapiLogExecution('debug', '_updateShippingRates', 'found shipmethods');
					
					//TODO: is this true?  save original shipmethods array since order submission fails if we do not sent the original array
					this._cloneShipmethods(results);

					//  remove any that do not match a rate.
					//  if there is no selected shipping method, set the selected shipmethod to the one that matches the lowest rate.
					this._filterShippingMethods(results, ratingResultsList);
					//nlapiLogExecution('debug', '_updateShippingRates: results.shipmethods.length', results.shipmethods.length);

					//  update the summary total and rate
					if (results.shipmethods.length) {
						var selectedShipmethod = _.find(results.shipmethods, function (e) { return e.internalid == results.shipmethod; });
						//nlapiLogExecution('debug', 'selectedShipmethod', JSON.stringify(selectedShipmethod,null,2));
						if (selectedShipmethod) {
							// update the total by the delta between the existing shipping amount and the pacejet-provided rate
							results.summary.total = results.summary.total - results.summary.shippingcost + selectedShipmethod.rate; 
							results.summary.total_formatted = formatCurrency(results.summary.total);

							results.summary.shippingcost = selectedShipmethod.rate;
							results.summary.shippingcost_formatted = formatCurrency(results.summary.shippingcost);
						}
					}
				}
				
				//  else set the summary rate to the lowest rate
				else {
					//nlapiLogExecution('debug', '_updateShippingRates', 'no shipmethods');
					var lowestRate = _.chain(ratingResultsList).sortBy('consigneeFreight').first().value();
					//nlapiLogExecution('debug', 'lowestRate', JSON.stringify(lowestRate,null,2));

					results.summary.total = results.summary.total - results.summary.shippingcost + lowestRate.consigneeFreight; 
					results.summary.total_formatted = formatCurrency(results.summary.total);
					results.summary.shippingcost = lowestRate.consigneeFreight;
					results.summary.shippingcost_formatted = formatCurrency(results.summary.shippingcost);
				}
			}
			
			// no update needed as the default shipping amount is zero
			else {
				//nlapiLogExecution('debug', '_updateShippingRates', 'no address, skip rate update');
			}
		}
		catch (e) {
			nlapiLogExecution('error', '_updateShippingRates: exception', e);
		}

	}

,	_cloneShipmethods: function (results) {
		//nlapiLogExecution('debug', '_cloneShipmethods', 'start');
		//nlapiLogExecution('debug', 'results.shipmethods', JSON.stringify(results.shipmethods,null,2));
		
		var shipmethods_orig = new Array;
		_.each(results.shipmethods, function (e) {
			shipmethods_orig.push(_.extend({}, e));
		});
		
		results.shipmethods_orig = shipmethods_orig;
		//nlapiLogExecution('debug', 'results.shipmethods_orig', JSON.stringify(results.shipmethods_orig,null,2));
	}

,	_filterShippingMethods: function(results, ratingResultsList) 
	{
		//nlapiLogExecution('debug', '_filterShippingMethods', 'start');
		//nlapiLogExecution('debug', '_filterShippingMethods: ratingResultsList.length', ratingResultsList.length);
		
		if (results && results.shipmethods && results.shipmethods.length) {
			var carriers = this._getCarriers();
			//nlapiLogExecution('debug', 'carriers', carriers);

			var carrierHash = new Object;
			_.each(carriers, function (e) {
				carrierHash[e.carrierClassOfServiceCarrierName + ':' + e.carrierClassOfServiceCode] = e.carrierClassOfServiceShipCodeXRef;
			});
			//nlapiLogExecution('debug', 'carrierHash', JSON.stringify(carrierHash,null,2));

			ratingResultsList = _.map(ratingResultsList, function (e) {
				var ee = 
					_.chain(e)
					.pick(['consigneeFreight'])
					.extend({internalid: carrierHash[e.carrierNumber + ":" + e.carrierClassOfServiceCode]})
					.value();
				return ee;
			});
			//console.log('ratingResultsList (before filter) = ' + JSON.stringify(ratingResultsList,null,2));

			ratingResultsList = _.filter(ratingResultsList, function (f) { return !!f.internalid; });
			//console.log('ratingResultsList (after filter) = ' + JSON.stringify(ratingResultsList,null,2));
			
			var ratingHash = new Object;
			_.each(ratingResultsList, function (e) {
				ratingHash[e.internalid] = e.consigneeFreight;
			});
			//console.log('ratingHash = ' + JSON.stringify(ratingHash,null,2));

			var shipmethods = results.shipmethods;
			//nlapiLogExecution('debug', 'shipmethods', JSON.stringify(shipmethods,null,2));
			//nlapiLogExecution('debug', 'shipmethods.length', JSON.stringify(shipmethods.length,null,2));
			
			shipmethods = _.filter(shipmethods, function (e) {
				return !!ratingHash[e.internalid];
			});
			//nlapiLogExecution('debug', 'shipmethods (filtered)', JSON.stringify(shipmethods,null,2));
			//nlapiLogExecution('debug', 'shipmethods.length (filtered)', JSON.stringify(shipmethods.length,null,2));

			_.each(shipmethods, function (e) {
				e.rate = ratingHash[e.internalid];
				e.rate_formatted = formatCurrency(e.rate);
			});
			//nlapiLogExecution('debug', 'shipmethods (rates)', JSON.stringify(shipmethods,null,2));
			
			// sort in lowest cost order.  note:this isn't strictly necessary as the client collection has a comparator.
			shipmethods = _.sortBy(shipmethods, 'rate');
			//nlapiLogExecution('debug', 'shipmethods (sorted)', JSON.stringify(shipmethods,null,2));
			
			//nlapiLogExecution('debug', 'results.shipmethod (before)', JSON.stringify(results.shipmethod,null,2));

			// we have filtered out all the shipmethods so set default to null
			if (!shipmethods.length) {
				//nlapiLogExecution('debug', '_filterShippingMethods', 'all shipmethods have been filtered out');
				results.shipmethod = null;
			}
			
			// if shipmethod is not set or if shipmethod has been filtered out of the list, set shipmethod to the lowest cost.
			else if (!results.shipmethod || !_.find(shipmethods, function (e) { return e.internalid == results.shipmethod; })) {
				//nlapiLogExecution('debug', '_filterShippingMethods', 'invalid shipmethod found, setting to lowest rate');
				results.shipmethod = _.first(shipmethods).internalid;
			}
			
			//nlapiLogExecution('debug', 'results.shipmethod (after)', JSON.stringify(results.shipmethod,null,2));

			results.shipmethods = shipmethods;
		}
	}

,	_packageDetailsList: function (order) {
		//nlapiLogExecution('debug', '_packageDetailsList', 'start');
		
		var items = order.getItems() || [];
		//nlapiLogExecution('debug', 'items.length', items.length);
		
		var productDetailsList = new Array;
		for (var i = 0; i < items.length; i++) {
			
			var item = items[i];
			//nlapiLogExecution('debug', 'item.keys', JSON.stringify(_.keys(item),null,2));
			//nlapiLogExecution('debug', 'item.amount', JSON.stringify(item.amount,null,2));
			//nlapiLogExecution('debug', 'item.name', JSON.stringify(item.name,null,2));
			//nlapiLogExecution('debug', 'item.itemid', JSON.stringify(item.itemid,null,2));
			
			var productDetails = {
				"Quantity": {
					"Units": "EA",
					"Value": item.quantity
				},
				
				"Price": {
					"Amount": item.amount / item.quantity
				},
				
				"Number": item.itemid,
				
				"Weight": item.weight,
				
				"Dimensions":{
					"Length": item.custitem_pacejet_item_length,
					"Width": item.custitem_pacejet_item_width,
					"Height": item.custitem_pacejet_item_height,
					"Units":"IN"
				},

				"AutoPack": "true",
					
				"CustomFields": [
	                {
	                	"Name": "countryofmanufacture"
                		, "Value": item.countryofmanufacture
	                }
	                , {
	                	"Name": "schedulebnumber"
                		, "Value": item.schedulebnumber
	                }
	                , {
	                	"Name": "custitem_pacejet_oversize"
                		, "Value": item.custitem_pacejet_oversize
	                }
				]
			};
			productDetailsList.push(productDetails);
		};
		//nlapiLogExecution('debug', 'productDetailsList', JSON.stringify(productDetailsList,null));

		return { PackageDetailsList: [{ ProductDetailsList: productDetailsList }] };
	}
	
,	_shippingAddress: function (order, address) {
		//nlapiLogExecution('debug', '_shippingAddress', 'start');
		//nlapiLogExecution('debug', 'isLoggedIn2', nlapiGetWebContainer().getShoppingSession().isLoggedIn2());
		//nlapiLogExecution('debug', 'address', JSON.stringify(address,null,2));
		
		var Destination = null;
		
		// if we are logged in and there is shipaddress in the order, then format and return the address.
		if (nlapiGetWebContainer().getShoppingSession().isLoggedIn2()) {
			var shipaddress = order.getFieldValues(['shipaddress']);
			//nlapiLogExecution('debug', 'shipaddress (order)', JSON.stringify(shipaddress,null,2));
			
			shipaddress = (shipaddress && shipaddress.shipaddress) || null;
			//nlapiLogExecution('debug', 'shipaddress (extracted)', JSON.stringify(shipaddress,null,2));
			
			if (shipaddress) {
				//nlapiLogExecution('debug', 'returning shipaddress from order');
				
				//TODO: map NetSuite address fields to Pacejet fields
				Destination = { Destination: {
				    	"CompanyName": ''
				    	, "Address1": shipaddress.addr1
				    	, "Address2": shipaddress.addr2
			    		, "City": shipaddress.city
		    			, "StateOrProvinceCode": shipaddress.state
	    				, "PostalCode": shipaddress.zip
	    				, "CountryCode": shipaddress.country
    					, "ContactName": shipaddress.addressee
						, "Email": ''
						, "Phone": shipaddress.phone
						, "Residential" : shipaddress.isresidential == 'T' ? 'true' : 'false'
					}
				};
			}
		}
		
		// if address has a valid zip and country, we are estimating from cart so return minimal address passed into GET
		if (!Destination && address && address.zip && address.country) {
			//nlapiLogExecution('debug', 'shipaddress (address)', JSON.stringify(address,null,2));
			Destination = { Destination: {
				"PostalCode": address.zip
				, "CountryCode": address.country
				, "Residential" : 'false'
			}};
		}

		//nlapiLogExecution('debug', '_shippingAddress: returning Destination', JSON.stringify(Destination,null,2));
		return Destination;
	}

,	_hashCode: function (s) 
	{
		var hash = 0;
	    if (s.length == 0) return hash;
	    for (var i = 0; i < s.length; i++) {
	        char = s.charCodeAt(i);
	        hash = ((hash<<5)-hash)+char;
	        hash = hash & hash; // Convert to 32bit integer
	    }
	    return hash;
	}

});

/* eslint-enable */