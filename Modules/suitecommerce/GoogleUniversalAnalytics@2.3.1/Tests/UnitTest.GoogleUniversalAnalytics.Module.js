/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//TODO: this test use routing and navigation and is incompatible with other tests doing the same thing

window.SC = window.SC || {};

define(['GoogleUniversalAnalytics', 'UnitTestHelper', 'Tracker', 'UnitTestHelper.Preconditions'],
	function (GoogleUniversalAnalytics, UnitTestHelper, Tracker, Preconditions)
{
	'use strict';


	return describe('GoogleUniversalAnalytics Module', function ()
	{
		it('defines the global variable `ga`', function ()
		{
			expect(ga).toBeDefined();
		});

		describe('setAccount', function ()
		{
			var valid_settings = {
					propertyID: 'UA-34213649-2'
				,	domainName: 'demo.uylabs.com'
				};

			beforeEach(function ()
			{
				window.SC = Preconditions.deepExtend(window.SC || {}, {
					ENVIRONMENT: {
						siteSettings: {
							checkoutSupported: false
						}
					}
				});

				spyOn(window, 'ga');
			});

			it('sets the analytics account', function ()
			{
				GoogleUniversalAnalytics.setAccount(valid_settings);

				expect(ga).toHaveBeenCalledWith('create', 'UA-34213649-2', {
					'cookieDomain': 'demo.uylabs.com'
				,	'allowLinker': true
				});
			});

			it('and returns the GoogleUniversalAnalytics module', function ()
			{
				expect(GoogleUniversalAnalytics.setAccount(valid_settings)).toEqual(GoogleUniversalAnalytics);
				expect(ga).toHaveBeenCalled();
			});

			xit('even if the account is not set', function ()
			{
				expect(GoogleUniversalAnalytics.setAccount()).toEqual(GoogleUniversalAnalytics);
				expect(ga).not.toHaveBeenCalled();
			});

			describe('the account is not set if:', function ()
			{
				it('there\'s no configuration', function ()
				{
					GoogleUniversalAnalytics.setAccount();
					expect(ga).not.toHaveBeenCalled();
				});

				it('either propertyID or domainName are not set', function ()
				{
					GoogleUniversalAnalytics.setAccount({
						propertyID: valid_settings.propertyID
					});

					expect(ga).not.toHaveBeenCalled();

					GoogleUniversalAnalytics.setAccount({
						domainName: valid_settings.domainName
					});

					expect(ga).not.toHaveBeenCalled();

					GoogleUniversalAnalytics.setAccount({
						something: valid_settings.propertyID
					,	somethingElse: valid_settings.domainName
					});

					expect(ga).not.toHaveBeenCalled();
				});

				it('or they are not strings', function ()
				{
					GoogleUniversalAnalytics.setAccount({
						propertyID: function ()
						{
							return 'what?';
						}
					,	domainName: ['o', 'p', 'a']
					});

					expect(ga).not.toHaveBeenCalled();

					GoogleUniversalAnalytics.setAccount({
						propertyID: {}
					,	domainName: undefined
					});

					expect(ga).not.toHaveBeenCalled();
				});
			});
		});

		describe('loadScript', function ()
		{
			beforeEach(function ()
			{
				window.SC = Preconditions.deepExtend(window.SC || {}, {
					ENVIRONMENT: {
						jsEnvironment: 'browser'
					}
				});

				spyOn(jQuery, 'getScript');
			});

			it('loads the library', function ()
			{
				GoogleUniversalAnalytics.loadScript();
				expect(jQuery.getScript).toHaveBeenCalledWith('//www.google-analytics.com/analytics.js');
			});

			it('including ecommerce plugin', function ()
			{
				spyOn(window, 'ga');

				GoogleUniversalAnalytics.loadScript();
				expect(ga).toHaveBeenCalledWith('require', 'ecommerce', 'ecommerce.js');
			});

			it('unless the environment is not `browser`', function ()
			{
				SC.ENVIRONMENT.jsEnvironment = 'server';
				expect(GoogleUniversalAnalytics.loadScript()).toBe(false);
				expect(jQuery.getScript).not.toHaveBeenCalled();
			});
		});

		describe('mountToApp', function ()
		{
			var helper

			it('sets the account', function ()
			{
				helper = new UnitTestHelper({
						applicationName: 'GoogleUniversalAnalytics'
					,	applicationConfiguration: {
							tracking: {
								googleUniversalAnalytics: {
									propertyID: 'UA-34213649-2'
								,	domainName: 'demo.uylabs.com'
								}
							}
						}
				});

				spyOn(GoogleUniversalAnalytics, 'setAccount').and.CallThrough;

				GoogleUniversalAnalytics.mountToApp(helper.application);

				expect(GoogleUniversalAnalytics.setAccount).toHaveBeenCalledWith({
					propertyID: 'UA-34213649-2'
				,	domainName: 'demo.uylabs.com'
				});
			});

			it('loads the scripts', function ()
			{
				spyOn(GoogleUniversalAnalytics, 'loadScript');

				GoogleUniversalAnalytics.mountToApp(helper.application);
				helper.application.getLayout().trigger('afterAppendView');

				expect(GoogleUniversalAnalytics.loadScript).toHaveBeenCalled();
			});

			it('and pushes itself to the list of trackers', function ()
			{
				var tracker = Tracker.getInstance()

				tracker.trackers = [];

				GoogleUniversalAnalytics.mountToApp(helper.application);

				expect(tracker.trackers).toContain(GoogleUniversalAnalytics);
			});

			it('if its configured in the application', function ()
			{
				spyOn(GoogleUniversalAnalytics, 'setAccount');
				spyOn(GoogleUniversalAnalytics, 'loadScript');

				var tracker = Tracker.getInstance()

				tracker.trackers = [];

				delete helper.application.Configuration.tracking.googleUniversalAnalytics;

				GoogleUniversalAnalytics.mountToApp(helper.application);

				expect(GoogleUniversalAnalytics.setAccount).not.toHaveBeenCalled();
				expect(GoogleUniversalAnalytics.loadScript).not.toHaveBeenCalled();
				expect(helper.application.trackers).not.toContain(GoogleUniversalAnalytics);
			});
		});

		describe('tracking methods', function ()
		{
			beforeEach(function ()
			{
				spyOn(window, 'ga');
			});

			it('trackPageview', function ()
			{
				expect(GoogleUniversalAnalytics.trackPageview('/')).toEqual(GoogleUniversalAnalytics);
				expect(ga).toHaveBeenCalledWith('send', 'pageview', '/');

				GoogleUniversalAnalytics.trackPageview();
				GoogleUniversalAnalytics.trackPageview([]);

				expect(ga.calls.all().length).toEqual(1);
			});

			it('trackEvent', function ()
			{
				var valid_event = {
						category: 'button'
					,	action: 'click'
					,	label: 'nav buttons'
					,	value: 1
					};

				expect(GoogleUniversalAnalytics.trackEvent(valid_event)).toEqual(GoogleUniversalAnalytics);

				// debugger;
				ga.calls.mostRecent()
				expect(ga.calls.mostRecent().args[0]).toBe('send')
				expect(ga.calls.mostRecent().args[1]).toBe('event')
				expect(ga.calls.mostRecent().args[2]).toBe('button')
				expect(ga.calls.mostRecent().args[3]).toBe('click')
				expect(ga.calls.mostRecent().args[4]).toBe('nav buttons')
				expect(ga.calls.mostRecent().args[5]).toBe(1)

				// expect(ga).toHaveBeenCalledWith('send', 'event', 'button', 'click', 'nav buttons', 1, {
					// 'hitCallback': undefined
				// ,	'page': '/undefined'
				// });

				GoogleUniversalAnalytics.trackEvent();
				GoogleUniversalAnalytics.trackEvent({});

				expect(ga.calls.all().length).toEqual(1);
			});

			it('addItem', function ()
			{
				var item = {
						id: '1234'
					,	name: 'Fluffy Pink Bunnies'
					,	sku: 'DD23444'
					,	category: 'Party Toys'
					,	price: '11.99'
					,	quantity: '1'
					};

				expect(GoogleUniversalAnalytics.addItem(item)).toBe(GoogleUniversalAnalytics);
				expect(ga).toHaveBeenCalledWith('ecommerce:addItem', item);

				GoogleUniversalAnalytics
					.addItem()
					.addItem({
						id: '1234'
					})
					.addItem({
						name: 'Fluffy Pink Bunnies'
					})
					.addItem({
						id: undefined
					,	name: ''
					});

				expect(ga.calls.all().length).toEqual(1);
			});

			it('addTrans', function ()
			{
				var valid_transaction = {
					id: '1234'
				,	revenue: '11.99'
				,	shipping: '5'
				,	tax: '1.29'
				,	currency: 'USD'
				};

				expect(GoogleUniversalAnalytics.addTrans(valid_transaction)).toEqual(GoogleUniversalAnalytics);
				expect(ga).toHaveBeenCalledWith('ecommerce:addTransaction', valid_transaction);

				GoogleUniversalAnalytics
					.addTrans()
					.addTrans({});

				expect(ga.calls.all().length).toEqual(1);
			});

			it('trackTrans', function ()
			{
				expect(GoogleUniversalAnalytics.trackTrans()).toEqual(GoogleUniversalAnalytics);
				expect(ga).toHaveBeenCalledWith('ecommerce:send');
			});

			describe('trackTransaction', function ()
			{

				var order = null;

				beforeEach(function ()
				{
					window.SC = Preconditions.deepExtend(window.SC || {}, {
						ENVIRONMENT: {
							currentCurrency: {
								code: 'USD'
							}
						,	siteSettings: {}
						}
					});

					order = new Backbone.Model({
						confirmationNumber: '5554-2243'
					,	lines: new Backbone.Collection([
							{
								item: new Backbone.Model({
									_name: 'AIR'
								,	_sku: 'gt0017'
								,	_category: 'Men'
								})
							,	quantity: 1
							,	rate: 250
							}
						,	{
								item: new Backbone.Model({
									_name: 'Trail Palomar'
								,	_sku: 'Trail-Palomar-Sil-24'
								,	_category: 'Bike'
								})
							,	quantity: 1
							,	rate: 500.99
							}
						])
					,	products: new Backbone.Collection([
							new Backbone.Model({
								sku: 'gt0017'
							,	name: 'AIR'
							,	category: 'Men'
							,	rate: 250
							,	quantity: 1
							}),

							new Backbone.Model({
								sku: 'Trail-Palomar-Sil-24'
							,	name: 'Trail Palomar'
							,	category: 'Bike'
							,	rate: 500.99
							,	quantity: 2
							})
						])
					,	subTotal: 750.99
					,	shippingCost: 60
					,	handlingCost: 1
					,	subTotal: 750.99
					,	taxTotal: 21.5
					});
				});

				it('adds the transaction', function ()
				{
					spyOn(GoogleUniversalAnalytics, 'addTrans');

					GoogleUniversalAnalytics.trackTransaction(order);

					var arg = GoogleUniversalAnalytics.addTrans.calls.mostRecent().args[0]

					expect(arg.id).toBe('5554-2243')
					expect(arg.revenue).toBe(750.99)
					expect(arg.shipping).toBe(60 + 1)
					expect(arg.tax).toBe(21.5)

				});

				it('with each of its items', function ()
				{
					spyOn(GoogleUniversalAnalytics, 'addItem');

					GoogleUniversalAnalytics.trackTransaction(order);

					expect(GoogleUniversalAnalytics.addItem).toHaveBeenCalledWith({
						id: '5554-2243'
					,	sku: 'gt0017'
					,	affiliation: SC.ENVIRONMENT.siteSettings.displayname
					,	name: 'AIR'
					,	category: 'Men'
					,	price: 250
					,	quantity: 1
					});

					expect(GoogleUniversalAnalytics.addItem).toHaveBeenCalledWith({
						id: '5554-2243'
					,	sku: 'Trail-Palomar-Sil-24'
					,	affiliation: SC.ENVIRONMENT.siteSettings.displayname
					,	name: 'Trail Palomar'
					,	category: 'Bike'
					,	price: 500.99
					,	quantity: 2
					});

					expect(GoogleUniversalAnalytics.addItem.calls.all().length).toEqual(2);
				});

				it('and tracks it', function ()
				{
					spyOn(GoogleUniversalAnalytics, 'trackTrans');

					GoogleUniversalAnalytics.trackTransaction(order);

					expect(GoogleUniversalAnalytics.trackTrans).toHaveBeenCalled();
				});
			});
		});

		describe('addCrossDomainParameters', function ()
		{
			window.ga = function (fn)
			{
				if (_.isFunction(fn))
				{
					fn.apply(this);
				}
			};

			window.linker = {
				decorate: function (url)
				{
					return url;
				}
			};

			window.SC = Preconditions.deepExtend(window.SC || {}, {
				ENVIRONMENT: {
					jQuerysEnvironment: 'browser'
				,	siteSettings: {
						checkoutSupported: false
					}
				}
			});

			GoogleUniversalAnalytics.setAccount({
				propertyID: 'UA-34213649-2'
			,	domainName: 'demo.uylabs.com'
			});

			it('returns the new url', function ()
			{
				expect(GoogleUniversalAnalytics.addCrossDomainParameters('checkout.netsuite.com')).toBeAString();
			});

			it('after calling the analytics crossdomain method', function ()
			{
				spyOn(window.linker, 'decorate');

				expect(window.linker.decorate).not.toHaveBeenCalled();

				GoogleUniversalAnalytics.addCrossDomainParameters('checkout.netsuite.com');

				expect(window.linker.decorate).toHaveBeenCalledWith('checkout.netsuite.com');
			});

			it('if whatever is passed is a string', function ()
			{
				var crap = [null, undefined, {what: 'sup'}, ['some array']];

				spyOn(window.linker, 'decorate');

				expect(GoogleUniversalAnalytics.addCrossDomainParameters(crap)).toBe(crap);

				_.each(crap, function (turd)
				{
					expect(GoogleUniversalAnalytics.addCrossDomainParameters(turd)).toBe(turd);
				});

				expect(window.linker.decorate).not.toHaveBeenCalled();
			});
		});
	});
});
