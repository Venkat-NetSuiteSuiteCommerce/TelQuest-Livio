/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
    'UnitTestHelper'

	,	'Sensors'
  , 'Sensors.DataExtractor'
  , 'Profile.Model'

  , 'jQuery'
  ,'UnitTestHelper.Preconditions'
	]
,	function (
    UnitTestHelper

  , Sensors
  , SensorsDataExtractor
  , ProfileModel
  , jQuery
  ,Preconditions
	)
{
	'use strict';

	var setPreconditions = function()
		{
			window.SC = Preconditions.deepExtend(window.SC || {}, {
				ENVIRONMENT: {
					siteSettings: {}
				,	SENSORS_ENABLED: true
				,	jsEnvironment: 'browser'
				}
			,	templates: {macros: {}}
			}); 
		}

	var helper = new UnitTestHelper({
		applicationName: 'Sensors'
	,	environment: SC.ENVIRONMENT
	});

	describe('Sensors Module', function ()
	{
		beforeEach(function()
		{
			setPreconditions()
		})
	    describe('mountToApp', function()
	    {
	      it('should invoke loadScript on first load', function ()
	      {
	        spyOn(Sensors, 'loadScript');
	        spyOn(Sensors, 'sendData');
	        var mount_result = Sensors.mountToApp(helper.application);

	        helper.application.getLayout().trigger('afterAppendView');

	        expect(Sensors.loadScript).toHaveBeenCalled();
	        expect(Sensors.sendData).not.toHaveBeenCalled();
	      });

	      it('should send data on navigation', function ()
	      {
	        spyOn(Sensors, 'loadScript').and.callFake(function ()
	        {
	          Sensors.nlrum = true;
	        });
	        spyOn(Sensors, 'sendData');
	        var mount_result = Sensors.mountToApp(helper.application);

	        helper.application.getLayout().trigger('afterAppendView');
	        helper.application.getLayout().trigger('afterAppendView');

	        expect(Sensors.sendData).toHaveBeenCalled();
	      });

	      it('should not load script if feature is not enabled', function ()
	      {
	        SC.ENVIRONMENT.SENSORS_ENABLED = false;

			spyOn(Sensors, 'loadScript');

	        var mount_result = Sensors.mountToApp(helper.application);

	        helper.application.getLayout().trigger('afterAppendView');

	        expect(Sensors.loadScript).not.toHaveBeenCalled();

			SC.ENVIRONMENT.SENSORS_ENABLED = false;
	      });
	    });

	    describe('loadScript', function()
		{
			it('should load the nlRUM script', function ()
	  		{
		        spyOn(Sensors, 'sendData');
		        spyOn(jQuery, 'getScript').and.callFake(function ()
		        {
		          return jQuery.Deferred().resolve();
		        });
		        window.NLRUM = {};
		        SC.ENVIRONMENT.jsEnvironment = 'browser';
		        Sensors.loadScript();

	        	expect(jQuery.getScript).toHaveBeenCalledWith('/nlrum/nlRUM.js');
	  		});

			it('should set bSendBeacon to zero before loading script', function ()
			{
				spyOn(Sensors, 'sendData');
		        spyOn(jQuery, 'getScript').and.callFake(function ()
		        {
		          return jQuery.Deferred().resolve();
		        });

		        SC.ENVIRONMENT.jsEnvironment = 'browser';
		        Sensors.loadScript();

				expect(window.NLRUM).toBeDefined();
				expect(window.NLRUM.bSendBeacon).toEqual(0);
			});

			it('should invoke sendData and store the library global object once the script loads', function ()
			{
				spyOn(Sensors, 'sendData');
				spyOn(jQuery, 'getScript').and.callFake(function ()
				{
					return jQuery.Deferred().resolve();
				});

				var library = {bSendBeacon: 0, bResourceTimingDataCollection: 1, addSCData: true};
				window.NLRUM = library;

				Sensors.loadScript();

				expect(Sensors.nlrum).toEqual(library);
				expect(Sensors.sendData).toHaveBeenCalledWith(true);
			});
		});

	  //   describe('getMetadata', function()
	  //   {
	  //     beforeEach(function ()
	  //     {
	  //       helper.application.getLayout().currentView = { attributes: { id: 'testingView'} };
	  //       helper.application.getCart = function ()
	  //       {
	  //         return jQuery.Deferred().resolve( { get: function (){ return [1,2,3]; } });
	  //       };

			// spyOn(_, 'getDeviceType').and.callFake(function ()
			// {
			// 	return 'desktop';
			// });

			// //helper.environment.RELEASE_METADATA = { name: 'Bundle Name', version: 'Bundle Version', buildno: 'Bundle Number', datelabel: '0123456789', bundle_id: '12345' };
			// SC.ENVIRONMENT.RELEASE_METADATA = { name: 'Bundle Name', version: 'Bundle Version', buildno: 'Bundle Number', datelabel: '0123456789', bundle_id: '12345', baselabel: 'base label' };
	  //     });

	  //     it('should always return a promise', function ()
	  //     {
	  //       var result = Sensors.getMetadata();

	  //       expect(result.done).toBeDefined();
	  //       expect(result.done).toBeA(Function);
	  //       expect(result.then).toBeDefined();
	  //       expect(result.then).toBeA(Function);
	  //       expect(result.promise).toBeDefined();
	  //       expect(result.promise).toBeA(Function);

	  //       result = Sensors.getMetadata(true);

	  //       expect(result.done).toBeDefined();
	  //       expect(result.done).toBeA(Function);
	  //       expect(result.then).toBeDefined();
	  //       expect(result.then).toBeA(Function);
	  //       expect(result.promise).toBeDefined();
	  //       expect(result.promise).toBeA(Function);
	  //     });

	  //     it('should resolve promise with flat object of strings', function ()
	  //     {
	  //         Sensors.getMetadata().done(function (metadata)
	  //         {
	  //           expect(metadata).toBeDefined();
	  //           for(var key in metadata)
	  //           {
	  //             expect(typeof metadata[key]).toBe('string');
	  //           }
	  //         });

	  //         Sensors.getMetadata(true).done(function (metadata)
	  //         {
	  //           expect(metadata).toBeDefined();
	  //           for(var key in metadata)
	  //           {
	  //             expect(typeof metadata[key]).toBe('string');
	  //           }
	  //         });
	  //     });

	  //     it('should only send some metadata (once = false) when passing in false', function ()
	  //     {
			//   var expected = {
			// 	  sitePage: 'testingView'
			// 	, siteUrl: window.location.href
			// 	, cartLines: '3'
			// 	, customerSessionStatus: 'New'
			// 	, shopperInternalId: ''
			// 	, currencyCode: ''
			// 	, errorStatus: ''
			// 	};

	  //       Sensors.getMetadata(false).done(function (metadata)
	  //       {
	  //           // expect(metadata).toEqual(expected);
	  //           _.each(expected, function(val, key)
	  //       	{
	  //       		expect(metadata[key]!== undefined).toBe(true)
	  //       	});
	  //       });
	  //     });

	  //     it('should send all metadata when passing in true', function ()
	  //     {
	  //       var expected = {
			//   sitePage: 'testingView'
			// , siteUrl: window.location.href
			// , cartLines: '3'
			// , customerSessionStatus: 'New'
			// , bundleName: 'Bundle Name'
			// , bundleVersion: 'Bundle Version'
			// , buildNo: 'Bundle Number'
			// , dateLabel: '0123456789'
			// , bundleId: '12345'
			// , baseLabel: 'base label'
			// , shopperInternalId: ''
			// , currencyCode: ''
			// , errorStatus: ''
			// , device: 'desktop'
	  //       };

	  //       Sensors.getMetadata(true).done(function (metadata)
	  //       {
	  //       	_.each(expected, function(val, key)
	  //       	{
	  //       		expect(metadata[key]!== undefined).toBe(true)
	  //       	})
	  //         // expect(metadata).toEqual(expected);
	  //       });
	  //     });

	  //     it('should retrieve all data even if values are not available (as an empty string)', function ()
	  //     {
	  //       helper.application.getCart = function ()
	  //       {
	  //         return jQuery.Deferred().reject('Error getting cart');
	  //       };

	  //       var expected = {
	  //         sitePage: 'testingView'
	  //       , siteUrl: window.location.href
	  //       , cartLines: ''
	  //       , customerSessionStatus: 'New'
	  //       , bundleName: 'Bundle Name'
	  //       , bundleVersion: 'Bundle Version'
	  //       , buildNo: 'Bundle Number'
	  //       , dateLabel: '0123456789'
	  //       , bundleId: '12345'
			// , baseLabel: 'base label'
			// , shopperInternalId: ''
			// , currencyCode: ''
			// , errorStatus: ''
			// , device: 'desktop'
	  //       };

	  //       Sensors.getMetadata(true).done(function (metadata)
	  //       {
	  //       	_.each(expected, function(val, key)
	  //       	{
	  //       		expect(metadata[key]!== undefined).toBe(true)
	  //       	});
	  //       });

	  //     });

	  //   });

	//     describe('sendData', function()
	//     {
	//       it('should not send data if NLRUM addSCData is not defined', function ()
	//       {
	// 		  	Sensors.nlrum = {};
	// 			spyOn(Sensors, 'getMetadata');//.and.callThrough();//callFake(function (){});
	// 			Sensors.sendData();
 //  				expect(Sensors.getMetadata).not.toHaveBeenCalled();
	//       });

	//       it('should invoke NLRUM sendData method with the correct data', function ()
	//       {
	//         spyOn(Sensors, 'loadScript').and.callFake(function ()
	//         {
	//           Sensors.nlrum = { addSCData: function(){ console.log('sending data')}};
	//         });

	//         var expected_data = {a: 'a', b: 'b'};
	//         spyOn(Sensors, 'getMetadata').and.callFake(function ()
	//         {
	//           return jQuery.Deferred().resolve(expected_data);
	//         });

	//         Sensors.loadScript();

	//         spyOn(Sensors.nlrum, 'addSCData');

	//         Sensors.sendData();

	//         expect(Sensors.nlrum.addSCData).toHaveBeenCalledWith(expected_data);
	//       });
	//     });
	// });

	// describe('Sensors DataExtractor Module', function ()
	// {
	// 	describe('Objects properites', function ()
	// 	{
	// 		it('should define site, cart, bundle and customer data extraction methods', function ()
	// 		{
	// 			expect(SensorsDataExtractor.site).toBeDefined();
	// 			expect(SensorsDataExtractor.cart).toBeDefined();
	// 			expect(SensorsDataExtractor.bundle).toBeDefined();
	// 			expect(SensorsDataExtractor.customer).toBeDefined();
	// 		});

	// 	it('should have all methods with once and extract methods defined', function ()
	// 	{
	// 		// TODO: do this with for in
	// 		expect(SensorsDataExtractor.site.once).toBeDefined();
	// 		expect(typeof SensorsDataExtractor.site.once).toBe('boolean');
	// 		expect(typeof SensorsDataExtractor.site.extract).toBe('function');

	// 		expect(SensorsDataExtractor.cart.once).toBeDefined();
	// 		expect(typeof SensorsDataExtractor.cart.once).toBe('boolean');
	// 		expect(typeof SensorsDataExtractor.cart.extract).toBe('function');

	// 		expect(SensorsDataExtractor.bundle.once).toBeDefined();
	// 		expect(typeof SensorsDataExtractor.bundle.once).toBe('boolean');
	// 		expect(typeof SensorsDataExtractor.bundle.extract).toBe('function');

	// 		expect(SensorsDataExtractor.customer.once).toBeDefined();
	// 		expect(typeof SensorsDataExtractor.customer.once).toBe('boolean');
	// 		expect(typeof SensorsDataExtractor.customer.extract).toBe('function');
	// 	});
	// });

	// describe('Site Data', function ()
	// {
	// 	it('should be sent on every navigation', function ()
	// 	{
	// 		expect(SensorsDataExtractor.site.once).toBeFalsy();
	// 	});

	// 	it('should resolve a flat object with sitepage and siteurl', function ()
	// 	{
	// 		helper.application.getLayout().currentView = { attributes: { id: 'testView'}};
	// 		var expected = {
	// 			sitePage: 'testView'
	// 			, siteUrl: window.location.href
	// 		};

	// 		SensorsDataExtractor.site.extract(helper.application).done(function (result)
	// 		{
	// 			// expect(result).toEqual(expected);
	// 			_.each(expected, function(val, key)
	//         	{
	//         		expect(result[key]!== undefined).toBe(true)
	//         	});
	// 		});
	// 	});

	// 	it('should return empty values as empty strings', function ()
	// 	{
	// 		helper.application.getLayout().currentView = {};
	// 		var expected = {
	// 			sitePage: ''
	// 			, siteUrl: window.location.href
	// 		};

	// 		SensorsDataExtractor.site.extract(helper.application).done(function (result)
	// 		{
	// 			// expect(result).toEqual(expected);
	// 			_.each(expected, function(val, key)
	//         	{
	//         		expect(result[key]!== undefined).toBe(true)
	//         	});
	// 		});
	// 	});
	// });

	// describe('Cart Data', function ()
	// {
	// 	it('should be sent on every navigation', function ()
	// 	{
	// 		expect(SensorsDataExtractor.cart.once).toBeFalsy();
	// 	});

	// 	it('should resolve a flat object with lines', function ()
	// 	{
	// 		var expected_lines = [1,2,3]
	// 		,   expected_result = { cartLines: '3'};

	// 		helper.application.getCart = function ()
	// 		{
	// 			return jQuery.Deferred().resolve({ get: function () { return expected_lines; } });
	// 		};

	// 		SensorsDataExtractor.cart.extract(helper.application).done(function (result)
	// 		{
	// 			expect(result).toEqual(expected_result);
	// 		});
	// 	});

	// 	it('should return empty value as an empty string', function()
	// 	{
	// 		var expected = { cartLines: ''};
	// 		helper.application.getCart = function ()
	// 		{
	// 			return jQuery.Deferred().reject('Error fetching cart');
	// 		};

	// 		SensorsDataExtractor.cart.extract(helper.application).done(function (result)
	// 		{
	// 			expect(result).toEqual(expected);
	// 		});
	// 	});
	// });

	// describe('Bundle Data', function ()
	// {
	// 	beforeEach(function()
	// 	{
	// 		SC.ENVIRONMENT.RELEASE_METADATA = { name: 'Bundle Name', version: 'Bundle Version', buildno: 'Bundle Number', datelabel: '0123456789', bundle_id: '12345', baselabel: 'base label' };
	// 	});

	// 	it('should be sent only on first load', function ()
	//   	{
	// 		expect(SensorsDataExtractor.bundle.once).toBeTruthy();
	// 	});

	// 	it('should resolve a flat object with bunlde_id, bundle_name, bundle_version, datelabel, buildno and baselabel', function ()
	// 	{
	// 		var expected_result = { bundleName: 'Bundle Name', bundleVersion: 'Bundle Version', buildNo: 'Bundle Number', dateLabel: '0123456789', bundleId: '12345', baseLabel: 'base label' };

	// 		SensorsDataExtractor.bundle.extract().done(function (result)
	// 		{
	// 		  expect(result).toEqual(expected_result);
	// 		});
	// 	});

	// 	it('should return empty values as empty strings if some attributes are missing', function ()
	// 	{
	// 		SC.ENVIRONMENT.RELEASE_METADATA = { name: 'Bundle Name', version: 'Bundle Version'};
	// 		var expected_result = { bundleName: 'Bundle Name', bundleVersion: 'Bundle Version', buildNo: '', dateLabel: '', bundleId: '', baseLabel: '' };

	// 		SensorsDataExtractor.bundle.extract().done(function (result)
	// 		{
	// 		  expect(result).toEqual(expected_result);
	// 		});
	// 	});

	// 	it('should return empty values as empty strings if service fails', function ()
	// 	{
	// 		var expected_result = { bundleName: '', bundleVersion: '', buildNo: '', dateLabel: '', bundleId: '', baseLabel: '' };

	// 		SC.ENVIRONMENT.RELEASE_METADATA = null;

	// 		SensorsDataExtractor.bundle.extract().done(function (result)
	// 		{
	// 		  expect(result).toEqual(expected_result);
	// 		});
	// 	});
	// });

	// describe('Customer Data', function ()
	// {
	//   it('should be sent on every navigation', function ()
	//   {
	//     expect(SensorsDataExtractor.customer.once).toBeFalsy();
	//   });

	//   it('should resolve a flat object with customer', function ()
	//   {
	//       SensorsDataExtractor.customer.extract().done(function (result)
	//       {
	//         expect(result.customerSessionStatus).toEqual('New');
	//       });
	//   });

	//   it('should return "New" by default', function ()
	//   {
	//     spyOn(ProfileModel, 'getInstance').and.callFake(function ()
	//     {
	//         return {
	//           get: function () { return null; }
	//         }
	//     });

	//     SensorsDataExtractor.customer.extract().done(function (result)
	//     {
	//         expect(result.customerSessionStatus).toEqual('New');
	//     });
	//   });

	//   it('should detect a returning customer', function ()
	//   {
	//     spyOn(ProfileModel, 'getInstance').and.callFake(function ()
	//     {
	//         return {
	//           get: function (param)
	//           {
	//             if(param == 'isLoggedIn') return 'T';
	//             return 'F';
	//           }
	//         }
	//     });

	//     SensorsDataExtractor.customer.extract().done(function (result)
	//     {
	//         expect(result.customerSessionStatus).toEqual('Returning');
	//     });
	//   });

	//   it('should detect a recognized customer', function ()
	//   {
	//     spyOn(ProfileModel, 'getInstance').and.callFake(function ()
	//     {
	//         return {
	//           get: function (param)
	//           {
	//             if(param == 'isRecognized') return 'T';
	//             return 'F';
	//           }
	//         }
	//     });

	//     SensorsDataExtractor.customer.extract().done(function (result)
	//     {
	//         expect(result.customerSessionStatus).toEqual('Recognized');
	//     });
	//   });

	//   it('should detect a guest customer', function ()
	//   {
	//     spyOn(ProfileModel, 'getInstance').and.callFake(function ()
	//     {
	//         return {
	//           get: function (param)
	//           {
	//             if(param == 'isGuest') return 'T';
	//             return 'F';
	//           }
	//         }
	//     });

	//     SensorsDataExtractor.customer.extract().done(function (result)
	//     {
	//         expect(result.customerSessionStatus).toEqual('Guest');
	//     });
	//   });
	// });

	describe('Shopper Data', function ()
	{
		xit('TODO', function ()
		{
		});
	});

	describe('Device Data', function ()
	{
		xit('TODO', function ()
		{
		});
	});

	describe('Error Status Data', function ()
	{
		xit('TODO', function ()
		{
		});
	});

	});
});
