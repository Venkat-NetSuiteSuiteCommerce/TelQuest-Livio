/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'GoogleAdWords'
	,	'Tracker'
	,	'jQuery'
	,	'Backbone'
	,	'underscore'
	,	'Application'
	]
,	function (
		GoogleAdWords
	,	Tracker
	,	jQuery
	,	Backbone
	,	_
	)
{
	'use strict';

	return describe('GoogleAdWords Module', function ()
	{
		describe('setAccount', function ()
		{
			var valid_settings = {
					id: 123
				,	label: 'abc'
				,	value: 1
				};

			it('sets the adwords configuration', function ()
			{
				var config = null;

				GoogleAdWords.setAccount(valid_settings);

				config = GoogleAdWords.config;

				expect(config.id).toBe(123);
				expect(config.label).toBe('abc');
				expect(config.value).toBe(1);
			});

			it('and returns the GoogleAdWords module', function ()
			{
				expect(GoogleAdWords.setAccount(valid_settings)).toEqual(GoogleAdWords);
			});
		});

		describe('mountToApp', function ()
		{
			var application = null;

			beforeEach(function ()
			{
				application = SC.Application('Test');

				_.extend(application,
				{
					Configuration: {
						tracking: {
							googleAdWordsConversion: {
								id: 123
							,	label: 'abc'
							,	value: 1
							}
						}
					}
				});

				Tracker.getInstance().trackers = [];
			});

			it('sets the account', function ()
			{
				spyOn(GoogleAdWords, 'setAccount').and.callThrough();

				GoogleAdWords.mountToApp(application);

				expect(GoogleAdWords.setAccount).toHaveBeenCalledWith({
					id: 123
				,	label: 'abc'
				,	value: 1
				});
			});

			it('and pushes itself to the list of trackers', function ()
			{
				expect(Tracker.getInstance().trackers).not.toContain(GoogleAdWords);

				GoogleAdWords.mountToApp(application);

				expect(Tracker.getInstance().trackers).toContain(GoogleAdWords);

				// following code doesn't seems to have sense anymore
				// expect(application.trackers).not.toContain(GoogleAdWords);
				// GoogleAdWords.mountToApp(application);
				// expect(application.trackers).toContain(GoogleAdWords);
			});

			it('if its configured in the application', function ()
			{
				spyOn(GoogleAdWords, 'setAccount');

				delete application.Configuration.tracking.googleAdWordsConversion;

				GoogleAdWords.mountToApp(application);

				expect(GoogleAdWords.setAccount).not.toHaveBeenCalled();
				expect(application.trackers).not.toContain(GoogleAdWords);
			});
		});

		describe('trackTransaction', function ()
		{
			var application = null
			,	tracking_pixel = null
			,	$el = jQuery('<div/>');

			beforeEach(function ()
			{
				application = SC.Application('Test');

				application.getLayout().currentView = {
					$el: $el
				};
			});

			it('appends the tracking pixel to the dom', function ()
			{
				expect($el.children().length).toEqual(0);

				var order = new Backbone.Model();
				order.set({total: 1234}); 

				var expected_result = 'www.googleadservices.com/pagead/conversion/123/?value=1234&label=abc&guid=ON&script=0';
				GoogleAdWords.trackTransaction.apply(application, [order]);

				tracking_pixel = $el.children()[0];

				expect(tracking_pixel.nodeName.toLowerCase()).toBe('img');

				expect(tracking_pixel.src.indexOf(expected_result) >= 0).toBeTruthy();//'www.googleadservices.com/pagead/conversion/123/?value=1&amp;label=abc&amp;guid=ON&amp;script=0') !== -1).toBe(true);
			});
		});
	});
});