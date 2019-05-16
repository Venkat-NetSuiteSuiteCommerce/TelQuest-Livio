/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'TrackingServices'
	,	'underscore'
	]
,	function (
		TrackingServices
	,	_
	)
{
	'use strict';

	return describe('TrackingServices Module', function ()
	{
		var services = TrackingServices.services
		,	UPS = services.UPS
		,	USPS = services.USPS
		,	FedEx = services.FedEx
			// Test Numbers
		,	ups_numbers = ['1ZW0Y5430347631638', '1Z104Y1F0368628217']
		,	usps_numbers = ['9400116901124832888999', 'LN368341292US']
		,	fedex_numbers = ['953123215114898', '554412969900']
			// Crap
		,	crap = [null, undefined, false, true, NaN, '', [], ['12312312'], {}];

		describe('UPS', function ()
		{
			it('validates UPS numbers', function ()
			{
				_.each(ups_numbers, function (number)
				{
					expect(UPS.validate(number)).toBe(true);
				});
			});

			it('but not the USPS numbers', function ()
			{
				_.each(usps_numbers, function (number)
				{
					expect(UPS.validate(number)).toBe(false);
				});
			});

			it('nor the FedEx numbers', function ()
			{
				_.each(fedex_numbers, function (number)
				{
					expect(UPS.validate(number)).toBe(false);
				});
			});
		});

		describe('USPS', function ()
		{
			it('validates USPS numbers', function ()
			{
				_.each(usps_numbers, function (number)
				{
					expect(USPS.validate(number)).toBe(true);
				});
			});

			it('but not the UPS numbers', function ()
			{
				_.each(ups_numbers, function (number)
				{
					expect(USPS.validate(number)).toBe(false);
				});
			});

			it('nor the FedEx numbers', function ()
			{
				_.each(fedex_numbers, function (number)
				{
					expect(USPS.validate(number)).toBe(false);
				});
			});
		});

		describe('FedEx', function ()
		{
			it('validates FedEx numbers', function ()
			{
				_.each(fedex_numbers, function (number)
				{
					expect(FedEx.validate(number)).toBe(true);
				});
			});

			it('but not the UPS numbers', function ()
			{
				_.each(ups_numbers, function (number)
				{
					expect(FedEx.validate(number)).toBe(false);
				});
			});

			it('nor the USPS numbers', function ()
			{
				_.each(usps_numbers, function (number)
				{
					expect(FedEx.validate(number)).toBe(false);
				});
			});
		});

		describe('Services don\'t break', function ()
		{
			it('validating crap', function ()
			{
				_.each(services, function (service)
				{
					expect(service.validate(crap)).toBe(false);
				});
			});

			it('nor turds', function ()
			{
				_.each(services, function (service)
				{
					_.each(crap, function (turd)
					{
						expect(service.validate(turd)).toBe(false);
					});
				});
			});
		});

		describe('getServiceUrl returns the url of the matching service', function ()
		{
			it(ups_numbers[0] + ' is from UPS', function ()
			{
				expect(TrackingServices.getServiceUrl(ups_numbers[0])).toEqual('http://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=' + ups_numbers[0]);
			});

			it(usps_numbers[0] + ' is from USPS', function ()
			{
				expect(TrackingServices.getServiceUrl(usps_numbers[0])).toEqual('https://tools.usps.com/go/TrackConfirmAction_input?qtc_tLabels1=' + usps_numbers[0]);
			});

			it(fedex_numbers[0] + ' is from FedEx', function ()
			{
				expect(TrackingServices.getServiceUrl(fedex_numbers[0])).toEqual('http://www.fedex.com/Tracking?action=track&tracknumbers=' + fedex_numbers[0]);
			});

			it('if no service matches, returns the default url', function ()
			{
				expect(TrackingServices.getServiceUrl('5430347631638')).toEqual('http://www.google.com/search?q=5430347631638');
			});
		});

		describe('getServiceName returns the name of the matching service', function ()
		{
			it(ups_numbers[0] + ' is from UPS', function ()
			{
				expect(TrackingServices.getServiceName(ups_numbers[0])).toEqual('UPS');
			});

			it(usps_numbers[0] + ' is from USPS', function ()
			{
				expect(TrackingServices.getServiceName(usps_numbers[0])).toEqual('USPS');
			});

			it(fedex_numbers[0] + ' is from FedEx', function ()
			{
				expect(TrackingServices.getServiceName(fedex_numbers[0])).toEqual('FedEx');
			});

			it('if no service matches, returns null', function ()
			{
				expect(TrackingServices.getServiceName('5430347631638')).toEqual(null);
			});
		});
	});
});